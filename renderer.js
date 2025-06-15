document.addEventListener('DOMContentLoaded', () => {
  // === SCREEN NAVIGATION ===
  document.querySelectorAll('.big-button').forEach(button => {
    button.addEventListener('click', () => {
      const screenId = button.getAttribute('data-screen');
      showScreen(screenId);
    });
  });

  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => {
      const screenId = button.getAttribute('data-screen');
      showScreen(screenId);
    });
  });

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
  }

  // === MENU TOGGLE ===
  const menuButton = document.getElementById('menu-button');
  const floatingMenu = document.getElementById('floating-menu');

  if (menuButton && floatingMenu) {
    menuButton.addEventListener('click', () => {
      floatingMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!menuButton.contains(e.target) && !floatingMenu.contains(e.target)) {
        floatingMenu.classList.add('hidden');
      }
    });
  }

  // === SETTINGS MODAL LOGIC ===
  const openSettings = document.getElementById('open-settings');
  const settingsOverlay = document.getElementById('settings-overlay');
  const closeSettings = document.getElementById('close-settings');

  if (openSettings && settingsOverlay) {
    openSettings.addEventListener('click', () => {
      floatingMenu.classList.add('hidden');
      settingsOverlay.classList.remove('hidden');
    });
  }

  if (closeSettings && settingsOverlay) {
    closeSettings.addEventListener('click', () => {
      settingsOverlay.classList.add('hidden');
    });
  }

  // === DARK MODE DETECTION ===
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  const toggleDark = document.getElementById('toggle-dark-mode');
  if (toggleDark) {
    toggleDark.addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
  }

  // === EXIT MODAL LOGIC ===
  const openExit = document.getElementById('open-exit');
  const exitOverlay = document.getElementById('exit-overlay');
  const confirmExit = document.getElementById('confirm-exit');
  const cancelExit = document.getElementById('cancel-exit');

  openExit.addEventListener('click', () => {
    floatingMenu.classList.add('hidden');
    exitOverlay.classList.remove('hidden');
  });

  cancelExit.addEventListener('click', () => {
    exitOverlay.classList.add('hidden');
  });

  confirmExit.addEventListener('click', () => {
    window.close(); // Triggers Electron to close the window
  });

  document.addEventListener('keydown', (e) => {
    // ESC closes modals
    if (e.key === 'Escape') {
      const overlays = ['settings-overlay', 'exit-overlay'];
      overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) {
          el.classList.add('hidden');
        }
      });
    }

    // ENTER confirms exit if the exit modal is open
    if (e.key === 'Enter') {
      const exitOverlay = document.getElementById('exit-overlay');
      if (exitOverlay && !exitOverlay.classList.contains('hidden')) {
        document.getElementById('confirm-exit').click();
      }
    }
  });


  
});
