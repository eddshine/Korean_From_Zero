const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (fn) => {
    ipcRenderer.on('window-maximized-changed', (_event, value) => fn(value))
  },
  forceClose: () => ipcRenderer.invoke('app:force-close'),
  onConfirmClose: (fn) => {
    ipcRenderer.on('app:confirm-close', () => fn())
  },
})

contextBridge.exposeInMainWorld('dbAPI', {
  load: (key) => ipcRenderer.invoke('db:load', key),
  save: (key, value) => ipcRenderer.invoke('db:save', key, value),
  remove: (key) => ipcRenderer.invoke('db:remove', key),
})
