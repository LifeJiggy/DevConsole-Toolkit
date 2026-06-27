# Full-Global-JS-HUNTER Usage Guide

## Quick Start

### Interactive Scan (Recommended)

```js
window.JSHunter.JSFILE.interactive()
```

Collects all JS files on the page, displays them, then lets you choose scan options.

### Direct Scan

```js
window.JSHunter.JSFILE.runScan(1)   // Instant scan (inline scripts only, fastest)
window.JSHunter.JSFILE.runScan(2)   // Fast scan (15s timeout, balanced)
window.JSHunter.JSFILE.runScan(3)   // Full scan (all scripts, thorough)
```

### Multiple Scans at Once

```js
window.JSHunter.JSFILE.runScan("1,2,3")   // Run all three scan types
window.JSHunter.JSFILE.runScan("1,3")      // Instant + Full
```

---

## Scan Types

| Option | Name | Speed | Coverage |
|--------|------|-------|----------|
| `1` | Instant | <100ms | Inline scripts only |
| `2` | Fast | ~10-15s | Inline + same-origin fetched |
| `3` | Full | ~30s+ | All accessible scripts |
| `4` | Custom | Varies | Single vulnerability type |

---

## All Access Methods

```js
// JSFILE access (user choice based)
window.JSHunter.JSFILE.runScan("1,2,3")
window.JSHunter.JSFILE.runScan(1)
window.JSHunter.JSFILE.interactive()

// JS access (alternative)
window.JSHunter.JS.runScan("1,2,3")
window.JSHunter.JS.runScan(1)

// Direct methods
window.JSHunter.instantScan()
window.JSHunter.fastHunt(timeoutMs)
window.JSHunter.hunt()
window.JSHunter.runScan(option)
```

---

## Result Variables

```js
window.INSTANT_REPORT        // Instant scan results (auto-run on load)
window.HUNT_REPORT           // Fast scan results (auto-run after 500ms)
window.JS_MULTI_RESULTS      // Results from JS.runScan()
window.JSFILE_MULTI_RESULTS  // Results from JSFILE.runScan()
```

---

## Advanced Usage

### Search Specific Vulnerability Type

```js
window.JSHunter.searchVulnerability("DOM-Based XSS")
window.JSHunter.searchVulnerability("React Security Issues")
window.JSHunter.searchVulnerability("SQL Injection")
window.JSHunter.searchVulnerability("Sensitive Data Exposure")
```

### Get Source Code Context

```js
window.JSHunter.getSourceCode("filename.js", 42)       // 3 lines context
window.JSHunter.getSourceCode("filename.js", 42, 10)   // 10 lines context
```

### Export Results

```js
// JSON format
const json = window.JSHunter.exportResults('json')

// Object format
const data = window.JSHunter.exportResults('object')
```

### Filter by Severity

```js
const criticals = window.JSHunter.filterBySeverity('CRITICAL')
const highs = window.JSHunter.filterBySeverity('HIGH')
```

### Get Fix Suggestions

```js
window.JSHunter.getFixSuggestions('DOM-Based XSS')
window.JSHunter.getFixSuggestions('SQL Injection')
```

### Performance Metrics

```js
window.JSHunter.getPerformanceMetrics()
// { scanTime: 142.5, patternsMatched: 23 }
```

### Vulnerability Trends

```js
window.JSHunter.getVulnerabilityTrends()
// { bySeverity: {...}, byType: {...}, byFile: {...} }
```

### Context-Aware Scan

```js
window.JSHunter.getContextAwareScan()
// { clientSide: true, serverSide: false, frameworkSpecific: true }
```

---

## Constructor Options

```js
const hunter = new CompleteJSVulnHunter({
    quiet: false,                    // Suppress console output
    enableAST: true,                 // Enable AST analysis
    enableTaint: true,               // Enable taint tracking
    confidenceThreshold: 0.3,        // Min confidence score (0-1)
    maxFetchTimeout: 2000,           // Fetch timeout in ms
    maxScriptSize: 5000000,          // Max script size in bytes
    enableScriptInjection: false     // Allow script injection (DANGEROUS)
})

window.JSHunter.updateConfig({ quiet: true })
```

---

## Supported Vulnerability Classes (28 total)

### Critical
- DOM-Based XSS
- Code Execution
- IDOR
- Command Injection
- SQL Injection
- Broken Access Control
- Sensitive Data Exposure
- React Security Issues
- Next.js Security Issues
- Vue.js Security Issues
- Angular Security Issues
- Web3 Security Issues

### High
- Prototype Pollution
- Event Handler Injection
- SSRF
- Path Traversal
- Deserialization
- Client-Side Injection
- Framework Deserialization Issues
- Modern Framework Injection
- Serverless Security Issues
- Container Security Issues
- Supply Chain Security Issues

### Medium
- Insecure Storage
- CORS Misconfiguration
- Clickjacking
- JWT Manipulation
- Node.js Security Issues
- WebAssembly Security Issues
- Service Worker Security Issues
- PWA Security Issues
- Observability Security Issues

### Low
- Insecure Random
- AI/ML Security Issues
- Quantum Computing Security Issues

---

## Auto-Run on Load

When the script loads, it automatically:

1. **Instant scan** runs immediately -> stored in `window.INSTANT_REPORT`
2. **Fast scan** starts after 500ms -> stored in `window.HUNT_REPORT`
3. Menu displayed for 1 second then silenced

All console output is suppressed during automatic scans.
