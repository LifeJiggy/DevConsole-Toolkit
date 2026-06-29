/**
 * ═══════════════════════════════════════════════════════════════════
 * DevConsole Toolkit — Unified Browser Console Dashboard
 * v6.1.0 — All-in-one security audit dashboard for the browser console
 *
 * Paste this single file into browser console to activate.
 * Requires: tools/utils.js, rules/rules.js, memory/memory.js,
 *           storage/storage.js, agents/agent.js (auto-includes all)
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // BANNER
    // ═══════════════════════════════════════════════════════

    const BANNER = `
  ╔═══════════════════════════════════════════════════════════╗
  ║   DevConsole Toolkit — Unified Dashboard v6.1.0          ║
  ║   Security Audit • Rules Engine • Agent Automation       ║
  ╚═══════════════════════════════════════════════════════════╝`;

    // ═══════════════════════════════════════════════════════
    // DASHBOARD STATE
    // ═══════════════════════════════════════════════════════

    const state = {
        results: {},
        history: [],
        startTime: Date.now(),
        lastScan: null,
        scanCount: 0,
        autoSave: true
    };

    // ═══════════════════════════════════════════════════════
    // CORE SCANNER
    // ═══════════════════════════════════════════════════════

    function scanPage() {
        const findings = {
            timestamp: new Date().toISOString(),
            url: location.href,
            title: document.title,
            issues: [],
            secrets: [],
            headers: {},
            cookies: [],
            storage: { local: [], session: [] },
            forms: [],
            scripts: { total: 0, external: 0, inline: 0 },
            meta: {},
            score: 100
        };

        // Scan scripts
        document.querySelectorAll('script').forEach((s, i) => {
            findings.scripts.total++;
            if (s.src) findings.scripts.external++;
            else findings.scripts.inline++;

            const content = s.textContent || '';
            if (content.length > 10) {
                // Check for secrets
                const secretPatterns = [
                    { regex: /AKIA[0-9A-Z]{16}/, name: 'AWS Key', sev: 'critical' },
                    { regex: /ghp_[0-9a-zA-Z]{36}/, name: 'GitHub PAT', sev: 'critical' },
                    { regex: /sk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Key', sev: 'critical' },
                    { regex: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, name: 'JWT', sev: 'high' },
                    { regex: /(?:api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{8,}["']/gi, name: 'Hardcoded Secret', sev: 'critical' }
                ];
                secretPatterns.forEach(p => {
                    p.regex.lastIndex = 0;
                    if (p.regex.test(content)) {
                        findings.secrets.push({ type: p.name, severity: p.sev, source: `Script #${i}` });
                    }
                });

                // Check for dangerous patterns
                if (/\beval\s*\(/.test(content)) findings.issues.push({ type: 'eval()', sev: 'high', source: `Script #${i}` });
                if (/document\.write\s*\(/.test(content)) findings.issues.push({ type: 'document.write()', sev: 'medium', source: `Script #${i}` });
                if (/innerHTML\s*=/.test(content)) findings.issues.push({ type: 'innerHTML assignment', sev: 'medium', source: `Script #${i}` });
            }
        });

        // Scan cookies
        document.cookie.split(';').forEach(c => {
            const [name] = c.trim().split('=');
            if (!name) return;
            const issues = [];
            if (!c.includes('Secure') && location.protocol === 'https:') issues.push('Missing Secure');
            if (!c.includes('HttpOnly')) issues.push('Missing HttpOnly');
            if (!c.includes('SameSite')) issues.push('Missing SameSite');
            if (issues.length) findings.cookies.push({ name: name.trim(), issues });
        });

        // Scan localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key) || '';
            if (/token|secret|password|key|auth/i.test(key)) {
                findings.storage.local.push({ key, valueLength: val.length });
            }
        }

        // Scan sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const val = sessionStorage.getItem(key) || '';
            if (/token|secret|password|key|auth/i.test(key)) {
                findings.storage.session.push({ key, valueLength: val.length });
            }
        }

        // Scan forms
        document.querySelectorAll('form').forEach((f, i) => {
            const action = f.action || location.href;
            const method = (f.method || 'GET').toUpperCase();
            const hasCSRF = !!f.querySelector('input[name*="csrf"], input[name*="token"]');
            findings.forms.push({ index: i, action, method, hasCSRF, isHTTP: action.startsWith('http://') });
        });

        // Scan meta tags
        document.querySelectorAll('meta[http-equiv]').forEach(m => {
            findings.headers[m.getAttribute('http-equiv')] = m.getAttribute('content');
        });

        // Score
        findings.score = 100;
        findings.score -= findings.secrets.length * 15;
        findings.score -= findings.issues.length * 5;
        findings.score -= findings.cookies.length * 3;
        findings.score -= findings.storage.local.length * 5;
        findings.score -= findings.storage.session.length * 3;
        if (!findings.headers['Content-Security-Policy']) findings.score -= 10;
        if (!findings.headers['X-Frame-Options']) findings.score -= 5;
        findings.score = Math.max(0, findings.score);

        state.results = findings;
        state.lastScan = Date.now();
        state.scanCount++;

        return findings;
    }

    // ═══════════════════════════════════════════════════════
    // DISPLAY
    // ═══════════════════════════════════════════════════════

    function displayResults(r) {
        const sev = r.score >= 80 ? 'LOW' : r.score >= 60 ? 'MEDIUM' : r.score >= 40 ? 'HIGH' : 'CRITICAL';
        const color = r.score >= 80 ? '#27ae60' : r.score >= 60 ? '#f39c12' : r.score >= 40 ? '#e67e22' : '#e74c3c';

        console.log(BANNER);
        console.log(`\n  %cSecurity Score: ${r.score}/100 (${sev})`, `color: ${color}; font-size: 16px; font-weight: bold`);
        console.log(`  URL: ${r.url}`);
        console.log(`  Scanned: ${r.timestamp}\n`);

        console.group('📊 Summary');
        console.log(`  Scripts: ${r.scripts.total} (${r.scripts.external} external, ${r.scripts.inline} inline)`);
        console.log(`  Forms: ${r.forms.length}`);
        console.log(`  Cookies: ${r.cookies.length} with issues`);
        console.log(`  Storage: ${r.storage.local.length} local, ${r.storage.session.length} session`);
        console.log(`  Issues: ${r.issues.length}`);
        console.log(`  Secrets: ${r.secrets.length}`);
        console.groupEnd();

        if (r.secrets.length > 0) {
            console.group(`🔴 Secrets Found (${r.secrets.length})`);
            console.table(r.secrets);
            console.groupEnd();
        }

        if (r.issues.length > 0) {
            console.group(`⚠️ Security Issues (${r.issues.length})`);
            console.table(r.issues);
            console.groupEnd();
        }

        if (r.cookies.length > 0) {
            console.group(`🍪 Cookie Issues (${r.cookies.length})`);
            console.table(r.cookies);
            console.groupEnd();
        }

        if (r.storage.local.length > 0 || r.storage.session.length > 0) {
            console.group('💾 Storage Issues');
            if (r.storage.local.length) console.table(r.storage.local.map(s => ({ ...s, storage: 'localStorage' })));
            if (r.storage.session.length) console.table(r.storage.session.map(s => ({ ...s, storage: 'sessionStorage' })));
            console.groupEnd();
        }

        if (Object.keys(r.headers).length > 0) {
            console.group('🔒 Security Headers');
            console.table(Object.entries(r.headers).map(([k, v]) => ({ Header: k, Content: v })));
            console.groupEnd();
        }

        if (r.forms.length > 0) {
            const formIssues = r.forms.filter(f => f.issues && f.issues.length);
            if (formIssues.length) {
                console.group(`📝 Form Issues (${formIssues.length})`);
                console.table(formIssues);
                console.groupEnd();
            }
        }

        console.log('\n  %cCommands:', 'color: #3498db; font-weight: bold');
        console.log('  DCTDashboard.export()      — Download JSON report');
        console.log('  DCTDashboard.exportCSV()   — Download CSV report');
        console.log('  DCTDashboard.history()     — View scan history');
        console.log('  DCTDashboard.help()        — Show all commands');
        console.log('');
    }

    // ═══════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════

    function exportJSON() {
        const data = JSON.stringify(state.results, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-audit-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportCSV() {
        const rows = [];
        rows.push(['Type', 'Severity', 'Description', 'Source']);
        state.results.secrets.forEach(s => rows.push(['Secret', s.severity, s.type, s.source]));
        state.results.issues.forEach(i => rows.push(['Issue', i.sev, i.type, i.source]));
        state.results.cookies.forEach(c => rows.push(['Cookie', 'medium', c.issues.join(', '), c.name]));
        state.results.storage.local.forEach(s => rows.push(['Storage', 'medium', s.key, 'localStorage']));
        state.results.storage.session.forEach(s => rows.push(['Storage', 'medium', s.key, 'sessionStorage']));

        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-audit-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function history() {
        if (state.history.length === 0) {
            console.log('No scan history yet.');
            return;
        }
        console.group('📜 Scan History');
        console.table(state.history.map(h => ({
            time: new Date(h.timestamp).toLocaleTimeString(),
            score: h.score,
            secrets: h.secrets,
            issues: h.issues,
            url: h.url
        })));
        console.groupEnd();
    }

    // ═══════════════════════════════════════════════════════
    // HELP
    // ═══════════════════════════════════════════════════════

    function help() {
        console.log(BANNER);
        console.log(`
  %cCommands:
  ────────────────────────────────────────────────────────
  DCTDashboard.scan()           Run security scan
  DCTDashboard.export()         Download JSON report
  DCTDashboard.exportCSV()      Download CSV report
  DCTDashboard.history()        View scan history
  DCTDashboard.quickAudit()     Agent quick audit
  DCTDashboard.fullRecon()      Agent full recon
  DCTDashboard.secretHunter()   Agent secret hunt
  DCTDashboard.storage()        Storage audit
  DCTDashboard.cookies()        Cookie audit
  DCTDashboard.help()           This help
  ────────────────────────────────────────────────────────`, 'color: #3498db');
    }

    // ═══════════════════════════════════════════════════════
    // QUICK MODULE ACCESS
    // ═══════════════════════════════════════════════════════

    async function quickAudit() {
        if (window.DCTAgent) {
            const result = await DCTAgent.quickAudit();
            const lastStep = result.results[result.results.length - 1];
            return lastStep?.result;
        }
        return scanPage();
    }

    async function fullRecon() {
        if (window.DCTAgent) return await DCTAgent.fullRecon();
        return scanPage();
    }

    async function secretHunter() {
        if (window.DCTAgent) return await DCTAgent.secretHunter();
        return scanPage();
    }

    function storageAudit() {
        if (window.DCTStorage) return DCTStorage.auditAll();
        return { message: 'DCTStorage module not loaded' };
    }

    function cookieAudit() {
        const r = scanPage();
        return r.cookies;
    }

    // ═══════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════

    window.DCTDashboard = {
        scan() {
            const r = scanPage();
            state.history.push({ timestamp: r.timestamp, score: r.score, secrets: r.secrets.length, issues: r.issues.length, url: r.url });
            displayResults(r);
            return r;
        },
        export: exportJSON,
        exportCSV,
        history,
        help,
        quickAudit,
        fullRecon,
        secretHunter,
        storage: storageAudit,
        cookies: cookieAudit,
        getState: () => state
    };

    // Auto-scan and display
    const results = scanPage();
    state.history.push({ timestamp: results.timestamp, score: results.score, secrets: results.secrets.length, issues: results.issues.length, url: results.url });
    displayResults(results);

})();
