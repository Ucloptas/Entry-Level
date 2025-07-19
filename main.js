const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
  deleteRecord,
  listRecords,
  ensureDirsExist,
  getAllRecordTemplateInfo
} = require('./logic/recordManager');

const {
  exportRecordAsJson,
  exportRecordAsCsv,
  validateRecordForExport,
  parseCsvToRecord
} = require('./logic/exportManager');

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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
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

ipcMain.handle('update-template', (event, { oldName, updatedTemplate }) => {
  try {
    const templatesDir = path.join(userDataPath, 'templates');
    const userPath = path.join(templatesDir, 'userTemplates.json');

    if (!fs.existsSync(userPath)) {
      throw new Error('User templates file does not exist');
    }

    let existingTemplates = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
    const index = existingTemplates.findIndex(t => t.name === oldName);

    if (index === -1) {
      throw new Error(`Template "${oldName}" not found`);
    }

    // If changing name, ensure new name isn't already used (except current template)
    if (oldName !== updatedTemplate.name && existingTemplates.some(t => t.name === updatedTemplate.name)) {
      throw new Error(`Template name "${updatedTemplate.name}" already exists`);
    }

    existingTemplates[index] = updatedTemplate;
    fs.writeFileSync(userPath, JSON.stringify(existingTemplates, null, 2), 'utf-8');

    return true;
  } catch (error) {
    console.error('Failed to update template:', error);
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

ipcMain.handle('delete-record', (event, { name, index }) => {
  return deleteRecord(userDataPath, name, index);
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

// === EXPORT/IMPORT HANDLERS ===
ipcMain.handle('export-record-as-json', async (event, recordData) => {
  try {
    const validation = validateRecordForExport(recordData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const result = exportRecordAsJson(recordData);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Show save dialog
    const saveResult = await dialog.showSaveDialog({
      title: 'Export Record as JSON',
      defaultPath: result.defaultFileName,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (saveResult.canceled) {
      return { success: false, canceled: true };
    }
    
    // Write the file
    fs.writeFileSync(saveResult.filePath, result.data, 'utf-8');
    return { success: true, filePath: saveResult.filePath };
  } catch (error) {
    console.error('Error in export-record-as-json:', error);
    throw error;
  }
});

ipcMain.handle('export-record-as-csv', async (event, recordData) => {
  try {
    const validation = validateRecordForExport(recordData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const result = exportRecordAsCsv(recordData);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Show save dialog
    const saveResult = await dialog.showSaveDialog({
      title: 'Export Record as CSV',
      defaultPath: result.defaultFileName,
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (saveResult.canceled) {
      return { success: false, canceled: true };
    }
    
    // Write the file
    fs.writeFileSync(saveResult.filePath, result.data, 'utf-8');
    return { success: true, filePath: saveResult.filePath };
  } catch (error) {
    console.error('Error in export-record-as-csv:', error);
    throw error;
  }
});

ipcMain.handle('import-record-from-file', async (event) => {
  try {
    // Show file open dialog
    const openResult = await dialog.showOpenDialog({
      title: 'Import Record',
      filters: [
        { name: 'Supported Files', extensions: ['json', 'csv'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    
    if (openResult.canceled) {
      return { success: false, canceled: true };
    }
    
    const filePath = openResult.filePaths[0];
    const fileExtension = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath, fileExtension);
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    let recordData;
    
    if (fileExtension === '.json') {
      // Parse JSON file
      try {
        recordData = JSON.parse(fileContent);
        
        // Check for both old format (name + entries) and new format (template + entries)
        const hasOldFormat = recordData.name && recordData.entries;
        const hasNewFormat = recordData.template && recordData.template.name && recordData.entries;
        
        if (!hasOldFormat && !hasNewFormat) {
          throw new Error('Invalid record format: missing name/template or entries');
        }
        
        // If it's the old format, convert it to new format for consistency
        if (hasOldFormat && !hasNewFormat) {
          recordData = {
            template: {
              name: recordData.name,
              fields: recordData.entries.length > 0 ? 
                Object.keys(recordData.entries[0]).map(key => ({ name: key, type: 'text' })) : 
                []
            },
            entries: recordData.entries
          };
        }
      } catch (error) {
        throw new Error(`Invalid JSON file: ${error.message}`);
      }
    } else if (fileExtension === '.csv') {
      // Parse CSV file
      const csvResult = parseCsvToRecord(fileContent, fileName);
      if (!csvResult.success) {
        throw new Error(csvResult.error);
      }
      recordData = csvResult.data;
      console.log('CSV import result:', recordData); // Debug log
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Save the imported record
    const recordFileName = `${recordData.template.name}.json`;
    console.log('About to save record with structure:', JSON.stringify(recordData, null, 2)); // Debug log
    saveRecord(userDataPath, recordFileName, recordData);
    
    return { 
      success: true, 
      recordName: recordData.template.name,
      entryCount: recordData.entries.length,
      filePath: filePath
    };
  } catch (error) {
    console.error('Error in import-record-from-file:', error);
    throw error;
  }
});

ipcMain.handle('get-all-record-template-info',async ()=>{
  return getAllRecordTemplateInfo(userDataPath);
});

