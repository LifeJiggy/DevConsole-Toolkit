/**
 * DevConsole Toolkit — Vulnerability Scanning Agent
 * Automated vulnerability detection across multiple categories.
 */

const DCTVulnAgent = {
    async scanAll() {
        return {
            timestamp: new Date().toISOString(),
            xss: this.scanXSS(),
            secrets: this.scanSecrets(),
            misconfig: this.scanMisconfig(),
            cookies: this.scanCookies(),
            storage: this.scanStorage(),
            summary: {}
        };
    },

    scanXSS() {
        const findings = [];
        const patterns = [
            { regex: /innerHTML\s*=/gi, name: 'innerHTML', severity: 'high' },
            { regex: /document\.write\s*\(/gi, name: 'document.write', severity: 'high' },
            { regex: /\beval\s*\(/gi, name: 'eval', severity: 'critical' },
            { regex: /new\s+Function\s*\(/gi, name: 'Function constructor', severity: 'critical' },
            { regex: /setTimeout\s*\(\s*["']/gi, name: 'setTimeout string', severity: 'high' },
            { regex: /dangerouslySetInnerHTML/gi, name: 'dangerouslySetInnerHTML', severity: 'high' },
            { regex: /v-html\s*=/gi, name: 'v-html', severity: 'high' }
        ];

        document.querySelectorAll('script:not([src])').forEach((s, i) => {
            const content = s.textContent || '';
            patterns.forEach(p => {
                p.regex.lastIndex = 0;
                if (p.regex.test(content)) {
                    findings.push({ type: p.name, severity: p.severity, source: `Script #${i}` });
                }
            });
        });
        return findings;
    },

    scanSecrets() {
        const findings = [];
        const patterns = [
            { regex: /AKIA[0-9A-Z]{16}/g, name: 'AWS Key', severity: 'critical' },
            { regex: /ghp_[A-Za-z0-9]{36}/g, name: 'GitHub PAT', severity: 'critical' },
            { regex: /sk_live_[0-9a-zA-Z]{24,}/g, name: 'Stripe Key', severity: 'critical' },
            { regex: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, name: 'JWT', severity: 'high' },
            { regex: /(?:password|secret)\s*[:=]\s*["'][^"']{8,}["']/gi, name: 'Hardcoded Secret', severity: 'critical' }
        ];

        const allContent = document.documentElement.outerHTML;
        patterns.forEach(p => {
            const matches = allContent.match(p.regex) || [];
            if (matches.length > 0) {
                findings.push({ type: p.name, severity: p.severity, count: matches.length });
            }
        });
        return findings;
    },

    scanMisconfig() {
        const findings = [];
        const metaTags = document.querySelectorAll('meta[http-equiv]');
        const headers = {};
        metaTags.forEach(m => { headers[m.getAttribute('http-equiv')] = m.getAttribute('content'); });

        if (!headers['Content-Security-Policy']) findings.push({ type: 'Missing CSP', severity: 'high' });
        if (!headers['X-Frame-Options']) findings.push({ type: 'Missing X-Frame-Options', severity: 'medium' });

        document.querySelectorAll('script[src]').forEach(s => {
            if (!s.hasAttribute('integrity') && !s.src.startsWith(location.origin)) {
                findings.push({ type: 'Missing SRI', severity: 'medium', source: s.src });
            }
        });

        return findings;
    },

    scanCookies() {
        const findings = [];
        document.cookie.split(';').forEach(c => {
            const [name] = c.trim().split('=');
            if (!name) return;
            if (!c.includes('Secure') && location.protocol === 'https:') findings.push({ cookie: name.trim(), issue: 'Missing Secure', severity: 'high' });
            if (!c.includes('HttpOnly')) findings.push({ cookie: name.trim(), issue: 'Missing HttpOnly', severity: 'medium' });
            if (!c.includes('SameSite')) findings.push({ cookie: name.trim(), issue: 'Missing SameSite', severity: 'low' });
        });
        return findings;
    },

    scanStorage() {
        const findings = [];
        const sensitivePatterns = /token|secret|password|key|auth/i;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (sensitivePatterns.test(key)) {
                    findings.push({ storage: 'localStorage', key, severity: 'medium' });
                }
            }
        } catch (e) {}

        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (sensitivePatterns.test(key)) {
                    findings.push({ storage: 'sessionStorage', key, severity: 'medium' });
                }
            }
        } catch (e) {}

        return findings;
    }
};

if (typeof window !== 'undefined') window.DCTVulnAgent = DCTVulnAgent;
