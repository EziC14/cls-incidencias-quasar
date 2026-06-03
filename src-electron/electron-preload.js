const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  dbLogin: (usuario, clave) => ipcRenderer.invoke('db:login', { usuario, clave }),
  dbQuery: (sql, params, usuario, clave) => ipcRenderer.invoke('db:query', { sql, params, usuario, clave })
})