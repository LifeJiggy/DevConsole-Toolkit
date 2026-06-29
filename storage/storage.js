/**
 * DevConsole Toolkit — Storage Manager
 * Audit, monitor, and manage browser storage (localStorage, sessionStorage, cookies).
 * Paste into browser console to use.
 */

const DCTStorage = {
    _monitoring: false,
    _monitorInterval: null,
    _snapshots: [],

    // ═══════════════════════════════════════════════════════
    // AUDIT
    // ═══════════════════════════════════════════════════════

    auditLocalStorage() {
        return this._auditStorage(localStorage, 'localStorage');
    },

    auditSessionStorage() {
        return this._auditStorage(sessionStorage, 'sessionStorage');
    },

    auditCookies() {
        const findings = [];
        const cookies = document.cookie.split(';').map(c => c.trim()).filter(Boolean);

        cookies.forEach(cookie => {
            const [name, ...valueParts] = cookie.split('=');
            const value = valueParts.join('=');

            if (!name) return;

            const issues = [];
            if (!cookie.includes('Secure') && window.location.protocol === 'https:') {
                issues.push('missing Secure flag');
            }
            if (!cookie.includes('HttpOnly')) {
                issues.push('missing HttpOnly flag');
            }
            if (!cookie.includes('SameSite')) {
                issues.push('missing SameSite attribute');
            }

            if (issues.length > 0) {
                findings.push({
                    type: 'cookie',
                    name: name.trim(),
                    issues,
                    severity: issues.length > 1 ? 'high' : 'medium'
                });
            }
        });

        return findings;
    },

    auditAll() {
        return {
            localStorage: this.auditLocalStorage(),
            sessionStorage: this.auditSessionStorage(),
            cookies: this.auditCookies(),
            summary: {
                localStorageCount: this.getLocalStorageItems().length,
                sessionStorageCount: this.getSessionStorageItems().length,
                cookieCount: document.cookie.split(';').filter(c => c.trim()).length
            }
        };
    },

    // ═══════════════════════════════════════════════════════
    // READ
    // ═══════════════════════════════════════════════════════

    getLocalStorageItems() {
        return this._getStorageItems(localStorage);
    },

    getSessionStorageItems() {
        return this._getStorageItems(sessionStorage);
    },

    getCookieItems() {
        return document.cookie.split(';').map(c => c.trim()).filter(Boolean).map(cookie => {
            const [name, ...valueParts] = cookie.split('=');
            return { name: name.trim(), value: valueParts.join('='), raw: cookie };
        });
    },

    // ═══════════════════════════════════════════════════════
    // WRITE
    // ═══════════════════════════════════════════════════════

    setItem(key, value, type = 'local') {
        const storage = type === 'session' ? sessionStorage : localStorage;
        try {
            storage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    },

    getItem(key, type = 'local') {
        const storage = type === 'session' ? sessionStorage : localStorage;
        return storage.getItem(key);
    },

    removeItem(key, type = 'local') {
        const storage = type === 'session' ? sessionStorage : localStorage;
        storage.removeItem(key);
        return true;
    },

    clearStorage(type = 'local') {
        const storage = type === 'session' ? sessionStorage : localStorage;
        storage.clear();
        return true;
    },

    // ═══════════════════════════════════════════════════════
    // MONITOR
    // ═══════════════════════════════════════════════════════

    startMonitoring(interval = 5000) {
        if (this._monitoring) return;
        this._monitoring = true;

        // Take initial snapshot
        this._snapshots.push(this._takeSnapshot());

        // Monitor for changes
        const origSetItem = Storage.prototype.setItem;
        const origRemoveItem = Storage.prototype.removeItem;
        const origClear = Storage.prototype.clear;
        const self = this;

        Storage.prototype.setItem = function(key, value) {
            const oldValue = this.getItem(key);
            origSetItem.call(this, key, value);
            self._recordChange(this === localStorage ? 'localStorage' : 'sessionStorage', 'set', key, oldValue, value);
        };

        Storage.prototype.removeItem = function(key) {
            const oldValue = this.getItem(key);
            origRemoveItem.call(this, key);
            self._recordChange(this === localStorage ? 'localStorage' : 'sessionStorage', 'remove', key, oldValue, null);
        };

        Storage.prototype.clear = function() {
            origClear.call(this);
            self._recordChange(this === localStorage ? 'localStorage' : 'sessionStorage', 'clear', null, null, null);
        };

        this._origStorageMethods = { setItem: origSetItem, removeItem: origRemoveItem, clear: origClear };
    },

    stopMonitoring() {
        if (!this._monitoring) return;
        this._monitoring = false;

        if (this._origStorageMethods) {
            Storage.prototype.setItem = this._origStorageMethods.setItem;
            Storage.prototype.removeItem = this._origStorageMethods.removeItem;
            Storage.prototype.clear = this._origStorageMethods.clear;
            this._origStorageMethods = null;
        }
    },

    getChanges() {
        return this._snapshots;
    },

    // ═══════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════

    _auditStorage(storage, name) {
        const findings = [];
        const items = this._getStorageItems(storage);

        items.forEach(item => {
            const issues = [];
            const valueLower = (item.value || '').toLowerCase();
            const keyLower = item.key.toLowerCase();

            // Check for sensitive data
            const sensitivePatterns = [
                { pattern: /token|jwt|auth|session/i, desc: 'potential auth token' },
                { pattern: /password|passwd|pwd|secret/i, desc: 'potential password/secret' },
                { pattern: /api[_-]?key|apikey/i, desc: 'potential API key' },
                { pattern: /credit|card|ssn|passport/i, desc: 'potential PII/payment data' }
            ];

            sensitivePatterns.forEach(sp => {
                if (sp.pattern.test(keyLower) || sp.pattern.test(valueLower)) {
                    issues.push(sp.desc);
                }
            });

            // Check for very long values (potential data dumps)
            if (item.value && item.value.length > 10000) {
                issues.push('very large value (potential data dump)');
            }

            // Check for base64 encoded data
            if (item.value && item.value.length > 50 && /^[A-Za-z0-9+/=_\-]+$/.test(item.value)) {
                issues.push('base64 encoded data');
            }

            if (issues.length > 0) {
                findings.push({
                    type: name,
                    key: item.key,
                    valueLength: item.value ? item.value.length : 0,
                    issues,
                    severity: issues.some(i => i.includes('password') || i.includes('secret') || i.includes('API key')) ? 'critical' : 'medium'
                });
            }
        });

        return findings;
    },

    _getStorageItems(storage) {
        const items = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            items.push({ key, value: storage.getItem(key) });
        }
        return items;
    },

    _takeSnapshot() {
        return {
            timestamp: Date.now(),
            localStorage: this.getLocalStorageItems().length,
            sessionStorage: this.getSessionStorageItems().length,
            cookies: this.getCookieItems().length
        };
    },

    _recordChange(storage, action, key, oldValue, newValue) {
        this._snapshots.push({
            timestamp: Date.now(),
            storage,
            action,
            key,
            oldValueLength: oldValue ? oldValue.length : 0,
            newValueLength: newValue ? newValue.length : 0
        });

        // Keep last 500 changes
        if (this._snapshots.length > 500) {
            this._snapshots.splice(0, this._snapshots.length - 500);
        }
    },

    // ═══════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════

    exportJSON() {
        const data = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            localStorage: this.getLocalStorageItems(),
            sessionStorage: this.getSessionStorageItems(),
            cookies: this.getCookieItems()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `storage-audit-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

if (typeof window !== 'undefined') window.DCTStorage = DCTStorage;
if (typeof module !== 'undefined') module.exports = DCTStorage;
