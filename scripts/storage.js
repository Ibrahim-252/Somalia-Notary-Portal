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

  /**
   * Updates an office record. Pass any subset of fields.
   * Returns the updated office, or null if not found.
   */
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

  function addDocument(officeId, docData) {
    const docs = getDocuments();
    const newDoc = {
      id:        'doc_' + Date.now(),
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

  /**
   * Updates a single document by id. Pass any subset of fields
   * (e.g. { status: 'Verified', hasFile: true }).
   * Returns the updated document, or null if not found.
   */
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
    setSession,
    getSession,
    clearSession,
    requireAuth,
  };

})();