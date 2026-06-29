/**
 * DevConsole Toolkit — Storage Migration
 * Migrate data between storage types (localStorage, sessionStorage, IndexedDB).
 */

const DCTMigrate = {
    // Migrate localStorage -> sessionStorage
    migrateLocalToSession(pattern = null) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!pattern || key.includes(pattern)) {
                const value = localStorage.getItem(key);
                sessionStorage.setItem(key, value);
                keys.push(key);
            }
        }
        return { migrated: keys.length, keys };
    },

    // Migrate sessionStorage -> localStorage
    migrateSessionToLocal(pattern = null) {
        const keys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (!pattern || key.includes(pattern)) {
                const value = sessionStorage.getItem(key);
                localStorage.setItem(key, value);
                keys.push(key);
            }
        }
        return { migrated: keys.length, keys };
    },

    // Export all storage
    exportAll() {
        const data = { localStorage: {}, sessionStorage: {}, timestamp: Date.now() };
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data.localStorage[key] = localStorage.getItem(key);
        }
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            data.sessionStorage[key] = sessionStorage.getItem(key);
        }
        return data;
    },

    // Import data
    importAll(data, target = 'both') {
        let imported = 0;
        if (data.localStorage && (target === 'both' || target === 'local')) {
            Object.entries(data.localStorage).forEach(([k, v]) => {
                localStorage.setItem(k, v);
                imported++;
            });
        }
        if (data.sessionStorage && (target === 'both' || target === 'session')) {
            Object.entries(data.sessionStorage).forEach(([k, v]) => {
                sessionStorage.setItem(k, v);
                imported++;
            });
        }
        return { imported };
    },

    // Clean expired entries (TTL-based)
    cleanExpired() {
        let cleaned = 0;
        ['localStorage', 'sessionStorage'].forEach(type => {
            const storage = type === 'localStorage' ? localStorage : sessionStorage;
            const keys = [];
            for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));
            keys.forEach(key => {
                try {
                    const raw = storage.getItem(key);
                    const data = JSON.parse(raw);
                    if (data && data.ttl && Date.now() > data.ttl) {
                        storage.removeItem(key);
                        cleaned++;
                    }
                } catch (e) {}
            });
        });
        return { cleaned };
    }
};

if (typeof window !== 'undefined') window.DCTMigrate = DCTMigrate;
