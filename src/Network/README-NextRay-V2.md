# 🦅 NextRay - DevTools Network X-Ray

An intelligent network interception and analysis engine for security researchers, running directly in your browser console. NextRay captures all network traffic and automatically tags it with high-value security heuristics, turning your console into a powerful reconnaissance and triage tool.

**No extensions. No build steps. Pure console-native execution.**

> *(Suggestion: Replace this with a GIF showing the HUD and `NextRay.table()` output.)*

---

## 🚀 Key Features

-   **Comprehensive Interception**: Captures `fetch`, `XHR`, `navigator.sendBeacon`, and `WebSocket` connections with rich context.
-   **Automated Heuristic Tagging**: The **GOLD MINE CHECKLIST** automatically tags every request with security-relevant categories like `#Auth`, `#Input`, `#Error`, and `#Async` to instantly highlight areas of interest.
-   **Rich Contextual Data**: Each log entry includes the request/response metadata, timings, size, initiator script, and the full call stack.
-   **Powerful Filtering**: Instantly filter logs by URL `RegExp` or by security tag (e.g., `NextRay.find('#Auth')`).
-   **Interactive Console API**: A simple and powerful API to `start`, `stop`, `clear`, `find`, and `analyze` network traffic.
-   **cURL Command Generation**: Replay any request in other tools like Burp Suite with one command: `NextRay.curl(index)`.
-   **Multiple Export Formats**: Export complete network sessions to **JSON**, **CSV**, **NDJSON**, or **HAR** for deeper analysis.
-   **Live HUD Overlay**: A minimal, non-intrusive Heads-Up Display shows a live summary of captured requests and critical tags.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `NextRay-DevTools-V2.js`.
5.  Press **Enter**. The tool will automatically start monitoring.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., `NextRay.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, all functionality is accessed through the global `NextRay` object. The tool starts automatically.

### Viewing and Filtering Logs

```javascript
// Display a summary of all captured requests in a clean table.
NextRay.table();

// Find all requests related to authentication.
NextRay.find('#Auth');

// Find all requests to a specific API path using a RegExp.
NextRay.find(/\/api\/v2\/users/);

// Get the raw array of log objects.
const allLogs = NextRay.logs;
```

### Analyzing and Exporting

```javascript
// Generate a cURL command for the request at index 5.
NextRay.curl(5);

// Re-run the GOLD MINE CHECKLIST analysis on the request at index 10.
NextRay.analyze(10);

// Export the session as a HAR file for import into Burp Suite or other tools.
NextRay.exportHAR();

// Other export options.
NextRay.exportJSON();
NextRay.exportCSV();
NextRay.exportNDJSON();
```

### Control and Configuration

```javascript
// Stop and start the monitoring.
NextRay.stop();
NextRay.start();

// Clear all captured logs.
NextRay.clear();

// Toggle the on-screen HUD.
NextRay.overlay(false); // Hide
NextRay.overlay(true);  // Show

// Tweak configuration (e.g., enable response body previews).
NextRay.config.ENABLE_RESPONSE_PREVIEW = true;
```

---

## 🏆 The GOLD MINE CHECKLIST

NextRay's power comes from its ability to automatically tag requests with security-relevant heuristics. Use `NextRay.find('#Tag')` to filter for these.

-   **`#Framework`**: The request was initiated by a common JS framework (React, Vue, Angular, etc.). Useful for identifying the tech stack.
-   **`#ThirdParty`**: The request likely originated from a third-party library like `axios` or `jQuery`. Helps distinguish app code from library code.
-   **`#State`**: The call stack includes references to state management libraries (Redux, MobX, etc.). Indicates the request may be tied to critical application state.
-   **`#Auth`**: The URL contains keywords like `auth`, `login`, `token`, or `oauth`. **These are high-priority targets for authentication bypasses.**
-   **`#Input`**: The request URL or body contains parameters like `redirect`, `path`, `file`, or `callback`. **Prime candidates for XSS, SSRF, and Open Redirect.**
-   **`#Error`**: The response was a server error (5xx status) or the URL contains a debug flag. Useful for triggering and analyzing error-based vulnerabilities.
-   **`#Transform`**: The URL suggests data export or transformation (e.g., `csv`, `pdf`, `xml`). **Potential for Formula Injection or XXE.**
-   **`#Events`**: The request was triggered by a DOM event handler (`click`, `submit`, etc.). Helps link user actions to API calls.
-   **`#Async`**: The request was fired in rapid succession with another identical request. **Flags potential race condition vulnerabilities.**
-   **`#Memory`**: The response body is very large. Could indicate a denial-of-service vector or an information leak.

---

## 🏹 Bug Hunting Workflow

1.  **Initial Recon**: Load NextRay and navigate through the target application's key features (login, profile update, search, etc.). The HUD will give you a live overview.

2.  **Triage with `table()` and `find()`**:
    -   Run `NextRay.table()` to get a broad overview of all captured traffic.
    -   Immediately narrow your focus. Run `NextRay.find('#Auth')` to analyze all authentication-related endpoints.
    -   Run `NextRay.find('#Input')` to find all requests with potentially injectable parameters.

3.  **Deep Dive into a Request**:
    -   Once you find an interesting request in the table (e.g., at index `15`), inspect its details by logging it: `console.log(NextRay.logs[15])`.
    -   Examine the `stack` and `initiator` properties to understand the code path that triggered the request. This tells you *where* in the application's code the call is made.

4.  **Replay and Fuzz**:
    -   Generate a cURL command for the request: `NextRay.curl(15)`.
    -   Copy this command and paste it into your terminal or import it into a tool like Burp Suite Repeater.
    -   From there, you can begin fuzzing parameters, testing for authorization flaws, and manipulating headers.

5.  **Look for Patterns**:
    -   Use `NextRay.find('#Async')` to identify potential race conditions. Try replaying the associated requests in parallel using Burp Turbo Intruder.
    -   Use `NextRay.find('#Transform')` to find export functions. Try injecting CSV formula payloads (e.g., `=HYPERLINK(...)`) into user data that might be exported.

6.  **Export for Reporting**: When you find a vulnerability, use `NextRay.exportHAR()` or `NextRay.exportJSON()` to save the network logs as evidence for your report.

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
