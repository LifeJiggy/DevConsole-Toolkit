# XSS Reflection Vulnerability Tester

A client-side DevTools console tool for expert XSS security testing. Tests interactive elements for DOM-based XSS sinks with comprehensive payload libraries, deep reflection scanning, runtime behavior analysis, and 40 testing functions. Designed for the **testing phase** of bug bounty hunting.

**No extensions. No build steps. Pure console-native power.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `Xss-Tester.js`
4. Press **Enter** — the tool loads with banner

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets**
2. New snippet → paste → save as `Xss-Tester.js`
3. Run anytime with **Ctrl+Enter**

---

## Core Features

### XSS Payload Libraries

| Category | Payloads |
|----------|----------|
| **Basic** | `<script>alert("XSS")</script>`, `<img src=x onerror=alert("XSS")>`, `<svg onload=alert("XSS")>`, `javascript:alert("XSS")`, etc. |
| **Event-Based** | `onload`, `onerror`, `onclick`, `onmouseover`, `onfocus`, `onblur`, `onchange`, `onsubmit` |
| **Advanced** | `document.body.innerHTML`, `document.location`, `<svg><script>`, `<iframe srcdoc>`, `<object data>`, `<embed src>` |
| **Encoded** | URL-encoded, HTML-entity-encoded, double-encoded, Unicode escapes |
| **Context-Specific** | Attribute-breaking, script-context, HTML-context, URL-context |

### Core Testing (1-20)

| Function | What it tests |
|----------|--------------|
| `checkElementReflection(elements, testType)` | Comprehensive reflection test on elements |
| `testInteractiveElements(testType)` | Auto-test all interactive elements |
| `quickXSSTest()` | Quick XSS scan of page |
| `testSpecificElement(selector)` | Test a specific element by CSS selector |
| `performDeepReflectionScan()` | Deep scan for hidden reflections |
| `exportReflectionResults(format)` | Export results as JSON/CSV |
| `showXSSTestHelp()` | Show help for all commands |
| `testHashXSS()` | Test hash-based XSS |
| `watchForXSSReflections(duration)` | Watch for delayed reflections |
| `scanClobberingXSS()` | Scan for DOM clobbering XSS |
| `testJavascriptURI()` | Test javascript: URI XSS |
| `testCookieXSS()` | Test cookie-based XSS |
| `testStorageXSS()` | Test localStorage/sessionStorage XSS |
| `assessCSPBypass()` | Assess CSP bypass possibilities |
| `testPostMessageXSS()` | Test postMessage XSS |
| `testTemplateInjectionXSS()` | Test template injection XSS |
| `scanShadowDOMXSS()` | Scan Shadow DOM for XSS |
| `detectDangerousAttributes()` | Detect dangerous attributes |
| `detectOpenRedirectXSS()` | Detect open redirect XSS |
| `detectIframeXSS()` | Detect iframe-based XSS |

### Advanced Testing (21-40)

| Function | What it tests |
|----------|--------------|
| `detectBaseTagHijack()` | Detect `<base>` tag hijacking |
| `checkServiceWorkerXSS()` | Check service worker XSS |
| `detectWAF()` | Detect WAF/CDN protection |
| `detectFrameworkSinks()` | Detect framework-specific sinks |
| `exportXSSReport(results)` | Export full XSS report |
| `generateXSSPoCURL(sink, context)` | Generate XSS PoC URL |
| `fullXSSAudit()` | Run full XSS audit |
| `testFormActionXSSDeep()` | Deep form action XSS test |
| `scanEncodedSinksXSS()` | Scan encoded sinks |
| `testPostMessageXSSChain()` | Test postMessage XSS chain |
| `detectOpenRedirectChains()` | Detect open redirect chains |
| `testAttributeInjectionXSS()` | Test attribute injection XSS |
| `detectDangerousCSSSinksXSS()` | Detect dangerous CSS sinks |
| `auditStorageToDOMChainsXSS()` | Audit storage → DOM chains |
| `testBaseTagXSS()` | Test base tag XSS |
| `detectServiceWorkerXSSChainsXSS()` | Detect service worker XSS chains |
| `testPrototypePollutionXSS()` | Test prototype pollution XSS |
| `scanExistingXSSVectorsXSS()` | Scan existing XSS vectors |
| `testDOMParserXSSChainXSS()` | Test DOMParser XSS chain |
| `detectMixedContentVulnerabilitiesXSS()` | Detect mixed content vulnerabilities |
| `testURLValidationBypassXSS()` | Test URL validation bypass |

---

## API Reference

### Quick Functions

| Function | Description |
|----------|-------------|
| `quickXSSTest()` | Quick page-wide XSS scan |
| `testSpecificElement(selector)` | Test element by CSS selector |
| `fullXSSAudit()` | Full 40-test XSS audit |
| `showXSSTestHelp()` | Show help for all commands |

### Export

| Function | Description |
|----------|-------------|
| `exportReflectionResults(format)` | Export as `"json"` or `"csv"` |
| `exportXSSReport(results)` | Export full XSS report |

### Global Storage

```javascript
window.xssReflectionTester = {
  results: {},              // Test results
  testPayloads: [],         // Payloads used
  sinkElements: [],         // Elements with sinks
  vulnerableElements: [],   // Confirmed vulnerable elements
};
```

---

## Bug Hunting Workflow

### Step 1: Quick Scan

```javascript
quickXSSTest();
```

### Step 2: Test Specific Element

```javascript
testSpecificElement('input[name="q"]');
```

### Step 3: Deep Scan

```javascript
performDeepReflectionScan();
testHashXSS();
testCookieXSS();
testStorageXSS();
```

### Step 4: Advanced Vectors

```javascript
testPrototypePollutionXSS();
scanEncodedSinksXSS();
testPostMessageXSSChain();
testDOMParserXSSChainXSS();
```

### Step 5: Full Audit

```javascript
fullXSSAudit();
// View: window.lastXSSAudit
exportXSSReport(window.lastXSSAudit);
```

---

## File Structure

```
Xss-Tester.js
├── Helper (escapeHTML)
├── Global Storage (window.xssReflectionTester)
├── Console Styling (styles object)
├── XSS Payload Libraries (basic, event-based, advanced, encoded, context-specific)
├── Core Testing Functions (checkElementReflection, testSingleElement)
├── Sink Detection (checkDOMSinks)
├── Payload Testing (testReflectionPayloads, testPayloadReflection)
├── Reflection Tests (value, innerHTML, attribute, textContent)
├── Vulnerability Check (checkExistingVulnerabilities)
├── Results Display (displayResults)
├── Element Info Extraction (extractElementInfo, getXPath)
├── 20 Basic Testing Functions (window.* exposed)
├── 20 Advanced Testing Functions (window.* exposed)
├── Export (JSON, CSV, HTML)
└── Help System (showXSSTestHelp)
```
