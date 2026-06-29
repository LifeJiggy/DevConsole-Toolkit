/**
 * DevConsole Toolkit — Automation Agent
 * Intelligent agent that orchestrates tools, chains scans, and auto-analyzes results.
 * Paste into browser console to use.
 */

const DCTAgent = {
    _activeWorkflows: new Map(),
    _results: [],
    _status: 'idle',

    // ═══════════════════════════════════════════════════════
    // WORKFLOW ENGINE
    // ═══════════════════════════════════════════════════════

    async runWorkflow(name, steps) {
        this._status = 'running';
        const workflow = {
            name,
            steps,
            startTime: Date.now(),
            results: [],
            status: 'running'
        };
        this._activeWorkflows.set(name, workflow);

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`[${i + 1}/${steps.length}] ${step.name || 'Step ' + (i + 1)}`);

            try {
                let result;
                if (typeof step.fn === 'function') {
                    result = await step.fn();
                } else if (typeof step.fn === 'string') {
                    result = await this._executeCommand(step.fn);
                }

                workflow.results.push({
                    step: step.name || `Step ${i + 1}`,
                    status: 'success',
                    result,
                    timestamp: Date.now()
                });

                if (step.callback) step.callback(result);
            } catch (error) {
                workflow.results.push({
                    step: step.name || `Step ${i + 1}`,
                    status: 'error',
                    error: error.message,
                    timestamp: Date.now()
                });

                if (step.continueOnError === false) {
                    break;
                }
            }
        }

        workflow.endTime = Date.now();
        workflow.duration = workflow.endTime - workflow.startTime;
        workflow.status = 'completed';
        this._status = 'idle';

        return workflow;
    },

    // ═══════════════════════════════════════════════════════
    // PRE-BUILT WORKFLOWS
    // ═══════════════════════════════════════════════════════

    async quickAudit() {
        return this.runWorkflow('quick-audit', [
            {
                name: 'Collect page info',
                fn: () => ({
                    url: window.location.href,
                    title: document.title,
                    scripts: document.querySelectorAll('script').length,
                    forms: document.querySelectorAll('form').length,
                    links: document.querySelectorAll('a').length
                })
            },
            {
                name: 'Check security headers',
                fn: () => this._checkSecurityHeaders()
            },
            {
                name: 'Scan for secrets',
                fn: () => this._scanForSecrets()
            },
            {
                name: 'Analyze cookies',
                fn: () => this._analyzeCookies()
            },
            {
                name: 'Check for debug endpoints',
                fn: () => this._checkDebugEndpoints()
            },
            {
                name: 'Generate report',
                fn: () => this._generateReport()
            }
        ]);
    },

    async fullRecon() {
        return this.runWorkflow('full-recon', [
            { name: 'Page fingerprint', fn: () => this._fingerprintPage() },
            { name: 'Security headers', fn: () => this._checkSecurityHeaders() },
            { name: 'Cookie audit', fn: () => this._analyzeCookies() },
            { name: 'Secret scan', fn: () => this._scanForSecrets() },
            { name: 'Debug endpoint check', fn: () => this._checkDebugEndpoints() },
            { name: 'Input field analysis', fn: () => this._analyzeInputFields() },
            { name: 'Form analysis', fn: () => this._analyzeForms() },
            { name: 'External resource check', fn: () => this._checkExternalResources() },
            { name: 'Console message capture', fn: () => this._captureConsoleMessages() },
            { name: 'Generate comprehensive report', fn: () => this._generateReport() }
        ]);
    },

    async secretHunter() {
        return this.runWorkflow('secret-hunter', [
            { name: 'Scan scripts for secrets', fn: () => this._scanScriptsForSecrets() },
            { name: 'Scan localStorage', fn: () => this._scanStorageForSecrets('local') },
            { name: 'Scan sessionStorage', fn: () => this._scanStorageForSecrets('session') },
            { name: 'Scan cookies', fn: () => this._scanCookiesForSecrets() },
            { name: 'Scan URL parameters', fn: () => this._scanURLForSecrets() },
            { name: 'Scan meta tags', fn: () => this._scanMetaForSecrets() },
            { name: 'Scan HTML comments', fn: () => this._scanCommentsForSecrets() },
            { name: 'Compile findings', fn: () => this._compileSecretFindings() }
        ]);
    },

    // ═══════════════════════════════════════════════════════
    // ANALYSIS METHODS
    // ═══════════════════════════════════════════════════════

    _checkSecurityHeaders() {
        const headers = {};
        const metaTags = document.querySelectorAll('meta[http-equiv]');
        metaTags.forEach(meta => {
            const equiv = meta.getAttribute('http-equiv');
            const content = meta.getAttribute('content');
            if (equiv && content) headers[equiv] = content;
        });

        const issues = [];
        if (!headers['Content-Security-Policy']) issues.push('Missing CSP');
        if (!headers['X-Frame-Options']) issues.push('Missing X-Frame-Options');
        if (!headers['X-Content-Type-Options']) issues.push('Missing X-Content-Type-Options');
        if (!headers['Strict-Transport-Security']) issues.push('Missing HSTS');

        return { headers, issues, score: Math.max(0, 4 - issues.length) };
    },

    _scanForSecrets() {
        const patterns = [
            { regex: /AKIA[0-9A-Z]{16}/, name: 'AWS Key', severity: 'critical' },
            { regex: /ghp_[0-9a-zA-Z]{36}/, name: 'GitHub PAT', severity: 'critical' },
            { regex: /sk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Key', severity: 'critical' },
            { regex: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, name: 'JWT', severity: 'high' },
            { regex: /(?:api[_-]?key|apikey|secret|password)\s*[:=]\s*["'][^"']{8,}["']/gi, name: 'Hardcoded Secret', severity: 'critical' }
        ];

        const findings = [];
        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, i) => {
            const content = script.textContent || '';
            patterns.forEach(p => {
                if (p.regex.test(content)) {
                    findings.push({ type: p.name, severity: p.severity, source: `Script #${i}` });
                }
            });
        });

        return { findings, count: findings.length };
    },

    _analyzeCookies() {
        const cookies = document.cookie.split(';').map(c => c.trim()).filter(Boolean);
        const issues = [];

        cookies.forEach(cookie => {
            const [name] = cookie.split('=');
            if (!name) return;

            const cookieIssues = [];
            if (!cookie.includes('Secure') && location.protocol === 'https:') cookieIssues.push('Missing Secure');
            if (!cookie.includes('HttpOnly')) cookieIssues.push('Missing HttpOnly');
            if (!cookie.includes('SameSite')) cookieIssues.push('Missing SameSite');

            if (cookieIssues.length) {
                issues.push({ name: name.trim(), issues: cookieIssues });
            }
        });

        return { total: cookies.length, issues, score: Math.max(0, cookies.length - issues.length) };
    },

    _checkDebugEndpoints() {
        const endpoints = ['/debug', '/console', '/admin', '/phpinfo', '/server-status',
            '/trace', '/actuator', '/swagger', '/api-docs', '/graphql'];
        const found = [];

        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            const content = script.textContent || '';
            endpoints.forEach(ep => {
                if (content.includes(ep)) found.push(ep);
            });
        });

        return { found: [...new Set(found)], count: new Set(found).size };
    },

    _fingerprintPage() {
        return {
            url: window.location.href,
            title: document.title,
            doctype: document.doctype ? document.doctype.name : 'none',
            scripts: document.querySelectorAll('script').length,
            stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
            forms: document.querySelectorAll('form').length,
            iframes: document.querySelectorAll('iframe').length,
            inputs: document.querySelectorAll('input, textarea, select').length,
            metaTags: document.querySelectorAll('meta').length,
            hasServiceWorker: 'serviceWorker' in navigator,
            hasWebGL: !!document.createElement('canvas').getContext('webgl'),
            frameworks: this._detectFrameworks()
        };
    },

    _detectFrameworks() {
        const detected = [];
        if (window.React || document.querySelector('[data-reactroot]')) detected.push('React');
        if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__ || window.Vue) detected.push('Vue');
        if (window.ng || document.querySelector('[ng-version]')) detected.push('Angular');
        if (window.__NEXT_DATA__) detected.push('Next.js');
        if (window.__NUXT__) detected.push('Nuxt');
        if (window.jQuery || window.$) detected.push('jQuery');
        return detected;
    },

    _analyzeInputFields() {
        const inputs = document.querySelectorAll('input, textarea, select');
        const analysis = { total: inputs.length, sensitive: [], types: {} };

        inputs.forEach(input => {
            const type = input.type || 'text';
            analysis.types[type] = (analysis.types[type] || 0) + 1;

            if (type === 'password' || input.name?.match(/token|key|secret|auth/i)) {
                analysis.sensitive.push({ type, name: input.name, id: input.id });
            }
        });

        return analysis;
    },

    _analyzeForms() {
        const forms = document.querySelectorAll('form');
        const analysis = [];

        forms.forEach((form, i) => {
            const action = form.action || window.location.href;
            const method = (form.method || 'GET').toUpperCase();
            const hasCSRF = form.querySelector('input[name*="csrf"], input[name*="token"]');
            const isHTTP = action.startsWith('http://');

            analysis.push({
                index: i,
                action,
                method,
                hasCSRF: !!hasCSRF,
                isHTTP,
                issues: [
                    !hasCSRF && method === 'POST' ? 'Missing CSRF token' : null,
                    isHTTP ? 'HTTP action URL' : null
                ].filter(Boolean)
            });
        });

        return analysis;
    },

    _checkExternalResources() {
        const resources = [];
        document.querySelectorAll('script[src], link[href]').forEach(el => {
            const src = el.src || el.href;
            try {
                const url = new URL(src, location.origin);
                if (url.origin !== location.origin) {
                    resources.push({ type: el.tagName, url: url.href, origin: url.origin });
                }
            } catch (e) {}
        });
        return { count: resources.length, resources: resources.slice(0, 20) };
    },

    _captureConsoleMessages() {
        const messages = [];
        const origLog = console.log;
        const origWarn = console.warn;
        const origError = console.error;

        console.log = function(...args) {
            messages.push({ type: 'log', args: args.map(a => String(a).substring(0, 200)), time: Date.now() });
            origLog.apply(console, args);
        };
        console.warn = function(...args) {
            messages.push({ type: 'warn', args: args.map(a => String(a).substring(0, 200)), time: Date.now() });
            origWarn.apply(console, args);
        };
        console.error = function(...args) {
            messages.push({ type: 'error', args: args.map(a => String(a).substring(0, 200)), time: Date.now() });
            origError.apply(console, args);
        };

        setTimeout(() => {
            console.log = origLog;
            console.warn = origWarn;
            console.error = origError;
        }, 5000);

        return { message: 'Capturing console messages for 5 seconds...' };
    },

    _scanScriptsForSecrets() { return this._scanForSecrets(); },

    _scanStorageForSecrets(type) {
        const storage = type === 'session' ? sessionStorage : localStorage;
        const secrets = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            const value = storage.getItem(key) || '';
            if (/token|secret|password|key|auth/i.test(key) || /token|secret|password/i.test(value)) {
                secrets.push({ storage: type, key, valueLength: value.length });
            }
        }
        return secrets;
    },

    _scanCookiesForSecrets() {
        return this._analyzeCookies().issues;
    },

    _scanURLForSecrets() {
        const params = new URLSearchParams(location.search);
        const secrets = [];
        for (const [key, value] of params) {
            if (/token|key|secret|password|auth/i.test(key)) {
                secrets.push({ param: key, valueLength: value.length });
            }
        }
        return secrets;
    },

    _scanMetaForSecrets() {
        const secrets = [];
        document.querySelectorAll('meta').forEach(meta => {
            const content = meta.getAttribute('content') || '';
            if (/token|key|secret|password/i.test(content)) {
                secrets.push({ name: meta.getAttribute('name'), content: content.substring(0, 100) });
            }
        });
        return secrets;
    },

    _scanCommentsForSecrets() {
        const secrets = [];
        const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_COMMENT);
        let comment;
        while (comment = walker.nextNode()) {
            const text = comment.textContent;
            if (/token|key|secret|password|todo|fixme|hack/i.test(text)) {
                secrets.push({ comment: text.substring(0, 100) });
            }
        }
        return secrets;
    },

    _compileSecretFindings() {
        return { message: 'Secret hunting complete', timestamp: Date.now() };
    },

    _generateReport() {
        return { message: 'Report generated', timestamp: Date.now() };
    },

    _executeCommand(cmd) {
        try {
            return eval(cmd);
        } catch (e) {
            return { error: e.message };
        }
    },

    // ═══════════════════════════════════════════════════════
    // STATUS
    // ═══════════════════════════════════════════════════════

    getStatus() {
        return {
            status: this._status,
            activeWorkflows: this._activeWorkflows.size,
            totalResults: this._results.length
        };
    },

    getWorkflows() {
        return Array.from(this._activeWorkflows.entries()).map(([name, wf]) => ({
            name,
            status: wf.status,
            duration: wf.duration || 0,
            steps: wf.results.length
        }));
    }
};

if (typeof window !== 'undefined') window.DCTAgent = DCTAgent;
if (typeof module !== 'undefined') module.exports = DCTAgent;
