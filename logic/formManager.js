// Form Manager - Handles form rendering, data reading, and validation

class FormManager {
  constructor() {
    this.formContainer = null;
  }

  // Render a form based on field definitions
  renderForm(fields, containerId = 'form-container') {
    this.formContainer = document.getElementById(containerId);
    if (!this.formContainer) {
      console.error(`Form container with id '${containerId}' not found`);
      return;
    }

    this.formContainer.innerHTML = '';

    fields.forEach((field, idx) => {
      const label = document.createElement('label');
      // Ensure each input has a unique id
      const inputId = `form-field-${field.name.replace(/\s+/g, '-').toLowerCase()}-${idx}`;
      label.setAttribute('for', inputId);
      label.textContent = `${field.name} (${field.type})`;
      label.style.display = 'block';

      const input = document.createElement('input');
      input.name = field.name;
      input.id = inputId;

      // Set input type based on field type
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
          input.step = field.type === 'money' ? '0.01' : '0.1';
          break;
        default:
          console.warn(`Unknown field type: ${field.type}, defaulting to text.`);
          input.type = 'text';
          break;
      }

      label.appendChild(input);
      this.formContainer.appendChild(label);
    });
  }

  // Read form data and convert to appropriate types
  readFormData(fields, container) {
    const entry = {};
    const root = container || document;
    fields.forEach(field => {
      const input = root.querySelector(`[name="${field.name}"]`);
      if (!input) {
        console.warn(`Input field '${field.name}' not found`);
        return;
      }
      switch (field.type) {
        case 'boolean':
          entry[field.name] = input.checked;
          break;
        case 'number':
        case 'money':
        case 'decimal':
          const value = parseFloat(input.value);
          entry[field.name] = isNaN(value) ? 0 : value;
          break;
        case 'date':
          entry[field.name] = input.value || null;
          break;
        default:
          entry[field.name] = input.value;
          break;
      }
    });
    return entry;
  }

  // Clear all form fields
  clearForm(fields) {
    fields.forEach(field => {
      const input = document.querySelector(`[name="${field.name}"]`);
      if (!input) return;

      switch (field.type) {
        case 'boolean':
          input.checked = false;
          break;
        default:
          input.value = '';
          break;
      }
    });
  }

  // Note: Form validation is handled by ValidationManager
  // Use window.uiManager.validateFormData() for validation

  // Get form container reference
  getFormContainer() {
    return this.formContainer;
  }
}

module.exports = {
  FormManager
}; 