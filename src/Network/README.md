# Network Tools

Two browser console tools for network traffic interception, analysis, and security scanning.

## Tools

| Tool | Lines | Purpose |
|------|-------|---------|
| **Nerwork-Mapper.js** | ~2569 | Full network mapper — fetch/XHR/WebSocket capture, request/response bodies, headers, call stacks, rule-based analysis, findings store |
| **NextRay-DevTools-V2.js** | ~1082 | Lightweight network X-Ray — fast capture with auto-tagging, HAR/CSV export, cURL generation, HUD overlay |

## Quick Start

1. Open DevTools (F12) on any target website
2. Go to **Console** tab
3. Paste the tool file and press Enter
4. Use the displayed API commands

```js
// Nerwork-Mapper.js
NetworkMapper.start()        // Start capture
NetworkMapper.stop()         // Stop capture
NetworkMapper.showFindings() // View findings
NetworkMapper.scoreTraffic() // Risk scoring
NetworkMapper.analyzeCORS()  // CORS analysis
NetworkMapper.analyzeCookies() // Cookie security
NetworkMapper.checkSecurityHeaders() // Header check
NetworkMapper.detectDataExposure() // PII detection
NetworkMapper.mapEndpoints() // API mapping
NetworkMapper.analyzePerformance() // Slow requests
NetworkMapper.fingerprintTech() // Tech detection
NetworkMapper.complianceReport() // OWASP mapping
NetworkMapper.exportLogs()   // Export JSON

// NextRay-DevTools-V2.js
NextRay.start()              // Start capture
NextRay.stop()               // Stop capture
NextRay.table()              // View traffic table
NextRay.find(/regex/)        // Filter by URL
NextRay.curl(0)              // Generate cURL
NextRay.exportJSON()         // Export JSON
NextRay.exportHAR()          // Export HAR
NextRay.scoreTraffic()       // Risk scoring
NextRay.analyzeCORS()        // CORS analysis
NextRay.analyzeCookies()     // Cookie security
NextRay.checkSecurityHeaders() // Header check
NextRay.detectDataExposure() // PII detection
NextRay.mapEndpoints()       // API mapping
NextRay.analyzePerformance() // Slow requests
NextRay.fingerprintTech()    // Tech detection
NextRay.complianceReport()   // OWASP mapping
```

## Nerwork-Mapper.js Features

### Core Capture
- **fetch/XHR/WebSocket** interception with full request/response bodies
- **Call stack capture** for every request
- **User event tracking** (click, submit, change, keydown)
- **Element context** (CSS selectors, XPaths for triggered elements)
- **Header/body redaction** for sensitive values
- **Configurable filters** (URL, method, status, type)
- **Performance controls** (max entries, body size limits)
- **Findings store** with severity-based analysis rules

### Analysis Rules
- Sensitive data in request/response bodies
- Insecure cookies (missing Secure/HttpOnly/SameSite)
- Missing security headers
- CORS misconfigurations
- Debug info disclosure
- Authentication issues
- Information leakage
- SSRF indicators

### Enhancements (10)
1. **scoreTraffic()** — Risk scoring for high/critical traffic
2. **analyzeCORS()** — CORS wildcard & dangerous method detection
3. **analyzeCookies()** — Missing Secure/HttpOnly/SameSite flags
4. **checkSecurityHeaders()** — Missing HSTS, CSP, X-Frame-Options
5. **detectDataExposure()** — PII/credential regex scanning in responses
6. **mapEndpoints()** — Unique endpoint & method frequency mapping
7. **analyzePerformance()** — Slow request detection (>3s)
8. **fingerprintTech()** — Server/Powered-By header fingerprinting
9. **complianceReport()** — OWASP Top 10 category mapping
10. **trafficDiff()** — Time-window traffic comparison

### Hardening
- `_safeTable()` — console.table wrapper with row limits
- `_domReady()` — DOM ready state check
- WeakSet circular reference guard in `redactJson`
- Depth limits on `buildXPath` (max 10) and `checkJSON` (max 10)
- Size guards on `correlateIndicators` (max 1000 entries)
- Inner try/catch on forEach loops (cookies, headers, element details)
- Listener cleanup via `teardownUserEventTracking()` in `stop()`
- Filename sanitization in `download()`
- CSV export with proper field escaping

## NextRay-DevTools-V2.js Features

### Core Capture
- **fetch/XHR/WebSocket** interception
- **Beacon API** capture
- **Stack traces** for every request
- **Auto-tagging** with GOLD MINE CHECKLIST:
  - #Framework, #ThirdParty, #State, #Auth, #Input, #Error
  - #Transform, #Events, #Async, #Memory
- **Real-time HUD** overlay (toggle with `NextRay.overlay()`)
- **cURL generation** for any request

### Export
- **JSON** — Full log as JSON array
- **CSV** — Tabular format for spreadsheets
- **HAR** — HTTP Archive Format for import into other tools
- **NDJSON** — Newline-delimited JSON for streaming

### Enhancements (10)
1. **scoreTraffic()** — Risk scoring for high/critical traffic
2. **analyzeCORS()** — CORS wildcard & dangerous method detection
3. **analyzeCookies()** — Missing Secure/HttpOnly/SameSite flags
4. **checkSecurityHeaders()** — Missing HSTS, CSP, X-Frame-Options
5. **detectDataExposure()** — PII/credential regex scanning
6. **mapEndpoints()** — Unique endpoint & method frequency mapping
7. **analyzePerformance()** — Slow request detection (>3s)
8. **fingerprintTech()** — Server/Powered-By header fingerprinting
9. **complianceReport()** — OWASP Top 10 category mapping
10. **trafficDiff()** — Time-window traffic comparison

### Hardening
- `_safeTable()` — console.table wrapper with 500-row cap
- `MAX_LOGS = 5000` — Log array capped with splice eviction
- `_orig` re-read on each `start()` — handles page replacing fetch/XHR
- XHR `loadend` uses `{ once: true }` — prevents listener accumulation
- WebSocket constructor wrapped in try/catch
- HUD uses `textContent` instead of `innerHTML`
- `exportHAR` map body wrapped in try/catch
- Logs getter returns `logs.slice()` to prevent corruption
- `clear()` resets `recent` array
- `stop()` resets `hudCounts`

## Comparison

| Feature | Nerwork-Mapper | NextRay-V2 |
|---------|---------------|------------|
| fetch/XHR/WS capture | Yes | Yes |
| Request/response bodies | Yes | Yes |
| Call stacks | Yes | Yes |
| User event tracking | Yes | No |
| Rule-based analysis | Yes | Auto-tagging |
| Findings store | Yes | No |
| HAR export | No | Yes |
| cURL generation | No | Yes |
| HUD overlay | No | Yes |
| Cookie analysis | Enhancement | Enhancement |
| CORS analysis | Enhancement | Enhancement |
| PII detection | Enhancement | Enhancement |
| OWASP compliance | Enhancement | Enhancement |

## Commit History

| Commit | Changes |
|--------|---------|
| `99a9bc1` | Fix 56 bugs + harden + 20 enhancements |
