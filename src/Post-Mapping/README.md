# Post-Mapping Tools

Two browser console tools for post-exploitation analysis, critical flaw hunting, and standalone attack surface assessment.

---

## Tools

| Tool | Purpose |
|------|---------|
| **Critical-Flaw-Hunter.js** | Critical flaw discovery — analyzes captured traffic for high-severity vulnerabilities, chains findings, generates exploit PoCs |
| **Standalone-Attack-Surface.js** | Attack surface assessment — discovers endpoints, subdomains, APIs, cloud buckets, tech stack, and maps the external attack surface |

---

## Quick Start

1. Open DevTools (**F12**) → **Console** tab
2. Paste the tool file → press **Enter**
3. Follow the displayed API commands

```javascript
// Critical-Flaw-Hunter.js
CriticalFlawHunter.start()              // Start flaw hunting
CriticalFlawHunter.analyzeTraffic()     // Analyze captured traffic
CriticalFlawHunter.chainFindings()      // Chain linked vulnerabilities
CriticalFlawHunter.generateExploits()   // Generate exploit PoCs

// Standalone-Attack-Surface.js
StandaloneAttackSurface.start()         // Start attack surface scan
StandaloneAttackSurface.discoverEndpoints() // Discover all endpoints
StandaloneAttackSurface.mapTechStack()  // Map technology stack
StandaloneAttackSurface.assessRisk()    // Risk assessment
```

---

## Feature Comparison

| Feature | Critical-Flaw-Hunter | Standalone-Attack-Surface |
|---------|---------------------|---------------------------|
| Traffic analysis | Yes | No |
| Vulnerability chaining | Yes | No |
| Exploit PoC generation | Yes | No |
| Endpoint discovery | No | Yes |
| Tech stack mapping | No | Yes |
| Risk assessment | Yes | Yes |
| 20 enhancement functions | Yes | Yes |

---

## Shared Capabilities

Both tools share:
- `_safeTable()` — console.table wrapper with row limits
- Inner try/catch on all forEach loops
- 20 enhancement functions per tool
