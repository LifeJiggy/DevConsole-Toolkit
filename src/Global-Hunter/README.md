# Full-Global-JS-HUNTER

Hardened browser-based JavaScript vulnerability scanner. Paste into DevTools console, auto-collects all JS on the page, and reports vulnerabilities with exact file:line locations.

**Version:** 3.0 (Hardened Edition)  
**Status:** Educational / Authorized security testing only

---

## What It Scans

28 vulnerability classes across client-side, server-side, and framework-specific attack surfaces:

| Category | Vuln Types |
|----------|-----------|
| **Critical** | DOM XSS, Code Execution, IDOR, Command Injection, SQL Injection, Broken Access Control, Sensitive Data Exposure, React/Next.js/Vue/Angular/Web3 issues |
| **High** | Prototype Pollution, SSRF, Path Traversal, Deserialization, Event Handler Injection, Serverless/Container/Supply Chain issues |
| **Medium** | Insecure Storage, CORS, Clickjacking, JWT Manipulation, Node.js issues, WebAssembly, Service Worker, PWA issues |
| **Low** | Insecure Random, AI/ML issues, Quantum Computing issues |

---

## Quick Start

Paste into browser DevTools console. Auto-scans run silently on load.

```js
// Interactive mode (recommended)
window.JSHunter.JSFILE.interactive()

// Direct scan
window.JSHunter.JSFILE.runScan(1)   // Instant (~100ms)
window.JSHunter.JSFILE.runScan(2)   // Fast (~15s)
window.JSHunter.JSFILE.runScan(3)   // Full (~30s+)
```

---

## Scan Modes

| Option | Name | Speed | Coverage |
|--------|------|-------|----------|
| `1` | Instant | <100ms | Inline scripts only |
| `2` | Fast | ~10-15s | Inline + same-origin fetched |
| `3` | Full | ~30s+ | All accessible scripts |
| `4` | Custom | Varies | Single vulnerability type |

### Multiple scans

```js
window.JSHunter.JSFILE.runScan("1,2,3")
```

### Full audit (all 20 new features + pattern scan)

```js
await window.JSHunter.JSFILE.fullAudit()
```

### Individual features

```js
window.JSHunter.JSFILE.csp()          // CSP analysis
window.JSHunter.JSFILE.cookies()      // Cookie audit
window.JSHunter.JSFILE.storage()      // Storage scan
window.JSHunter.JSFILE.dom()          // DOM security audit
window.JSHunter.JSFILE.redirects()    // Open redirect detection
window.JSHunter.JSFILE.forms()        // Form hijacking check
window.JSHunter.JSFILE.iframes()      // iframe security
window.JSHunter.JSFILE.jsURLs()       // javascript: URI audit
window.JSHunter.JSFILE.sri()          // SRI check
window.JSHunter.JSFILE.thirdParty()   // Third-party risk score
window.JSHunter.JSFILE.urls()         // URL extractor
window.JSHunter.JSFILE.graph()        // Dependency graph
window.JSHunter.JSFILE.mixed()        // Mixed content detection
window.JSHunter.JSFILE.clobbering()   // DOM clobbering
window.JSHunter.JSFILE.ws()           // WebSocket analysis
window.JSHunter.JSFILE.permissions()  // Permission monitor
window.JSHunter.JSFILE.diff()         // Scan comparison
window.JSHunter.JSFILE.exploits()     // Auto-exploit suggestions
window.JSHunter.JSFILE.monitor(cb)    // DOM mutation monitor
window.JSHunter.JSFILE.report()       // Download HTML report
```

---

## 20 New Security Features

| # | Feature | Method | What It Does |
|---|---------|--------|-------------|
| 1 | DOM Security Audit | `dom()` | Scans DOM elements for XSS sinks (onerror, onload, formaction, etc.) |
| 2 | CSP Header Analysis | `csp()` | Checks Content-Security-Policy for unsafe-inline, unsafe-eval, wildcards |
| 3 | Cookie Security Audit | `cookies()` | Flags sensitive data, JWTs, base64 in cookies |
| 4 | Storage Sensitive Data Scan | `storage()` | Audits localStorage/sessionStorage for tokens, passwords, PII |
| 5 | Open Redirect Detection | `redirects()` | Scans all links for redirect parameters (url, next, redirect, etc.) |
| 6 | Mixed Content Detection | `mixed()` | Finds HTTP resources loaded on HTTPS pages via Performance API + DOM |
| 7 | SRI Check | `sri()` | Verifies all external scripts/stylesheets have integrity attributes |
| 8 | WebSocket Security | `ws()` | Hooks WebSocket constructor, flags ws:// and cross-origin connections |
| 9 | Third-Party Risk Scorer | `thirdParty()` | Scores external scripts by origin reputation and risk level |
| 10 | DOM Clobbering Detection | `clobbering()` | Finds elements with id/name that shadow window/document globals |
| 11 | Form Security Audit | `forms()` | Checks forms for HTTP actions, missing CSRF tokens, sensitive fields |
| 12 | iframe Security Check | `iframes()` | Flags missing sandbox, dangerous permissions, mixed content iframes |
| 13 | JavaScript URL Audit | `jsURLs()` | Finds javascript: URIs in href, src, formaction, event handlers |
| 14 | URL/Endpoint Extractor | `urls()` | Extracts all URLs from scripts, categorizes as API/admin/debug/cloud |
| 15 | Permission Monitor | `permissions()` | Hooks navigator.permissions, geolocation, clipboard, notifications |
| 16 | HTML Report Generator | `report()` | Full styled HTML report with severity breakdown, downloadable as .html |
| 17 | Scan Comparison (Diff) | `diff()` | Compares current vs previous scan, highlights new/fixed findings |
| 18 | Auto-Exploit Suggestions | `exploits()` | Generates PoC payloads for critical findings (XSS, redirect chains, etc.) |
| 19 | Dependency Graph | `graph()` | Maps which scripts load which other scripts, tracks dynamic imports |
| 20 | DOM Mutation Monitor | `monitor(cb)` | MutationObserver watches for dynamically injected scripts/elements in real-time |

## Architecture

```
CompleteJSVulnHunter
├── Script Collection
│   ├── Inline scripts (direct DOM)
│   ├── Same-origin fetch (CORS-safe)
│   └── External blocked (logged, not fetched)
├── Pattern Matching
│   ├── 28 vulnerability classes
│   ├── Pre-compiled regex cache
│   └── Comment/string-aware validation
├── AST Analysis (optional)
│   ├── Lightweight parser
│   └── Vulnerable pattern detection
├── Taint Tracking (optional)
│   ├── Source identification
│   ├── Sink tracking
│   └── Sanitizer detection
└── Confidence Scoring
    ├── Pattern specificity
    ├── Context analysis
    └── Exploitability assessment
```

---

## Constructor Options

```js
const hunter = new CompleteJSVulnHunter({
    quiet: false,                    // Suppress console output
    enableAST: true,                 // Enable AST analysis (default: true)
    enableTaint: true,               // Enable taint tracking (default: true)
    confidenceThreshold: 0.3,        // Min confidence score 0-1 (default: 0.3)
    maxFetchTimeout: 2000,           // Fetch timeout in ms (default: 2000)
    maxScriptSize: 5000000,          // Max script size bytes (default: 5MB)
    enableScriptInjection: false     // Allow script injection (default: false)
})
```

---

## API Reference

### Core Methods

```js
// Scan methods
window.JSHunter.instantScan()              // Inline only, sync
window.JSHunter.fastHunt(timeoutMs)        // Async with timeout
window.JSHunter.hunt()                     // Full async scan
window.JSHunter.interactiveHunt()          // Collect + display + wait

// Result access
window.JSHunter.searchVulnerability(type)  // Filter by vuln type
window.JSHunter.getSourceCode(source, line, context)
window.JSHunter.filterBySeverity(severity) // CRITICAL/HIGH/MEDIUM/LOW
window.JSHunter.exportResults('json')      // Export as JSON

// Analysis
window.JSHunter.getPerformanceMetrics()
window.JSHunter.getVulnerabilityTrends()
window.JSHunter.getContextAwareScan()
window.JSHunter.detectSanitizers(code)
window.JSHunter.analyzeComplexity(content)

// Fix suggestions
window.JSHunter.getFixSuggestions(vulnType)

// Configuration
window.JSHunter.updateConfig({ quiet: true })
window.JSHunter.startMonitoring()          // Rescan every 30s
window.JSHunter.stopMonitoring()
```

### Result Variables (auto-populated)

```js
window.INSTANT_REPORT         // Instant scan results
window.HUNT_REPORT            // Fast scan results
window.JS_MULTI_RESULTS       // JS.runScan() results
window.JSFILE_MULTI_RESULTS   // JSFILE.runScan() results
```

---

## Hardening Applied (v3.0)

| Fix | Issue |
|-----|-------|
| Whitelist-only `updateConfig` | Prototype pollution via `Object.assign` |
| Gated script injection | Auto-execution of untrusted scripts |
| URL validation + SSRF blocklist | Internal IP fetching, non-HTTP URLs |
| `crypto.getRandomValues` | Predictable JSONP callback names |
| Script size limits | Memory exhaustion from huge scripts |
| Cached regex patterns | `new RegExp()` on every line in hot path |
| Map-based dedup | O(n) `findIndex` per match |
| Configurable timeouts | Hardcoded 2000ms/3000ms values |
| Aborted fetch timeouts | `Math.max()` on empty arrays |

---

## Files

```
src/Global-Hunter/
├── Full-Global-JS-HUNTER.js   # Main scanner (paste into DevTools)
├── Full-Global-usage.md        # Usage guide
└── README.md                   # This file
```

---

## Disclaimer

For educational and authorized security testing only. Unauthorized use against systems you don't own or have permission to test is illegal. Use responsibly.
