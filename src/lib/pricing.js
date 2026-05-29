'use strict';

// Anthropic API pricing — USD per million tokens.
// Fonte: anthropic.com/api (gennaio 2026). I prezzi possono cambiare,
// aggiornare qui se Anthropic li modifica. Per gli utenti Max plan il
// costo reale è 0 (incluso nella subscription) — qui calcoliamo il
// **valore equivalente pay-per-use API**, ovvero quanto si starebbe
// pagando senza subscription. Util per percepire il ROI del Max plan.
//
// Schema per modello: { input, output, cacheWrite, cacheRead }
const PRICING = {
  // Opus family — top tier
  'claude-opus-4-8':   { input: 15,    output: 75,    cacheWrite: 18.75,  cacheRead: 1.50 },
  'claude-opus-4-7':   { input: 15,    output: 75,    cacheWrite: 18.75,  cacheRead: 1.50 },
  'claude-opus-4-6':   { input: 15,    output: 75,    cacheWrite: 18.75,  cacheRead: 1.50 },
  'claude-opus-4-5':   { input: 15,    output: 75,    cacheWrite: 18.75,  cacheRead: 1.50 },
  // Sonnet family — balanced
  'claude-sonnet-4-6': { input: 3,     output: 15,    cacheWrite: 3.75,   cacheRead: 0.30 },
  'claude-sonnet-4-5': { input: 3,     output: 15,    cacheWrite: 3.75,   cacheRead: 0.30 },
  // Haiku family — fast/cheap
  'claude-haiku-4-5':  { input: 0.80,  output: 4,     cacheWrite: 1,      cacheRead: 0.08 },
};

// Risolve un model ID arbitrario al record pricing più vicino.
// Es. "claude-opus-4-7-20260315" → "claude-opus-4-7"
function resolveModel(id) {
  if (!id) return null;
  if (PRICING[id]) return PRICING[id];
  // Strip date suffix (-YYYYMMDD o -<8digits>)
  const stripped = id.replace(/-\d{8}.*$/, '');
  if (PRICING[stripped]) return PRICING[stripped];
  // Fallback per famiglia: opus / sonnet / haiku
  if (/opus/i.test(id))   return PRICING['claude-opus-4-7'];
  if (/sonnet/i.test(id)) return PRICING['claude-sonnet-4-6'];
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
