/**
 * DevConsole Toolkit — Cookie Parser
 * Advanced cookie parsing, analysis, and security checking.
 */

const DCTCookieParser = {
    parse(str = document.cookie) {
        const cookies = [];
        str.split(';').forEach(c => {
            const trimmed = c.trim();
            if (!trimmed) return;
            const eqIdx = trimmed.indexOf('=');
            const name = eqIdx > -1 ? trimmed.substring(0, eqIdx).trim() : trimmed;
            const value = eqIdx > -1 ? trimmed.substring(eqIdx + 1).trim() : '';

            let isSecure = false, isHttpOnly = false, sameSite = 'None', path = '/', domain = '';

            // Check flags in the cookie string
            if (trimmed.includes('Secure')) isSecure = true;
            if (trimmed.includes('HttpOnly')) isHttpOnly = true;
            if (trimmed.includes('SameSite=Lax')) sameSite = 'Lax';
            else if (trimmed.includes('SameSite=Strict')) sameSite = 'Strict';

            const pathMatch = trimmed.match(/Path=([^;]+)/i);
            if (pathMatch) path = pathMatch[1].trim();

            const domainMatch = trimmed.match(/Domain=([^;]+)/i);
            if (domainMatch) domain = domainMatch[1].trim();

            cookies.push({ name, value, valueLength: value.length, isSecure, isHttpOnly, sameSite, path, domain, classification: this.classify(name, value) });
        });
        return cookies;
    },

    classify(name, value) {
        const nameL = name.toLowerCase();
        if (/session|sid|sess/.test(nameL)) return 'session';
        if (/token|jwt|auth|access|bearer/.test(nameL)) return 'auth';
        if (/csrf|xsrf|nonce/.test(nameL)) return 'csrf';
        if (/lang|locale|theme|pref/.test(nameL)) return 'preference';
        if (/__utm|_ga|_gid|fbp|fr/.test(nameL)) return 'tracking';
        return 'other';
    },

    audit(cookies = null) {
        if (!cookies) cookies = this.parse();
        const issues = [];

        cookies.forEach(cookie => {
            const cookieIssues = [];

            if (!cookie.isSecure && location.protocol === 'https:') {
                cookieIssues.push({ issue: 'Missing Secure flag', severity: 'high', description: 'Cookie sent over HTTP - interceptable' });
            }
            if (!cookie.isHttpOnly && ['session', 'auth'].includes(cookie.classification)) {
                cookieIssues.push({ issue: 'Missing HttpOnly flag', severity: 'high', description: 'Auth cookie accessible via JavaScript - XSS risk' });
            }
            if (cookie.sameSite === 'None' && cookie.classification === 'auth') {
                cookieIssues.push({ issue: 'SameSite=None on auth cookie', severity: 'medium', description: 'Auth cookie sent cross-site - CSRF risk' });
            }
            if (cookie.classification === 'auth' && cookie.valueLength < 20) {
                cookieIssues.push({ issue: 'Short auth token', severity: 'low', description: 'Auth token value is short - may be guessable' });
            }

            if (cookieIssues.length > 0) {
                issues.push({ cookie: cookie.name, classification: cookie.classification, issues: cookieIssues });
            }
        });

        return {
            total: cookies.length,
            byClassification: cookies.reduce((acc, c) => { acc[c.classification] = (acc[c.classification] || 0) + 1; return acc; }, {}),
            issues,
            score: Math.max(0, 100 - issues.reduce((s, i) => s + i.issues.length * 10, 0))
        };
    }
};

if (typeof window !== 'undefined') window.DCTCookieParser = DCTCookieParser;
