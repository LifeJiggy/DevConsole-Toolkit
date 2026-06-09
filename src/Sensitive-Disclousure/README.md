# Sensitive-Disclousure Tools

Two browser console tools for discovering secrets, credentials, API keys, and sensitive information disclosed in JavaScript/DOM.

## Tools

| Tool | Lines | Purpose |
|------|-------|---------|
| **Hidden-Gold.js** | ~4076 | JS Disclosure & Secret Extractor — deep extraction of API keys, credentials, endpoints, configs, and event listeners from DOM/scripts |
| **Gold-Digger.js** | ~1673 | P1 Disclosure Extractor — entropy-based secret detection, obfuscation analysis, JWT decoding, code risk scanning |

## Quick Start

1. Open DevTools (F12) on any target website
2. Go to **Console** tab
3. Paste the entire tool file and press Enter
4. Run the displayed commands

```js
// Hidden-Gold.js
runAllExtractors();          // Full extraction
extractAPIKeys();            // Just API keys
extractP1Secrets();          // P1-focused critical findings
analyzeEntropy();            // Token entropy scoring
scoreSecrets();              // Risk scoring
generateRemediation();       // Fix recommendations
exportCSV();                 // Copy findings as CSV

// Gold-Digger.js
// Auto-runs on paste — results in findings object
GOLD.scoreFindings();        // Risk scoring
GOLD.crossReference();       // Cross-ref secrets with endpoints
GOLD.analyzeJWTs();          // JWT deep analysis
GOLD.fingerprintTech();      // Technology detection
GOLD.complianceReport();     // OWASP mapping
GOLD.riskDashboard();        // Summary dashboard
GOLD.diffScan();             // Compare with previous run
GOLD.remediationReport();    // Fix recommendations
GOLD_CLEANUP();              // Restore prototypes
```

## Hidden-Gold.js Features

### Core Extraction
- **extractAPIKeys()** — AWS, JWT, GitHub, Stripe, Google, Firebase keys
- **extractHiddenEndpoints()** — Admin, internal, debug, API endpoints
- **extractCredentials()** — DB connection strings, SMTP, SSH keys
- **extractConfigurations()** — Debug mode, environment configs, feature flags
- **mapEventListeners()** — DOM event handlers (dangerous onclick/onsubmit)
- **extractAdvancedFlags()** — Chrome flags, debug parameters
- **extractP1Secrets()** — P1-focused critical credential scan
- **extractSensitiveEndpoints()** — Payment, auth, admin endpoints

### Enhancements (10)
1. **scoreSecrets()** — Risk scoring with entropy analysis
2. **analyzeSourceMaps()** — Detect source maps in scripts
3. **analyzeCSP()** — Analyze Content Security Policy weaknesses
4. **detectDangerousSinks()** — Find DOM XSS sinks (innerHTML, eval, etc.)
5. **analyzeEntropy()** — Score tokens by Shannon entropy
6. **mapExposureVectors()** — Correlate secrets with exposure paths
7. **mapCompliance()** — Map findings to OWASP Top 10
8. **diffScan()** — Compare current vs previous scan
9. **generateRemediation()** — Auto-generate fix recommendations
10. **exportCSV()** — Export all findings as CSV to clipboard

### Hardening
- `_safeTable()` — console.table wrapper with row limits (max 200)
- Element limits: scripts capped at 200, DOM queries at 5000
- Inner try/catch on all forEach loops (13 loops protected)
- Graceful error handling on all extraction functions

## Gold-Digger.js Features

### Core Scanning
- **scanForEntropySecrets()** — Shannon entropy-based secret detection
- **scanForObfuscation()** — Base64, hex, char code, eval patterns
- **scanForExtraSecrets()** — 50+ pattern categories (API keys, tokens, passwords)
- **scanForCodeRisks()** — DOM XSS sinks, dangerous functions
- **scanForSecrets()** — AWS, JWT, GitHub, Stripe, database URLs
- **scanForEndpoints()** — REST API paths, admin routes, GraphQL
- **scanForDebugInfo()** — Debug flags, verbose errors, stack traces
- **scanForConfigObjects()** — Configuration objects, env vars

### Enhancements (10)
1. **scoreFindings()** — Risk scoring across all categories
2. **crossReference()** — Cross-reference secrets with endpoints
3. **rankByEntropy()** — Rank all tokens by entropy
4. **extractDomains()** — Extract domains and IPs from findings
5. **fingerprintTech()** — Detect tech stack (AWS, Firebase, MongoDB, etc.)
6. **analyzeJWTs()** — Deep JWT analysis (alg, issuer, expiry, risk)
7. **complianceReport()** — OWASP compliance mapping
8. **riskDashboard()** — Summary risk score dashboard
9. **diffScan()** — Compare with previous scan baseline
10. **remediationReport()** — Auto-generate prioritized fix actions

### Hardening
- `_safeTable()` — console.table wrapper with row limits (max 200)
- `GOLD_CLEANUP()` — Restore fetch/XHR/addEventListener prototypes
- Element limits: scripts capped at 200, DOM queries at 10000
- Inner try/catch on all DOM forEach loops
- Circular reference handling in JSON.stringify
- `window.open` uses noopener,noreferrer
- `__GOLD_PATCHED` guard prevents re-patching

## Output Structure

### Hidden-Gold.js
```js
window.jsDisclosureHunter = {
  apiKeys: [...],           // {keyType, value, risk, source, location, entropy}
  credentials: [...],       // {name, value, risk, source}
  endpoints: [...],         // {name, url, type, risk, source}
  configurations: {...},    // {debug, environment, features, ...}
  listeners: [...],         // {eventType, selector, handler, element}
  advancedFlags: [...],     // {flag, value, source}
  mapping: {...},           // Source-to-finding mapping
  networkLogs: [...]        // Intercepted network requests
}
```

### Gold-Digger.js
```js
findings = {
  secrets: [...],           // {name, match, confidence, source, line}
  endpoints: [...],         // {name, match, type, source}
  internalPaths: [...],     // {match, source}
  authFindings: [...],      // {match, source}
  configObjects: [...],     // {match, source}
  debugInfo: [...],         // {match, source}
  userFlows: [...],         // {type, tag, id, label, action}
  hiddenElements: Set,      // Hidden DOM elements
  riskySinks: [...]         // Dangerous DOM sinks
}
```

## Safety Features

- All prototypes restored via `GOLD_CLEANUP()` (Gold-Digger)
- Element limits prevent performance issues on large DOMs
- Inner try/catch prevents single-element errors from crashing scans
- `_safeTable()` prevents console.table overload
- Re-patching guards prevent wrapper stacking

## Commit History

| Commit | Changes |
|--------|---------|
| `300a044` | P1/P2 bug fixes (19 fixes across both files) |
| `6f421e2` | Hardening + 20 security enhancements |
