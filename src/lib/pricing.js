'use strict';

// Anthropic API pricing — USD per million tokens.
// Fonte: docs ufficiali Anthropic (models overview), riverificati 2026-07-02.
// I prezzi possono cambiare, aggiornare qui se Anthropic li modifica.
// Convenzione cache: cacheWrite = input × 1.25 (TTL 5m), cacheRead = input × 0.1. Per gli utenti Max plan il
// costo reale è 0 (incluso nella subscription) — qui calcoliamo il
// **valore equivalente pay-per-use API**, ovvero quanto si starebbe
// pagando senza subscription. Util per percepire il ROI del Max plan.
//
// Schema per modello: { input, output, cacheWrite, cacheRead }
const PRICING = {
  // Fable family — modello più capace disponibile, sopra Opus.
  // Fable 5.1: stesso $10/$50 di Fable 5, ma cache read a $0.25 (non 1/10 dell'input).
  'claude-fable-5-1':  { input: 10,    output: 50,    cacheWrite: 12.50,  cacheRead: 0.25 },
  'claude-fable-5':    { input: 10,    output: 50,    cacheWrite: 12.50,  cacheRead: 1.00 },
  // Mythos family — stesso listino di Fable 5 (disponibilità limitata)
  'claude-mythos-5':   { input: 10,    output: 50,    cacheWrite: 12.50,  cacheRead: 1.00 },
  // Opus family — top tier. Dalla generazione Opus 4.5 il prezzo è $5/$25
  // ($15/$75 era Opus 4.1 e precedenti — fix v1.2.4, prima sovrastimava 3x).
  // Nota: Opus 5/4.8 hanno un "fast mode" a $10/$50 (Opus 5.5: $8/$40) — non
  // rilevabile dai dati di usage locali, quindi qui resta il listino standard.
  // v1.2.14 — Opus 5.5 (settembre 2026): $4/$20, cache read $0.20, più economico
  // di Opus 5. Prima finiva nel fallback famiglia e veniva stimato a $5/$25.
  'claude-opus-5-5':   { input: 4,     output: 20,    cacheWrite: 5.00,   cacheRead: 0.20 },
  'claude-opus-5':     { input: 5,     output: 25,    cacheWrite: 6.25,   cacheRead: 0.50 },
  'claude-opus-4-8':   { input: 5,     output: 25,    cacheWrite: 6.25,   cacheRead: 0.50 },
  'claude-opus-4-7':   { input: 5,     output: 25,    cacheWrite: 6.25,   cacheRead: 0.50 },
  'claude-opus-4-6':   { input: 5,     output: 25,    cacheWrite: 6.25,   cacheRead: 0.50 },
  'claude-opus-4-5':   { input: 5,     output: 25,    cacheWrite: 6.25,   cacheRead: 0.50 },
  'claude-opus-4-1':   { input: 15,    output: 75,    cacheWrite: 18.75,  cacheRead: 1.50 },
  // Sonnet family — balanced
  // claude-sonnet-5: prezzo standard $3/$15 (intro $2/$10 fino al 31 ago 2026,
  // temporaneo → non cablato qui: la mappa è statica e non conosce la data).
  'claude-sonnet-5':   { input: 3,     output: 15,    cacheWrite: 3.75,   cacheRead: 0.30 },
  'claude-sonnet-4-6': { input: 3,     output: 15,    cacheWrite: 3.75,   cacheRead: 0.30 },
  'claude-sonnet-4-5': { input: 3,     output: 15,    cacheWrite: 3.75,   cacheRead: 0.30 },
  // Haiku family — fast/cheap. Haiku 4.5 = $1/$5 ($0.80/$4 era Haiku 3.5 — fix v1.2.4).
  'claude-haiku-4-5':  { input: 1,     output: 5,     cacheWrite: 1.25,   cacheRead: 0.10 },
};

// Risolve un model ID arbitrario al record pricing più vicino.
// Es. "claude-opus-4-7-20260315" → "claude-opus-4-7"
function resolveModel(id) {
  if (!id) return null;
  if (PRICING[id]) return PRICING[id];
  // Strip date suffix (-YYYYMMDD o -<8digits>)
  const stripped = id.replace(/-\d{8}.*$/, '');
  if (PRICING[stripped]) return PRICING[stripped];
  // Fallback per famiglia → listino della generazione più recente nota, così un
  // modello nuovo non ancora in tabella (es. il prossimo Opus) viene stimato
  // col prezzo corrente della sua famiglia invece di restare senza costo.
  if (/fable/i.test(id))  return PRICING['claude-fable-5-1'];
  if (/mythos/i.test(id)) return PRICING['claude-mythos-5'];
  if (/opus/i.test(id))   return PRICING['claude-opus-5-5'];
  if (/sonnet/i.test(id)) return PRICING['claude-sonnet-5'];
  if (/haiku/i.test(id))  return PRICING['claude-haiku-4-5'];
  return null;
}

// Calcola costo USD per un'entry di usage di un singolo modello.
// usage shape: { inputTokens, outputTokens, cacheReadInputTokens, cacheCreationInputTokens }
function costForUsage(modelId, usage) {
  const p = resolveModel(modelId);
  if (!p || !usage) return 0;
  const ins   = (usage.inputTokens || 0)             * p.input      / 1_000_000;
  const outs  = (usage.outputTokens || 0)            * p.output     / 1_000_000;
  const cwrt  = (usage.cacheCreationInputTokens || 0) * p.cacheWrite / 1_000_000;
  const crd   = (usage.cacheReadInputTokens || 0)    * p.cacheRead  / 1_000_000;
  return ins + outs + cwrt + crd;
}

// Totale costo da una mappa modelUsage (claude-opus-4-7: {...}, ...)
function costFromModelUsage(modelUsage) {
  if (!modelUsage) return 0;
  let total = 0;
  for (const [model, usage] of Object.entries(modelUsage)) {
    total += costForUsage(model, usage);
  }
  return total;
}

// Costo stimato per un sotto-range di giorni.
//
// PROBLEMA: la cache di Claude Code conserva il granular breakdown
// (input/output/cache_read/cache_write per modello) SOLO nel campo
// `modelUsage` che è AGGREGATO TOTALE (no per-giorno). Il campo
// `dailyModelTokens` ha solo input+output sommati — manca il 99%
// del volume (cache_read).
//
// SOLUZIONE: usiamo la proporzione di messaggi nel range come proxy
// per stimare la quota di costo del range rispetto al totale.
// Limite noto: presuppone che il mix modelli/tipo-token sia uniforme
// nel tempo (es. se hai usato Opus per primi 30g e Haiku ultimi 7g,
// l'ultima settimana risulta sovrastimata).
function costForRange(modelUsage, dailyActivity, daysBack) {
  const totalCost = costFromModelUsage(modelUsage);
  if (!daysBack || !Array.isArray(dailyActivity) || !dailyActivity.length) return totalCost;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - daysBack + 1);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  let totalMsgs = 0, rangeMsgs = 0;
  for (const e of dailyActivity) {
    totalMsgs += e.messageCount || 0;
    if (e.date >= cutoffKey) rangeMsgs += e.messageCount || 0;
  }
  if (totalMsgs <= 0) return 0;
  return totalCost * (rangeMsgs / totalMsgs);
}

// Format USD: "$1,234.56" o "$2.1K" per valori grandi
function formatUsd(amount) {
  if (amount == null || isNaN(amount)) return '—';
  if (amount < 1)   return '$' + amount.toFixed(2);
  if (amount < 10)  return '$' + amount.toFixed(2);
  if (amount < 1000) return '$' + amount.toFixed(0);
  if (amount < 10000) return '$' + (amount / 1000).toFixed(1) + 'K';
  return '$' + Math.round(amount / 1000) + 'K';
}

module.exports = {
  PRICING,
  resolveModel,
  costForUsage,
  costFromModelUsage,
  costForRange,
  formatUsd,
};
