# Agents — Intelligent Automation

Orchestrate tools, chain scans, and auto-analyze results.

## Modules

| File | Module | Description |
|------|--------|-------------|
| `agent.js` | `DCTAgent` | Core workflow engine with pre-built workflows |
| `recon-agent.js` | `DCTReconAgent` | Automated reconnaissance (fingerprint, security, content, third-party) |
| `vuln-agent.js` | `DCTVulnAgent` | Vulnerability scanning (XSS, secrets, misconfig, cookies, storage) |
| `report-agent.js` | `DCTReportAgent` | Report generation (JSON, Markdown, CSV) with download |
| `schedule-agent.js` | `DCTScheduleAgent` | Scheduled recurring tasks with pause/resume |

## Usage

Paste `agents/agent.js` into browser console, then use `DCTAgent.*`

```js
// Quick audit (all-in-one)
await DCTAgent.quickAudit()

// Full reconnaissance
await DCTAgent.fullRecon()

// Secret hunting
await DCTAgent.secretHunter()

// Custom workflow
await DCTAgent.runWorkflow('my-scan', [
    { name: 'Step 1', fn: () => document.title },
    { name: 'Step 2', fn: () => document.querySelectorAll('script').length },
    { name: 'Step 3', fn: (result) => console.log(result) }
]);

// Check status
DCTAgent.getStatus()
DCTAgent.getWorkflows()
```

## Pre-built Workflows

| Workflow | Description | Steps |
|----------|-------------|-------|
| `quickAudit()` | Fast security check | Page info, headers, secrets, cookies, debug endpoints |
| `fullRecon()` | Complete recon | Fingerprint, headers, cookies, secrets, inputs, forms, resources |
| `secretHunter()` | Deep secret scan | Scripts, localStorage, sessionStorage, cookies, URL, meta, comments |

## Custom Workflows

```js
await DCTAgent.runWorkflow('custom', [
    {
        name: 'Gather data',
        fn: () => { return { count: document.querySelectorAll('a').length }; },
        callback: (result) => console.log('Links:', result.count)
    },
    {
        name: 'Analyze',
        fn: async () => {
            // Async operations work too
            return await fetch('/api/data').then(r => r.json());
        },
        continueOnError: true  // Don't stop on error
    }
]);
```

## API

| Method | Description |
|--------|-------------|
| `runWorkflow(name, steps)` | Execute a custom workflow |
| `quickAudit()` | Quick security audit |
| `fullRecon()` | Full reconnaissance |
| `secretHunter()` | Deep secret hunting |
| `getStatus()` | Get agent status |
| `getWorkflows()` | List completed workflows |
