/**
 * DevConsole Toolkit — Network Utilities
 * Fetch wrapper, request interception, CORS analysis helpers.
 */

const DCTNetwork = {
    _intercepted: [],

    // Fetch wrapper with logging
    async fetch(url, options = {}) {
        const start = performance.now();
        try {
            const response = await window.fetch(url, options);
            const duration = performance.now() - start;
            const entry = {
                url, method: options.method || 'GET', status: response.status,
                duration: Math.round(duration), size: parseInt(response.headers.get('content-length') || '0'),
                timestamp: Date.now()
            };
            this._intercepted.push(entry);
            return { response, entry };
        } catch (error) {
            this._intercepted.push({ url, method: options.method || 'GET', error: error.message, timestamp: Date.now() });
            throw error;
        }
    },

    // Get intercepted requests
    getIntercepted() { return [...this._intercepted]; },
    clearIntercepted() { this._intercepted = []; },

    // CORS analysis
    analyzeCORS() {
        const results = [];
        document.querySelectorAll('script[src], link[href]').forEach(el => {
            const src = el.src || el.href;
            try {
                const url = new URL(src, location.origin);
                results.push({ resource: el.tagName, url: src, origin: url.origin, sameOrigin: url.origin === location.origin });
            } catch (e) {}
        });
        return results;
    },

    // Check for mixed content
    checkMixedContent() {
        if (location.protocol !== 'https:') return { isHTTPS: false, findings: [] };
        const findings = [];
        document.querySelectorAll('script[src], link[href], img[src], iframe[src]').forEach(el => {
            const url = el.src || el.href;
            if (url && url.startsWith('http://')) {
                findings.push({ element: el.tagName, url, type: el.tagName === 'SCRIPT' ? 'active' : 'passive' });
            }
        });
        return { isHTTPS: true, findings, hasActive: findings.some(f => f.type === 'active') };
    },

    // Performance entries
    getPerformanceEntries() {
        return performance.getEntriesByType('resource').map(e => ({
            name: e.name.substring(0, 100), type: e.initiatorType,
            duration: Math.round(e.duration), size: e.transferSize || 0
        }));
    }
};

if (typeof window !== 'undefined') window.DCTNetwork = DCTNetwork;
