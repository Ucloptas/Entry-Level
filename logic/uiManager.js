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

// Export the managers
module.exports = {
  DropdownManager,
  ScreenManager
}; 