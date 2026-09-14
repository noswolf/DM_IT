(() => {
  const progressKey = 'dm2026:progress';
  const legacyProgressKey = 'dm-completed-lessons-v1';
  const migrationKey = 'dm2026:progress-migrated-v1';
  const themeKey = 'dm2026:theme';
  const defaultCompletedLessons = ['divisibility', 'integer-representations', 'primes'];
  const lessons = [
    ['divisibility', 'การหารลงตัว (Divisibility)'],
    ['modular-arithmetic', 'เลขคณิตมอดูลาร์ (Modular Arithmetic)'],
    ['congruence', 'สมภาค (Congruence)'],
    ['pseudorandom-numbers', 'จำนวนสุ่มเทียม (Pseudorandom Numbers)'],
    ['check-digits', 'เลขตรวจสอบ (Check Digits)'],
    ['integer-representations', 'การแทนจำนวนเต็ม (Integer Representations)'],
    ['fast-modular-exponentiation', 'การยกกำลังมอดูลาร์แบบเร็ว (Fast Modular Exponentiation)'],
    ['primes', 'จำนวนเฉพาะ (Prime Numbers)'],
    ['prime-factorization', 'การแยกตัวประกอบเฉพาะ (Prime Factorization)'],
    ['sieve-of-eratosthenes', 'ตะแกรงเอราทอสเทนีส (Sieve of Eratosthenes)'],
    ['gcd-euclidean', 'ตัวหารร่วมมาก — ขั้นตอนวิธียูคลิด (GCD — Euclidean Algorithm)'],
    ['gcd-prime-factorization', 'GCD ด้วยการแยกตัวประกอบเฉพาะ (GCD by Prime Factorisation)'],
    ['extended-euclidean', 'ขั้นตอนวิธียูคลิดแบบขยาย (Extended Euclidean Algorithm)'],
    ['classical-ciphers', 'การเข้ารหัสแบบดั้งเดิม (Classical Ciphers)'],
    ['euler-totient', 'ฟังก์ชันออยเลอร์ (Euler\'s Totient Function φ(n))'],
    ['fermats-little-theorem', 'ทฤษฎีบทเล็กของแฟร์มา (Fermat\'s Little Theorem)'],
    ['chinese-remainder-theorem', 'ทฤษฎีบทเศษเหลือจีน (Chinese Remainder Theorem)'],
    ['rsa-cryptography', 'การเข้ารหัส RSA (RSA Cryptography) — Capstone']
  ];
  const validLessonIds = new Set(lessons.map(([id]) => id));
  const currentLesson = document.body.dataset.lessonId;

  function normalizeLessonId(value) {
    return String(value || '').split('/').pop().replace(/\.html$/, '');
  }

  function readArray(key) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return undefined;
    }
  }

  function saveProgress(completed) {
    try {
      localStorage.setItem(progressKey, JSON.stringify([...completed]));
    } catch {
      // The lesson remains usable when storage is unavailable.
    }
  }

  function loadProgress() {
    const saved = readArray(progressKey);
    const completed = new Set((saved || []).map(normalizeLessonId).filter((id) => validLessonIds.has(id)));
    let hasStoredProgress = Array.isArray(saved);

    try {
      if (localStorage.getItem(migrationKey) !== '1') {
        const legacy = readArray(legacyProgressKey);
        if (Array.isArray(legacy)) {
          legacy.map(normalizeLessonId).filter((id) => validLessonIds.has(id)).forEach((id) => completed.add(id));
          hasStoredProgress = true;
        }
        localStorage.setItem(migrationKey, '1');
      }
    } catch {
      // Continue with the progress already available in memory.
    }

    if (!hasStoredProgress) defaultCompletedLessons.forEach((id) => completed.add(id));
    saveProgress(completed);
    return completed;
  }

  let completedLessons = loadProgress();
  const links = [...document.querySelectorAll('.lesson-nav a[data-lesson-id]')];

  function renderProgress() {
    links.forEach((link, index) => {
      const id = link.dataset.lessonId;
      const marker = link.querySelector('span:first-child');
      const isCurrent = id === currentLesson;
      const isCompleted = completedLessons.has(id);
      if (marker) {
        marker.classList.toggle('done', isCompleted);
        marker.textContent = isCompleted ? '✓' : String(index + 1).padStart(2, '0');
      }
      link.classList.toggle('active', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const completedCount = lessons.filter(([id]) => completedLessons.has(id)).length;
    const percentage = Math.round(completedCount / lessons.length * 100);
    const progress = document.querySelector('.lesson-progress');
    if (progress) {
      progress.querySelector('span').textContent = `${completedCount}/${lessons.length} หัวข้อ · ${percentage}%`;
      progress.querySelector('i').style.width = `${percentage}%`;
    }

    const learnedButton = document.querySelector('.learned-button');
    if (learnedButton) {
      const isCompleted = completedLessons.has(currentLesson);
      learnedButton.classList.toggle('selected', isCompleted);
      learnedButton.setAttribute('aria-pressed', String(isCompleted));
      learnedButton.textContent = isCompleted ? '✓ เรียนหัวข้อนี้แล้ว' : 'ทำเครื่องหมายว่าเรียนแล้ว';
    }
  }

  function preferredTheme() {
    try {
      const saved = localStorage.getItem(themeKey);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Fall back to the system preference.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    const button = document.querySelector('#theme-toggle');
    if (button) {
      button.textContent = theme === 'dark' ? '☀️' : '🌙';
      button.setAttribute('aria-label', theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด');
    }
  }

  document.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
    const sidebar = document.querySelector('#sidebar');
    const isOpen = sidebar.classList.toggle('open');
    document.querySelector('#sidebar-toggle').setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelector('.learned-button')?.addEventListener('click', () => {
    if (completedLessons.has(currentLesson)) completedLessons.delete(currentLesson);
    else completedLessons.add(currentLesson);
    saveProgress(completedLessons);
    renderProgress();
  });

  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    try { localStorage.setItem(themeKey, nextTheme); } catch { /* Theme still works in this tab. */ }
    setTheme(nextTheme);
  });

  links.forEach((link) => link.addEventListener('click', () => {
    document.querySelector('#sidebar')?.classList.remove('open');
  }));

  window.addEventListener('storage', (event) => {
    if (event.key === progressKey || event.key === legacyProgressKey || event.key === migrationKey || event.key === null) {
      completedLessons = loadProgress();
      renderProgress();
    }
    if (event.key === themeKey || event.key === null) setTheme(preferredTheme());
  });

  window.addEventListener('pageshow', () => {
    completedLessons = loadProgress();
    setTheme(preferredTheme());
    renderProgress();
  });

  setTheme(preferredTheme());
  renderProgress();
})();
