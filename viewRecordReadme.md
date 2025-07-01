# View Record Screen – Implementation Plan

This document outlines the design and feature set for the "View Record Screen" in the Entry-Level app.

---

##  Purpose

The View Record Screen will allow users to load and visually browse the contents of a saved record (a JSON file with a defined template and one or more entries). This is a read-only screen for now, with some future features outlined below.

---

##  Core Features

### 1. Paginated Display of Entries

- Each record file may contain many entries.
- Only a set number of entries (e.g., 5 per page) will be shown at once.
- Navigation buttons for Previous / Next will appear if more entries exist.
- The number per page can be a user setting (future feature).

### 2. Smart Card Design for Each Entry

- Each entry is rendered as a “card” UI element.
- Each card:
  - Shows all field names and values in a clean format
  - Displays `NULL` if any field is missing
  - Respects dark/light mode
  - Has a `...` menu icon to the top right for options

### 3. Record Actions Menu (Per Entry)

- Clicking the `...` will show:
  - **Edit** – opens a modal with editable fields
  - **(Delete is NOT implemented yet)**
- Editing opens a small modal that overlays the screen
- User clicks “Save Changes” to commit changes to memory
- Saved changes persist only when the user clicks a global Save button

### 4. Error Handling

- If a template cannot be found or matched, a status toast message appears. Styles/rules for this message already exist in the css file
- If malformed data is encountered in the record, the entry card will not be shown
- Errors do not crash the app

---

##  Excluded Features (for now)

- Search and filtering by field
- Category browsing
- Bulk actions
- Deletion
- Exporting
- Direct printing

---

##  Integration Considerations

- Requires `currentRecord` to be set properly when a record is loaded
- Ensure template is fetched and applied before rendering
- Uses the global `status-message` system for feedback

---

##  Suggested Files To Edit

- `renderer.js` – logic for loading and rendering the view
- `index.html` – add `view-record-screen` div
- `style.css` – card layout, modal styling, buttons
- `logic/recordLoader.js` – define helpers for loading and validating record/template data

---

##  Future Expansions

- Per-entry history/version tracking
- Commenting system
- Record comparison
- Export as CSV/PDF

