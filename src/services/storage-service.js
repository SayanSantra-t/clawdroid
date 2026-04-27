// ═══════════════════════════════════════════════
// StorageService — Persistent local storage via Capacitor Preferences + IndexedDB
// ═══════════════════════════════════════════════

export class StorageService {
  constructor() {
    this.db = null;
    this.DB_NAME = 'clawdroid_db';
    this.DB_VERSION = 1;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
          msgStore.createIndex('sessionId', 'sessionId', { unique: false });
          msgStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('memory')) {
          db.createObjectStore('memory', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('skills')) {
          db.createObjectStore('skills', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('automations')) {
          db.createObjectStore('automations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('channels')) {
          db.createObjectStore('channels', { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => { this.db = e.target.result; resolve(); };
      req.onerror = () => reject(req.error);
    });
  }

  // Generic store ops
  async _put(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async _get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async _delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async _clear(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Messages
  async addMessage(msg) { return this._put('messages', { ...msg, timestamp: Date.now() }); }
  async getMessages(sessionId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readonly');
      const idx = tx.objectStore('messages').index('sessionId');
      const req = idx.getAll(sessionId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  async clearMessages(sessionId) {
    const msgs = await this.getMessages(sessionId);
    const tx = this.db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    msgs.forEach(m => store.delete(m.id));
    return new Promise(r => { tx.oncomplete = r; });
  }

  // Sessions
  async saveSession(s) { return this._put('sessions', s); }
  async getSessions() { return this._getAll('sessions'); }
  async deleteSession(id) { return this._delete('sessions', id); }

  // Memory (key-value persistent)
  async setMemory(key, value) { return this._put('memory', { key, value, updatedAt: Date.now() }); }
  async getMemory(key) { const r = await this._get('memory', key); return r?.value ?? null; }
  async getAllMemory() { return this._getAll('memory'); }

  // Skills
  async saveSkill(s) { return this._put('skills', s); }
  async getSkills() { return this._getAll('skills'); }
  async deleteSkill(id) { return this._delete('skills', id); }

  // Automations
  async saveAutomation(a) { return this._put('automations', a); }
  async getAutomations() { return this._getAll('automations'); }
  async deleteAutomation(id) { return this._delete('automations', id); }

  // Channels
  async saveChannel(c) { return this._put('channels', c); }
  async getChannels() { return this._getAll('channels'); }
  async deleteChannel(id) { return this._delete('channels', id); }

  // Settings (localStorage fallback)
  getSetting(key, fallback = null) {
    try { const v = localStorage.getItem(`claw_${key}`); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
  }
  setSetting(key, value) {
    localStorage.setItem(`claw_${key}`, JSON.stringify(value));
  }
}
