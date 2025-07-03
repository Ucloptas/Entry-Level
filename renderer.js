let currentTemplate = null;
let currentRecord = null;

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

  openSettings?.addEventListener('click', () => {
    floatingMenu.classList.add('hidden');
    settingsOverlay.classList.remove('hidden');
  });

  closeSettings?.addEventListener('click', () => {
    settingsOverlay.classList.add('hidden');
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
    window.uiManager.updateDisplay();
    showScreen('entry-form-screen');
  });

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

  const exists = await window.electronAPI.checkTemplateExists(templateName);
  if (exists) {
    window.uiManager.showErrorMessage('Template already exists. Choose a different name.');
    return;
  }

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
  } catch (err) {
    console.error('Template creation failed:', err);
    window.uiManager.showErrorMessage(`Failed to save template: ${err.message}`);
  }
});

});







