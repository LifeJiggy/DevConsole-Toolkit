# ⚡ NextRay - Console Validation & Exploit Helper

A powerful, single-snippet toolkit for discovering, profiling, and fuzzing web application inputs to uncover client-side validation bypasses and reflection-based vulnerabilities like XSS and SQLi.

**No extensions. No build steps. Pure console-native execution.**

> *(Suggestion: Replace this with a GIF showing the `NextRay.report()` console output.)*

---

## 🚀 Key Features

-   **Comprehensive Input Discovery**: Finds all forms, inputs (`<input>`, `<textarea>`, `<select>`), buttons, and `contenteditable` elements, including hidden fields and interactive components.
-   **Client-Side Validation Profiling**: Automatically probes inputs to build a "Character Acceptance Matrix," revealing which special characters (`<`, `>`, `"`, `'`) are permitted or blocked by frontend validation logic.
-   **Context-Aware Fuzzing**: Deploys a curated catalog of payloads for XSS, SQLi, SSTI, and Path Traversal to intelligently test input handling.
-   **Active Reflection Analysis**: In `active` mode, submits test payloads and analyzes server responses for reflections. It automatically classifies the reflection context (e.g., `html_tag`, `js_block`, `html_attr`, `json`) to pinpoint the most promising attack vectors.
-   **Intelligent Bypass Suggestions**: Generates actionable walkthroughs and suggestions based on validation profiling and reflection results, guiding you toward a successful exploit.
-   **Multiple Operational Modes**:
    -   **`passive`**: Analyzes the DOM and client-side validation without sending any network requests. Perfect for initial, stealthy reconnaissance.
    -   **`active`**: Sends safe, non-destructive payloads to check for server-side reflections.
    -   **`heavy`**: Expands `active` mode with a wider range of payload encodings for deep WAF/filter bypass testing.
-   **Professional Reporting**: Exports findings to a detailed **JSON** file or displays a compact, prioritized summary directly in the console with `NextRay.report()`.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `Gpt-Validation&Exploit Helper-all‑in‑one Snippet.js`.
5.  Press **Enter**. The `NextRay` object is now available on the `window`.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `NextRay.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, all functionality is accessed through the global `NextRay` object.

### Running a Scan

The primary function is `NextRay.run()`, which accepts a configuration object.

```javascript
// Run in passive mode (no network requests)
NextRay.run({ mode: 'passive' });

// Run in active mode to check for reflections
NextRay.run({ mode: 'active' });

// Run in heavy mode to test WAF bypasses with extra encodings
NextRay.run({ mode: 'heavy' });

// Scan only a specific part of the page, like a login form
NextRay.run({ mode: 'active', scope: '#login-form' });
```

### Viewing Results

After a scan is complete, you can view the results in two ways:

```javascript
// Display a clean, prioritized summary table in the console
NextRay.report();

// Download the complete, detailed findings as a JSON file
NextRay.exportJSON();

// You can also access the raw report object directly
console.log(window.NextRay.__lastReport);
```

### Configuration

You can customize the scan by passing options to `NextRay.run()`. The available options are:

```javascript
const config = {
  // 'passive', 'active', or 'heavy'
  mode: "passive",
  // 'document' or a CSS selector for the root element to scan
  scope: "document",
  // Max fuzzing payloads to try per input
  maxPerInput: 20,
  // Timeout for each network submission in 'active' mode
  submitTimeoutMs: 8000,
  // Whether to scan contenteditable elements
  includeContentEditable: true,
  // Whether to scan hidden inputs
  includeHidden: true,
  // ... and more
};
```

---

## 🏹 Bug Hunting Workflow

NextRay is built to streamline the process of finding input-based vulnerabilities.

1.  **Passive Reconnaissance (Client-Side Analysis)**
    Run `NextRay.run({ mode: 'passive' })` to map all inputs and understand the client-side validation rules without alerting the backend. Check the `charMatrix` in the report to see which special characters (`<`, `>`, `"`, `'`) are allowed. **Inputs that allow these characters are your top priority.**

2.  **Identify Weak Points & Active Probing**
    Look for inputs with weak validation. Run an `active` scan on a specific form or the whole page to test for server-side reflections.
    `NextRay.run({ mode: 'active', scope: '#search-form' })`

3.  **Analyze Reflections**
    Run `NextRay.report()` and examine the `reflections` and `contexts` columns. A high number of reflections is a strong signal.
    -   **`html_tag` or `html_attr` context**: Prime for classic Reflected XSS. Use payloads like `<img src=x onerror=alert(1)>`.
    -   **`js_block` context**: Indicates your input is inside a `<script>` tag. This is a goldmine for XSS. Try breaking out of the current string or context: `';alert(1);'`.
    -   **`json` context**: Your input is reflected inside a JSON object. You might be able to inject properties or break out to execute code.

4.  **Escalate with Heavy Mode**
    If you suspect a Web Application Firewall (WAF) is blocking your basic payloads, use `heavy` mode. This will test various encodings (URL, HTML, Base64, etc.) to find a bypass.
    `NextRay.run({ mode: 'heavy' })`

5.  **Follow Suggestions & Manually Verify**
    The `suggestions` column in the report provides tailored advice. If it says "Reflection contexts: html_attr → craft context‑specific payloads," you should manually test payloads like `onmouseover=alert(1)` or `style=display:none`.

6.  **Document Your Findings**
    Use `NextRay.exportJSON()` to save the full analysis. This detailed report is perfect for attaching to your bug bounty submissions to show your methodology and prove the vulnerability's impact.

---

##  Interpreting the Report

When you run `NextRay.report()`, you'll see a table with these key columns:

-   **target**: The CSS path to the input element.
-   **name**: The `name` attribute of the input, crucial for form submissions.
-   **type**: The input's `type` (e.g., `text`, `hidden`).
-   **reflections**: The number of times test payloads were reflected in server responses. **Higher is better.**
-   **errors**: The number of server or network errors encountered, which can indicate unexpected behavior.
-   **contexts**: A comma-separated list of where your input was reflected (e.g., `html_tag`, `js_block`). **This is the most important column for exploitation.**
-   **suggestions**: Actionable next steps for manual testing and exploitation.

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
