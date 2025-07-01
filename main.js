const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import logic modules using Ethan's userData path structure
const {
  loadTemplate,
  listTemplates,
  saveTemplate,
  ensureUserTemplatesFile
} = require('./logic/templateManager');

const {
  loadRecord,
  saveRecord,
  listRecords,
  ensureDirsExist
} = require('./logic/recordManager');

let userDataPath;

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

// Seeds defaultTemplates into userData/templates if missing
function seedDefaultTemplatesIfMissing(userDataPath) {
  const targetPath = path.join(userDataPath, 'templates', 'defaultTemplates.json');
  const sourcePath = path.join(__dirname, 'EntryLevelData', 'templates', 'defaultTemplates.json');

  if (!fs.existsSync(targetPath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log('Default templates copied to userData path.');
    } catch (err) {
      console.error('Failed to copy default templates:', err);
    }
  }
}

app.whenReady().then(() => {
  userDataPath = app.getPath('userData');
  ensureDirsExist(userDataPath);
  seedDefaultTemplatesIfMissing(userDataPath);
  ensureUserTemplatesFile(userDataPath);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// === IPC HANDLERS using userDataPath ===
ipcMain.handle('list-templates', () => {
  return listTemplates(userDataPath);
});

ipcMain.handle('load-template', (event, name) => {
  return loadTemplate(userDataPath, name);
});

ipcMain.handle('save-template', (event, { name, data }) => {
  return saveTemplate(userDataPath, name, data);
});

ipcMain.handle('list-records', () => {
  return listRecords(userDataPath);
});

ipcMain.handle('load-record', (event, name) => {
  return loadRecord(userDataPath, name);
});

ipcMain.handle('save-record', (event, { name, data }) => {
  return saveRecord(userDataPath, name, data);
});
