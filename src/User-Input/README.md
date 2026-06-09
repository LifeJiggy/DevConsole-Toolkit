# User-Input Security Toolkit

Client-side browser console tools for discovering, mapping, analyzing, and exploiting user inputs on web applications. Designed for security researchers, bug bounty hunters, and developers doing security audits.

**No extensions. No build steps. Paste into browser console.**

---

## Tools

| File | Lines | Purpose |
|------|-------|---------|
| `🧠-Universal-User-Input-Extractor-Client-Side.js` | 4900+ | Full attack surface mapping — discovers all inputs, traces handlers to source code, correlates inputs to network requests, detects XSS/injection sinks, monitors dynamic content, generates security reports |
| `NextRay.js` | 1840+ | Validation profiling + exploitation helper — character acceptance matrix, payload fuzzing (XSS/SQLi/SSTI), reflection context classification, WAF bypass encoding, 10 passive security scans |

### Which tool to use?

| Task | Tool |
|------|------|
| Map all inputs on a page | Universal-User |
| Trace event handlers to source code | Universal-User |
| Correlate inputs → network requests | Universal-User |
| Detect dangerous DOM sinks (eval, innerHTML) | Universal-User |
| Monitor SPAs for dynamic inputs | Universal-User |
| Profile client-side validation (char matrix) | NextRay |
| Fuzz inputs with XSS/SQLi payloads | NextRay |
| Test WAF bypasses (17 encodings) | NextRay |
| Classify reflection context (html_tag, js_block) | NextRay |
| Scan CORS/debug endpoints/framework patterns | NextRay |
| Generate exploit suggestions | Universal-User |

### Using both together

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

---

## Quick Start

1. Open target website
2. Open DevTools (**F12**) → **Console**
3. Paste the desired tool → **Enter**
4. Type `showAvailableFunctions()` (Universal-User) or `NextRay.help()` (NextRay)

---

## Shared Architecture

Both files share these patterns:

- **try/catch hardened** — every function wrapped in safety layer (`_HARDEN` / `_NR_SAFE`)
- **DOM-ready guards** — functions check `document.body` exists before querying
- **Element limits** — `querySelectorAll` capped at 5000 results to prevent browser freeze
- **Regex statefulness fix** — fresh RegExp copies per match (no sticky `lastIndex`)
- **Inner loop protection** — individual `try/catch` in every `forEach` element loop

---

## Files in this folder

```
src/User-Input/
├── README.md                                    ← You are here
├── 🧠-Universal-User-Input-Extractor-Client-Side.js   ← Main analysis tool
├── 🧠-Universal-User-README.md                 ← Universal-User docs
├── NextRay.js                                   ← Validation/exploit helper
├── NextRay-README.md                            ← NextRay docs
└── Universal-guide.txt                          ← Quick reference guide
```
