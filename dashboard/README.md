# Dashboard — Unified Browser Console Dashboard

All-in-one security audit dashboard. Paste into browser console for instant results.

## Quick Start

```js
// Paste dashboard.js into browser console
// Results auto-display immediately

// Or trigger manually
DCTDashboard.scan()

// Export results
DCTDashboard.export()      // JSON
DCTDashboard.exportCSV()   // CSV

// View history
DCTDashboard.history()
```

## What It Scans

| Category | Checks |
|----------|--------|
| **Secrets** | AWS keys, GitHub PATs, Stripe keys, JWTs, hardcoded secrets |
| **Security Issues** | eval(), document.write(), innerHTML assignment |
| **Cookies** | Missing Secure/HttpOnly/SameSite flags |
| **Storage** | Sensitive data in localStorage/sessionStorage |
| **Headers** | CSP, X-Frame-Options, X-Content-Type-Options, HSTS |
| **Forms** | Missing CSRF tokens, HTTP action URLs |
| **Scripts** | External vs inline count |

## Security Score

0-100 score based on findings:
- **80-100**: LOW risk (green)
- **60-79**: MEDIUM risk (yellow)
- **40-59**: HIGH risk (orange)
- **0-39**: CRITICAL risk (red)

## Commands

```js
DCTDashboard.scan()           // Run security scan
DCTDashboard.export()         // Download JSON report
DCTDashboard.exportCSV()      // Download CSV report
DCTDashboard.history()        // View scan history
DCTDashboard.quickAudit()     // Agent quick audit
DCTDashboard.fullRecon()      // Agent full recon
DCTDashboard.secretHunter()   // Agent secret hunt
DCTDashboard.storage()        // Storage audit
DCTDashboard.cookies()        // Cookie audit
DCTDashboard.help()           // Show all commands
```

## Module Integration

The dashboard auto-detects and integrates with:
- **DCTUtils** (tools/) — Utility functions
- **DCTRules** (rules/) — Security rules engine
- **DCTMemory** (memory/) — Persistent state
- **DCTStorage** (storage/) — Storage management
- **DCTAgent** (agents/) — Automation workflows

## Auto-Run

When loaded, the dashboard automatically:
1. Scans the current page
2. Displays results in the console
3. Shows security score and findings
4. Stores scan in history
