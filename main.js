const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Import your logic modules
const { loadTemplate, listTemplates } = require('./logic/templateManager');
const { loadRecord, saveRecord, listRecords } = require('./logic/recordManager');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Add IPC handlers to bridge the backend logic
ipcMain.handle('list-templates', () => listTemplates());
ipcMain.handle('load-template', (event, name) => loadTemplate(name));
ipcMain.handle('list-records', () => listRecords());
ipcMain.handle('load-record', (event, name) => loadRecord(name));
ipcMain.handle('save-record', (event, { name, data }) => saveRecord(name, data));
