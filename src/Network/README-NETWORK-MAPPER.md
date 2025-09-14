# 🌐 Network Mapper - Advanced Reconnaissance Tool

A professional, client-side network interception and analysis engine for security researchers and bug bounty hunters. Network Mapper captures all `fetch`, `XHR`, and `WebSocket` traffic, automatically correlates it with user actions, and runs a powerful rule-based analysis engine to detect high-impact vulnerabilities in real-time.

**No extensions. No build steps. Pure console-native execution.**

---

## 🚀 Key Features

-   **Comprehensive Interception**: Captures all `fetch`, `XHR`, and `WebSocket` requests, including request/response headers and bodies.
-   **Automated Analysis Engine**: Runs real-time heuristics to detect a wide range of vulnerabilities:
    -   **SSRF Indicators**: Detects requests to internal-looking hosts and metadata services.
    -   **CORS Misconfigurations**: Flags permissive `Access-Control-Allow-Origin` headers, especially with credentials.
    -   **CSRF Heuristics**: Identifies state-changing requests that lack anti-CSRF tokens.
    -   **Sensitive Data Exposure**: Finds API keys, tokens, PII, and other secrets in URLs, headers, and bodies.
    -   **Information Disclosure**: Uncovers verbose server headers (`Server`, `X-Powered-By`).
    -   **Insecure Cookies**: Checks for `Set-Cookie` headers missing `Secure` or `HttpOnly` flags.
-   **Rich Context Correlation**: Automatically links network requests to the user event (e.g., `click`, `submit`) and the specific DOM element that triggered them.
-   **Intelligent Data Redaction**: Automatically redacts sensitive data like passwords, tokens, and authorization headers in logs to protect privacy during analysis.
-   **Interactive Overlay**: A minimal, non-intrusive HUD to view critical findings without leaving the page.
-   **Powerful Filtering & Configuration**: Fine-tune what to capture based on URL, method, duration, or size. Enable/disable analysis rules on the fly.
-   **Professional Reporting**: Export complete network logs to **JSON**, **CSV**, or **HAR** formats for easy integration with tools like Burp Suite.
-   **Extensible Rules Engine**: Easily add your own custom rules to the analysis engine to find application-specific flaws.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `GPT.js`.
5.  Press **Enter**. The tool will automatically start monitoring.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `NetworkMapper.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, all functionality is accessed through the global `NetworkMapper` object.

### Core API

```javascript
// The tool starts automatically. Use these to control it manually.
NetworkMapper.start();
NetworkMapper.stop();
NetworkMapper.pause();
NetworkMapper.resume();
NetworkMapper.clear(); // Clears all logs and findings
```

### Viewing Logs & Findings

```javascript
// Display a high-level summary of the most critical findings.
NetworkMapper.printCriticalFindings();

// Get a summary of findings grouped by severity and type.
NetworkMapper.getAnalysisSummary();

// Get all raw log entries.
const allLogs = NetworkMapper.getLogs();

// Get all finding objects.
const allFindings = NetworkMapper.getFindings();

// Get a specific log entry by its ID (found in the finding details).
const entry = NetworkMapper.getEntryById('fetch-167...');
```

### Exporting Data

```javascript
// Download logs as a HAR file for import into other tools.
NetworkMapper.download('logs.har.json', { format: 'har' });

// Download logs as a CSV file.
NetworkMapper.download('logs.csv', { format: 'csv' });

// Get the raw JSON string for all logs.
const jsonString = NetworkMapper.exportLogs({ format: 'json' });
```

### Configuration & Filtering

You can configure the mapper at any time.

```javascript
// Example: Increase performance by reducing processing per tick.
NetworkMapper.setOptions({
  performance: {
    maxProcessPerTick: 20,
    useIdleCallback: true
  }
});

// Example: Filter the network log to only show POST requests to /api/.
NetworkMapper.setNetworkFilter(/\/api\//, ['POST']);

// Example: Disable a specific analysis rule.
NetworkMapper.enableRule('ssrf-indicators', false);

// Example: Add a new custom rule to the analysis engine.
NetworkMapper.addRule({
  id: 'custom-admin-check',
  type: 'access-control',
  desc: 'Checks for unauthorized access to admin endpoints',
  test(entry) {
    if (/\/api\/admin/.test(entry.url) && entry.status === 403) {
      return [{ severity: 'P2', message: 'Forbidden access to admin API detected.' }];
    }
    return [];
  }
});
```

### Interactive Overlay (HUD)

```javascript
// Toggle the on-page findings overlay.
NetworkMapper.toggleOverlay(); // Or toggleOverlay(true/false)

// Filter the findings shown in the overlay.
NetworkMapper.setOverlayFilter({ severity: 'P1', type: 'sensitive-data' });
NetworkMapper.setOverlayFilter(); // Clear filter
```

---

## 🏹 Bug Hunting Workflow

1.  **Initial Recon**: Load the script on your target application. Navigate through the main user flows (login, profile update, search, etc.). The mapper will silently log all network activity and its context.

2.  **Triage with `printCriticalFindings()`**: After interacting with the app, run `NetworkMapper.printCriticalFindings()` in the console. This gives you a prioritized list of the most severe issues found by the analysis engine. Focus on **P1** and **P2** findings first.

3.  **Investigate Sensitive Data Leaks**: Look for `sensitive-data` findings. Use `NetworkMapper.getEntryById()` with the `entryId` from the finding to inspect the full request and response. Check if API keys, session tokens, or PII are being leaked in URLs or response bodies.

4.  **Test for Access Control Issues**:
    -   Look for findings related to `access-control` or `csrf`.
    -   Identify requests made as a low-privilege user to endpoints that look like they should be for admins (e.g., `/api/admin/users`).
    -   Use the `triggeredBy` context in the log entry to understand what action led to the request.

5.  **Probe for SSRF and Injection**:
    -   Pay close attention to `ssrf-indicators` findings. Identify the vulnerable parameter.
    -   Replay the request in a tool like Burp Repeater and try to substitute the parameter's value with internal IP addresses (`127.0.0.1`, `169.254.169.254`) or your Burp Collaborator domain.
    -   For `soap-xpath-injection` findings, test for XML and XPath injection payloads.

6.  **Analyze CORS and Cookie Security**:
    -   Review `cors-misconfig` findings. If `Access-Control-Allow-Origin: *` is found with `Access-Control-Allow-Credentials: true`, you have a critical vulnerability.
    -   Check `insecure-cookies` findings to see if session cookies are missing `HttpOnly` or `Secure` flags.

7.  **Export for Deeper Analysis**: Use `NetworkMapper.download('logs.har.json', { format: 'har' })` to export the entire session. Import this HAR file into Burp Suite Pro to automatically populate the Target sitemap and begin active scanning or manual testing.

---

## 🤝 Contributing

Contributions are welcome! If you have an idea for a new feature, a bug fix, or an improvement, please feel free to fork the repository and submit a pull request.

1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📧 Contact

-   **X**: https://x.com/ArkhLifeJiggy
-   **Email**: bloomtonjovish@gmail.com && emperorstephenpee001@gmail.com

