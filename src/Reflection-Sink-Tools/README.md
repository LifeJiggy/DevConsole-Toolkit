# Reflection & Sink Tools

Six browser console tools for DOM reflection detection, XSS sink analysis, and security testing.

---

## Tools

| Tool | Purpose |
|------|---------|
| **Dom-Sink-Analyzer.js** | Deep DOM sink analysis — finds innerHTML, eval, document.write, location sinks with element context |
| **Dom-Sink-Mapper.js** | Maps DOM sinks to reflection points — full param→sink chain visualization |
| **Dom-Sink-Recon-Checker.js** | Recon checker — validates sink accessibility and exploitation paths |
| **Dom-Sink-Recon.js** | DOM reconnaissance — discovers hidden elements, event listeners, mutation observers |
| **Dom-Sink-tester.js** | Sink testing — injects payloads into identified sinks to confirm XSS |
| **Xss-Tester.js** | XSS validation — tests reflected parameters with context-aware payloads |

---

## Quick Start

1. Open DevTools (**F12**) → **Console** tab
2. Paste the tool file → press **Enter**
3. Follow the displayed API commands

```javascript
// Dom-Sink-Analyzer.js
DomSinkAnalyzer.start()              // Full DOM sink scan
DomSinkAnalyzer.findSinks()          // Find all dangerous sinks
DomSinkAnalyzer.analyzeReflections() // Map reflections to sinks

// Dom-Sink-Mapper.js
DomSinkMapper.start()                // Map DOM sink chains
DomSinkMapper.mapParamToSink()       // Param → sink flow mapping

// Dom-Sink-Recon-Checker.js
DomSinkReconChecker.start()          // Validate sink accessibility
DomSinkReconChecker.checkExploits()  // Check exploitation paths

// Dom-Sink-Recon.js
DomSinkRecon.start()                 // DOM reconnaissance
DomSinkRecon.findHidden()            // Find hidden elements
DomSinkRecon.trackMutations()        // Track DOM mutations

// Dom-Sink-tester.js
DomSinkTester.start()                // Test identified sinks
DomSinkTester.injectPayloads()       // Inject test payloads

// Xss-Tester.js
XssTester.start()                    // XSS validation
XssTester.testReflections()          // Test reflected parameters
```

---

## Feature Comparison

| Feature | Analyzer | Mapper | Recon-Checker | Recon | Tester | Xss-Tester |
|---------|----------|--------|---------------|-------|--------|------------|
| Sink detection | Yes | Yes | Yes | No | No | No |
| Reflection mapping | Yes | Yes | Yes | No | No | Yes |
| Param→sink chains | No | Yes | Yes | No | No | No |
| Hidden element discovery | Yes | No | No | Yes | No | No |
| MutationObserver | Yes | No | No | Yes | No | No |
| Payload injection | No | No | No | No | Yes | Yes |
| XSS validation | No | No | Yes | No | Yes | Yes |
| Event listener mapping | Yes | No | No | Yes | No | No |
| 20 deep analysis functions | Yes | Yes | Yes | Yes | Yes | Yes |

---

## Shared Capabilities

All 6 tools share:
- `_safeTable()` — console.table wrapper with row limits
- `_MAX_ELEMENTS` — DOM query element limits
- `escapeHTML()` — XSS-safe output
- Inner try/catch on all forEach loops
- 20 enhancement functions per tool
