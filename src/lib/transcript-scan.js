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

// Core di scansione dei transcript .jsonl di Claude Code (~/.claude/projects/).
// Riusato sia da insights.js (Quota "Cosa incide sui limiti") sia da
// stats-live.js (sezione Stats live). Fa solo plumbing: walk dei file con filtro
// mtime, streaming righe, pre-filtro substring, JSON.parse difensivo, e per ogni
// record chiama onRecord(rec, fileMeta). Il DEDUP per uuid e l'accumulo sono
// responsabilità del consumer (così ogni feature mantiene la propria semantica).

const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const readline = require('readline');

const CLAUDE_DIR   = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

function safeReaddir(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}
function mtimeOk(p, cutoffMs) {
  if (!cutoffMs) return true;
  try { return fs.statSync(p).mtimeMs >= cutoffMs; } catch { return false; }
}

// Raccoglie i file .jsonl rilevanti: i main di sessione (projects/<proj>/*.jsonl)
// e tutti i transcript subagent (projects/<proj>/<sessionId>/subagents/**/*.jsonl).
// Usa Dirent (withFileTypes) per classificare dir/file senza statSync extra.
function collectSessionFiles(cutoffMs) {
  const out = [];
  for (const proj of safeReaddir(PROJECTS_DIR)) {
    if (!proj.isDirectory()) continue;
    const projPath = path.join(PROJECTS_DIR, proj.name);
    for (const ent of safeReaddir(projPath)) {
      const entPath = path.join(projPath, ent.name);
      if (ent.isFile() && ent.name.endsWith('.jsonl')) {
        if (mtimeOk(entPath, cutoffMs)) {
          out.push({ path: entPath, isSub: false, parentSid: ent.name.replace(/\.jsonl$/, '') });
        }
      } else if (ent.isDirectory()) {
        // ent = <sessionId>: cerca ricorsivamente i transcript subagent
        walkSubagents(entPath, ent.name, cutoffMs, out);
      }
    }
  }
  return out;
}

function walkSubagents(dir, parentSid, cutoffMs, out) {
  for (const ent of safeReaddir(dir)) {
    const p = path.join(dir, ent.name);
    if (ent.isFile() && ent.name.endsWith('.jsonl')) {
      if (mtimeOk(p, cutoffMs)) out.push({ path: p, isSub: true, parentSid });
    } else if (ent.isDirectory()) {
      walkSubagents(p, parentSid, cutoffMs, out);
    }
  }
}

function lineMatches(line, filters) {
  for (let i = 0; i < filters.length; i++) {
    if (line.indexOf(filters[i]) !== -1) return true;
  }
  return false;
}

function scanFile(file, filters, onRecord) {
  return new Promise((resolve) => {
    let stream;
    try { stream = fs.createReadStream(file.path, { encoding: 'utf8' }); }
    catch { return resolve(); }
    stream.on('error', () => resolve());
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!line || !lineMatches(line, filters)) return;
      let rec;
      try { rec = JSON.parse(line); } catch { return; }
      try { onRecord(rec, file); } catch { /* difensivo: una riga rotta non blocca lo scan */ }
    });
    rl.on('close', resolve);
    rl.on('error', () => resolve());
  });
}

// Scansiona i transcript chiamando onRecord(rec, fileMeta) per ogni riga che
// matcha il pre-filtro. opts:
//   sinceMs   — filtro mtime sui file (0 = tutti)
//   prefilter — substring (o array) che la riga deve contenere prima del parse
//   onRecord  — callback (rec, file) dove file = { path, isSub, parentSid }
//   batch     — concorrenza file (default 8: non saturare i file descriptor)
async function scanTranscripts({ sinceMs = 0, prefilter = ['"usage"'], onRecord, batch = 8 } = {}) {
  if (typeof onRecord !== 'function') return { files: 0 };
  if (!fs.existsSync(PROJECTS_DIR)) return { files: 0 };
  const filters = Array.isArray(prefilter) ? prefilter : [prefilter];
  const files = collectSessionFiles(sinceMs);
  for (let i = 0; i < files.length; i += batch) {
    await Promise.all(files.slice(i, i + batch).map(f => scanFile(f, filters, onRecord)));
  }
  return { files: files.length };
}

module.exports = {
  scanTranscripts,
  collectSessionFiles,
  PROJECTS_DIR,
};
