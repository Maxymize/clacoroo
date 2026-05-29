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

// v1.0.75 — Lista delle shell candidate disponibili sul sistema. Usata dal
// selettore in Impostazioni per offrire alternative ($SHELL / bash / fish /
// pwsh ecc.). Ritorna [{path,label,kind}] ordinato per "rilevanza" sulla
// piattaforma. Le entry sono già verificate con fs.existsSync.
function listShells() {
  const out = [];
  const seen = new Set();
  const push = (p, label, kind) => {
    if (!p || seen.has(p)) return;
    try { if (!fs.existsSync(p)) return; } catch { return; }
    seen.add(p);
    out.push({ path: p, label, kind });
  };

  if (process.platform === 'win32') {
    push('C:\\Program Files\\PowerShell\\7\\pwsh.exe', 'PowerShell 7 (pwsh)', 'pwsh');
    push('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'Windows PowerShell', 'powershell');
    push(process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe', 'Command Prompt (cmd)', 'cmd');
    // Git-Bash o WSL non sono pty native via node-pty su Win: non li offriamo.
  } else {
    if (process.env.SHELL) {
      const lbl = path.basename(process.env.SHELL) + ' ($SHELL)';
      push(process.env.SHELL, lbl, 'env');
    }
    push('/bin/zsh', 'zsh (/bin/zsh)', 'zsh');
    push('/bin/bash', 'bash (/bin/bash)', 'bash');
    push('/usr/local/bin/fish', 'fish (/usr/local/bin/fish)', 'fish');
    push('/opt/homebrew/bin/fish', 'fish (Homebrew arm64)', 'fish');
    push('/usr/bin/fish', 'fish (/usr/bin/fish)', 'fish');
    push('/bin/sh', 'sh (POSIX)', 'sh');
  }
  return out;
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

  // v1.1.19 — Garantisce che il terminale integrato veda lo stesso `claude`
  // rilevato da CLACOROO. Le app GUI (lanciate da Finder/Explorer) ereditano
  // spesso un PATH ridotto che NON include la cartella del binario (es. su Win
  // %USERPROFILE%\.local\bin, su macOS /opt/homebrew/bin), così `claude` non è
  // raggiungibile nel PTY anche se l'app lo trova. Anteponiamo quella cartella
  // al PATH dell'ambiente del terminale.
  if (opts.claudeBinDir && typeof opts.claudeBinDir === 'string') {
    const sep = process.platform === 'win32' ? ';' : ':';
    const cur = env.PATH || env.Path || '';
    const parts = cur.split(sep).filter(Boolean);
    // Normalizza sempre su PATH (su Win la var può arrivare come `Path`);
    // antepone la cartella solo se non già presente.
    env.PATH = parts.includes(opts.claudeBinDir) ? cur : (opts.claudeBinDir + sep + cur);
    if (process.platform === 'win32' && 'Path' in env) delete env.Path; // evita doppia var su Win
  }

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
  listShells,
  spawn,
  write,
  resize,
  kill,
  killAll,
  list,
  setHandlers,
  getCwd,
};
