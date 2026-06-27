# Error-Handling-Debugger v3.0

Browser-based error handling, debug info extraction, and security vulnerability scanner. Paste into DevTools console to find leaked secrets, debug endpoints, exposed source maps, and security misconfigurations.

**Version:** 3.0 (Hardened Edition)
**Status:** Educational / Authorized security testing only

---

## Quick Start

```js
// View all findings
window.ErrorDebugExtractor.viewFindings()

// View ALL findings (no truncation)
window.ErrorDebugExtractor.viewFindings(true)

// Show only high-priority findings
window.ErrorDebugExtractor.showHighPriority()

// Start periodic scanning
window.ErrorDebugExtractor.startPeriodicScan(30000)

// Stop all monitoring
window.ErrorDebugExtractor.stop()
```

---

## 20 New Features

### Security Analysis
```js
window.ErrorDebugExtractor.analyzeCSP()           // CSP header analysis
window.ErrorDebugExtractor.auditCookies()         // Cookie security audit
window.ErrorDebugExtractor.auditStorage()         // Storage sensitive data scan
window.ErrorDebugExtractor.checkSourceMaps()      // Source map exposure check
window.ErrorDebugExtractor.detectFrameworks()     // Framework detection
window.ErrorDebugExtractor.analyzeThirdParty()    // Third-party script analysis
window.ErrorDebugExtractor.checkDebugEndpoints()  // Exposed debug endpoints
window.ErrorDebugExtractor.scanHardcodedSecrets() // Hardcoded secrets scan
window.ErrorDebugExtractor.checkFormActions()     // Insecure form actions
window.ErrorDebugExtractor.checkMixedContent()    // Mixed content detection
window.ErrorDebugExtractor.detectServiceWorkers() // Service worker detection
window.ErrorDebugExtractor.auditPostMessage()     // postMessage security audit
window.ErrorDebugExtractor.checkOpenRedirects()   // Open redirect detection
window.ErrorDebugExtractor.checkLFI()             // Local file inclusion indicators
window.ErrorDebugExtractor.checkWebSocketSecurity() // WebSocket security
window.ErrorDebugExtractor.checkDOMClobbering()   // DOM clobbering check
```

### Utility
```js
window.ErrorDebugExtractor.filterBySeverity('CRITICAL')  // Filter by severity
window.ErrorDebugExtractor.getFindingsSummary()          // Get counts by category
window.ErrorDebugExtractor.searchFindings('token')       // Search findings
window.ErrorDebugExtractor.getTopCritical(10)            // Get top N critical
```

---

## Export Modes

```js
window.ErrorDebugExtractor.exportJSON()   // Download JSON
window.ErrorDebugExtractor.exportCSV()    // Download CSV
window.ErrorDebugExtractor.exportMD()     // Download Markdown
window.ErrorDebugExtractor.exportHTML()   // Download HTML
```

---

## Existing Features

### Core
```js
window.ErrorDebugExtractor.viewFindings()           // View findings
window.ErrorDebugExtractor.viewFindings(true)       // View ALL
window.ErrorDebugExtractor.showHighPriority()       // High priority only
window.ErrorDebugExtractor.startPeriodicScan(ms)    // Start periodic scan
window.ErrorDebugExtractor.stopPeriodicScan()       // Stop periodic scan
window.ErrorDebugExtractor.stop()                   // Stop all monitoring
```

### Custom Rules
```js
window.ErrorDebugExtractor.addCustomRule(name, pattern, category, severity)
window.ErrorDebugExtractor.removeCustomRule(name)
window.ErrorDebugExtractor.toggleCustomRule(name, enabled)
window.ErrorDebugExtractor.getCustomRules()
window.ErrorDebugExtractor.exportCustomRules()
window.ErrorDebugExtractor.importCustomRules(rulesObj)
```

### Performance & Analytics
```js
window.ErrorDebugExtractor.getPerformanceReport()
window.ErrorDebugExtractor.resetPerformanceMetrics()
window.ErrorDebugExtractor.getHistoricalTrends()
window.ErrorDebugExtractor.getHistoricalData(hours)
window.ErrorDebugExtractor.predictTrends(hours)
```

### Dashboard
```js
window.ErrorDebugExtractor.showDashboard()
window.ErrorDebugExtractor.hideDashboard()
```

### Remediation
```js
window.ErrorDebugExtractor.getRemediationSuggestions(finding)
window.ErrorDebugExtractor.addRemediationSuggestion(category, suggestion)
```

### Alerting
```js
window.ErrorDebugExtractor.getActiveAlerts()
window.ErrorDebugExtractor.acknowledgeAlert(alertId)
window.ErrorDebugExtractor.setAlertThreshold(key, value)
```

### Collaboration
```js
window.ErrorDebugExtractor.initCollaborationSession(name)
window.ErrorDebugExtractor.addTeamMember(id, info)
window.ErrorDebugExtractor.shareFinding(id, finding, priority)
window.ErrorDebugExtractor.addFindingComment(id, comment, author)
window.ErrorDebugExtractor.updateFindingStatus(id, status)
window.ErrorDebugExtractor.getCollaborationSummary()
```

---

## Findings Categories

| Category | What It Catches |
|----------|----------------|
| `globalErrors` | Window errors, uncaught exceptions |
| `promiseRejections` | Unhandled promise rejections |
| `consoleErrors` | Errors/warnings logged to console |
| `debugVariables` | Exposed global debug variables |
| `debugComments` | TODO/FIXME/HACK/DEBUG comments |
| `sourcemaps` | Exposed source map references |
| `verboseOutputs` | Verbose debug logging |
| `storageLeaks` | Sensitive data in localStorage/sessionStorage |
| `domLeaks` | Sensitive data exposed in DOM |
| `vulnerabilityPatterns` | Security vulnerability patterns |

---

## Architecture

```
Error-Handling-Debugger v3.0
├── Error Listeners (window.onerror, unhandledrejection)
├── Console Interceptor (error/warn/info/log/debug)
├── Global Variable Scanner
├── Storage Scanner (localStorage, sessionStorage, cookies)
├── DOM Scanner (inputs, meta, data-attrs, scripts, comments)
├── Vulnerability Pattern Scanner (15+ patterns)
├── Network Monitor (fetch, XHR, WebSocket)
├── Custom Rules Engine
├── Performance Monitor
├── Historical Analysis & Trends
├── Real-Time Dashboard
├── Alerting System
├── Collaboration Features
├── Remediation Engine
├── 20 New Security Features
└── 4 Export Formats (JSON, CSV, Markdown, HTML)
```

---

## What It Detects (Security)

- **Hardcoded secrets** (AWS keys, Stripe keys, JWTs, private keys, DB connections)
- **Debug endpoints** exposed in scripts (/debug, /admin, /swagger, etc.)
- **Source map exposure** (original source code accessible)
- **Missing security headers** (CSP, X-Frame-Options)
- **Insecure cookies** (missing Secure/HttpOnly/SameSite)
- **Mixed content** (HTTP resources on HTTPS pages)
- **Third-party scripts** without SRI
- **DOM clobbering** (id attributes shadowing globals)
- **postMessage handlers** without origin checks
- **Open redirects** in URL parameters
- **Insecure form actions** (HTTP, missing CSRF)
- **WebSocket over ws://** (unencrypted)
- **Service Worker** detection
- **Framework detection** (React, Vue, Angular, Next.js, etc.)
- **Prototype pollution** patterns
- **IDOR patterns** in URLs/scripts
- **LFI indicators** (path traversal, file:// URIs)
- **Exposed debug variables** in global scope

---

## Disclaimer

For educational and authorized security testing only. Unauthorized use against systems you don't own or have permission to test is illegal. Use responsibly.
