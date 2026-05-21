'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CLAUDE_DIR  = path.join(os.homedir(), '.claude');
const STATS_CACHE = path.join(CLAUDE_DIR, 'stats-cache.json');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

function safeReadJson(filePath, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

function readStatsCache() {
  return safeReadJson(STATS_CACHE, null);
}

function computeStreak(dailyActivity) {
  if (!Array.isArray(dailyActivity) || !dailyActivity.length) return 0;
  // Sort by date desc
  const sorted = [...dailyActivity].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let cursor = new Date(sorted[0].date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Se l'ultimo giorno di attività è oggi o ieri, conteggio streak da lì
  const daysSinceLast = Math.floor((today - cursor) / 86400000);
  if (daysSinceLast > 1) return 0;
  for (const entry of sorted) {
    const d = new Date(entry.date + 'T00:00:00');
    const diff = Math.floor((cursor - d) / 86400000);
    if (diff === 0) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else if (diff === 1) { cursor = new Date(entry.date + 'T00:00:00'); streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  return streak;
}

// Total tokens come Claude /stats: SOLO input + output (esclude cache_read che
// è "free" e cache_creation che è infrastructure). Sommare tutto gonfiava
// il dato di ~400× (cache read accumula miliardi rapidamente).
function totalTokensFromModelUsage(modelUsage) {
  if (!modelUsage || typeof modelUsage !== 'object') return 0;
  return Object.values(modelUsage).reduce((s, m) => {
    return s + (m.inputTokens || 0) + (m.outputTokens || 0);
  }, 0);
}

// Aggregazione filtrata per range (all|30|7 giorni).
// Restituisce metriche derivate dai dailyActivity/dailyModelTokens filtrati.
function aggregateForRange(cache, range) {
  const dailyActivity    = cache?.dailyActivity || [];
  const dailyModelTokens = cache?.dailyModelTokens || [];
  const hourCounts       = cache?.hourCounts || {};
  const modelUsage       = cache?.modelUsage || {};

  if (range === 'all') {
    // Tutto: usa cache fields se disponibili
    return {
      sessions:    cache?.totalSessions || dailyActivity.reduce((s, e) => s + (e.sessionCount || 0), 0),
      messages:    cache?.totalMessages || dailyActivity.reduce((s, e) => s + (e.messageCount || 0), 0),
      tokens:      totalTokensFromModelUsage(modelUsage),
      activeDays:  dailyActivity.length,
      totalDays:   dailyActivity.length ? daysBetweenDates(dailyActivity) : 0,
      peakHour:    peakHour(hourCounts),
      favoriteModel: favoriteModel(modelUsage),
      mostActiveDay: mostActiveDay(dailyActivity),
    };
  }

  // 30 / 7 giorni: filtra dailyActivity e dailyModelTokens
  const days = parseInt(range, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - days + 1);
  const cutoffKey = cutoff.toISOString().slice(0, 10);

  const filteredActivity = dailyActivity.filter(e => e.date >= cutoffKey);
  const filteredTokens   = dailyModelTokens.filter(e => e.date >= cutoffKey);

  // Aggrega tokens per modello dal filtered
  const tokensByModel = {};
  let totalTok = 0;
  for (const entry of filteredTokens) {
    for (const [m, v] of Object.entries(entry.tokensByModel || {})) {
      tokensByModel[m] = (tokensByModel[m] || 0) + v;
      totalTok += v;
    }
  }
  const favModel = Object.entries(tokensByModel).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    sessions:    filteredActivity.reduce((s, e) => s + (e.sessionCount || 0), 0),
    messages:    filteredActivity.reduce((s, e) => s + (e.messageCount || 0), 0),
    tokens:      totalTok,
    activeDays:  filteredActivity.length,
    totalDays:   days,
    peakHour:    peakHour(hourCounts),  // hourCounts è all-time, non filtrato
    favoriteModel: favModel,
    mostActiveDay: mostActiveDay(filteredActivity),
  };
}

function daysBetweenDates(dailyActivity) {
  if (!dailyActivity.length) return 0;
  const dates = dailyActivity.map(e => new Date(e.date + 'T00:00:00').getTime()).sort();
  return Math.floor((dates[dates.length - 1] - dates[0]) / 86400000) + 1;
}

function mostActiveDay(dailyActivity) {
  if (!Array.isArray(dailyActivity) || !dailyActivity.length) return null;
  return dailyActivity.reduce((best, e) =>
    (e.messageCount || 0) > (best?.messageCount || 0) ? e : best, null);
}

// Stima token contesto basato su byte (~3.5 byte/token per testo)
function estimateContextTokens(filesByCategory) {
  const out = {};
  for (const [cat, files] of Object.entries(filesByCategory || {})) {
    let bytes = 0;
    for (const f of files) {
      try { bytes += fs.statSync(f).size; } catch {}
    }
    out[cat] = { bytes, tokensEstimate: Math.round(bytes / 3.5) };
  }
  return out;
}

// Estrae solo il blocco frontmatter (YAML tra `---`) — è quello che Claude
// "vede" nell'index delle skill/agent. Il body completo NON è nel contesto
// finché la skill non viene effettivamente invocata.
function frontmatterBytes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const m = content.match(/^---\r?\n[\s\S]*?\r?\n---/);
    return m ? Buffer.byteLength(m[0], 'utf8') : 0;
  } catch { return 0; }
}

// Calcola context breakdown stimato in stile claude /context.
// IMPORTANTE: per skill/agent conta SOLO il frontmatter (quello che Claude vede
// nell'index discovery), non il body completo del file. Senza questo accorgimento
// si ottengono numeri irrealistici (sommare TUTTI gli SKILL.md gonfia × 10-20).
function computeContextBreakdown(claudeDir, blockedSet) {
  const cacheDir = path.join(claudeDir, 'plugins', 'cache');
  const skills = [], agents = [];
  const blocked = blockedSet instanceof Set ? blockedSet : new Set();

  if (fs.existsSync(cacheDir)) {
    for (const mkt of fs.readdirSync(cacheDir)) {
      const mktPath = path.join(cacheDir, mkt);
      try { if (!fs.statSync(mktPath).isDirectory()) continue; } catch { continue; }
      for (const plug of fs.readdirSync(mktPath)) {
        const fullId = plug + '@' + mkt;
        if (blocked.has(fullId)) continue;  // plugin disabilitato → escluso dal contesto
        const plugPath = path.join(mktPath, plug);
        try { if (!fs.statSync(plugPath).isDirectory()) continue; } catch { continue; }
        const versions = fs.readdirSync(plugPath).filter(d => {
          try { return fs.statSync(path.join(plugPath, d)).isDirectory(); }
          catch { return false; }
        });
        if (!versions.length) continue;
        const ver = versions[versions.length - 1];
        const root = path.join(plugPath, ver);
        const skillsDir = path.join(root, 'skills');
        const agentsDir = path.join(root, 'agents');
        if (fs.existsSync(skillsDir)) {
          for (const s of fs.readdirSync(skillsDir)) {
            const skMd = path.join(skillsDir, s, 'SKILL.md');
            if (fs.existsSync(skMd)) skills.push(skMd);
          }
        }
        if (fs.existsSync(agentsDir)) {
          for (const a of fs.readdirSync(agentsDir)) {
            if (a.endsWith('.md') && a.toLowerCase() !== 'readme.md') {
              agents.push(path.join(agentsDir, a));
            }
          }
        }
      }
    }
  }

  // Memory files: ~/.claude/CLAUDE.md (globale)
  const globalClaudeMd = path.join(claudeDir, 'CLAUDE.md');
  const memoryFiles = fs.existsSync(globalClaudeMd) ? [globalClaudeMd] : [];

  // System prompt: stima fissa ~6.6k token (hardcoded da Claude Code, non leggibile)
  const systemPromptTokens = 6600;

  // Skills/Agents: somma SOLO frontmatter (index discovery cost)
  const skillsFmBytes = skills.reduce((s, f) => s + frontmatterBytes(f), 0);
  const agentsFmBytes = agents.reduce((s, f) => s + frontmatterBytes(f), 0);
  // Memory file letto per intero (è caricato in toto)
  const memoryBytes = memoryFiles.reduce((s, f) => { try { return s + fs.statSync(f).size; } catch { return s; } }, 0);

  const skillsTok  = Math.round(skillsFmBytes / 3.5);
  const agentsTok  = Math.round(agentsFmBytes / 3.5);
  const memoryTok  = Math.round(memoryBytes / 3.5);
  const usedTok    = systemPromptTokens + skillsTok + agentsTok + memoryTok;
  const contextMax = 200000;
  const freeTok    = Math.max(0, contextMax - usedTok);

  return {
    systemPrompt: { tokens: systemPromptTokens, label: 'System prompt' },
    memoryFiles:  { tokens: memoryTok,  count: memoryFiles.length, label: 'Memory files' },
    skills:       { tokens: skillsTok,  count: skills.length,      label: 'Skills (index)' },
    agents:       { tokens: agentsTok,  count: agents.length,      label: 'Agents (index)' },
    freeSpace:    { tokens: freeTok,    label: 'Free space' },
    totalEstimate: usedTok,
    contextWindow: contextMax,
    fillPercent: Math.min(100, Math.round((usedTok / contextMax) * 100)),
  };
}

// Calcola "longest streak" — la serie consecutiva di giorni attivi più lunga
function computeLongestStreak(dailyActivity) {
  if (!Array.isArray(dailyActivity) || !dailyActivity.length) return 0;
  const dates = dailyActivity.map(e => e.date).sort();
  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i]     + 'T00:00:00');
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) { current++; if (current > longest) longest = current; }
    else current = 1;
  }
  return longest;
}

// Trova ora di punta (0-23) e modello preferito dai dati cache
function peakHour(hourCounts) {
  if (!hourCounts || typeof hourCounts !== 'object') return null;
  let best = null, bestCount = -1;
  for (const [h, c] of Object.entries(hourCounts)) {
    if (c > bestCount) { bestCount = c; best = h; }
  }
  return best === null ? null : Number(best);
}

function favoriteModel(modelUsage) {
  if (!modelUsage || typeof modelUsage !== 'object') return null;
  let best = null, bestTotal = -1;
  for (const [m, u] of Object.entries(modelUsage)) {
    const total = (u.inputTokens||0) + (u.outputTokens||0) + (u.cacheReadInputTokens||0) + (u.cacheCreationInputTokens||0);
    if (total > bestTotal) { bestTotal = total; best = m; }
  }
  return best;
}

// Estrae cwd dal primo messaggio JSONL valido (Claude Code include il campo cwd
// nei messaggi). Più affidabile di decodificare il nome dir encoded che è ambiguo
// quando i path contengono '-' (es. "Claude-Control-Room").
function extractCwdFromSessionFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg && typeof msg.cwd === 'string') return msg.cwd;
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return null;
}

// Per-progetto: aggregazione leggera da JSONL session files (anche message count)
function aggregateProjectTokens(projectKey) {
  const sessionDir = path.join(PROJECTS_DIR, projectKey);
  if (!fs.existsSync(sessionDir)) return { sessions: 0, totalTokens: 0, messages: 0, cwd: null };
  const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.jsonl'));
  let totalTokens = 0;
  let messages = 0;
  let cwd = null;
  for (const f of files) {
    const filePath = path.join(sessionDir, f);
    if (!cwd) cwd = extractCwdFromSessionFile(filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          // Conta i messaggi assistant/user come "interazioni"
          if (msg?.message?.role === 'assistant' || msg?.message?.role === 'user') {
            messages++;
          }
          const u = msg?.message?.usage;
          if (u) {
            totalTokens += (u.input_tokens || 0) + (u.output_tokens || 0)
                        + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
          }
        } catch { /* skip malformed line */ }
      }
    } catch { /* skip unreadable file */ }
  }
  return { sessions: files.length, totalTokens, messages, cwd };
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs.readdirSync(PROJECTS_DIR)
    .filter(d => {
      try { return fs.statSync(path.join(PROJECTS_DIR, d)).isDirectory(); }
      catch { return false; }
    });
}

module.exports = {
  readStatsCache,
  computeStreak,
  computeLongestStreak,
  totalTokensFromModelUsage,
  estimateContextTokens,
  computeContextBreakdown,
  aggregateProjectTokens,
  aggregateForRange,
  mostActiveDay,
  listProjects,
  peakHour,
  favoriteModel,
};
