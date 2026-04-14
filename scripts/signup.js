/**
 * signup.js
 * Handles the office registration form.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form        = document.getElementById('signup-form');
  const errorBanner = document.getElementById('form-error');
  const successBanner = document.getElementById('form-success');
  const submitBtn   = document.getElementById('submit-btn');
  const btnLabel    = document.getElementById('btn-label');
  const btnSpinner  = document.getElementById('btn-spinner');

  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? '👁' : '🙈';
    });
  });

  // Clear field error on input
  ['office-name', 'contact-person', 'email', 'phone', 'password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearFieldError(id);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideBanner(errorBanner);
    hideBanner(successBanner);
    clearAllErrors();

    const officeName    = document.getElementById('office-name').value.trim();
    const contactPerson = document.getElementById('contact-person').value.trim();
    const email         = document.getElementById('email').value.trim();
    const phone         = document.getElementById('phone').value.trim();
    const password      = document.getElementById('password').value;

    let hasError = false;

    if (!officeName) {
      showFieldError('office-name', 'Please enter your office name.');
      hasError = true;
    }

    if (!contactPerson) {
      showFieldError('contact-person', 'Please enter the contact person\'s name.');
      hasError = true;
    }

    if (!email || !isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address.');
      hasError = true;
    }

    if (!phone) {
      showFieldError('phone', 'Please enter a phone number.');
      hasError = true;
    }

    if (!password || password.length < 8) {
      showFieldError('password', 'Password must be at least 8 characters.');
      hasError = true;
    }

    if (hasError) return;

    // Check for duplicate email
    const existing = Storage.findOfficeByEmail(email);
    if (existing) {
      showBanner(errorBanner, 'An account with this email already exists. <a href="login.html">Log in instead</a>.');
      return;
    }

    // Simulate async save
    setLoading(true);
    setTimeout(() => {
      const newOffice = Storage.addOffice({ officeName, contactPerson, email, phone, password });
      Storage.setSession(newOffice);
      setLoading(false);

      showBanner(successBanner, 'Account created! Redirecting to your dashboard…');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    }, 800);
  });

  // ---- HELPERS ----

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnLabel.style.display   = isLoading ? 'none' : 'inline';
    btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
  }

  function showFieldError(fieldId, message) {
    const errEl = document.getElementById('err-' + fieldId);
    const inputEl = document.getElementById(fieldId);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.add('has-error');
  }

  function clearFieldError(fieldId) {
    const errEl = document.getElementById('err-' + fieldId);
    const inputEl = document.getElementById(fieldId);
    if (errEl) errEl.textContent = '';
    if (inputEl) inputEl.classList.remove('has-error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  }

  function showBanner(el, html) {
    el.innerHTML = html;
    el.style.display = 'block';
  }

  function hideBanner(el) {
    el.style.display = 'none';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

});
