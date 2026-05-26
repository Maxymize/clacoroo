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
              env: def.env || null,
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

// Stima veloce del numero di MCP server connessi/totali SENZA spawnare
// `claude mcp list` (che è lento, 2-5s). Usa: dichiarazioni dai plugin
// installati (`.mcp.json`) + 3 server built-in claude.ai - i server in
// `mcp-needs-auth-cache.json`. Approssimazione utile per il context
// breakdown a freddo (prima che l'utente apra la sezione MCP).
//   blockedFullIds: Set di "<plugin>@<marketplace>" da escludere
//                   (plugin disabilitati dall'utente)
function fastEstimate(blockedFullIds) {
  const blocked = blockedFullIds instanceof Set ? blockedFullIds : new Set();
  const decls = readPluginMcpDeclarations();
  const enabledDecls = decls.filter(d => !blocked.has(d.plugin + '@' + d.marketplace));
  const builtinCount = 3;  // claude.ai Gmail/Calendar/Drive (hard-coded nel binary)
  const total = enabledDecls.length + builtinCount;
  const needsAuth = readNeedsAuthCache();
  // Conta i needs-auth la cui chiave appare anche fra i declarations abilitati (o builtin)
  const allowedIds = new Set([
    'claude.ai Gmail', 'claude.ai Google Calendar', 'claude.ai Google Drive',
    ...enabledDecls.map(d => 'plugin:' + d.plugin + ':' + d.server),
  ]);
  let needsAuthCount = 0;
  for (const id of Object.keys(needsAuth)) {
    if (allowedIds.has(id)) needsAuthCount++;
  }
  const connected = Math.max(0, total - needsAuthCount);
  return { total, connected, needsAuth: needsAuthCount };
}

// v1.0.85 — Pack G v2: Reconnect MCP from CLACOROO
//
// Detection del "tipo di riconnessione" appropriato per ogni MCP server.
// Strategia distinta per i 3 pattern reali:
//
//   1. `claude.ai` global (Drive/Gmail/Calendar): OAuth server-side gestito
//      da claude.ai. Token vivono nel cloud, l'utente riautorizza dal sito.
//      Reconnect = aprire claude.ai/settings/connectors nel browser.
//
//   2. Plugin HTTP/SSE (Cloudflare/Supabase/...): OAuth client-side. Claude
//      Code apre il browser su un OAuth flow durante una sessione interactive
//      e gestisce il callback su una porta locale. CLACOROO non può
//      intercettare il flow → suggerisce di lanciare `claude` nel terminale
//      integrato (il prompt OAuth comparirà alla prima invocazione di un tool).
//
//   3. Plugin stdio (npx mcp-remote, sh -c node script, ...): processo locale
//      che parte on-demand. Niente OAuth da fare. Se `needsAuth`, è
//      tipicamente perché il wrapper (es. mcp-remote) sta facendo OAuth verso
//      un servizio remoto → stesso pattern del #2.
//
// Ritorna sempre un oggetto strutturato { type, description, actions[] }
// con actions immutabili dal punto di vista renderer (kind + label + payload).
function detectReconnectType(srv) {
  if (!srv) return null;

  if (srv.scope === 'builtin') {
    return {
      type: 'claude-ai-oauth',
      typeLabel: 'OAuth claude.ai',
      description: 'MCP integrato di Claude.ai. La riautorizzazione avviene dal sito web (i token vivono lato server).',
      actions: [
        // v1.0.102 — Label senza emoji prefix: il renderer aggiunge un'icona
        // Lucide in base al `kind` (external-link / terminal / ban).
        { kind: 'open-url', label: 'Riautorizza su claude.ai', url: 'https://claude.ai/settings/connectors' },
        { kind: 'clear-cache', label: 'Rimuovi da cache "Needs auth"' },
      ],
    };
  }

  if (srv.transport === 'http' || srv.transport === 'sse') {
    return {
      type: 'http-oauth',
      typeLabel: 'OAuth via /mcp in claude',
      description: 'Server HTTP/SSE gestito dal plugin. Apriamo `claude` e ti portiamo al menu `/mcp` di Claude Code, da dove puoi fare auth/reconnect direttamente.',
      actions: [
        { kind: 'open-terminal', label: 'Apri /mcp in claude', command: 'claude', preDigit: '/mcp' },
        { kind: 'clear-cache', label: 'Rimuovi da cache "Needs auth"' },
      ],
    };
  }

  // stdio: tipicamente non richiede auth. Se è "needsAuth" è perché un wrapper
  // (mcp-remote / proxy) sta facendo OAuth verso un servizio remoto.
  return {
    type: 'stdio-wrapper',
    typeLabel: 'Wrapper stdio',
    description: 'Server stdio locale. Se richiede auth, è un wrapper (es. mcp-remote) a fare OAuth — il menu `/mcp` di Claude Code ti fa gestire il reconnect.',
    actions: [
      { kind: 'open-terminal', label: 'Apri /mcp in claude', command: 'claude', preDigit: '/mcp' },
      { kind: 'clear-cache', label: 'Rimuovi da cache "Needs auth"' },
    ],
  };
}

// Rimuove l'entry per `serverId` da mcp-needs-auth-cache.json. Al prossimo
// `claude mcp list` Claude Code rifarà la health-check; se l'utente ha
// nel frattempo riautorizzato lato server (claude.ai o OAuth plugin), il
// server tornerà `Connected`, altrimenti tornerà `Needs auth` e il cache
// si ripopolerà. Operazione safe (non tocca i token reali, solo il cache).
function clearAuthCacheEntry(serverId) {
  try {
    if (!fs.existsSync(NEEDS_AUTH)) return { ok: true, removed: false };
    const cache = readNeedsAuthCache();
    if (!Object.prototype.hasOwnProperty.call(cache, serverId)) {
      return { ok: true, removed: false };
    }
    delete cache[serverId];
    fs.writeFileSync(NEEDS_AUTH, JSON.stringify(cache, null, 0));
    return { ok: true, removed: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// v1.0.104 — Lettura config user/local di un singolo MCP server da ~/.claude.json.
// Usato per Disable/Enable: prima di rimuovere un server user-added, salviamo
// la sua config in state.json di CLACOROO così possiamo re-add con i giusti
// parametri quando l'utente clicca "Abilita".
//
// Ritorna { scope: 'user'|'local', config: {type, url|command, args, env, headers}, project? }
// o null se il server non è user-added.
const CLAUDE_USER_CONFIG = path.join(os.homedir(), '.claude.json');

function readUserMcpConfig(name) {
  if (!fs.existsSync(CLAUDE_USER_CONFIG)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(CLAUDE_USER_CONFIG, 'utf8'));
    // User scope (globale)
    if (data.mcpServers && Object.prototype.hasOwnProperty.call(data.mcpServers, name)) {
      return { scope: 'user', config: data.mcpServers[name] };
    }
    // Local/project scope: in projects[<cwd>].mcpServers
    for (const [proj, projData] of Object.entries(data.projects || {})) {
      if (projData && projData.mcpServers && Object.prototype.hasOwnProperty.call(projData.mcpServers, name)) {
        return { scope: 'local', project: proj, config: projData.mcpServers[name] };
      }
    }
  } catch { /* invalid JSON, skip */ }
  return null;
}

module.exports = {
  parseListLine,
  runMcpList,
  readPluginMcpDeclarations,
  readNeedsAuthCache,
  fastEstimate,
  detectReconnectType,
  clearAuthCacheEntry,
  readUserMcpConfig,
};
