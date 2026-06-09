# Gold-Digger.js — P1 Disclosure Extractor

A standalone browser console tool for finding sensitive disclosures in the current page's JavaScript and DOM. Uses entropy-based detection, obfuscation analysis, JWT decoding, and 50+ pattern categories.

## Quick Start

1. Open DevTools (F12) on any target website
2. Go to **Console** tab
3. Paste the entire `Gold-Digger.js` file and press Enter
4. Auto-runs all scans and displays results

```js
// Results are in the `findings` variable
findings.secrets          // Discovered secrets
findings.endpoints        // API endpoints
findings.debugInfo        // Debug information

// Enhancement functions
GOLD.scoreFindings();        // Risk scoring
GOLD.crossReference();       // Cross-ref secrets with endpoints
GOLD.analyzeJWTs();          // JWT deep analysis
GOLD.fingerprintTech();      // Technology detection
GOLD.complianceReport();     // OWASP mapping
GOLD.riskDashboard();        // Summary dashboard
GOLD.diffScan();             // Compare with previous run
GOLD.remediationReport();    // Fix recommendations
GOLD_CLEANUP();              // Restore prototypes
```

## Core Scanning Functions

### scanForEntropySecrets(text, source)
Shannon entropy-based secret detection.
- Calculates character frequency distribution
- Computes entropy in bits
- Flags high-entropy strings (>4.5 bits) as potential secrets
- Filters out common false positives (CSS, HTML attributes)

### scanForObfuscation(text, source)
Detects code obfuscation techniques.
- Base64-encoded strings (with decode attempt)
- Hex-encoded strings
- Character code arrays (`String.fromCharCode`)
- eval() and Function() usage
- Unicode escape sequences

### scanForExtraSecrets(text, source)
50+ pattern categories for secret detection.
- API keys (AWS, Azure, GCP, GitHub, GitLab, Stripe, Twilio, SendGrid)
- Database connection strings (MySQL, PostgreSQL, MongoDB, Redis)
- Private keys (RSA, PGP, SSH)
- Bearer tokens and JWTs
- Passwords in code (`password =`, `passwd =`, `secret =`)
- Internal URLs and paths

### scanForCodeRisks(text, source)
Identifies dangerous code patterns.
- DOM XSS sinks (innerHTML, document.write, eval)
- Dynamic code execution (Function, setTimeout with strings)
- Prototype pollution vectors
- Dangerous URL constructors
- Unvalidated redirects

### scanForSecrets(text, source)
Core secret detection with high-confidence patterns.
- AWS Access Keys (`AKIA[0-9A-Z]{16}`)
- JWT tokens (`eyJ...`)
- GitHub tokens (`ghp_...`, `gho_...`)
- Stripe keys (`sk_live_...`, `pk_live_...`)
- Database URLs (`mysql://`, `postgresql://`, `mongodb://`)
- Private keys (`-----BEGIN.*PRIVATE KEY-----`)

### scanForEndpoints(text, source)
Discovers API endpoints and routes.
- REST patterns (`/api/`, `/v1/`, `/v2/`)
- Admin routes (`/admin`, `/dashboard`, `/wp-admin`)
- GraphQL endpoints
- Internal microservice paths
- WebSocket URLs

### scanForDebugInfo(text, source)
Finds debug information and verbose errors.
- Debug flags (`debug=true`, `verbose=1`)
- Stack traces in comments
- Version disclosures
- Internal hostnames and IPs

### scanForConfigObjects(text, source)
Extracts configuration objects.
- Feature flags
- Environment settings
- Third-party service configs
- Build versions and timestamps

## Enhancement Functions (10)

### 1. scoreFindings()
Risk-scoring across all finding categories.
- CRITICAL=15, HIGH=10, MEDIUM=5, LOW=2, INFO=1
- Bonus for long values (>20 chars)
- Returns sorted table by score

### 2. crossReference()
Cross-references secrets with endpoints.
- Checks if secret values appear in endpoint URLs
- Flags HIGH risk when secrets leak in API paths
- Returns matched pairs

### 3. rankByEntropy()
Ranks all tokens by Shannon entropy.
- Calculates character frequency distribution
- Computes entropy in bits
- Returns sorted by entropy descending

### 4. extractDomains()
Extracts domains and IPs from all findings.
- Parses JSON-stringified findings
- Filters out localhost and 0.0.0.0
- Returns unique domains and IPs

### 5. fingerprintTech()
Detects technology stack from patterns.
- AWS, Google, GitHub, Stripe, Firebase
- Heroku, Cloudflare, Vercel, Netlify
- MongoDB, PostgreSQL, MySQL, Redis
- Docker, Kubernetes

### 6. analyzeJWTs()
Deep JWT analysis.
- Decodes header (algorithm, type)
- Decodes payload (issuer, subject, expiry)
- Flags `alg: none` as CRITICAL
- Flags `HS256` as MEDIUM (weak HMAC)

### 7. complianceReport()
OWASP compliance mapping.
- A07: Identification and Authentication Failures
- A01: Broken Access Control
- A05: Security Misconfiguration
- A04: Insecure Design

### 8. riskDashboard()
Summary risk score dashboard.
- Counts per category (secrets, endpoints, debug, config)
- Calculates composite risk score
- Rates: CRITICAL (>50), HIGH (>20), MEDIUM (>5), LOW

### 9. diffScan()
Compares with previous scan baseline.
- Saves baseline on first run
- Reports new and removed findings
- Useful for monitoring changes

### 10. remediationReport()
Auto-generates prioritized fix actions.
- P0: Rotate immediately, move to server-side
- P1: Review and secure, disable debug mode
- Covers secrets, auth findings, and debug info

## Hardening

- `_safeTable(data, max)` — console.table wrapper, max 200 rows
- `GOLD_CLEANUP()` — Restores fetch/XHR/addEventListener prototypes
- `_MAX_SCRIPTS = 200` — scripts.querySelectorAll capped
- `_MAX_ELEMENTS = 10000` — DOM element queries capped
- Inner try/catch on all DOM forEach loops (5 loops protected)
- `__GOLD_PATCHED` guard prevents re-patching
- Circular reference handling in JSON.stringify (WeakSet)
- `window.open` uses `noopener,noreferrer`
- Original functions stored before patching for proper restoration

## Output Structure

```js
findings = {
  secrets: [{
    name: "AWS Access Key",
    match: "AKIA...",
    confidence: "HIGH",
    source: "Inline Script #3",
    line: 42,
    index: 128,
    loc: { url: "...", line: 42, snippet: "..." }
  }],
  endpoints: [{ name, match, type, source, line }],
  internalPaths: [{ match, source }],
  authFindings: [{ match, source }],
  configObjects: [{ match, source }],
  debugInfo: [{ match, source }],
  userFlows: [{ type, tag, id, class, label, action, source }],
  hiddenElements: Set(["HIDDEN input#csrf", ...]),
  riskySinks: [{ element, attribute, sink, risk, source }],
  // Legacy aliases
  fileUploads: [...],
  businessLogic: [...],
  dbCreds: [...],
  networkLogs: [...]
}
```

## Safety Features

- `GOLD_CLEANUP()` restores all prototypes (fetch, XHR, addEventListener)
- `__origFetch`, `__origXHROpen`, `__origXHRSend`, `__origAddEventListener` stored
- `window.open` uses `noopener,noreferrer` to prevent tab-nabbing
- `__GOLD_PATCHED` guard prevents wrapper stacking
- Circular reference WeakSet prevents infinite recursion in JSON.stringify

## Commit History

| Commit | Changes |
|--------|---------|
| `300a044` | P1/P2 bug fixes (11 fixes, -3500 lines from dedup) |
| `6f421e2` | Hardening + 10 enhancements |
