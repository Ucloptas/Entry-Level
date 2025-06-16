# Entry Level

**Entry Level** is a cross-platform desktop application built with Electron that lets users define template structures and create records using those templates. This is an internal project for our software engineering course.

## Prerequisites

Before you can run this app, you’ll need:

### 1. Install [Node.js](https://nodejs.org/)
- Download the LTS version from the official site.
- After installing, verify with:

  ```bash
  node -v
  npm -v
  ```

### 2. (Optional) Install Git
- You’ll need Git to clone the repository.
- Download: https://git-scm.com/

---

## Getting the App on Your Machine

### 1. Clone the Repository

If you’re using Git:

```bash
git clone https://github.com/your-org/entry-level.git
cd entry-level
```

If not, just download the repo as a ZIP from GitHub and extract it.

### 2. Install Dependencies

In the project directory:

```bash
npm install
```

This will install Electron and other needed packages from `package.json`.

---

##  Run the App

Once setup is done, run:

```bash
npm start
```

That’s it! The Electron app should launch in a window.

---

## Project File Structure (Key Files)

| File/Folder         | Purpose |
|---------------------|---------|
| `main.js`           | Starts the Electron app and sets up the window |
| `index.html`        | Main layout and structure of the user interface |
| `style.css`         | All UI styling, supports light/dark mode |
| `renderer.js`       | Handles screen transitions, event listeners, dark mode logic, and modals |
| `logic/`            | Contains core logic for handling templates and records |
| `data/`             | User-generated data (e.g., saved templates and records) |
| `preload.js` (optional) | Secure bridge between renderer and backend (if needed) |

---

## Features So Far

- Create/view templates and records
- Simple screen navigation and back buttons
- Floating menu with Settings and Exit confirmation
- Dark mode (auto-detects system preference or toggled manually)
- Modal windows for Settings and Exit

---

##  Team



---

Let me know if you need help setting it up. Ping drparnassus on discord or check the `README`!
