# Critical Flaw Hunter

A browser console tool for discovering critical vulnerabilities in captured network traffic, chaining linked findings, and generating exploit proof-of-concepts.

---

## Quick Start

1. Open DevTools (**F12**) → **Console** tab
2. Paste `Critical-Flaw-Hunter.js` → press **Enter**
3. Use the API:

```javascript
CriticalFlawHunter.start()              // Start flaw hunting
CriticalFlawHunter.analyzeTraffic()     // Analyze captured traffic
CriticalFlawHunter.chainFindings()      // Chain linked vulnerabilities
CriticalFlawHunter.generateExploits()   // Generate exploit PoCs
CriticalFlawHunter.exportReport()       // Export findings report
```

---

## Core Features

### Vulnerability Detection
- SSRF via parameter manipulation
- IDOR via sequential ID analysis
- XSS via reflection and sink correlation
- Auth bypass via header manipulation
- SQLi via error-based detection
- Command injection via response patterns

### Finding Chaining
- Links related vulnerabilities across requests
- Maps attack paths (e.g., IDOR → privilege escalation)
- Calculates composite risk scores

### Exploit Generation
- Auto-generates PoC for confirmed findings
- cURL commands for replay
- Browser console snippets for XSS

---

## 20 Enhancement Functions

| # | Function | Purpose |
|---|----------|---------|
| 1 | `scoreFindings()` | Risk-score all findings |
| 2 | `chainVulnerabilities()` | Link related vulnerabilities |
| 3 | `generateExploits()` | Auto-generate PoC exploits |
| 4 | `mapAttackPaths()` | Map complete attack paths |
| 5 | `detectSSRF()` | Find SSRF vectors |
| 6 | `detectIDOR()` | Find IDOR patterns |
| 7 | `detectXSS()` | Find XSS via reflection+sink |
| 8 | `detectAuthBypass()` | Find auth bypass vectors |
| 9 | `detectSQLi()` | Find SQL injection patterns |
| 10 | `detectCmdInjection()` | Find command injection |
| 11 | `assessRisk()` | Composite risk assessment |
| 12 | `prioritizeFindings()` | Prioritize by exploitability |
| 13 | `mapDataFlow()` | Map data flow paths |
| 14 | `detectPrivEsc()` | Find privilege escalation |
| 15 | `analyzeSession()` | Session management flaws |
| 16 | `detectCORSIssues()` | CORS misconfiguration |
| 17 | `analyzeHeaders()` | Security header analysis |
| 18 | `detectCryptoFlaws()` | Cryptographic weaknesses |
| 19 | `generateReport()` | Comprehensive report |
| 20 | `exportCSV()` | Export as CSV |
