/**
 * dashboard.js
 * Handles the office dashboard: greeting, stats, document list, and new doc modal.
 *
 * Updated:
 *  - Sidebar links (Documents, Submit New, Settings) now navigate properly
 *  - PDF upload field in the modal — files go to IndexedDB (see file-storage.js)
 *  - When a PDF is uploaded, status flips to 'Verified' automatically
 *  - Document rows show a "View PDF" link if a file is attached
 *  - Reference numbers (DAF-2026-0001) shown on every doc, click to copy, searchable
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- AUTH GUARD ---
  const office = Storage.requireAuth();
  if (!office) return;

  // --- PERSONALIZE TOPBAR ---
  populateTopbar(office);

  // --- LOAD STATS & DOCS ---
  refreshDashboard();

  // --- SIDEBAR NAVIGATION ---
  wireSidebar();

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

  // // --- SIDEBAR TOGGLE (mobile) ---
  // const sidebarToggle = document.getElementById('sidebar-toggle');
  // if (sidebarToggle) {
  //   sidebarToggle.addEventListener('click', () => {
  //     document.querySelector('.sidebar').classList.toggle('open');
  //   });
  // }

  // ---- SIDEBAR ----

  function wireSidebar() {
    const links = document.querySelectorAll('[data-nav]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav');

        switch (target) {
          case 'overview':
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case 'documents':
            window.location.href = 'documents.html';
            break;
          case 'submit':
            openModal();
            break;
          case 'settings':
            window.location.href = 'settings.html';
            break;
        }
      });
    });
  }

  // ---- POPULATE TOPBAR ----

  function populateTopbar(office) {
    const greeting = getGreeting();
    document.getElementById('dash-greeting').textContent   = greeting + ' 👋';
    document.getElementById('dash-office-name').textContent = office.officeName;

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
          (d.reference || '').toLowerCase().includes(searchQuery) ||
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
          <p>${searchQuery ? 'Try a different keyword or reference number.' : 'Submit your first document to get started.'}</p>
        </div>
      `;
      return;
    }

    // Sort newest first
    const sorted = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const rows = sorted.map(doc => `
      <tr>
        <td>
          <button class="ref-chip" data-copy-ref="${escapeHtml(doc.reference || '')}" title="Click to copy">
            ${escapeHtml(doc.reference || '—')}
          </button>
        </td>
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
        <td>
          ${doc.hasFile
            ? `<button class="link-btn" data-view-pdf="${doc.id}">📄 View PDF</button>`
            : `<button class="link-btn" data-upload-pdf="${doc.id}">⬆ Upload PDF</button>`}
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="doc-table-wrap">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Ref. No.</th>
              <th>Title</th>
              <th>Type</th>
              <th>Parties</th>
              <th>Date</th>
              <th>Status</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    // Wire copy-reference buttons
    container.querySelectorAll('[data-copy-ref]').forEach(btn => {
      btn.addEventListener('click', () => copyReference(btn));
    });

    // Wire View PDF / Upload PDF buttons
    container.querySelectorAll('[data-view-pdf]').forEach(btn => {
      btn.addEventListener('click', () => FileStorage.openFile(btn.dataset.viewPdf));
    });
    container.querySelectorAll('[data-upload-pdf]').forEach(btn => {
      btn.addEventListener('click', () => triggerInlineUpload(btn.dataset.uploadPdf));
    });
  }

  // ---- COPY REFERENCE ----

  function copyReference(btn) {
    const ref = btn.dataset.copyRef;
    if (!ref) return;
    navigator.clipboard.writeText(ref).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original.trim();
        btn.classList.remove('copied');
      }, 1200);
    }).catch(() => {
      // Fallback for older browsers
      const tmp = document.createElement('textarea');
      tmp.value = ref;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      alert('Copied: ' + ref);
    });
  }

  // ---- INLINE UPLOAD ----

  function triggerInlineUpload(docId) {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'application/pdf';
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      try {
        await FileStorage.saveFile(docId, file);
        Storage.updateDocument(docId, { hasFile: true, status: 'Verified' });
        refreshDashboard();
      } catch (err) {
        console.error(err);
        alert('Could not save the file. Please try again.');
      }
    });
    input.click();
  }

  // ---- MODAL ----

  function openModal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('doc-date').value = today;

    // Preview the reference number this doc would get
    const previewEl = document.getElementById('doc-ref-preview');
    if (previewEl) {
      previewEl.textContent = Storage.nextReference(office.id);
    }

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

  async function handleAddDoc(e) {
    e.preventDefault();
    clearModalErrors();

    const title   = document.getElementById('doc-title').value.trim();
    const type    = document.getElementById('doc-type').value;
    const date    = document.getElementById('doc-date').value;
    const parties = document.getElementById('doc-parties').value.trim();
    const notes   = document.getElementById('doc-notes').value.trim();
    const fileInput = document.getElementById('doc-file');
    const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;

    let hasError = false;

    if (!title)   { showModalError('doc-title',   'Please enter the document title.'); hasError = true; }
    if (!type)    { showModalError('doc-type',    'Please select a document type.');   hasError = true; }
    if (!date)    { showModalError('doc-date',    'Please select a date.');            hasError = true; }
    if (!parties) { showModalError('doc-parties', 'Please enter the parties involved.'); hasError = true; }
    if (file && file.type !== 'application/pdf') {
      showModalError('doc-file', 'Only PDF files are accepted.');
      hasError = true;
    }
    if (hasError) return;

    const docPayload = {
      title, type, date, parties, notes,
      hasFile: !!file,
      status: file ? 'Verified' : 'Pending'
    };

    const newDoc = Storage.addDocument(office.id, docPayload);

    if (file && newDoc && newDoc.id) {
      try {
        await FileStorage.saveFile(newDoc.id, file);
      } catch (err) {
        console.error('File save failed:', err);
        alert('Document saved, but the PDF could not be attached. You can upload it again from the table.');
        Storage.updateDocument(newDoc.id, { hasFile: false, status: 'Pending' });
      }
    }

    closeModal();
    refreshDashboard();

    // Show the assigned reference as a quick toast
    if (newDoc && newDoc.reference) {
      showToast(`Document saved as ${newDoc.reference}`);
    }

    // Flash the stats section
    const statsEl = document.querySelector('.dash-stats');
    statsEl.style.transition = 'opacity .2s';
    statsEl.style.opacity = '.5';
    setTimeout(() => statsEl.style.opacity = '1', 300);
  }

  // ---- TOAST ----

  function showToast(message) {
    let toast = document.getElementById('daftarka-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'daftarka-toast';
      toast.className = 'daftarka-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
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
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

});