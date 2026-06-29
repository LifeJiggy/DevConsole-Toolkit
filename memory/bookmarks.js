/**
 * DevConsole Toolkit — Findings Bookmarks
 * Bookmark, tag, and organize important findings.
 */

const DCTBookmarks = {
    _key: 'dct-bookmarks',

    add(finding, tags = [], notes = '') {
        const bookmarks = this.getAll();
        bookmarks.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            finding,
            tags,
            notes,
            url: window.location.href,
            timestamp: Date.now(),
            resolved: false
        });
        this._save(bookmarks);
        return bookmarks[bookmarks.length - 1].id;
    },

    remove(id) {
        const bookmarks = this.getAll().filter(b => b.id !== id);
        this._save(bookmarks);
        return bookmarks.length;
    },

    resolve(id) {
        const bookmarks = this.getAll();
        const bookmark = bookmarks.find(b => b.id === id);
        if (bookmark) { bookmark.resolved = true; bookmark.resolvedAt = Date.now(); }
        this._save(bookmarks);
    },

    getAll() {
        try { return JSON.parse(localStorage.getItem(this._key) || '[]'); } catch (e) { return []; }
    },

    getByTag(tag) {
        return this.getAll().filter(b => b.tags.includes(tag));
    },

    getUnresolved() {
        return this.getAll().filter(b => !b.resolved);
    },

    getStats() {
        const all = this.getAll();
        const tags = {};
        all.forEach(b => b.tags.forEach(t => { tags[t] = (tags[t] || 0) + 1; }));
        return { total: all.length, resolved: all.filter(b => b.resolved).length, unresolved: all.filter(b => !b.resolved).length, tags };
    },

    clear() { localStorage.removeItem(this._key); },

    export() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `bookmarks-${Date.now()}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    },

    _save(bookmarks) {
        try { localStorage.setItem(this._key, JSON.stringify(bookmarks)); } catch (e) {}
    }
};

if (typeof window !== 'undefined') window.DCTBookmarks = DCTBookmarks;
