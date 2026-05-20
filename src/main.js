'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { execFile, execFileSync } = require('child_process');

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

/* ── ACTIVITY LOG ──────────────────────────────────────────────────────── */

const STATE_DIR     = path.join(os.homedir(), '.claude-control-room');
const ACTIVITY_LOG  = path.join(STATE_DIR, 'activity-log.json');
const ACTIVITY_MAX  = 50;

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function appendActivity(entry) {
  try {
    ensureStateDir();
    const log = safeReadJson(ACTIVITY_LOG, []);
    log.unshift({ timestamp: Date.now(), ...entry });
    fs.writeFileSync(ACTIVITY_LOG, JSON.stringify(log.slice(0, ACTIVITY_MAX), null, 2), 'utf8');
  } catch { /* fail silently — activity log is non-critical */ }
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

      const key = `${pluginName}@${mkt}`;
      details[key] = {
        name:        meta.name        || pluginName,
        description: meta.description || '',
        version:     meta.version     || ver,
        author:      meta.author      || '',
        path:        root,
        skills,
        agents,
        hasMcp:   mcpPaths.some(p => fs.existsSync(p)),
        hasHooks: fs.existsSync(hooksDir) && fs.readdirSync(hooksDir).length > 0,
      };
    }
  }
  LAST_CACHE = details;
  return details;
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

function readAllData() {
  const installedRaw = safeReadJson(INSTALLED, { version: 2, plugins: {} });
  // plugins can be an array of IDs (old format) or an object {id: [...entries...]} (v2)
  const pluginIds = Array.isArray(installedRaw.plugins)
    ? installedRaw.plugins
    : Object.keys(installedRaw.plugins || {});

  const blocklist    = safeReadJson(BLOCKLIST,    { plugins: [] });
  const marketplaces = safeReadJson(MARKETPLACES, {});
  const catalogRaw   = safeReadJson(CATALOG,      { catalog: { plugins: {} } });
  const cacheDetails = scanCache();

  // Normalize marketplace source to simple repo path
  const marketplacesNorm = {};
  for (const [id, cfg] of Object.entries(marketplaces)) {
    marketplacesNorm[id] = { ...cfg, _repo: extractRepoPath(cfg.source) };
  }

  return {
    installed:    { plugins: pluginIds },
    blocklist,
    marketplaces: marketplacesNorm,
    catalog:      catalogRaw.catalog || {},
    cacheDetails,
    claudeDir:    CLAUDE_DIR,
    claudeBin:    CLAUDE_BIN,
    platform:     process.platform,
  };
}

/* ── WINDOW ────────────────────────────────────────────────────────────── */

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:    1280,
    height:   820,
    minWidth: 900,
    minHeight: 620,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#0f0f1a',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Reload UI when config files change
  [INSTALLED, BLOCKLIST, MARKETPLACES].forEach(f => {
    if (!fs.existsSync(f)) return;
    fs.watch(f, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('config-changed');
      }
    });
  });
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/* ── IPC HANDLERS ──────────────────────────────────────────────────────── */

ipcMain.handle('get-data', async () => {
  try   { return { ok: true, data: readAllData() }; }
  catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('plugin-action', async (_e, { action, pluginId }) => {
  if (!validPluginId(pluginId)) return { success: false, error: 'ID plugin non valido.' };
  const result = await runClaudeArgs(['plugins', action, pluginId]);
  appendActivity({
    kind: 'plugin', action, target: pluginId,
    success: result.success, error: result.error,
  });
  return result;
});

ipcMain.handle('marketplace-action', async (_e, { action, name, source }) => {
  if (!validMarketplaceName(name)) return { success: false, error: 'Nome marketplace non valido.' };
  let result;
  if (action === 'remove')      result = await runClaudeArgs(['plugins', 'marketplace', 'remove', name]);
  else if (action === 'update') result = await runClaudeArgs(['plugins', 'marketplace', 'update', name]);
  else if (action === 'add' && source) result = await runClaudeArgs(['plugins', 'marketplace', 'add', source]);
  else return { success: false, error: 'Azione o parametri non validi.' };
  appendActivity({
    kind: 'marketplace', action, target: name,
    success: result.success, error: result.error,
  });
  return result;
});

ipcMain.handle('get-activity-log', async () => safeReadJson(ACTIVITY_LOG, []));

ipcMain.handle('clear-activity-log', async () => {
  try { fs.unlinkSync(ACTIVITY_LOG); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
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
