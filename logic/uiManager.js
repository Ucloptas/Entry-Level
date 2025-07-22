// UI Manager - Handles reusable UI components and screen management
const { ValidationManager } = require('./validationManager');
const { FormManager } = require('./formManager');

class DropdownManager {
  constructor() {
    this.dropdowns = new Map();
  }

  // Create and populate a dropdown with options
  async createDropdown(dropdownId, options, placeholder = '-- Select an option --', formatOption = null) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
      console.error(`Dropdown with id '${dropdownId}' not found`);
      return null;
    }

    // Ensure consistent dropdown styling
    if (!dropdown.classList.contains('dropdown-select')) {
      dropdown.classList.add('dropdown-select');
    }

    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add placeholder
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    dropdown.appendChild(placeholderOption);

    // Add options
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value || option.name || option;
      
      if (formatOption) {
        optionElement.textContent = formatOption(option);
      } else if (option.text) {
        optionElement.textContent = option.text;
      } else if (option.source && option.name) {
        optionElement.textContent = `[${option.source}] ${option.name}`;
      } else {
        optionElement.textContent = option.name || option;
      }
      
      dropdown.appendChild(optionElement);
    });

    // Store reference for later use
    this.dropdowns.set(dropdownId, dropdown);
    return dropdown;
  }

  // Enable/disable confirm button based on dropdown selection
  setupDropdownWithConfirm(dropdownId, confirmButtonId) {
    const dropdown = document.getElementById(dropdownId);
    const confirmButton = document.getElementById(confirmButtonId);
    
    if (!dropdown || !confirmButton) {
      console.error(`Dropdown or confirm button not found: ${dropdownId}, ${confirmButtonId}`);
      return;
    }

    // Set initial state
    confirmButton.disabled = !dropdown.value;

    // Listen for changes
    dropdown.addEventListener('change', () => {
      confirmButton.disabled = !dropdown.value;
    });
  }

  // Get selected value from dropdown
  getSelectedValue(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    return dropdown ? dropdown.value : null;
  }

  // Clear dropdown selection
  clearDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.value = '';
      dropdown.dispatchEvent(new Event('change'));
    }
  }
}

// Screen management
class ScreenManager {
  constructor() {
    this.currentScreen = null;
  }

  showScreen(screenId) {
    console.log('ScreenManager.showScreen called with:', screenId);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    console.log('Found screens:', screens.length);
    
    screens.forEach(screen => {
      screen.classList.add('hidden');
    });

    // Show target screen
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      this.currentScreen = screenId;
      console.log('Successfully showed screen:', screenId);
    } else {
      console.error(`Screen with id '${screenId}' not found`);
    }
  }

  getCurrentScreen() {
    return this.currentScreen;
  }
}

// Record Display Manager
class RecordDisplayManager {
  constructor() {
    this.titleElement = null;
    this.contentElement = null;
    this.statusTimeout = null;
  }

  // Show status message
  showStatusMessage(text, duration = 3000) {
    const statusMessageElement = document.getElementById('status-message');
    if (!statusMessageElement) {
      console.error('Status message element not found');
      return;
    }

    statusMessageElement.textContent = text;
    statusMessageElement.classList.remove('hidden');

    // Clear existing timeout
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    // Auto-hide after duration
    this.statusTimeout = setTimeout(() => {
      statusMessageElement.classList.add('hidden');
    }, duration);
  }

  // Display record data in the UI
  displayRecord(recordData, fileName) {
    console.log('RecordDisplayManager.displayRecord called with:', recordData); // Debug log
    
    this.titleElement = document.getElementById('record-display-title');
    this.contentElement = document.getElementById('record-display-content');
    
    if (!this.titleElement || !this.contentElement) {
      console.error('Record display elements not found');
      return;
    }
    
    // Validate record data structure
    if (!recordData.template || !recordData.template.fields || !Array.isArray(recordData.template.fields)) {
      console.error('Invalid record data structure:', recordData);
      this.contentElement.innerHTML = '<p>Error: Invalid record format</p>';
      return;
    }
    
    // Set the title
    this.titleElement.textContent = `Record: ${fileName}`;
    
    // Clear previous content
    this.contentElement.innerHTML = '';
    
    // Display template info
    const templateInfo = document.createElement('div');
    templateInfo.innerHTML = `
      <h3>Template: ${recordData.template.name}</h3>
      <p><strong>Fields:</strong> ${recordData.template.fields.map(f => f.name).join(', ')}</p>
    `;
    this.contentElement.appendChild(templateInfo);
    
    // Display entries
    const entriesSection = document.createElement('div');
    entriesSection.innerHTML = `<h3>Entries (${recordData.entries.length})</h3>`;
    
    if (recordData.entries.length === 0) {
      entriesSection.innerHTML += '<p>No entries found.</p>';
    } else {
      const entriesList = document.createElement('div');
      entriesList.className = 'entries-list';
      
      recordData.entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'card-row';
        entryDiv.setAttribute('data-entry-index', index);
        entryDiv.setAttribute('role', 'button');
        entryDiv.setAttribute('tabindex', '0');
        entryDiv.setAttribute('aria-label', `View Entry ${index + 1}`);
        
        // Create entry header
        const entryHeader = document.createElement('h4');
        entryHeader.textContent = `Entry ${index + 1}`;
        entryDiv.appendChild(entryHeader);
        
        // Create fields list with truncation
        const fieldsList = document.createElement('ul');
        const maxFieldsToShow = 4; // Show only first 4 fields in card
        const maxCharsPerField = 120; // Max characters per field value
        let hasOverflow = false;
        
        recordData.template.fields.forEach((field, fieldIndex) => {
          if (fieldIndex >= maxFieldsToShow) {
            hasOverflow = true;
            return; // Skip remaining fields
          }
          
          const value = entry[field.name] || 'N/A';
          const li = document.createElement('li');
          
          // Create field name span
          const fieldName = document.createElement('span');
          fieldName.className = 'field-name';
          fieldName.textContent = `${field.name}:`;
          
          // Create field value span with truncation
          const fieldValue = document.createElement('span');
          fieldValue.className = 'field-value';
          
          if (typeof value === 'string' && value.length > maxCharsPerField) {
            fieldValue.textContent = value.substring(0, maxCharsPerField);
            fieldValue.classList.add('truncated');
            hasOverflow = true;
          } else {
            fieldValue.textContent = value;
          }
          
          li.appendChild(fieldName);
          li.appendChild(fieldValue);
          fieldsList.appendChild(li);
        });
        
        entryDiv.appendChild(fieldsList);
        
        // Add overflow indicator if needed
        if (hasOverflow || recordData.template.fields.length > maxFieldsToShow) {
          const overflowIndicator = document.createElement('div');
          overflowIndicator.className = 'card-overflow-indicator';
          overflowIndicator.textContent = '⋯';
          overflowIndicator.setAttribute('aria-label', 'More content available');
          entryDiv.appendChild(overflowIndicator);
        }
        
        // Add click handler to open modal
        entryDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEntryViewer(entry, index, recordData.template, fileName);
        });
        
        // Add keyboard support
        entryDiv.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openEntryViewer(entry, index, recordData.template, fileName);
          }
        });
        
        entriesList.appendChild(entryDiv);
      });
      
      entriesSection.appendChild(entriesList);
    }
    
    this.contentElement.appendChild(entriesSection);
  }
  
  // Open entry viewer modal
  openEntryViewer(entry, entryIndex, template, fileName) {
    const overlay = document.getElementById('entry-viewer-overlay');
    const title = document.getElementById('entry-viewer-title');
    const content = document.getElementById('entry-viewer-content');
    const deleteButton = document.getElementById('delete-entry-button');
    const editButton = document.getElementById('edit-entry-button');
    
    if (!overlay || !title || !content || !deleteButton || !editButton) {
      console.error('Entry viewer modal elements not found');
      return;
    }

    // Always fully clear modal content before rendering
    content.innerHTML = '';
    // Remove any lingering forms or event listeners (defensive)
    // (No explicit event listeners on content, but this is a good place for future-proofing)

    let isEditMode = false;
    const formManager = new FormManager();

    // Helper to render fields in view or edit mode
    const renderFields = () => {
      content.innerHTML = '';
      const fieldsList = document.createElement('ul');
      fieldsList.style.listStyle = 'none';
      fieldsList.style.padding = '0';
      fieldsList.style.margin = '0';
      
      if (isEditMode) {
        // Add a heading for edit mode
        const heading = document.createElement('h3');
        heading.textContent = 'Edit Entry';
        heading.className = 'edit-modal-heading';
        content.appendChild(heading);
        // Use FormManager to render the form for edit mode
        // Create a styled container for the form
        const formContainer = document.createElement('div');
        formContainer.id = `edit-modal-form-container-${entryIndex}`;
        formContainer.className = 'edit-modal-form-container';
        content.appendChild(formContainer);
        // Render form with unique container ID
        formManager.renderForm(template.fields, formContainer.id);
        // Set each input's value to the current entry's value
        template.fields.forEach((field, idx) => {
          // Ensure unique input IDs
          const inputId = `form-field-${field.name.replace(/\s+/g, '-').toLowerCase()}-${entryIndex}-${idx}`;
          const input = formContainer.querySelector(`[name="${field.name}"]`);
          if (input) input.id = inputId;
          if (!input) return;
          let value = entry[field.name];
          if (field.type === 'date') {
            if (value instanceof Date) {
              value = value.toISOString().slice(0, 10);
            } else if (typeof value === 'string' && value.length > 0) {
              const d = new Date(value);
              if (!isNaN(d)) value = d.toISOString().slice(0, 10);
            }
            input.value = value || '';
          } else if (field.type === 'boolean') {
            input.checked = value === true || value === 'true';
          } else {
            input.value = value !== undefined && value !== null ? value : '';
          }
        });
      } else {
        // Read-only view (as before)
        template.fields.forEach(field => {
          const value = entry[field.name] || '';
          const li = document.createElement('li');
          li.style.marginBottom = '15px';
          li.style.padding = '10px';
          li.style.borderBottom = '1px solid var(--dropdown-border)';
          const fieldName = document.createElement('div');
          fieldName.style.fontWeight = 'bold';
          fieldName.style.color = 'var(--header-color)';
          fieldName.style.marginBottom = '5px';
          fieldName.textContent = field.name;
          li.appendChild(fieldName);
          const fieldValue = document.createElement('div');
          fieldValue.style.wordWrap = 'break-word';
          fieldValue.style.whiteSpace = 'pre-wrap';
          fieldValue.textContent = value === '' ? 'N/A' : value;
          li.appendChild(fieldValue);
          fieldsList.appendChild(li);
        });
        content.appendChild(fieldsList);
      }
    };

    // Initial render (view mode)
    renderFields();

    // Set modal title
    title.textContent = `Entry ${entryIndex + 1} Details`;

    // Set up edit button
    editButton.onclick = () => {
      if (!isEditMode) {
        isEditMode = true;
        renderFields();
        // Add Save and Cancel buttons
        let actions = overlay.querySelector('.entry-viewer-actions');
        if (!overlay.querySelector('#save-edit-entry-button')) {
          const saveBtn = document.createElement('button');
          saveBtn.id = 'save-edit-entry-button';
          saveBtn.className = 'modal-button save-button';
          saveBtn.textContent = 'Save';
          saveBtn.onclick = async () => {
            // Read edited data from the form
            const formContainer = document.getElementById(`edit-modal-form-container-${entryIndex}`);
            const editedData = formManager.readFormData(template.fields, formContainer);
            // Validate edited data before saving
            const validationManager = new ValidationManager();
            const errors = validationManager.validateFormData(template.fields, editedData);
            if (errors.length > 0) {
              validationManager.showErrorMessage('Validation failed:\n' + errors.join('\n'), 5000);
              return;
            }
            // Save changes to currentRecord
            try {
              const { ipcRenderer } = require('electron');
              // Update entry in currentRecord
              const recordData = await ipcRenderer.invoke('load-record', fileName);
              recordData.entries[entryIndex] = { ...editedData };
              await ipcRenderer.invoke('save-record', { name: fileName, data: recordData });
              // Remove Save/Cancel buttons
              saveBtn.remove();
              cancelBtn.remove();
              // Hide the modal before re-opening (defensive)
              overlay.classList.add('hidden');
              // Re-open the modal in view mode with updated entry data (fresh object)
              const updatedEntry = recordData.entries[entryIndex];
              setTimeout(() => {
                this.openEntryViewer(updatedEntry, entryIndex, template, fileName);
              }, 10);
              // Refresh record display
              this.displayRecord(recordData, fileName);
              window.dispatchEvent(new CustomEvent('currentRecordUpdate', { detail: recordData }));
              this.showStatusMessage('Entry updated successfully');
            } catch (error) {
              this.showStatusMessage('Error saving entry: ' + error.message, 5000);
            }
          };
          actions.insertBefore(saveBtn, editButton);

          const cancelBtn = document.createElement('button');
          cancelBtn.id = 'cancel-edit-entry-button';
          cancelBtn.className = 'modal-button cancel-button';
          cancelBtn.textContent = 'Cancel';
          cancelBtn.onclick = () => {
            isEditMode = false;
            renderFields();
            saveBtn.remove();
            cancelBtn.remove();
          };
          actions.insertBefore(cancelBtn, editButton);
        }
      }
    };

    // Set up delete button (unchanged)
    deleteButton.onclick = async () => {
      const confirmed = confirm(`Are you sure you want to delete Entry ${entryIndex + 1}? This action cannot be undone.`);
      if (!confirmed) {
        return;
      }
      try {
        const { ipcRenderer } = require('electron');
        await ipcRenderer.invoke('delete-record', {
          name: fileName,
          index: entryIndex
        });
        overlay.classList.add('hidden');
        const recordData = await ipcRenderer.invoke('load-record', fileName);
        this.displayRecord(recordData, fileName);
        window.dispatchEvent(new CustomEvent('currentRecordUpdate', { detail: recordData }));
        this.showStatusMessage(`Success: Entry ${entryIndex + 1} deleted successfully`);
      } catch (error) {
        this.showStatusMessage(`Error: Failed to delete entry: ${error.message}`, 5000);
      }
    };

    // Show modal
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('role', 'dialog');
    const appMain = document.querySelector('main');
    if (appMain) appMain.setAttribute('aria-hidden', 'true');
    const firstFocusable = overlay.querySelector('button, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }
}

// Add TemplateUIManager
class TemplateUIManager {
  constructor() {
    this.customTemplateFields = [];
  }

  renderTemplateFieldsPreview() {
    const list = document.getElementById('template-fields-list');
    if (!list) {
      console.error('Template fields list element not found');
      return;
    }
    list.innerHTML = '';
    this.customTemplateFields.forEach((field, index) => {
      const li = document.createElement('li');
      li.textContent = `${field.name} (${field.type})`;
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginLeft = '1em';
      removeBtn.addEventListener('click', () => {
        this.customTemplateFields.splice(index, 1);
        this.renderTemplateFieldsPreview();
      });
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
  }

  addTemplateField(name, type) {
    this.customTemplateFields.push({ name, type });
    this.renderTemplateFieldsPreview();
  }

  getCustomTemplateFields() {
    return [...this.customTemplateFields];
  }

  clearCustomTemplateFields() {
    this.customTemplateFields = [];
    this.renderTemplateFieldsPreview();
  }

  hasFieldName(name) {
    return this.customTemplateFields.find(field => field.name === name);
  }

  async refreshTemplateDropdown(dropdownManager, templates) {
    dropdownManager.createDropdown('template-dropdown', templates, '-- Select a Template --');
    dropdownManager.setupDropdownWithConfirm('template-dropdown', 'select-template-confirm');
  }

  async refreshRecordDropdowns(dropdownManager, records) {
    dropdownManager.createDropdown('record-dropdown', records, '-- Select a Record --');
    dropdownManager.setupDropdownWithConfirm('record-dropdown', 'select-record-confirm');
    dropdownManager.createDropdown('record-select', records, '-- Choose a Record --');
    dropdownManager.setupDropdownWithConfirm('record-select', 'view-record-button');
  }
}

// Record Preview Display Manager
class RecordPreviewDisplayManager {
  constructor() {
    this.titleElement = null;
    this.contentElement = null;
  }
  // Display record preview in the UI
  displayRecordPreview(recordData) {
    this.titleElement = document.getElementById('record-preview-title');
    this.contentElement = document.getElementById('record-preview-content');
    if (!this.titleElement || !this.contentElement) {
      console.error('Record preview elements not found');
      return;
    }
    // Clear previous content
    this.contentElement.innerHTML = '';
    // Display previews and title
    const previewSection = document.createElement('div');
    previewSection.innerHTML = `<h3>View Records (${recordData.length})</h3>`;
    if (recordData.length === 0) {
      previewSection.innerHTML += '<p>No records found.</p>';
    } else {
      const recordsList = document.createElement('div');
      recordsList.className = 'records-list';
      recordData.forEach((record, index) => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'card-row record-preview-card';
        recordDiv.setAttribute('data-record-id', record.name);
        recordDiv.innerHTML = `<h4>${record.name}</h4>`;
        recordDiv.tabIndex = 0;
        recordDiv.style.cursor = 'pointer';
        recordDiv.setAttribute('role', 'button');
        recordDiv.setAttribute('aria-label', `View record ${record.name}`);
        const fieldsList = document.createElement('ul');
        record.fields.forEach(field => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${field.name}:</strong> ${field.type}`;
          fieldsList.appendChild(li);
        });
        recordDiv.appendChild(fieldsList);
        recordsList.appendChild(recordDiv);
      });
      previewSection.appendChild(recordsList);
    }
    this.contentElement.appendChild(previewSection);
  }
}

module.exports = {
  DropdownManager,
  ScreenManager,
  RecordDisplayManager,
  TemplateUIManager,
  RecordPreviewDisplayManager
};