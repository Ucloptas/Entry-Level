// Entry Manager - Handles entry collection, display, and management

class EntryManager {
  constructor() {
    this.entries = [];
    this.displayContainer = null;
  }

  // Add a new entry to the collection
  addEntry(entry) {
    if (!entry || typeof entry !== 'object') {
      console.error('Invalid entry provided to addEntry');
      return false;
    }

    this.entries.push(entry);
    this.updateDisplay();
    return true;
  }

  // Remove an entry by index
  removeEntry(index) {
    if (index >= 0 && index < this.entries.length) {
      this.entries.splice(index, 1);
      this.updateDisplay();
      return true;
    }
    return false;
  }

  // Get all entries
  getEntries() {
    return [...this.entries]; // Return a copy to prevent external modification
  }

  // Get entry count
  getEntryCount() {
    return this.entries.length;
  }

  // Clear all entries
  clearEntries() {
    this.entries = [];
    this.updateDisplay();
  }

  // Update the display of entries
  updateDisplay(containerId = 'entries-display') {
    this.displayContainer = document.getElementById(containerId);
    if (!this.displayContainer) {
      console.error(`Entries display container with id '${containerId}' not found`);
      return;
    }

    this.displayContainer.innerHTML = '';

    if (this.entries.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No entries yet. Add some entries using the form above.';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.color = '#666';
      emptyMessage.style.fontStyle = 'italic';
      this.displayContainer.appendChild(emptyMessage);
      return;
    }

    this.entries.forEach((entry, idx) => {
      const entryDiv = document.createElement('div');
      entryDiv.style.marginBottom = '0.5em';
      entryDiv.classList.add('entry-row');
      
      // Create a more readable display format
      const entryText = this.formatEntryForDisplay(entry, idx + 1);
      entryDiv.textContent = entryText;
      
      this.displayContainer.appendChild(entryDiv);
    });
  }

  // Format an entry for display
  formatEntryForDisplay(entry, entryNumber) {
    const formattedFields = Object.entries(entry)
      .map(([key, value]) => {
        let displayValue = value;
        
        // Format different types for better display
        if (typeof value === 'boolean') {
          displayValue = value ? 'Yes' : 'No';
        } else if (typeof value === 'number') {
          displayValue = value.toString();
        } else if (value === null || value === undefined || value === '') {
          displayValue = 'N/A';
        }
        
        return `${key}: ${displayValue}`;
      })
      .join(', ');
    
    return `Entry ${entryNumber}: ${formattedFields}`;
  }

  // Validate entries before saving
  validateEntries(fields) {
    const errors = [];
    
    this.entries.forEach((entry, index) => {
      // Check if all required fields are present
      fields.forEach(field => {
        if (!(field.name in entry)) {
          errors.push(`Entry ${index + 1}: Missing field '${field.name}'`);
        }
      });
      
      // Check for extra fields that shouldn't be there
      Object.keys(entry).forEach(key => {
        if (!fields.find(f => f.name === key)) {
          errors.push(`Entry ${index + 1}: Unknown field '${key}'`);
        }
      });
    });
    
    return errors;
  }

  // Get entries as a formatted string for debugging
  getEntriesAsString() {
    return JSON.stringify(this.entries, null, 2);
  }

  // Check if entries collection is empty
  isEmpty() {
    return this.entries.length === 0;
  }

  // Get the last entry added
  getLastEntry() {
    return this.entries.length > 0 ? this.entries[this.entries.length - 1] : null;
  }

  // Merge entries from an existing record
  mergeFromRecord(recordEntries) {
    if (Array.isArray(recordEntries)) {
      this.entries = [...this.entries, ...recordEntries];
      this.updateDisplay();
      return true;
    }
    return false;
  }

  // Replace all entries with new ones
  replaceEntries(newEntries) {
    if (Array.isArray(newEntries)) {
      this.entries = [...newEntries];
      this.updateDisplay();
      return true;
    }
    return false;
  }
}

module.exports = {
  EntryManager
}; 