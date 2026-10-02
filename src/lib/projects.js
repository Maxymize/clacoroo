/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE (Maximilian Giurastante <info@maxymizebusiness.com>)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License v3 or later.
 * Full license text: see LICENSE file or https://www.gnu.org/licenses/agpl-3.0
 */
'use strict';

// v1.2.18 — Cartelle di lavoro che Claude Code ha usato, ricavate dalla
// cronologia delle sessioni (~/.claude/projects/<cartella>/*.jsonl). Serve al
// Doctor per proporre i progetti con configurazione che CLACOROO non controlla.
// Costa poco: per ogni cartella si legge solo la testa dell'ultimo transcript,
// dove sta il `cwd`, senza scorrere le sessioni (listSessions() rilegge tutto).

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { PROJECTS_DIR } = require('./transcript-scan');

const HEAD_BYTES = 64 * 1024;

function readCwd(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(HEAD_BYTES);
    const n = fs.readSync(fd, buf, 0, HEAD_BYTES, 0);
    for (const line of buf.toString('utf8', 0, n).split('\n')) {
      if (line.indexOf('"cwd"') === -1) continue;
      try { const rec = JSON.parse(line); if (rec.cwd) return rec.cwd; } catch { /* riga troncata o non JSON */ }
    }
  } catch { /* file sparito o illeggibile */ }
  finally { if (fd !== undefined) try { fs.closeSync(fd); } catch { /* già chiuso */ } }
  return null;
}

// Una voce per cartella di lavoro: { cwd, lastActivity, sessions }, dalla più recente.
function recentProjectFolders() {
  const byCwd = new Map();
  let dirs = [];
  try { dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true }).filter(d => d.isDirectory()); } catch { return []; }
  for (const d of dirs) {
    const dir = path.join(PROJECTS_DIR, d.name);
    let files = [];
    try {
      files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t);
    } catch { continue; }
    if (!files.length) continue;
    const cwd = readCwd(path.join(dir, files[0].f));
    if (!cwd) continue;
    const cur = byCwd.get(cwd) || { cwd, lastActivity: 0, sessions: 0 };
    cur.lastActivity = Math.max(cur.lastActivity, files[0].t);
    cur.sessions += files.length;
    byCwd.set(cwd, cur);
  }
  return [...byCwd.values()].sort((a, b) => b.lastActivity - a.lastActivity);
}

// Configurazione di progetto che `claude doctor` legge dalla cartella in cui gira.
function hasProjectConfig(dir) {
  return fs.existsSync(path.join(dir, '.claude')) || fs.existsSync(path.join(dir, '.mcp.json'));
}

// Cartelle che non sono progetti dell'utente: la home (si controlla sempre), le
// temporanee e le cartelle nascoste in home (es. ~/.claude-mem/observer-sessions,
// sessioni di servizio di altri strumenti).
function isNoiseFolder(dir) {
  const home = os.homedir();
  const abs = path.resolve(dir);
  if (abs === home) return true;
  const tmp = [os.tmpdir(), '/tmp', '/private/tmp', '/var/folders', '/private/var/folders'];
  if (tmp.some(t => abs === t || abs.startsWith(t + path.sep))) return true;
  const rel = path.relative(home, abs);
  return !rel.startsWith('..') && !path.isAbsolute(rel) && rel.split(path.sep)[0].startsWith('.');
}

// Progetti con configurazione, esistenti, non tracciati e non "rumore".
function untrackedProjects(trackedPaths) {
  const tracked = new Set(trackedPaths.map(p => path.resolve(p)));
  return recentProjectFolders()
    .filter(r => !tracked.has(path.resolve(r.cwd)) && !isNoiseFolder(r.cwd)
      && fs.existsSync(r.cwd) && hasProjectConfig(r.cwd))
    .map(r => ({ path: r.cwd, name: path.basename(r.cwd), sessions: r.sessions, lastActivity: r.lastActivity }));
}

module.exports = { recentProjectFolders, hasProjectConfig, isNoiseFolder, untrackedProjects };
