# DOM Reflection & Sink Analyzer

A client-side DevTools console tool that analyzes interactive elements for reflections and dangerous sinks. Extracts elements, maps event triggers/listeners, checks DOM reflections, identifies sinks, monitors DOM mutations, and provides deep security analysis with auto-generated PoCs.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Dom-Sink-Analyzer.js`
4. Press **Enter** — the banner UI appears

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `Analyzer.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Extract Interactive Elements | Forms, inputs, buttons, links with attributes |
| 2 | Map Event Triggers, Listeners & Handlers | All event bindings on elements |
| 3 | Check Reflections in DOM/Body | URL params, innerHTML, textContent |
| 4 | Identify Dangerous Sinks | eval, innerHTML, document.write, location |
| 5 | Monitor DOM Mutations | Real-time MutationObserver for changes |

### Deep Analysis Features (20)

| Function | What it does |
|----------|-------------|
| `detectJavascriptURIs()` | Find `href="javascript:..."` links |
| `detectDOMClobbering()` | Detect name/id attributes that override DOM globals |
| `analyzeCSP()` | Analyze Content Security Policy headers |
| `auditAllEventHandlers()` | Scan all inline `on*` event handlers |
| `detectOpenRedirects()` | Find redirect params with external URLs |
| `auditPostMessageHandlers()` | Map `postMessage` listeners and origins |
| `detectAllFrameworks()` | Detect jQuery, React, Vue, Angular, etc. |
| `scanDangerousTags()` | Find `<iframe>`, `<embed>`, `<object>`, `<applet>` |
| `detectPrototypePollution()` | Find `__proto__`, `constructor[]` patterns |
| `analyzeStorageSinkChains()` | Map localStorage/sessionStorage → DOM flows |
| `detectCSSExfiltration()` | Find CSS `url()` and `expression()` exfil vectors |
| `detectContenteditableXSS()` | Find `contenteditable` elements with XSS risk |
| `detectMixedContent()` | HTTP resources on HTTPS pages |
| `generateAutoPoC(sinkType)` | Auto-generate XSS PoC for a sink |
| `detectClickjacking()` | Find clickjackable iframes/forms |
| `auditRedirectChains()` | Map full redirect chains |
| `testURLValidationBypass()` | Test URL validation with bypass payloads |
| `analyzeDocumentWriteSink()` | Analyze `document.write()` call chains |
| `detectServiceWorkers()` | Find registered service workers |
| `generateXSSSummary()` | Comprehensive XSS risk summary |

---

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `checkReflectionsAndSinks(elements)` | Analyze specific elements for reflections and sinks |
| `detectJavascriptURIs()` | Scan for javascript: URI sinks |
| `detectDOMClobbering()` | Detect DOM clobbering vectors |
| `analyzeCSP()` | Analyze CSP protection |
| `auditAllEventHandlers()` | Audit all inline event handlers |
| `detectOpenRedirects()` | Find open redirect vulnerabilities |
| `auditPostMessageHandlers()` | Map postMessage attack surface |
| `detectAllFrameworks()` | Identify JS frameworks in use |
| `scanDangerousTags()` | Scan for dangerous HTML tags |
| `detectPrototypePollution()` | Detect prototype pollution patterns |
| `analyzeStorageSinkChains()` | Map storage-to-DOM data flows |
| `detectCSSExfiltration()` | Find CSS-based exfiltration vectors |
| `detectContenteditableXSS()` | Find contenteditable XSS risks |
| `detectMixedContent()` | Detect mixed content issues |
| `generateAutoPoC(sinkType)` | Auto-generate XSS proof-of-concept |
| `detectClickjacking()` | Find clickjacking vulnerabilities |
| `auditRedirectChains()` | Audit redirect chains |
| `testURLValidationBypass()` | Test URL validation bypass |
| `analyzeDocumentWriteSink()` | Analyze document.write sinks |
| `detectServiceWorkers()` | Detect service workers |
| `generateXSSSummary()` | Generate full XSS summary report |

### Output & Export

| Function | Description |
|----------|-------------|
| `saveAllAsJson()` | Download all outputs as JSON |

---

## Bug Hunting Workflow

### Step 1: Extract Elements

```javascript
// Run full feature 1 — extract all interactive elements
// Use prompt: "all" for console + JSON + UI
```

### Step 2: Check Specific Elements

```javascript
const inputs = document.querySelectorAll('input[type="text"]');
checkReflectionsAndSinks(Array.from(inputs));
```

### Step 3: Deep Security Scan

```javascript
detectJavascriptURIs();
detectDOMClobbering();
analyzeCSP();
detectPrototypePollution();
```

### Step 4: Generate PoC

```javascript
generateAutoPoC("innerHTML");
```

### Step 5: Full Summary

```javascript
generateXSSSummary();
```

---

## File Structure

```
Dom-Sink-Analyzer.js
├── Settings + Utilities (escapeHTML, escapeCSV, handleOutput)
├── Core Analysis (checkReflectionsAndSinks)
├── Menu System (prompt-driven feature selection)
├── Output Module (console, JSON download, UI overlay)
├── 20 Deep Analysis Functions (window.* exposed)
└── MutationObserver monitoring
```
