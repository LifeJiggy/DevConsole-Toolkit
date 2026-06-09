# DOM Reflection & Sink Mapper

A client-side DevTools console tool for bug bounty mapping stage. Extracts interactive elements, maps states and event handlers, checks user-specified elements for reflections and sinks. Designed for the **mapping phase** of bug bounty hunting — extract, map, and allow manual element checks.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Dom-Sink-Mapper.js`
4. Press **Enter** — the banner UI appears

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `Mapper.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Extract Interactive Elements | Forms, inputs, buttons, links with attributes |
| 2 | Map Event Triggers, Listeners & Handlers | All event bindings on elements |
| 3 | Check Reflections in DOM/Body | Manual via `checkReflectionsAndSinks` |
| 4 | Check Sinks in DOM | Manual via `checkReflectionsAndSinks` |
| 5 | Monitor DOM Mutations | Real-time MutationObserver for changes |

### Deep Analysis Features (20)

| Function | What it does |
|----------|-------------|
| `scanJavascriptURIs()` | Find `href="javascript:..."` links |
| `scanDOMClobberingDeep()` | Detect name/id attributes that override DOM globals |
| `mapOpenRedirectChains()` | Map full redirect chains with parameters |
| `auditPostMessageDeep()` | Map `postMessage` listeners and origins |
| `detectPrototypePollutionChains()` | Find `__proto__`, `constructor[]` patterns |
| `mapStorageSinkFlows()` | Map localStorage/sessionStorage → DOM flows |
| `scanCSSExfiltrationVectors()` | Find CSS `url()` and `expression()` exfil vectors |
| `detectFrameworkSinksDeep()` | Detect framework-specific dangerous sinks |
| `mapContenteditableXSS()` | Find `contenteditable` elements with XSS risk |
| `mapClickjackingVulnerabilities()` | Find clickjackable iframes/forms |
| `analyzeDocumentWriteDeep()` | Analyze `document.write()` call chains |
| `mapMixedContentVulnerabilities()` | HTTP resources on HTTPS pages |
| `mapURLValidationBypass()` | Test URL validation with bypass payloads |
| `mapServiceWorkerChains()` | Find registered service workers |
| `auditRedirectChainDeep()` | Map full redirect chains with risk scoring |
| `scanXSSVectorComprehensive()` | Comprehensive XSS vector scan |
| `scanEncodedSinksDeep()` | Detect encoded payloads in sinks |
| `mapBaseTagHijack()` | Find `<base>` tag hijacking vectors |
| `auditEventHandlersDeep()` | Deep audit of all event handlers |
| `generateFullReconReport()` | Consolidated security report |

---

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `checkReflectionsAndSinks(elements)` | Analyze specific elements for reflections and sinks |
| `scanJavascriptURIs()` | Scan for javascript: URI sinks |
| `scanDOMClobberingDeep()` | Detect DOM clobbering vectors |
| `mapOpenRedirectChains()` | Map open redirect chains |
| `auditPostMessageDeep()` | Map postMessage attack surface |
| `detectPrototypePollutionChains()` | Detect prototype pollution patterns |
| `mapStorageSinkFlows()` | Map storage-to-DOM data flows |
| `scanCSSExfiltrationVectors()` | Find CSS-based exfiltration vectors |
| `detectFrameworkSinksDeep()` | Identify framework-specific sinks |
| `mapContenteditableXSS()` | Find contenteditable XSS risks |
| `mapClickjackingVulnerabilities()` | Find clickjacking vulnerabilities |
| `analyzeDocumentWriteDeep()` | Analyze document.write sinks |
| `mapMixedContentVulnerabilities()` | Detect mixed content issues |
| `mapURLValidationBypass()` | Test URL validation bypass |
| `mapServiceWorkerChains()` | Detect service workers |
| `auditRedirectChainDeep()` | Audit redirect chains |
| `scanXSSVectorComprehensive()` | Comprehensive XSS vector scan |
| `scanEncodedSinksDeep()` | Detect encoded payloads |
| `mapBaseTagHijack()` | Find base tag hijacking vectors |
| `auditEventHandlersDeep()` | Deep event handler audit |
| `generateFullReconReport()` | Generate full recon report |

### Output & Export

| Function | Description |
|----------|-------------|
| `exportReconResults(format)` | Export results as JSON or CSV |
| `showReconHelp()` | Show help for all commands |

---

## Bug Hunting Workflow

### Step 1: Extract All Elements

```javascript
// Run feature 1 — extract all interactive elements
// Use prompt: "all" for console + JSON + UI
```

### Step 2: Map Event Handlers

```javascript
// Run feature 2 — map all event triggers, listeners, handlers
```

### Step 3: Check Specific Elements

```javascript
const inputs = document.querySelectorAll('input[type="text"]');
checkReflectionsAndSinks(Array.from(inputs));
```

### Step 4: Deep Recon

```javascript
scanJavascriptURIs();
mapOpenRedirectChains();
detectPrototypePollutionChains();
```

### Step 5: Full Report

```javascript
generateFullReconReport();
```

---

## File Structure

```
Dom-Sink-Mapper.js
├── Settings + Utilities (escapeHTML, escapeCSV)
├── Core Mapping (checkReflectionsAndSinks)
├── Element Extraction & Analysis
├── Reflection Detection (body, DOM, attribute, text)
├── Sink Detection (critical, high, medium, low)
├── MutationObserver monitoring
├── DOM Sink Catalog (categorized by risk)
├── Output Module (console, JSON, CSV, UI overlay)
├── 20 Deep Analysis Functions (window.* exposed)
├── Network sink patching (eval, setTimeout, setInterval, Function)
└── Export (JSON, CSV, HTML)
```
