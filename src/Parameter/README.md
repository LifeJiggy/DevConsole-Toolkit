<!-- @format -->

# 🧠 Universal Parameter Extractor (UPE)

A powerful, client-side developer tool for discovering, analyzing, and visualizing web application parameters from every possible source. Designed for security researchers, QA engineers, and developers, UPE provides a complete intelligence map of how parameters are used, reflected, and sunk within a web page, all from a convenient, interactive UI.

**No extensions. No build steps. Pure console-native execution.**


> *(Suggestion: Replace with a GIF of the banner UI in action)*

---

## 🚀 Key Features

-   **Universal Discovery**: Extracts parameters from every corner of a web application:
    -   **URL**: Query parameters, hash fragments, and path segments.
    -   **DOM**: All elements with URLs (`<a>`, `<img>`, `<form>`, `<script>`, etc.).
    -   **Storage**: Cookies.
    -   **Page Content**: Meta tags, hidden inputs, and inline JSON/JavaScript configurations.
-   **Network Interception**: Passively captures parameters from `fetch` and `XHR` request URLs, headers, and bodies by automatically patching network functions.
-   **Reflection & Sink Analysis**: Automatically checks if parameter values are reflected in the DOM (`<head>`, `<body>`, attributes, text) and identifies **dangerous sinks** like `innerHTML`, `src`, `href`, and `on*` event handlers.
-   **Interactive UI**: A draggable banner UI provides one-click access to all major functions: extract, highlight, export, and real-time scanning.
-   **Visual Highlighting**: Instantly highlights where parameters are reflected on the page, color-coding dangerous sinks (**red**) and other reflections (**orange**).
-   **Real-time Scanning**: An optional mode to continuously monitor the application, perfect for Single-Page Applications (SPAs) and dynamic content.
-   **Data Export**: Easily export the complete parameter analysis table to **CSV** or access the raw data via a global **JSON** object (`window.PARAM_REFLECTIONS_JSON`) for automation.
-   **Active Testing Stub**: Includes a function to inject test payloads into forms and cookies to observe application behavior.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `🧠-Universal-Parameter-Extractor-Client-Side.js`.
5.  Press **Enter**. The UPE banner will appear on the page.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `UPE.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

The tool is designed to be used in two primary ways: through the interactive UI or via the programmatic console API.

### The Interactive Banner

Once loaded, a colorful, draggable banner appears on the page. This is the easiest way to control UPE:

-   **Extract**: Performs a one-time, full-page scan for all parameters and their reflections.
-   **Highlight**: Visually highlights all currently known reflected parameters on the page.
-   **Export CSV**: Generates and downloads a CSV file of the parameter reflection table.
-   **Show JSON**: Logs the `window.PARAM_REFLECTIONS_JSON` object to the console.
-   **Real-Time / Stop RT**: Toggles the continuous scanning mode.
-   **Inject Payload**: Injects a test payload into forms and cookies.
-   **Clear Highlights**: Removes all visual highlights from the page.
-   **Unpatch Network**: Restores the original `fetch` and `XMLHttpRequest` functions.

### Programmatic API

All features are available as global functions on the `window` object.

```javascript
// Core Features
window.extractAllParameters(); // Run a full scan.
window.highlightReflectedParams(); // Highlight reflected values in the DOM.
window.exportParamReflectionsCSV(); // Download the results as a CSV file.
window.clearParamHighlights(); // Remove all visual highlights.

// Real-time Scanning
window.startRealTimeParamScan(3000); // Start continuous scanning (interval in ms).
window.stopRealTimeParamScan(); // Stop the real-time scanner.

// Active Testing
window.injectParamPayloads("your_payload_here"); // Inject a test payload.

// UI & Network
window.showUPEBanner(); // Show the UI banner if it was closed.
window.patchNetwork(); // Manually patch network functions.
window.unpatchNetwork(); // Manually unpatch network functions.

// The results are always available in this global object:
console.log(window.PARAM_REFLECTIONS_JSON);
```

### Configuration

You can modify the `SETTINGS` object at the top of the script *before* pasting it into the console to change its behavior.

```javascript
const SETTINGS = {
  // Match reflections case-insensitively.
  caseInsensitive: true,
  // Automatically patch network functions when the banner is shown.
  autoPatchNetwork: true,
  // Default interval for real-time scanning.
  realTimeIntervalMs: 3000,
  // ... and more.
};
```

---

## 🏹 Bug Hunting Workflow

UPE is built to supercharge your security testing workflow. Here’s a systematic approach to finding critical vulnerabilities:

#### 1. Initial Scan & Triage

Run `extractAllParameters()` to get a complete map of all parameters and their reflection status. Check the console table for a high-level overview.

#### 2. Prioritize by Sink Type

-   **Focus on "Dangerous Sink: yes"**: These are your highest-priority targets. Parameters reflected in script blocks, event handlers (`on*`), `src`, or `href` attributes are prime candidates for **XSS**, **Open Redirect**, and other injection attacks.
-   **Investigate "DOM/Sink: yes"**: Parameters reflected anywhere in the DOM are potential vectors for **DOM-based XSS** and **HTML Injection**.

#### 3. Analyze Sources

Use the "Sources" column to understand where a parameter originates.

-   **URL-based sources** (`url`, `url-path`, `fetch-url`) are often directly controllable by an attacker and are excellent fuzzing targets.
-   **Cookie and Form sources** can be manipulated easily via the browser or scripts.

#### 4. Active Testing with Payloads

Use `injectParamPayloads('your_unique_marker')` to inject a traceable string into forms and cookies. Re-run the extraction and look for your marker in the "Reflection" column. If it appears in a dangerous sink, you have a strong signal of a vulnerability.

#### 5. Manual & Automated Exploitation

-   **For Dangerous Sinks**: Try classic XSS payloads (`"><script>alert(1)</script>`, `javascript:alert(1)`), open redirect payloads (`//evil.com`), and HTML injection payloads (`<img src=x onerror=alert(1)>`).
-   **For DOM Sinks**: Probe for DOM XSS by crafting payloads that break out of the current HTML context or manipulate the DOM.
-   **For Network Parameters**: Use a proxy like Burp Suite to intercept and fuzz parameters identified in `fetch-url` or `xhr-url` sources. Look for Stored XSS, SSRF, or IDORs in the responses.

#### 6. Export & Automate

Use the **CSV/JSON** output to:
-   Feed parameter lists into automated fuzzing tools.
-   Generate professional reports for bug bounty submissions.
-   Keep a record of the application's attack surface.

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

