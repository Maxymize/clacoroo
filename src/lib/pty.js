/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE <info@maxymizebusiness.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
'use strict';

/*
 * pty.js — Manager pseudo-terminal cross-platform.
 *
 * Lifecycle:
 *  spawn(opts)   → ritorna { id, shell, cwd, title }
 *  write(id,buf) → invia stdin
 *  resize(id,c,r)→ aggiorna dimensioni
 *  kill(id)      → SIGKILL + cleanup
 *  killAll()     → chiamata da main.js su 'before-quit'
 *
 * Eventi inoltrati al renderer via onData callback registrato dal main:
 *  - data    → chunk stdout/stderr
 *  - exit    → exitCode + signal
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

// Lazy require: node-pty può fallire su Linux senza prebuilds — non vogliamo
// crashare l'app intera, solo disabilitare la feature terminale.
let pty = null;
let loadError = null;
try {
  pty = require('node-pty');
} catch (e) {
  loadError = e;
}

const sessions = new Map();
let nextId = 1;

function isAvailable() {
  return pty !== null;
}

function getLoadError() {
  return loadError ? loadError.message : null;
}

// Detect shell di default cross-platform. Su Win preferisce pwsh se in PATH,
// fallback cmd.exe. Su Unix usa $SHELL, fallback /bin/zsh poi /bin/bash.
function defaultShell() {
  if (process.platform === 'win32') {
    const envPwsh = process.env.POWERSHELL_EXE;
    if (envPwsh && fs.existsSync(envPwsh)) return envPwsh;
    const candidates = [
      'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
      process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe',
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return 'cmd.exe';
  }
  if (process.env.SHELL) return process.env.SHELL;
  for (const c of ['/bin/zsh', '/bin/bash', '/bin/sh']) {
    if (fs.existsSync(c)) return c;
  }
  return '/bin/sh';
}

function defaultCwd() {
  return os.homedir();
}

// Validation: cwd deve esistere ed essere una directory. Il path viene
// passato come argomento a un binario shell, non a una shell stringa,
// quindi non c'è injection, ma vogliamo evitare crash da path inesistente.
function safeCwd(cwd) {
  if (!cwd || typeof cwd !== 'string') return defaultCwd();
  try {
    if (fs.statSync(cwd).isDirectory()) return cwd;
  } catch {}
  return defaultCwd();
}

function safeCols(c) {
  const n = Number(c);
  return Number.isFinite(n) && n >= 2 && n <= 1000 ? Math.floor(n) : 80;
}

function safeRows(r) {
  const n = Number(r);
  return Number.isFinite(n) && n >= 2 && n <= 500 ? Math.floor(n) : 24;
}

function spawn(opts) {
  if (!pty) throw new Error('node-pty non disponibile: ' + (loadError?.message || 'modulo non caricato'));

  const shell = opts.shell && typeof opts.shell === 'string' && fs.existsSync(opts.shell)
    ? opts.shell
    : defaultShell();
  const cwd = safeCwd(opts.cwd);
  const cols = safeCols(opts.cols);
  const rows = safeRows(opts.rows);
  const title = (typeof opts.title === 'string' && opts.title.length <= 60) ? opts.title : path.basename(shell);

  // Env: passiamo SOLO quello del processo + override per terminale colorato.
  // TERM=xterm-256color è lo standard xterm.js supporta.
  const env = Object.assign({}, process.env, {
    TERM: 'xterm-256color',
    COLORTERM: 'truecolor',
    // Evita che le init script delle shell aprano in modalità login (slow)
    // su macOS — gli utenti se vogliono lo abilitano via shell selector.
  });

  const id = String(nextId++);
  const p = pty.spawn(shell, [], { name: 'xterm-color', cols, rows, cwd, env });

  const session = { id, shell, cwd, title, cols, rows, pty: p, onDataCb: null, onExitCb: null };
  sessions.set(id, session);

  p.onData((d) => { if (session.onDataCb) session.onDataCb(d); });
  p.onExit(({ exitCode, signal }) => {
    if (session.onExitCb) session.onExitCb({ exitCode, signal });
    sessions.delete(id);
  });

  return { id, shell, cwd, title, cols, rows };
}

function write(id, data) {
  const s = sessions.get(id);
  if (!s) return false;
  if (typeof data !== 'string') return false;
  s.pty.write(data);
  return true;
}

function resize(id, cols, rows) {
  const s = sessions.get(id);
  if (!s) return false;
  const c = safeCols(cols);
  const r = safeRows(rows);
  s.cols = c; s.rows = r;
  try { s.pty.resize(c, r); return true; }
  catch { return false; }
}

function kill(id) {
  const s = sessions.get(id);
  if (!s) return false;
  try { s.pty.kill(); } catch {}
  sessions.delete(id);
  return true;
}

function killAll() {
  for (const id of Array.from(sessions.keys())) kill(id);
}

function list() {
  return Array.from(sessions.values()).map(s => ({
    id: s.id, shell: s.shell, cwd: s.cwd, title: s.title, cols: s.cols, rows: s.rows,
  }));
}

function setHandlers(id, { onData, onExit }) {
  const s = sessions.get(id);
  if (!s) return false;
  s.onDataCb = onData || null;
  s.onExitCb = onExit || null;
  return true;
}

// v1.0.67 — Live cwd tracking: legge la directory corrente reale del processo
// shell via lsof (macOS) o /proc/<pid>/cwd (Linux). Su Windows ritorna null
// (richiederebbe Win32 API NtQueryInformationProcess — fuori scope MVP).
// Chiamato in polling dal renderer ogni ~3s per il tab attivo.
function getCwd(id) {
  const s = sessions.get(id);
  if (!s || !s.pty || !s.pty.pid) return null;
  const pid = s.pty.pid;
  try {
    if (process.platform === 'darwin') {
      const out = execFileSync('lsof', ['-p', String(pid), '-a', '-d', 'cwd', '-Fn'], { encoding: 'utf8', timeout: 1500 });
      const m = out.match(/^n(.+)$/m);
      return m ? m[1] : null;
    }
    if (process.platform === 'linux') {
      return fs.readlinkSync(`/proc/${pid}/cwd`);
    }
  } catch { /* ignore — cwd resta quello iniziale */ }
  return null;
}

module.exports = {
  isAvailable,
  getLoadError,
  defaultShell,
  defaultCwd,
  spawn,
  write,
  resize,
  kill,
  killAll,
  list,
  setHandlers,
  getCwd,
};
