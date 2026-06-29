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

// Statistiche d'uso calcolate DAL VIVO dai transcript .jsonl (no stale
// stats-cache.json). Produce un aggregato per-giorno + per-sessione + mappe
// globali; le finestre temporali (7g/30g/all) si derivano lato renderer dai
// bucket per-giorno (un solo scan). Costo $ reale via pricing.js (cache-aware).
//
// 100% locale, sola lettura. Differenziatori vs Opcode: token "di lavoro" in
// evidenza (input+output) con breakdown trasparente della cache, costo reale,
// attribuzione per plugin/skill/agent/MCP, breakdown subagent, efficienza cache
// e context, tool analytics.

const PRICING = require('./pricing');
const { scanTranscripts } = require('./transcript-scan');

const CTX_THRESHOLD = 150000;  // soglia "contesto grande" (allineata agli insight)

// 'YYYY-MM-DD' nel fuso locale (= "quando hai lavorato", coerente con la heatmap).
function dayKeyFromDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
function dayKey(ms) { return dayKeyFromDate(new Date(ms)); }

// usage del transcript (snake_case) → shape attesa da pricing.costForUsage.
function usageCamel(u) {
  return {
    inputTokens:              u.input_tokens                 || 0,
    outputTokens:             u.output_tokens                || 0,
    cacheReadInputTokens:     u.cache_read_input_tokens      || 0,
    cacheCreationInputTokens: u.cache_creation_input_tokens  || 0,
  };
}

function newDay() {
  return {
    turns: 0, cost: 0,
    tokens: { input: 0, output: 0, cacheRead: 0, cacheCreate: 0 },
    byModel: {},   // model -> { input,output,cacheRead,cacheCreate, cost, turns }
    byProject: {}, // projKey -> { cost, work, turns }
    attribution: { plugin: {}, skill: {}, agent: {}, mcp: {} }, // name -> { cost, turns }
    mainCost: 0, subCost: 0, subTurns: 0,
    ctxOver150kTurns: 0, ctxSum: 0,
    hourCounts: {},   // hour(0-23) -> n
    tools: {},        // toolName -> count (uso tool)
    toolResults: 0, toolErrors: 0,   // error rate per-giorno
    byAgentType: {},  // agentType -> { count, tokens } (da toolUseResult)
  };
}

// Accumula { cost, turns } in una mappa nominale (attribuzione).
function addAttr(map, key, cost) {
  let e = map[key];
  if (!e) { e = { cost: 0, turns: 0 }; map[key] = e; }
  e.cost += cost; e.turns += 1;
}

async function getLiveStats() {
  const seen = new Set();        // dedup per uuid (i record si ripetono ~54%)
  const days = {};               // 'YYYY-MM-DD' -> newDay()
  const sessions = new Map();    // sid -> aggregato sessione

  function ensureDay(k) { let d = days[k]; if (!d) { d = newDay(); days[k] = d; } return d; }
  // Giorno locale dal timestamp del record (per i record non-assistant che
  // non passano dal ramo usage: toolUseResult e tool_result).
  function dayFromTs(rec) {
    const ts = Date.parse(rec.timestamp);
    return Number.isFinite(ts) ? ensureDay(dayKey(ts)) : null;
  }
  // Per sessione: project (cwd), start (range), + id/cost/turns per il browser Sessions (v1.1.38).
  function ensureSession(sid) {
    let s = sessions.get(sid);
    if (!s) { s = { id: sid, project: null, start: Infinity, cost: 0, turns: 0 }; sessions.set(sid, s); }
    return s;
  }

  const res = await scanTranscripts({
    sinceMs: 0,
    prefilter: ['"usage"', '"toolUseResult"', '"tool_result"'],
    onRecord: (rec, file) => {
      // Dedup per uuid (vale per ogni tipo di record: i duplicati condividono uuid).
      const key = rec.uuid || rec.requestId || (rec.message && rec.message.id);
      if (key) { if (seen.has(key)) return; seen.add(key); }

      // ── 1) Turno assistant con usage → costo/token/modello/attribuzione/cache
      const u = rec.type === 'assistant' && rec.message && rec.message.usage;
      if (u) {
        const ts = Date.parse(rec.timestamp);
        if (!Number.isFinite(ts)) return;
        const dt = new Date(ts);  // un solo Date per record (riusato per day + ora)
        const model = (rec.message && rec.message.model) || 'unknown';
        const uc = usageCamel(u);  // snake→camel una sola volta
        const input       = uc.inputTokens;
        const output      = uc.outputTokens;
        const cacheRead   = uc.cacheReadInputTokens;
        const cacheCreate = uc.cacheCreationInputTokens;
        const cost = PRICING.costForUsage(model, uc);
        const work = input + output;
        const ctx  = input + cacheRead + cacheCreate;
        const isSub = file.isSub || rec.isSidechain === true;
        const sid   = rec.sessionId || file.parentSid || 'unknown';
        const proj  = rec.cwd || null;

        const d = ensureDay(dayKeyFromDate(dt));
        d.turns += 1; d.cost += cost;
        d.tokens.input += input; d.tokens.output += output;
        d.tokens.cacheRead += cacheRead; d.tokens.cacheCreate += cacheCreate;

        let bm = d.byModel[model];
        if (!bm) { bm = { input: 0, output: 0, cacheRead: 0, cacheCreate: 0, cost: 0, turns: 0 }; d.byModel[model] = bm; }
        bm.input += input; bm.output += output; bm.cacheRead += cacheRead;
        bm.cacheCreate += cacheCreate; bm.cost += cost; bm.turns += 1;

        if (proj) {
          let bp = d.byProject[proj];
          if (!bp) { bp = { cost: 0, work: 0, turns: 0 }; d.byProject[proj] = bp; }
          bp.cost += cost; bp.work += work; bp.turns += 1;
        }

        if (isSub) { d.subCost += cost; d.subTurns += 1; } else d.mainCost += cost;
        if (ctx > CTX_THRESHOLD) d.ctxOver150kTurns += 1;
        d.ctxSum += ctx;
        const h = dt.getHours();
        d.hourCounts[h] = (d.hourCounts[h] || 0) + 1;

        if (rec.attributionPlugin)    addAttr(d.attribution.plugin, rec.attributionPlugin, cost);
        if (rec.attributionSkill)     addAttr(d.attribution.skill,  rec.attributionSkill,  cost);
        if (rec.attributionAgent)     addAttr(d.attribution.agent,  rec.attributionAgent,  cost);
        if (rec.attributionMcpServer) addAttr(d.attribution.mcp,    rec.attributionMcpServer, cost);

        const s = ensureSession(sid);
        if (proj && !s.project) s.project = proj;
        if (ts < s.start) s.start = ts;
        s.cost += cost; s.turns += 1;

        // tool_use → conteggio uso tool (nel bucket del giorno)
        const content = rec.message && rec.message.content;
        if (Array.isArray(content)) {
          for (const b of content) {
            if (b && b.type === 'tool_use' && b.name) d.tools[b.name] = (d.tools[b.name] || 0) + 1;
          }
        }
        return;
      }

      // ── 2) toolUseResult (chiusura Agent call) → metadati subagent per tipo
      const tur = rec.toolUseResult;
      if (tur && typeof tur === 'object' && tur.agentType) {
        const d = dayFromTs(rec);
        if (d) {
          let a = d.byAgentType[tur.agentType];
          if (!a) { a = { count: 0, tokens: 0 }; d.byAgentType[tur.agentType] = a; }
          a.count += 1; a.tokens += tur.totalTokens || 0;
        }
      }

      // ── 3) tool_result → error rate per-giorno
      const content = rec.message && rec.message.content;
      if (Array.isArray(content)) {
        const d = dayFromTs(rec);
        if (d) {
          for (const b of content) {
            if (b && b.type === 'tool_result') { d.toolResults += 1; if (b.is_error) d.toolErrors += 1; }
          }
        }
      }
    },
  });

  const sessionList = [...sessions.values()].map(s => ({
    id: s.id, project: s.project, start: s.start, cost: s.cost, turns: s.turns,
  }));

  return {
    ok: true,
    generatedAt: Date.now(),
    fileCount: res.files,
    days,                 // ogni giorno include tools/toolResults/toolErrors/byAgentType
    sessions: sessionList,
  };
}

module.exports = {
  getLiveStats,
  // esportati per test/validazione
  dayKey,
  usageCamel,
  CTX_THRESHOLD,
};
