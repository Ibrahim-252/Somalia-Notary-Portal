/**
 * login.js
 * Handles office login.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('login-form');
  const errorBanner = document.getElementById('form-error');
  const submitBtn   = document.getElementById('submit-btn');
  const btnLabel    = document.getElementById('btn-label');
  const btnSpinner  = document.getElementById('btn-spinner');

  // Password toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? '👁' : '🙈';
    });
  });

  // Clear errors on input
  ['email', 'password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearFieldError(id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideBanner(errorBanner);
    clearAllErrors();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let hasError = false;

    if (!email || !isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      showFieldError('password', 'Please enter your password.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    // Simulate async auth check
    setTimeout(() => {
      const office = Storage.findOfficeByEmail(email);

      if (!office || office.password !== password) {
        setLoading(false);
        showBanner(errorBanner, 'Incorrect email or password. Please try again.');
        return;
      }

      Storage.setSession(office);
      setLoading(false);
      window.location.href = 'dashboard.html';
    }, 700);
  });

  // ---- HELPERS ----

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnLabel.style.display   = isLoading ? 'none' : 'inline';
    btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
  }

  function showFieldError(fieldId, message) {
    const errEl   = document.getElementById('err-' + fieldId);
    const inputEl = document.getElementById(fieldId);
    if (errEl)   errEl.textContent = message;
    if (inputEl) inputEl.classList.add('has-error');
  }

  function clearFieldError(fieldId) {
    const errEl   = document.getElementById('err-' + fieldId);
    const inputEl = document.getElementById(fieldId);
    if (errEl)   errEl.textContent = '';
    if (inputEl) inputEl.classList.remove('has-error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  }

  function showBanner(el, message) {
    el.textContent = message;
    el.style.display = 'block';
  }

  function hideBanner(el) {
    el.style.display = 'none';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

});
