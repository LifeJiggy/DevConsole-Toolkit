/**
 * DevConsole Toolkit — Utility Functions
 * Core utilities for URL parsing, encoding, hashing, validation, and more.
 * Paste into browser console to use.
 */

const DCTUtils = {
    // ═══════════════════════════════════════════════════════
    // URL UTILITIES
    // ═══════════════════════════════════════════════════════

    parseURL(url) {
        try {
            const u = new URL(url, window.location.origin);
            return {
                href: u.href,
                origin: u.origin,
                protocol: u.protocol,
                hostname: u.hostname,
                port: u.port,
                pathname: u.pathname,
                search: u.search,
                hash: u.hash,
                params: Object.fromEntries(u.searchParams),
                isSameOrigin: u.origin === window.location.origin,
                isAbsolute: u.href === u.origin + u.pathname
            };
        } catch (e) {
            return null;
        }
    },

    getQueryParams(url) {
        try {
            const u = new URL(url || window.location.href);
            return Object.fromEntries(u.searchParams);
        } catch (e) {
            return {};
        }
    },

    getParam(name, url) {
        try {
            const u = new URL(url || window.location.href);
            return u.searchParams.get(name);
        } catch (e) {
            return null;
        }
    },

    setParam(name, value, url) {
        try {
            const u = new URL(url || window.location.href);
            u.searchParams.set(name, value);
            return u.href;
        } catch (e) {
            return null;
        }
    },

    removeParam(name, url) {
        try {
            const u = new URL(url || window.location.href);
            u.searchParams.delete(name);
            return u.href;
        } catch (e) {
            return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // ENCODING / DECODING
    // ═══════════════════════════════════════════════════════

    b64Encode(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            return null;
        }
    },

    b64Decode(str) {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return null;
        }
    },

    urlEncode(str) {
        return encodeURIComponent(str);
    },

    urlDecode(str) {
        return decodeURIComponent(str);
    },

    htmlEncode(str) {
        const el = document.createElement('div');
        el.textContent = str;
        return el.innerHTML;
    },

    htmlDecode(str) {
        const el = document.createElement('div');
        el.innerHTML = str;
        return el.textContent;
    },

    hexEncode(str) {
        return Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    hexDecode(hex) {
        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        return new TextDecoder().decode(bytes);
    },

    // ═══════════════════════════════════════════════════════
    // HASHING
    // ═══════════════════════════════════════════════════════

    async sha256(str) {
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async sha1(str) {
        const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async md5(str) {
        const buffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // ═══════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════

    isURL(str) {
        try { new URL(str); return true; } catch (e) { return false; }
    },

    isEmail(str) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    },

    isIP(str) {
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str);
    },

    isBase64(str) {
        try { atob(str); return true; } catch (e) { return false; }
    },

    isJWT(str) {
        return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(str);
    },

    isJSON(str) {
        try { JSON.parse(str); return true; } catch (e) { return false; }
    },

    isHex(str) {
        return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
    },

    // ═══════════════════════════════════════════════════════
    // ENTROPY & ANALYSIS
    // ═══════════════════════════════════════════════════════

    shannonEntropy(str) {
        if (!str || str.length === 0) return 0;
        const freq = {};
        for (const c of str) freq[c] = (freq[c] || 0) + 1;
        let entropy = 0;
        for (const count of Object.values(freq)) {
            const p = count / str.length;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    },

    classifyString(str) {
        if (!str) return 'empty';
        if (this.isJWT(str)) return 'jwt';
        if (this.isBase64(str) && str.length > 20) return 'base64';
        if (this.isHex(str) && str.length >= 32) return 'hex-hash';
        if (this.isEmail(str)) return 'email';
        if (this.isIP(str)) return 'ip';
        if (this.isURL(str)) return 'url';
        if (this.isJSON(str)) return 'json';
        if (this.shannonEntropy(str) > 4.5) return 'high-entropy';
        if (str.length > 20) return 'long-string';
        return 'text';
    },

    // ═══════════════════════════════════════════════════════
    // DOM HELPERS
    // ═══════════════════════════════════════════════════════

    getSelectedText() {
        return window.getSelection()?.toString() || '';
    },

    getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    },

    setCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    },

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    },

    getStorage(type = 'local') {
        const storage = type === 'session' ? sessionStorage : localStorage;
        const items = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            items.push({ key, value: storage.getItem(key) });
        }
        return items;
    },

    // ═══════════════════════════════════════════════════════
    // TABLE / DISPLAY HELPERS
    // ═══════════════════════════════════════════════════════

    table(data, options = {}) {
        if (Array.isArray(data)) {
            console.table(data);
        } else {
            const rows = Object.entries(data).map(([k, v]) => ({
                Key: k,
                Value: typeof v === 'object' ? JSON.stringify(v) : String(v)
            }));
            console.table(rows);
        }
    },

    banner(title) {
        const line = '═'.repeat(Math.min(title.length + 4, 60));
        console.log(`\n${line}`);
        console.log(`  ${title}`);
        console.log(`${line}\n`);
    },

    divider(char = '─', len = 50) {
        console.log(char.repeat(len));
    },

    // ═══════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════

    download(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadJSON(data, filename) {
        this.download(JSON.stringify(data, null, 2), filename || `export-${Date.now()}.json`, 'application/json');
    },

    downloadCSV(headers, rows, filename) {
        const escape = v => `"${String(v).replace(/"/g, '""')}"`;
        const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
        this.download(csv, filename || `export-${Date.now()}.csv`, 'text/csv');
    },

    downloadMarkdown(md, filename) {
        this.download(md, filename || `export-${Date.now()}.md`, 'text/markdown');
    }
};

// Expose globally
if (typeof window !== 'undefined') window.DCTUtils = DCTUtils;
if (typeof module !== 'undefined') module.exports = DCTUtils;
