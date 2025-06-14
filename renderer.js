let currentTemplate = null;
let collectedEntries = [];

window.addEventListener('DOMContentLoaded', async () => {
  const templateName = 'volunteer-log'; // hardcoded for demo
  currentTemplate = await window.electronAPI.loadTemplate(templateName);

  const formContainer = document.getElementById('form-container');
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Entry';
  addBtn.id = 'add-entry';

  const entriesDisplay = document.createElement('div');
  entriesDisplay.id = 'entries-display';

  formContainer.after(addBtn, entriesDisplay);

  renderForm(currentTemplate.fields);

  document.getElementById('add-entry').addEventListener('click', () => {
    const entry = readFormData(currentTemplate.fields);
    collectedEntries.push(entry);
    displayEntries();
    clearForm(currentTemplate.fields);
  });

  document.getElementById('save-entry').addEventListener('click', async () => {
    if (collectedEntries.length === 0) {
      alert('No entries to save.');
      return;
    }

    const recordData = {
      templateName: currentTemplate.templateName,
      created: new Date().toISOString(),
      fields: currentTemplate.fields,
      entries: collectedEntries
    };

    await window.electronAPI.saveRecord({
      name: `${templateName.toLowerCase()}-${Date.now()}.json`,
      data: recordData
    });

    alert('Record saved!');
    collectedEntries = [];
    displayEntries(); // clears the list
  });
});

function renderForm(fields) {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = '';

  fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = field.name;
    label.style.display = 'block';

    let input = document.createElement('input');
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
    } else if (field.type === 'number') {
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
