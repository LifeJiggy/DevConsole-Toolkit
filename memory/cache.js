/**
 * DevConsole Toolkit — In-Memory LRU Cache
 * High-performance caching for repeated operations.
 */

const DCTCache = {
    _store: new Map(),
    _maxSize: 1000,
    _hits: 0,
    _misses: 0,

    get(key) {
        if (this._store.has(key)) {
            const entry = this._store.get(key);
            // Move to end (most recently used)
            this._store.delete(key);
            this._store.set(key, entry);
            this._hits++;
            return entry.value;
        }
        this._misses++;
        return null;
    },

    set(key, value, ttl = null) {
        if (this._store.size >= this._maxSize) {
            // Remove oldest entry (first in Map)
            const firstKey = this._store.keys().next().value;
            this._store.delete(firstKey);
        }
        this._store.set(key, { value, created: Date.now(), ttl });
    },

    has(key) {
        const entry = this._store.get(key);
        if (!entry) return false;
        if (entry.ttl && Date.now() - entry.created > entry.ttl) {
            this._store.delete(key);
            return false;
        }
        return true;
    },

    delete(key) { return this._store.delete(key); },
    clear() { this._store.clear(); this._hits = 0; this._misses = 0; },
    size() { return this._store.size; },

    stats() {
        return {
            size: this._store.size,
            maxSize: this._maxSize,
            hits: this._hits,
            misses: this._misses,
            hitRate: this._hits + this._misses > 0 ? (this._hits / (this._hits + this._misses) * 100).toFixed(1) + '%' : '0%'
        };
    },

    // Memoize a function
    memoize(fn, ttl = null) {
        const cache = this;
        return function(...args) {
            const key = JSON.stringify(args);
            const cached = cache.get(key);
            if (cached !== null) return cached;
            const result = fn.apply(this, args);
            cache.set(key, result, ttl);
            return result;
        };
    }
};

if (typeof window !== 'undefined') window.DCTCache = DCTCache;
