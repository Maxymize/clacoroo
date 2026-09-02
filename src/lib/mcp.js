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
//   "plugin:neon-plugin:neon: npx -y mcp-remote@latest https://mcp.neon.tech/mcp - ✔ Connected"
//   "Coinstats: https://mcp.coinstats.app/mcp (HTTP) - ✘ Failed to connect"
// v1.1.36 — Claude Code usa i simboli "heavy": ✔ (U+2714) connesso e ✘ (U+2718)
// fallito; teniamo anche le varianti "light" ✓/✗ per compatibilità. Senza ✔/✘ il
// parser scartava silenziosamente TUTTI i server connessi e falliti, mostrando
// solo quelli "! Needs authentication".
function parseListLine(line) {
  // Pattern: <id>: <conn> - <symbol> <status>
  const m = line.match(/^(.+?): (.+?) - ([✓✔!✗✘])\s*(.+)$/);
  if (!m) return null;
  const [, id, conn, symbol, statusText] = m;

  let status = 'unknown';
  if (symbol === '✓' || symbol === '✔') status = 'connected';
  else if (symbol === '!') {
    status = /needs auth/i.test(statusText) ? 'needsAuth' : 'warning';
  } else if (symbol === '✗' || symbol === '✘') status = 'error';

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

// v1.2.9 — `cwd` opzionale: eseguito dalla cartella di un progetto, Claude Code
// include anche i server project-scoped di quella cartella (vedi checkProjectMcp).
function runMcpList(claudeBin, cwd) {
  return new Promise((resolve) => {
    if (typeof claudeBin !== 'string' || !claudeBin) {
      resolve({ ok: false, error: 'claude binary not configured', servers: [] });
      return;
    }
    const opts = { timeout: 30000 };
    if (cwd) opts.cwd = cwd;
    execFile(claudeBin, ['mcp', 'list'], opts, (err, stdout, stderr) => {
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

// v1.1.36 — Normalizza i due formati di .mcp.json visti in cache:
//   { "mcpServers": { <nome>: {...} } }  (claude-mem, cloudflare)
//   { <nome>: {...} }  (top-level senza wrapper, es. context7)
function mcpServersFromRaw(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return (raw.mcpServers && typeof raw.mcpServers === 'object') ? raw.mcpServers : raw;
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
          const servers = mcpServersFromRaw(raw);
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
// v1.1.3 — Pack N residui round 2: backend ritorna SOLO chiavi locale.
// Il renderer fa lookup via `t('mcpReconnect.<key>')` così le stringhe seguono
// la lingua attiva dell'utente (it/en/futuro). Niente più stringhe italiane
// hardcoded nel backend. Vedi src/renderer/locales/it.js → namespace `mcpReconnect`.
// v1.2.9 — Azioni riusabili. `open-terminal` porta con sé la cartella del
// progetto (se il server è project-scoped): `/mcp` mostra un server locale solo
// se `claude` gira da quella cartella.
function actOpenMcp(srv) {
  const a = { kind: 'open-terminal', labelKey: 'mcpReconnect.actOpenMcpInClaude', command: 'claude', preDigit: '/mcp' };
  if (srv && srv.scope === 'local' && srv.project) a.cwd = srv.project;
  return a;
}
const ACT_CLEAR_CACHE = { kind: 'clear-cache', labelKey: 'mcpReconnect.actClearAuthCache' };
const ACT_RECHECK     = { kind: 'recheck',     labelKey: 'mcpReconnect.actRecheck' };

const LOCAL_HOST_RE = /(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i;

// Host leggibile dalla connessione: URL → host:porta; comando stdio → l'URL
// che contiene (es. `npx mcp-remote http://…`), altrimenti il comando stesso.
function hostOf(connection) {
  const c = String(connection || '');
  const m = c.match(/https?:\/\/[^\s"']+/i);
  if (m) { try { return new URL(m[0]).host; } catch { return m[0]; } }
  return c || '?';
}

// v1.2.9 — Classifica un `error` dal testo che Claude Code riporta in
// `claude mcp list`. Prima ogni errore riceveva i bottoni OAuth: inutili per un
// server locale spento o un eseguibile mancante. Ritorna null se il testo
// somiglia a un problema di auth (→ si usano i tipi OAuth di sempre).
function classifyMcpError(srv) {
  const msg = String(srv.statusText || '').trim();
  const conn = String(srv.connection || '');
  if (/ENOENT|Executable not found|not found in \$?PATH|command not found|spawn .* ENOENT/i.test(msg)) {
    const bin = conn.trim().split(/\s+/)[0] || '?';
    return { type: 'missing-binary', vars: { bin } };
  }
  if (/ECONNREFUSED|ConnectionRefused|Unable to connect|connection refused/i.test(msg)) {
    return LOCAL_HOST_RE.test(conn)
      ? { type: 'local-down',    vars: { host: hostOf(conn) } }
      : { type: 'network-error', vars: { host: hostOf(conn) } };
  }
  if (/ENOTFOUND|EAI_AGAIN|ETIMEDOUT|timed? ?out|ECONNRESET|EHOSTUNREACH|ENETUNREACH|fetch failed|network|DNS|\b50[0-4]\b/i.test(msg)) {
    return { type: 'network-error', vars: { host: hostOf(conn) } };
  }
  if (/\b40[13]\b|unauthori[sz]ed|forbidden|invalid[_ ]?token|token expired|\bauth/i.test(msg)) {
    return null;
  }
  return { type: 'error-generic', vars: { msg: msg || '?' } };
}

function detectReconnectType(srv) {
  if (!srv) return null;

  // v1.2.9 — Rami per stato: error/warning hanno cause e rimedi diversi
  // dall'auth; il vecchio codice li trattava tutti come "needs auth".
  if (srv.status === 'error') {
    const c = classifyMcpError(srv);
    if (c) {
      const local = c.type === 'missing-binary' || c.type === 'local-down';
      return {
        type: c.type,
        typeLabelKey:    'mcpReconnect.type' + camel(c.type),
        descriptionKey:  'mcpReconnect.desc' + camel(c.type),
        descriptionVars: c.vars,
        rowLabelKey:     'mcpReconnect.causeLabel',
        // Locale (binario/porta): solo "Ricontrolla" — `/mcp` non può risolvere.
        // Remoto/generico: anche `/mcp`, che mostra il dettaglio dell'errore.
        actions: local ? [ACT_RECHECK] : [ACT_RECHECK, actOpenMcp(srv)],
      };
    }
    // errore di auth → tipi OAuth qui sotto (senza il bottone cache, che
    // riguarda solo le entry "Needs auth")
  }
  if (srv.status === 'warning') {
    return {
      type: 'warning',
      typeLabelKey:    'mcpReconnect.typeWarning',
      descriptionKey:  'mcpReconnect.descWarning',
      descriptionVars: { msg: String(srv.statusText || '').trim() || '?' },
      rowLabelKey:     'mcpReconnect.causeLabel',
      actions: [ACT_RECHECK, actOpenMcp(srv)],
    };
  }

  const cacheAct = srv.status === 'needsAuth' ? [ACT_CLEAR_CACHE] : [];

  if (srv.scope === 'builtin') {
    return {
      type: 'claude-ai-oauth',
      typeLabelKey: 'mcpReconnect.typeClaudeAiOauth',
      descriptionKey: 'mcpReconnect.descClaudeAiOauth',
      actions: [
        { kind: 'open-url', labelKey: 'mcpReconnect.actReauthClaudeAi', url: 'https://claude.ai/settings/connectors' },
        ...cacheAct,
      ],
    };
  }

  if (srv.transport === 'http' || srv.transport === 'sse') {
    return {
      type: 'http-oauth',
      typeLabelKey: 'mcpReconnect.typeHttpOauth',
      // v1.2.9 — testo distinto per i server aggiunti dall'utente: prima
      // diceva "gestito dal plugin" anche per quelli user/local.
      descriptionKey: srv.scope === 'plugin' ? 'mcpReconnect.descHttpOauth' : 'mcpReconnect.descHttpOauthUser',
      actions: [actOpenMcp(srv), ...cacheAct],
    };
  }

  // stdio: tipicamente non richiede auth. Se è "needsAuth" è perché un wrapper
  // (mcp-remote / proxy) sta facendo OAuth verso un servizio remoto.
  return {
    type: 'stdio-wrapper',
    typeLabelKey: 'mcpReconnect.typeStdioWrapper',
    descriptionKey: 'mcpReconnect.descStdioWrapper',
    actions: [actOpenMcp(srv), ...cacheAct],
  };
}

// 'local-down' → 'LocalDown' (suffisso delle chiavi locale type*/desc*)
function camel(kebab) {
  return String(kebab).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
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

// v1.1.36 — Legge e parsa ~/.claude.json una volta (null se assente/invalido).
// Centralizza il read+parse usato da readUserMcpConfig e readProjectMcpServers.
function loadClaudeJson() {
  try { return JSON.parse(fs.readFileSync(CLAUDE_USER_CONFIG, 'utf8')); }
  catch { return null; }
}

function readUserMcpConfig(name) {
  const data = loadClaudeJson();
  if (!data) return null;
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
  return null;
}

// v1.1.36 — Mappa una config MCP di ~/.claude.json nello shape di parseListLine.
function mcpConfigToServer(name, cfg, project) {
  cfg = cfg || {};
  const transport = String(cfg.type || (cfg.url ? 'http' : 'stdio')).toLowerCase();
  const connection = cfg.url ||
    [cfg.command, ...(Array.isArray(cfg.args) ? cfg.args : [])].filter(Boolean).join(' ');
  return {
    id: name,
    displayName: name,
    scope: 'local',
    plugin: null,
    transport,
    connection,
    status: 'unknown',   // non health-checkato qui (il check vive in `claude mcp list` per-cwd)
    statusText: '',
    project,
    projectName: path.basename(project) || project,
  };
}

// v1.1.36 — Legge TUTTI gli MCP project-scoped da ~/.claude.json
// (projects[*].mcpServers). `claude mcp list` dalla cwd di CLACOROO NON elenca i
// server legati ad altre cartelle di progetto: questa lettura li rende comunque
// visibili nel pannello (read-only, stato non verificato).
function readProjectMcpServers() {
  const out = [];
  const data = loadClaudeJson();
  if (!data) return out;
  for (const [proj, projData] of Object.entries(data.projects || {})) {
    const servers = (projData && projData.mcpServers) || {};
    for (const [name, cfg] of Object.entries(servers)) {
      out.push(mcpConfigToServer(name, cfg, proj));
    }
  }
  return out;
}

// v1.2.9 — Un path è verificabile solo se è una cartella progetto nota a
// Claude Code (chiave di projects{} in ~/.claude.json) ed esiste su disco:
// il renderer non può farci lanciare `claude` da una cartella arbitraria.
function isKnownProjectPath(project) {
  if (typeof project !== 'string' || !project || !path.isAbsolute(project)) return false;
  const data = loadClaudeJson();
  if (!data || !data.projects || !Object.prototype.hasOwnProperty.call(data.projects, project)) return false;
  return safeIsDir(project);
}

// v1.2.9 — Health check degli MCP di un progetto: `claude mcp list` eseguito
// con cwd = cartella del progetto, così Claude Code include i server
// project-scoped che dalla cwd di CLACOROO restano "unknown". Ritorna solo i
// server di quel progetto, già arricchiti con `reconnect` e `verifiedAt`.
async function checkProjectMcp(claudeBin, project) {
  if (!isKnownProjectPath(project)) {
    return { ok: false, error: 'project path not known to Claude Code', servers: [] };
  }
  const list = await runMcpList(claudeBin, project);
  if (!list.ok) return list;
  const byName = new Map();
  for (const s of readProjectMcpServers()) {
    if (s.project === project) byName.set(s.id, s);
  }
  const now = Date.now();
  const servers = [];
  for (const srv of list.servers || []) {
    const base = byName.get(srv.id);
    if (!base) continue;   // user/plugin/builtin: già coperti dal get-mcp normale
    const s = {
      ...base,
      transport:  srv.transport !== 'unknown' ? srv.transport : base.transport,
      connection: srv.connection || base.connection,
      status:     srv.status,
      statusText: srv.statusText,
      verifiedAt: now,
    };
    servers.push({ ...s, reconnect: detectReconnectType(s) });
  }
  return { ok: true, servers, checkedAt: now };
}

module.exports = {
  parseListLine,
  classifyMcpError,
  checkProjectMcp,
  isKnownProjectPath,
  runMcpList,
  readPluginMcpDeclarations,
  readNeedsAuthCache,
  fastEstimate,
  detectReconnectType,
  clearAuthCacheEntry,
  readUserMcpConfig,
  readProjectMcpServers,
  mcpServersFromRaw,
};
