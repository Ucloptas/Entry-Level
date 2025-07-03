# Entry-Level - Comprehensive Development Guide

**Entry-Level** is a cross-platform desktop application built with [Electron](https://www.electronjs.org/) that allows users to define templates and collect structured data entries based on those templates. This document serves as a complete guide for team members to understand the codebase architecture, contribute effectively, and maintain code quality.

---

##  Architecture Overview

The application follows a **modular architecture** with clear separation of concerns:

```
Entry-Level/
├── main.js                 # Electron main process (backend)
├── preload.js             # Secure bridge between main/renderer
├── renderer.js            # Frontend logic and event handlers
├── index.html             # UI structure and screens
├── style.css              # Styling and theming
├── logic/                 # Business logic modules
│   ├── uiManager.js       # UI components and screen management
│   ├── formManager.js     # Form rendering and data handling
│   ├── entryManager.js    # Entry collection and display
│   ├── validationManager.js # Input validation and error handling
│   ├── templateManager.js # Template CRUD operations
│   ├── recordManager.js   # Record CRUD operations
│   └── fileUtils.js       # Low-level file I/O utilities
└── EntryLevelData/        # Default data and templates
    ├── templates/
    │   └── defaultTemplates.json
    └── records/
```

---

##  File-by-File Breakdown

### Core Application Files

#### `main.js` - Electron Main Process
- **Purpose**: Entry point for the Electron application
- **Responsibilities**:
  - Creates and manages the main browser window
  - Sets up IPC (Inter-Process Communication) handlers
  - Initializes user data directories
  - Seeds default templates on first run
- **Key Functions**:
  - `createWindow()`: Sets up the main application window
  - `seedDefaultTemplatesIfMissing()`: Copies default templates to user data
  - IPC handlers for template/record operations
- **When to Modify**: Adding new backend functionality, changing window properties, adding new IPC handlers

#### `preload.js` - Secure Bridge
- **Purpose**: Securely exposes backend functionality to the renderer process
- **Responsibilities**:
  - Creates instances of all logic modules
  - Exposes safe APIs via `contextBridge`
  - Handles communication between main and renderer processes
- **Key Exposures**:
  - `window.electronAPI`: Backend operations (templates, records)
  - `window.uiManager`: UI management functions
- **When to Modify**: Adding new backend APIs, changing exposed functions

#### `renderer.js` - Frontend Logic
- **Purpose**: Handles all user interactions and UI state management
- **Responsibilities**:
  - Event listeners for buttons and forms
  - Screen navigation logic
  - Modal management (settings, exit)
  - Dark mode detection and toggle
  - Template/record selection logic
- **Key Patterns**:
  - Uses `window.uiManager` for UI operations
  - Uses `window.electronAPI` for backend operations
  - Modular event handling with clear separation
- **When to Modify**: Adding new UI interactions, changing screen flow, adding new features

### UI and Styling

#### `index.html` - Application Structure
- **Purpose**: Defines all application screens and UI components
- **Structure**:
  - Main menu with navigation buttons
  - Template selection and creation screens
  - Record management screens
  - Entry form screen
  - Modal overlays (settings, exit)
- **Key Elements**:
  - `.screen` class for different application views
  - `.hidden` class for visibility control
  - Data attributes for screen navigation
- **When to Modify**: Adding new screens, changing UI layout, adding new form fields

#### `style.css` - Visual Design
- **Purpose**: All visual styling, theming, and responsive design
- **Features**:
  - CSS custom properties for theming
  - Dark mode support
  - Responsive design patterns
  - Modal and overlay styling
  - Form and button styling
- **Key Sections**:
  - CSS variables for colors and spacing
  - Screen management styles
  - Modal and overlay styles
  - Form and input styles
  - Dark mode overrides
- **When to Modify**: Changing visual design, adding new UI components, updating themes

### Business Logic Modules (`logic/`)

#### `uiManager.js` - UI Component Management
- **Purpose**: Centralized UI management and reusable components
- **Classes**:
  - `DropdownManager`: Handles dropdown creation and interaction
  - `ScreenManager`: Manages screen visibility and navigation
  - `RecordDisplayManager`: Formats and displays record data
  - `TemplateUIManager`: Handles template creation UI
- **Key Methods**:
  - `createDropdown()`: Creates and populates dropdowns
  - `showScreen()`: Manages screen visibility
  - `displayRecord()`: Formats record data for display
- **When to Modify**: Adding new UI components, changing screen behavior, improving user experience

#### `formManager.js` - Form Handling
- **Purpose**: Dynamic form rendering and data collection
- **Key Features**:
  - Dynamic form generation based on field definitions
  - Type-specific input handling (text, number, date, boolean, money, decimal)
  - Form data reading and type conversion
  - Form clearing functionality
- **Supported Field Types**:
  - `text`: Standard text input
  - `number`: Integer input
  - `date`: Date picker
  - `boolean`: Checkbox
  - `money`: Decimal with 2 places
  - `decimal`: Decimal with 1 place
- **When to Modify**: Adding new field types, changing form behavior, improving data handling

#### `entryManager.js` - Entry Collection
- **Purpose**: Manages collections of form entries
- **Key Features**:
  - Add/remove entries from collection
  - Entry validation and formatting
  - Display management for entry lists
  - Merge and replace operations
- **Key Methods**:
  - `addEntry()`: Adds new entry to collection
  - `updateDisplay()`: Refreshes entry display
  - `validateEntries()`: Validates entry collection
- **When to Modify**: Changing entry handling, adding new entry features, improving display

#### `validationManager.js` - Input Validation
- **Purpose**: Comprehensive validation and error handling
- **Validation Types**:
  - Template name validation (length, characters)
  - Field name validation (length, characters, uniqueness)
  - Field type validation (supported types)
  - Form data validation (required fields, type checking)
  - Record data validation
- **Key Features**:
  - Status message system (success, error, warning)
  - Detailed error reporting
  - Type-specific validation rules
- **When to Modify**: Adding new validation rules, changing error messages, improving validation logic

#### `templateManager.js` - Template Operations
- **Purpose**: Template CRUD operations and management
- **Key Features**:
  - Load/save templates from user data
  - Template existence checking
  - Default template seeding
  - Template listing and organization
- **Storage**: Templates stored in user data directory as JSON files
- **When to Modify**: Adding new template features, changing template structure, improving template management

#### `recordManager.js` - Record Operations
- **Purpose**: Record CRUD operations and management
- **Key Features**:
  - Load/save records from user data
  - Record listing and organization
  - Record file management
- **Storage**: Records stored in user data directory as JSON files
- **When to Modify**: Adding new record features, changing record structure, improving record management

#### `fileUtils.js` - File Operations
- **Purpose**: Low-level file I/O utilities
- **Key Features**:
  - Directory creation and management
  - File existence checking
  - Basic file operations
- **When to Modify**: Adding new file operations, changing file handling, improving error handling

### Data and Templates

#### `EntryLevelData/` - Default Data
- **Purpose**: Contains default templates and data structures
- **Structure**:
  - `templates/defaultTemplates.json`: Pre-built templates
  - `records/`: Directory for user-generated records
- **Default Templates**: Example templates showing different field types and structures
- **When to Modify**: Adding new default templates, changing template examples

---

##  Data Flow and State Management

### Application State
The application maintains state through several key variables:
- `currentTemplate`: Currently selected template for entry creation
- `currentRecord`: Currently selected record for adding entries
- Screen state managed by `ScreenManager`
- Entry collections managed by `EntryManager`

### Data Flow Patterns
1. **Template Selection**: User selects template → `renderer.js` loads template → `uiManager` renders form
2. **Entry Creation**: User fills form → `formManager` reads data → `validationManager` validates → `entryManager` adds entry
3. **Record Saving**: `entryManager` provides entries → `renderer.js` calls `electronAPI` → `main.js` saves to file
4. **Record Loading**: User selects record → `renderer.js` calls `electronAPI` → `main.js` loads file → `uiManager` displays

### IPC Communication
- **Main → Renderer**: Via `preload.js` exposed APIs
- **Renderer → Main**: Via `window.electronAPI` methods
- **UI Operations**: Via `window.uiManager` methods

---

##  UI/UX Guidelines

### How the UI Works - Screen Switching System

The application uses a **single-page application (SPA)** approach where all screens exist in the HTML at once, but only one is visible at a time. This system is designed to be simple and doesn't require complex routing libraries.

#### HTML Structure for Screens
Every screen in the application follows this pattern in `index.html`:

```html
<div id="screen-name" class="screen hidden">
  <h2>Screen Title</h2>
  <!-- Screen content goes here -->
  <button class="big-button back-button" data-screen="previous-screen">Back</button>
</div>
```

**Key Elements:**
- `id="screen-name"`: Unique identifier for the screen
- `class="screen"`: Marks this as a screen container
- `class="hidden"`: Initially hides the screen (CSS handles this)
- `data-screen="previous-screen"`: Tells the back button which screen to show

#### CSS for Screen Management
The screen visibility is controlled by CSS in `style.css`:

```css
.screen {
  /* Screen styling */
}

.screen.hidden {
  display: none; /* Hides the screen completely */
}
```

**How it works:**
- All screens start with both `.screen` and `.hidden` classes
- When a screen should be shown, the `.hidden` class is removed
- When a screen should be hidden, the `.hidden` class is added back

#### JavaScript Screen Switching
The screen switching logic is in `renderer.js` and uses the `ScreenManager` class from `uiManager.js`:

```javascript
// In renderer.js - Event listeners for navigation
const bigButtons = document.querySelectorAll('.big-button');
bigButtons.forEach(button => {
  button.addEventListener('click', () => {
    const screenId = button.getAttribute('data-screen');
    showScreen(screenId);
  });
});

function showScreen(id) {
  window.uiManager.showScreen(id);
}
```

**The `showScreen()` function does this:**
1. Finds all elements with class `.screen`
2. Adds `.hidden` class to all screens (hides everything)
3. Removes `.hidden` class from the target screen (shows it)

#### Adding a New Screen - Step by Step

**Step 1: Add HTML Structure**
Add this to `index.html` in the appropriate location:

```html
<div id="my-new-screen" class="screen hidden">
  <h2>My New Screen</h2>
  
  <!-- Your screen content here -->
  <div class="button-group">
    <button class="big-button" data-screen="main-menu">Back to Menu</button>
  </div>
</div>
```

**Step 2: Add Navigation to Your Screen**
Add a button somewhere that links to your new screen:

```html
<button class="big-button" data-screen="my-new-screen">Go to My Screen</button>
```

**Step 3: Add CSS Styling (if needed)**
Add any custom styling to `style.css`:

```css
#my-new-screen {
  /* Your custom styles */
}
```

**Step 4: Add JavaScript Logic (if needed)**
If your screen needs special behavior, add it to `renderer.js`:

```javascript
// Add event listeners for elements in your screen
document.getElementById('my-screen-button')?.addEventListener('click', () => {
  // Your logic here
});
```

#### Common UI Patterns

**Button Types:**
- `class="big-button"`: Main navigation buttons
- `class="modal-button"`: Smaller buttons for forms/modals
- `class="back-button"`: Navigation back to previous screen

**Button Navigation:**
- `data-screen="screen-id"`: Navigate to specific screen
- No `data-screen`: Regular button (no navigation)

**Container Classes:**
- `class="button-group"`: Groups buttons together
- `class="dropdown-select-wrapper"`: Wraps dropdown selects
- `class="field-creator"`: Groups form field creation elements

#### Modal System
Modals work similarly but overlay on top of the current screen:

```html
<div id="modal-overlay" class="modal-overlay hidden">
  <div class="modal-content">
    <h2>Modal Title</h2>
    <!-- Modal content -->
    <button id="close-modal" class="modal-button">Close</button>
  </div>
</div>
```

**Modal CSS:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  /* Modal styling */
}
```

#### Form Design
- Dynamic form generation based on template fields
- Type-specific input controls
- Validation feedback via status messages
- Clear visual hierarchy and spacing

#### Dark Mode
- Automatic detection of system preference
- Manual toggle available in settings
- CSS variables for consistent theming
- Smooth transitions between modes

---

##  Development Workflow

### Setting Up Development Environment

1. **Prerequisites**:
   ```bash
   node -v  # Should be LTS version
   npm -v   # Should be recent version
   ```

2. **Installation**:
   ```bash
   git clone <repository-url>
   cd Entry-Level
   npm install
   ```

3. **Running the Application**:
   ```bash
   npm start
   ```

### Development Guidelines

#### Code Organization
- **Business Logic**: Always goes in `logic/` modules
- **UI Logic**: Keep in `renderer.js` for event handling
- **Styling**: Use CSS variables for consistency
- **Validation**: Centralize in `validationManager.js`

#### Adding New Features
1. **UI Changes**: Modify `index.html` and `style.css`
2. **Logic Changes**: Add to appropriate `logic/` module
3. **Backend Changes**: Add IPC handlers in `main.js`
4. **API Exposure**: Update `preload.js` to expose new functions
5. **Event Handling**: Add listeners in `renderer.js`

#### File Naming Conventions
- **Modules**: camelCase (e.g., `templateManager.js`)
- **Classes**: PascalCase (e.g., `TemplateManager`)
- **Functions**: camelCase (e.g., `createTemplate`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FIELD_LENGTH`)

#### Error Handling
- Always validate user input
- Provide clear error messages via `validationManager`
- Handle file operations gracefully
- Log errors for debugging

### Testing and Debugging

#### Debugging Tools
- **Developer Tools**: Available in Electron (Ctrl+Shift+I)
- **Console Logging**: Extensive logging throughout the application
- **Status Messages**: User feedback via toast notifications

#### Common Issues
- **Screen Not Showing**: Check `data-screen` attributes and CSS classes
- **Form Not Rendering**: Verify template structure and field definitions
- **Data Not Saving**: Check file permissions and user data directory
- **Validation Errors**: Review field types and validation rules

---

##  Data Structures

### Template Structure
```json
{
  "name": "Template Name",
  "fields": [
    {
      "name": "Field Name",
      "type": "text|number|date|boolean|money|decimal"
    }
  ]
}
```

### Record Structure
```json
{
  "template": {
    "name": "Template Name",
    "fields": [...]
  },
  "entries": [
    {
      "field1": "value1",
      "field2": "value2"
    }
  ]
}
```

### Field Types
- **text**: String input
- **number**: Integer input
- **date**: Date picker (YYYY-MM-DD format)
- **boolean**: Checkbox (true/false)
- **money**: Decimal with 2 places (0.00)
- **decimal**: Decimal with 1 place (0.0)

---

##  Configuration and Customization

### User Data Location
- **Windows**: `%APPDATA%/entry-level/`
- **macOS**: `~/Library/Application Support/entry-level/`
- **Linux**: `~/.config/entry-level/`

### Default Templates
- Stored in `EntryLevelData/templates/defaultTemplates.json`
- Copied to user data on first run
- Can be customized for different use cases

### Styling Customization
- CSS variables in `:root` for easy theming
- Dark mode support with automatic detection
- Responsive design for different screen sizes

---

##  Deployment and Distribution

### Building for Distribution
1. **Development**: `npm start`
2. **Production**: Use Electron Builder or similar tool
3. **Packaging**: Create platform-specific installers

### Distribution Considerations
- User data directory creation
- Default template seeding
- File permission handling
- Cross-platform compatibility

---

##  Contributing Guidelines

### Code Review Checklist
- [ ] Business logic in appropriate `logic/` module
- [ ] UI changes follow existing patterns
- [ ] Error handling implemented
- [ ] Validation added where needed
- [ ] Documentation updated

---

##  Future Development

### Planned Features
- Record search and filtering
- Customizable entry views
- Data export functionality
- Template categories and organization
- Advanced validation rules
- Data backup and restore

### Architecture Considerations
- Maintain modular structure
- Keep UI and business logic separated
- Use consistent error handling patterns
- Plan for scalability and extensibility

---

##  Getting Help

### Common Resources
- **Electron Documentation**: https://www.electronjs.org/docs
- **Node.js Documentation**: https://nodejs.org/docs
- **Project Issues**: Check GitHub issues for known problems
- **Team Communication**: Use team channels for questions

### Debugging Checklist
- [ ] Check browser console for errors
- [ ] Verify file permissions
- [ ] Check user data directory
- [ ] Validate template/record structure
- [ ] Test with different field types
- [ ] Verify IPC communication

---