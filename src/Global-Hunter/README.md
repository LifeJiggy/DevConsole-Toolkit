# Full-Global-JS-HUNTER

Hardened browser-based JavaScript vulnerability scanner. Paste into DevTools console, auto-collects all JS on the page, and reports vulnerabilities with exact file:line locations.

**Version:** 3.0 (Hardened Edition)  
**Status:** Educational / Authorized security testing only

---

## Quick Start

```js
// Full audit (all 53 classes + 20 modules)
await window.JSHunter.JSFILE.fullAudit()

// Pattern scan only
window.JSHunter.JSFILE.runScan(1)   // Instant (~100ms)
window.JSHunter.JSFILE.runScan(2)   // Fast (~15s)
window.JSHunter.JSFILE.runScan(3)   // Full (~30s+)

// Interactive mode
window.JSHunter.JSFILE.interactive()
```

---

## Export

```js
window.JSHunter.JSFILE.exportJSON()   // Download JSON
window.JSHunter.JSFILE.exportCSV()    // Download CSV
window.JSHunter.JSFILE.exportMD()     // Download Markdown
window.JSHunter.JSFILE.report()       // Download HTML
```

---

## 53 Vulnerability Classes

### Client-Side (8)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 1 | DOM-Based XSS | CRITICAL | innerHTML/document.write with location/search/hash |
| 2 | Code Execution | CRITICAL | eval/Function with user input |
| 3 | Event Handler Injection | HIGH | setAttribute("on...") with user code |
| 4 | Client-Side Injection | HIGH | Template injection into DOM sinks |
| 5 | PostMessage XSS | HIGH | message handler without origin check |
| 6 | Clickjacking | MEDIUM | opacity:0 iframes, missing frame-ancestors |
| 7 | Insecure Storage | MEDIUM | localStorage/sessionStorage usage |
| 8 | Insecure Random | MEDIUM | Math.random in security context |

### Auth & Access (8)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 9 | Broken Access Control | CRITICAL | Weak equality auth, missing owner check |
| 10 | IDOR | CRITICAL | User-controlled IDs in API endpoints |
| 11 | CSRF Token Bypass | HIGH | POST without CSRF token |
| 12 | OAuth/OIDC | CRITICAL | redirect_uri manipulation, missing state/PKCE |
| 13 | Type Coercion Bypass | CRITICAL | == instead of === on userId/role |
| 14 | JWT Manipulation | HIGH | alg:none, hardcoded tokens, localStorage storage |
| 15 | Password Reset | CRITICAL | Host header injection, predictable token |
| 16 | Timing Side-Channel | MEDIUM | Non-constant-time secret comparison |

### Injection (7)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 17 | SQL Injection | CRITICAL | Raw SQL with user input concatenation |
| 18 | NoSQL Injection | CRITICAL | MongoDB operator injection ($gt, $ne, $where) |
| 19 | Command Injection | CRITICAL | child_process with user input |
| 20 | SSTI | CRITICAL | User input in template render/compile |
| 21 | SSI Injection | CRITICAL | <!--#exec cmd= in user input |
| 22 | XXE | HIGH | DOMParser XML with external entities |
| 23 | Prototype Pollution | HIGH | __proto__ assignment, unsafe merge |

### Data & File (5)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 24 | Sensitive Data Exposure | CRITICAL | Hardcoded AKIA/sk_live/ghp_/JWT keys |
| 25 | Path Traversal | HIGH | fs operations with user-controlled path |
| 26 | Insecure File Download | HIGH | sendFile/createReadStream with user input |
| 27 | Insecure File Upload | HIGH | Missing file type validation |
| 28 | Deserialization | HIGH | vm.runInNewContext/yaml.load with user input |

### Network (6)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 29 | SSRF | HIGH | User-controlled URL in HTTP request |
| 30 | CORS Misconfiguration | MEDIUM | Wildcard + credentials, default cors() |
| 31 | CORS Origin Reflection | MEDIUM | Server reflects any Origin in ACAO |
| 32 | HTTP Header Injection | HIGH | CRLF in Set-Cookie/Location headers |
| 33 | Open Redirect | HIGH | User-controlled redirect destination |
| 34 | Client-Side Redirect | MEDIUM | URL params control redirect without validation |

### Frameworks (7)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 35 | React Security | CRITICAL | dangerouslySetInnerHTML with user input |
| 36 | Next.js Security | HIGH | SSR with user input, missing API auth |
| 37 | Vue.js Security | CRITICAL | v-html with user input |
| 38 | Angular Security | CRITICAL | bypassSecurityTrust*, [innerHTML] with input |
| 39 | Framework Deserialization | HIGH | JSON.parse of SSR data with user input |
| 40 | Modern Framework Injection | HIGH | Router/state injection with user input |
| 41 | Sandbox Escape | CRITICAL | vm.constructor.constructor escape to RCE |

### Node.js & Infra (8)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 42 | Node.js Security | MEDIUM | Hardcoded secrets, unsafe upload, eval in server |
| 43 | GraphQL Security | HIGH | Introspection enabled, missing depth limit |
| 44 | Business Logic | HIGH | Negative quantity, price manipulation |
| 45 | Race Condition | HIGH | Non-atomic balance/credit operations |
| 46 | ReDoS | MEDIUM | Catastrophic backtracking in user regex |
| 47 | Log Injection | MEDIUM | Unsanitized user input in logger |
| 48 | Memory Safety | HIGH | Unbounded Buffer operations |
| 49 | SRI Bypass | MEDIUM | Dynamic script loading without integrity |

### Cloud & Web3 (4)
| # | Class | Severity | What It Catches |
|---|-------|----------|----------------|
| 50 | Serverless Security | HIGH | Lambda env vars, unsafe handler |
| 51 | Container Security | HIGH | Docker escape, kubectl exposure |
| 52 | Web3 Security | CRITICAL | Hardcoded private keys, tx manipulation |
| 53 | Supply Chain Security | HIGH | Malicious require, prototype pollution |

---

## 20 Audit Modules

| # | Module | Method | What It Does |
|---|--------|--------|-------------|
| 1 | DOM Security Audit | `dom()` | XSS sinks in DOM elements (onerror, formaction, etc.) |
| 2 | CSP Header Analysis | `csp()` | unsafe-inline/eval/wildcard detection |
| 3 | Cookie Security | `cookies()` | Sensitive data, JWTs, base64 in cookies |
| 4 | Storage Scan | `storage()` | localStorage/sessionStorage for tokens/passwords |
| 5 | Open Redirect | `redirects()` | Redirect parameter scanning |
| 6 | Mixed Content | `mixed()` | HTTP resources on HTTPS pages |
| 7 | SRI Check | `sri()` | Missing integrity attributes |
| 8 | WebSocket Audit | `ws()` | ws:// and cross-origin connections |
| 9 | Third-Party Risk | `thirdParty()` | Origin reputation scoring |
| 10 | DOM Clobbering | `clobbering()` | id/name shadowing globals |
| 11 | Form Security | `forms()` | HTTP actions, missing CSRF tokens |
| 12 | iframe Security | `iframes()` | Sandbox, permissions, mixed content |
| 13 | JavaScript URLs | `jsURLs()` | javascript: URI detection |
| 14 | URL Extractor | `urls()` | API/admin/debug/cloud categorization |
| 15 | Permission Monitor | `permissions()` | Geolocation/clipboard/notification hooks |
| 16 | HTML Report | `report()` | Downloadable styled report |
| 17 | Scan Diff | `diff()` | Compare with previous scan |
| 18 | Exploit Payloads | `exploits()` | PoC for critical findings |
| 19 | Dependency Graph | `graph()` | Script load chain mapping |
| 20 | DOM Monitor | `monitor(cb)` | Real-time injection detection |

---

## Export Formats

| Format | Method | What You Get |
|--------|--------|-------------|
| JSON | `exportJSON()` | Structured data with summary + all findings |
| CSV | `exportCSV()` | Spreadsheet-ready with severity, source, line, code |
| Markdown | `exportMD()` | Formatted report with code blocks and severity badges |
| HTML | `report()` | Styled dark-theme report with findings table |

All exports auto-download as files named `security-audit-{hostname}-{timestamp}.{ext}`.

---

## Utilities

```js
// Search by vulnerability class
window.JSHunter.searchVulnerability("DOM-Based XSS")

// Get source code context
window.JSHunter.getSourceCode("app.js", 42, 5)

// Get fix suggestions
window.JSHunter.getFixSuggestions("SQL Injection")

// List all 53 classes
window.JSHunter.JSFILE.features

// Configuration
window.JSHunter.updateConfig({ quiet: true, maxFetchTimeout: 3000 })

// Previous scan results
window.INSTANT_REPORT
window.HUNT_REPORT
window.FULL_AUDIT
```

---

## Architecture

```
CompleteJSVulnHunter
├── Script Collection
│   ├── Inline scripts (direct DOM)
│   ├── Same-origin fetch (CORS-safe)
│   └── External blocked (logged, not fetched)
├── Pattern Matching (53 classes)
│   ├── Pre-compiled regex cache
│   ├── Source→sink validation
│   └── Comment/string-aware filtering
├── 20 Audit Modules
│   ├── DOM element scanning
│   ├── CSP/Cookie/Storage analysis
│   ├── Third-party risk scoring
│   ├── WebSocket/Permission hooks
│   └── MutationObserver monitoring
├── Confidence Scoring
│   ├── Pattern specificity
│   ├── Context analysis
│   └── Exploitability assessment
└── Export
    ├── JSON (structured data)
    ├── CSV (spreadsheet)
    ├── Markdown (formatted report)
    └── HTML (styled dark-theme)
```

---

## Security Hardening (v3.0)

| Fix | Issue |
|-----|-------|
| Whitelist-only `updateConfig` | Prototype pollution via Object.assign |
| Gated script injection | Auto-execution of untrusted scripts |
| URL validation + SSRF blocklist | Internal IP fetching |
| `crypto.getRandomValues` | Predictable JSONP callback names |
| Script size limits | Memory exhaustion DoS |
| Cached regex patterns | Hot-path performance |
| Map-based dedup | O(n) findIndex elimination |
| Configurable timeouts | Hardcoded values |

---

## Files

```
src/Global-Hunter/
├── Full-Global-JS-HUNTER.js   # Main scanner (~240KB)
├── Full-Global-usage.md        # Usage guide
└── README.md                   # This file
```

---

## Disclaimer

For educational and authorized security testing only. Unauthorized use against systems you don't own or have permission to test is illegal. Use responsibly.
