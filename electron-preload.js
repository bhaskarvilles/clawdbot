const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    getGatewayUrl: () => ipcRenderer.invoke('get-gateway-url'),
    checkGatewayStatus: () => ipcRenderer.invoke('check-gateway-status'),
    platform: process.platform,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});
