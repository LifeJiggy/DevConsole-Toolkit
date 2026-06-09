# DOM Reflection & Sink Recon Checker

A client-side DevTools console tool for bug bounty mapping of user-specified interactive elements. Outputs yes/no for reflections (body/DOM) and sinks, with state/values for further analysis. Designed for the **mapping phase** — map context, then analyze specific elements.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Dom-Sink-Recon-Checker.js`
4. Press **Enter** — the banner UI appears

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `Recon-Checker.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Extract Interactive Elements | Context for analysis |
| 2 | Map Event Listeners & Handlers | Context for analysis |
| 3 | Check Reflections in Body/DOM | Manual via `checkReflectionsAndSinks` |
| 4 | Check Sinks in DOM | Manual via `checkReflectionsAndSinks` |
| 5 | Monitor DOM Mutations | Context for analysis |

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
| `checkReflectionsAndSinks(elements)` | Analyze specific elements — returns yes/no for reflections and sinks |
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

### Step 1: Extract Context

```javascript
// Run feature 1 — extract all interactive elements for context
```

### Step 2: Map Event Handlers

```javascript
// Run feature 2 — map all event triggers, listeners, handlers
```

### Step 3: Check Your Elements

```javascript
const inputs = document.querySelectorAll('input[type="text"]');
checkReflectionsAndSinks(Array.from(inputs));
// Returns: { reflections: [...], sinks: [...], hasReflection: true/false, hasSinks: true/false }
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
Dom-Sink-Recon-Checker.js
├── Settings + Utilities (escapeHTML, escapeCSV)
├── Core Analysis (checkReflectionsAndSinks)
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
