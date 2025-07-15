const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const { getAllRecordTemplateInfo } = require('./logic/recordManager');

contextBridge.exposeInMainWorld('electronAPI', {
  // Template methods
  listTemplates: () => ipcRenderer.invoke('list-templates'),
  loadTemplate: (name) => ipcRenderer.invoke('load-template', name),
  saveTemplate: ({ name, data }) => ipcRenderer.invoke('save-template', { name, data }),
  createTemplate: (payload) => ipcRenderer.invoke('create-template', payload),
  checkTemplateExists: (name) => ipcRenderer.invoke('check-template-exists', name),
  deleteTemplate: (templateName) => ipcRenderer.invoke('delete-template', templateName),
  updateTemplate: (oldName, updatedTemplate) => ipcRenderer.invoke('update-template', { oldName, updatedTemplate }),
  
  // Record methods
  listRecords: () => ipcRenderer.invoke('list-records'),
  loadRecord: (name) => ipcRenderer.invoke('load-record', name),
  saveRecord: ({ name, data }) => ipcRenderer.invoke('save-record', { name, data }),
  
  // Export/Import methods
  exportRecordAsJson: (recordData) => ipcRenderer.invoke('export-record-as-json', recordData),
  exportRecordAsCsv: (recordData) => ipcRenderer.invoke('export-record-as-csv', recordData),
  importRecordFromFile: (filePath) => ipcRenderer.invoke('import-record-from-file', filePath),
  getAllRecordTemplateInfo: () => ipcRenderer.invoke('get-all-record-template-info')
});

// Expose UI manager methods directly
try {
  const uiManager = require(path.join(__dirname, 'logic', 'uiManager'));
  const formManager = require(path.join(__dirname, 'logic', 'formManager'));
  const entryManager = require(path.join(__dirname, 'logic', 'entryManager'));
  const validationManager = require(path.join(__dirname, 'logic', 'validationManager'));

  // Create instances in preload context
  const screenManagerInstance = new uiManager.ScreenManager();
  const dropdownManagerInstance = new uiManager.DropdownManager();
  const recordDisplayManagerInstance = new uiManager.RecordDisplayManager();
  const templateUIManagerInstance = new uiManager.TemplateUIManager();
  const formManagerInstance = new formManager.FormManager();
  const entryManagerInstance = new entryManager.EntryManager();
  const validationManagerInstance = new validationManager.ValidationManager();
  const recordPreviewDisplayManagerInstance = new uiManager.RecordPreviewDisplayManager();

  contextBridge.exposeInMainWorld('uiManager', {
    // Screen management
    showScreen: (screenId) => screenManagerInstance.showScreen(screenId),
    getCurrentScreen: () => screenManagerInstance.getCurrentScreen(),
    
    // Dropdown management
    createDropdown: (dropdownId, options, placeholder, formatOption) => 
      dropdownManagerInstance.createDropdown(dropdownId, options, placeholder, formatOption),
    setupDropdownWithConfirm: (dropdownId, confirmButtonId) => 
      dropdownManagerInstance.setupDropdownWithConfirm(dropdownId, confirmButtonId),
    getSelectedValue: (dropdownId) => dropdownManagerInstance.getSelectedValue(dropdownId),
    clearDropdown: (dropdownId) => dropdownManagerInstance.clearDropdown(dropdownId),
    
    // Record display management
    displayRecord: (recordData, fileName) => recordDisplayManagerInstance.displayRecord(recordData, fileName),
    displayRecordPreview: (recordData) => recordPreviewDisplayManagerInstance.displayRecordPreview(recordData),

    // Template UI management
    renderTemplateFieldsPreview: () => templateUIManagerInstance.renderTemplateFieldsPreview(),
    addTemplateField: (name, type) => templateUIManagerInstance.addTemplateField(name, type),
    getCustomTemplateFields: () => templateUIManagerInstance.getCustomTemplateFields(),
    clearCustomTemplateFields: () => templateUIManagerInstance.clearCustomTemplateFields(),
    hasFieldName: (name) => templateUIManagerInstance.hasFieldName(name),
    refreshTemplateDropdown: async () => {
      const templates = await ipcRenderer.invoke('list-templates');
      return templateUIManagerInstance.refreshTemplateDropdown(dropdownManagerInstance, templates);
    },
    refreshRecordDropdowns: async () => {
      const records = await ipcRenderer.invoke('list-records');
      return templateUIManagerInstance.refreshRecordDropdowns(dropdownManagerInstance, records);
    },
    
    // Form management
    renderForm: (fields) => formManagerInstance.renderForm(fields),
    readFormData: (fields) => formManagerInstance.readFormData(fields),
    clearForm: (fields) => formManagerInstance.clearForm(fields),
    
    // Entry management
    addEntry: (entry) => entryManagerInstance.addEntry(entry),
    getEntries: () => entryManagerInstance.getEntries(),
    clearEntries: () => entryManagerInstance.clearEntries(),
    updateDisplay: () => entryManagerInstance.updateDisplay(),
    isEmpty: () => entryManagerInstance.isEmpty(),
    
    // Validation management
    validateFormData: (fields, data) => validationManagerInstance.validateFormData(fields, data),
    validateFieldName: (name) => validationManagerInstance.validateFieldName(name),
    validateTemplateName: (name) => validationManagerInstance.validateTemplateName(name),
    validateTemplateFields: (fields) => validationManagerInstance.validateTemplateFields(fields),
    showErrorMessage: (message) => validationManagerInstance.showErrorMessage(message),
    showSuccessMessage: (message) => validationManagerInstance.showSuccessMessage(message)
  });
} catch (e) {
  console.error('Error loading UI manager modules in preload.js:', e);
  contextBridge.exposeInMainWorld('uiManager', undefined);
}
