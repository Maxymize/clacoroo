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

// Browser delle sessioni Claude Code (v1.1.38). Sola lettura di ~/.claude/projects/.
// listSessions(): metadati di display via head-read leggero per file (cwd, primo
// prompt umano, modello, data, conteggio turni) + costo per-sessione riusato dallo
// scan già cachato di stats-live. readSessionTranscript(): parse di una singola
// sessione in una lista di entry pulite (messaggi + tool collassabili).

const fs       = require('fs');
const readline = require('readline');
const { collectSessionFiles } = require('./transcript-scan');
const STATS_LIVE = require('./stats-live');

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function validSessionId(id) { return typeof id === 'string' && UUID_RE.test(id); }

// Estrae il testo da message.content (string | array di blocchi).
function textOf(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.filter(b => b && b.type === 'text' && typeof b.text === 'string')
                  .map(b => b.text).join('\n');
  }
  return '';
}

// Rimuove i blocchi di contesto IDE iniziali (<ide_selection>…</ide_selection> /
// <ide_opened_file>…</ide_opened_file>): sono un prefisso del messaggio umano reale.
function stripContextTags(text) {
  let t = text || '';
  let prev;
  do { prev = t; t = t.replace(/^\s*<ide_(?:selection|opened_file)>[\s\S]*?<\/ide_(?:selection|opened_file)>\s*/, ''); } while (t !== prev);
  return t;
}

// Un prompt è "umano" se non è un Caveat di sistema, un tag comando, o
// l'output iniettato dalla skill /watch (rumore di sistema).
// I tag IDE sono già strippati a monte da stripContextTags prima di chiamare questa.
function isHumanPrompt(text) {
  if (!text) return false;
  const t = text.trimStart();
  if (t.startsWith('Caveat:')) return false;
  if (t.startsWith('<command-name>') || t.startsWith('<local-command')) return false;
  if (t.startsWith('[Request interrupted')) return false;
  if (t.startsWith('Righe (') || t.startsWith('Durata:') || t.startsWith('Frame in ordine temporale')) return false;
  return t.length > 0;
}

// Legge solo ciò che serve dalle prime righe + conta i turni in una passata.
function readMeta(filePath) {
  return new Promise((resolve) => {
    const meta = { cwd: null, firstPrompt: null, model: null, createdAt: null, turns: 0 };
    let stream;
    try { stream = fs.createReadStream(filePath, { encoding: 'utf8' }); }
    catch { return resolve(meta); }
    stream.on('error', () => resolve(meta));
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!line) return;
      // conteggio turni a basso costo (substring, no parse per ogni riga)
      if (line.indexOf('"type":"assistant"') !== -1) meta.turns++;
      // i campi di testa servono solo finché non li abbiamo tutti
      if (meta.cwd && meta.firstPrompt && meta.model && meta.createdAt) return;
      let rec; try { rec = JSON.parse(line); } catch { return; }
      if (!meta.createdAt && rec.timestamp) { const ms = Date.parse(rec.timestamp); if (Number.isFinite(ms)) meta.createdAt = ms; }
      if (!meta.cwd && rec.cwd) meta.cwd = rec.cwd;
      if (!meta.model && rec.type === 'assistant' && rec.message && rec.message.model) meta.model = rec.message.model;
      if (!meta.firstPrompt && rec.type === 'user' && rec.message) {
        const txt = stripContextTags(textOf(rec.message.content));
        if (isHumanPrompt(txt)) meta.firstPrompt = txt.trim().slice(0, 300);
      }
    });
    rl.on('close', () => resolve(meta));
    rl.on('error', () => resolve(meta));
  });
}

function basename(p) {
  if (!p) return null;
  const parts = String(p).split(/[\\/]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : p;
}

async function listSessions() {
  try {
    const files = collectSessionFiles(0).filter(f => !f.isSub);
    // costo/turni autorevoli dallo scan già cachato di stats-live
    let costById = {};
    try {
      const live = await STATS_LIVE.getLiveStats();
      for (const s of (live.sessions || [])) costById[s.id] = { cost: s.cost || 0, turns: s.turns || 0 };
    } catch { /* costo assente → 0 */ }

    const out = [];
    const BATCH = 8;
    for (let i = 0; i < files.length; i += BATCH) {
      const chunk = files.slice(i, i + BATCH);
      const metas = await Promise.all(chunk.map(async (f) => {
        const m = await readMeta(f.path);
        let lastActivity = m.createdAt || 0;
        try { lastActivity = fs.statSync(f.path).mtimeMs; } catch { /* keep createdAt */ }
        const fromStats = costById[f.parentSid] || {};
        return {
          id: f.parentSid,
          cwd: m.cwd || null,
          projectLabel: basename(m.cwd) || f.parentSid.slice(0, 8),
          firstPrompt: m.firstPrompt || null,
          model: m.model || null,
          createdAt: m.createdAt || lastActivity,
          lastActivity,
          turns: m.turns || fromStats.turns || 0,
          cost: fromStats.cost || 0,
          jsonlPath: f.path,
        };
      }));
      out.push(...metas);
    }
    return { ok: true, generatedAt: Date.now(), sessions: out };
  } catch (e) {
    return { ok: false, error: (e && e.message) || 'sessions error', sessions: [] };
  }
}

// Sintetizza un blocco tool_use in { name, summary, detail }.
function summarizeToolUse(b) {
  const name = b.name || 'tool';
  const inp = b.input || {};
  let summary = '';
  if (typeof inp.command === 'string') summary = inp.command;
  else if (typeof inp.file_path === 'string') summary = inp.file_path;
  else if (typeof inp.path === 'string') summary = inp.path;
  else if (typeof inp.pattern === 'string') summary = inp.pattern;
  else if (typeof inp.url === 'string') summary = inp.url;
  else if (typeof inp.prompt === 'string') summary = inp.prompt.slice(0, 120);
  else { try { summary = JSON.stringify(inp).slice(0, 120); } catch { summary = ''; } }
  let detail = '';
  try { detail = JSON.stringify(inp, null, 2); } catch { detail = String(inp); }
  return { name, summary: summary.slice(0, 200), detail: detail.slice(0, 4000) };
}

function toolResultText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.filter(b => b && b.type === 'text').map(b => b.text).join('\n');
  }
  return '';
}

function readSessionTranscript(sessionId) {
  return new Promise((resolve) => {
    if (!validSessionId(sessionId)) return resolve({ ok: false, error: 'sessionId non valido', entries: [] });
    const file = collectSessionFiles(0).find(f => !f.isSub && f.parentSid === sessionId);
    if (!file) return resolve({ ok: false, error: 'sessione non trovata', entries: [] });
    const entries = [];
    let cwd = null;
    let stream;
    try { stream = fs.createReadStream(file.path, { encoding: 'utf8' }); }
    catch { return resolve({ ok: false, error: 'lettura fallita', entries: [] }); }
    stream.on('error', () => resolve({ ok: true, sessionId, cwd, entries }));
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on('line', (line) => {
      if (!line) return;
      let rec; try { rec = JSON.parse(line); } catch { return; }
      if (!cwd && rec.cwd) cwd = rec.cwd;
      const ts = rec.timestamp ? Date.parse(rec.timestamp) : null;
      const msg = rec.message;
      if (!msg) return;
      if (rec.type === 'user') {
        const content = msg.content;
        // tool_result dentro i messaggi user → entry tool "risultato"
        if (Array.isArray(content)) {
          for (const b of content) {
            if (b && b.type === 'tool_result') {
              const rt = toolResultText(b.content);
              if (rt) entries.push({ kind: 'tool', toolName: '↳ result', toolSummary: rt.slice(0, 200), toolDetail: rt.slice(0, 4000), ts });
            }
          }
        }
        const txt = textOf(content);
        if (isHumanPrompt(txt)) entries.push({ kind: 'msg', role: 'user', text: txt, ts });
      } else if (rec.type === 'assistant') {
        const content = msg.content;
        const txt = textOf(content);
        if (txt) entries.push({ kind: 'msg', role: 'assistant', text: txt, ts });
        if (Array.isArray(content)) {
          for (const b of content) {
            if (b && b.type === 'tool_use') {
              const s = summarizeToolUse(b);
              entries.push({ kind: 'tool', toolName: s.name, toolSummary: s.summary, toolDetail: s.detail, ts });
            }
          }
        }
      }
    });
    rl.on('close', () => resolve({ ok: true, sessionId, cwd, entries }));
    rl.on('error', () => resolve({ ok: true, sessionId, cwd, entries }));
  });
}

module.exports = { listSessions, readSessionTranscript, validSessionId };
