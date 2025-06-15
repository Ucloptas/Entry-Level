const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Import backend logic
const { loadTemplate, listTemplates } = require('./logic/templateManager');
const { loadRecord, saveRecord, listRecords } = require('./logic/recordManager');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 750,
    minWidth: 700,
    minHeight: 500,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('list-templates', () => {
  return listTemplates();
});

ipcMain.handle('load-template', (event, name) => {
  return loadTemplate(name);
});

ipcMain.handle('list-records', () => {
  return listRecords();
});

ipcMain.handle('load-record', (event, name) => {
  return loadRecord(name);
});

ipcMain.handle('save-record', (event, { name, data }) => {
  return saveRecord(name, data);
});
