/**
 * DevConsole Toolkit — Scan History Manager
 * Track, compare, and analyze scan results over time.
 */

const DCTScanHistory = {
    _key: 'dct-scan-history',
    _maxEntries: 200,

    add(tool, results) {
        const history = this.getAll();
        history.push({
            tool,
            results,
            timestamp: Date.now(),
            url: window.location.href,
            summary: {
                total: results.totalFindings || results.total || 0,
                critical: results.critical || 0,
                high: results.high || 0
            }
        });
        if (history.length > this._maxEntries) history.splice(0, history.length - this._maxEntries);
        try { localStorage.setItem(this._key, JSON.stringify(history)); } catch (e) {}
    },

    getAll() {
        try { return JSON.parse(localStorage.getItem(this._key) || '[]'); } catch (e) { return []; }
    },

    getByTool(tool) {
        return this.getAll().filter(h => h.tool === tool);
    },

    getRecent(count = 10) {
        return this.getAll().slice(-count);
    },

    compare(tool) {
        const scans = this.getByTool(tool);
        if (scans.length < 2) return null;
        const prev = scans[scans.length - 2];
        const curr = scans[scans.length - 1];
        return { previous: prev.summary, current: curr.summary, delta: curr.summary.total - prev.summary.total, improved: curr.summary.total < prev.summary.total };
    },

    getTrend(tool, last = 10) {
        return this.getByTool(tool).slice(-last).map(s => ({ timestamp: s.timestamp, total: s.summary.total, critical: s.summary.critical }));
    },

    clear(tool) {
        if (tool) {
            const history = this.getAll().filter(h => h.tool !== tool);
            localStorage.setItem(this._key, JSON.stringify(history));
        } else {
            localStorage.removeItem(this._key);
        }
    },

    export() {
        const history = this.getAll();
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `scan-history-${Date.now()}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }
};

if (typeof window !== 'undefined') window.DCTScanHistory = DCTScanHistory;
