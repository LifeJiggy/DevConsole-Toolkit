# NextRay — DevTools Network X-Ray

A lightweight browser console tool for capturing network traffic (fetch/XHR/WebSocket/beacon) with auto-tagging using the GOLD MINE CHECKLIST, real-time HUD overlay, and 20 security scanning enhancements. Exports to JSON/CSV/HAR/NDJSON and generates cURL commands.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `NextRay-DevTools-V2.js`
4. Press **Enter** — capture starts automatically

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `NextRay.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

### Network Interception

| Protocol | What it captures |
|----------|-----------------|
| **fetch** | Patches `window.fetch` — captures URL, method, headers, body, response |
| **XHR** | Patches `XMLHttpRequest.open`/`.send` — full request/response lifecycle |
| **WebSocket** | Hooks `WebSocket` constructor — captures URL and messages |
| **Beacon** | Patches `navigator.sendBeacon` — captures beacon payloads |

### GOLD MINE CHECKLIST (Auto-Tagging)

Every captured entry is automatically tagged with relevant categories:

| Tag | What it detects |
|-----|----------------|
| `#Framework` | React, Vue, Angular, jQuery, Next.js, etc. |
| `#ThirdParty` | Cross-origin requests, analytics, CDNs |
| `#State` | State management (Redux, Vuex, Pinia, Zustand) |
| `#Auth` | Auth endpoints, tokens, session cookies |
| `#Input` | Form submissions, file uploads |
| `#Error` | 4xx/5xx status codes, error responses |
| `#Transform` | Data transformation, serialization |
| `#Events` | Event listeners, callbacks |
| `#Async` | Async operations (promises, observables) |
| `#Memory` | Potential memory leaks, large payloads |

### Real-Time HUD Overlay

- Toggle with `NextRay.overlay(true/false)`
- Shows live counts: fetch, XHR, WebSocket, errors
- Max z-index (sits above everything)
- Uses `textContent` (no innerHTML XSS risk)

### Export Formats

| Format | Function | Description |
|--------|----------|-------------|
| JSON | `exportJSON()` | Full log as JSON array |
| CSV | `exportCSV()` | Tabular format for spreadsheets |
| HAR | `exportHAR()` | HTTP Archive Format for other tools |
| NDJSON | `exportNDJSON()` | Newline-delimited JSON for streaming |
| cURL | `curl(i)` | cURL command for any entry |

---

## Full API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `NextRay.start()` | Start capturing network traffic |
| `NextRay.stop()` | Stop capturing |
| `NextRay.clear()` | Clear all captured logs |
| `NextRay.table()` | Display traffic table in console |
| `NextRay.find(pattern)` | Filter entries by URL regex or #Tag |
| `NextRay.analyze(i)` | Re-run GOLD MINE checklist on entry i |
| `NextRay.tags(i)` | Get tags for entry i |
| `NextRay.curl(i)` | Generate cURL command for entry i |
| `NextRay.overlay(bool)` | Toggle HUD overlay |

### Export

| Function | Description |
|----------|-------------|
| `NextRay.exportJSON()` | Export full log as JSON |
| `NextRay.exportCSV()` | Export as CSV |
| `NextRay.exportHAR()` | Export as HAR (HTTP Archive) |
| `NextRay.exportNDJSON()` | Export as newline-delimited JSON |

### Configuration

| Property | Description |
|----------|-------------|
| `NextRay.config` | Access/modify capture settings |

### Enhancement 1–10: Security Scanning

| Function | What it does |
|----------|-------------|
| `NextRay.scoreTraffic()` | Risk-score all traffic (HIGH/CRITICAL entries weighted) |
| `NextRay.analyzeCORS()` | Detect wildcard CORS, cross-origin ACAO, dangerous methods |
| `NextRay.analyzeCookies()` | Find missing Secure/HttpOnly/SameSite flags |
| `NextRay.checkSecurityHeaders()` | Check for HSTS, CSP, X-Frame-Options, etc. |
| `NextRay.detectDataExposure()` | Scan responses for emails, phones, credit cards, API keys |
| `NextRay.mapEndpoints()` | Map unique API endpoints with method and frequency |
| `NextRay.analyzePerformance()` | Find slow requests (>3s) |
| `NextRay.fingerprintTech()` | Detect technology from Server/Powered-By headers |
| `NextRay.complianceReport()` | Map findings to OWASP Top 10 categories |
| `NextRay.trafficDiff(minutes)` | Compare traffic between two time windows |

### Enhancement 11–20: Deep Analysis

| Function | What it does |
|----------|-------------|
| `NextRay.analyzeJWTs()` | Parse JWTs from headers/bodies — flag alg:none, extract issuer/expiry |
| `NextRay.detectGraphQL()` | Find GraphQL endpoints and operations in request bodies |
| `NextRay.detectSubdomainTakeover()` | Match CNAME/service patterns (Heroku, S3, Azure, GitHub Pages) |
| `NextRay.scanSensitivePaths()` | Detect hits to /.env, /.git/config, /swagger.json, etc. |
| `NextRay.detectSizeAnomalies()` | Statistical outlier detection on response sizes (3σ threshold) |
| `NextRay.analyzeMethods()` | HTTP method distribution with percentages |
| `NextRay.analyzeStatusCodes()` | Status code frequency breakdown |
| `NextRay.detectThirdParty()` | Enumerate cross-origin third-party domains |
| `NextRay.trackAuthFlows()` | Track login/oauth/callback/session-setting requests |
| `NextRay.trafficDashboard()` | One-line summary: total, error rate, domains, auth/graphql/CORS |

---

## Bug Hunting Workflow

### Step 1: Start Capture

```javascript
NextRay.start();
```

Browse the target normally — all traffic is captured and auto-tagged.

### Step 2: View Traffic Table

```javascript
NextRay.table();
```

Displays all entries with status, method, URL, tags, and size.

### Step 3: Filter by Tag

```javascript
NextRay.find("#Auth");        // Find auth-related requests
NextRay.find("#Error");       // Find error responses
NextRay.find("#ThirdParty");  // Find cross-origin requests
NextRay.find(/api\/v1/);     // Find by URL pattern
```

### Step 4: Risk Score

```javascript
NextRay.scoreTraffic();
```

Prioritized list scored by risk (status codes, URL patterns, auth endpoints).

### Step 5: CORS Analysis

```javascript
NextRay.analyzeCORS();
```

Find wildcard CORS, cross-origin ACAO with credentials, dangerous HTTP methods.

### Step 6: Cookie Security

```javascript
NextRay.analyzeCookies();
```

Missing Secure, HttpOnly, SameSite flags on session cookies.

### Step 7: Security Headers

```javascript
NextRay.checkSecurityHeaders();
```

Check every endpoint for HSTS, CSP, X-Frame-Options.

### Step 8: Data Exposure

```javascript
NextRay.detectDataExposure();
```

Scan response bodies for PII and credential patterns.

### Step 9: JWT Analysis

```javascript
NextRay.analyzeJWTs();
```

Parse JWTs — flag `alg:none`, extract issuer, subject, expiry.

### Step 10: Sensitive Paths

```javascript
NextRay.scanSensitivePaths();
```

Detect requests to /.env, /.git/config, /swagger.json, etc.

### Step 11: Third-Party Domains

```javascript
NextRay.detectThirdParty();
```

Enumerate all cross-origin domains with request counts.

### Step 12: Auth Flow Tracking

```javascript
NextRay.trackAuthFlows();
```

Map all login, OAuth, callback, and session-setting requests.

### Step 13: Dashboard

```javascript
NextRay.trafficDashboard();
```

One-line summary of entire traffic session.

### Step 14: Generate cURL

```javascript
NextRay.curl(0);  // Generate cURL for first entry
```

Copy-paste ready cURL command for replay.

### Step 15: Export

```javascript
NextRay.exportJSON();  // Full JSON
NextRay.exportHAR();   // HAR for import
NextRay.exportCSV();   // CSV for spreadsheets
```

---

## Configuration

```javascript
// Access config:
NextRay.config
```

Key settings:
- `maxLogs` — Maximum log entries (default: 5000)
- `captureFetch` — Capture fetch requests (default: true)
- `captureXHR` — Capture XHR requests (default: true)
- `captureWS` — Capture WebSocket (default: true)
- `captureBeacon` — Capture sendBeacon (default: true)
- `autoAnalyze` — Auto-run GOLD MINE on each entry (default: true)

---

## Safety Features

- **`_safeTable()`** — console.table wrapper with 500-row cap
- **`MAX_LOGS = 5000`** — Log array capped with splice eviction
- **`_orig` re-read** — Re-reads `window.fetch/XHR/WS` on each `start()` to handle page overwrites
- **`{ once: true }`** — XHR loadend listener auto-removes (no accumulation)
- **WebSocket try/catch** — Constructor wrapped, failed attempts logged
- **`textContent`** — HUD uses text nodes (no innerHTML)
- **Logs getter** — Returns `logs.slice()` (callers can't corrupt internal state)
- **`clear()` resets** — Clears `recent` array and `hudCounts`

---

## File Structure

```
src/Network/
├── README.md
├── Nerwork-Mapper.js
├── Network-Mapper-Readme.md
├── NextRay-DevTools-V2.js
│   ├── Configuration (config object)
│   ├── Utilities (lower, has, pushUnique, bodyToString, stack)
│   ├── Network capture (fetch/XHR/WebSocket/beacon hooks)
│   ├── GOLD MINE auto-tagging (10 categories)
│   ├── HUD overlay (textContent, z-index: 2147483647)
│   ├── Analysis engine (analyzeEntry, tag assignment)
│   ├── Export (JSON, CSV, HAR, NDJSON, cURL)
│   ├── Traffic display (table, find, filter)
│   └── 20 Enhancement functions (all NextRay.* exposed)
├── NextRay-DevTools-V2-README.md (legacy)
└── Qwen-README (legacy)
```
