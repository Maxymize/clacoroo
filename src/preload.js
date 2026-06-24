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

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('claudeAPI', {
  getData:            ()                  => ipcRenderer.invoke('get-data'),
  refreshHookDeps:    ()                  => ipcRenderer.invoke('hooks:refresh-deps'),
  checkHookTool:      (tool)              => ipcRenderer.invoke('hooks:check-tool', { tool }),
  pluginAction:       (action, pluginId)  => ipcRenderer.invoke('plugin-action',      { action, pluginId }),
  marketplaceAction:  (action, name, src) => ipcRenderer.invoke('marketplace-action', { action, name, source: src }),
  getMarketplaceDetail: (name)            => ipcRenderer.invoke('get-marketplace-detail', name),
  confirmDialog:      (opts)              => ipcRenderer.invoke('confirm-dialog',     opts),
  openExternal:       (url)               => ipcRenderer.invoke('open-external',      url),
  setClaudeBin:       (p)                 => ipcRenderer.invoke('set-claude-bin',     p),
  openPluginPath:     (fullId)            => ipcRenderer.invoke('open-plugin-path',   fullId),
  openInEditor:       (fullId)            => ipcRenderer.invoke('open-in-editor',     fullId),
  readMarkdownFile:   (fullId, kind, name) => ipcRenderer.invoke('read-markdown-file', { fullId, kind, name }),
  writeMarkdownFile:  (fullId, kind, name, content) => ipcRenderer.invoke('write-markdown-file', { fullId, kind, name, content }),
  readClaudeMd:       (filePath)          => ipcRenderer.invoke('read-claude-md',  { filePath }),
  writeClaudeMd:      (filePath, content) => ipcRenderer.invoke('write-claude-md', { filePath, content }),
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
  mcpClearAuthCache:    (serverId)        => ipcRenderer.invoke('mcp:clear-auth-cache',   { serverId }),
  mcpRemove:            (name)            => ipcRenderer.invoke('mcp:remove',             { name }),
  mcpAdd:               (opts)            => ipcRenderer.invoke('mcp:add',                opts || {}),
  mcpListTools:         (serverId)        => ipcRenderer.invoke('mcp:list-tools',         { serverId }),
  mcpDisable:           (name)            => ipcRenderer.invoke('mcp:disable',            { name }),
  mcpEnable:            (name)            => ipcRenderer.invoke('mcp:enable',             { name }),
  mcpListDisabled:      ()                => ipcRenderer.invoke('mcp:list-disabled'),
  getAccount:           (opts)            => ipcRenderer.invoke('get-account',            opts || {}),
  accountLogout:        ()                => ipcRenderer.invoke('account-logout'),
  getUsage:             (opts)            => ipcRenderer.invoke('get-usage',              opts || {}),
  getUsageInsights:     (win)             => ipcRenderer.invoke('get-usage-insights',    { window: win }),
  getState:           ()                  => ipcRenderer.invoke('get-state'),
  setState:           (patch)             => ipcRenderer.invoke('set-state',          patch),
  getSystemLocale:    ()                  => ipcRenderer.invoke('get-system-locale'),
  checkUpdates:       (force)             => ipcRenderer.invoke('check-updates',     { force: !!force }),
  getChangelog:       (lang)              => ipcRenderer.invoke('get-changelog', { lang }),
  exportSnapshot:     ()                  => ipcRenderer.invoke('export-snapshot'),
  importSnapshot:     ()                  => ipcRenderer.invoke('import-snapshot'),
  applySnapshot:      (preview)           => ipcRenderer.invoke('apply-snapshot',     preview),
  showNotification:   (title, body, force) => ipcRenderer.invoke('show-notification',  { title, body, force: !!force }),

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
