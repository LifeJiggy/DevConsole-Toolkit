/**
 * DevConsole Toolkit — Persistent Memory
 * Store and recall scan results, preferences, and history across sessions.
 * Uses localStorage with namespaced keys.
 */

const DCTMemory = {
    _namespace: 'dct-memory',
    _maxHistory: 100,

    // ═══════════════════════════════════════════════════════
    // CORE OPERATIONS
    // ═══════════════════════════════════════════════════════

    _key(name) {
        return `${this._namespace}:${name}`;
    },

    set(name, value, ttl = null) {
        const entry = {
            value,
            created: Date.now(),
            updated: Date.now(),
            ttl: ttl ? Date.now() + ttl : null
        };
        try {
            localStorage.setItem(this._key(name), JSON.stringify(entry));
            return true;
        } catch (e) {
            console.warn('Memory write failed:', e.message);
            return false;
        }
    },

    get(name, defaultValue = null) {
        try {
            const raw = localStorage.getItem(this._key(name));
            if (!raw) return defaultValue;

            const entry = JSON.parse(raw);
            if (entry.ttl && Date.now() > entry.ttl) {
                localStorage.removeItem(this._key(name));
                return defaultValue;
            }
            return entry.value;
        } catch (e) {
            return defaultValue;
        }
    },

    has(name) {
        return localStorage.getItem(this._key(name)) !== null;
    },

    remove(name) {
        localStorage.removeItem(this._key(name));
        return true;
    },

    clear() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this._namespace + ':')) {
                keys.push(key);
            }
        }
        keys.forEach(k => localStorage.removeItem(k));
        return keys.length;
    },

    keys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this._namespace + ':')) {
                keys.push(key.replace(this._namespace + ':', ''));
            }
        }
        return keys;
    },

    // ═══════════════════════════════════════════════════════
    // HISTORY
    // ═══════════════════════════════════════════════════════

    pushHistory(category, data) {
        const history = this.get(`history:${category}`, []);
        history.push({
            data,
            timestamp: Date.now(),
            url: window.location.href
        });
        if (history.length > this._maxHistory) {
            history.splice(0, history.length - this._maxHistory);
        }
        this.set(`history:${category}`, history);
        return history.length;
    },

    getHistory(category, limit = 20) {
        const history = this.get(`history:${category}`, []);
        return history.slice(-limit);
    },

    clearHistory(category) {
        if (category) {
            this.remove(`history:${category}`);
        } else {
            this.keys().filter(k => k.startsWith('history:')).forEach(k => this.remove(k));
        }
        return true;
    },

    // ═══════════════════════════════════════════════════════
    // SCAN RESULTS
    // ═══════════════════════════════════════════════════════

    saveScanResult(toolName, results) {
        this.pushHistory(`scan:${toolName}`, {
            findings: results.totalFindings || 0,
            critical: results.critical || 0,
            high: results.high || 0,
            summary: results
        });
    },

    getScanHistory(toolName, limit = 10) {
        return this.getHistory(`scan:${toolName}`, limit);
    },

    compareScans(toolName) {
        const history = this.getScanHistory(toolName, 2);
        if (history.length < 2) return null;

        const previous = history[history.length - 2].data.summary;
        const current = history[history.length - 1].data.summary;

        return {
            previous,
            current,
            newFindings: (current.totalFindings || 0) - (previous.totalFindings || 0),
            improved: (current.totalFindings || 0) < (previous.totalFindings || 0)
        };
    },

    // ═══════════════════════════════════════════════════════
    // PREFERENCES
    // ═══════════════════════════════════════════════════════

    setPref(key, value) {
        return this.set(`pref:${key}`, value);
    },

    getPref(key, defaultValue = null) {
        return this.get(`pref:${key}`, defaultValue);
    },

    removePref(key) {
        return this.remove(`pref:${key}`);
    },

    getAllPrefs() {
        const prefs = {};
        this.keys().filter(k => k.startsWith('pref:')).forEach(k => {
            prefs[k.replace('pref:', '')] = this.get(k);
        });
        return prefs;
    },

    // ═══════════════════════════════════════════════════════
    // EXPORT / IMPORT
    // ═══════════════════════════════════════════════════════

    exportAll() {
        const data = {};
        this.keys().forEach(k => {
            data[k] = this.get(k);
        });
        return data;
    },

    importAll(data) {
        let imported = 0;
        Object.entries(data).forEach(([k, v]) => {
            this.set(k.replace(this._namespace + ':', ''), v);
            imported++;
        });
        return imported;
    },

    // ═══════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════

    getStats() {
        const keys = this.keys();
        const historyKeys = keys.filter(k => k.startsWith('history:'));
        const prefKeys = keys.filter(k => k.startsWith('pref:'));
        const otherKeys = keys.filter(k => !k.startsWith('history:') && !k.startsWith('pref:'));

        let totalSize = 0;
        keys.forEach(k => {
            const raw = localStorage.getItem(this._key(k));
            if (raw) totalSize += raw.length;
        });

        return {
            totalKeys: keys.length,
            historyEntries: historyKeys.length,
            preferences: prefKeys.length,
            otherData: otherKeys.length,
            estimatedSize: `${(totalSize / 1024).toFixed(1)} KB`
        };
    }
};

if (typeof window !== 'undefined') window.DCTMemory = DCTMemory;
if (typeof module !== 'undefined') module.exports = DCTMemory;
