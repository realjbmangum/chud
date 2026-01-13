/**
 * Preload script - exposes safe IPC to renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('companion', {
  onStateUpdate: (callback) => {
    ipcRenderer.on('state-update', (event, state) => callback(state));
  },
  close: () => ipcRenderer.send('close-app'),
  minimize: () => ipcRenderer.send('minimize-app'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  hasApiKey: () => ipcRenderer.invoke('has-api-key'),
});
