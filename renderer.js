window.addEventListener('DOMContentLoaded', async () => {
    const templateName = 'volunteer-log'; // Hardcoded for now
    const template = await window.electronAPI.loadTemplate(templateName);
  
    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = ''; // Clear just in case
  
    // Build form fields
    template.fields.forEach(field => {
      const label = document.createElement('label');
      label.textContent = field.name;
  
      let input;
      switch (field.type) {
        case 'text':
        case 'number':
        case 'date':
          input = document.createElement('input');
          input.type = field.type;
          break;
        case 'boolean':
          input = document.createElement('input');
          input.type = 'checkbox';
          break;
        default:
          input = document.createElement('input');
      }
  
      input.name = field.name;
      label.appendChild(input);
      formContainer.appendChild(label);
      formContainer.appendChild(document.createElement('br'));
    });
  
    // Save button logic
    document.getElementById('save-entry').addEventListener('click', async () => {
      const entry = {};
  
      template.fields.forEach(field => {
        const input = document.querySelector(`[name="${field.name}"]`);
        if (field.type === 'boolean') {
          entry[field.name] = input.checked;
        } else if (field.type === 'number') {
          entry[field.name] = parseFloat(input.value);
        } else {
          entry[field.name] = input.value;
        }
      });
  
      const recordData = {
        templateName: template.templateName,
        created: new Date().toISOString(),
        fields: template.fields,
        entries: [entry]
      };
  
      await window.electronAPI.saveRecord({
        name: `${templateName.toLowerCase()}-demo.json`,
        data: recordData
      });
  
      alert('Record saved!');
    });
  });
  