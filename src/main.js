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
const ACCOUNT = require('./lib/account');
const PRICING = require('./lib/pricing');
const USAGE   = require('./lib/usage');

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

      const key = `${pluginName}@${mkt}`;
      details[key] = {
        name:        meta.name        || pluginName,
        description: meta.description || '',
        version:     meta.version     || ver,
        author:      meta.author      || '',
        path:        root,
        skills,
        agents,
        skillHealth,
        agentHealth,
        hasMcp:   mcpPaths.some(p => fs.existsSync(p)),
        hasHooks: fs.existsSync(hooksDir) && fs.readdirSync(hooksDir).length > 0,
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

function readAllData() {
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
    };
  }

  return {
    installed:    { plugins: pluginIds },
    blocklist:    { plugins: Array.from(blockedSet).map(plugin => ({ plugin })) },
    marketplaces: marketplacesNorm,
    catalog:      catalogRaw.catalog || {},
    cacheDetails,
    trackedProjects: appState.trackedProjects || [],
    localData,
    claudeDir:    CLAUDE_DIR,
    claudeBin:    CLAUDE_BIN,
    platform:     process.platform,
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
  try   { return { ok: true, data: readAllData() }; }
  catch (e) { return { ok: false, error: e.message }; }
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
  MCP_CACHE = {
    ok: list.ok,
    error: list.error || null,
    servers: list.servers,
    declarations,  // utili per arricchire (marketplace name, args, ecc.)
    fetchedAt: Date.now(),
  };
  MCP_CACHE_AT = Date.now();
  return MCP_CACHE;
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
  if (!force && since < cooldown) {
    return { ok: true, skipped: true, reason: 'cooldown', cached: st.lastUpdateResult || null };
  }
  const result = await checkLatestRelease(app.getVersion());
  if (result.ok) {
    writeState({ lastUpdateCheck: Date.now(), lastUpdateResult: result, lastUpdateFailedAt: 0 });
  } else {
    writeState({ lastUpdateFailedAt: Date.now() });
  }
  return result;
});

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

ipcMain.handle('open-in-editor', async (_e, fullId) => {
  const p = resolvePluginPath(fullId);
  if (!p) return { success: false, error: 'Path plugin non trovato.' };
  try {
    await shell.openExternal('vscode://file' + encodeURI(p));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || 'VS Code non disponibile.' };
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
