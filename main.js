const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); // Still needed for seedDefaultTemplatesIfMissing

// Import logic modules using userData path structure
const {
  loadTemplate,
  listTemplates,
  saveTemplate,
  createTemplate,
  templateExists,
  ensureUserTemplatesFile,
  deleteTemplate
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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
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
  console.log('User data path:', userDataPath);
  
  try {
    ensureDirsExist(userDataPath);
    seedDefaultTemplatesIfMissing(userDataPath);
    ensureUserTemplatesFile(userDataPath);
    console.log('Initialization completed successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
  
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

ipcMain.handle('delete-template', async (event, templateName) => {
  try {
    const result = deleteTemplate(userDataPath, templateName);
    console.log(`Deleted template: ${templateName}`);
    return result;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
});

ipcMain.handle('list-records', () => {
  return listRecords(userDataPath);
});

ipcMain.handle('load-record', (event, fileName) => {
  return loadRecord(userDataPath, fileName);
});


ipcMain.handle('save-record', (event, { name, data }) => {
  return saveRecord(userDataPath, name, data);
});



ipcMain.handle('create-template', async (event, payload) => {
  try {
    console.log('Creating template with payload:', payload);
    const result = await createTemplate(userDataPath, payload);
    console.log('Template created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in create-template IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('check-template-exists', (event, name) => {
  return templateExists(userDataPath, name);
});

