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
const submitButton = contactForm.querySelector('.form-submit');
const submitLabel = submitButton.querySelector('.submit-label');
const CONTACT_EMAIL = '';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const toolItems = document.querySelectorAll('.tool-item');
const productImages = document.querySelectorAll('.project-card__image img');

productImages.forEach(image => {
  const markLoaded = () => image.closest('.project-card__image')?.classList.add('is-loaded');
  if (image.complete) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

function storedTheme() {
  try { return localStorage.getItem('fikri-theme'); } catch { return null; }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#151821' : '#f6f5f1';
}

applyTheme(storedTheme() || (prefersDark.matches ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('fikri-theme', next); } catch {}
  if (!prefersReducedMotion.matches) {
    themeToggle.animate(
      [{ transform: 'scale(.94)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }
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

function closeToolLabels(except = null) {
  toolItems.forEach(item => {
    if (item === except) return;
    item.classList.remove('is-active');
    item.setAttribute('aria-expanded', 'false');
  });
}

toolItems.forEach(item => {
  item.setAttribute('role', 'button');
  item.setAttribute('aria-expanded', 'false');

  const toggleLabel = () => {
    const willOpen = !item.classList.contains('is-active');
    closeToolLabels(item);
    item.classList.toggle('is-active', willOpen);
    item.setAttribute('aria-expanded', String(willOpen));
  };

  item.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    toggleLabel();
  });
  item.addEventListener('keydown', event => {
    if (event.target.closest('a')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleLabel();
  });
});

document.addEventListener('click', event => {
  if (!event.target.closest('.tool-item')) closeToolLabels();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeToolLabels();
});

let bubbleTimer;
avatarButton.addEventListener('click', () => {
  clearTimeout(bubbleTimer);
  avatarButton.classList.remove('is-greeting');
  void avatarButton.offsetWidth;
  avatarButton.classList.add('is-greeting');
  const visible = speechBubble.classList.toggle('is-visible');
  speechBubble.setAttribute('aria-hidden', String(!visible));
  if (visible) bubbleTimer = setTimeout(() => {
    speechBubble.classList.remove('is-visible');
    speechBubble.setAttribute('aria-hidden', 'true');
  }, 2400);
});
avatarButton.addEventListener('animationend', () => avatarButton.classList.remove('is-greeting'));

year.textContent = new Date().getFullYear();

document.querySelectorAll('[data-project-open]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.projectOpen);
    if (!dialog) return;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
});

document.querySelectorAll('.project-dialog').forEach(dialog => {
  dialog.querySelector('[data-project-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
});

contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  const nameField = contactForm.elements.namedItem('name');
  const emailField = contactForm.elements.namedItem('email');
  const messageField = contactForm.elements.namedItem('message');
  nameField.value = nameField.value.trim().replace(/\s+/g, ' ');
  emailField.value = emailField.value.trim().toLowerCase();
  messageField.value = messageField.value.trim();
  if (!contactForm.reportValidity()) return;
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  submitButton.setAttribute('aria-busy', 'true');
  submitLabel.textContent = 'Preparing message';
  formStatus.textContent = '';
  formStatus.removeAttribute('data-state');

  await new Promise(resolve => setTimeout(resolve, 240));

  if (!CONTACT_EMAIL) {
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
    submitButton.removeAttribute('aria-busy');
    submitLabel.textContent = 'Send message';
    formStatus.dataset.state = 'error';
    formStatus.textContent = 'Messaging is not connected yet. Please reach out through LinkedIn.';
    formStatus.animate(
      [{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
      { duration: 260, easing: 'ease-out' }
    );
    return;
  }
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  submitButton.classList.remove('is-loading');
  submitButton.removeAttribute('aria-busy');
  submitButton.disabled = false;
  submitLabel.textContent = 'Send message';
  formStatus.textContent = 'Opening your email application…';
});
