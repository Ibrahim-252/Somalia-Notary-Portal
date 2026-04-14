/**
 * dashboard.js
 * Handles the office dashboard: greeting, stats, document list, and new doc modal.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- AUTH GUARD ---
  const office = Storage.requireAuth();
  if (!office) return;

  // --- PERSONALIZE TOPBAR ---
  populateTopbar(office);

  // --- LOAD STATS & DOCS ---
  refreshDashboard();

  // --- ADD DOCUMENT BUTTON ---
  document.getElementById('add-doc-btn').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // --- ADD DOCUMENT FORM ---
  document.getElementById('add-doc-form').addEventListener('submit', handleAddDoc);

  // --- SEARCH ---
  document.getElementById('doc-search').addEventListener('input', (e) => {
    renderDocuments(e.target.value.trim().toLowerCase());
  });

  // --- LOGOUT ---
  document.getElementById('logout-btn').addEventListener('click', () => {
    Storage.clearSession();
    window.location.href = 'index.html';
  });

  // --- SIDEBAR TOGGLE (mobile) ---
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });

  // ---- POPULATE TOPBAR ----

  function populateTopbar(office) {
    const greeting = getGreeting();
    document.getElementById('dash-greeting').textContent   = greeting + ' 👋';
    document.getElementById('dash-office-name').textContent = office.officeName;

    // Avatar: first letter of office name
    const initials = office.officeName.charAt(0).toUpperCase();
    document.getElementById('dash-avatar').textContent = initials;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // ---- REFRESH DASHBOARD ----

  function refreshDashboard() {
    const docs = Storage.getDocumentsByOffice(office.id);
    const verified = docs.filter(d => d.status === 'Verified').length;
    const pending  = docs.filter(d => d.status === 'Pending').length;

    document.getElementById('stat-total').textContent    = docs.length;
    document.getElementById('stat-verified').textContent = verified;
    document.getElementById('stat-pending').textContent  = pending;
    document.getElementById('stat-since').textContent    = formatDate(office.createdAt);

    renderDocuments('');
  }

  // ---- RENDER DOCUMENT LIST ----

  function renderDocuments(searchQuery) {
    const all  = Storage.getDocumentsByOffice(office.id);
    const docs = searchQuery
      ? all.filter(d =>
          d.title.toLowerCase().includes(searchQuery)   ||
          d.type.toLowerCase().includes(searchQuery)    ||
          d.parties.toLowerCase().includes(searchQuery)
        )
      : all;

    const container = document.getElementById('doc-list-body');

    if (docs.length === 0) {
      container.innerHTML = `
        <div class="doc-empty">
          <div class="empty-icon">${searchQuery ? '🔍' : '📂'}</div>
          <h3>${searchQuery ? 'No documents match your search.' : 'No documents yet.'}</h3>
          <p>${searchQuery ? 'Try a different keyword.' : 'Submit your first document to get started.'}</p>
        </div>
      `;
      return;
    }

    // Sort newest first
    const sorted = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const rows = sorted.map(doc => `
      <tr>
        <td>
          <strong>${escapeHtml(doc.title)}</strong>
          ${doc.notes ? `<br><small style="color:var(--ink-soft);">${escapeHtml(doc.notes)}</small>` : ''}
        </td>
        <td>${escapeHtml(doc.type)}</td>
        <td>${escapeHtml(doc.parties)}</td>
        <td>${formatDate(doc.date)}</td>
        <td>
          <span class="badge ${doc.status === 'Verified' ? 'badge-verified' : 'badge-pending'}">
            ${doc.status}
          </span>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="doc-table-wrap">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Parties</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  // ---- MODAL ----

  function openModal() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('doc-date').value = today;
    document.getElementById('modal-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('add-doc-form').reset();
    clearModalErrors();
  }

  // ---- ADD DOCUMENT ----

  function handleAddDoc(e) {
    e.preventDefault();
    clearModalErrors();

    const title   = document.getElementById('doc-title').value.trim();
    const type    = document.getElementById('doc-type').value;
    const date    = document.getElementById('doc-date').value;
    const parties = document.getElementById('doc-parties').value.trim();
    const notes   = document.getElementById('doc-notes').value.trim();

    let hasError = false;

    if (!title) {
      showModalError('doc-title', 'Please enter the document title.');
      hasError = true;
    }
    if (!type) {
      showModalError('doc-type', 'Please select a document type.');
      hasError = true;
    }
    if (!date) {
      showModalError('doc-date', 'Please select a date.');
      hasError = true;
    }
    if (!parties) {
      showModalError('doc-parties', 'Please enter the parties involved.');
      hasError = true;
    }

    if (hasError) return;

    Storage.addDocument(office.id, { title, type, date, parties, notes });
    closeModal();
    refreshDashboard();

    // Flash the stats section to show update
    const statsEl = document.querySelector('.dash-stats');
    statsEl.style.transition = 'opacity .2s';
    statsEl.style.opacity = '.5';
    setTimeout(() => statsEl.style.opacity = '1', 300);
  }

  // ---- HELPERS ----

  function showModalError(fieldId, message) {
    const errEl   = document.getElementById('err-' + fieldId);
    const inputEl = document.getElementById(fieldId);
    if (errEl)   errEl.textContent = message;
    if (inputEl) inputEl.classList.add('has-error');
  }

  function clearModalErrors() {
    document.querySelectorAll('#add-doc-form .field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('#add-doc-form .has-error').forEach(el => el.classList.remove('has-error'));
  }

  function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

});
