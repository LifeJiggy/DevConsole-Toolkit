# Hidden-Gold.js — JS Disclosure & Secret Extractor

A comprehensive browser console tool for discovering secrets, credentials, API keys, endpoints, and sensitive information disclosed in JavaScript code and the DOM.

## Quick Start

1. Open DevTools (F12) on any target website
2. Go to **Console** tab
3. Paste the entire `Hidden-Gold.js` file and press Enter
4. The tool auto-runs `runAllExtractors()` and displays all commands

```js
runAllExtractors();          // Full extraction
extractAPIKeys();            // Just API keys
extractP1Secrets();          // P1-focused critical findings
analyzeEntropy();            // Token entropy scoring
scoreSecrets();              // Risk scoring
generateRemediation();       // Fix recommendations
exportCSV();                 // Copy findings as CSV
```

## Core Extraction Functions

### extractAPIKeys()
Scans all script tags and global variables for API keys and tokens.
- AWS Access Keys (`AKIA...`)
- JWT tokens (`eyJ...`)
- GitHub tokens (`ghp_...`, `gho_...`)
- Stripe keys (`sk_live_...`, `pk_live_...`)
- Google API keys (`AIza...`)
- Firebase URLs
- Generic high-entropy strings

### extractHiddenEndpoints()
Discovers hidden API endpoints, admin routes, and internal paths.
- REST API patterns (`/api/`, `/v1/`, `/v2/`)
- Admin panels (`/admin`, `/dashboard`, `/wp-admin`)
- Debug endpoints (`/debug`, `/trace`, `/actuator`)
- GraphQL endpoints
- Internal microservice paths

### extractCredentials()
Extracts database connection strings, SMTP credentials, and SSH keys.
- MySQL/PostgreSQL/MongoDB connection strings
- SMTP credentials
- SSH private keys
- API secrets and tokens
- Bearer tokens

### extractConfigurations()
Discovers configuration objects, environment variables, and feature flags.
- Debug mode settings
- Environment configurations
- Feature flags
- Third-party service configs
- Version information

### mapEventListeners()
Analyzes DOM event listeners for dangerous handlers.
- onclick/onsubmit handlers with inline code
- Event delegation patterns
- Dangerous callback functions
- Cross-origin event handlers

### extractAdvancedFlags()
Finds Chrome flags, debug parameters, and advanced configurations.
- Chrome experimental flags
- Debug query parameters
- Feature toggles
- Admin bypass flags

### extractP1Secrets()
P1-focused scan for critical credentials and secrets.
- High-risk API keys
- Production credentials
- Database passwords
- Authentication tokens

### extractSensitiveEndpoints()
Discovers sensitive endpoint categories.
- Payment processing endpoints
- User management APIs
- Authentication flows
- Admin operations
- Webhook URLs
- Configuration endpoints

## Enhancement Functions (10)

### 1. scoreSecrets()
Risk-scoring engine for all discovered secrets.
- Calculates risk score based on severity (HIGH=10, MEDIUM=5, LOW=2, INFO=1)
- Adds entropy bonus for high-entropy values (>4.5 bits)
- Adds location bonus for global-scope secrets
- Returns sorted table by risk score

### 2. analyzeSourceMaps()
Detects source maps in script tags.
- External `.js.map` files
- Inline `sourceMappingURL` references
- Returns map URLs and associated scripts

### 3. analyzeCSP()
Analyzes Content Security Policy for weaknesses.
- Detects `unsafe-inline`, `unsafe-eval`
- Flags wildcard (`*`) sources
- Identifies `data:` and `blob:` URI bypasses
- Rates policy severity

### 4. detectDangerousSinks()
Finds DOM XSS sinks in element attributes.
- innerHTML, outerHTML, insertAdjacentHTML
- document.write, eval, Function
- setTimeout, setInterval with strings
- location.href, window.open
- Returns element, attribute, sink type, and risk level

### 5. analyzeEntropy()
Scores all discovered tokens by Shannon entropy.
- Calculates character frequency distribution
- Computes Shannon entropy in bits
- Rates: >4.5 bits = HIGH, >3.5 = MEDIUM, else LOW
- Returns sorted by entropy descending

### 6. mapExposureVectors()
Correlates secrets with exposure paths.
- Secrets + endpoints = HIGH risk
- Debug mode + secrets = CRITICAL
- DOM-exposed secrets = HIGH
- Returns exposure vector descriptions

### 7. mapCompliance()
Maps findings to OWASP Top 10 categories.
- A07: Identification and Authentication Failures
- A01: Broken Access Control
- A05: Security Misconfiguration
- A03: Injection (via event listener count)

### 8. diffScan()
Compares current scan with previous baseline.
- Saves baseline on first run
- Reports new and removed findings
- Useful for monitoring changes over time

### 9. generateRemediation()
Auto-generates prioritized fix recommendations.
- P0: Rotate immediately, move to server-side
- P1: Review and secure
- Covers API keys, credentials, and debug configs

### 10. exportCSV()
Exports all findings as CSV to clipboard.
- Columns: Type, Name, Value, Risk, Source, Location
- Copies to clipboard via navigator.clipboard API
- Falls back to console output if clipboard unavailable

## Hardening

- `_safeTable(data, max)` — console.table wrapper, max 200 rows
- `_MAX_SCRIPTS = 200` — scripts.querySelectorAll capped
- `_MAX_ELEMENTS = 5000` — DOM element queries capped
- 13 inner try/catch blocks on forEach loops
- Graceful error handling on all functions
- No prototype pollution (read-only scans)

## Output Structure

```js
window.jsDisclosureHunter = {
  apiKeys: [{
    keyType: "aws_access_key",
    value: "AKIA...",
    risk: "HIGH",
    source: "Inline Script #3",
    location: "window.AWS_CONFIG.accessKeyId",
    entropy: 4.8,
    timestamp: "2026-06-09T..."
  }],
  credentials: [{ name, value, risk, source }],
  endpoints: [{ name, url, type, risk, source }],
  configurations: { debug: {...}, environment: {...}, features: {...} },
  listeners: [{ eventType, selector, handler, element }],
  advancedFlags: [{ flag, value, source }],
  mapping: { "sourceFile.js": [...] },
  networkLogs: [...]
}
```

## Commit History

| Commit | Changes |
|--------|---------|
| `300a044` | P1/P2 bug fixes (7 fixes) |
| `6f421e2` | Hardening + 10 enhancements |
