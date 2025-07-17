// UI Manager - Handles reusable UI components and screen management

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




    // Enable/disable confirm button based on dropdown selection
    setupDropdownWithEditAndDelete(dropdownId, deleteButtonId, editButtonId) {
      const dropdown = document.getElementById(dropdownId);
      const deleteButton = document.getElementById(deleteButtonId);
      const editButton = document.getElementById(editButtonId);
      
      if (!dropdown || !deleteButton || !editButton) {
        console.error(`Dropdown or confirm button not found: ${dropdownId}, ${deleteButton}, ${editButton}`);
        return;
      }
  
      // Set initial state
      deleteButton.disabled = !dropdown.value;
      editButton.disabled = !dropdown.value;
  
      // Listen for changes
      dropdown.addEventListener('change', () => {
        deleteButton.disabled = !dropdown.value;
        editButton.disabled = !dropdown.value;
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
  }

  // Display record data in the UI
  displayRecord(recordData, fileName) {
    this.titleElement = document.getElementById('record-display-title');
    this.contentElement = document.getElementById('record-display-content');
    
    if (!this.titleElement || !this.contentElement) {
      console.error('Record display elements not found');
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
        entryDiv.className = 'entry-row';
        entryDiv.innerHTML = `<h4>Entry ${index + 1}</h4>`;




        //Mi codigo
        entryDiv.id = index;





        
        const fieldsList = document.createElement('ul');
        recordData.template.fields.forEach(field => {
          const value = entry[field.name] || 'N/A';
          const li = document.createElement('li');
          li.innerHTML = `<strong>${field.name}:</strong> ${value}`;
          fieldsList.appendChild(li);
        });
        
        entryDiv.appendChild(fieldsList);
        entriesList.appendChild(entryDiv);
      });
      
      entriesSection.appendChild(entriesList);
    }
    
    this.contentElement.appendChild(entriesSection);
  }
}

// Template UI Manager
class TemplateUIManager {
  constructor() {
    this.customTemplateFields = [];
  }

  // Refresh template dropdown
  async refreshTemplateDropdown(dropdownManager, templates) {
    dropdownManager.createDropdown('template-dropdown', templates, '-- Select a Template --');
    dropdownManager.setupDropdownWithConfirm('template-dropdown', 'select-template-confirm');
  }

  // Refresh record dropdowns
  async refreshRecordDropdowns(dropdownManager, records) {
    // Refresh "Create New Entry" dropdown
    dropdownManager.createDropdown('record-dropdown', records, '-- Select a Record --');
    dropdownManager.setupDropdownWithConfirm('record-dropdown', 'select-record-confirm');
    
    // Refresh "View Records" dropdown
    dropdownManager.createDropdown('record-select', records, '-- Choose a Record --');
    dropdownManager.setupDropdownWithConfirm('record-select', 'view-record-button');
  }

  // Render template fields preview
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

  // Add a field to the custom template
  addTemplateField(name, type) {
    this.customTemplateFields.push({ name, type });
    this.renderTemplateFieldsPreview();
  }

  // Get custom template fields
  getCustomTemplateFields() {
    return [...this.customTemplateFields];
  }

  // Clear custom template fields
  clearCustomTemplateFields() {
    this.customTemplateFields = [];
    this.renderTemplateFieldsPreview();
  }

  // Check if field name already exists
  hasFieldName(name) {
    return this.customTemplateFields.find(field => field.name === name);
  }
}

// Export the managers
module.exports = {
  DropdownManager,
  ScreenManager,
  RecordDisplayManager,
  TemplateUIManager
}; 