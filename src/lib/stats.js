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

function totalTokensFromModelUsage(modelUsage) {
  if (!modelUsage || typeof modelUsage !== 'object') return 0;
  return Object.values(modelUsage).reduce((s, m) => {
    return s + (m.inputTokens || 0) + (m.outputTokens || 0)
         + (m.cacheReadInputTokens || 0) + (m.cacheCreationInputTokens || 0);
  }, 0);
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

// Calcola context breakdown stimato in stile claude /context — categorie:
// System prompt, Memory files (CLAUDE.md), Skills, Agents, Custom agents
function computeContextBreakdown(claudeDir) {
  const cacheDir = path.join(claudeDir, 'plugins', 'cache');
  const skills = [], agents = [];

  // Scansiona cache globale
  if (fs.existsSync(cacheDir)) {
    for (const mkt of fs.readdirSync(cacheDir)) {
      const mktPath = path.join(cacheDir, mkt);
      try { if (!fs.statSync(mktPath).isDirectory()) continue; } catch { continue; }
      for (const plug of fs.readdirSync(mktPath)) {
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

  // Memory files: ~/.claude/CLAUDE.md (global)
  const globalClaudeMd = path.join(claudeDir, 'CLAUDE.md');
  const memoryFiles = fs.existsSync(globalClaudeMd) ? [globalClaudeMd] : [];

  // System prompt: stima fissa ~6.5k token (non leggibile da disco)
  const systemPromptTokens = 6500;

  const skillsBytes = skills.reduce((s, f) => { try { return s + fs.statSync(f).size; } catch { return s; } }, 0);
  const agentsBytes = agents.reduce((s, f) => { try { return s + fs.statSync(f).size; } catch { return s; } }, 0);
  const memoryBytes = memoryFiles.reduce((s, f) => { try { return s + fs.statSync(f).size; } catch { return s; } }, 0);

  const skillsTok  = Math.round(skillsBytes / 3.5);
  const agentsTok  = Math.round(agentsBytes / 3.5);
  const memoryTok  = Math.round(memoryBytes / 3.5);
  const totalTok   = systemPromptTokens + skillsTok + agentsTok + memoryTok;
  const contextMax = 200000;

  return {
    systemPrompt: { tokens: systemPromptTokens, label: 'System prompt' },
    memoryFiles:  { tokens: memoryTok,  bytes: memoryBytes, count: memoryFiles.length, label: 'Memory files (CLAUDE.md)' },
    skills:       { tokens: skillsTok,  bytes: skillsBytes, count: skills.length,      label: 'Skills (SKILL.md)' },
    agents:       { tokens: agentsTok,  bytes: agentsBytes, count: agents.length,      label: 'Agents (.md)' },
    totalEstimate: totalTok,
    contextWindow: contextMax,
    fillPercent: Math.round((totalTok / contextMax) * 100),
  };
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
  totalTokensFromModelUsage,
  estimateContextTokens,
  computeContextBreakdown,
  aggregateProjectTokens,
  listProjects,
};
