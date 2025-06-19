const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


// Import your logic modules
const { loadTemplate, listTemplates, saveTemplate } = require('./logic/templateManager');
const { loadRecord, saveRecord, listRecords, ensureDirsExist } = require('./logic/recordManager');
let userDataPath;

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

app.whenReady().then(() => {
  // Run any setup code here
  userDataPath = app.getPath('userData')
  ensureDirsExist(userDataPath); //ensures the templates and records subfolder exists within the userData folder

  // Then create the window
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Add IPC handlers to bridge the backend logic
ipcMain.handle('list-templates', () => listTemplates(userDataPath));
ipcMain.handle('load-template', (event, name) => loadTemplate(userDataPath, name));
ipcMain.handle('save-template', (event, { name, data }) => saveTemplate(userDataPath, name, data));
ipcMain.handle('list-records', () => listRecords(userDataPath));
ipcMain.handle('load-record', (event, name) => loadRecord(userDataPath, name));
ipcMain.handle('save-record', (event, { name, data }) => saveRecord(userDataPath, name, data));
