// === SCREEN NAVIGATION ===
document.querySelectorAll('.big-button').forEach(button => {
  button.addEventListener('click', () => {
    showScreen(button.getAttribute('data-screen'));
  });
});

document.querySelectorAll('.back-button').forEach(button => {
  button.addEventListener('click', () => {
    showScreen(button.getAttribute('data-screen'));
  });
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

// === MENU ICON LOGIC ===
const menuButton = document.getElementById('menu-button');
const floatingMenu = document.getElementById('floating-menu');

menuButton.addEventListener('click', () => {
  floatingMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!menuButton.contains(e.target) && !floatingMenu.contains(e.target)) {
    floatingMenu.classList.add('hidden');
  }
});

// === DARK MODE LOGIC ===

// Apply system preference on load
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

// Toggle theme manually
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
