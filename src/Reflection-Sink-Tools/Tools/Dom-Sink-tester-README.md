# DOM Reflection & Sink Tester

A client-side DevTools console tool that injects unique payloads into input fields and searches the DOM for reflections in dangerous sinks. Tests for DOM-based XSS via input reflection, hash reflection, URL params, cookies, storage, event handlers, and advanced vectors. Includes 40 testing functions.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Dom-Sink-tester.js`
4. Press **Enter** — tool loads
5. Call `findReflections()` to run the core test

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `Tester.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

### Core Test

| Function | Description |
|----------|-------------|
| `findReflections()` | Injects unique payload into all text inputs, dispatches events, searches DOM for reflections in innerHTML, attributes, text nodes, and script blocks |

### Basic Testing (1-20)

| Function | What it tests |
|----------|--------------|
| `testHashReflection()` | Test `#payload` hash reflection in DOM |
| `testURLParamReflection()` | Test `?q=payload` URL param reflection |
| `detectJavascriptURI()` | Detect `href="javascript:..."` links |
| `detectSinks(elements)` | Detect dangerous sinks on elements |
| `watchForDelayedReflections(duration)` | Watch for async/delayed reflections |
| `testCookieReflection()` | Test if cookie values reflect in DOM |
| `testStorageReflection()` | Test if localStorage/sessionStorage values reflect |
| `checkDOMClobbering()` | Detect DOM clobbering via name/id attributes |
| `auditEventHandlers()` | Audit inline `on*` event handlers |
| `detectTemplatePatterns()` | Detect template injection patterns |
| `checkCSP()` | Analyze Content Security Policy |
| `checkPostMessageHandlers()` | Map `postMessage` listeners |
| `detectFrameworks()` | Detect jQuery, React, Vue, Angular |
| `detectDangerousTags()` | Find `<iframe>`, `<embed>`, `<object>` |
| `generatePoC(sinkType)` | Auto-generate XSS PoC |
| `checkCSSExfiltration()` | Find CSS exfiltration vectors |
| `detectContentEditable()` | Find `contenteditable` elements |
| `exportResults(results, format)` | Export results as JSON/CSV |
| `restoreAllValues()` | Restore original input values |
| `fullTestSuite()` | Run all basic tests |

### Advanced Testing (21-40)

| Function | What it tests |
|----------|--------------|
| `testFormActionXSS()` | Test form action attributes for XSS |
| `detectEncodedSinks()` | Detect URL-encoded/HTML-encoded payloads in sinks |
| `testPostMessageSink()` | Test postMessage handler for XSS |
| `scanForOpenRedirects()` | Scan for open redirect parameters |
| `testAttributeInjection()` | Test attribute injection on elements |
| `detectDangerousCSSSinks()` | Detect dangerous CSS url()/expression() |
| `auditStorageSinkChains()` | Audit localStorage → DOM sink chains |
| `testBaseTagHijack()` | Test `<base>` tag hijacking |
| `detectServiceWorkerSinks()` | Detect service worker XSS vectors |
| `testPrototypePollution()` | Test prototype pollution via `__proto__` |
| `scanXSSVectors()` | Comprehensive XSS vector scan |
| `testDOMParserXSS()` | Test DOMParser-based XSS |
| `detectMixedContent()` | Detect HTTP resources on HTTPS |
| `testURLValidationBypass()` | Test URL validation bypass payloads |
| `scanClickjackingTargets()` | Find clickjackable targets |
| `testStorageXSSDeepChain()` | Deep chain: storage → script → DOM |
| `detectCSPViolations()` | Detect CSP violation reports |
| `auditRedirectChains()` | Audit full redirect chains |
| `testDocumentWriteSink()` | Test `document.write()` sink |
| `generateSecurityReport()` | Generate comprehensive security report |

---

## API Reference

### Quick Functions

| Function | Description |
|----------|-------------|
| `findReflections()` | Core reflection test |
| `fullTestSuite()` | Run all 20 basic tests |
| `generateSecurityReport()` | Full security report (40 tests) |
| `restoreAllValues()` | Restore all input values |

### Export

| Function | Description |
|----------|-------------|
| `exportResults(results, format)` | Export as `"json"` or `"csv"` |

---

## Bug Hunting Workflow

### Step 1: Core Reflection Test

```javascript
findReflections();
```

### Step 2: Quick Scan

```javascript
fullTestSuite();
```

### Step 3: Targeted Tests

```javascript
testHashReflection();
testURLParamReflection();
detectJavascriptURI();
testCookieReflection();
```

### Step 4: Advanced Vectors

```javascript
testPrototypePollution();
scanXSSVectors();
testDOMParserXSS();
testStorageXSSDeepChain();
```

### Step 5: Full Report

```javascript
generateSecurityReport();
// View: window.lastSecurityReport
```

---

## File Structure

```
Dom-Sink-tester.js
├── Helper (escapeHTML)
├── Core Test (findReflections)
├── Payload Injection & Event Dispatch
├── Reflection Detection (innerHTML, attribute, text, script)
├── 20 Basic Testing Functions (window.* exposed)
├── 20 Advanced Testing Functions (window.* exposed)
├── Export (JSON, CSV)
├── Value Restore (restoreAllValues)
└── Full Test Suite & Report Generator
```
