'use strict';

const { app, Menu, shell } = require('electron');

const REPO_URL  = 'https://github.com/Maxymize/clacoroo';
const ISSUES_URL = REPO_URL + '/issues';
const SECTIONS  = ['dashboard', 'plugins', 'marketplaces', 'skills', 'agents', 'stats', 'settings'];

function sendToRenderer(mainWindow, channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

function buildAppMenu(mainWindow) {
  const isMac = process.platform === 'darwin';

  const sectionsSubmenu = SECTIONS.map((name, idx) => ({
    label: name.charAt(0).toUpperCase() + name.slice(1),
    accelerator: 'CmdOrCtrl+' + (idx + 1),
    click: () => sendToRenderer(mainWindow, 'switch-section', name),
  }));

  const template = [
    ...(isMac ? [{
      label: 'CLACOROO',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Impostazioni…', accelerator: 'Cmd+,', click: () => sendToRenderer(mainWindow, 'switch-section', 'settings') },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'Ricarica dati', accelerator: 'CmdOrCtrl+R', click: () => sendToRenderer(mainWindow, 'force-refresh') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Modifica',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'Vista',
      submenu: [
        ...sectionsSubmenu,
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { label: 'DevTools', accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => mainWindow?.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Finestra',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Aiuto',
      role: 'help',
      submenu: [
        { label: 'Repository GitHub',   click: () => shell.openExternal(REPO_URL) },
        { label: 'Segnala problema',    click: () => shell.openExternal(ISSUES_URL) },
        { type: 'separator' },
        { label: 'Documentazione Claude Code',
          click: () => shell.openExternal('https://docs.anthropic.com/claude-code') },
        ...(!isMac ? [{ type: 'separator' }, { role: 'about' }] : []),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function setupAboutPanel() {
  app.setAboutPanelOptions({
    applicationName: 'CLACOROO',
    applicationVersion: app.getVersion(),
    version: 'CLAude-code COntrol ROom',
    copyright: '© 2026 MAXYMIZE',
    website: REPO_URL,
    credits: 'Pannello di controllo visuale per gestire plugin, marketplace, skill e agent di Claude Code.\n\nIl nome è la fusione di CLAude-code + COntrol + ROom (il CO si sovrappone tra Code e Control).',
  });
}

module.exports = { buildAppMenu, setupAboutPanel };
