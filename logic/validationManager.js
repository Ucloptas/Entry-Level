// Validation Manager - Handles input validation, error handling, and status messages

class ValidationManager {
  constructor() {
    this.statusMessageElement = null;
  }

  // Validate template name
  validateTemplateName(name) {
    const errors = [];
    
    if (!name || typeof name !== 'string') {
      errors.push('Template name is required');
      return errors;
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      errors.push('Template name cannot be empty');
    }
    
    if (trimmedName.length > 50) {
      errors.push('Template name must be 50 characters or less');
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      errors.push('Template name contains invalid characters');
    }
    
    return errors;
  }

  // Validate template fields
  validateTemplateFields(fields) {
    const errors = [];
    
    if (!Array.isArray(fields)) {
      errors.push('Fields must be an array');
      return errors;
    }
    
    if (fields.length === 0) {
      errors.push('At least one field is required');
      return errors;
    }
    
    const fieldNames = new Set();
    
    fields.forEach((field, index) => {
      // Validate field structure
      if (!field || typeof field !== 'object') {
        errors.push(`Field ${index + 1}: Invalid field structure`);
        return;
      }
      
      if (!field.name || typeof field.name !== 'string') {
        errors.push(`Field ${index + 1}: Name is required`);
        return;
      }
      
      if (!field.type || typeof field.type !== 'string') {
        errors.push(`Field ${index + 1}: Type is required`);
        return;
      }
      
      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        errors.push(`Field name '${field.name}' is used more than once`);
        return;
      }
      fieldNames.add(field.name);
      
      // Validate field name
      const nameErrors = this.validateFieldName(field.name);
      errors.push(...nameErrors.map(err => `Field ${index + 1}: ${err}`));
      
      // Validate field type
      if (!this.isValidFieldType(field.type)) {
        errors.push(`Field ${index + 1}: Invalid type '${field.type}'`);
      }
    });
    
    return errors;
  }

  // Validate individual field name
  validateFieldName(name) {
    const errors = [];
    
    if (!name || typeof name !== 'string') {
      errors.push('Field name is required');
      return errors;
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      errors.push('Field name cannot be empty');
    }
    
    if (trimmedName.length > 30) {
      errors.push('Field name must be 30 characters or less');
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|*]/;
    if (invalidChars.test(trimmedName)) {
      errors.push('Field name contains invalid characters');
    }
    
    return errors;
  }

  // Check if field type is valid
  isValidFieldType(type) {
    const validTypes = ['text', 'number', 'date', 'boolean', 'money', 'decimal'];
    return validTypes.includes(type);
  }

  // Validate form data against template fields
  validateFormData(fields, formData) {
    const errors = [];
    
    if (!Array.isArray(fields)) {
      errors.push('Invalid fields definition');
      return errors;
    }
    
    if (!formData || typeof formData !== 'object') {
      errors.push('Invalid form data');
      return errors;
    }
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      // Check required fields
      if (value === undefined || value === null || value === '') {
        errors.push(`${field.name} is required`);
        return;
      }
      
      // Type-specific validation
      switch (field.type) {
        case 'number':
        case 'money':
        case 'decimal':
          if (isNaN(value) || typeof value !== 'number') {
            errors.push(`${field.name} must be a valid number`);
          }
          break;
        case 'date':
          if (value && !this.isValidDate(value)) {
            errors.push(`${field.name} must be a valid date`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field.name} must be a boolean value`);
          }
          break;
      }
    });
    
    return errors;
  }

  // Validate date string
  isValidDate(dateString) {
    if (!dateString) return true; // Allow empty dates
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Show status message
  showStatusMessage(text, duration = 3000) {
    this.statusMessageElement = document.getElementById('status-message');
    if (!this.statusMessageElement) {
      console.error('Status message element not found');
      return;
    }

    this.statusMessageElement.textContent = text;
    this.statusMessageElement.classList.remove('hidden');

    // Clear existing timeout
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    // Auto-hide after duration
    this.statusTimeout = setTimeout(() => {
      this.statusMessageElement.classList.add('hidden');
    }, duration);
  }

  // Show error message
  showErrorMessage(text, duration = 5000) {
    this.showStatusMessage(`Error: ${text}`, duration);
  }

  // Show success message
  showSuccessMessage(text, duration = 3000) {
    this.showStatusMessage(`Success: ${text}`, duration);
  }

  // Show warning message
  showWarningMessage(text, duration = 4000) {
    this.showStatusMessage(`Warning: ${text}`, duration);
  }

  // Validate record data structure
  validateRecordData(recordData) {
    const errors = [];
    
    if (!recordData || typeof recordData !== 'object') {
      errors.push('Invalid record data structure');
      return errors;
    }
    
    if (!recordData.template || typeof recordData.template !== 'object') {
      errors.push('Record must have a template');
      return errors;
    }
    
    if (!recordData.entries || !Array.isArray(recordData.entries)) {
      errors.push('Record must have an entries array');
      return errors;
    }
    
    // Validate template structure
    if (!recordData.template.name || !recordData.template.fields) {
      errors.push('Template must have name and fields');
      return errors;
    }
    
    // Validate template fields
    const fieldErrors = this.validateTemplateFields(recordData.template.fields);
    errors.push(...fieldErrors);
    
    // Validate entries against template
    recordData.entries.forEach((entry, index) => {
      const entryErrors = this.validateFormData(recordData.template.fields, entry);
      errors.push(...entryErrors.map(err => `Entry ${index + 1}: ${err}`));
    });
    
    return errors;
  }

  // Get validation summary
  getValidationSummary(errors) {
    if (errors.length === 0) {
      return { isValid: true, message: 'Validation passed' };
    }
    
    return {
      isValid: false,
      message: `Validation failed: ${errors.length} error(s)`,
      errors: errors
    };
  }
}

module.exports = {
  ValidationManager
}; 