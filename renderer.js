let currentTemplate = null;
let collectedEntries = [];

document.addEventListener('DOMContentLoaded', () => {
  // === SCREEN NAVIGATION ===
  document.querySelectorAll('.big-button').forEach(button => {
    button.addEventListener('click', () => {
      const screenId = button.getAttribute('data-screen');
      showScreen(screenId);
    });
  });

  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => {
      const screenId = button.getAttribute('data-screen');
      showScreen(screenId);
    });
  });

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
  }

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
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  document.getElementById('toggle-dark-mode')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // === TEMPLATE DROPDOWN LOGIC ===
  const dropdown = document.getElementById('template-select');
  const confirmTemplateButton = document.getElementById('select-template-confirm');

  if (dropdown) {
    window.electronAPI.listTemplates().then(templates => {
      dropdown.innerHTML = '<option value="">-- Select a Template --</option>';
      templates.forEach(t => {
        const option = document.createElement('option');
        option.value = t.name;
        option.textContent = `[${t.source}] ${t.name}`;
        dropdown.appendChild(option);
      });
    });

    dropdown.addEventListener('change', () => {
      confirmTemplateButton.disabled = !dropdown.value;
    });

    confirmTemplateButton.addEventListener('click', async () => {
      const selected = dropdown.value;
      if (!selected) return;

      currentTemplate = await window.electronAPI.loadTemplate(selected);
      collectedEntries = [];
      renderForm(currentTemplate.fields);
      displayEntries();
      showScreen('entry-form-screen');
    });
  }

  // === FORM ACTIONS ===
  document.getElementById('add-entry')?.addEventListener('click', () => {
    const entry = readFormData(currentTemplate.fields);
    collectedEntries.push(entry);
    displayEntries();
    clearForm(currentTemplate.fields);
  });

  document.getElementById('save-entry')?.addEventListener('click', async () => {
    if (collectedEntries.length === 0) {
      showStatusMessage('No entries to save.');
      return;
    }

    const recordData = {
      template: {
        name: currentTemplate.name || 'untitled',
        fields: currentTemplate.fields
      },
      entries: collectedEntries
    };

    const safeName = (currentTemplate.name || 'untitled').replace(/\s+/g, '_').toLowerCase();
    const fileName = `${safeName}-${Date.now()}.json`;


    await window.electronAPI.saveRecord({
      name: fileName,
      data: recordData
    });

    collectedEntries = [];
    renderForm(currentTemplate.fields);
    clearForm(currentTemplate.fields);
    displayEntries();
    showStatusMessage('Record saved!');
  });

// === LOAD RECORD DROPDOWN ===
const recordDropdown = document.getElementById('record-select');
const confirmRecordBtn = document.getElementById('view-record-button');

if (recordDropdown) {
  window.electronAPI.listRecords().then(files => {
    recordDropdown.innerHTML = '<option value="">-- Choose a Record --</option>';
    files.forEach(file => {
      const option = document.createElement('option');
      option.value = file;
      option.textContent = file;
      recordDropdown.appendChild(option);
    });
  });

  recordDropdown.addEventListener('change', () => {
    confirmRecordBtn.disabled = !recordDropdown.value;
  });

  confirmRecordBtn.addEventListener('click', async () => {
    const selected = recordDropdown.value;

    if (!selected) return;
    
    const nextEntries = document.getElementById('next-entries');
    const previousEntries = document.getElementById('previous-entries');
    const recordData = await window.electronAPI.loadRecord(selected);
    const content = document.getElementById('content');
    let array = [];
    let index = 0;

    content.innerHTML = '';
    array = Object.entries(recordData.entries);

    if(array.length > 5) {
      nextEntries.classList.remove('hidden');
      previousEntries.classList.remove('hidden');
    }

    showEntries(array, index, content);

    document.getElementById('next-entries').addEventListener('click', () => {
      if(!(index+5 > array.length) && !(index === array.length)){
        index += 5;
        showEntries(array, index, content);
      }
      console.log(index);
    });
    
    document.getElementById('previous-entries').addEventListener('click', () => {
      if(!(index-5 < 0) && !(index === 0)){
        index -= 5;
        showEntries(array, index, content);
      }
      console.log(index);
    });

    console.log('array is: ', array);

    document.getElementById('record-name').textContent = selected.split('.').slice(0, -1);

    // You can route to a display screen and use recordData.template / recordData.entries
    console.log('Loaded record:', recordData);

    // For now just show a toast
    showStatusMessage(`Loaded: ${selected}`);
  });
}

//Function to show 5 entries per page at max
function showEntries(arr, index, content){
  content.textContent = '';

  const end = Math.min(index+5, arr.length);

  for(let i = index; i < end; i++){
    Object.entries(arr[i][1]).forEach(([key, value]) => {
      content.textContent += `${key}: ${value}\n`;
    });
    content.textContent += '\n';
  }
}

// === CREATE NEW TEMPLATE === //
let customTemplateFields = [];

document.getElementById('add-field-button')?.addEventListener('click', () => {
  const name = document.getElementById('field-name-input').value.trim();
  const type = document.getElementById('field-type-select').value;

  if (!name) {
    showStatusMessage('Field name cannot be empty.');
    return;
  }

  customTemplateFields.push({ name, type });
  renderTemplateFieldsPreview();
  document.getElementById('field-name-input').value = '';
});

function renderTemplateFieldsPreview() {
  const list = document.getElementById('template-fields-list');
  list.innerHTML = '';
  customTemplateFields.forEach((field, index) => {
    const li = document.createElement('li');
    li.textContent = `${field.name} (${field.type})`;
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.marginLeft = '1em';
    removeBtn.addEventListener('click', () => {
      customTemplateFields.splice(index, 1);
      renderTemplateFieldsPreview();
    });

    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

document.getElementById('save-template-button')?.addEventListener('click', async () => {
  const nameInput = document.getElementById('template-name-input');
  const templateName = nameInput.value.trim();

  if (!templateName) {
    showStatusMessage('Template name is required.');
    return;
  }

  if (customTemplateFields.length === 0) {
    showStatusMessage('You must add at least one field.');
    return;
  }

    const exists = await window.electronAPI.checkTemplateExists(templateName);
  if (exists) {
    showStatusMessage('Template already exists. Choose a different name.');
    return;
  }

  try {
    await window.electronAPI.createTemplate({
      name: templateName,
      fields: customTemplateFields
    });

    showStatusMessage('Template saved!');
    nameInput.value = '';
    customTemplateFields = [];
    renderTemplateFieldsPreview();
    await refreshTemplateDropdown();
    showScreen('new-record-screen');
  } catch (err) {
    console.error(err);
    showStatusMessage('Failed to save template.');
  }
});


});

// === EXISTING TEMPLATE === //
async function refreshTemplateDropdown() {
  const dropdown = document.getElementById('template-select');
  const confirmTemplateButton = document.getElementById('select-template-confirm');
  if (!dropdown) return;

  const templates = await window.electronAPI.listTemplates();
  dropdown.innerHTML = '<option value="">-- Select a Template --</option>';
  templates.forEach(t => {
    const option = document.createElement('option');
    option.value = t.name;
    option.textContent = `[${t.source}] ${t.name}`;
    dropdown.appendChild(option);
  });

  confirmTemplateButton.disabled = true;
}


// === FORM HELPERS ===
function renderForm(fields) {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = '';

  fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = `${field.name} (${field.type})`;
    label.style.display = 'block';

    const input = document.createElement('input');
    input.name = field.name;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        input.type = field.type;
        break;
      case 'boolean':
        input.type = 'checkbox';
        break;
      case 'money':
      case 'decimal':
        input.type = 'number';
        break;
      default:
        console.warn(`Unknown field type: ${field.type}, defaulting to text.`);
        input.type = 'text';
        break;
    }

    label.appendChild(input);
    formContainer.appendChild(label);
  });
}

function readFormData(fields) {
  const entry = {};
  fields.forEach(field => {
    const input = document.querySelector(`[name="${field.name}"]`);
    if (!input) return;
    if (field.type === 'boolean') {
      entry[field.name] = input.checked;
    } else if (field.type === 'number' || field.type === 'money' || field.type === 'decimal') {
      entry[field.name] = parseFloat(input.value);
    } else {
      entry[field.name] = input.value;
    }
  });
  return entry;
}

function clearForm(fields) {
  fields.forEach(field => {
    const input = document.querySelector(`[name="${field.name}"]`);
    if (!input) return;
    if (field.type === 'boolean') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });
}

function displayEntries() {
  const display = document.getElementById('entries-display');
  display.innerHTML = '';

  collectedEntries.forEach((entry, idx) => {
    const div = document.createElement('div');
    div.style.marginBottom = '0.5em';
    div.classList.add('entry-row');
    div.textContent = `Entry ${idx + 1}: ${JSON.stringify(entry)}`;
    display.appendChild(div);
  });
}

function showStatusMessage(text) {
  const msgBox = document.getElementById('status-message');
  if (!msgBox) return;

  msgBox.textContent = text;
  msgBox.classList.remove('hidden');

  setTimeout(() => {
    msgBox.classList.add('hidden');
  }, 3000);
}
