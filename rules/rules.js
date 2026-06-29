/**
 * DevConsole Toolkit — Security Rules Engine
 * Define, load, save, and execute custom security detection rules.
 * Paste into browser console to use.
 */

const DCTRules = {
    _rules: new Map(),
    _stats: new Map(),
    _storageKey: 'dct-security-rules',

    // ═══════════════════════════════════════════════════════
    // RULE MANAGEMENT
    // ═══════════════════════════════════════════════════════

    add(name, config) {
        if (!name || !config.pattern) {
            console.error('Rule requires name and pattern');
            return false;
        }

        this._rules.set(name, {
            name,
            pattern: config.pattern,
            type: config.type || 'string', // 'string', 'regex', 'function'
            category: config.category || 'custom',
            severity: config.severity || 'medium',
            description: config.description || '',
            enabled: config.enabled !== false,
            tags: config.tags || [],
            created: Date.now()
        });

        this._stats.set(name, { matches: 0, lastMatch: null, firstMatch: null });
        return true;
    },

    remove(name) {
        this._rules.delete(name);
        this._stats.delete(name);
        return true;
    },

    enable(name) {
        const rule = this._rules.get(name);
        if (rule) { rule.enabled = true; return true; }
        return false;
    },

    disable(name) {
        const rule = this._rules.get(name);
        if (rule) { rule.enabled = false; return true; }
        return false;
    },

    toggle(name) {
        const rule = this._rules.get(name);
        if (rule) { rule.enabled = !rule.enabled; return rule.enabled; }
        return null;
    },

    get(name) {
        return this._rules.get(name) || null;
    },

    getAll() {
        return Array.from(this._rules.values());
    },

    getEnabled() {
        return Array.from(this._rules.values()).filter(r => r.enabled);
    },

    // ═══════════════════════════════════════════════════════
    // RULE EXECUTION
    // ═══════════════════════════════════════════════════════

    execute(content, source = 'unknown') {
        const matches = [];

        for (const [name, rule] of this._rules) {
            if (!rule.enabled) continue;

            try {
                let found = false;

                if (rule.type === 'regex') {
                    const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern, 'gi');
                    if (regex.test(content)) found = true;
                } else if (rule.type === 'function') {
                    if (rule.pattern(content, source)) found = true;
                } else {
                    if (content.includes(rule.pattern)) found = true;
                }

                if (found) {
                    const stats = this._stats.get(name);
                    stats.matches++;
                    stats.lastMatch = Date.now();
                    if (!stats.firstMatch) stats.firstMatch = Date.now();

                    matches.push({
                        rule: name,
                        category: rule.category,
                        severity: rule.severity,
                        description: rule.description,
                        source,
                        timestamp: Date.now()
                    });
                }
            } catch (e) {
                console.warn(`Rule "${name}" error:`, e.message);
            }
        }

        return matches;
    },

    executeOnDOM() {
        const allMatches = [];

        // Check all script content
        document.querySelectorAll('script').forEach((script, i) => {
            const content = script.textContent || '';
            if (content.length > 0) {
                allMatches.push(...this.execute(content, `Script #${i}`));
            }
        });

        // Check page HTML
        allMatches.push(...this.execute(document.documentElement.outerHTML, 'document'));

        // Check URL parameters
        allMatches.push(...this.execute(window.location.href, 'URL'));

        return allMatches;
    },

    // ═══════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════

    getStats() {
        const stats = {};
        for (const [name, stat] of this._stats) {
            const rule = this._rules.get(name);
            stats[name] = {
                ...stat,
                category: rule?.category,
                severity: rule?.severity,
                enabled: rule?.enabled
            };
        }
        return stats;
    },

    getStatsSummary() {
        const stats = this.getStats();
        const total = Object.keys(stats).length;
        const enabled = Object.values(stats).filter(s => s.enabled).length;
        const totalMatches = Object.values(stats).reduce((a, s) => a + s.matches, 0);
        return { total, enabled, disabled: total - enabled, totalMatches };
    },

    // ═══════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════

    save() {
        const data = {};
        for (const [name, rule] of this._rules) {
            data[name] = {
                ...rule,
                pattern: rule.pattern instanceof RegExp ? rule.pattern.source : rule.pattern
            };
        }
        localStorage.setItem(this._storageKey, JSON.stringify(data));
        return Object.keys(data).length;
    },

    load() {
        try {
            const data = JSON.parse(localStorage.getItem(this._storageKey) || '{}');
            let loaded = 0;
            Object.entries(data).forEach(([name, rule]) => {
                this._rules.set(name, {
                    ...rule,
                    pattern: rule.pattern
                });
                if (!this._stats.has(name)) {
                    this._stats.set(name, { matches: 0, lastMatch: null, firstMatch: null });
                }
                loaded++;
            });
            return loaded;
        } catch (e) {
            return 0;
        }
    },

    export() {
        const data = {};
        for (const [name, rule] of this._rules) {
            data[name] = {
                ...rule,
                pattern: rule.pattern instanceof RegExp ? rule.pattern.source : rule.pattern
            };
        }
        return data;
    },

    import(data) {
        let imported = 0;
        Object.entries(data).forEach(([name, rule]) => {
            this.add(name, rule);
            imported++;
        });
        return imported;
    },

    clear() {
        this._rules.clear();
        this._stats.clear();
    },

    // ═══════════════════════════════════════════════════════
    // BUILT-IN RULES
    // ═══════════════════════════════════════════════════════

    loadDefaults() {
        this.add('hardcoded-api-key', {
            pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/gi,
            type: 'regex',
            category: 'secrets',
            severity: 'critical',
            description: 'Hardcoded API key detected'
        });

        this.add('hardcoded-secret', {
            pattern: /(?:secret|password|passwd)\s*[:=]\s*["'][^"']{8,}["']/gi,
            type: 'regex',
            category: 'secrets',
            severity: 'critical',
            description: 'Hardcoded secret/password detected'
        });

        this.add('jwt-token', {
            pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
            type: 'regex',
            category: 'secrets',
            severity: 'high',
            description: 'JWT token found'
        });

        this.add('aws-key', {
            pattern: /AKIA[0-9A-Z]{16}/,
            type: 'regex',
            category: 'secrets',
            severity: 'critical',
            description: 'AWS Access Key detected'
        });

        this.add('github-pat', {
            pattern: /ghp_[A-Za-z0-9]{36}/,
            type: 'regex',
            category: 'secrets',
            severity: 'critical',
            description: 'GitHub Personal Access Token detected'
        });

        this.add('eval-usage', {
            pattern: /\beval\s*\(/,
            type: 'regex',
            category: 'xss',
            severity: 'high',
            description: 'eval() usage detected'
        });

        this.add('onclick-handler', {
            pattern: /\bonclick\s*=/i,
            type: 'regex',
            category: 'xss',
            severity: 'medium',
            description: 'Inline onclick handler'
        });

        this.add('debug-endpoint', {
            pattern: /\/(?:debug|console|admin|phpinfo|server-status|trace)/i,
            type: 'regex',
            category: 'info-disclosure',
            severity: 'high',
            description: 'Debug/admin endpoint exposed'
        });

        this.add('internal-ip', {
            pattern: /(?:10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)\d+\.\d+/,
            type: 'regex',
            category: 'info-disclosure',
            severity: 'medium',
            description: 'Internal IP address exposed'
        });

        this.add('stack-trace', {
            pattern: /at\s+\S+\s*\([^)]*:\d+:\d+\)/,
            type: 'regex',
            category: 'info-disclosure',
            severity: 'low',
            description: 'Stack trace detected'
        });

        return this._rules.size;
    }
};

// Expose globally
if (typeof window !== 'undefined') window.DCTRules = DCTRules;
if (typeof module !== 'undefined') module.exports = DCTRules;
