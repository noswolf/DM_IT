(() => {
  const themeKey = 'dm2026:theme';

  function preferredTheme() {
    try {
      const saved = localStorage.getItem(themeKey);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Continue with the system preference when storage is unavailable.
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

    const button = document.querySelector('#theme-toggle');
    if (button) {
      button.textContent = isDark ? '☀️' : '🌙';
      button.setAttribute('aria-label', isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด');
    }
  }

  function initTheme(button) {
    if (!button) return;

    button.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      try {
        localStorage.setItem(themeKey, nextTheme);
      } catch {
        // The theme still applies in this tab when storage is unavailable.
      }
      applyTheme(nextTheme);
    });

    window.addEventListener('storage', (event) => {
      if (event.key === themeKey || event.key === null) applyTheme(preferredTheme());
    });

    window.addEventListener('pageshow', () => applyTheme(preferredTheme()));
    applyTheme(preferredTheme());
  }

  window.DMModularShell = { initTheme };
})();
