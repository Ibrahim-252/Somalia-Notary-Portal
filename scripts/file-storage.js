/**
 * file-storage.js
 * IndexedDB wrapper for storing uploaded PDF files.
 * localStorage caps at ~5MB per origin — too small for signed PDFs.
 * IndexedDB comfortably holds hundreds of MB.
 *
 * Usage:
 *   await FileStorage.saveFile(docId, file)   → stores a File/Blob
 *   await FileStorage.getFile(docId)          → returns { name, type, size, blob } | null
 *   await FileStorage.deleteFile(docId)       → removes file
 *   await FileStorage.openFile(docId)         → opens PDF in a new browser tab
 */

const FileStorage = (() => {
  const DB_NAME    = 'daftarka_files';
  const STORE_NAME = 'documents';
  const DB_VERSION = 1;

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'docId' });
        }
      };

      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror   = (e) => reject(e.target.error);
    });

    return dbPromise;
  }

  async function saveFile(docId, file) {
    if (!file) throw new Error('No file provided');

    const db = await openDB();
    const record = {
      docId,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
      uploadedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror   = () => reject(req.error);
    });
  }

  async function getFile(docId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(docId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => reject(req.error);
    });
  }

  async function deleteFile(docId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.delete(docId);
      req.onsuccess = () => resolve(true);
      req.onerror   = () => reject(req.error);
    });
  }

  async function openFile(docId) {
    const record = await getFile(docId);
    if (!record) return false;
    const url = URL.createObjectURL(record.blob);
    window.open(url, '_blank');
    // Revoke after a delay so the new tab has time to load it
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  }

  return { saveFile, getFile, deleteFile, openFile };
})();