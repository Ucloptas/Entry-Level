const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  listTemplates: () => ipcRenderer.invoke('list-templates'),
  loadTemplate: (name) => ipcRenderer.invoke('load-template', name),
  listRecords: () => ipcRenderer.invoke('list-records'),
  loadRecord: (name) => ipcRenderer.invoke('load-record', name),
  saveRecord: (recordData) => ipcRenderer.invoke('save-record', recordData)
});
