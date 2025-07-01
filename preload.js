const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Template methods
  listTemplates: () => ipcRenderer.invoke('list-templates'),
  loadTemplate: (name) => ipcRenderer.invoke('load-template', name),
  saveTemplate: ({ name, data }) => ipcRenderer.invoke('save-template', { name, data }),
  
  // Record methods
  listRecords: () => ipcRenderer.invoke('list-records'),
  loadRecord: (name) => ipcRenderer.invoke('load-record', name),
  saveRecord: ({ name, data }) => ipcRenderer.invoke('save-record', { name, data }),
  listRecordFiles: () => ipcRenderer.invoke('list-record-files'),
  loadRecord: (name) => ipcRenderer.invoke('load-record', name)
});
