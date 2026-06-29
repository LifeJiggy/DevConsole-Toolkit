/**
 * DevConsole Toolkit — Reconnaissance Agent
 * Automated reconnaissance workflows for web application analysis.
 */

const DCTReconAgent = {
    async fullRecon() {
        const results = {
            timestamp: new Date().toISOString(),
            url: location.href,
            page: this.fingerprintPage(),
            security: this.auditSecurity(),
            content: this.analyzeContent(),
            thirdParty: this.analyzeThirdParty(),
            summary: {}
        };
        results.summary = this.generateSummary(results);
        return results;
    },

    fingerprintPage() {
        const doc = document;
        return {
            title: doc.title,
            doctype: doc.doctype ? doc.doctype.name : 'none',
            lang: doc.documentElement.lang || 'unknown',
            scripts: doc.querySelectorAll('script').length,
            inlineScripts: doc.querySelectorAll('script:not([src])').length,
            externalScripts: doc.querySelectorAll('script[src]').length,
            stylesheets: doc.querySelectorAll('link[rel="stylesheet"]').length,
            forms: doc.querySelectorAll('form').length,
            inputs: doc.querySelectorAll('input, textarea, select').length,
            iframes: doc.querySelectorAll('iframe').length,
            images: doc.querySelectorAll('img').length,
            links: doc.querySelectorAll('a').length,
            metaTags: doc.querySelectorAll('meta').length,
            frameworks: this.detectFrameworks(),
            cookies: document.cookie.split(';').filter(c => c.trim()).length,
            hasServiceWorker: 'serviceWorker' in navigator,
            hasWebGL: !!document.createElement('canvas').getContext('webgl'),
            hasWebWorker: typeof Worker !== 'undefined'
        };
    },

    detectFrameworks() {
        const detected = [];
        if (window.React || document.querySelector('[data-reactroot]') || document.querySelector('[data-reactid]')) detected.push('React');
        if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__ || window.Vue || document.querySelector('[data-v-]')) detected.push('Vue');
        if (window.ng || document.querySelector('[ng-version]') || document.querySelector('[ng-app]')) detected.push('Angular');
        if (window.__NEXT_DATA__ || document.querySelector('#__next')) detected.push('Next.js');
        if (window.__NUXT__ || document.querySelector('#__nuxt')) detected.push('Nuxt');
        if (window.Ember) detected.push('Ember');
        if (window.Backbone) detected.push('Backbone');
        if (window.jQuery || window.$) detected.push('jQuery');
        if (window.__REDUX_DEVTOOLS_EXTENSION__) detected.push('Redux DevTools');
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) detected.push('React DevTools');
        return detected;
    },

    auditSecurity() {
        const findings = [];
        const metaTags = document.querySelectorAll('meta[http-equiv]');
        const headers = {};
        metaTags.forEach(m => { headers[m.getAttribute('http-equiv')] = m.getAttribute('content'); });

        if (!headers['Content-Security-Policy']) findings.push({ type: 'Missing CSP', severity: 'high' });
        if (!headers['X-Frame-Options']) findings.push({ type: 'Missing X-Frame-Options', severity: 'medium' });
        if (!headers['X-Content-Type-Options']) findings.push({ type: 'Missing X-Content-Type-Options', severity: 'low' });
        if (!headers['Strict-Transport-Security']) findings.push({ type: 'Missing HSTS', severity: 'medium' });

        return { headers, findings };
    },

    analyzeContent() {
        const scripts = [];
        document.querySelectorAll('script:not([src])').forEach((s, i) => {
            const content = s.textContent || '';
            if (content.length > 50) {
                scripts.push({
                    index: i, length: content.length,
                    hasEval: /\beval\s*\(/.test(content),
                    hasDocumentWrite: /document\.write/.test(content),
                    hasInnerHTML: /innerHTML/.test(content),
                    urlCount: (content.match(/https?:\/\//g) || []).length
                });
            }
        });
        return { inlineScriptCount: scripts.length, scripts };
    },

    analyzeThirdParty() {
        const resources = [];
        document.querySelectorAll('script[src], link[href]').forEach(el => {
            const src = el.src || el.href;
            try {
                const url = new URL(src, location.origin);
                if (url.origin !== location.origin) {
                    resources.push({ type: el.tagName, hostname: url.hostname, hasIntegrity: el.hasAttribute('integrity') });
                }
            } catch (e) {}
        });
        return { count: resources.length, resources };
    },

    generateSummary(results) {
        return {
            pageScore: results.security.findings.length > 5 ? 'POOR' : results.security.findings.length > 2 ? 'FAIR' : 'GOOD',
            scriptRisk: results.content.scripts.some(s => s.hasEval || s.hasDocumentWrite) ? 'HIGH' : 'LOW',
            thirdPartyCount: results.thirdParty.count,
            frameworkCount: results.page.frameworks.length
        };
    }
};

if (typeof window !== 'undefined') window.DCTReconAgent = DCTReconAgent;
