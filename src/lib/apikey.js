/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE BUSINESS (Maximilian Giurastante <info@maxymizebusiness.com>)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * apikey.js — Gestione sicura della Anthropic API key.
 *
 * Storage:
 *   - macOS: Keychain via `security` CLI (service `com.maxymize.clacoroo.apikey`)
 *   - Linux: `secret-tool` (libsecret) se installato, altrimenti file con chmod 600
 *   - Windows: DPAPI via PowerShell (file `.enc` cifrato per user)
 *
 * Integrazione con Claude Code:
 *   - Genera uno script helper (`get-api-key.sh` o `.cmd`) che ritorna la chiave su stdout
 *   - Scrive il path dello script nel campo `apiKeyHelper` di `~/.claude/settings.json`
 *   - Claude legge la chiave on-demand al lancio
 *
 * Sicurezza:
 *   - La chiave non viene mai loggata né mostrata in chiaro nel renderer
 *   - Lo script helper è chmod 700 (solo utente owner può leggerlo/eseguirlo)
 *   - Lo storage native è encrypted at rest (Keychain / libsecret / DPAPI)
 *   - Solo se cade il fallback file su Linux la chiave finisce in plaintext (warning UI)
 */
'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const https = require('https');
const { execFile, execFileSync } = require('child_process');

const SERVICE = 'com.maxymize.clacoroo.apikey';

// Onora `CLAUDE_CONFIG_DIR` (override usato dagli utenti che spostano la
// config Claude Code fuori da `~/.claude`). Allineato a usage.js / mcp.js.
function getClaudeDir() {
  if (process.env.CLAUDE_CONFIG_DIR) return process.env.CLAUDE_CONFIG_DIR;
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Claude');
  }
  return path.join(os.homedir(), '.claude');
}

const ROOT_DIR    = path.join(os.homedir(), '.claude-control-room');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');
const CLAUDE_DIR  = getClaudeDir();
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');

const HELPER_SCRIPT_PATH = process.platform === 'win32'
  ? path.join(SCRIPTS_DIR, 'get-api-key.cmd')
  : path.join(SCRIPTS_DIR, 'get-api-key.sh');

// Sidecar con le ultime 4 cifre della chiave: scritto a `save()`, letto da
// `status()` per il display masked senza dover decifrare la chiave intera
// (su Windows risparmia uno spawn di PowerShell per ogni open Impostazioni).
const LAST4_FILE = path.join(ROOT_DIR, 'apikey.last4');

const LINUX_FILE_FALLBACK = path.join(os.homedir(), '.config', 'clacoroo', 'api-key');
const WIN_DPAPI_FILE      = process.platform === 'win32'
  ? path.join(process.env.APPDATA || '', 'CLACOROO', 'api-key.enc')
  : null;

/* ── HELPER: detect Linux secret-tool ───────────────────────────────────── */

let _hasSecretTool = null;
function hasSecretTool() {
  if (process.platform !== 'linux') return false;
  if (_hasSecretTool !== null) return _hasSecretTool;
  try {
    execFileSync('which', ['secret-tool'], { timeout: 1500, stdio: ['ignore', 'pipe', 'ignore'] });
    _hasSecretTool = true;
  } catch { _hasSecretTool = false; }
  return _hasSecretTool;
}

/* ── HELPER: exec wrapper ───────────────────────────────────────────────── */

function execFileP(cmd, args, opts = {}) {
  return new Promise(resolve => {
    execFile(cmd, args, { timeout: 8000, ...opts }, (err, stdout, stderr) => {
      if (err) resolve({ ok: false, error: (stderr || err.message || '').toString().trim(), code: err.code });
      else     resolve({ ok: true, stdout: (stdout || '').toString() });
    });
  });
}

/* ── SAVE ──────────────────────────────────────────────────────────────── */

// Anthropic keys: prefisso `sk-ant-` + caratteri url-safe. La regex stretta
// impedisce iniezione di shell metacharacter nel branch PowerShell di Windows
// (oltre alla nostra escape `''`).
const KEY_REGEX = /^sk-ant-[A-Za-z0-9_-]{10,}$/;

function validKey(plainKey) {
  return typeof plainKey === 'string' && KEY_REGEX.test(plainKey);
}

function writeLast4Sidecar(plainKey) {
  try {
    fs.mkdirSync(ROOT_DIR, { recursive: true });
    fs.writeFileSync(LAST4_FILE, plainKey.slice(-4), { encoding: 'utf8', mode: 0o600 });
  } catch { /* non critico: senza sidecar status() decifra come fallback */ }
}
function readLast4Sidecar() {
  try { return fs.readFileSync(LAST4_FILE, 'utf8').trim() || null; }
  catch { return null; }
}
function removeLast4Sidecar() {
  try { fs.unlinkSync(LAST4_FILE); } catch {}
}

async function save(plainKey) {
  if (!validKey(plainKey)) {
    return { ok: false, error: 'Formato API key non valido (atteso `sk-ant-` seguito da almeno 10 caratteri alfanumerici, `-` o `_`).' };
  }

  if (process.platform === 'darwin') {
    // -U: update se voce esistente. -w: leggi password dall'arg (più semplice
    // di stdin per execFile sync; la chiave non finisce in ps output perché
    // sopra una certa lunghezza macOS la nasconde da `ps -ef`)
    const r = await execFileP('security', [
      'add-generic-password', '-s', SERVICE, '-a', os.userInfo().username, '-U', '-w', plainKey,
    ]);
    if (!r.ok) return { ok: false, error: 'Keychain: ' + r.error };
    return { ok: true, backend: 'macos-keychain' };
  }

  if (process.platform === 'linux') {
    if (hasSecretTool()) {
      // Passiamo la chiave via stdin: NON appare in `ps -ef`
      return new Promise(resolve => {
        const child = execFile('secret-tool', [
          'store', '--label=CLACOROO API key', 'service', SERVICE,
        ], { timeout: 8000 }, (err, _stdout, stderr) => {
          if (err) resolve({ ok: false, error: 'secret-tool: ' + (stderr || err.message).trim() });
          else     resolve({ ok: true, backend: 'linux-secret-tool' });
        });
        child.stdin.write(plainKey);
        child.stdin.end();
      });
    }
    try {
      fs.mkdirSync(path.dirname(LINUX_FILE_FALLBACK), { recursive: true });
      fs.writeFileSync(LINUX_FILE_FALLBACK, plainKey, { encoding: 'utf8', mode: 0o600 });
      fs.chmodSync(LINUX_FILE_FALLBACK, 0o600);
      return { ok: true, backend: 'linux-file', warning: 'Storage non cifrato. Installa `libsecret-tools` per crittografia.' };
    } catch (e) {
      return { ok: false, error: 'File fallback: ' + e.message };
    }
  }

  if (process.platform === 'win32') {
    if (!WIN_DPAPI_FILE) return { ok: false, error: '%APPDATA% non disponibile' };
    try { fs.mkdirSync(path.dirname(WIN_DPAPI_FILE), { recursive: true }); } catch {}
    // DPAPI: `ConvertFrom-SecureString` cifra con la master key dell'utente
    // corrente; il blob esadecimale risultante è leggibile solo da questo user
    const ps = `$secure = ConvertTo-SecureString -String '${plainKey.replace(/'/g, "''")}' -AsPlainText -Force; ` +
               `$enc = ConvertFrom-SecureString -SecureString $secure; ` +
               `Set-Content -Path '${WIN_DPAPI_FILE.replace(/'/g, "''")}' -Value $enc -Encoding ASCII -NoNewline`;
    const r = await execFileP('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { timeout: 12000 });
    if (!r.ok) return { ok: false, error: 'DPAPI: ' + r.error };
    return { ok: true, backend: 'windows-dpapi' };
  }

  return { ok: false, error: 'Piattaforma non supportata: ' + process.platform };
}

/* ── GET (solo per display masked, NON usato come fonte da Claude) ─────── */

async function get() {
  if (process.platform === 'darwin') {
    const r = await execFileP('security', ['find-generic-password', '-s', SERVICE, '-w']);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, key: r.stdout.trim() };
  }
  if (process.platform === 'linux') {
    if (hasSecretTool()) {
      const r = await execFileP('secret-tool', ['lookup', 'service', SERVICE]);
      if (!r.ok || !r.stdout) return { ok: false, error: r.error || 'not found' };
      return { ok: true, key: r.stdout.trim() };
    }
    try {
      const k = fs.readFileSync(LINUX_FILE_FALLBACK, 'utf8').trim();
      if (!k) return { ok: false, error: 'empty file' };
      return { ok: true, key: k };
    } catch (e) { return { ok: false, error: e.message }; }
  }
  if (process.platform === 'win32') {
    if (!WIN_DPAPI_FILE || !fs.existsSync(WIN_DPAPI_FILE)) return { ok: false, error: 'file non trovato' };
    const ps = `$enc = Get-Content -Path '${WIN_DPAPI_FILE.replace(/'/g, "''")}' -Raw; ` +
               `$secure = ConvertTo-SecureString -String $enc; ` +
               `[System.Net.NetworkCredential]::new('', $secure).Password`;
    const r = await execFileP('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { timeout: 12000 });
    if (!r.ok || !r.stdout) return { ok: false, error: r.error || 'empty' };
    return { ok: true, key: r.stdout.trim() };
  }
  return { ok: false, error: 'Piattaforma non supportata' };
}

/* ── REMOVE ─────────────────────────────────────────────────────────────── */

async function remove() {
  if (process.platform === 'darwin') {
    const r = await execFileP('security', ['delete-generic-password', '-s', SERVICE]);
    // `security` esce con error se la voce non esiste — qui ce lo aspettiamo
    // (idempotent remove): trattiamo come success con flag alreadyAbsent
    return { ok: true, alreadyAbsent: !r.ok };
  }
  if (process.platform === 'linux') {
    if (hasSecretTool()) {
      const r = await execFileP('secret-tool', ['clear', 'service', SERVICE]);
      return { ok: true, alreadyAbsent: !r.ok };
    }
    try { fs.unlinkSync(LINUX_FILE_FALLBACK); return { ok: true }; }
    catch { return { ok: true, alreadyAbsent: true }; }
  }
  if (process.platform === 'win32') {
    if (WIN_DPAPI_FILE && fs.existsSync(WIN_DPAPI_FILE)) {
      try { fs.unlinkSync(WIN_DPAPI_FILE); return { ok: true }; }
      catch (e) { return { ok: false, error: e.message }; }
    }
    return { ok: true, alreadyAbsent: true };
  }
  return { ok: false, error: 'Piattaforma non supportata' };
}

/* ── HAS (lightweight check senza decifrare) ───────────────────────────── */

async function has() {
  if (process.platform === 'darwin') {
    const r = await execFileP('security', ['find-generic-password', '-s', SERVICE]);
    return r.ok;
  }
  if (process.platform === 'linux') {
    if (hasSecretTool()) {
      const r = await execFileP('secret-tool', ['lookup', 'service', SERVICE]);
      return r.ok && !!r.stdout.trim();
    }
    return fs.existsSync(LINUX_FILE_FALLBACK);
  }
  if (process.platform === 'win32') {
    return !!(WIN_DPAPI_FILE && fs.existsSync(WIN_DPAPI_FILE));
  }
  return false;
}

/* ── HELPER SCRIPT (installato in ~/.claude-control-room/scripts/) ────── */

function installHelperScript() {
  try { fs.mkdirSync(SCRIPTS_DIR, { recursive: true }); } catch {}

  if (process.platform === 'darwin') {
    const script = `#!/bin/sh
# CLACOROO — Anthropic API key helper (puntato da apiKeyHelper in settings.json)
# Ritorna la chiave dal macOS Keychain, vuota se non configurata.
security find-generic-password -s ${SERVICE} -w 2>/dev/null
`;
    fs.writeFileSync(HELPER_SCRIPT_PATH, script, { encoding: 'utf8', mode: 0o700 });
    fs.chmodSync(HELPER_SCRIPT_PATH, 0o700);
    return { ok: true, path: HELPER_SCRIPT_PATH };
  }

  if (process.platform === 'linux') {
    const script = `#!/bin/sh
# CLACOROO — Anthropic API key helper (puntato da apiKeyHelper in settings.json)
if command -v secret-tool >/dev/null 2>&1; then
  secret-tool lookup service ${SERVICE} 2>/dev/null
elif [ -f "${LINUX_FILE_FALLBACK}" ]; then
  cat "${LINUX_FILE_FALLBACK}"
fi
`;
    fs.writeFileSync(HELPER_SCRIPT_PATH, script, { encoding: 'utf8', mode: 0o700 });
    fs.chmodSync(HELPER_SCRIPT_PATH, 0o700);
    return { ok: true, path: HELPER_SCRIPT_PATH };
  }

  if (process.platform === 'win32') {
    // .cmd che invoca PowerShell per decifrare il blob DPAPI e stamparlo su stdout
    const psInline = `$enc = Get-Content -Path '${WIN_DPAPI_FILE.replace(/'/g, "''")}' -Raw -ErrorAction SilentlyContinue; ` +
                     `if ($enc) { $secure = ConvertTo-SecureString -String $enc; ` +
                     `[System.Net.NetworkCredential]::new('', $secure).Password }`;
    const script = `@echo off
rem CLACOROO -- Anthropic API key helper (puntato da apiKeyHelper in settings.json)
powershell -NoProfile -ExecutionPolicy Bypass -Command "${psInline.replace(/"/g, '\\"')}"
`;
    fs.writeFileSync(HELPER_SCRIPT_PATH, script, 'utf8');
    return { ok: true, path: HELPER_SCRIPT_PATH };
  }

  return { ok: false, error: 'Piattaforma non supportata' };
}

function uninstallHelperScript() {
  try { fs.unlinkSync(HELPER_SCRIPT_PATH); return { ok: true }; }
  catch { return { ok: true, alreadyAbsent: true }; }
}

/* ── SETTINGS.JSON: scrive/rimuove campo apiKeyHelper ──────────────────── */

function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')); }
  catch { return {}; }
}
function writeSettings(obj) {
  try { fs.writeFileSync(SETTINGS_PATH, JSON.stringify(obj, null, 2) + '\n', 'utf8'); return true; }
  catch { return false; }
}

function setApiKeyHelperInSettings(scriptPath) {
  if (!fs.existsSync(CLAUDE_DIR)) {
    try { fs.mkdirSync(CLAUDE_DIR, { recursive: true }); } catch {}
  }
  const s = readSettings();
  s.apiKeyHelper = scriptPath;
  return writeSettings(s);
}

function removeApiKeyHelperFromSettings() {
  const s = readSettings();
  if (!('apiKeyHelper' in s)) return true;
  delete s.apiKeyHelper;
  return writeSettings(s);
}

/* ── STATUS (per la UI) ────────────────────────────────────────────────── */

async function status() {
  const present = await has();
  // Legge le ultime 4 cifre dal sidecar plaintext: zero spawn per il display.
  // Se il sidecar manca (es. import da versione precedente) decifra una volta
  // sola e lo ripopola.
  let last4 = present ? readLast4Sidecar() : null;
  if (present && !last4) {
    const r = await get();
    if (r.ok && r.key) {
      last4 = r.key.slice(-4);
      try { fs.writeFileSync(LAST4_FILE, last4, { encoding: 'utf8', mode: 0o600 }); } catch {}
    }
  }
  const masked = last4 ? 'sk-ant-…' + '·'.repeat(8) + last4 : null;

  const settings = readSettings();
  const helperConfigured = settings.apiKeyHelper === HELPER_SCRIPT_PATH;
  const scriptInstalled = fs.existsSync(HELPER_SCRIPT_PATH);

  let backend;
  if (process.platform === 'darwin') backend = 'macOS Keychain';
  else if (process.platform === 'linux') backend = hasSecretTool() ? 'Linux Secret Service (libsecret)' : 'File con chmod 600 (non cifrato)';
  else if (process.platform === 'win32') backend = 'Windows DPAPI (cifratura per utente)';
  else backend = 'sconosciuto';

  return {
    present,
    masked,
    last4,
    backend,
    helperPath: HELPER_SCRIPT_PATH,
    helperConfigured,
    scriptInstalled,
    secureStorage: !(process.platform === 'linux' && !hasSecretTool()),
    platform: process.platform,
  };
}

/* ── TEST CONNESSIONE: GET /v1/models ─────────────────────────────────── */

function testConnection(plainKey) {
  return new Promise(resolve => {
    if (!validKey(plainKey)) {
      return resolve({ ok: false, error: 'Formato chiave non valido' });
    }
    const opts = {
      method: 'GET',
      hostname: 'api.anthropic.com',
      path: '/v1/models',
      headers: {
        'x-api-key': plainKey,
        'anthropic-version': '2023-06-01',
        'accept': 'application/json',
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          let modelCount = null;
          try {
            const json = JSON.parse(body);
            if (Array.isArray(json.data)) modelCount = json.data.length;
          } catch {}
          resolve({ ok: true, status: 200, modelCount });
        } else if (res.statusCode === 401) {
          resolve({ ok: false, status: 401, error: 'Chiave non valida o revocata (401)' });
        } else if (res.statusCode === 403) {
          resolve({ ok: false, status: 403, error: 'Chiave senza permessi (403)' });
        } else {
          resolve({ ok: false, status: res.statusCode, error: 'HTTP ' + res.statusCode });
        }
      });
    });
    req.on('error', e => resolve({ ok: false, error: 'Network: ' + e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout connessione' }); });
    req.setTimeout(10000);
    req.end();
  });
}

/* ── TEST della chiave già salvata (senza esporla al renderer) ─────────── */

async function testStored() {
  const r = await get();
  if (!r.ok) return { ok: false, error: 'Nessuna chiave salvata da testare' };
  return testConnection(r.key);
}

/* ── ALL-IN-ONE: salva chiave + installa helper + scrive settings ──────── */

async function activate(plainKey) {
  const s = await save(plainKey);
  if (!s.ok) return s;
  writeLast4Sidecar(plainKey);
  const h = installHelperScript();
  if (!h.ok) return { ok: false, error: 'Script helper: ' + h.error };
  const w = setApiKeyHelperInSettings(HELPER_SCRIPT_PATH);
  if (!w) return { ok: false, error: 'Scrittura settings.json fallita' };
  return { ok: true, backend: s.backend, helperPath: HELPER_SCRIPT_PATH, warning: s.warning };
}

/* ── ALL-IN-ONE: rimuove chiave + helper + apiKeyHelper da settings ────── */

async function deactivate() {
  const removed = await remove();
  removeLast4Sidecar();
  uninstallHelperScript();
  removeApiKeyHelperFromSettings();
  return { ok: true, alreadyAbsent: removed.alreadyAbsent };
}

// Reinstalla helper + riscrive `apiKeyHelper` in settings senza richiedere
// la chiave (utile se l'utente ha cancellato lo script o settings.json è
// stato modificato esternamente). Idempotente: NON tocca la chiave salvata.
async function reconfigure() {
  if (!(await has())) return { ok: false, error: 'Nessuna chiave attiva da riconfigurare' };
  const h = installHelperScript();
  if (!h.ok) return { ok: false, error: 'Script helper: ' + h.error };
  const w = setApiKeyHelperInSettings(HELPER_SCRIPT_PATH);
  if (!w) return { ok: false, error: 'Scrittura settings.json fallita' };
  return { ok: true, helperPath: HELPER_SCRIPT_PATH };
}

module.exports = {
  SERVICE,
  HELPER_SCRIPT_PATH,
  save, get, remove, has, status,
  installHelperScript, uninstallHelperScript,
  setApiKeyHelperInSettings, removeApiKeyHelperFromSettings,
  testConnection, testStored,
  activate, deactivate, reconfigure,
};
