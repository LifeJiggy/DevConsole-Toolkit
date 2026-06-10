# Network Mapper

A client-side browser console tool for intercepting, capturing, and analyzing all network traffic (fetch/XHR/WebSocket) with rule-based security analysis, findings store, and 20 security scanning enhancements. Captures request/response bodies, headers, call stacks, user event context, and element triggers.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Nerwork-Mapper.js`
4. Press **Enter** — the banner UI appears on the page

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `NetworkMapper.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

### Network Interception

| Protocol | What it captures |
|----------|-----------------|
| **fetch** | Patches `window.fetch` — captures URL, method, headers, body, response |
| **XHR** | Patches `XMLHttpRequest.open`/`.send` — captures full request/response lifecycle |
| **WebSocket** | Hooks `WebSocket` constructor — captures URL, messages in/out |

### Data Captured Per Entry

| Field | Description |
|-------|-------------|
| `url` | Full request URL |
| `method` | HTTP method (GET, POST, etc.) |
| `status` | Response status code |
| `requestHeaders` | All request headers |
| `responseHeaders` | All response headers |
| `requestBody` | Request body (snippet/full/none) |
| `responseBody` | Response body (snippet/full/none) |
| `stack` | Call stack trace |
| `duration` | Request duration in ms |
| `timestamp` | Request start time |
| `triggeredBy` | CSS selector / XPath of triggering element |
| `userEvent` | Last user click/submit/change/keydown |
| `risk` | Computed risk level (low/medium/high/critical) |

### Analysis Engine

- **Rule-based detection** — configurable rules scan every entry
- **Severity levels** — P1 (critical), P2 (high), P3 (medium), P4 (low)
- **Findings store** — all findings saved with filtering and export
- **Automated analysis** — runs on every captured entry

### User Event Context

- Tracks `click`, `submit`, `change`, `keydown` on `document`
- Captures `lastClickedElement` with CSS selector and XPath
- Links requests to the user action that triggered them
- Cleanup via `teardownUserEventTracking()` on stop

---

## Banner UI

The interactive banner appears in the bottom-right corner:

| Button | Action |
|--------|--------|
| **Start** | Start network capture |
| **Stop** | Stop network capture |
| **Show Findings** | Display all security findings |
| **Show Stats** | Show capture statistics |
| **Export JSON** | Download full log as JSON |
| **Export CSV** | Download log as CSV |
| **Set Options** | Open configuration panel |

---

## Full API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `NetworkMapper.start()` | Start capturing network traffic |
| `NetworkMapper.stop()` | Stop capturing (teardown listeners) |
| `NetworkMapper.setOptions(opts)` | Update capture configuration |
| `NetworkMapper.exportLogs()` | Export full log as JSON string |
| `NetworkMapper.exportCSV()` | Export log as CSV |
| `NetworkMapper.showFindings()` | Display all security findings |
| `NetworkMapper.showStats()` | Show capture statistics |
| `NetworkMapper.getAnalysisSummary()` | Get findings by severity/type |
| `NetworkMapper.clearFindings()` | Clear all findings |

### Analysis

| Function | Description |
|----------|-------------|
| `NetworkMapper.analyzeEntry(entry)` | Re-run analysis on a specific entry |
| `NetworkMapper.getFindings(opts)` | Get filtered findings |
| `NetworkMapper.getFindingsCount()` | Get total findings count |

### Enhancement 1–10: Security Scanning

| Function | What it does |
|----------|-------------|
| `NetworkMapper.scoreTraffic()` | Risk-score all traffic (HIGH/CRITICAL entries weighted) |
| `NetworkMapper.analyzeCORS()` | Detect wildcard CORS, cross-origin ACAO, dangerous methods |
| `NetworkMapper.analyzeCookies()` | Find missing Secure/HttpOnly/SameSite flags |
| `NetworkMapper.checkSecurityHeaders()` | Check for HSTS, CSP, X-Frame-Options, etc. |
| `NetworkMapper.detectDataExposure()` | Scan responses for emails, phones, SSNs, credit cards, API keys |
| `NetworkMapper.mapEndpoints()` | Map unique API endpoints with method and frequency |
| `NetworkMapper.analyzePerformance()` | Find slow requests (>3s) |
| `NetworkMapper.fingerprintTech()` | Detect technology from Server/Powered-By/Via headers |
| `NetworkMapper.complianceReport()` | Map findings to OWASP Top 10 categories |
| `NetworkMapper.trafficDiff(minutes)` | Compare traffic between two time windows |

### Enhancement 11–20: Deep Analysis

| Function | What it does |
|----------|-------------|
| `NetworkMapper.analyzeJWTs()` | Parse JWTs from headers/bodies — flag alg:none, extract issuer/expiry |
| `NetworkMapper.detectGraphQL()` | Find GraphQL endpoints and operations in request bodies |
| `NetworkMapper.detectSubdomainTakeover()` | Match CNAME/service patterns (Heroku, S3, Azure, GitHub Pages) |
| `NetworkMapper.scanSensitivePaths()` | Detect hits to /.env, /.git/config, /swagger.json, etc. |
| `NetworkMapper.detectSizeAnomalies()` | Statistical outlier detection on response sizes (3σ threshold) |
| `NetworkMapper.analyzeMethods()` | HTTP method distribution with percentages |
| `NetworkMapper.analyzeStatusCodes()` | Status code frequency breakdown |
| `NetworkMapper.detectThirdParty()` | Enumerate cross-origin third-party domains |
| `NetworkMapper.trackAuthFlows()` | Track login/oauth/callback/session-setting requests |
| `NetworkMapper.trafficDashboard()` | One-line summary: total, error rate, domains, auth/graphql/CORS |

---

## Configuration (OPTIONS)

```javascript
// Modify at runtime:
NetworkMapper.setOptions({
  requestBodyCapture: "snippet",    // 'none' | 'snippet' | 'full' | number
  responseBodyCapture: "snippet",   // 'none' | 'snippet' | 'full' | number
  maxEntries: 3000,                 // Max log entries
  maxSnippetChars: 200,             // Max chars for snippet mode
  filters: {
    urls: [],                       // Regex array — only capture matching URLs
    methods: [],                    // String array — only capture these methods
    types: ["fetch", "xhr", "ws"], // Capture types to include
    statusMin: 0,                   // Min status code to capture
    statusMax: 0                    // Max status code (0 = no max)
  },
  redactKeys: ["authorization", "cookie", "set-cookie"],
  stringRedactPatterns: [
    { pattern: /sk_live_[a-zA-Z0-9]+/g, replacement: "[STRIPE_KEY]" }
  ],
  captureStacks: true,              // Capture call stacks
  captureUserEvents: true,          // Track user click/submit/change
  captureElementContext: true,      // Capture CSS selector / XPath
  parseJSON: true                   // Auto-parse JSON bodies
});
```

---

## Bug Hunting Workflow

### Step 1: Start Capture

```javascript
NetworkMapper.start();
```

Browse the target normally — all traffic is captured.

### Step 2: Risk Score Traffic

```javascript
NetworkMapper.scoreTraffic();
```

Prioritized list of entries scored by risk (status, URL patterns, auth endpoints).

### Step 3: CORS Analysis

```javascript
NetworkMapper.analyzeCORS();
```

Find wildcard CORS (`*`), cross-origin ACAO with credentials, dangerous HTTP methods.

### Step 4: Cookie Security

```javascript
NetworkMapper.analyzeCookies();
```

Missing Secure, HttpOnly, SameSite flags on session cookies.

### Step 5: Security Headers

```javascript
NetworkMapper.checkSecurityHeaders();
```

Check every endpoint for HSTS, CSP, X-Frame-Options, X-Content-Type-Options.

### Step 6: Data Exposure

```javascript
NetworkMapper.detectDataExposure();
```

Scan all response bodies for emails, phone numbers, SSNs, credit cards, API keys.

### Step 7: JWT Analysis

```javascript
NetworkMapper.analyzeJWTs();
```

Parse JWTs from Authorization headers and response bodies — flag `alg:none`, extract claims.

### Step 8: Sensitive Paths

```javascript
NetworkMapper.scanSensitivePaths();
```

Detect requests to /.env, /.git/config, /swagger.json, /phpinfo.php, etc.

### Step 9: Subdomain Takeover

```javascript
NetworkMapper.detectSubdomainTakeover();
```

Match CNAME patterns for Heroku, GitHub Pages, S3, Azure, Fastly.

### Step 10: Full Compliance Report

```javascript
NetworkMapper.complianceReport();
```

Maps all findings to OWASP Top 10 categories with remediation actions.

### Step 11: Dashboard

```javascript
NetworkMapper.trafficDashboard();
```

One-line summary of entire traffic session.

### Step 12: Export

```javascript
NetworkMapper.exportLogs();  // JSON
NetworkMapper.exportCSV();   // CSV
```

---

## Safety Features

- **`_safeTable()`** — console.table wrapper with row limits (prevents console freeze)
- **WeakSet circular guard** — `redactJson` handles circular references without stack overflow
- **Depth limits** — `buildXPath` (max 10), `checkJSON` (max 10) prevent infinite recursion
- **Size guards** — `correlateIndicators` capped at 1000 entries
- **Listener cleanup** — `teardownUserEventTracking()` removes all listeners on stop
- **Filename sanitization** — `download()` strips non-safe characters
- **CSV escaping** — all fields properly quoted and escaped

---

## File Structure

```
src/Network/
├── README.md
├── Nerwork-Mapper.js
│   ├── Configuration (defaultOptions, options merge)
│   ├── Utilities (_domReady, _safeTable, escapeHtml, truncate, csvEscape)
│   ├── Request capture (fetch/XHR/WebSocket hooks)
│   ├── Body parsing (readBodyFromRequest, parseMaybeJSON, redactJson)
│   ├── Element context (buildSelector, buildXPath, getElementDetails)
│   ├── User event tracking (click/submit/change/keydown)
│   ├── Header redaction (redactHeaders with configurable patterns)
│   ├── Analysis engine (rule-based, severity P1-P4)
│   ├── Findings store (addFindings, getFindings, filtering)
│   ├── Performance controls (maxEntries, body size limits)
│   ├── Overlay UI (findings panel, stats display)
│   ├── Export (JSON, CSV, download helper)
│   └── 20 Enhancement functions (all API.* exposed)
├── Network-Mapper-Readme.md (legacy)
├── NextRay-DevTools-V2.js
├── NextRay-DevTools-V2-README.md (legacy)
└── Qwen-README (legacy)
```
