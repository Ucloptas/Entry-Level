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
        option.textContent = t.name;
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
      alert('No entries to save.');
      return;
    }

    const recordData = {
      template: {
        name: currentTemplate.name,
        fields: currentTemplate.fields
      },
      entries: collectedEntries
    };

    const safeName = currentTemplate.name.replace(/\s+/g, '_').toLowerCase();
    await window.electronAPI.saveRecord({
      name: `${safeName}-${Date.now()}.json`,
      data: recordData
    });

    alert('Record saved!');
    collectedEntries = [];
    displayEntries();
  });
});

// === FORM HELPERS ===
function renderForm(fields) {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = '';

  fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = field.name;
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
      default:
        input.type = 'text';
    }

    label.appendChild(input);
    formContainer.appendChild(label);
  });
}

function readFormData(fields) {
  const entry = {};
  fields.forEach(field => {
    const input = document.querySelector(`[name="${field.name}"]`);
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
    div.textContent = `Entry ${idx + 1}: ${JSON.stringify(entry)}`;
    display.appendChild(div);
  });
}
