const root = document.documentElement;
const themeToggle = document.querySelector('#themeToggle');
const themeLabel = document.querySelector('#themeLabel');
const navToggle = document.querySelector('#navToggle');
const navLinks = document.querySelector('#navLinks');
const avatarButton = document.querySelector('#avatarButton');
const speechBubble = document.querySelector('#speechBubble');
const year = document.querySelector('#year');
const contactForm = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');
const CONTACT_EMAIL = '';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function storedTheme() {
  try { return localStorage.getItem('fikri-theme'); } catch { return null; }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111820' : '#f4f0e7';
}

applyTheme(storedTheme() || (prefersDark.matches ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('fikri-theme', next); } catch {}
});

prefersDark.addEventListener('change', event => {
  if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
});

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('is-open', !open);
});

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navToggle.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('is-open');
}));

let bubbleTimer;
avatarButton.addEventListener('click', () => {
  clearTimeout(bubbleTimer);
  const visible = speechBubble.classList.toggle('is-visible');
  speechBubble.setAttribute('aria-hidden', String(!visible));
  if (visible) bubbleTimer = setTimeout(() => {
    speechBubble.classList.remove('is-visible');
    speechBubble.setAttribute('aria-hidden', 'true');
  }, 2400);
});

if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
}

year.textContent = new Date().getFullYear();

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  if (!CONTACT_EMAIL) {
    formStatus.textContent = 'Form layout is ready. Add your email to CONTACT_EMAIL in script.js to enable sending.';
    return;
  }
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  formStatus.textContent = 'Opening your email application…';
});
