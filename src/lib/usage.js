'use strict';

const { execFile } = require('child_process');
const https = require('https');
const os = require('os');

// Costanti riprese dal plugin VS Code Claude Code (extension.js, codice
// pubblicamente distribuito):
//
//   - Keychain service: "Claude Code-credentials"
//   - Account macOS: process.env.USER || os.userInfo().username
//   - Payload nel keychain è JSON: { claudeAiOauth: { accessToken,
//     refreshToken, expiresAt, scopes, subscriptionType, rateLimitTier } }
//   - Header beta REQUIRED: "anthropic-beta: oauth-2025-04-20"
//   - Refresh: POST https://platform.claude.com/v1/oauth/token con
//     grant_type=refresh_token + client_id
//   - Usage:   GET  https://api.anthropic.com/api/oauth/usage
//
// PRIMA VOLTA che CLACOROO legge questa entry, macOS chiede "Allow
// keychain access" (dialog nativo) — stesso flusso del plugin VS Code.

const KEYCHAIN_SERVICE = 'Claude Code-credentials';
const USAGE_URL        = 'https://api.anthropic.com/api/oauth/usage';
const TOKEN_URL        = 'https://platform.claude.com/v1/oauth/token';
const CLIENT_ID        = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';  // Claude Code CLI client
const BETA_HEADER      = 'oauth-2025-04-20';
// Refresha se il token scade entro 5 minuti (CM0 = 5 * 60 * 1000 nel codice originale)
const REFRESH_WINDOW_MS = 5 * 60 * 1000;

function getAccount() {
  return process.env.USER || os.userInfo().username || 'claude-code-user';
}

function execSecurity(args, timeoutMs = 5000) {
  return new Promise((resolve) => {
    execFile('security', args, { timeout: timeoutMs }, (err, stdout, stderr) => {
      resolve({ err, stdout: (stdout || '').trim(), stderr: (stderr || '').trim() });
    });
  });
}

// Legge il payload completo dal keychain. Ritorna l'oggetto claudeAiOauth.
async function readKeychainPayload() {
  if (process.platform !== 'darwin') {
    return { ok: false, error: 'Keychain access supportato solo su macOS al momento' };
  }
  const { err, stdout, stderr } = await execSecurity([
    'find-generic-password', '-a', getAccount(), '-w', '-s', KEYCHAIN_SERVICE,
  ]);
  if (err) {
    const raw = stderr || err.message || '';
    let friendly = raw;
    if (/could not be found/i.test(raw)) friendly = 'Credenziali Claude Code non trovate nel keychain. Sei loggato con `claude auth login`?';
    else if (/user canceled|interaction not allowed/i.test(raw)) friendly = 'Accesso al keychain negato. Apri Keychain Access ed esegui "Always Allow" su CLACOROO per "Claude Code-credentials".';
    return { ok: false, error: friendly, raw };
  }
  if (!stdout) return { ok: false, error: 'Keychain vuoto' };

  // Il payload è JSON. Schema osservato: { claudeAiOauth: { ... } } oppure
  // direttamente { accessToken, refreshToken, expiresAt, ... } (compat).
  let parsed;
  try { parsed = JSON.parse(stdout); }
  catch (e) {
    // Fallback per versioni che salvavano solo l'access token come stringa raw
    return { ok: true, tokens: { accessToken: stdout, refreshToken: null, expiresAt: null, scopes: [] }, raw: true };
  }
  const t = parsed.claudeAiOauth || parsed;
  if (!t || !t.accessToken) return { ok: false, error: 'Payload keychain inatteso (manca accessToken)' };
  return {
    ok: true,
    tokens: {
      accessToken:  t.accessToken,
      refreshToken: t.refreshToken || null,
      expiresAt:    t.expiresAt || null,
      scopes:       Array.isArray(t.scopes) ? t.scopes : [],
      subscriptionType: t.subscriptionType,
      rateLimitTier:    t.rateLimitTier,
    },
    rawPayload: parsed,
  };
}

// SICUREZZA: CLACOROO NON scrive mai nel keychain di Claude Code, per non
// rischiare di corrompere le credenziali. Il refresh viene mantenuto solo
// in memoria del processo main; lo scrittore ufficiale resta Claude Code
// (TUI/IDE plugin) che farà il proprio refresh quando necessario.
let memoryRefreshedTokens = null;  // ultimo refresh in questa sessione di CLACOROO

function httpRequestJson(method, url, headers, bodyObj) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const body = bodyObj ? JSON.stringify(bodyObj) : null;
    const opts = {
      hostname: u.hostname,
      port:     u.port || 443,
      path:     u.pathname + (u.search || ''),
      method,
      headers: Object.assign({
        'Content-Type': 'application/json',
        'User-Agent':   'CLACOROO/1.0',
      }, headers || {}, body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      timeout:  8000,
    };
    const req = https.request(opts, (res) => {
      let buf = '';
      res.on('data', (chunk) => { buf += chunk; });
      res.on('end', () => {
        const status = res.statusCode;
        if (status < 200 || status >= 300) {
          resolve({ ok: false, status, error: 'HTTP ' + status + ': ' + buf.slice(0, 300) });
          return;
        }
        try { resolve({ ok: true, status, data: JSON.parse(buf) }); }
        catch (e) { resolve({ ok: false, status, error: 'Risposta non JSON: ' + e.message }); }
      });
    });
    req.on('error',   (e) => resolve({ ok: false, error: 'Rete: ' + e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
    if (body) req.write(body);
    req.end();
  });
}

async function refreshTokens(tokens) {
  if (!tokens.refreshToken) return { ok: false, error: 'Nessun refresh token disponibile' };
  const r = await httpRequestJson('POST', TOKEN_URL, {}, {
    grant_type:    'refresh_token',
    refresh_token: tokens.refreshToken,
    client_id:     CLIENT_ID,
    scope:         tokens.scopes.length ? tokens.scopes.join(' ') :
      'user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload',
  });
  if (!r.ok) return { ok: false, error: 'Refresh fallito: ' + r.error };
  const next = {
    accessToken:  r.data.access_token,
    refreshToken: r.data.refresh_token || tokens.refreshToken,
    expiresAt:    Date.now() + (r.data.expires_in || 3600) * 1000,
    scopes:       r.data.scope ? r.data.scope.split(' ') : tokens.scopes,
    subscriptionType: tokens.subscriptionType,
    rateLimitTier:    tokens.rateLimitTier,
  };
  memoryRefreshedTokens = next;  // memorizza solo in process memory
  return { ok: true, tokens: next };
}

function isTokenExpiringSoon(expiresAt) {
  if (!expiresAt) return false;  // sconosciuto: tentiamo senza refresh
  return Date.now() + REFRESH_WINDOW_MS >= expiresAt;
}

function normalize(raw) {
  function band(b) {
    if (!b || b.utilization == null) return null;
    return { utilization: Number(b.utilization), resetsAt: b.resets_at || null };
  }
  return {
    fiveHour:       band(raw.five_hour),
    sevenDay:       band(raw.seven_day),
    sevenDaySonnet: band(raw.seven_day_sonnet),
    extraUsage:     raw.extra_usage || null,
  };
}

async function getUsage() {
  // Priorità ai token rinnovati in-memory durante questa sessione di CLACOROO
  let tokens, source;
  if (memoryRefreshedTokens && !isTokenExpiringSoon(memoryRefreshedTokens.expiresAt)) {
    tokens = memoryRefreshedTokens;
    source = 'memory';
  } else {
    const k = await readKeychainPayload();
    if (!k.ok) return { ok: false, error: k.error };
    tokens = k.tokens;
    source = 'keychain';
  }

  // Refresh proattivo se scaduto/in scadenza
  if (isTokenExpiringSoon(tokens.expiresAt) && tokens.refreshToken) {
    const r = await refreshTokens(tokens);
    if (r.ok) tokens = r.tokens;
    // Altrimenti tentiamo comunque con il vecchio token
  }

  let resp = await httpRequestJson('GET', USAGE_URL, {
    Authorization:    'Bearer ' + tokens.accessToken,
    'anthropic-beta': BETA_HEADER,
  });

  // Se 401, ritenta con refresh (token scaduto silenziosamente)
  if (!resp.ok && resp.status === 401 && tokens.refreshToken) {
    const r = await refreshTokens(tokens);
    if (r.ok) {
      tokens = r.tokens;
      resp = await httpRequestJson('GET', USAGE_URL, {
        Authorization:    'Bearer ' + tokens.accessToken,
        'anthropic-beta': BETA_HEADER,
      });
    }
  }

  if (!resp.ok) {
    let friendly = resp.error || 'Errore sconosciuto';
    if (resp.status === 401 || resp.status === 403) {
      friendly = 'Token non più valido (refresh fallito). Per ricreare le credenziali esegui `claude auth login` da terminale.';
    }
    return { ok: false, error: friendly, status: resp.status, tokenSource: source };
  }
  return { ok: true, data: normalize(resp.data), tokenSource: source };
}

module.exports = {
  KEYCHAIN_SERVICE,
  USAGE_URL,
  TOKEN_URL,
  CLIENT_ID,
  BETA_HEADER,
  readKeychainPayload,
  refreshTokens,
  getUsage,
};
