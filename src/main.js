/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE <info@maxymizebusiness.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License v3 or later.
 * Full license text: see LICENSE file or https://www.gnu.org/licenses/agpl-3.0
 */
'use strict';

const { app, BrowserWindow, Menu, Notification, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { execFile, execFileSync } = require('child_process');

// Override generic "Electron" name + icon for dev mode (in production the
// .icns from electron-builder takes precedence in the .app bundle).
app.setName('CLACOROO');
const APP_ICON = path.join(__dirname, '..', 'assets', 'icon.png');

let mainWindow;

// A4 — Single-instance lock: se l'app è già in esecuzione, il secondo lancio
// riporta in foreground la finestra esistente e si chiude immediatamente
// (early return per evitare di registrare IPC handler / whenReady nel
// processo che sta per quittare).
if (!app.requestSingleInstanceLock()) {
  app.quit();
  return;
}
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});
const { checkMarkdownHealth } = require('./lib/markdown');
const { buildSnapshot, diffSnapshot } = require('./lib/snapshot');
const {
  readState, writeState,
  readActivityLog, appendActivity, clearActivityLog,
} = require('./lib/state');
const { buildAppMenu, setupAboutPanel } = require('./lib/menu');
const { checkLatestRelease } = require('./lib/updater');
const { readChangelogRaw, parseChangelog } = require('./lib/changelog');
const STATS   = require('./lib/stats');
const MCP     = require('./lib/mcp');
const MCP_CLIENT = require('./lib/mcpClient');
const HOOK_DEPS = require('./lib/hookDeps');
const ACCOUNT = require('./lib/account');
const PRICING = require('./lib/pricing');
const USAGE   = require('./lib/usage');
const PTY     = require('./lib/pty');
const APIKEY  = require('./lib/apikey');

/* ── CONFIG PATHS ──────────────────────────────────────────────────────── */

function getClaudeDir() {
  if (process.platform === 'win32') {
    const base = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(base, 'Claude');
  }
  return path.join(os.homedir(), '.claude');
}

const CLAUDE_DIR   = getClaudeDir();
const PLUGINS_DIR  = path.join(CLAUDE_DIR, 'plugins');
const CACHE_DIR    = path.join(PLUGINS_DIR, 'cache');
const INSTALLED    = path.join(PLUGINS_DIR, 'installed_plugins.json');
const BLOCKLIST    = path.join(PLUGINS_DIR, 'blocklist.json');
const MARKETPLACES = path.join(PLUGINS_DIR, 'known_marketplaces.json');
const CATALOG      = path.join(PLUGINS_DIR, 'plugin-catalog-cache.json');
const SETTINGS     = path.join(CLAUDE_DIR, 'settings.json');

/* ── FIND CLAUDE BINARY ────────────────────────────────────────────────── */

function findClaudeBin() {
  const candidates = [
    '/usr/local/bin/claude',
    path.join(os.homedir(), '.local', 'bin', 'claude'),
    '/opt/homebrew/bin/claude',
    path.join(os.homedir(), '.npm-global', 'bin', 'claude'),
    '/usr/bin/claude',
    'C:\\Program Files\\Claude\\claude.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  try {
    const shell = process.platform === 'win32' ? 'cmd' : 'bash';
    const args  = process.platform === 'win32'
      ? ['/c', 'where claude']
      : ['-l', '-c', 'which claude 2>/dev/null'];
    const result = execFileSync(shell, args, { encoding: 'utf8', timeout: 4000 }).trim();
    const first  = result.split('\n')[0];
    if (first && fs.existsSync(first)) return first;
  } catch {}
  return null;
}

let CLAUDE_BIN = findClaudeBin();

/* ── VALIDATION ────────────────────────────────────────────────────────── */

function validPluginId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*(@[a-zA-Z0-9][a-zA-Z0-9_.-]*)?$/.test(id);
}
function validMarketplaceName(name) {
  return typeof name === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name);
}
// v1.0.51 — source per `claude plugins marketplace add` accetta:
//   - shorthand GitHub user/repo
//   - URL https://... .git
//   - path locale assoluto
// execFile esegue array di argomenti (no shell), ma vietiamo i caratteri
// shell pericolosi per evitare confusione lato CLI Claude.
function validMarketplaceSource(src) {
  if (typeof src !== 'string') return false;
  if (src.length < 1 || src.length > 500) return false;
  if (/[\s;|&`$<>(){}[\]"'\\]/.test(src)) return false;
  return true;
}

/* ── SAFE EXEC ─────────────────────────────────────────────────────────── */

function runClaudeArgs(args) {
  return new Promise(resolve => {
    if (!CLAUDE_BIN) {
      return resolve({ success: false, error: 'Binario claude non trovato. Configura il percorso nelle Impostazioni.' });
    }
    execFile(CLAUDE_BIN, args, { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) resolve({ success: false, error: (stderr || err.message).trim() });
      else     resolve({ success: true,  output: stdout.trim() });
    });
  });
}


/* ── DATA READING ──────────────────────────────────────────────────────── */

function safeReadJson(filePath, fallback) {
  try   { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

let LAST_CACHE = {};

// v1.0.56 — Legge hooks/hooks.json di un plugin e ritorna array di eventi.
// v1.0.83 — Esteso con `matchers: [{matcher, handlers: [{type,command,async,timeout,shell}]}]`
// per alimentare la nuova sezione Hooks (browser dedicato come Skills/Agents).
// I campi legacy `matcherCount` + `handlerCount` restano per compat con i drill-in
// del modal "Contenuto plugin" già esistenti.
function readHookEvents(hooksDir) {
  if (!fs.existsSync(hooksDir)) return [];
  const hooksJson = path.join(hooksDir, 'hooks.json');
  if (!fs.existsSync(hooksJson)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(hooksJson, 'utf8'));
    const events = raw.hooks || {};
    return Object.entries(events).map(([eventName, matchers]) => {
      const arr = Array.isArray(matchers) ? matchers : [];
      const detailed = arr.map(m => ({
        matcher: typeof m.matcher === 'string' ? m.matcher : '',
        handlers: Array.isArray(m.hooks) ? m.hooks.map(h => {
          // v1.0.87 — detection delle dipendenze CLI esterne richieste
          // dal comando dell'handler. Lista usata dal renderer per pittare
          // un badge ⚠ "Richiede X" sulle card hook quando X non è
          // installato (vedi hookDepsAvailability in readAllData).
          const detectedDeps = Array.from(HOOK_DEPS.detectDepsInCommand(h.command || ''));
          return {
            type:    h.type    || 'command',
            command: h.command || '',
            async:   !!h.async,
            timeout: typeof h.timeout === 'number' ? h.timeout : null,
            shell:   h.shell || '',
            detectedDeps,
          };
        }) : [],
      }));
      return {
        event: eventName,
        matcherCount: arr.length,
        handlerCount: detailed.reduce((s, m) => s + m.handlers.length, 0),
        matchers: detailed,
        sourcePath: hooksJson,
      };
    });
  } catch { return []; }
}

function scanCache() {
  const details = {};
  if (!fs.existsSync(CACHE_DIR)) {
    LAST_CACHE = details;
    return details;
  }

  for (const mkt of fs.readdirSync(CACHE_DIR)) {
    const mktPath = path.join(CACHE_DIR, mkt);
    if (!fs.statSync(mktPath).isDirectory()) continue;

    for (const pluginName of fs.readdirSync(mktPath)) {
      const pluginPath = path.join(mktPath, pluginName);
      if (!fs.statSync(pluginPath).isDirectory()) continue;

      const versions = fs.readdirSync(pluginPath)
        .filter(d => fs.statSync(path.join(pluginPath, d)).isDirectory());
      if (!versions.length) continue;

      const ver  = versions[versions.length - 1];
      const root = path.join(pluginPath, ver);

      let meta = {};
      for (const loc of ['plugin.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
        const mp = path.join(root, loc);
        if (fs.existsSync(mp)) { meta = safeReadJson(mp, {}); break; }
      }

      const skillsDir = path.join(root, 'skills');
      const agentsDir = path.join(root, 'agents');
      const hooksDir  = path.join(root, 'hooks');
      const mcpPaths  = [path.join(root, 'mcp.json'), path.join(root, '.claude-plugin', 'mcp.json')];

      // Skills: each skill is a subdirectory containing SKILL.md
      const skills = fs.existsSync(skillsDir)
        ? fs.readdirSync(skillsDir).filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory())
        : [];
      // Agents: each agent is a .md file inside agents/ (not a directory)
      const agents = fs.existsSync(agentsDir)
        ? fs.readdirSync(agentsDir)
            .filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
            .map(f => f.replace(/\.md$/, ''))
        : [];

      // Health check (idea #3): scan SKILL.md / agent.md frontmatter
      const skillHealth = {};
      skills.forEach(s => {
        skillHealth[s] = checkMarkdownHealth(path.join(skillsDir, s, 'SKILL.md'));
      });
      const agentHealth = {};
      agents.forEach(a => {
        agentHealth[a] = checkMarkdownHealth(path.join(agentsDir, a + '.md'));
      });

      // v1.0.82 — installedAt per ordinamento "Aggiunti di recente" in sezione
      // Plugin: birthtime della dir cache del plugin (timestamp di prima creazione).
      let installedAt = '';
      try {
        const st = fs.statSync(pluginPath);
        installedAt = (st.birthtime || st.ctime || st.mtime).toISOString();
      } catch { /* ignore */ }

      const key = `${pluginName}@${mkt}`;
      details[key] = {
        name:        meta.name        || pluginName,
        description: meta.description || '',
        version:     meta.version     || ver,
        author:      meta.author      || '',
        path:        root,
        installedAt,
        skills,
        agents,
        skillHealth,
        agentHealth,
        hasMcp:   mcpPaths.some(p => fs.existsSync(p)),
        hasHooks: fs.existsSync(hooksDir) && fs.readdirSync(hooksDir).length > 0,
        hookEvents: readHookEvents(hooksDir),
      };
    }
  }
  LAST_CACHE = details;
  return details;
}

function scanLocalProjects(trackedProjects) {
  // Per ogni progetto tracciato leggi <project>/.claude/plugins/installed_plugins.json
  // e scan cache locale per skills/agents. Ritorna oggetto:
  // { localPlugins: [{ fullId, projectPath, projectName, scope: 'local' }],
  //   localSkills:  [{ name, plugin, projectName, scope: 'local' }],
  //   localAgents:  [{ name, plugin, projectName, scope: 'local' }] }
  const out = { localPlugins: [], localSkills: [], localAgents: [] };
  if (!Array.isArray(trackedProjects)) return out;

  for (const projectPath of trackedProjects) {
    if (!projectPath || !fs.existsSync(projectPath)) continue;
    const projectName = path.basename(projectPath);
    const localPluginsFile = path.join(projectPath, '.claude', 'plugins', 'installed_plugins.json');
    const localCacheDir    = path.join(projectPath, '.claude', 'plugins', 'cache');

    // Plugin list (formato v2)
    if (fs.existsSync(localPluginsFile)) {
      const raw = safeReadJson(localPluginsFile, { plugins: {} });
      const ids = Array.isArray(raw.plugins) ? raw.plugins : Object.keys(raw.plugins || {});
      ids.forEach(fullId => out.localPlugins.push({
        fullId, projectPath, projectName, scope: 'local',
      }));
    }

    // Cache scan locale (per skills + agents)
    if (!fs.existsSync(localCacheDir)) continue;
    for (const mkt of fs.readdirSync(localCacheDir)) {
      const mktPath = path.join(localCacheDir, mkt);
      if (!fs.statSync(mktPath).isDirectory()) continue;
      for (const pluginName of fs.readdirSync(mktPath)) {
        const pluginRoot = path.join(mktPath, pluginName);
        if (!fs.statSync(pluginRoot).isDirectory()) continue;
        const versions = fs.readdirSync(pluginRoot)
          .filter(d => fs.statSync(path.join(pluginRoot, d)).isDirectory());
        if (!versions.length) continue;
        const versionRoot = path.join(pluginRoot, versions[versions.length - 1]);
        const skillsDir = path.join(versionRoot, 'skills');
        const agentsDir = path.join(versionRoot, 'agents');
        if (fs.existsSync(skillsDir)) {
          fs.readdirSync(skillsDir)
            .filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory())
            .forEach(name => out.localSkills.push({
              name, plugin: pluginName + '@' + mkt, projectName, projectPath, scope: 'local',
            }));
        }
        if (fs.existsSync(agentsDir)) {
          fs.readdirSync(agentsDir)
            .filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
            .map(f => f.replace(/\.md$/, ''))
            .forEach(name => out.localAgents.push({
              name, plugin: pluginName + '@' + mkt, projectName, projectPath, scope: 'local',
            }));
        }
      }
    }
  }
  return out;
}

function extractRepoPath(source) {
  if (!source) return '';
  if (source.repo) return source.repo;
  if (source.url) {
    const m = source.url.match(/github\.com\/([^/]+\/[^/.]+?)(?:\.git)?(?:\/.*)?$/);
    return m ? m[1] : source.url;
  }
  return '';
}

// v1.0.53 — Conta i plugin dichiarati in un marketplace (NON solo quelli
// installati). Legge ~/.claude/plugins/marketplaces/<id>/marketplace.json
// o .claude-plugin/marketplace.json. Veloce (read+parse, no IPC).
function readMarketplacePluginCount(marketplaceId) {
  const dir = path.join(CLAUDE_DIR, 'plugins', 'marketplaces', marketplaceId);
  if (!fs.existsSync(dir)) return 0;
  const candidates = [
    path.join(dir, '.claude-plugin', 'marketplace.json'),
    path.join(dir, 'marketplace.json'),
  ];
  const fp = candidates.find(p => fs.existsSync(p));
  if (!fp) return 0;
  try {
    const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (Array.isArray(raw.plugins))       return raw.plugins.length;
    if (raw.plugins && typeof raw.plugins === 'object') return Object.keys(raw.plugins).length;
    return 0;
  } catch { return 0; }
}

// v1.0.55 — Data di "installazione" del marketplace dalla directory.
// Ritorna birthtime ISO string, o ctime/mtime come fallback (alcuni FS
// non supportano birthtime). null se la dir non esiste.
function readMarketplaceAddedAt(marketplaceId) {
  const dir = path.join(CLAUDE_DIR, 'plugins', 'marketplaces', marketplaceId);
  try {
    const s = fs.statSync(dir);
    const t = s.birthtime || s.ctime || s.mtime;
    return t ? t.toISOString() : null;
  } catch { return null; }
}

async function readAllData() {
  const installedRaw = safeReadJson(INSTALLED, { version: 2, plugins: {} });
  // plugins can be an array of IDs (old format) or an object {id: [...entries...]} (v2)
  const pluginIds = Array.isArray(installedRaw.plugins)
    ? installedRaw.plugins
    : Object.keys(installedRaw.plugins || {});

  const blocklist    = safeReadJson(BLOCKLIST,    { plugins: [] });
  const marketplaces = safeReadJson(MARKETPLACES, {});
  const catalogRaw   = safeReadJson(CATALOG,      { catalog: { plugins: {} } });
  const settings     = safeReadJson(SETTINGS,     {});
  const cacheDetails = scanCache();

  // v1.0.11 — Scope locale: scan progetti tracciati
  const appState = readState();
  const localData = scanLocalProjects(appState.trackedProjects || []);

  // Source of truth for enabled/disabled state is ~/.claude/settings.json
  // field 'enabledPlugins' (boolean per pluginId).
  // Legacy blocklist.json is kept for backward compat but not authoritative.
  const enabledMap = settings.enabledPlugins || {};
  const blockedFromSettings = pluginIds.filter(id => enabledMap[id] === false);
  const legacyBlocklist = (blocklist.plugins || []).map(b => b.plugin || b);
  // Merge: a plugin is blocked if explicitly false in settings OR in legacy blocklist
  const blockedSet = new Set([...blockedFromSettings, ...legacyBlocklist.filter(id => enabledMap[id] !== true)]);

  // Normalize marketplace source to simple repo path + count plugin
  // dichiarati nel marketplace.json (per distinguere da "installati"
  // che e' solo m.plugins.length nel renderer).
  const marketplacesNorm = {};
  for (const [id, cfg] of Object.entries(marketplaces)) {
    marketplacesNorm[id] = {
      ...cfg,
      _repo: extractRepoPath(cfg.source),
      _availableCount: readMarketplacePluginCount(id),
      _addedAt: readMarketplaceAddedAt(id),
    };
  }

  // v1.0.87 — Hook deps availability: raccoglie l'union di tutti i tool CLI
  // richiesti dagli hook di TUTTI i plugin installati + verifica con
  // `which`/`where` quali sono presenti nel PATH. Risultato cachato in memoria
  // dentro HOOK_DEPS, quindi 1 spawn per tool per session. Renderer usa questa
  // mappa per pittare badge ⚠ sulle card hook con dipendenze mancanti.
  const allDeps = new Set();
  for (const id of Object.keys(cacheDetails)) {
    const ev = cacheDetails[id].hookEvents;
    if (Array.isArray(ev)) {
      const sub = HOOK_DEPS.collectAllDeps(ev);
      for (const d of sub) allDeps.add(d);
    }
  }
  const hookDepsAvailability = await HOOK_DEPS.checkAvailability(allDeps);

  return {
    installed:    { plugins: pluginIds },
    blocklist:    { plugins: Array.from(blockedSet).map(plugin => ({ plugin })) },
    marketplaces: marketplacesNorm,
    catalog:      catalogRaw.catalog || {},
    cacheDetails,
    hookDepsAvailability,
    trackedProjects: appState.trackedProjects || [],
    localData,
    claudeDir:    CLAUDE_DIR,
    claudeBin:    CLAUDE_BIN,
    platform:     process.platform,
    appVersion:   app.getVersion(),
  };
}

/* ── WINDOW ────────────────────────────────────────────────────────────── */

function createWindow() {
  // B5 — Persistenza window size/position dallo state precedente
  const savedState = readState();
  const winBounds = savedState.windowBounds || { width: 1280, height: 820 };

  mainWindow = new BrowserWindow({
    width:    winBounds.width  || 1280,
    height:   winBounds.height || 820,
    x:        winBounds.x,
    y:        winBounds.y,
    minWidth: 900,
    minHeight: 620,
    title: 'CLACOROO',
    icon: APP_ICON,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#0f0f1a',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,    // A1 — già attivo
      nodeIntegration:  false,   // A1 — già attivo
      sandbox:          true,    // A1 — sandbox renderer process
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // A2 — Blocca window.open / new tab: ogni link http esterno apre nel browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // A3 — Blocca navigazioni esterne: la SPA non deve navigare, link esterni
  // vanno aperti nel browser di sistema
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url === mainWindow.webContents.getURL()) return;
    e.preventDefault();
    if (/^https?:/.test(url)) shell.openExternal(url);
  });

  // B5 — Salva bounds al close (debounced)
  let saveTimer = null;
  const saveBounds = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        writeState({ windowBounds: mainWindow.getBounds() });
      }
    }, 500);
  };
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move',   saveBounds);

  // Reload UI when config files change. fs.watchFile (polling) is used instead
  // of fs.watch because atomic-save tools (Claude Code CLI, VS Code, ecc.)
  // do rename+replace which breaks fs.watch on macOS; polling at 1s is robust
  // and the cost is negligible (4 stat syscalls/sec).
  [INSTALLED, BLOCKLIST, MARKETPLACES, SETTINGS].forEach(f => {
    fs.watchFile(f, { interval: 1000 }, (curr, prev) => {
      if (curr.mtimeMs === prev.mtimeMs) return;
      STATS_CACHE = null;  // ogni cambio config impatta contextBreakdown/stats
      MCP_CACHE   = null;  // plugin abilitati cambiano → set server MCP cambia
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('config-changed');
      }
    });
  });

  // v1.0.11 — watch tracked projects al boot
  const trackedNow = readState().trackedProjects || [];
  trackedNow.forEach(watchTrackedProject);
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';
  // macOS Dock icon (override default Electron in dev; in production the
  // .icns already provides the icon, but setIcon ensures consistency)
  if (process.platform === 'darwin' && app.dock && fs.existsSync(APP_ICON)) {
    app.dock.setIcon(APP_ICON);
  }
  setupAboutPanel();
  createWindow();
  buildAppMenu(mainWindow);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      buildAppMenu(mainWindow);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// v1.0.11 — Cleanup watcher su quit per terminare pulito il process
app.on('before-quit', () => {
  for (const f of TRACKED_WATCHERS.keys()) {
    try { fs.unwatchFile(f); } catch {}
  }
  TRACKED_WATCHERS.clear();
});

/* ── IPC HANDLERS ──────────────────────────────────────────────────────── */

ipcMain.handle('get-data', async () => {
  try   { return { ok: true, data: await readAllData() }; }
  catch (e) { return { ok: false, error: e.message }; }
});

// v1.0.90 — Refresh forzato del cache delle hook deps. Invocato dal bottone
// "↻ Aggiorna" della topbar prima del get-data, così se l'utente ha appena
// installato/disinstalato un tool (es. Bun) vede subito il cambio sulle card
// senza dover riavviare CLACOROO.
ipcMain.handle('hooks:refresh-deps', async () => {
  HOOK_DEPS.clearCache();
  return { ok: true };
});

// v1.0.93 — Check on-demand di un singolo tool. Usato dal renderer per il
// polling post-install: dopo che l'utente lancia `bun install`, polla ogni
// 5s questo IPC fino a quando installed=true, poi ricarica UI automaticamente.
// invalidateOne forza un fresh check ignorando il TTL del cache.
ipcMain.handle('hooks:check-tool', async (_e, { tool } = {}) => {
  if (typeof tool !== 'string' || !tool) return { ok: false, error: 'tool invalido' };
  HOOK_DEPS.invalidateOne(tool);
  const result = await HOOK_DEPS.checkAvailabilityOne(tool);
  return { ok: true, installed: !!result.installed, path: result.path || null };
});

// v1.0.103 — Pack G v2 chiusura completa: View tools tramite mini-client
// JSON-RPC (vedi src/lib/mcpClient.js). Scope: server stdio plugin-managed
// (declarations da .mcp.json del plugin). HTTP/SSE e claude.ai builtin
// richiedono OAuth → ritorna errore con messaggio chiaro per il renderer.
ipcMain.handle('mcp:list-tools', async (_e, { serverId } = {}) => {
  if (typeof serverId !== 'string' || !serverId) {
    return { ok: false, error: 'serverId invalido' };
  }
  if (serverId.startsWith('claude.ai ')) {
    return {
      ok: false,
      error: 'I server MCP integrati di claude.ai (Drive/Gmail/Calendar) usano OAuth gestito server-side. CLACOROO non può interrogarli direttamente — usa `/mcp` dentro `claude` per vedere i tools esposti.',
      reason: 'oauth-required',
    };
  }
  // Cerca la declaration corrispondente
  const decls = MCP.readPluginMcpDeclarations();
  const cfg = decls.find(d => d.id === serverId);
  if (!cfg) {
    return {
      ok: false,
      error: 'Server "' + serverId + '" non trovato fra le declarations dei plugin. Per server user-added la feature non è ancora supportata (in arrivo).',
      reason: 'not-found',
    };
  }
  if (cfg.type !== 'stdio') {
    return {
      ok: false,
      error: 'Server di transport "' + cfg.type + '" non supportato in questa versione (solo stdio). I server HTTP/SSE richiedono OAuth gestito da Claude Code: usa `/mcp` dentro `claude` per vedere i tools.',
      reason: 'http-not-supported',
    };
  }
  const result = await MCP_CLIENT.listToolsStdio({
    command: cfg.command,
    args: cfg.args || [],
    env: cfg.env || {},
  });
  return result;
});

// v1.0.94 — Pack G v2 azioni mutate (chiusura backlog):
//
//   mcp:remove   → `claude mcp remove <name>` per rimuovere user-added MCP
//   mcp:add      → `claude mcp add [opts] <name> <commandOrUrl> [args...]`
//
// Validazione nome MCP: identico pattern di validPluginId (alfanumerico +
// `_`, `-`, `.`). Niente shell injection perché passiamo args come array.
function validMcpName(s) {
  return typeof s === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(s);
}

ipcMain.handle('mcp:remove', async (_e, { name } = {}) => {
  if (!validMcpName(name)) return { success: false, error: 'Nome MCP non valido.' };
  const r = await runClaudeArgs(['mcp', 'remove', name]);
  if (r.success) { MCP_CACHE = null; MCP_CACHE_AT = 0; }
  // v1.0.100 — log azione
  appendActivity({ kind: 'mcp', action: 'remove', target: name, success: !!r.success, error: r.error || undefined });
  return r;
});

// v1.0.104 — Disable/Enable singolo MCP user-added.
// Pattern: salva config in state.json prima del remove (so possiamo re-add
// quando user clicca "Abilita"). Funziona SOLO per server user-added
// (presenti in ~/.claude.json). NON funziona per plugin-managed (vengono
// dal .mcp.json del plugin, fuori dal nostro controllo) né per claude.ai
// builtin (gestiti dal cloud).
ipcMain.handle('mcp:disable', async (_e, { name } = {}) => {
  if (!validMcpName(name)) return { success: false, error: 'Nome MCP non valido.' };
  // Cerca la config user/local del server
  const found = MCP.readUserMcpConfig(name);
  if (!found) {
    return {
      success: false,
      error: 'Server "' + name + '" non è user-added (non trovato in ~/.claude.json). Disable funziona solo su server aggiunti via `claude mcp add` o dal pulsante "+ MCP" di CLACOROO.',
    };
  }
  // Salva backup config in state.json
  const state = readState();
  const disabled = state.disabledMcpServers || {};
  disabled[name] = { ...found, disabledAt: new Date().toISOString() };
  writeState({ ...state, disabledMcpServers: disabled });
  // Esegui remove
  const removeArgs = ['mcp', 'remove', name];
  if (found.scope === 'user') removeArgs.push('-s', 'user');
  const r = await runClaudeArgs(removeArgs);
  if (r.success) { MCP_CACHE = null; MCP_CACHE_AT = 0; }
  else {
    // Rollback: rimuovi il backup se la rimozione fallisce
    const s2 = readState();
    const d2 = s2.disabledMcpServers || {};
    delete d2[name];
    writeState({ ...s2, disabledMcpServers: d2 });
  }
  appendActivity({ kind: 'mcp', action: 'disable', target: name, success: !!r.success, error: r.error || undefined });
  return r;
});

ipcMain.handle('mcp:enable', async (_e, { name } = {}) => {
  if (!validMcpName(name)) return { success: false, error: 'Nome MCP non valido.' };
  const state = readState();
  const disabled = state.disabledMcpServers || {};
  const entry = disabled[name];
  if (!entry) {
    return { success: false, error: 'Server "' + name + '" non è nella lista dei disabilitati.' };
  }
  // Ricostruisci gli argomenti `claude mcp add` dalla config salvata
  const cfg = entry.config || {};
  const transport = cfg.type || (cfg.command ? 'stdio' : 'http');
  const target = cfg.url || cfg.command;
  if (!target) {
    return { success: false, error: 'Config backup malformata (manca url/command).' };
  }
  const cliArgs = ['mcp', 'add', '--transport', transport, '-s', entry.scope || 'user'];
  if (cfg.env && typeof cfg.env === 'object') {
    for (const [k, v] of Object.entries(cfg.env)) {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) cliArgs.push('-e', k + '=' + v);
    }
  }
  if (cfg.headers && typeof cfg.headers === 'object') {
    for (const [k, v] of Object.entries(cfg.headers)) {
      if (k && v) cliArgs.push('-H', k + ': ' + v);
    }
  }
  cliArgs.push(name, target);
  if (Array.isArray(cfg.args) && cfg.args.length) {
    cliArgs.push('--');
    for (const a of cfg.args) if (typeof a === 'string' && a) cliArgs.push(a);
  }
  const r = await runClaudeArgs(cliArgs);
  if (r.success) {
    // Rimuovi entry da disabledMcpServers
    const s2 = readState();
    const d2 = s2.disabledMcpServers || {};
    delete d2[name];
    writeState({ ...s2, disabledMcpServers: d2 });
    MCP_CACHE = null; MCP_CACHE_AT = 0;
  }
  appendActivity({ kind: 'mcp', action: 'enable', target: name, success: !!r.success, error: r.error || undefined });
  return r;
});

// v1.0.104 — Get list dei server disabled (per il merge in renderer)
ipcMain.handle('mcp:list-disabled', async () => {
  const state = readState();
  const disabled = state.disabledMcpServers || {};
  return {
    ok: true,
    servers: Object.entries(disabled).map(([name, entry]) => ({
      id:          name,
      displayName: name,
      scope:       'user',
      transport:   entry.config?.type || (entry.config?.command ? 'stdio' : 'http'),
      connection:  entry.config?.url || entry.config?.command || '',
      status:      'disabled',
      statusText:  'Disabilitato da CLACOROO',
      disabledAt:  entry.disabledAt || null,
    })),
  };
});

ipcMain.handle('mcp:add', async (_e, opts = {}) => {
  const { name, transport, target, args, envs, headers, scope } = opts;
  if (!validMcpName(name)) {
    return { success: false, error: 'Nome MCP non valido (alfanumerico + _ - . consentiti).' };
  }
  if (!['http', 'sse', 'stdio'].includes(transport)) {
    return { success: false, error: 'Transport non valido: deve essere http, sse o stdio.' };
  }
  if (typeof target !== 'string' || !target.trim()) {
    return { success: false, error: 'Manca URL o comando del server.' };
  }
  const cliArgs = ['mcp', 'add', '--transport', transport];
  if (scope && ['local', 'user', 'project'].includes(scope)) cliArgs.push('--scope', scope);
  // env vars: array di stringhe "KEY=VALUE"
  if (Array.isArray(envs)) {
    for (const e of envs) {
      if (typeof e === 'string' && /^[A-Za-z_][A-Za-z0-9_]*=/.test(e)) cliArgs.push('-e', e);
    }
  }
  // headers HTTP: array di stringhe "Header-Name: value"
  if (Array.isArray(headers)) {
    for (const h of headers) {
      if (typeof h === 'string' && h.includes(':')) cliArgs.push('-H', h);
    }
  }
  cliArgs.push(name, target);
  // extra args (per stdio command). Passati DOPO il target con `--` per separare.
  if (Array.isArray(args) && args.length) {
    cliArgs.push('--');
    for (const a of args) {
      if (typeof a === 'string' && a) cliArgs.push(a);
    }
  }
  const r = await runClaudeArgs(cliArgs);
  if (r.success) { MCP_CACHE = null; MCP_CACHE_AT = 0; }
  // v1.0.100 — log azione (include transport per chiarezza)
  appendActivity({ kind: 'mcp', action: 'add', target: name + ' (' + transport + ')', success: !!r.success, error: r.error || undefined });
  return r;
});

ipcMain.handle('plugin-action', async (_e, { action, pluginId }) => {
  if (!validPluginId(pluginId)) return { success: false, error: 'ID plugin non valido.' };
  const result = await runClaudeArgs(['plugins', action, pluginId]);
  if (result.success) {
    STATS_CACHE = null;  // contextBreakdown dipende dai plugin abilitati
    MCP_CACHE   = null;  // i server MCP dichiarati dal plugin si attivano/disattivano
  }
  appendActivity({
    kind: 'plugin', action, target: pluginId,
    success: result.success, error: result.error,
  });
  return result;
});

ipcMain.handle('marketplace-action', async (_e, { action, name, source }) => {
  let result;
  if (action === 'add') {
    if (!validMarketplaceSource(source)) {
      return { success: false, error: 'Source marketplace non valido: usa "user/repo", URL https git o path locale (no spazi né caratteri shell).' };
    }
    result = await runClaudeArgs(['plugins', 'marketplace', 'add', source]);
  } else if (action === 'remove' || action === 'update') {
    if (!validMarketplaceName(name)) return { success: false, error: 'Nome marketplace non valido.' };
    result = await runClaudeArgs(['plugins', 'marketplace', action, name]);
  } else {
    return { success: false, error: 'Azione non riconosciuta.' };
  }
  appendActivity({
    kind: 'marketplace', action,
    target: action === 'add' ? source : name,
    success: result.success, error: result.error,
  });
  return result;
});

// v1.0.52 — Pack H step 2: legge il marketplace.json di un marketplace
// configurato per ottenere la lista COMPLETA dei plugin (anche quelli
// non ancora installati). m.plugins nello state contiene solo installati.
ipcMain.handle('get-marketplace-detail', async (_e, marketplaceName) => {
  if (!validMarketplaceName(marketplaceName)) {
    return { ok: false, error: 'Nome marketplace non valido' };
  }
  const dir = path.join(CLAUDE_DIR, 'plugins', 'marketplaces', marketplaceName);
  if (!fs.existsSync(dir)) return { ok: false, error: 'Marketplace non trovato in ' + dir };
  // Cerco marketplace.json in 2 posizioni standard
  const candidates = [
    path.join(dir, '.claude-plugin', 'marketplace.json'),
    path.join(dir, 'marketplace.json'),
  ];
  const fp = candidates.find(p => fs.existsSync(p));
  if (!fp) return { ok: false, error: 'marketplace.json non trovato' };
  try {
    const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const list = Array.isArray(raw.plugins) ? raw.plugins
               : raw.plugins && typeof raw.plugins === 'object' ? Object.values(raw.plugins)
               : [];
    return {
      ok: true,
      name:        raw.name || marketplaceName,
      description: raw.description || '',
      owner:       raw.owner || null,
      plugins:     list.map(p => ({
        name:        p.name || p.id || '',
        description: p.description || '',
        author:      p.author || null,
        category:    p.category || '',
        homepage:    p.homepage || '',
        source:      p.source || null,
      })),
    };
  } catch (e) {
    return { ok: false, error: 'Lettura marketplace.json fallita: ' + e.message };
  }
});

ipcMain.handle('get-activity-log', async () => readActivityLog());
ipcMain.handle('clear-activity-log', async () => clearActivityLog());

ipcMain.handle('get-changelog', async () => {
  const raw = readChangelogRaw();
  return raw ? parseChangelog(raw) : [];
});

// v1.0.12 — Sezione Stats (cache 60s per evitare IO ripetuto su tab change)
let STATS_CACHE = null;
let STATS_CACHE_AT = 0;
const STATS_TTL_MS = 60 * 1000;

ipcMain.handle('get-stats', async (_e, { force } = {}) => {
  if (!force && STATS_CACHE && Date.now() - STATS_CACHE_AT < STATS_TTL_MS) {
    return STATS_CACHE;
  }
  const cache = STATS.readStatsCache();
  const projects = STATS.listProjects();
  const projectTokens = {};
  for (const key of projects.slice(0, 20)) {
    projectTokens[key] = STATS.aggregateProjectTokens(key);
  }
  // Calcola blocklist effettiva (settings.enabledPlugins authoritative + legacy blocklist)
  const installedRaw = safeReadJson(INSTALLED, { plugins: {} });
  const pluginIds = Array.isArray(installedRaw.plugins) ? installedRaw.plugins : Object.keys(installedRaw.plugins || {});
  const settingsForCtx = safeReadJson(SETTINGS, {});
  const enabledMap = settingsForCtx.enabledPlugins || {};
  const blockedSet = new Set(pluginIds.filter(id => enabledMap[id] === false));

  // Count reale sessioni dai file .jsonl (più accurato di cache.totalSessions)
  const sessionsReal = {
    all: STATS.countRealSessions(),
    d30: STATS.countRealSessions(30),
    d7:  STATS.countRealSessions(7),
  };

  // Conteggio MCP per il context breakdown: usa MCP_CACHE se popolata
  // (l'utente ha già aperto la sezione MCP almeno una volta) per avere il
  // count "Connected" reale dal health-check. Altrimenti stima veloce.
  let mcpInfo;
  if (MCP_CACHE && MCP_CACHE.ok && Array.isArray(MCP_CACHE.servers)) {
    const connected = MCP_CACHE.servers.filter(s => s.status === 'connected').length;
    mcpInfo = { total: MCP_CACHE.servers.length, connected };
  } else {
    // Per la stima veloce escludiamo i plugin disabilitati dalle declarations
    mcpInfo = MCP.fastEstimate(blockedSet);
  }

  STATS_CACHE = {
    cache,
    streak: cache ? STATS.computeStreak(cache.dailyActivity) : 0,
    longestStreak: cache ? STATS.computeLongestStreak(cache.dailyActivity) : 0,
    peakHour: cache ? STATS.peakHour(cache.hourCounts) : null,
    favoriteModel: cache ? STATS.favoriteModel(cache.modelUsage) : null,
    totalTokens: cache ? STATS.totalTokensFromModelUsage(cache.modelUsage) : 0,
    totalMessages: cache?.totalMessages || (cache?.dailyActivity || []).reduce((s, e) => s + (e.messageCount || 0), 0),
    sessionsReal,
    cost: {
      total: cache ? PRICING.costFromModelUsage(cache.modelUsage) : 0,
      d30:   cache ? PRICING.costForRange(cache.modelUsage, cache.dailyActivity, 30) : 0,
      d7:    cache ? PRICING.costForRange(cache.modelUsage, cache.dailyActivity, 7)  : 0,
      perModel: cache ? Object.fromEntries(
        Object.entries(cache.modelUsage || {}).map(([m, u]) => [m, PRICING.costForUsage(m, u)])
      ) : {},
    },
    contextBreakdown: STATS.computeContextBreakdown(CLAUDE_DIR, blockedSet, mcpInfo),
    projects: projects.slice(0, 20).map(key => {
      const t = projectTokens[key] || {};
      // path: usa cwd reale dal JSONL se disponibile (più accurato del decode ambiguo
      // della chiave dir). Fallback: la chiave grezza (utente la riconosce).
      return {
        key, path: t.cwd || key,
        sessions: t.sessions || 0,
        messages: t.messages || 0,
        totalTokens: t.totalTokens || 0,
      };
    }),
    settings: safeReadJson(SETTINGS, {}),
  };
  STATS_CACHE_AT = Date.now();
  return STATS_CACHE;
});

// v1.0.21 — Pack G: MCP server (lista + stato). Cache 30s perché
// `claude mcp list` esegue health-check live, può essere lento (2-5s).
let MCP_CACHE = null;
let MCP_CACHE_AT = 0;
const MCP_TTL_MS = 30 * 1000;

ipcMain.handle('get-mcp', async (_e, { force } = {}) => {
  if (!force && MCP_CACHE && Date.now() - MCP_CACHE_AT < MCP_TTL_MS) {
    return MCP_CACHE;
  }
  const list = await MCP.runMcpList(CLAUDE_BIN);
  const declarations = MCP.readPluginMcpDeclarations();
  // v1.0.85 — Pack G v2: arricchisci ogni server con reconnect info per il
  // tipo di azione di riconnessione consigliata (claude.ai OAuth / HTTP OAuth /
  // stdio wrapper). Renderer la usa per pittare bottoni contestuali sulle card.
  const serversEnriched = (list.servers || []).map(srv => ({
    ...srv,
    reconnect: MCP.detectReconnectType(srv),
  }));
  MCP_CACHE = {
    ok: list.ok,
    error: list.error || null,
    servers: serversEnriched,
    declarations,  // utili per arricchire (marketplace name, args, ecc.)
    fetchedAt: Date.now(),
  };
  MCP_CACHE_AT = Date.now();
  return MCP_CACHE;
});

// v1.0.85 — Pack G v2: cancella entry di un MCP da mcp-needs-auth-cache.json.
// Operazione safe: NON tocca i token reali (che vivono nel keychain Claude
// Code o lato server claude.ai), solo il cache locale. Al prossimo `claude
// mcp list` il cache si ripopola in base allo stato server-side reale.
ipcMain.handle('mcp:clear-auth-cache', async (_e, { serverId } = {}) => {
  if (typeof serverId !== 'string' || !serverId) {
    return { ok: false, error: 'serverId invalido' };
  }
  const result = MCP.clearAuthCacheEntry(serverId);
  if (result.ok) {
    MCP_CACHE = null; MCP_CACHE_AT = 0;  // invalida cache renderer
    // v1.0.100 — log azione per Recenti
    appendActivity({ kind: 'mcp', action: 'clear-auth-cache', target: serverId, success: true });
  }
  return result;
});

// v1.0.27 — Pack A: account/auth (Claude Max plan). Cache 5min: i dati
// (email, org, plan) cambiano raramente, evitiamo di rilanciare `claude auth status`
// ad ogni apertura della sezione Impostazioni.
let ACCOUNT_CACHE = null;
let ACCOUNT_CACHE_AT = 0;
const ACCOUNT_TTL_MS = 5 * 60 * 1000;

ipcMain.handle('get-account', async (_e, { force } = {}) => {
  if (!force && ACCOUNT_CACHE && Date.now() - ACCOUNT_CACHE_AT < ACCOUNT_TTL_MS) {
    return ACCOUNT_CACHE;
  }
  ACCOUNT_CACHE = await ACCOUNT.getAuthStatus(CLAUDE_BIN);
  ACCOUNT_CACHE_AT = Date.now();
  return ACCOUNT_CACHE;
});

// v1.0.35 — Pack A v2: usage live (Session/Weekly/Weekly Sonnet) via
// endpoint privato Anthropic /api/oauth/usage. Stessa rotta usata dal
// plugin VS Code. Cache 60s: i dati cambiano lentamente (utilization
// si aggiorna ogni manciata di minuti lato server), evitiamo round-trip
// keychain + HTTP ad ogni cambio sezione.
let USAGE_CACHE = null;
let USAGE_CACHE_AT = 0;
const USAGE_TTL_MS = 60 * 1000;

ipcMain.handle('get-usage', async (_e, { force } = {}) => {
  if (!force && USAGE_CACHE && Date.now() - USAGE_CACHE_AT < USAGE_TTL_MS) {
    return USAGE_CACHE;
  }
  USAGE_CACHE = await USAGE.getUsage();
  USAGE_CACHE_AT = Date.now();
  return USAGE_CACHE;
});

ipcMain.handle('account-logout', async () => {
  const r = await ACCOUNT.logout(CLAUDE_BIN);
  if (r.ok) {
    ACCOUNT_CACHE = null;
    appendActivity({ kind: 'account', action: 'logout', target: 'claude', success: true });
  } else {
    appendActivity({ kind: 'account', action: 'logout', target: 'claude', success: false, error: r.error });
  }
  return r;
});

ipcMain.handle('update-settings', async (_e, patch) => {
  if (typeof patch !== 'object' || patch === null) {
    return { success: false, error: 'Patch non valido.' };
  }
  try {
    const current = safeReadJson(SETTINGS, {});
    const next = { ...current, ...patch };
    fs.writeFileSync(SETTINGS, JSON.stringify(next, null, 2), 'utf8');
    STATS_CACHE = null;  // invalida cache server-side (settings cambiati)
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-state', async () => readState());

ipcMain.handle('set-state', async (_e, patch) => {
  if (typeof patch !== 'object' || patch === null) return { success: false, error: 'Patch non valido.' };
  return { success: writeState(patch) };
});

// v1.0.09 — Soft auto-update: cooldown 1h su success, 10min su failure (retry più rapido)
const UPDATE_COOLDOWN_OK_MS   = 60 * 60 * 1000;
const UPDATE_COOLDOWN_FAIL_MS = 10 * 60 * 1000;
ipcMain.handle('check-updates', async (_e, { force } = {}) => {
  const st = readState();
  if (!force && st.updateCheckDisabled) return { ok: true, skipped: true, reason: 'disabled' };
  const lastTs = st.lastUpdateCheck || 0;
  const lastFailTs = st.lastUpdateFailedAt || 0;
  const since = Date.now() - Math.max(lastTs, lastFailTs);
  const cooldown = lastFailTs > lastTs ? UPDATE_COOLDOWN_FAIL_MS : UPDATE_COOLDOWN_OK_MS;
  // v1.0.64 — Invalida cache se l'app è stata aggiornata fra il check precedente
  // e questo avvio: la `current` cached non corrisponde più alla versione reale.
  const cached = st.lastUpdateResult || null;
  const cacheStale = cached && cached.current && cached.current !== app.getVersion();
  if (!force && !cacheStale && since < cooldown) {
    return { ok: true, skipped: true, reason: 'cooldown', cached };
  }
  const result = await checkLatestRelease(app.getVersion());
  if (result.ok) {
    writeState({ lastUpdateCheck: Date.now(), lastUpdateResult: result, lastUpdateFailedAt: 0 });
  } else {
    writeState({ lastUpdateFailedAt: Date.now() });
  }
  return result;
});

// v1.0.67 — Pack B: Terminale integrato (xterm.js + node-pty)
// I dati pty fluiscono dal main al renderer come eventi 'pty:data:<id>'.
// L'input renderer→main passa via 'pty:input' (one-way send, niente attesa).
ipcMain.handle('pty:capabilities', async () => ({
  available: PTY.isAvailable(),
  loadError: PTY.getLoadError(),
  defaultShell: PTY.isAvailable() ? PTY.defaultShell() : null,
  defaultCwd: PTY.defaultCwd(),
  platform: process.platform,
  // v1.0.75 — lista shell candidate per il selettore in Impostazioni
  availableShells: PTY.isAvailable() ? PTY.listShells() : [],
  preferredShell: (readState() || {}).preferredShell || null,
}));

ipcMain.handle('pty:spawn', async (_e, opts = {}) => {
  if (!PTY.isAvailable()) return { success: false, error: 'Terminale non disponibile su questa piattaforma' };
  try {
    const info = PTY.spawn(opts);
    PTY.setHandlers(info.id, {
      onData: (chunk) => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('pty:data', { id: info.id, chunk }); },
      onExit: (exit)  => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('pty:exit', { id: info.id, ...exit }); },
    });
    return { success: true, info };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.on('pty:input', (_e, { id, data }) => {
  if (typeof id !== 'string') return;
  PTY.write(id, data);
});

ipcMain.handle('pty:resize', async (_e, { id, cols, rows }) => {
  return { success: PTY.resize(id, cols, rows) };
});

ipcMain.handle('pty:kill', async (_e, { id }) => {
  return { success: PTY.kill(id) };
});

ipcMain.handle('pty:list', async () => PTY.list());

ipcMain.handle('pty:cwd', async (_e, { id }) => ({ cwd: PTY.getCwd(id) }));

app.on('before-quit', () => PTY.killAll());

ipcMain.handle('apikey:status',      async ()       => APIKEY.status());
ipcMain.handle('apikey:test',        async (_e, k)  => APIKEY.testConnection(k));
ipcMain.handle('apikey:testStored',  async ()       => APIKEY.testStored());
ipcMain.handle('apikey:activate',    async (_e, k)  => APIKEY.activate(k));
ipcMain.handle('apikey:deactivate',  async ()       => APIKEY.deactivate());
ipcMain.handle('apikey:reconfigure', async ()       => APIKEY.reconfigure());

// B4 — Notifiche native (mostrate solo se l'app non è in focus)
ipcMain.handle('show-notification', async (_e, { title, body }) => {
  if (!Notification.isSupported()) return { success: false };
  if (mainWindow?.isFocused()) return { success: false, reason: 'focused' };
  new Notification({ title: title || 'CLACOROO', body: body || '', silent: false }).show();
  return { success: true };
});

/* ── SNAPSHOT EXPORT / IMPORT (idea #5) ───────────────────────────────── */

function currentSnapshot() {
  return buildSnapshot({
    installedRaw: safeReadJson(INSTALLED,    { version: 2, plugins: {} }),
    blocklist:    safeReadJson(BLOCKLIST,    { plugins: [] }),
    marketplaces: safeReadJson(MARKETPLACES, {}),
    fromVersion:  app.getVersion(),
  });
}

ipcMain.handle('export-snapshot', async () => {
  const r = await dialog.showSaveDialog(mainWindow, {
    title: 'Esporta snapshot CLACOROO',
    defaultPath: 'clacoroo-' + new Date().toISOString().slice(0, 10) + '.clacoroo',
    filters: [{ name: 'CLACOROO snapshot', extensions: ['clacoroo', 'json'] }],
  });
  if (r.canceled || !r.filePath) return { success: false, error: 'Annullato' };
  try {
    fs.writeFileSync(r.filePath, JSON.stringify(currentSnapshot(), null, 2), 'utf8');
    return { success: true, path: r.filePath };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('import-snapshot', async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title: 'Importa snapshot CLACOROO',
    properties: ['openFile'],
    filters: [{ name: 'CLACOROO snapshot', extensions: ['clacoroo', 'json'] }],
  });
  if (r.canceled || !r.filePaths.length) return { success: false, error: 'Annullato' };
  const snap = safeReadJson(r.filePaths[0], null);
  if (!snap || snap.format !== 'clacoroo-snapshot') {
    return { success: false, error: 'File non riconosciuto come snapshot CLACOROO.' };
  }
  if (snap.version !== 1) {
    return { success: false, error: 'Versione snapshot non supportata: ' + snap.version };
  }
  return { success: true, preview: { ...diffSnapshot(currentSnapshot(), snap), snap } };
});

ipcMain.handle('apply-snapshot', async (_e, { mktToAdd, pluginsToInstall, snap }) => {
  const log = [];
  for (const [id, cfg] of (mktToAdd || [])) {
    if (!validMarketplaceName(id)) {
      log.push({ kind: 'marketplace', id, success: false, error: 'Nome marketplace non valido' });
      continue;
    }
    const src = extractRepoPath(cfg?.source) || cfg?.source?.url;
    if (!src) { log.push({ kind: 'marketplace', id, success: false, error: 'source mancante' }); continue; }
    const r = await runClaudeArgs(['plugins', 'marketplace', 'add', src]);
    log.push({ kind: 'marketplace', id, ...r });
  }
  for (const pluginId of (pluginsToInstall || [])) {
    if (!validPluginId(pluginId)) {
      log.push({ kind: 'plugin', id: pluginId, success: false, error: 'ID non valido' });
      continue;
    }
    const r = await runClaudeArgs(['plugins', 'install', pluginId]);
    log.push({ kind: 'plugin', id: pluginId, ...r });
  }
  // Apply blocklist from snapshot — disable plugins that were disabled at export time
  for (const blockedId of (snap?.blocklist || [])) {
    if (!validPluginId(blockedId)) continue;
    const r = await runClaudeArgs(['plugins', 'disable', blockedId]);
    log.push({ kind: 'plugin', id: blockedId, action: 'disable', ...r });
  }
  appendActivity({
    kind: 'snapshot', action: 'apply',
    target: 'mkt:' + (mktToAdd?.length || 0) + '/plugins:' + (pluginsToInstall?.length || 0) + '/blocked:' + (snap?.blocklist?.length || 0),
    success: log.every(l => l.success), error: log.filter(l => !l.success).map(l => l.id).join(',') || undefined,
  });
  return { success: log.every(l => l.success), log };
});

// v1.0.11 — Tracked projects (scope locale/globale)
ipcMain.handle('add-tracked-project', async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Aggiungi progetto da tracciare',
    message: 'Seleziona la cartella root del progetto (deve contenere .claude/ per essere utile)',
  });
  if (r.canceled || !r.filePaths.length) return { success: false, error: 'Annullato' };
  const projectPath = r.filePaths[0];
  const st = readState();
  const list = Array.isArray(st.trackedProjects) ? st.trackedProjects : [];
  if (list.includes(projectPath)) return { success: false, error: 'Progetto già tracciato' };
  list.push(projectPath);
  writeState({ trackedProjects: list });
  watchTrackedProject(projectPath);
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('config-changed');
  return { success: true, path: projectPath };
});

ipcMain.handle('remove-tracked-project', async (_e, projectPath) => {
  const st = readState();
  const list = (Array.isArray(st.trackedProjects) ? st.trackedProjects : []).filter(p => p !== projectPath);
  writeState({ trackedProjects: list });
  unwatchTrackedProject(projectPath);
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('config-changed');
  return { success: true };
});

// Watcher dinamici per progetti tracciati
const TRACKED_WATCHERS = new Map();
function watchTrackedProject(projectPath) {
  const f = path.join(projectPath, '.claude', 'plugins', 'installed_plugins.json');
  if (TRACKED_WATCHERS.has(f)) return;
  fs.watchFile(f, { interval: 2000 }, (curr, prev) => {
    if (curr.mtimeMs === prev.mtimeMs) return;
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('config-changed');
  });
  TRACKED_WATCHERS.set(f, true);
}
function unwatchTrackedProject(projectPath) {
  const f = path.join(projectPath, '.claude', 'plugins', 'installed_plugins.json');
  if (TRACKED_WATCHERS.has(f)) {
    fs.unwatchFile(f);
    TRACKED_WATCHERS.delete(f);
  }
}

ipcMain.handle('pick-directory', async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleziona cartella plugin',
  });
  if (r.canceled || !r.filePaths.length) return null;
  return r.filePaths[0];
});

ipcMain.handle('validate-plugin', async (_e, pluginPath) => {
  if (typeof pluginPath !== 'string' || !fs.existsSync(pluginPath)) {
    return { success: false, error: 'Path non valido o inesistente.' };
  }
  if (!fs.statSync(pluginPath).isDirectory()) {
    return { success: false, error: 'Il path deve essere una cartella, non un file.' };
  }
  const result = await runClaudeArgs(['plugins', 'validate', pluginPath]);
  appendActivity({
    kind: 'dev', action: 'validate', target: pluginPath,
    success: result.success, error: result.error,
  });
  return result;
});

ipcMain.handle('confirm-dialog', async (_e, { title, message, detail, buttons }) => {
  const r = await dialog.showMessageBox(mainWindow, {
    type:      'warning',
    buttons:   buttons || ['Annulla', 'Conferma'],
    defaultId: 0,
    cancelId:  0,
    title,
    message,
    detail: detail || '',
  });
  return r.response;
});

ipcMain.handle('open-external', async (_e, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('set-claude-bin', async (_e, binPath) => {
  if (!fs.existsSync(binPath)) return { success: false, error: 'File non trovato.' };
  CLAUDE_BIN = binPath;
  return { success: true };
});

/* ── PLUGIN PATH RESOLUTION ────────────────────────────────────────────── */

function resolvePluginPath(fullId) {
  if (!validPluginId(fullId)) return null;
  return LAST_CACHE[fullId]?.path || null;
}

ipcMain.handle('open-plugin-path', async (_e, fullId) => {
  const p = resolvePluginPath(fullId);
  if (!p) return { success: false, error: 'Path plugin non trovato.' };
  const err = await shell.openPath(p);
  if (err) return { success: false, error: err };
  return { success: true };
});

// v1.0.11 — Apre una directory arbitraria (usata per tracked projects)
ipcMain.handle('open-directory', async (_e, dirPath) => {
  if (typeof dirPath !== 'string' || !fs.existsSync(dirPath)) {
    return { success: false, error: 'Path non valido' };
  }
  const err = await shell.openPath(dirPath);
  return err ? { success: false, error: err } : { success: true };
});

// v1.0.59 — Normalizza un path assoluto in formato URI per gli URL handler
// degli editor cross-platform. Su Windows: 'C:\\Users\\foo' → '/C:/Users/foo'.
// Su macOS/Linux: invariato (già POSIX-style con leading /).
function toEditorUriPath(p) {
  if (process.platform === 'win32') {
    return '/' + p.replace(/\\/g, '/');
  }
  return p;
}

ipcMain.handle('open-in-editor', async (_e, fullId) => {
  const p = resolvePluginPath(fullId);
  if (!p) return { success: false, error: 'Path plugin non trovato.' };
  const st = readState();
  const editor = st.preferredEditor || 'vscode';
  const uriPath = encodeURI(toEditorUriPath(p));
  try {
    if (editor === 'system') {
      // shell.openPath e' cross-platform: Finder su macOS, Explorer su Win,
      // file manager registrato su Linux (Nautilus, Dolphin, ecc.)
      const err = await shell.openPath(p);
      return err ? { success: false, error: err } : { success: true };
    }
    // URL schemes registrati dagli installer degli editor su tutte le piattaforme:
    // macOS via LSApplicationURLTypes, Win via Registry HKEY_CLASSES_ROOT,
    // Linux via xdg-mime / .desktop x-scheme-handler.
    const schemas = {
      vscode:      'vscode://file'      + uriPath,
      cursor:      'cursor://file'      + uriPath,
      antigravity: 'antigravity://file' + uriPath,
    };
    const url = schemas[editor];
    if (!url) return { success: false, error: 'Editor non riconosciuto: ' + editor };
    await shell.openExternal(url);
    return { success: true };
  } catch (e) {
    const label = ({
      vscode: 'VS Code', cursor: 'Cursor', antigravity: 'Antigravity', system: 'editor di sistema',
    })[editor] || editor;
    const platHint = process.platform === 'darwin'  ? 'Verifica che ' + label + ' sia installato in /Applications.'
                   : process.platform === 'win32'   ? 'Verifica che ' + label + ' sia installato e che il protocollo URL sia registrato (di solito automatico via installer).'
                   :                                  'Su Linux verifica `xdg-mime query default x-scheme-handler/<schema>` se il protocollo non è registrato.';
    return { success: false, error: (e.message || (label + ' non disponibile.')) + ' ' + platHint };
  }
});

ipcMain.handle('read-markdown-file', async (_e, { fullId, kind, name }) => {
  const root = resolvePluginPath(fullId);
  if (!root) return { success: false, error: 'Path plugin non trovato.' };
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) return { success: false, error: 'Nome non valido.' };
  let filePath;
  if (kind === 'skill')      filePath = path.join(root, 'skills', name, 'SKILL.md');
  else if (kind === 'agent') filePath = path.join(root, 'agents', name + '.md');
  else return { success: false, error: 'Tipo non riconosciuto.' };
  if (!fs.existsSync(filePath)) return { success: false, error: 'File non trovato.' };
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (e) { return { success: false, error: e.message }; }
});

// v1.0.99 — Editor inline file .md skill/agent: scrive il nuovo contenuto sul
// file nella cache del plugin. ATTENZIONE: queste modifiche locali verranno
// sovrascritte al prossimo `claude plugins update <plugin>`. Per fix permanente
// l'utente deve aprire PR/issue sul repo del plugin. Il warning è mostrato
// nella UI sopra l'editor.
//
// Validazione paranoid: rifiuta path che non sono dentro la directory cache
// del plugin (no escape, no symlink follow). Validate kind/name regex.
ipcMain.handle('write-markdown-file', async (_e, { fullId, kind, name, content }) => {
  const root = resolvePluginPath(fullId);
  if (!root) return { success: false, error: 'Path plugin non trovato.' };
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) return { success: false, error: 'Nome non valido.' };
  if (typeof content !== 'string') return { success: false, error: 'Contenuto non valido (richiesta string).' };
  // Limite hardcoded per sanity: nessun file .md skill/agent dovrebbe superare 500KB
  if (content.length > 500 * 1024) return { success: false, error: 'File troppo grande (max 500KB).' };
  let filePath;
  if (kind === 'skill')      filePath = path.join(root, 'skills', name, 'SKILL.md');
  else if (kind === 'agent') filePath = path.join(root, 'agents', name + '.md');
  else return { success: false, error: 'Tipo non riconosciuto.' };
  // Verifica che il path finale sia effettivamente dentro root (paranoia su edge cases)
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(root) + path.sep)) {
    return { success: false, error: 'Path fuori dalla directory plugin.' };
  }
  // Il file deve esistere già (non creiamo file nuovi — esiste già lo skill/agent
  // a livello del plugin; stiamo solo aggiornandone il contenuto del manifest)
  if (!fs.existsSync(resolved)) return { success: false, error: 'File non trovato.' };
  try {
    fs.writeFileSync(resolved, content, 'utf8');
    // v1.0.100 — log nell'activity log per visibilità in sidebar Recenti
    appendActivity({ kind: kind, action: 'edit', target: name + ' (' + fullId + ')', success: true });
    return { success: true };
  } catch (e) {
    appendActivity({ kind: kind, action: 'edit', target: name + ' (' + fullId + ')', success: false, error: e.message });
    return { success: false, error: e.message };
  }
});
