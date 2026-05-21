'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('claudeAPI', {
  getData:            ()                  => ipcRenderer.invoke('get-data'),
  pluginAction:       (action, pluginId)  => ipcRenderer.invoke('plugin-action',      { action, pluginId }),
  marketplaceAction:  (action, name, src) => ipcRenderer.invoke('marketplace-action', { action, name, source: src }),
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
  getState:           ()                  => ipcRenderer.invoke('get-state'),
  setState:           (patch)             => ipcRenderer.invoke('set-state',          patch),
  checkUpdates:       (force)             => ipcRenderer.invoke('check-updates',     { force: !!force }),
  getChangelog:       ()                  => ipcRenderer.invoke('get-changelog'),
  exportSnapshot:     ()                  => ipcRenderer.invoke('export-snapshot'),
  importSnapshot:     ()                  => ipcRenderer.invoke('import-snapshot'),
  applySnapshot:      (preview)           => ipcRenderer.invoke('apply-snapshot',     preview),
  showNotification:   (title, body)       => ipcRenderer.invoke('show-notification',  { title, body }),

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
