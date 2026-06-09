# DOM Sink & Reflection Mapper (Recon)

A client-side DevTools console tool for **pure DOM-based XSS reconnaissance**. Maps reflection patterns, catalogs DOM sinks, analyzes source-to-sink data flows, and provides comprehensive security reporting. **NO TESTING — PURE RECONNAISSANCE.**

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Dom-Sink-Recon.js`
4. Press **Enter** — the recon begins

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `Recon.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

### DOM Sink Catalog

Categorized by risk level:

| Category | Sinks |
|----------|-------|
| **CRITICAL** | `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `document.writeln` |
| **HIGH** | `eval()`, `Function()`, `setTimeout(string)`, `setInterval(string)`, `location.*`, `window.open()` |
| **MEDIUM** | `$.html()`, `element.insertAdjacentElement()`, template literals with HTML |
| **LOW** | `textContent`, `innerText`, `setAttribute()` with dynamic values |

### Reflection Detection

| Type | What it checks |
|------|---------------|
| Body reflection | Values found in document.body.innerHTML |
| DOM reflection | Values found in element attributes/text |
| Attribute reflection | Values reflected in element attributes |
| Text reflection | Values found in text nodes |
| Value reflection | Values reflected in input values |

### Analysis Features

| Function | What it does |
|----------|-------------|
| `mapElementReflection(elements)` | Map reflections for specific elements |
| `inspectElement(selector)` | Deep inspect a specific element by CSS selector |
| `exportReconResults(format)` | Export results as JSON or CSV |
| `showReconHelp()` | Show help for all commands |
| `generateComprehensiveReport()` | Full recon report with recommendations |
| `analyzeSourceToSink()` | Map source → sink data flows |
| `analyzeCSP()` | Analyze Content Security Policy |

### MutationObserver

- `window.domMutationObserver` — monitors DOM changes in real-time
- Detects new elements, attribute changes, removed nodes
- Logs mutation type, target, added/removed nodes

---

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `mapElementReflection(elements)` | Map reflections and sinks for specific elements |
| `inspectElement(selector)` | Deep inspect an element by CSS selector |
| `generateComprehensiveReport()` | Full recon report |
| `analyzeSourceToSink()` | Map source → sink data flows |
| `analyzeCSP()` | Analyze CSP headers |

### Export Functions

| Function | Description |
|----------|-------------|
| `exportReconResults(format)` | Export as `"json"` or `"csv"` |
| `showReconHelp()` | Show help for all commands |

### Global Storage

```javascript
window.domSinkMapper = {
  mappedElements: [],      // All mapped elements
  reflectionMap: {},       // Reflection data per element
  sinkMap: {},             // Sink data per element
  reconnaissance: {},      // Recon analysis results
};
```

---

## Bug Hunting Workflow

### Step 1: Map Element Reflections

```javascript
const inputs = document.querySelectorAll('input, textarea, select');
mapElementReflection(Array.from(inputs));
```

### Step 2: Inspect Specific Elements

```javascript
inspectElement('input[name="search"]');
```

### Step 3: Analyze Source-to-Sink Flows

```javascript
analyzeSourceToSink();
```

### Step 4: Check CSP

```javascript
analyzeCSP();
```

### Step 5: Full Report

```javascript
generateComprehensiveReport();
exportReconResults("json");
```

---

## File Structure

```
Dom-Sink-Recon.js
├── Settings + Utilities (escapeHTML, escapeCSV)
├── Global Storage (window.domSinkMapper)
├── Console Styling (styles object)
├── DOM Sink Catalog (categorized by risk)
├── Element Mapping (mapElementReflection)
├── Reflection Detection (body, DOM, attribute, text, value)
├── Data Flow Analysis (analyzeDataFlow)
├── Security Profile Generation
├── XPath Generation
├── Summary Generators (sink, reflection, data flow)
├── Results Display (console, table)
├── Inspection (inspectElement)
├── Export (JSON, CSV, HTML)
├── MutationObserver (window.domMutationObserver)
├── Advanced Sink Detection
├── Gadget Chain Detection
├── CSP Analysis
├── Source-to-Sink Flow Mapping
├── Comprehensive Report Generator
├── Security Dashboard
├── Auto Scanner
├── Batch Processing
├── 20 Deep Recon Functions (window.* exposed)
└── Help System (showReconHelp)
```
