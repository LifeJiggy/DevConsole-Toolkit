# Universal Input & Security Analyzer

A client-side security analysis tool for discovering, mapping, and testing every user input on a web application. Extracts all interactive elements, traces event handlers to their source code, correlates inputs to network requests, detects XSS/injection sinks, and generates professional security reports — all from a single script pasted into your browser console.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `🧠-Universal-User-Input-Extractor-Client-Side.js`
4. Press **Enter** — auto-executes and prints initial findings

### Method 2: Browser Snippet (for repeated use)

1. DevTools → **Sources** → **Snippets** panel
2. Click **New snippet**, paste, save as `UISA.js`
3. Run anytime with **Ctrl+Enter**

### One-Line Quick Scan

```javascript
runAllCoreFunctionsRobust();
```

---

## Core Architecture

### Shared Constants

The file uses single-source-of-truth constants to avoid duplication:

```javascript
// Dangerous HTML attributes that execute JS (used across reflection/sink detection)
DANGEROUS_ATTRS = ["onclick","onerror","onload","onmouseover","onfocus","onblur",
  "onchange","onsubmit","oninput","onkeydown","onkeyup","onmouseout","onmouseenter",
  "onmouseleave","oncontextmenu","ondblclick","onkeydown","onkeypress","onkeyup",
  "onfocusin","onfocusout","onpointerdown","onpointerup","onpointermove",
  "onpointerenter","onpointerleave","onpointercancel","onpointerover","onpointerout",
  "ongotpointercapture","onlostpointercapture","ondragstart","ondrag","ondragend",
  "ondragenter","ondragleave","ondragover","ondrop","oncopy","oncut","onpaste",
  "onanimationstart","onanimationend","onanimationiteration","ontransitionend",
  "onwheel","onmousewheel","onresize","onscroll","onselect","onsubmit","onreset",
  "onsearch","onhashchange","onpopstate","onbeforeunload","onunload","ononline",
  "onoffline","onmessage","onmessageerror","onstorage","oninvalid","ontoggle",
  "onplay","onpause","onended","onloadedmetadata","onloadstart","onprogress",
  "oncanplay","oncanplaythrough","oncuechange","onvolumechange","onwaiting",
  "ondurationchange","ontimeupdate","onshow","ontoggle","onsubmit"]

DANGEROUS_ATTRS_SET = new Set(DANGEROUS_ATTRS)  // O(1) lookup

// Common event names (used across handler mapping and network correlation)
COMMON_EVENTS = ["click","dblclick","submit","change","input","keydown","keyup",
  "keypress","focus","blur","mousedown","mouseup","mousemove","mouseenter",
  "mouseleave","mouseover","mouseout","contextmenu","touchstart","touchend",
  "touchmove","pointerdown","pointerup","pointermove","wheel","copy","cut",
  "paste","dragstart","drag","dragend","dragenter","dragleave","dragover","drop",
  "animationstart","animationend","animationiteration","transitionend","resize",
  "scroll","select","search","hashchange","popstate","beforeunload","unload",
  "online","offline","message","storage","invalid","play","pause","ended",
  "loadedmetadata","loadstart","progress","canplay","canplaythrough","volumechange",
  "waiting","durationchange","timeupdate","show","toggle"]
```

### HEAVY_ENCODING_MAP (WAF Bypass Encodings)

17 real encoder functions for `heavy` mode fuzzing. Previously dead code, now wired into `buildVariants()`:

| Encoder | What it does |
|---------|-------------|
| `urlEncode` | `%3Cscript%3E` |
| `doubleUrlEncode` | `%253Cscript%253E` |
| `htmlEntityEncode` | `&#60;script&#62;` |
| `hexEncode` | `\x3cscript\x3e` |
| `unicodeEncode` | `\u003cscript\u003e` |
| `base64Encode` | `PHNjcmlwdD4=` |
| `base64HtmlEncode` | `data:text/html;base64,...` |
| `utf7Encode` | `+ADw-script+AD4-` |
| `jsFuck` | `[][(![]+[])[...]...]` |
| `mixedCase` | `<ScRiPt>` |
| `nullByte` | `<scr%00ipt>` |
| `backspace` | `<scr%08ipt>` |
| `tabInject` | `<scr\tipt>` |
| `newLineInject` | `<scr\nipt>` |
| `overlongUTF8` | `%C0%BC` style |
| `utf16Encode` | `\xFF\xFE<\x00` |
| `charCodeEncode` | `String.fromCharCode(60)` |

---

## Configuration (UPE_CONFIG)

Modify at runtime in the console:

```javascript
// Enable overlay UI and aggressive scanning
UPE_CONFIG.overlay.enabled = true;
UPE_CONFIG.selectorProfile = 'aggressive';

// Add custom component selectors and re-scan
UPE_CONFIG.extraSelectors.push('.my-custom-component');
extractAndWrapAllInputs();

// Disable monkey-patching in sensitive environments
UPE_CONFIG.safeMode = true;
```

**Default config:**

```javascript
{
  observerEnabled: true,
  throttleMs: 250,
  maskSensitive: true,
  maskFieldsPatterns: [/pass(word)?/i, /token/i, /secret/i, /apikey/i, /api-key/i, /ssn/i, /credit|card/i, /email/i],
  selectorProfile: 'balanced',       // 'lite' | 'balanced' | 'aggressive'
  extraSelectors: ['.select2', '.select2-selection__rendered', '.ql-editor', '.tox-tinymce', '.tox-edit-area iframe', '.mce-content-body'],
  excludeSelectors: [],
  overlay: { enabled: false },
  safeMode: false,
  monkeyPatch: { fetch: true, xhr: true, websocket: true, eventsource: true, timers: true },
  stackTraceLimit: 50,
  captureStacks: false,
  useRobustReflection: false
}
```

---

## Full API Reference

### Initialization & Batch Scans

| Function | Description |
|----------|-------------|
| `runAllCoreFunctions()` | Run all core mapping + analysis at once |
| `runAllCoreFunctionsRobust()` | Thorough version — may detect more dynamic inputs |
| `quickSecurityScan()` | Quick overview of security posture |
| `showAvailableFunctions()` | List all available console commands |

### Core Analysis Functions

| Function | Description |
|----------|-------------|
| `extractInteractiveInputs()` | Find all inputs, contenteditable, ARIA roles, rich text editors |
| `extractAndWrapAllInputs()` | Re-extract + wrap all inputs with tracking |
| `mapInputListenersHandlers()` | Map every event listener to its handler, with source code + file/line |
| `mapInteractiveInputsNetwork()` | Correlate user inputs → network requests (fetch/XHR/WebSocket) |
| `detectInputReflections()` | Scan DOM for input value reflections + dangerous sink detection |
| `detectInputReflectionsRobust()` | Enhanced version with deeper DOM traversal |
| `analyzeInputStatistics()` | Statistics on input types, events, reflection counts |

### Security & Vulnerability Analysis

| Function | Description |
|----------|-------------|
| `analyzeDangerousInputs({ showTop, showDetails })` | Detailed analysis of highest-risk inputs |
| `identifyCriticalHotspots()` | Prioritized list of most vulnerable inputs |
| `generateSecurityReport()` | Professional console security report |
| `filterReflections({ dangerousOnly, minReflections })` | Filter reflection results by risk |

### Enhancement 1–10: Advanced Analysis

| Function | What it detects |
|----------|----------------|
| `detectDangerousSinks()` | `eval()`, `innerHTML=`, `document.write()`, `setTimeout(string)`, etc. — all dangerous DOM sinks |
| `detectSSRFPatterns()` | Internal IPs, localhost, metadata endpoints in inputs/scripts |
| `detectCSRFProtection()` | Missing CSRF tokens on state-changing forms |
| `analyzeTokenEntropy()` | High-entropy hidden fields (exposed tokens, JWTs) |
| `detectOpenRedirects()` | Redirect params (`redirect_uri`, `return_to`, `next`) in forms/links/scripts |
| `detectDOMClobbering()` | Elements with dangerous names (`__proto__`, `constructor`, `window`) |
| `detectPrototypePollution()` | `__proto__[]`, `Object.assign()`, `.merge()` in scripts/inputs |
| `detectSanitizationFunctions()` | DOMPurify, sanitize(), escape(), Trusted Types — what's protecting the page |
| `detectMassAssignment()` | Forms with many editable + sensitive field names (admin, role, price) |
| `discoverAPIEndpoints()` | API URLs from form actions, fetch/XHR calls, links with `/api/` |

### Enhancement 11–20: Dynamic & Deep Analysis

| Function | What it does |
|----------|-------------|
| `startDynamicContentTracker()` | MutationObserver that tracks dynamically added/removed inputs in SPAs |
| `stopDynamicContentTracker()` | Stop + disconnect the tracker |
| `analyzeCSPDeep()` | Deep CSP analysis — finds `unsafe-inline`, `unsafe-eval`, missing directives |
| `visualizeEventChains()` | Maps input → event → handler → network/sink chains |
| `startCrossTabTracker()` | BroadcastChannel-based cross-tab state tracking |
| `stopCrossTabTracker()` | Stop cross-tab tracker |
| `generateRemediationReport()` | Actionable remediation report with priority levels |
| `detectGraphQLEndpoints()` | GraphQL endpoints, inline queries, data-attribute patterns |
| `detectJWTExposure()` | JWT tokens in inputs, scripts, cookies |
| `detectSSTIVectors()` | Server-Side Template Injection patterns (`{{ }}`, `${}`, `<%= %>`) |
| `mapWebSocketEndpoints()` | WebSocket connections from network triggers + inline scripts |
| `generateExploitSuggestions()` | Auto-generates exploit payloads based on detected sinks/reflections |

### Live Monitoring (SPAs)

| Function | Description |
|----------|-------------|
| `startLiveInputMonitor({ trackKeystrokes, maxHistory })` | Real-time input monitoring with keystroke tracking |
| `stopLiveInputMonitor()` | Stop the live monitor |
| `startLiveSecurityMonitor()` | Monitor for security-related DOM changes in real-time |

### Data Export

| Function | Description |
|----------|-------------|
| `exportSecurityData('json')` | Export all findings to JSON |
| `exportSecurityData('csv')` | Export all findings to CSV |

### Global State Objects

| Object | Description |
|--------|-------------|
| `window._upe_inputMap` | Map of all tracked inputs → metadata |
| `window._upe_networkTriggers` | Array of all network triggers correlated to inputs |
| `window._dynamicTracker` | Active MutationObserver instance + change log |
| `window._crossTabChannel` | Active BroadcastChannel instance |
| `window._crossTabMessages` | Cross-tab message log |
| `window.crossTabBroadcast(msg)` | Send a message to other tabs |

---

## Hardening & Reliability

### Safety Wrapper (`_HARDEN`)

All 20 enhancement functions are wrapped in a safety layer:

```javascript
_HARDEN = {
  MAX_ELEMENTS: 5000,        // Cap on querySelectorAll results
  safe(fn, label),           // try/catch wrapper — returns undefined on failure
  safeArr(fn, label),        // try/catch wrapper — returns [] on failure
  domReady(),                // Checks document.body exists
  queryAll(selector, limit), // Capped querySelectorAll
  freshRegex(pattern),       // Returns new RegExp (fixes /g sticky lastIndex bug)
}
```

### What was fixed

| Issue | Fix |
|-------|-----|
| Regex `/g` flag statefulness | All patterns now use `_HARDEN.freshRegex()` for fresh copies per match |
| Empty DOM crashes | `_HARDEN.domReady()` guard at top of every function |
| Browser freeze on huge pages | `MAX_ELEMENTS` cap (5000) on all `querySelectorAll` calls |
| Memory leak (DOM refs in closures) | `startLiveInputMonitor` stores selector strings, not DOM elements |
| Unhandled errors in loops | Inner `try/catch` on every element in `forEach` loops |
| Sub-function failures | `generateRemediationReport` wraps `detectCSRFProtection` and `analyzeTokenEntropy` in `try/catch` |
| `networkTriggers` undefined | Null-check in `mapWebSocketEndpoints` |

---

## Bug Hunting Workflow

### Step 1: Initial Reconnaissance

```javascript
runAllCoreFunctionsRobust();
```

Review the summary tables in the console. This maps all inputs, handlers, and network triggers.

### Step 2: Identify the Attack Surface

```javascript
analyzeInputStatistics();
```

Understand input types, event distribution, and reflection counts.

### Step 3: Map Actions to Network Calls

```javascript
mapInteractiveInputsNetwork();
```

Interact with the app (fill forms, click buttons). Observe which inputs trigger API calls — your entry point for IDOR, business logic flaws.

### Step 4: Hunt for XSS and Injection

```javascript
detectInputReflections();
filterReflections({ dangerousOnly: true });
```

See where test inputs are rendered. Focus on dangerous sinks (`innerHTML`, `eval`, `document.write`).

### Step 5: Deep Security Analysis

```javascript
detectDangerousSinks();       // All eval/innerHTML/write sinks
detectSSRFPatterns();         // Internal IPs in inputs
detectPrototypePollution();   // __proto__ injection vectors
detectJWTExposure();          // Tokens in hidden fields/scripts
detectSSTIVectors();          // Template injection patterns
analyzeCSPDeep();             // CSP weaknesses
```

### Step 6: Exploit Suggestion Generation

```javascript
generateExploitSuggestions();
```

Auto-generates payloads based on detected sinks and reflection contexts.

### Step 7: Monitor Dynamic Applications

```javascript
startLiveInputMonitor({ trackKeystrokes: true, maxHistory: 200 });
startDynamicContentTracker();
```

For SPAs — navigate the app and let the tool discover new inputs dynamically.

### Step 8: Document and Report

```javascript
generateSecurityReport();
generateRemediationReport();
exportSecurityData('json');
```

---

## File Structure

```
src/User-Input/
├── 🧠-Universal-User-Input-Extractor-Client-Side.js  (4900+ lines)
│   ├── Shared constants (DANGEROUS_ATTRS, COMMON_EVENTS)
│   ├── UPE_CONFIG + configuration system
│   ├── Input extraction (standard, contenteditable, ARIA, rich text)
│   ├── Event handler wrapping + source extraction
│   ├── Network monkey-patching (fetch, XHR, WebSocket, EventSource)
│   ├── Reflection detection + sink analysis
│   ├── Live monitoring (MutationObserver, keystroke tracking)
│   ├── Security reporting + export (JSON/CSV)
│   ├── 20 Enhancement functions (hardened with _HARDEN wrapper)
│   └── HEAVY_ENCODING_MAP (17 encoders)
├── 🧠-Universal-User-README.md
├── NextRay.js
├── NextRay-README.md
├── Universal-guide.txt
└── README.md
```
