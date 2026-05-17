/**
 * documents.js
 * Full documents list page with filters.
 * Reference numbers are shown, copyable, and searchable.
 */

document.addEventListener('DOMContentLoaded', () => {

  const office = Storage.requireAuth();
  if (!office) return;

  // Topbar
  document.getElementById('dash-office-name').textContent = office.officeName;
  document.getElementById('dash-avatar').textContent = office.officeName.charAt(0).toUpperCase();

  // Sidebar navigation
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-nav');
      if (target === 'submit') {
        e.preventDefault();
        window.location.href = 'dashboard.html?action=submit';
      }
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    Storage.clearSession();
    window.location.href = 'index.html';
  });

  // Filter inputs
  const inputs = ['filter-search', 'filter-type', 'filter-status', 'filter-from', 'filter-to'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', render);
  });

  document.getElementById('filter-reset').addEventListener('click', () => {
    inputs.forEach(id => { document.getElementById(id).value = ''; });
    render();
  });

  render();

  // ---- RENDER ----
  function render() {
    const search = document.getElementById('filter-search').value.trim().toLowerCase();
    const type   = document.getElementById('filter-type').value;
    const status = document.getElementById('filter-status').value;
    const from   = document.getElementById('filter-from').value;
    const to     = document.getElementById('filter-to').value;

    let docs = Storage.getDocumentsByOffice(office.id);

    if (search) {
      docs = docs.filter(d =>
        (d.reference || '').toLowerCase().includes(search) ||
        d.title.toLowerCase().includes(search)   ||
        (d.notes || '').toLowerCase().includes(search) ||
        d.parties.toLowerCase().includes(search)
      );
    }
    if (type)   docs = docs.filter(d => d.type === type);
    if (status) docs = docs.filter(d => d.status === status);
    if (from)   docs = docs.filter(d => d.date >= from);
    if (to)     docs = docs.filter(d => d.date <= to);

    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    document.getElementById('result-count').textContent = `(${docs.length})`;
    const container = document.getElementById('doc-list-body');

    if (docs.length === 0) {
      container.innerHTML = `
        <div class="doc-empty">
          <div class="empty-icon">🔍</div>
          <h3>No documents match these filters.</h3>
          <p>Try clearing some filters, or search by reference number.</p>
        </div>`;
      return;
    }

    const rows = docs.map(doc => `
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
      </tr>`).join('');

    container.innerHTML = `
      <div class="doc-table-wrap">
        <table class="doc-table">
          <thead>
            <tr>
              <th>Ref. No.</th>
              <th>Title</th><th>Type</th><th>Parties</th>
              <th>Date</th><th>Status</th><th>File</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    container.querySelectorAll('[data-copy-ref]').forEach(btn => {
      btn.addEventListener('click', () => copyReference(btn));
    });
    container.querySelectorAll('[data-view-pdf]').forEach(btn => {
      btn.addEventListener('click', () => FileStorage.openFile(btn.dataset.viewPdf));
    });
    container.querySelectorAll('[data-upload-pdf]').forEach(btn => {
      btn.addEventListener('click', () => triggerUpload(btn.dataset.uploadPdf));
    });
  }

  function copyReference(btn) {
    const ref = btn.dataset.copyRef;
    if (!ref) return;
    navigator.clipboard.writeText(ref).then(() => {
      const original = btn.textContent.trim();
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1200);
    }).catch(() => {
      const tmp = document.createElement('textarea');
      tmp.value = ref;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      alert('Copied: ' + ref);
    });
  }

  function triggerUpload(docId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      try {
        await FileStorage.saveFile(docId, file);
        Storage.updateDocument(docId, { hasFile: true, status: 'Verified' });
        render();
      } catch (err) {
        console.error(err);
        alert('Could not save the file.');
      }
    });
    input.click();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB',
      { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
});