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

// "Cosa incide sui limiti" (What's contributing to your limits usage).
//
// Replica IN LOCALE l'insight panel di Claude Code: scansiona i transcript
// .jsonl in ~/.claude/projects/ (incluse le sottocartelle subagents/) e calcola,
// per finestra (24h / 7g), la % di "usage pesato per costo" attribuibile a
// caratteristiche comportamentali e a plugin/skill/MCP.
//
// 100% LOCALE: nessuna chiamata di rete, nessun contributo al rate-limit
// dell'account (a differenza delle barre quota che usano /api/oauth/usage).
//
// Costanti e formula verificate decompilando il binario Claude Code 2.1.190
// (funzioni dQp/uQp/cKn, costanti MXp/NXp/FXp/BXp/UXp/$Xp/qXp). I numeri sono
// una STIMA allineata al pannello /usage, non una replica bit-perfect (i confini
// esatti delle finestre temporali e lo snapshot differiscono).

const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const readline = require('readline');

const CLAUDE_DIR   = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

// ── Costanti Claude Code (verificate verbatim) ────────────────────────────
const CTX_THRESHOLD          = 150000;  // NXp — >150k context
const CACHE_MISS_THRESHOLD   = 100000;  // MXp — >100k cache miss (input non cachato)
const SUBAGENT_COUNT_MIN     = 3;       // FXp — subagent per sessione
const SUBAGENT_COST_RATIO    = 0.5;     // BXp — subCost/totale
const PARALLEL_BUCKET_MS     = 300000;  // UXp — bucket 5 min
const PARALLEL_SESSIONS_MIN  = 4;       // $Xp — sessioni distinte nel bucket
const LONG_SESSION_HOURS_MIN = 8;       // qXp — ore di calendario distinte
const MIN_PCT                = 10;      // cutoff display "niente sotto il 10%"

// Peso modello (verificato): fable 10 / opus 5 / sonnet(default) 3 / haiku 1
function modelTier(model) {
  if (!model) return 3;
  const m = String(model).toLowerCase();
  if (m.includes('fable'))  return 10;
  if (m.includes('opus'))   return 5;
  if (m.includes('haiku'))  return 1;
  if (m.includes('sonnet')) return 3;
  return 3;
}

// Peso-costo per turno (verificato): (cached + uncached*10 + cacheCreate*12.5 +
// output*50) * tier. NON è un costo $ reale, è il proxy interno di Claude Code.
function turnWeight(u, model) {
  const cached      = u.cache_read_input_tokens     || 0;
  const uncached    = u.input_tokens                || 0;
  const cacheCreate = u.cache_creation_input_tokens || 0;
  const output      = u.output_tokens               || 0;
  return (cached + uncached * 10 + cacheCreate * 12.5 + output * 50) * modelTier(model);
}

// ── Enumerazione file (con filtro mtime per finestra) ─────────────────────
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

// ── Scan + accumulo ───────────────────────────────────────────────────────
function newState() {
  return {
    total: 0,
    longContext: 0,
    cacheMiss: 0,
    sessions: new Map(),       // sid -> { mainCost, subCost, subFiles:Set, hours:Set }
    parallelBuckets: new Map(),// bucket -> Map(sid -> weight)
    byPlugin: new Map(),       // pluginName -> weight
    seen: new Set(),           // dedup per uuid
  };
}

function sessionOf(state, sid) {
  let s = state.sessions.get(sid);
  if (!s) { s = { mainCost: 0, subCost: 0, subFiles: new Set(), hours: new Set() }; state.sessions.set(sid, s); }
  return s;
}

function processRecord(rec, state, cutoffMs, file) {
  if (!rec || rec.type !== 'assistant') return;
  const u = rec.message && rec.message.usage;
  if (!u) return;

  // Dedup: i record dello stesso turno si ripetono (~54% duplicati). Chiave uuid
  // (fallback requestId/message.id), come Claude Code.
  const key = rec.uuid || rec.requestId || (rec.message && rec.message.id);
  if (key) { if (state.seen.has(key)) return; state.seen.add(key); }

  const ts = Date.parse(rec.timestamp);
  if (!Number.isFinite(ts) || ts < cutoffMs) return;

  const model = rec.message && rec.message.model;
  const w = turnWeight(u, model);
  if (w <= 0) return;
  state.total += w;

  // Behavior per-turno
  const input = u.input_tokens || 0;
  const ctx = input + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
  if (ctx > CTX_THRESHOLD)          state.longContext += w;
  if (input > CACHE_MISS_THRESHOLD) state.cacheMiss += w;

  // Per-sessione (per subagent-heavy e ore-attive)
  const sid = rec.sessionId || file.parentSid || 'unknown';
  const s = sessionOf(state, sid);
  const isSub = file.isSub || rec.isSidechain === true;
  if (isSub) { s.subCost += w; s.subFiles.add(file.path); }
  else         s.mainCost += w;
  s.hours.add(Math.floor(ts / 3600000));

  // Parallelismo: bucket 5 min -> set di sessioni con peso
  const bucket = Math.floor(ts / PARALLEL_BUCKET_MS);
  let bmap = state.parallelBuckets.get(bucket);
  if (!bmap) { bmap = new Map(); state.parallelBuckets.set(bucket, bmap); }
  bmap.set(sid, (bmap.get(sid) || 0) + w);

  // Attribuzione plugin (campo diretto, propagato sul sotto-flusso)
  const plugin = rec.attributionPlugin || (rec.message && rec.message.attributionPlugin);
  if (plugin) state.byPlugin.set(plugin, (state.byPlugin.get(plugin) || 0) + w);
}

function scanFile(file, state, cutoffMs) {
  return new Promise((resolve) => {
    let stream;
    try { stream = fs.createReadStream(file.path, { encoding: 'utf8' }); }
    catch { return resolve(); }
    stream.on('error', () => resolve());
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on('line', (line) => {
      // Pre-filtro economico: solo le righe con usage (turni assistant)
      if (!line || line.indexOf('"usage"') === -1) return;
      let rec;
      try { rec = JSON.parse(line); } catch { return; }
      try { processRecord(rec, state, cutoffMs, file); } catch { /* difensivo */ }
    });
    rl.on('close', resolve);
    rl.on('error', () => resolve());
  });
}

// ── Calcolo finale ────────────────────────────────────────────────────────
function pct(part, total) { return total > 0 ? Math.round((part / total) * 100) : 0; }
// Tiene solo le voci sopra la soglia di display, ordinate per peso decrescente.
function topItems(arr) { return arr.filter(x => x.pct >= MIN_PCT).sort((a, b) => b.pct - a.pct); }

function computeInsights(state) {
  const total = state.total;

  // subagent-heavy + ore-attive (8h+) a livello di sessione
  let subagentHeavyCost = 0;
  let longSessionsCost  = 0;
  for (const s of state.sessions.values()) {
    const sessTotal = s.mainCost + s.subCost;
    if (sessTotal <= 0) continue;
    const heavy = s.subFiles.size >= SUBAGENT_COUNT_MIN ||
                  (s.subCost / sessTotal) > SUBAGENT_COST_RATIO;
    if (heavy) subagentHeavyCost += sessTotal;
    if (s.hours.size >= LONG_SESSION_HOURS_MIN) longSessionsCost += sessTotal;
  }

  // parallelismo: somma i pesi nei bucket con >= 4 sessioni distinte
  let parallelCost = 0;
  for (const bmap of state.parallelBuckets.values()) {
    if (bmap.size >= PARALLEL_SESSIONS_MIN) {
      for (const w of bmap.values()) parallelCost += w;
    }
  }

  const behaviors = topItems([
    { key: 'longContext',   pct: pct(state.longContext, total) },
    { key: 'subagentHeavy', pct: pct(subagentHeavyCost, total) },
    { key: 'longSessions',  pct: pct(longSessionsCost, total) },
    { key: 'highParallel',  pct: pct(parallelCost, total) },
    { key: 'cacheMiss',     pct: pct(state.cacheMiss, total) },
  ]);

  const plugins = topItems([...state.byPlugin.entries()].map(([name, w]) => ({ name, pct: pct(w, total) })));

  return {
    ok: true,
    hasData: total > 0,
    sessionsScanned: state.sessions.size,
    behaviors,
    plugins,
  };
}

// API pubblica: window 1 (24h) o 7 (7g). Ritorna gli insight calcolati.
async function getInsights(days) {
  const win = Number(days) === 1 ? 1 : 7;
  const cutoffMs = Date.now() - win * 24 * 3600 * 1000;
  if (!fs.existsSync(PROJECTS_DIR)) return { ok: true, hasData: false, behaviors: [], plugins: [], sessionsScanned: 0 };
  const files = collectSessionFiles(cutoffMs);
  const state = newState();
  // Concorrenza limitata per non saturare i file descriptor su molti file
  const BATCH = 8;
  for (let i = 0; i < files.length; i += BATCH) {
    await Promise.all(files.slice(i, i + BATCH).map(f => scanFile(f, state, cutoffMs)));
  }
  const out = computeInsights(state);
  out.window = win === 1 ? '24h' : '7d';
  return out;
}

module.exports = {
  getInsights,
  // esportati per test/validazione
  modelTier,
  turnWeight,
  collectSessionFiles,
  computeInsights,
  newState,
  processRecord,
  scanFile,
  CTX_THRESHOLD,
  CACHE_MISS_THRESHOLD,
  MIN_PCT,
};
