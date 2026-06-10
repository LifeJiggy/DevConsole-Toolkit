# Network Tools

Two browser console tools for network traffic interception, analysis, and security scanning.

---

## Tools

| Tool | Lines | Purpose |
|------|-------|---------|
| **Nerwork-Mapper.js** | ~2817 | Full network mapper — fetch/XHR/WebSocket capture, request/response bodies, headers, call stacks, rule-based analysis, findings store, 20 security enhancements |
| **NextRay-DevTools-V2.js** | ~1294 | Lightweight network X-Ray — fast capture with GOLD MINE auto-tagging, HAR/CSV export, cURL generation, HUD overlay, 20 security enhancements |

---

## Quick Start

### Nerwork-Mapper.js

1. Open DevTools (**F12**) → **Console** tab
2. Paste `Nerwork-Mapper.js` → press **Enter**
3. Use the banner UI or API:

```javascript
NetworkMapper.start()                    // Start capture
NetworkMapper.stop()                     // Stop capture
NetworkMapper.scoreTraffic()             // Risk scoring
NetworkMapper.analyzeCORS()              // CORS analysis
NetworkMapper.analyzeCookies()           // Cookie security
NetworkMapper.checkSecurityHeaders()     // Header check
NetworkMapper.detectDataExposure()       // PII detection
NetworkMapper.analyzeJWTs()              // JWT analysis
NetworkMapper.scanSensitivePaths()       // Sensitive paths
NetworkMapper.detectSubdomainTakeover()  // Subdomain takeover
NetworkMapper.mapEndpoints()             // API mapping
NetworkMapper.trafficDashboard()         // Summary dashboard
NetworkMapper.exportLogs()               // Export JSON
```

### NextRay-DevTools-V2.js

1. Open DevTools (**F12**) → **Console** tab
2. Paste `NextRay-DevTools-V2.js` → press **Enter**
3. Use the API:

```javascript
NextRay.start()                    // Start capture
NextRay.stop()                     // Stop capture
NextRay.table()                    // View traffic table
NextRay.find("#Auth")              // Filter by tag
NextRay.curl(0)                    // Generate cURL
NextRay.scoreTraffic()             // Risk scoring
NextRay.analyzeCORS()              // CORS analysis
NextRay.analyzeCookies()           // Cookie security
NextRay.checkSecurityHeaders()     // Header check
NextRay.detectDataExposure()       // PII detection
NextRay.analyzeJWTs()              // JWT analysis
NextRay.scanSensitivePaths()       // Sensitive paths
NextRay.detectSubdomainTakeover()  // Subdomain takeover
NextRay.mapEndpoints()             // API mapping
NextRay.trafficDashboard()         // Summary dashboard
NextRay.exportHAR()                // Export HAR
NextRay.overlay(true)              // Toggle HUD
```

---

## Feature Comparison

| Feature | Nerwork-Mapper | NextRay-V2 |
|---------|---------------|------------|
| fetch/XHR/WS capture | Yes | Yes |
| Beacon capture | No | Yes |
| Request/response bodies | Yes | Yes |
| Call stacks | Yes | Yes |
| User event tracking | Yes | No |
| Rule-based analysis | Yes | Auto-tagging |
| Findings store | Yes | No |
| HUD overlay | No | Yes |
| HAR export | No | Yes |
| cURL generation | No | Yes |
| Cookie analysis | Enhancement | Enhancement |
| CORS analysis | Enhancement | Enhancement |
| PII detection | Enhancement | Enhancement |
| JWT analysis | Enhancement | Enhancement |
| OWASP compliance | Enhancement | Enhancement |

---

## 20 Security Enhancements (Both Tools)

| # | Function | Purpose |
|---|----------|---------|
| 1 | `scoreTraffic()` | Risk scoring for high/critical traffic |
| 2 | `analyzeCORS()` | CORS wildcard & dangerous method detection |
| 3 | `analyzeCookies()` | Missing Secure/HttpOnly/SameSite flags |
| 4 | `checkSecurityHeaders()` | Missing HSTS, CSP, X-Frame-Options |
| 5 | `detectDataExposure()` | PII/credential regex scanning |
| 6 | `mapEndpoints()` | Unique endpoint & method frequency mapping |
| 7 | `analyzePerformance()` | Slow request detection (>3s) |
| 8 | `fingerprintTech()` | Server/Powered-By header fingerprinting |
| 9 | `complianceReport()` | OWASP Top 10 category mapping |
| 10 | `trafficDiff()` | Time-window traffic comparison |
| 11 | `analyzeJWTs()` | JWT analysis (alg, issuer, expiry, alg:none) |
| 12 | `detectGraphQL()` | GraphQL endpoint & operation discovery |
| 13 | `detectSubdomainTakeover()` | CNAME/service pattern matching |
| 14 | `scanSensitivePaths()` | Known sensitive path detection |
| 15 | `detectSizeAnomalies()` | Statistical outlier detection (3σ) |
| 16 | `analyzeMethods()` | HTTP method distribution |
| 17 | `analyzeStatusCodes()` | Status code frequency breakdown |
| 18 | `detectThirdParty()` | Third-party domain enumeration |
| 19 | `trackAuthFlows()` | Auth/login/OAuth session tracking |
| 20 | `trafficDashboard()` | One-line summary dashboard |

---

## Bug Hunting Workflow

### Step 1: Start Capture
```javascript
NetworkMapper.start();  // or NextRay.start();
```

### Step 2: Risk Score Traffic
```javascript
NetworkMapper.scoreTraffic();
```

### Step 3: CORS + Cookie + Headers
```javascript
NetworkMapper.analyzeCORS();
NetworkMapper.analyzeCookies();
NetworkMapper.checkSecurityHeaders();
```

### Step 4: Data Exposure
```javascript
NetworkMapper.detectDataExposure();
NetworkMapper.analyzeJWTs();
```

### Step 5: Sensitive Paths + Subdomain Takeover
```javascript
NetworkMapper.scanSensitivePaths();
NetworkMapper.detectSubdomainTakeover();
```

### Step 6: Auth Flow Tracking
```javascript
NetworkMapper.trackAuthFlows();
```

### Step 7: Dashboard + Export
```javascript
NetworkMapper.trafficDashboard();
NetworkMapper.exportLogs();
```

---

## Commit History

| Commit | Changes |
|--------|---------|
| `99a9bc1` | Fix 56 bugs + harden + first 20 enhancements |
| `6133fcb` | Rewrite README |
| `e9c55e6` | Add 10 more features per tool (20 total each) |
