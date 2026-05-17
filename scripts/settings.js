/**
 * settings.js
 * Office profile, password change, account actions.
 */

document.addEventListener('DOMContentLoaded', () => {

  const office = Storage.requireAuth();
  if (!office) return;

  // Avatar
  document.getElementById('dash-avatar').textContent =
    office.officeName.charAt(0).toUpperCase();

  // Populate profile form
  document.getElementById('set-office-name').value = office.officeName;
  document.getElementById('set-contact').value     = office.contactPerson;
  document.getElementById('set-email').value       = office.email;
  document.getElementById('set-phone').value       = office.phone;

  // Sidebar Submit New → dashboard
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('data-nav') === 'submit') {
        e.preventDefault();
        window.location.href = 'dashboard.html?action=submit';
      }
    });
  });

  // Profile update
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('profile-msg');
    msg.textContent = '';
    msg.className = 'form-msg';

    const updates = {
      officeName:    document.getElementById('set-office-name').value.trim(),
      contactPerson: document.getElementById('set-contact').value.trim(),
      email:         document.getElementById('set-email').value.trim().toLowerCase(),
      phone:         document.getElementById('set-phone').value.trim()
    };

    // Check for email collision with another office
    if (updates.email !== office.email) {
      const existing = Storage.findOfficeByEmail(updates.email);
      if (existing && existing.id !== office.id) {
        msg.textContent = 'That email is already used by another office.';
        msg.classList.add('form-msg-error');
        return;
      }
    }

    Storage.updateOffice(office.id, updates);
    Storage.setSession({ ...office, ...updates });
    msg.textContent = 'Saved.';
    msg.classList.add('form-msg-success');
  });

  // Password change
  document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('password-msg');
    msg.textContent = '';
    msg.className = 'form-msg';

    const current = document.getElementById('pwd-current').value;
    const next    = document.getElementById('pwd-new').value;
    const confirm = document.getElementById('pwd-confirm').value;

    const fresh = Storage.findOfficeById(office.id);
    if (!fresh || fresh.password !== current) {
      msg.textContent = 'Current password is incorrect.';
      msg.classList.add('form-msg-error');
      return;
    }
    if (next.length < 8) {
      msg.textContent = 'New password must be at least 8 characters.';
      msg.classList.add('form-msg-error');
      return;
    }
    if (next !== confirm) {
      msg.textContent = 'New passwords do not match.';
      msg.classList.add('form-msg-error');
      return;
    }

    Storage.updateOffice(office.id, { password: next });
    document.getElementById('password-form').reset();
    msg.textContent = 'Password updated.';
    msg.classList.add('form-msg-success');
  });

  // Sign out
  document.getElementById('signout-btn').addEventListener('click', signOut);
  document.getElementById('logout-btn').addEventListener('click', signOut);

  function signOut() {
    Storage.clearSession();
    window.location.href = 'index.html';
  }

  // Clear local data
  document.getElementById('clear-data-btn').addEventListener('click', async () => {
    const ok = confirm(
      'This will delete ALL offices, documents, and uploaded PDFs from this browser. Continue?'
    );
    if (!ok) return;

    // Wipe localStorage keys
    localStorage.removeItem('daftarka_offices');
    localStorage.removeItem('daftarka_documents');

    // Wipe IndexedDB
    try {
      indexedDB.deleteDatabase('daftarka_files');
    } catch (e) { /* ignore */ }

    Storage.clearSession();
    alert('Local data cleared.');
    window.location.href = 'index.html';
  });
});