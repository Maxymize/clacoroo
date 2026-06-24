'use strict';

const { execFile } = require('child_process');
const https = require('https');
const os    = require('os');
const path  = require('path');
const fs    = require('fs');

// Schema confermato leggendo il plugin VS Code Anthropic Claude Code:
//
//   STORAGE DEL TOKEN OAUTH (per piattaforma):
//     - macOS:    macOS Keychain via `security` CLI (service:
//                 "Claude Code-credentials"), con fallback a file plaintext
//                 ~/.claude/.credentials.json
//     - Windows:  Windows Credential Manager (se disponibile), con fallback
//                 a file plaintext %USERPROFILE%\.claude\.credentials.json
//     - Linux:    solo file plaintext ~/.claude/.credentials.json (non c'è
//                 supporto Secret Service nel binario ufficiale)
//
//   FILE FORMAT (.credentials.json o keychain payload):
//     { claudeAiOauth: { accessToken, refreshToken, expiresAt, scopes,
//                        subscriptionType, rateLimitTier } }
//
//   ENDPOINT:
//     - Usage: GET https://api.anthropic.com/api/oauth/usage
//              Header obbligatorio: anthropic-beta: oauth-2025-04-20
//
// CLACOROO non scrive MAI nel keychain/Credential Manager/file E, da v1.1.35,
// non rinnova MAI il token OAuth. Motivo: il refresh token è rotante — chiamare
// /oauth/token lo farebbe ruotare invalidando quello che Claude Code tiene su
// disco, con conseguenti errori di auth/rate-limit nelle sessioni `claude`
// aperte (era la causa degli avvisi "overload/limite" con CLACOROO aperto).
// Leggiamo solo il token CORRENTE che Claude Code mantiene aggiornato; se è
// scaduto lo segnaliamo soltanto (Claude Code lo rinnova da sé, noi lo
// rileggiamo già valido al giro successivo).

const KEYCHAIN_SERVICE = 'Claude Code-credentials';
const USAGE_URL        = 'https://api.anthropic.com/api/oauth/usage';
const BETA_HEADER      = 'oauth-2025-04-20';

function getMacAccount() {
  return process.env.USER || os.userInfo().username || 'claude-code-user';
}

function getCredentialsFilePath() {
  const dir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  return path.join(dir, '.credentials.json');
}

function parsePayload(raw) {
  // Accetta sia il payload nested { claudeAiOauth: {...} } che la forma
  // flat { accessToken, ... } che alcuni format precedenti usavano.
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch {
    // Fallback estremo: raw token
    return { ok: true, tokens: { accessToken: raw, refreshToken: null, expiresAt: null, scopes: [] }, rawPayload: null };
  }
  const t = parsed.claudeAiOauth || parsed;
  if (!t || !t.accessToken) return { ok: false, error: 'Payload credenziali inatteso (manca accessToken)' };
  return {
    ok: true,
    tokens: {
      accessToken:      t.accessToken,
      refreshToken:     t.refreshToken || null,
      expiresAt:        t.expiresAt || null,
      scopes:           Array.isArray(t.scopes) ? t.scopes : [],
      subscriptionType: t.subscriptionType,
      rateLimitTier:    t.rateLimitTier,
    },
    rawPayload: parsed,
  };
}

// ── macOS Keychain ────────────────────────────────────────────────────────
function readFromMacKeychain() {
  return new Promise((resolve) => {
    execFile(
      'security',
      ['find-generic-password', '-a', getMacAccount(), '-w', '-s', KEYCHAIN_SERVICE],
      { timeout: 5000 },
      (err, stdout, stderr) => {
        if (err) {
          const raw = (stderr || err.message || '').trim();
          let friendly = raw;
          if (/could not be found/i.test(raw)) friendly = 'Credenziali Claude Code non trovate nel keychain. Sei loggato con `claude auth login`?';
          else if (/user canceled|interaction not allowed/i.test(raw)) friendly = 'Accesso al keychain negato. Apri Keychain Access ed esegui "Always Allow" su CLACOROO per "Claude Code-credentials".';
          resolve({ ok: false, error: friendly });
          return;
        }
        const out = (stdout || '').trim();
        if (!out) { resolve({ ok: false, error: 'Keychain vuoto' }); return; }
        resolve(parsePayload(out));
      }
    );
  });
}

// ── Windows Credential Manager ────────────────────────────────────────────
// Strategia: usa PowerShell `cmdkey /list` non funziona bene per generic
// credentials, e l'API CredRead richiede modulo nativo. Per ora skippiamo
// e usiamo direttamente il file fallback (Claude Code lo scrive comunque
// se Credential Manager non riesce a memorizzare il blob).
//
// In futuro: implementare via `node-windows` o N-API binding a CredReadW.

// ── File plaintext (fallback universale) ──────────────────────────────────
function readFromFile() {
  return new Promise((resolve) => {
    const fp = getCredentialsFilePath();
    fs.readFile(fp, { encoding: 'utf8' }, (err, content) => {
      if (err) {
        let friendly = 'File credenziali non trovato (' + fp + '). Se sei loggato come Max plan, su macOS le credenziali sono nel keychain; su Windows nel Credential Manager.';
        if (err.code === 'EACCES') friendly = 'Permessi insufficienti per leggere ' + fp;
        resolve({ ok: false, error: friendly });
        return;
      }
      resolve(parsePayload(content.trim()));
    });
  });
}

// Strategia cross-platform: tenta in ordine di "priorità" per la piattaforma,
// usa il file come fallback universale.
async function readOAuthPayload() {
  if (process.platform === 'darwin') {
    const k = await readFromMacKeychain();
    if (k.ok) return k;
    // Fallback file (se per qualche motivo l'utente ha disabilitato keychain)
    const f = await readFromFile();
    if (f.ok) return f;
    return { ok: false, error: k.error };  // mostra l'errore primario (keychain)
  }
  if (process.platform === 'win32') {
    // Windows: file fallback. Credential Manager via API native è TODO.
    const f = await readFromFile();
    if (f.ok) return f;
    return { ok: false, error: f.error + ' Per Windows: CLACOROO al momento legge solo dal file ~/.claude/.credentials.json. Se Claude Code ha salvato in Credential Manager, lancia almeno una volta `claude --bare auth status` per forzare il fallback al file plaintext.' };
  }
  // Linux e altri unix: solo file
  return await readFromFile();
}

// ── HTTP + refresh + getUsage (cross-platform) ────────────────────────────
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
        // v1.1.28 — esponiamo l'header retry-after (in secondi o data HTTP) così
        // il chiamante può rispettare il backoff richiesto dal server sul 429.
        const retryAfter = res.headers ? res.headers['retry-after'] : undefined;
        if (status < 200 || status >= 300) {
          resolve({ ok: false, status, retryAfter, error: 'HTTP ' + status + ': ' + buf.slice(0, 300) });
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
  // 1. Legge il token CORRENTE dalla sorgente (keychain/file). Niente cache in
  //    memoria e niente refresh: usiamo sempre ciò che Claude Code mantiene.
  const k = await readOAuthPayload();
  if (!k.ok) return { ok: false, error: k.error };
  const tokens = k.tokens;
  const source = process.platform === 'darwin' ? 'keychain' : 'file';

  // 2. Se il token è scaduto NON lo rinnoviamo (eviteremmo di ruotare il refresh
  //    token condiviso con Claude Code). Lo segnaliamo soltanto: Claude Code lo
  //    rinnova da sé e al giro successivo lo rileggiamo già valido.
  if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
    return { ok: false, status: 401, tokenSource: source,
      error: 'Token Claude Code scaduto. Usa Claude Code per rinnovarlo, poi riprova.' };
  }

  // 3. Chiama l'endpoint usage con il token corrente.
  const resp = await httpRequestJson('GET', USAGE_URL, {
    Authorization:    'Bearer ' + tokens.accessToken,
    'anthropic-beta': BETA_HEADER,
  });

  if (!resp.ok) {
    let friendly = resp.error || 'Errore sconosciuto';
    if (resp.status === 401 || resp.status === 403) {
      friendly = 'Token Claude Code non valido o scaduto. Usa Claude Code per rinnovarlo.';
    }
    // v1.1.28 — su 429 propaghiamo status + retry-after così l'handler get-usage
    // nel main rispetta il backoff richiesto dal server.
    return { ok: false, error: friendly, status: resp.status, retryAfter: resp.retryAfter, tokenSource: source };
  }
  return { ok: true, data: normalize(resp.data), tokenSource: source };
}

module.exports = {
  KEYCHAIN_SERVICE,
  USAGE_URL,
  BETA_HEADER,
  readOAuthPayload,
  getUsage,
};
