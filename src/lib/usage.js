'use strict';

const { execFile } = require('child_process');
const https = require('https');
const os = require('os');

// Schema confermato leggendo l'estensione VS Code Anthropic (anthropic.claude-code):
//   - Keychain service: "Claude Code-credentials"
//   - Account: process.env.USER || os.userInfo().username
//   - Endpoint: GET https://api.anthropic.com/api/oauth/usage
//   - Auth: Bearer <accessToken> dal keychain payload JSON
//   - Response:
//       {
//         five_hour:        { utilization, resets_at },
//         seven_day:        { utilization, resets_at },
//         seven_day_sonnet: { utilization, resets_at },
//         extra_usage:      { isEnabled, ... }
//       }
//   - utilization: float 0..1 (0.12 = 12%)
//   - resets_at: ISO timestamp
//
// PRIMA VOLTA che il binario corrente legge questo entry, macOS mostra un
// dialog "<App> vuole accedere a Claude Code-credentials. Allow?". È il
// flusso standard di permessi macOS — niente reverse engineering, è
// lo stesso permesso che il plugin VS Code ha già ottenuto.

const KEYCHAIN_SERVICE = 'Claude Code-credentials';
const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';

function getAccount() {
  return process.env.USER || os.userInfo().username || 'claude-code-user';
}

function readOAuthToken() {
  return new Promise((resolve) => {
    if (process.platform !== 'darwin') {
      resolve({ ok: false, error: 'Keychain access supportato solo su macOS al momento' });
      return;
    }
    execFile(
      'security',
      ['find-generic-password', '-a', getAccount(), '-w', '-s', KEYCHAIN_SERVICE],
      { timeout: 5000 },
      (err, stdout, stderr) => {
        if (err) {
          // Codici comuni: 44 = item not found, 51 = user canceled,
          // 25308 = interaction not allowed (lock screen). Diamo
          // messaggi utili senza esporre dettagli interni.
          const raw = (stderr || err.message || '').trim();
          let friendly = raw;
          if (/could not be found/i.test(raw)) friendly = 'Credenziali Claude Code non trovate nel keychain. Sei loggato?';
          else if (/user canceled|interaction not allowed/i.test(raw)) friendly = 'Accesso al keychain negato. Apri Keychain Access ed esegui "Always Allow" su CLACOROO per "Claude Code-credentials".';
          resolve({ ok: false, error: friendly, raw });
          return;
        }
        const out = stdout.trim();
        // Il payload è un JSON con accessToken/refreshToken/expiresAt
        try {
          const payload = JSON.parse(out);
          if (payload && payload.accessToken) {
            resolve({ ok: true, accessToken: payload.accessToken, expiresAt: payload.expiresAt });
            return;
          }
        } catch { /* non JSON, fallback */ }
        // Fallback: raw token (compat con vecchie versioni)
        resolve({ ok: true, accessToken: out });
      }
    );
  });
}

function httpGetJson(url, headers) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      port:     u.port || 443,
      path:     u.pathname + (u.search || ''),
      method:   'GET',
      headers,
      timeout:  6000,
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          resolve({ ok: false, status: res.statusCode, error: 'Token non valido o scaduto. Esegui `claude auth login` da terminale.' });
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          resolve({ ok: false, status: res.statusCode, error: 'HTTP ' + res.statusCode + ': ' + body.slice(0, 200) });
          return;
        }
        try {
          resolve({ ok: true, data: JSON.parse(body) });
        } catch (e) {
          resolve({ ok: false, error: 'Risposta non JSON: ' + e.message });
        }
      });
    });
    req.on('error', (e) => resolve({ ok: false, error: 'Errore rete: ' + e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout (6s) verso api.anthropic.com' }); });
    req.end();
  });
}

// Normalizza la response Anthropic in shape stabile per la UI.
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
  const tok = await readOAuthToken();
  if (!tok.ok) return { ok: false, error: tok.error };
  const r = await httpGetJson(USAGE_URL, {
    Authorization: 'Bearer ' + tok.accessToken,
    'Content-Type': 'application/json',
    'User-Agent':   'CLACOROO/1.0',
  });
  if (!r.ok) return r;
  return { ok: true, data: normalize(r.data) };
}

module.exports = {
  KEYCHAIN_SERVICE,
  USAGE_URL,
  readOAuthToken,
  getUsage,
};
