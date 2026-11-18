const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tmgStudioBridge', {
  selectMediaFile: () => ipcRenderer.invoke('tmg:select-media-file'),
  getHardwareInfo: () => ipcRenderer.invoke('tmg:get-hardware-info'),
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

