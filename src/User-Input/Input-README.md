# 🕵️ Universal Input & Security Analyzer

A powerful, client-side security analysis tool for discovering, mapping, and testing every user input on a web application. Designed for security researchers and developers, this tool provides a complete intelligence map of interactive elements, event handlers, network triggers, and potential vulnerabilities like XSS, all from a single script executed in your browser's console.

**No extensions. No build steps. Pure console-native power.**

> *(Suggestion: Replace this with a GIF of the tool in action, showing console tables and analysis.)*

---

## 🚀 Key Features

-   **Comprehensive Input Discovery**: Extracts all standard and non-standard inputs: `<input>`, `contenteditable`, ARIA roles, rich text editors (TinyMCE, Quill), and custom UI components.
-   **Deep Event & Handler Mapping**: Wraps and traces every event handler (inline, property, `addEventListener`), providing source code and file/line hints for deep analysis.
-   **Live Network Correlation**: Patches `fetch`, `XHR`, `WebSocket`, and `EventSource` to automatically link network activity back to the specific user input and handler that triggered it.
-   **Advanced Reflection & Sink Analysis**: Scans the DOM for input reflections and identifies **dangerous sinks** (`innerHTML`, etc.) to pinpoint XSS and other injection vulnerabilities.
-   **Live DOM & Security Monitoring**: Utilizes a throttled `MutationObserver` to detect and analyze dynamically added inputs and content in real-time, perfect for Single-Page Applications (SPAs).
-   **Rich Security Reporting**: Generates professional security reports directly in the console, highlighting critical hotspots, dangerous inputs, and providing severity scores.
-   **Data Export & Filtering**: Exports detailed findings to **JSON** or **CSV** and provides powerful filtering capabilities for targeted analysis.
-   **Snapshot & Diffing**: Capture and compare snapshots of the application's input state to understand how user interactions change the attack surface.
-   **Highly Configurable**: A global `UPE_CONFIG` object allows for live customization of selectors, monitoring behavior, data masking, and more.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `🧠-Universal-User-Input-Extractor-Client-Side.js`.
5.  Press **Enter**. The tool will auto-execute and display its initial findings.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `UISA.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, the tool exposes a rich set of functions on the `window` object for programmatic control.

### Configuration (`window.UPE_CONFIG`)

You can modify the `UPE_CONFIG` object at any time in the console to change the tool's behavior.

```javascript
// Example: Enable the UI overlay and aggressive scanning
UPE_CONFIG.overlay.enabled = true;
UPE_CONFIG.selectorProfile = 'aggressive';

// Example: Add custom component selectors and re-scan
UPE_CONFIG.extraSelectors.push('.my-custom-component');
extractAndWrapAllInputs();

// Example: Disable monkey-patching in sensitive environments
UPE_CONFIG.safeMode = true;
```

**Default Configuration:**
```javascript
const UPE_CONFIG = {
  observerEnabled: true,
  throttleMs: 250,
  maskSensitive: true,
  maskFieldsPatterns: [/pass(word)?/i, /token/i, /secret/i, /apikey/i, /api-key/i, /ssn/i, /credit|card/i, /email/i],
  selectorProfile: 'balanced', // 'lite' | 'balanced' | 'aggressive'
  extraSelectors: [ '.select2', '.select2-selection__rendered', '.ql-editor', '.tox-tinymce', '.tox-edit-area iframe', '.mce-content-body' ],
  excludeSelectors: [],
  overlay: { enabled: false },
  safeMode: false,
  monkeyPatch: { fetch: true, xhr: true, websocket: true, eventsource: true, timers: true },
  stackTraceLimit: 50,
  captureStacks: false,
  useRobustReflection: false
};
```

### Programmatic API

All features are available as global functions. Here are some of the most important commands.

#### Initialization & Quick Scans
```javascript
// Run all core mapping and analysis functions at once.
window.runAllCoreFunctions();

// A more thorough version that may detect more dynamic inputs.
window.runAllCoreFunctionsRobust();

// Get a quick overview of the application's security posture.
window.quickSecurityScan();

// Display a list of all available functions in the console.
window.showAvailableFunctions();
```

#### Core Analysis
```javascript
// Extract all standard and custom interactive inputs.
window.extractInteractiveInputs();

// Map all event listeners and their handlers for every input.
window.mapInputListenersHandlers();

// Correlate user inputs with the network requests they trigger.
window.mapInteractiveInputsNetwork();

// Detect where input values are reflected in the DOM and check for dangerous sinks.
window.detectInputReflections();
```

#### Security & Vulnerability Analysis
```javascript
// Perform a full, detailed analysis of dangerous inputs.
window.analyzeDangerousInputs({ showTop: 10, showDetails: true });

// Highlight the most critical security hotspots that require immediate attention.
window.identifyCriticalHotspots();

// Generate a professional, detailed security report in the console.
window.generateSecurityReport();

// Filter reflection results to focus on high-priority targets.
window.filterReflections({ dangerousOnly: true, minReflections: 10 });
```

#### Live Monitoring (for SPAs)
```javascript
// Start monitoring inputs in real-time, with optional keystroke tracking.
window.startLiveInputMonitor({ trackKeystrokes: true, maxHistory: 200 });

// Stop the live input monitor.
window.stopLiveInputMonitor();

// Start a real-time monitor focused on security-related changes (e.g., new sinks).
window.startLiveSecurityMonitor();
```

#### Data Export
```javascript
// Export all collected security data to JSON.
window.exportSecurityData('json');

// Export all collected security data to CSV.
window.exportSecurityData('csv');
```

---

## 🏹 Bug Hunting Workflow

This tool is designed to systematically uncover client-side vulnerabilities.

1.  **Initial Reconnaissance**
    Run `window.runAllCoreFunctionsRobust()` to get a complete map of the application's inputs, handlers, and initial security state. Review the summary tables printed in the console.

2.  **Identify the Attack Surface**
    Use `window.extractInteractiveInputs()` and `window.analyzeInputStatistics()` to understand what inputs are available and which are most common.

3.  **Map Actions to Network Calls**
    Run `window.mapInteractiveInputsNetwork()`. Interact with the application (e.g., fill out forms, click buttons) and observe which user actions trigger API calls. This is your entry point for finding **Business Logic Flaws**, **IDORs**, and other API-level vulnerabilities.

4.  **Hunt for XSS and Injection Flaws**
    Use `window.detectInputReflections()` to see where your test inputs are rendered. Immediately focus on the highest-risk areas by running `window.filterReflections({ dangerousOnly: true })`.

5.  **Analyze Critical Hotspots**
    Run `window.analyzeDangerousInputs()` and `window.identifyCriticalHotspots()` to get a prioritized list of the most vulnerable inputs and sinks. This tells you exactly where to focus your manual testing efforts.

6.  **Monitor Dynamic Applications**
    For SPAs (React, Vue, Angular), start the live monitors with `window.startLiveInputMonitor()` and `window.startLiveSecurityMonitor()`. Navigate through the application and let the tool discover new inputs and vulnerabilities as they appear.

7.  **Document and Report**
    Use `window.generateSecurityReport()` to get a clean, organized summary of your findings. Export the complete data with `window.exportSecurityData('json')` to use in external tools or for your bug bounty report.

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
