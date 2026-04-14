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
      notes:     docData.notes || '',
      status:    'Pending',
      createdAt: new Date().toISOString(),
    };
    docs.push(newDoc);
    saveDocuments(docs);
    return newDoc;
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
    addOffice,
    getDocuments,
    getDocumentsByOffice,
    addDocument,
    setSession,
    getSession,
    clearSession,
    requireAuth,
  };

})();
