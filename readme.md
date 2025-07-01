# Entry-Level

**Entry-Level** is a cross-platform desktop application built with [Electron](https://www.electronjs.org/) that allows users to define templates and collect structured data entries based on those templates. It is currently in active development as part of a software engineering course project.

---

##  Features

- Create and manage templates
- Generate structured records based on templates
- View, edit, and delete saved records
- Modal UI for settings and confirmation prompts
- Dark mode with system preference detection
- Local file-based JSON storage (no server or cloud required)

---

##  Project Structure

| File / Folder                  | Purpose                                                                 |
|-------------------------------|-------------------------------------------------------------------------|
| `index.html`                  | Base UI layout for all app screens                                     |
| `style.css`                   | All visual styling, including theme variables and dark mode            |
| `renderer.js`                 | Handles UI logic, screen switching, modals, template/record interactions |
| `main.js`                     | Electron entry point; sets up main window and IPC communication        |
| `preload.js`                  | Securely exposes backend functionality to the renderer (via `contextBridge`) |
| `logic/fileUtils.js`         | Low-level file I/O utilities for JSON templates and records            |
| `logic/templateManager.js`   | Loads and manages templates (default and user-created)                 |
| `logic/recordManager.js`     | Loads, saves, and modifies individual record files                     |
| `templates/`                  | Contains bundled template JSON (e.g., `defaultTemplates.json`)         |
| `records/`                    | Folder created at runtime to store all user-generated records          |

> Storage location: Electron uses `app.getPath('userData')` to create `entry-level/` within the user’s OS-specific AppData or config directory. The `records/` and `templates/` folders live inside that.

---

##  Prerequisites

- **Node.js**: Install the LTS version from [https://nodejs.org](https://nodejs.org)
- (Optional) **Git**: For cloning the repo

Check installation:

```bash
node -v
npm -v
```

---

##  Setup Instructions

1. Clone or download the repository:

```bash
git clone https://github.com/your-org/entry-level.git
cd entry-level
```

2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm start
```

The Electron app will launch.

---

##  Development Guide

### Where to Make Changes

| Task Type                         | File / Location             |
|----------------------------------|-----------------------------|
| Modify UI layout or new screens  | `index.html`                |
| Change styling or themes         | `style.css`                 |
| Handle UI logic or screen flow   | `renderer.js`               |
| Add new modals or UI components  | `index.html` + `renderer.js` |
| Create / update template logic   | `logic/templateManager.js`  |
| Add record editing/saving logic  | `logic/recordManager.js`    |
| File read/write utilities        | `logic/fileUtils.js`        |
| Electron startup and IPC setup   | `main.js` + `preload.js`    |

> When in doubt, keep business logic in `logic/`, and limit `renderer.js` to display/interaction logic.

---

##  Contributing

### Creating a New Branch

1. Make sure you are on the correct base branch (usually `main`):

```bash
git checkout main
git pull
```

2. Create and switch to a new branch:

```bash
git checkout -b your-feature-name
```

3. When ready, commit and push:

```bash
git add .
git commit -m "Your message"
git push -u origin your-feature-name
```

4. Submit a pull request on GitHub.

### Guidelines

- Keep pull requests focused and scoped
- Do not mix UI and backend logic in one file
- Follow the current CSS and HTML conventions for consistency
- Avoid using `alert()` — use the status message system (`#status-message` toast) instead
- Use dark-mode compatible colors from `:root` theme variables
- Always handle errors gracefully and display a user-friendly message

---

##  Runtime Data Location

- Templates and records are stored in:
  ```
  %APPDATA%/entry-level/ (Windows)
  ~/.config/entry-level/ (Linux)
  ~/Library/Application Support/entry-level/ (macOS)
  ```

- Files are stored as `.json` with filenames like:
  ```
  template_name-timestamp.json
  ```

---

##  Notes

- The app does not require an internet connection
- Planned features include: record search, filtering, customizable entry views, and export
- Contributions are tracked but not publicly credited at this time

---

Let us know if you need help setting up or contributing.
