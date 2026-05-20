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
  getActivityLog:     ()                  => ipcRenderer.invoke('get-activity-log'),
  clearActivityLog:   ()                  => ipcRenderer.invoke('clear-activity-log'),
  pickDirectory:      ()                  => ipcRenderer.invoke('pick-directory'),
  validatePlugin:     (p)                 => ipcRenderer.invoke('validate-plugin',    p),

  onConfigChanged: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('config-changed', handler);
    return () => ipcRenderer.removeListener('config-changed', handler);
  },
});
