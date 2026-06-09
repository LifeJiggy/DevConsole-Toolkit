# Universal Parameter Extractor (UPE)

A client-side browser console tool for discovering, analyzing, and visualizing every parameter on a web application. Extracts parameters from URLs, DOM elements, cookies, meta tags, hidden inputs, inline configs, network requests (fetch/XHR), and iframes. Checks for DOM reflections and dangerous sinks. Highlights reflected parameters visually. Exports results to CSV/JSON.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `🧠-Universal-Parameter-Extractor-Client-Side.js`
4. Press **Enter** — the banner UI appears on the page

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `UPE.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

### Parameter Sources (10 extraction methods)

| Source | What it extracts |
|--------|-----------------|
| URL query | `?key=value` parameters |
| URL hash | `#key=value` fragment parameters |
| URL path | `/user/john/profile` → `segment0=user`, `segment1=john` |
| DOM URLs | `href`, `src`, `action`, `data` attributes on all elements |
| Cookies | All accessible cookies (non-httpOnly) |
| Meta tags | `<meta name="..." content="...">` |
| Hidden inputs | `<input type="hidden">` |
| Form fields | All form values via FormData |
| Inline configs | JSON in `<script>` tags, JS variable assignments |
| iframes | Same-origin iframe location params |

### Network Interception

- **fetch**: Patches `window.fetch` — extracts URL params, headers, body
- **XHR**: Patches `XMLHttpRequest.open`/`.send` — extracts URL params, body
- **Timer sinks**: Patches `setTimeout(string)`, `setInterval(string)`
- **Location sinks**: Patches `location.assign()`, `location.replace()`, `window.location.href` setter
- **DOM sinks**: Patches `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`

### Reflection Detection

- Checks every parameter value against the entire DOM body/head
- Detects reflections in text nodes, attributes, and script blocks
- Identifies dangerous sinks (`innerHTML`, `eval`, `document.write`, `location`)
- Case-insensitive matching with multiple encoding detection (raw, URL-decoded, HTML-decoded, attribute-escaped)

### Visual Highlighting

- **Red outline**: Reflected in dangerous sink
- **Orange outline**: Reflected in DOM (non-dangerous)
- Non-destructive: preserves original DOM, only adds overlay spans
- Highlights ALL occurrences per text node (not just first)

---

## Banner UI

The interactive banner appears in the bottom-right corner:

| Button | Action |
|--------|--------|
| **Extract** | Run full parameter extraction |
| **Highlight** | Visual highlight reflected params in DOM |
| **Export CSV** | Download parameters + reflections as CSV |
| **Show JSON** | Print `window.PARAM_REFLECTIONS_JSON` |
| **Real-Time** | Start continuous scanning |
| **Stop RT** | Stop real-time scanning |
| **Inject Payload** | Inject test payloads into all forms + cookies |
| **Clear Highlights** | Remove all visual highlights |
| **Unpatch Network** | Restore original fetch/XHR |

### Settings Panel

- **includeWindowGlobals**: Extract string values from `window.*` properties
- **interval(ms)**: Real-time scan interval
- **logLevel**: silent / error / warn / info / debug
- **scan selector**: Limit scan to a CSS selector subtree (e.g., `#app`)

---

## Full API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `extractAllParameters()` | Run all 10 extraction methods + detect reflections + print table |
| `highlightReflectedParams()` | Visual highlight all reflected params in DOM |
| `exportParamReflectionsCSV()` | Download CSV with all params, reflections, sources, risk |
| `clearParamHighlights()` | Remove all visual highlights |
| `showBanner()` | Re-show the banner UI |

### Network Patching

| Function | Description |
|----------|-------------|
| `patchNetwork()` | Patch fetch + XHR + DOM sinks (calls interceptAPICalls internally) |
| `unpatchNetwork()` | Restore all original functions |
| `interceptAPICalls()` | Patch fetch + XHR only (called by patchNetwork) |

### Real-Time Scanning

| Function | Description |
|----------|-------------|
| `startRealTimeParamScan(intervalMs)` | Start continuous parameter extraction (merges, doesn't clear) |
| `stopRealTimeParamScan()` | Stop real-time scanning |

### Payload Injection

| Function | Description |
|----------|-------------|
| `injectParamPayloads(payload)` | Inject hidden fields into all forms + set cookie. Cleans up previous injections. |

### Enhancement 1–10: Analysis

| Function | What it does |
|----------|-------------|
| `analyzeParamSecurity()` | Risk-score all params (CRITICAL/HIGH/MEDIUM/LOW) based on sinks, reflections, names |
| `detectParamReflectionDepth()` | Classify reflection depth: body text, attribute, script block |
| `mapParamFlow()` | Map param sources → sink flow (URL→form→innerHTML chain) |
| `detectSensitiveParamLeakage()` | Find sensitive params (token, auth, key) exposed in URLs/cookies |
| `analyzeCookieSecurity()` | Analyze cookie flags and sensitivity |
| `detectCORSParams()` | Detect sensitive header params exposed via CORS |
| `scanGraphQLParams()` | Detect GraphQL operations in params + inline scripts |
| `detectJWTInParams()` | Find JWT tokens in parameter values + cookies |
| `analyzeFormAutocomplete()` | Find sensitive fields with autocomplete enabled |
| `detectOpenRedirectParams()` | Find redirect params with external URLs |

### Enhancement 11–20: Deep Analysis

| Function | What it does |
|----------|-------------|
| `scanWebSocketParams()` | Detect WebSocket URLs in params + scripts |
| `analyzeCSPForParams()` | Analyze CSP protection for reflected params |
| `detectPrototypePollutionParams()` | Find `__proto__`, `constructor[]` in param values |
| `mapParamToSinkChains()` | Complete param → source → sink chain mapping |
| `detectSSRFParams()` | Find URL-type params with internal IPs (SSRF) |
| `analyzePathParamPatterns()` | Classify URL path segments (numeric, UUID, hash, string) |
| `generateParamExploits()` | Auto-generate XSS payloads for reflected params |
| `detectAuthBypassParams()` | Find auth-related params with elevated values |
| `visualizeParamHeatmap()` | Color-coded heatmap of param risk across page |
| `generateParamReport()` | Comprehensive security report (runs all analyses) |

---

## Configuration (SETTINGS)

```javascript
// Modify at runtime:
SETTINGS.quiet = false;                    // Show all extraction logs
SETTINGS.includeWindowGlobals = true;       // Extract window.* string values
SETTINGS.realTimeIntervalMs = 5000;        // Real-time scan interval
SETTINGS.scanSelector = "#app";             // Limit scan to subtree
SETTINGS.logLevel = "debug";               // silent|error|warn|info|debug
SETTINGS.caseInsensitive = true;            // Case-insensitive reflection matching
SETTINGS.maxHistory = 500;                 // Max history per param
SETTINGS.autoPatchNetwork = true;          // Auto-patch network on load
```

---

## Bug Hunting Workflow

### Step 1: Extract All Parameters

```javascript
extractAllParameters();
```

Review the table — every param, its value, reflections, sources, dangerous sinks.

### Step 2: Security Analysis

```javascript
analyzeParamSecurity();
```

Prioritized list of params scored by risk factors (sink, reflection count, name sensitivity, source exposure).

### Step 3: Find Sensitive Leakage

```javascript
detectSensitiveParamLeakage();
detectJWTInParams();
```

Sensitive params in URLs are logged in server logs, referrer headers, browser history.

### Step 4: Map Attack Chains

```javascript
mapParamToSinkChains();
mapParamFlow();
```

See the complete flow: `param → URL → form → innerHTML` — your exploitation path.

### Step 5: SSRF & Open Redirect

```javascript
detectSSRFParams();
detectOpenRedirectParams();
```

URL-type params with internal IPs or external redirect targets.

### Step 6: Generate Exploits

```javascript
generateParamExploits();
```

Auto-generates XSS payloads tailored to the specific reflection context (script block, attribute, body text).

### Step 7: Visual Heatmap

```javascript
visualizeParamHeatmap();
```

Color-coded overlay showing risk across the entire page.

### Step 8: Full Report

```javascript
generateParamReport();
// View: window.PARAM_SECURITY_REPORT
```

Runs all 20 analyses and produces a consolidated security report.

---

## File Structure

```
src/Parameter/
├── README.md
├── 🧠-Universal-Parameter-Extractor-Client-Side.js
│   ├── Settings + Utilities (_log, htmlDecode, findMatchIndex, matchesAnyEncoding)
│   ├── Highlighting state (highlightMarkers, outlinedElements, clearHighlights)
│   ├── Scan scope helpers (getScanRoots, forEachRoot, safeQueryAll)
│   ├── Network patching (interceptAPICalls, patchNetwork, unpatchNetwork)
│   ├── Sink patching (innerHTML, outerHTML, setTimeout, location.href)
│   ├── Param management (addParam, addReflection, _newParamEntry factory)
│   ├── Extraction (URL, DOM, cookies, meta, hidden, forms, inline, iframes)
│   ├── Reflection detection (detectReflections, findMatchIndex)
│   ├── Visual highlighting (highlightReflectedParams — all occurrences, case-insensitive)
│   ├── Export (CSV)
│   ├── Real-time scanning (merge-based, accurate interval)
│   ├── Payload injection (with cleanup + URL encoding)
│   ├── Banner UI (Shadow DOM, draggable, settings panel)
│   └── 20 Enhancement functions (all window.* exposed)
```
