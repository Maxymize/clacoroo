'use strict';

const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const { execFile } = require('child_process');

const CLAUDE_DIR    = path.join(os.homedir(), '.claude');
const NEEDS_AUTH    = path.join(CLAUDE_DIR, 'mcp-needs-auth-cache.json');
const PLUGINS_CACHE = path.join(CLAUDE_DIR, 'plugins', 'cache');

// Parse riga di output `claude mcp list`. Esempi reali:
//   "claude.ai Gmail: https://gmailmcp.googleapis.com/mcp/v1 - ! Needs authentication"
//   "plugin:neon-plugin:neon: npx -y mcp-remote@latest https://mcp.neon.tech/mcp - ✓ Connected"
//   "plugin:cloudflare:cloudflare-api: https://mcp.cloudflare.com/mcp (HTTP) - ! Needs authentication"
function parseListLine(line) {
  // Pattern: <id>: <conn> - <status>
  // Lo status inizia sempre con un simbolo (✓ ! ✗) seguito da testo.
  const m = line.match(/^(.+?): (.+?) - ([✓!✗])\s*(.+)$/);
  if (!m) return null;
  const [, id, conn, symbol, statusText] = m;

  let status = 'unknown';
  if (symbol === '✓') status = 'connected';
  else if (symbol === '!') {
    status = /needs auth/i.test(statusText) ? 'needsAuth' : 'warning';
  } else if (symbol === '✗') status = 'error';

  // Estrai transport: ` (HTTP)` esplicito, oppure inferito da URL/comando
  let transport = 'unknown';
  let conn2 = conn;
  const tMatch = conn.match(/^(.+?)\s+\(([A-Za-z]+)\)$/);
  if (tMatch) {
    conn2 = tMatch[1];
    transport = tMatch[2].toLowerCase();
  } else if (/^https?:\/\//i.test(conn)) {
    transport = 'http';
  } else {
    transport = 'stdio';
  }

  // Decomponi ID:
  //   plugin:<plugin>:<server>  →  { kind: 'plugin', plugin, server }
  //   claude.ai <Service>       →  { kind: 'builtin' }
  let scope, plugin = null, displayName;
  if (id.startsWith('plugin:')) {
    const parts = id.split(':');
    scope = 'plugin';
    plugin = parts[1] || null;
    displayName = parts.slice(2).join(':') || id;
  } else if (id.startsWith('claude.ai ')) {
    scope = 'builtin';
    displayName = id.replace(/^claude\.ai\s+/, '');
  } else {
    scope = 'user';
    displayName = id;
  }

  return {
    id,                 // ID completo originale
    displayName,        // Nome leggibile (es. "neon" o "Gmail")
    scope,              // 'builtin' | 'plugin' | 'user'
    plugin,             // Nome plugin se scope='plugin', null altrimenti
    transport,          // 'http' | 'stdio' | 'sse' | 'unknown'
    connection: conn2,  // URL o comando (senza suffix HTTP)
    status,             // 'connected' | 'needsAuth' | 'warning' | 'error' | 'unknown'
    statusText,         // Messaggio originale (es. "Needs authentication")
  };
}

function runMcpList(claudeBin) {
  return new Promise((resolve) => {
    execFile(claudeBin, ['mcp', 'list'], { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, error: (stderr || err.message).trim(), servers: [] });
        return;
      }
      const servers = [];
      stdout.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('Checking')) return;  // header riga "Checking MCP server health…"
        const parsed = parseListLine(trimmed);
        if (parsed) servers.push(parsed);
      });
      resolve({ ok: true, servers });
    });
  });
}

// Lettura veloce dei server dichiarati dai plugin (senza health check).
// Usata come fallback / fonte aggiuntiva di metadata.
function readPluginMcpDeclarations() {
  const out = [];
  if (!fs.existsSync(PLUGINS_CACHE)) return out;
  for (const mkt of fs.readdirSync(PLUGINS_CACHE)) {
    const mktPath = path.join(PLUGINS_CACHE, mkt);
    if (!safeIsDir(mktPath)) continue;
    for (const plg of fs.readdirSync(mktPath)) {
      const plgPath = path.join(mktPath, plg);
      if (!safeIsDir(plgPath)) continue;
      // Versione più recente: prendiamo la prima sottodir (ordine lessicale è arbitrario,
      // ma in pratica c'è quasi sempre una sola versione per plugin in cache)
      for (const ver of fs.readdirSync(plgPath)) {
        const mcpJson = path.join(plgPath, ver, '.mcp.json');
        if (!fs.existsSync(mcpJson)) continue;
        try {
          const raw = JSON.parse(fs.readFileSync(mcpJson, 'utf8'));
          const servers = raw.mcpServers || {};
          for (const [name, def] of Object.entries(servers)) {
            out.push({
              plugin: plg,
              marketplace: mkt,
              server: name,
              id: 'plugin:' + plg + ':' + name,
              type: def.type || (def.command ? 'stdio' : 'unknown'),
              url: def.url || null,
              command: def.command || null,
              args: def.args || null,
            });
          }
        } catch { /* skip malformati */ }
        break;  // solo prima versione trovata
      }
    }
  }
  return out;
}

function safeIsDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

// Cache locale "needs auth": chiave = id completo, value = { timestamp, id? }
function readNeedsAuthCache() {
  try {
    if (!fs.existsSync(NEEDS_AUTH)) return {};
    return JSON.parse(fs.readFileSync(NEEDS_AUTH, 'utf8')) || {};
  } catch { return {}; }
}

module.exports = {
  parseListLine,
  runMcpList,
  readPluginMcpDeclarations,
  readNeedsAuthCache,
};
