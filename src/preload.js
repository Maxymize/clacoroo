/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE BUSINESS (Maximilian Giurastante <info@maxymizebusiness.com>)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License v3 or later.
 * Full license text: see LICENSE file or https://www.gnu.org/licenses/agpl-3.0
 */
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('claudeAPI', {
  getData:            ()                  => ipcRenderer.invoke('get-data'),
  pluginAction:       (action, pluginId)  => ipcRenderer.invoke('plugin-action',      { action, pluginId }),
  marketplaceAction:  (action, name, src) => ipcRenderer.invoke('marketplace-action', { action, name, source: src }),
  getMarketplaceDetail: (name)            => ipcRenderer.invoke('get-marketplace-detail', name),
  confirmDialog:      (opts)              => ipcRenderer.invoke('confirm-dialog',     opts),
  openExternal:       (url)               => ipcRenderer.invoke('open-external',      url),
  setClaudeBin:       (p)                 => ipcRenderer.invoke('set-claude-bin',     p),
  openPluginPath:     (fullId)            => ipcRenderer.invoke('open-plugin-path',   fullId),
  openInEditor:       (fullId)            => ipcRenderer.invoke('open-in-editor',     fullId),
  readMarkdownFile:   (fullId, kind, name) => ipcRenderer.invoke('read-markdown-file', { fullId, kind, name }),
  getActivityLog:     ()                  => ipcRenderer.invoke('get-activity-log'),
  clearActivityLog:   ()                  => ipcRenderer.invoke('clear-activity-log'),
  pickDirectory:      ()                  => ipcRenderer.invoke('pick-directory'),
  validatePlugin:     (p)                 => ipcRenderer.invoke('validate-plugin',    p),
  addTrackedProject:    ()                => ipcRenderer.invoke('add-tracked-project'),
  removeTrackedProject: (p)               => ipcRenderer.invoke('remove-tracked-project', p),
  openDirectory:        (p)               => ipcRenderer.invoke('open-directory',         p),
  getStats:             ()                => ipcRenderer.invoke('get-stats'),
  updateSettings:       (patch)           => ipcRenderer.invoke('update-settings',        patch),
  getMcp:               (opts)            => ipcRenderer.invoke('get-mcp',                opts || {}),
  getAccount:           (opts)            => ipcRenderer.invoke('get-account',            opts || {}),
  accountLogout:        ()                => ipcRenderer.invoke('account-logout'),
  getUsage:             (opts)            => ipcRenderer.invoke('get-usage',              opts || {}),
  getState:           ()                  => ipcRenderer.invoke('get-state'),
  setState:           (patch)             => ipcRenderer.invoke('set-state',          patch),
  checkUpdates:       (force)             => ipcRenderer.invoke('check-updates',     { force: !!force }),
  getChangelog:       ()                  => ipcRenderer.invoke('get-changelog'),
  exportSnapshot:     ()                  => ipcRenderer.invoke('export-snapshot'),
  importSnapshot:     ()                  => ipcRenderer.invoke('import-snapshot'),
  applySnapshot:      (preview)           => ipcRenderer.invoke('apply-snapshot',     preview),
  showNotification:   (title, body)       => ipcRenderer.invoke('show-notification',  { title, body }),

  apiKey: {
    status:      ()    => ipcRenderer.invoke('apikey:status'),
    test:        (k)   => ipcRenderer.invoke('apikey:test', k),
    testStored:  ()    => ipcRenderer.invoke('apikey:testStored'),
    activate:    (k)   => ipcRenderer.invoke('apikey:activate', k),
    deactivate:  ()    => ipcRenderer.invoke('apikey:deactivate'),
    reconfigure: ()    => ipcRenderer.invoke('apikey:reconfigure'),
  },

  // v1.0.67 — Pack B: Terminale integrato
  pty: {
    capabilities: ()                       => ipcRenderer.invoke('pty:capabilities'),
    spawn:        (opts)                   => ipcRenderer.invoke('pty:spawn', opts || {}),
    write:        (id, data)               => ipcRenderer.send('pty:input', { id, data }),
    resize:       (id, cols, rows)         => ipcRenderer.invoke('pty:resize', { id, cols, rows }),
    kill:         (id)                     => ipcRenderer.invoke('pty:kill', { id }),
    list:         ()                       => ipcRenderer.invoke('pty:list'),
    cwd:          (id)                     => ipcRenderer.invoke('pty:cwd', { id }),
    onData: (cb) => {
      const handler = (_e, payload) => cb(payload);
      ipcRenderer.on('pty:data', handler);
      return () => ipcRenderer.removeListener('pty:data', handler);
    },
    onExit: (cb) => {
      const handler = (_e, payload) => cb(payload);
      ipcRenderer.on('pty:exit', handler);
      return () => ipcRenderer.removeListener('pty:exit', handler);
    },
  },

  onConfigChanged: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('config-changed', handler);
    return () => ipcRenderer.removeListener('config-changed', handler);
  },
  onSwitchSection: (cb) => {
    const handler = (_e, name) => cb(name);
    ipcRenderer.on('switch-section', handler);
    return () => ipcRenderer.removeListener('switch-section', handler);
  },
  onForceRefresh: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('force-refresh', handler);
    return () => ipcRenderer.removeListener('force-refresh', handler);
  },
});
