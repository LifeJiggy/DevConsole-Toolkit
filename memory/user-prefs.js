/**
 * DevConsole Toolkit — User Preferences
 * Manage user preferences with schema validation and defaults.
 */

const DCTUserPrefs = {
    _key: 'dct-user-prefs',
    _schema: {
        theme: { type: 'string', default: 'dark', values: ['dark', 'light', 'auto'] },
        language: { type: 'string', default: 'en', values: ['en', 'es', 'fr', 'de', 'ja'] },
        scanOnLoad: { type: 'boolean', default: true },
        autoExport: { type: 'boolean', default: false },
        exportFormat: { type: 'string', default: 'json', values: ['json', 'csv', 'md'] },
        maxHistory: { type: 'number', default: 100, min: 10, max: 1000 },
        showBanner: { type: 'boolean', default: true },
        confidenceThreshold: { type: 'number', default: 0.5, min: 0, max: 1 },
        enableNotifications: { type: 'boolean', default: false }
    },

    _prefs: null,

    _load() {
        if (this._prefs) return this._prefs;
        try {
            this._prefs = JSON.parse(localStorage.getItem(this._key) || '{}');
        } catch (e) {
            this._prefs = {};
        }
        // Apply defaults
        Object.entries(this._schema).forEach(([key, schema]) => {
            if (this._prefs[key] === undefined) this._prefs[key] = schema.default;
        });
        return this._prefs;
    },

    _save() {
        try { localStorage.setItem(this._key, JSON.stringify(this._prefs)); } catch (e) {}
    },

    get(key) {
        this._load();
        return this._prefs[key];
    },

    set(key, value) {
        this._load();
        const schema = this._schema[key];
        if (!schema) return false;

        // Validate type
        if (typeof value !== schema.type) return false;

        // Validate values
        if (schema.values && !schema.values.includes(value)) return false;
        if (schema.min !== undefined && value < schema.min) return false;
        if (schema.max !== undefined && value > schema.max) return false;

        this._prefs[key] = value;
        this._save();
        return true;
    },

    getAll() { return { ...this._load() }; },

    reset() {
        this._prefs = {};
        localStorage.removeItem(this._key);
        this._load();
    },

    getSchema() { return { ...this._schema }; }
};

if (typeof window !== 'undefined') window.DCTUserPrefs = DCTUserPrefs;
