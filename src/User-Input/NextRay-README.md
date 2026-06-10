# NextRay - Console Validation & Exploit Helper

A single-snippet toolkit for discovering, profiling, and fuzzing web application inputs to uncover client-side validation bypasses and reflection-based vulnerabilities like XSS, SQLi, and SSTI. Also includes 10 passive security scans for CORS, debug endpoints, mixed content, framework patterns, and more.

**No extensions. No build steps. Pure console-native execution.**

---

## Quick Start

### Method 1: Console Paste

1. Open the target website
2. Open DevTools (**F12**) → **Console** tab
3. Paste the entire contents of `NextRay.js`
4. Press **Enter** — prints version + ready message

### Method 2: Browser Snippet

1. DevTools → **Sources** → **Snippets** panel
2. Click **New snippet**, paste, save as `NextRay.js`
3. Run anytime with **Ctrl+Enter**

### First Command

```javascript
NextRay.help();   // Print full command list
```

---

## Operating Modes

| Mode | Network Requests | What it does |
|------|-----------------|--------------|
| `passive` | None | Analyzes DOM + client-side validation. Builds character acceptance matrix. Stealthy. |
| `active` | Yes | Sends safe test payloads, checks for server-side reflections, classifies reflection context. |
| `heavy` | Yes | Expands active mode with 17 encoding bypasses (URL, Base64, UTF-7, JSFuck, overlong UTF-8, null bytes, etc.) |

---

## Full API Reference

### Core Commands

| Command | Description |
|---------|-------------|
| `NextRay.run(options)` | Run a scan with the given options |
| `NextRay.report()` | Display prioritized summary table in console |
| `NextRay.exportJSON()` | Download complete findings as JSON file |
| `NextRay.help()` | Print all available commands |

### Configuration Options

```javascript
NextRay.run({
  mode: 'passive',           // 'passive' | 'active' | 'heavy'
  scope: 'document',         // 'document' or CSS selector (e.g., '#login-form')
  maxPerInput: 20,           // Max fuzzing payloads per input
  submitTimeoutMs: 8000,     // Timeout for network submissions
  includeContentEditable: true,
  includeHidden: true,
});
```

### Scan Configuration Breakdown

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | `'passive'` | Scan intensity level |
| `scope` | string | `'document'` | Root element to scan |
| `maxPerInput` | number | `20` | Max payloads per input field |
| `submitTimeoutMs` | number | `8000` | Network timeout (ms) |
| `includeContentEditable` | boolean | `true` | Scan contenteditable elements |
| `includeHidden` | boolean | `true` | Scan hidden input fields |

---

## 10 Passive Security Scans

These scans run without sending network requests. Accessible individually via `NextRay.*`:

| Function | What it detects |
|----------|----------------|
| `NextRay.scanCORS()` | CORS-related patterns in scripts, HTTP links on HTTPS pages |
| `NextRay.scanDebugEndpoints()` | Debug paths (`/debug`, `/actuator`, `/.env`, `/swagger`, `/trace.axd`, etc.) in links + scripts |
| `NextRay.scanInfoDisclosure()` | Sensitive field names not masked as password, high-entropy hidden fields |
| `NextRay.scanFrameworkPatterns()` | jQuery `.html()`, Angular `ng-bind-html`, Vue `v-html`, React `dangerouslySetInnerHTML`, innerHTML assignment |
| `NextRay.scanMixedContent()` | HTTP resources loaded on HTTPS pages (scripts, links, images, iframes) |
| `NextRay.scanThirdPartyScripts()` | Third-party scripts + iframes (distinguishes known CDNs from unknown origins) |
| `NextRay.scanInsecureFormActions()` | Forms with `http:` action on HTTPS, `javascript:` action, `target="_blank"` without `rel="noopener"` |
| `NextRay.scanInlineScriptPatterns()` | `document.cookie`, localStorage/sessionStorage, clipboard access, WebSocket/EventSource, encoding functions |
| `NextRay.scanPasswordManagerRisks()` | Password fields with `autocomplete="off"`, password fields without username field |
| `NextRay.scanVulnerabilitySummary()` | Runs ALL 9 scans above, produces consolidated summary with per-category counts |

### Vulnerability Summary Output

```javascript
NextRay.scanVulnerabilitySummary();
// Prints:
// ┌────────────────┬──────────┐
// │ category       │ findings │
// ├────────────────┼──────────┤
// │ cors           │ 3        │
// │ debugEndpoints │ 1        │
// │ infoDisclosure │ 5        │
// │ framework      │ 2        │
// │ mixedContent   │ 0        │
// │ thirdParty     │ 4        │
// │ formActions    │ 1        │
// │ inlineScripts  │ 6        │
// │ passwordRisks  │ 2        │
// └────────────────┴──────────┘
// Total findings: 24
```

---

## Hardening & Reliability

### Safety Wrapper (`_NR_SAFE`)

All 10 scan functions are wrapped:

```javascript
_NR_SAFE = {
  MAX_ELEMENTS: 5000,        // Cap on querySelectorAll results
  domReady(),                // Checks document.body exists
  queryAll(selector, limit), // Capped querySelectorAll with error handling
  safe(fn, label),           // try/catch — returns undefined on failure
  safeArr(fn, label),        // try/catch — returns [] on failure
}
```

### What was fixed

| Issue | Fix |
|-------|-----|
| Empty DOM crashes | `_NR_SAFE.domReady()` guard at top of every scan |
| Browser freeze on huge pages | `MAX_ELEMENTS` cap (5000) on all querySelectorAll |
| `scanVulnerabilitySummary` single-failure kills all | Each sub-scan wrapped in individual `try/catch` |
| Unhandled errors in element loops | Inner `try/catch` on every `forEach` iteration |
| Cross-origin URL parsing | `try/catch` around `new URL()` calls |

---

## Bug Hunting Workflow

### Step 1: Passive Reconnaissance

```javascript
NextRay.run({ mode: 'passive' });
NextRay.report();
```

Map all inputs + client-side validation. Check `charMatrix` — inputs that allow `<`, `>`, `"`, `'` are top priority.

### Step 2: Security Scan

```javascript
NextRay.scanVulnerabilitySummary();
```

Get a full picture of CORS, debug endpoints, framework patterns, mixed content, and third-party scripts.

### Step 3: Active Probing (Specific Form)

```javascript
NextRay.run({ mode: 'active', scope: '#search-form' });
NextRay.report();
```

Test a specific form for server-side reflections.

### Step 4: Analyze Reflections

Examine `reflections` and `contexts` columns in the report:

| Context | What it means | Exploitation approach |
|---------|--------------|----------------------|
| `html_tag` | Input reflected in HTML body | `<img src=x onerror=alert(1)>` |
| `html_attr` | Input reflected in an attribute | Break out of attribute: `" onmouseover="alert(1)` |
| `js_block` | Input reflected inside `<script>` | Break out of string: `';alert(1);//` |
| `json` | Input reflected in JSON | Inject properties or break to code execution |

### Step 5: WAF Bypass with Heavy Mode

```javascript
NextRay.run({ mode: 'heavy' });
```

Tests 17 encoding bypasses (URL, double-URL, HTML entities, hex, Unicode, Base64, UTF-7, JSFuck, mixed case, null bytes, overlong UTF-8, etc.).

### Step 6: Document Findings

```javascript
NextRay.exportJSON();
```

Download the full analysis as a JSON file for your bug bounty report.

---

## Report Columns Explained

When you run `NextRay.report()`, the table shows:

| Column | Description |
|--------|-------------|
| **target** | CSS path to the input element |
| **name** | The `name` attribute (crucial for form submissions) |
| **type** | Input type (`text`, `hidden`, `email`, etc.) |
| **charMatrix** | Which special chars are accepted/blocked |
| **reflections** | Count of test payloads reflected in server response. **Higher = more promising.** |
| **errors** | Server/network errors encountered (may indicate unexpected behavior) |
| **contexts** | Where input was reflected (`html_tag`, `js_block`, `html_attr`, `json`). **Most important for exploitation.** |
| **suggestions** | Tailored next steps for manual testing |

---

## Heavy Mode Encoding Bypass Table

The `heavy` mode tests these encodings against WAFs/filters:

| Encoding | Example payload | Bypasses |
|----------|----------------|----------|
| URL | `%3Cscript%3E` | Basic URL encoding filters |
| Double URL | `%253Cscript%253E` | Double-decode bypasses |
| HTML Entity | `&#60;script&#62;` | HTML entity decoding |
| Hex | `\x3cscript\x3e` | JS hex escape sequences |
| Unicode | `\u003cscript\u003e` | JS unicode escapes |
| Base64 | `PHNjcmlwdD4=` | Base64 in data URIs |
| UTF-7 | `+ADw-script+AD4-` | Legacy encoding bypass |
| JSFuck | `[][(![]+[])[...]` | JS syntax obfuscation |
| Mixed Case | `<ScRiPt>` | Case-sensitive filters |
| Null Byte | `<scr%00ipt>` | Null byte truncation |
| Backspace | `<scr%08ipt>` | Control char injection |
| Tab/Newline | `<scr\tipt>` | Whitespace injection |
| Overlong UTF-8 | `%C0%BC` | Multi-byte overlong encoding |
| UTF-16 | `\xFF\xFE<\x00` | Wide char encoding |
| CharCode | `String.fromCharCode(60)` | JS function-based encoding |

---

## File Structure

```
src/User-Input/
├── NextRay.js                    (1890+ lines)
│   ├── Input discovery (forms, inputs, contenteditable)
│   ├── Validation profiling (character acceptance matrix)
│   ├── Payload generation (XSS, SQLi, SSTI, path traversal)
│   ├── Active reflection analysis + context classification
│   ├── Bypass suggestion engine
│   ├── JSON export
│   ├── 10 Passive security scans (hardened with _NR_SAFE wrapper)
│   └── Public API (window.NextRay)
├── NextRay-README.md
├── 🧠-Universal-User-Input-Extractor-Client-Side.js
├── 🧠-Universal-User-README.md
├── Universal-guide.txt
└── README.md
```

---

## Using Both Tools Together

The two tools are complementary:

| Tool | Strength | Use for |
|------|----------|---------|
| **Universal-User** | Deep input mapping, handler tracing, network correlation, dynamic monitoring | Full attack surface mapping, XSS sink analysis, live SPA monitoring |
| **NextRay** | Validation profiling, payload fuzzing, reflection context classification, WAF bypass | Targeted exploitation, finding injection points, testing encoding bypasses |

### Recommended workflow:

```javascript
// 1. Map the full attack surface
runAllCoreFunctionsRobust();

// 2. Identify dangerous inputs
detectDangerousSinks();
filterReflections({ dangerousOnly: true });

// 3. Profile validation on interesting inputs
NextRay.run({ mode: 'passive', scope: '#interesting-form' });

// 4. Test for reflections
NextRay.run({ mode: 'active', scope: '#interesting-form' });

// 5. Try WAF bypasses if blocked
NextRay.run({ mode: 'heavy', scope: '#interesting-form' });

// 6. Get the full security picture
NextRay.scanVulnerabilitySummary();

// 7. Export everything
exportSecurityData('json');
NextRay.exportJSON();
```
