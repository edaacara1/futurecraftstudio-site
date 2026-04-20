/* ====================================================
   Future Craft Studio — Main JS
   ==================================================== */

/* ---------- THEME TOGGLE ---------- */
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  let current = mq.matches ? 'dark' : 'light';

  function applyTheme(theme) {
    current = theme;
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      toggle.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  applyTheme(current);
  if (toggle) {
    toggle.addEventListener('click', () => applyTheme(current === 'dark' ? 'light' : 'dark'));
  }
})();

/* ---------- SCROLL-AWARE HEADER ---------- */
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  let lastY = 0;
  const THRESHOLD = 80;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    if (y > THRESHOLD && y > lastY) {
      header.classList.add('header--hidden');
    } else {
      header.classList.remove('header--hidden');
    }
    lastY = y;
  }, { passive: true });
})();

/* ---------- MOBILE NAV TOGGLE ---------- */
(function () {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.innerHTML = isOpen
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  });
})();

/* ---------- BOOKING FORM ---------- */
(function () {
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  // Formspree endpoint — tied to eda.acara1@gmail.com
  // First submission triggers a one-time verification email from Formspree
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xrerboqn';

  function validate() {
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(el => {
      el.classList.remove('input-error');
      if (!el.value.trim()) {
        el.classList.add('input-error');
        valid = false;
      }
      if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
        el.classList.add('input-error');
        valid = false;
      }
    });
    // Scroll first error into view
    const firstErr = form.querySelector('.input-error');
    if (firstErr) firstErr.focus();
    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const label = submitBtn.querySelector('.btn-label');
    const loading = submitBtn.querySelector('.btn-loading');
    label.hidden = true;
    loading.hidden = false;
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      // Add a human-readable subject line for the email
      data.append('_subject', 'New 15-min call request — Future Craft Studio');
      // Disable Formspree's default redirect
      data.append('_next', 'false');

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.hidden = true;
        success.hidden = false;
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Submission failed');
      }
    } catch (err) {
      // Re-enable button and show inline error
      label.hidden = false;
      loading.hidden = true;
      submitBtn.disabled = false;

      let errEl = form.querySelector('.form-submit-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-submit-error';
        submitBtn.insertAdjacentElement('afterend', errEl);
      }
      errEl.textContent = "Something went wrong. Please email eda.acara1@gmail.com directly or try again.";
    }
  });

  // Clear error on input
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });
})();

/* ---------- ACTIVE NAV LINKS ---------- */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id;
      }
    });
    navLinks.forEach(a => {
      a.classList.toggle('nav-active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

/* ---------- SCROLL REVEAL ---------- */
(function () {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  // Mark all as hidden first
  els.forEach(el => el.classList.add('fade-in--hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('fade-in--hidden');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ---------- INPUT ERROR STYLE ---------- */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .input-error {
      border-color: #c0392b !important;
      box-shadow: 0 0 0 3px rgba(192,57,43,0.12) !important;
    }
    .nav-active {
      color: var(--color-text) !important;
      font-weight: 500 !important;
    }
  `;
  document.head.appendChild(style);
})();
