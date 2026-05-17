/**
 * storage.js
 * Simulates a JSON-file backend using localStorage.
 * Provides helper functions for offices.json and documents.json.
 */

const Storage = (() => {

  const OFFICES_KEY   = 'daftarka_offices';
  const DOCUMENTS_KEY = 'daftarka_documents';
  const SESSION_KEY   = 'daftarka_session';

  // ---- OFFICES ----

  function getOffices() {
    const raw = localStorage.getItem(OFFICES_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveOffices(offices) {
    localStorage.setItem(OFFICES_KEY, JSON.stringify(offices));
  }

  function findOfficeByEmail(email) {
    return getOffices().find(o => o.email.toLowerCase() === email.toLowerCase()) || null;
  }

  function findOfficeById(id) {
    return getOffices().find(o => o.id === id) || null;
  }

  function addOffice(officeData) {
    const offices = getOffices();
    const newOffice = {
      id:            'off_' + Date.now(),
      officeName:    officeData.officeName,
      contactPerson: officeData.contactPerson,
      email:         officeData.email.toLowerCase(),
      phone:         officeData.phone,
      password:      officeData.password, // plain text — fine for MVP
      createdAt:     new Date().toISOString(),
    };
    offices.push(newOffice);
    saveOffices(offices);
    return newOffice;
  }

  function updateOffice(officeId, updates) {
    const offices = getOffices();
    const i = offices.findIndex(o => o.id === officeId);
    if (i === -1) return null;
    offices[i] = { ...offices[i], ...updates };
    saveOffices(offices);
    return offices[i];
  }

  // ---- DOCUMENTS ----

  function getDocuments() {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveDocuments(docs) {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
  }

  function getDocumentsByOffice(officeId) {
    return getDocuments().filter(d => d.officeId === officeId);
  }

  /**
   * Generates the next reference number for an office.
   * Format: DAF-YYYY-NNNN where NNNN resets each year, per office.
   * Example: DAF-2026-0001, DAF-2026-0002, …, DAF-2027-0001
   */
  function nextReference(officeId) {
    const year = new Date().getFullYear();
    const prefix = `DAF-${year}-`;

    // Find the highest existing number for this office + year
    const existing = getDocumentsByOffice(officeId)
      .map(d => d.reference)
      .filter(r => r && r.startsWith(prefix))
      .map(r => parseInt(r.slice(prefix.length), 10))
      .filter(n => !isNaN(n));

    const next = existing.length === 0 ? 1 : Math.max(...existing) + 1;
    return `${prefix}${String(next).padStart(4, '0')}`;
  }

  function addDocument(officeId, docData) {
    const docs = getDocuments();
    const newDoc = {
      id:        'doc_' + Date.now(),
      reference: nextReference(officeId),
      officeId,
      title:     docData.title,
      type:      docData.type,
      date:      docData.date,
      parties:   docData.parties,
      notes:     docData.notes   || '',
      status:    docData.status  || 'Pending',
      hasFile:   !!docData.hasFile,
      createdAt: new Date().toISOString(),
    };
    docs.push(newDoc);
    saveDocuments(docs);
    return newDoc;
  }

  function updateDocument(docId, updates) {
    const docs = getDocuments();
    const i = docs.findIndex(d => d.id === docId);
    if (i === -1) return null;
    docs[i] = { ...docs[i], ...updates };
    saveDocuments(docs);
    return docs[i];
  }

  // ---- SESSION ----

  function setSession(office) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(office));
  }

  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function requireAuth() {
    const session = getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    return session;
  }

  return {
    getOffices,
    findOfficeByEmail,
    findOfficeById,
    addOffice,
    updateOffice,
    getDocuments,
    getDocumentsByOffice,
    addDocument,
    updateDocument,
    nextReference,
    setSession,
    getSession,
    clearSession,
    requireAuth,
  };

})();