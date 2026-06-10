# Interactive Mapping Tools

Two browser console tools for interactive web analysis, user action flow tracking, and DOM state mapping.

---

## Tools

| Tool | Purpose |
|------|---------|
| **Interactive-Web-Analysis.js** | Full interactive analysis — element extraction, event listener mapping, network interception, state snapshots, hidden element discovery |
| **User-Action-Flow-Analysis.js** | User action flow — tracks click/submit/change/keydown chains, maps user journeys, identifies interaction patterns |

---

## Quick Start

1. Open DevTools (**F12**) → **Console** tab
2. Paste the tool file → press **Enter**
3. Follow the displayed API commands

```javascript
// Interactive-Web-Analysis.js
InteractiveWebAnalysis.start()           // Start full analysis
InteractiveWebAnalysis.mapElements()     // Map all interactive elements
InteractiveWebAnalysis.trackEvents()     // Track event listeners
InteractiveWebAnalysis.snapshotState()   // Capture DOM state
InteractiveWebAnalysis.findHidden()      // Find hidden elements

// User-Action-Flow-Analysis.js
UserActionFlow.start()                   // Start action tracking
UserActionFlow.trackClicks()             // Track click chains
UserActionFlow.trackForms()              // Track form submissions
UserActionFlow.getMap()                  // Get user journey map
```

---

## Feature Comparison

| Feature | Interactive-Web-Analysis | User-Action-Flow-Analysis |
|---------|--------------------------|---------------------------|
| Element extraction | Yes | Yes |
| Event listener mapping | Yes | Yes |
| Network interception | Yes | No |
| State snapshots | Yes | No |
| Hidden element discovery | Yes | Yes |
| Click chain tracking | Yes | Yes |
| Form submission tracking | Yes | Yes |
| User journey mapping | No | Yes |
| 20 enhancement functions | Yes | Yes |

---

## Shared Capabilities

Both tools share:
- `_safeTable()` — console.table wrapper with row limits
- `_MAX_ELEMENTS` — DOM query element limits
- Inner try/catch on all forEach loops
- 20 enhancement functions per tool
