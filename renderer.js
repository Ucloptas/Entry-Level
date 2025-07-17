let currentTemplate = null;
let currentRecord = null;
let editingTemplate = null; //editing template

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // Debug: Check if uiManager is available
  console.log('window.uiManager available:', !!window.uiManager);
  if (window.uiManager) {
    console.log('uiManager methods:', Object.keys(window.uiManager));
  }
  
  function showScreen(id) {
    console.log('Showing screen:', id);
    window.uiManager.showScreen(id);
    
    // Refresh dropdowns when navigating to screens that need them
    if (id === 'select-record-screen' || id === 'view-records-screen') {
      window.uiManager.refreshRecordDropdowns();
    }
  }

  // === SCREEN NAVIGATION ===
  const bigButtons = document.querySelectorAll('.big-button');
  console.log('Found big buttons:', bigButtons.length);
  
  bigButtons.forEach(button => {
    button.addEventListener('click', () => {
      const screenId = button.getAttribute('data-screen');
      console.log('Big button clicked, screen:', screenId);
      showScreen(screenId);
    });
  });

  const backButtons = document.querySelectorAll('.back-button');
  console.log('Found back buttons:', backButtons.length);
  
  backButtons.forEach(button => {
    button.addEventListener('click', () => {
      const screenId = button.getAttribute('data-screen');
      console.log('Back button clicked, screen:', screenId);
      showScreen(screenId);
    });
  });

  // === MENU LOGIC ===
  const menuButton = document.getElementById('menu-button');
  const floatingMenu = document.getElementById('floating-menu');

  menuButton?.addEventListener('click', () => {
    floatingMenu?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!menuButton.contains(e.target) && !floatingMenu.contains(e.target)) {
      floatingMenu.classList.add('hidden');
    }
  });

  // === SETTINGS MODAL ===
  const openSettings = document.getElementById('open-settings');
  const settingsOverlay = document.getElementById('settings-overlay');
  const closeSettings = document.getElementById('close-settings');

  // Modal accessibility helpers
  function trapFocus(modal) {
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableEls = Array.from(modal.querySelectorAll(focusableSelectors));
    if (focusableEls.length === 0) return;
    let firstEl = focusableEls[0];
    let lastEl = focusableEls[focusableEls.length - 1];

    function handleTab(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    }
    modal.addEventListener('keydown', handleTab);
    modal._trapFocusHandler = handleTab;
  }

  function releaseFocus(modal) {
    if (modal._trapFocusHandler) {
      modal.removeEventListener('keydown', modal._trapFocusHandler);
      delete modal._trapFocusHandler;
    }
  }

  // Settings modal accessibility
  const appMain = document.querySelector('main');
  let lastFocusedElement = null;

  function openSettingsModal() {
    lastFocusedElement = document.activeElement;
    settingsOverlay.classList.remove('hidden');
    settingsOverlay.setAttribute('aria-modal', 'true');
    settingsOverlay.setAttribute('role', 'dialog');
    appMain.setAttribute('aria-hidden', 'true');
    trapFocus(settingsOverlay);
    // Focus the first focusable element in the modal
    const firstFocusable = settingsOverlay.querySelector('button, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeSettingsModal() {
    settingsOverlay.classList.add('hidden');
    settingsOverlay.removeAttribute('aria-modal');
    settingsOverlay.removeAttribute('role');
    appMain.removeAttribute('aria-hidden');
    releaseFocus(settingsOverlay);
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  // Replace your existing settings modal open/close logic with these functions
  // Example event listeners:
  document.getElementById('open-settings').addEventListener('click', openSettingsModal);
  document.getElementById('close-settings').addEventListener('click', closeSettingsModal);
  document.addEventListener('keydown', function(e) {
    if (!settingsOverlay.classList.contains('hidden')) {
      if (e.key === 'Escape') closeSettingsModal();
    }
  });

  // === EXIT MODAL ===
  const openExit = document.getElementById('open-exit');
  const exitOverlay = document.getElementById('exit-overlay');
  const confirmExit = document.getElementById('confirm-exit');
  const cancelExit = document.getElementById('cancel-exit');

  openExit?.addEventListener('click', () => {
    floatingMenu.classList.add('hidden');
    exitOverlay.classList.remove('hidden');
  });

  cancelExit?.addEventListener('click', () => {
    exitOverlay.classList.add('hidden');
  });

  confirmExit?.addEventListener('click', () => {
    window.close();
  });

  // === KEYBOARD SHORTCUTS FOR MODALS ===
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [settingsOverlay, exitOverlay].forEach(el => {
        if (el && !el.classList.contains('hidden')) {
          el.classList.add('hidden');
        }
      });
    }

    if (e.key === 'Enter' && exitOverlay && !exitOverlay.classList.contains('hidden')) {
      document.getElementById('confirm-exit')?.click();
    }
  });

  // === DARK MODE DETECTION + TOGGLE ===
  // Check for dark mode preference and apply it
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  function applyDarkMode() {
    if (darkModeMediaQuery.matches) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
  
  // Apply on load
  applyDarkMode();
  
  // Listen for changes
  darkModeMediaQuery.addEventListener('change', applyDarkMode);

  document.getElementById('toggle-dark-mode')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // === TEMPLATE DROPDOWN LOGIC ===
  // Initialize template dropdown
  window.electronAPI.listTemplates().then(templates => {
    window.uiManager.createDropdown('template-dropdown', templates, '-- Select a Template --');
    window.uiManager.setupDropdownWithConfirm('template-dropdown', 'select-template-confirm');
  });

  document.getElementById('select-template-confirm')?.addEventListener('click', async () => {
    const selected = window.uiManager.getSelectedValue('template-dropdown');
    if (!selected) return;

    currentTemplate = await window.electronAPI.loadTemplate(selected);
    window.uiManager.clearEntries();
    window.uiManager.renderForm(currentTemplate.fields);
    addHelpTextToFormFields();
    window.uiManager.updateDisplay();
    showScreen('entry-form-screen');
  });

// === DELETE TEMPLATE BUTTON
const deleteTemplateButton = document.getElementById('delete-template-button');
const templateDropdown = document.getElementById('template-dropdown');

if (templateDropdown && deleteTemplateButton) {
  // Enable/disable delete button based on selection
  templateDropdown.addEventListener('change', () => {
    const selected = templateDropdown.value;
    deleteTemplateButton.disabled = !selected;
  });

  // On delete button click
  deleteTemplateButton.addEventListener('click', async () => {
    const selectedTemplate = templateDropdown.value;
    if (!selectedTemplate) return;

    const confirmed = confirm(`Are you sure you want to delete the template "${selectedTemplate}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await window.electronAPI.deleteTemplate(selectedTemplate);
      alert(`Template "${selectedTemplate}" deleted.`);

      // Refresh templates dropdown
      const templates = await window.electronAPI.listTemplates();
      await window.uiManager.createDropdown('template-dropdown', templates, '-- Select a Template --');
      window.uiManager.setupDropdownWithConfirm('template-dropdown', 'select-template-confirm');

      // Disable buttons until new selection
      deleteTemplateButton.disabled = true;
      document.getElementById('select-template-confirm').disabled = true;

    } catch (error) {
      alert(`Failed to delete template: ${error.message}`);
    }
  });
}

// === EDIT TEMPLATE LOGIC
const editTemplateButton = document.getElementById('edit-template-button');
if (templateDropdown && editTemplateButton) {
  // Enable/disable edit button based on selection
  templateDropdown.addEventListener('change', () => {
    const selected = templateDropdown.value;
    editTemplateButton.disabled = !selected;
  });

  //on edit click
  document.getElementById('edit-template-button')?.addEventListener('click', async () => {
  const selected = window.uiManager.getSelectedValue('template-dropdown');
  if (!selected) return;

  editingTemplate = selected; // original name before edits
  const template = await window.electronAPI.loadTemplate(selected);

  //button to cancel editing
  document.getElementById('cancel-edit-button').classList.remove('hidden');

  // Show create-template screen
  showScreen('create-template-screen');

  // Populate form with template data
  document.getElementById('template-name-input').value = template.name;
  window.uiManager.clearCustomTemplateFields();
  template.fields.forEach(f => window.uiManager.addTemplateField(f.name, f.type));

  window.uiManager.showSuccessMessage(`Editing template "${template.name}"`);
});

}


    // === RECORD DROPDOWN LOGIC ===
  // Initialize record dropdown for "Create New Entry"
  window.electronAPI.listRecords().then(records => {
    window.uiManager.createDropdown('record-dropdown', records, '-- Select a Record --');
    window.uiManager.setupDropdownWithConfirm('record-dropdown', 'select-record-confirm');
  });

  document.getElementById('select-record-confirm')?.addEventListener('click', async () => {
    const selected = window.uiManager.getSelectedValue('record-dropdown');
    if (!selected) return;

    currentRecord = await window.electronAPI.loadRecord(selected);
    window.uiManager.clearEntries();
    // Fix: Extract fields from the template, not directly from record
    window.uiManager.renderForm(currentRecord.template.fields);
    addHelpTextToFormFields();
    window.uiManager.updateDisplay();
    showScreen('entry-form-screen');
  });

  // === FORM ACTIONS ===
  document.getElementById('add-entry')?.addEventListener('click', () => {
    // Use the appropriate fields based on whether we're creating new or adding to existing
    const fields = currentRecord ? currentRecord.template.fields : currentTemplate.fields;
    const entry = window.uiManager.readFormData(fields);
    
    // Validate the entry before adding
    const validationErrors = window.uiManager.validateFormData(fields, entry);
    if (validationErrors.length > 0) {
      window.uiManager.showErrorMessage(validationErrors.join(', '));
      return;
    }
    
    window.uiManager.addEntry(entry);
    window.uiManager.clearForm(fields);
    window.uiManager.showSuccessMessage('Entry added successfully');
  });

  document.getElementById('save-entry')?.addEventListener('click', async () => {
    if (window.uiManager.isEmpty()) {
      window.uiManager.showErrorMessage('No entries to save.');
      return;
    }

    if (currentRecord) {
      // Adding to existing record
      const updatedRecord = {
        template: currentRecord.template,
        entries: [...currentRecord.entries, ...window.uiManager.getEntries()]
      };
      
      // Save with the same filename
      await window.electronAPI.saveRecord({
        name: window.uiManager.getSelectedValue('record-dropdown'),
        data: updatedRecord
      });
      
      window.uiManager.showSuccessMessage('Entries added to existing record!');
    } else {
      //PATCH: issue for when using an editted template
      // Ensure we're using the latest template from disk
      const updatedTemplate = await window.electronAPI.loadTemplate(currentTemplate.name);
      if (!updatedTemplate) {
        window.uiManager.showErrorMessage('Template could not be loaded for saving.');
        return;
      }
      // Creating new record
      const recordData = {
        template: {
          name: currentTemplate.name || 'untitled',
          fields: currentTemplate.fields
        },
        entries: window.uiManager.getEntries()
      };

      const safeName = (currentTemplate.name || 'untitled').replace(/\s+/g, '_').toLowerCase();
      const fileName = `${safeName}-${Date.now()}.json`;

      await window.electronAPI.saveRecord({
        name: fileName,
        data: recordData
      });
      
      window.uiManager.showSuccessMessage('New record saved!');
    }

    window.uiManager.clearEntries();
    const fields = currentRecord ? currentRecord.template.fields : currentTemplate.fields;
    window.uiManager.renderForm(fields);
    addHelpTextToFormFields();
    window.uiManager.clearForm(fields);
    
    // Refresh record dropdowns after saving
    await window.uiManager.refreshRecordDropdowns();
  });

// === VIEW RECORDS DROPDOWN ===
// Initialize record dropdown for "View Records"
window.electronAPI.listRecords().then(files => {
  window.uiManager.createDropdown('record-select', files, '-- Choose a Record --');
  window.uiManager.setupDropdownWithConfirm('record-select', 'view-record-button');
});

document.getElementById('view-record-button')?.addEventListener('click', async () => {
  const selected = window.uiManager.getSelectedValue('record-select');

  if (!selected) return;
    
  const nextEntries = document.getElementById('next-entries');
  const previousEntries = document.getElementById('previous-entries');

  document.getElementById('back-from-entries').addEventListener('click', () => {
    nextEntries.classList.add('hidden');
    previousEntries.classList.add('hidden');
  });
  
  const recordData = await window.electronAPI.loadRecord(selected);

    let index = 0;

    let reducedData = {
      ...recordData,
      entries: recordData.entries.slice(index, index+5),
    }

    if(recordData.entries.length > 5) {
      nextEntries.classList.remove('hidden');
      previousEntries.classList.remove('hidden');
    }

    //Shows next entries
    document.getElementById('next-entries').addEventListener('click', () => {
      if(!(index+5 > recordData.entries.length) && !(index === recordData.entries.length)){
        index += 5;
        reducedData = {
          ...recordData,
          entries: recordData.entries.slice(index, index+5),
        }
        window.uiManager.displayRecord(reducedData, selected);
      }
      console.log(index);
    });
    
    //Shows previous entries
    document.getElementById('previous-entries').addEventListener('click', () => {
      if(!(index-5 < 0) && !(index === 0)){
        index -= 5;
        reducedData = {
          ...recordData,
          entries: recordData.entries.slice(index, index+5),
        }
        window.uiManager.displayRecord(reducedData, selected);
      }
      console.log(index);
    });

  console.log('Loaded record:', recordData);

  // Display the record data
  window.uiManager.displayRecord(reducedData, selected);
  
  // Navigate to the record display screen
  showScreen('record-display-screen');
});

// === CREATE NEW TEMPLATE === //

document.getElementById('add-field-button')?.addEventListener('click', () => {
  const name = document.getElementById('field-name-input').value.trim();
  const type = document.getElementById('field-type-select').value;

  // Validate field name
  const nameErrors = window.uiManager.validateFieldName(name);
  if (nameErrors.length > 0) {
    window.uiManager.showErrorMessage(nameErrors.join(', '));
    return;
  }

  // Check for duplicate field names
  if (window.uiManager.hasFieldName(name)) {
    window.uiManager.showErrorMessage(`Field name '${name}' already exists`);
    return;
  }

  window.uiManager.addTemplateField(name, type);
  document.getElementById('field-name-input').value = '';
  window.uiManager.showSuccessMessage(`Field '${name}' added`);
});

document.getElementById('save-template-button')?.addEventListener('click', async () => {
  const nameInput = document.getElementById('template-name-input');
  const templateName = nameInput.value.trim();
  const fields = window.uiManager.getCustomTemplateFields();

  // Validate template name
  const nameErrors = window.uiManager.validateTemplateName(templateName);
  if (nameErrors.length > 0) {
    window.uiManager.showErrorMessage(nameErrors.join(', '));
    return;
  }

  // Validate template fields
  const fieldErrors = window.uiManager.validateTemplateFields(window.uiManager.getCustomTemplateFields());
  if (fieldErrors.length > 0) {
    window.uiManager.showErrorMessage(fieldErrors.join(', '));
    return;
  }

 if (editingTemplate) {
    // Update flow
    if (editingTemplate !== templateName) {
      // Check if new name exists
      const exists = await window.electronAPI.checkTemplateExists(templateName);
      if (exists) {
        window.uiManager.showErrorMessage('Template name already exists.');
        return;
      }
    }
    try {
      await window.electronAPI.updateTemplate(editingTemplate, { name: templateName, fields });
      window.uiManager.showSuccessMessage('Template updated successfully.');
      editingTemplate = null;
      currentTemplate = null;
      nameInput.value = '';
      window.uiManager.clearCustomTemplateFields();
      await window.uiManager.refreshTemplateDropdown();
      showScreen('new-record-screen');
    } catch (err) {
      window.uiManager.showErrorMessage(`Failed to update template: ${err.message}`);
    }
  } else {

    try {
      console.log('Attempting to create template:', {
        name: templateName,
        fields: window.uiManager.getCustomTemplateFields()
      });
      
      const result = await window.electronAPI.createTemplate({
        name: templateName,
        fields: window.uiManager.getCustomTemplateFields()
      });

      console.log('Template created successfully:', result);
      window.uiManager.showSuccessMessage('Template saved!');

      nameInput.value = '';
      window.uiManager.clearCustomTemplateFields();
      await window.uiManager.refreshTemplateDropdown();
      showScreen('new-record-screen');
      document.getElementById('cancel-edit-button').classList.add('hidden');
      currentTemplate = null;

    } catch (err) {
      console.error('Template creation failed:', err);
      window.uiManager.showErrorMessage(`Failed to save template: ${err.message}`);
    }
  }
});

//button for canceling editing
document.getElementById('cancel-edit-button')?.addEventListener('click', () => {
  currentTemplate = null;

  // Clear template editor
  document.getElementById('template-name-input').value = '';
  window.uiManager.clearCustomTemplateFields();

  // Hide cancel button again
  document.getElementById('cancel-edit-button').classList.add('hidden');

  // Optionally navigate back or stay on the screen
  window.uiManager.showSuccessMessage('Edit cancelled.');
  showScreen('new-record-screen');
});

// Patch: Add icons and labels to status toasts for accessibility
function showStatusToast(type, message) {
  const statusMessage = document.getElementById('status-message');
  let icon = '';
  let label = '';
  switch (type) {
    case 'success':
      icon = '✔';
      label = 'Success:';
      break;
    case 'error':
      icon = '✖';
      label = 'Error:';
      break;
    case 'warning':
      icon = '⚠';
      label = 'Warning:';
      break;
    default:
      icon = '';
      label = '';
  }
  statusMessage.innerHTML = `<span class="status-icon">${icon}</span> <strong>${label}</strong> ${message}`;
  statusMessage.className = `status-toast ${type}`;
  statusMessage.classList.remove('hidden');
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 3500);
}

// Accessible form error and help display helpers
function showFieldError(input, message) {
  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');
  let errorId = input.id + '-error';
  let errorElem = document.getElementById(errorId);
  if (!errorElem) {
    errorElem = document.createElement('span');
    errorElem.id = errorId;
    errorElem.className = 'form-error-message';
    input.parentNode.insertBefore(errorElem, input.nextSibling);
  }
  errorElem.textContent = message;
  input.setAttribute('aria-describedby', errorId);
}

function clearFieldError(input) {
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  let errorId = input.id + '-error';
  let errorElem = document.getElementById(errorId);
  if (errorElem) errorElem.remove();
  input.removeAttribute('aria-describedby');
}

function addHelpText(input, helpText) {
  let helpId = input.id + '-help';
  let helpElem = document.getElementById(helpId);
  if (!helpElem) {
    helpElem = document.createElement('span');
    helpElem.id = helpId;
    helpElem.className = 'form-help-text';
    input.parentNode.insertBefore(helpElem, input.nextSibling);
  }
  helpElem.textContent = helpText;
  input.setAttribute('aria-describedby', helpId);
}

// Add help text to all form fields after rendering
function addHelpTextToFormFields() {
  const formContainer = document.getElementById('form-container');
  if (!formContainer) return;
  
  const inputs = formContainer.querySelectorAll('input, select, textarea');
  inputs.forEach((input, idx) => {
    // Skip if already has help text
    if (input.getAttribute('aria-describedby') && input.getAttribute('aria-describedby').includes('-help')) {
      return;
    }
    
    let helpText = '';
    const fieldName = input.name || '';
    const fieldType = input.type || 'text';
    
    // Context-aware help for special fields
    if (fieldName.toLowerCase().includes('template') && fieldName.toLowerCase().includes('name')) {
      helpText = 'Enter a unique name for this template.';
    } else if (fieldName.toLowerCase() === 'field name') {
      helpText = 'Enter a name for this field (e.g., "Amount").';
    } else if (fieldName.toLowerCase() === 'field type') {
      helpText = 'Select the type of data for this field.';
    } else {
      // Type-based help text
      switch (fieldType) {
        case 'text':
          helpText = 'Enter text.';
          break;
        case 'number':
          helpText = 'Enter a number.';
          break;
        case 'date':
          helpText = 'Select a date.';
          break;
        case 'checkbox':
          helpText = 'Check for yes/true, uncheck for no/false.';
          break;
        default:
          helpText = 'Enter a value.';
      }
    }
    
    if (helpText) {
      addHelpText(input, helpText);
    }
  });
}

});







