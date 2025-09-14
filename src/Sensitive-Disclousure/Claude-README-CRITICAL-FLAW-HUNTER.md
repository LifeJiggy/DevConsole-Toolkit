# 🔥💀 Critical Flaw Hunter 💀🔥

A professional, single-snippet toolkit for post-reconnaissance attack surface analysis and vulnerability prioritization. Designed for bug bounty hunters to find critical flaws faster by focusing on high-risk application areas.

**No extensions. No build steps. Pure console-native execution.**

---

## 🚀 Key Features

-   **Risk-Based Prioritization**: Automatically categorizes discovered endpoints and functions into risk categories like `Authentication`, `Access Control`, and `Business Logic`.
-   **Comprehensive Endpoint Discovery**: Scans the DOM, JavaScript, network requests, sitemaps, and `robots.txt` to build a complete map of the application's endpoints.
-   **Advanced Vulnerability Scanning**: Actively probes for high-impact vulnerabilities including XSS, SSRF, XXE, and RCE vectors within JavaScript flows.
-   **Gatekeeper Analysis**: Identifies security controls like authentication checks, authorization functions, CSRF protection, and rate limiting for bypass testing.
-   **State-Changer Identification**: Pinpoints functions and forms that modify application state (e.g., `POST`, `PUT`, `DELETE`), highlighting critical business logic flows.
-   **Sensitive Data Exposure Detection**: Scans page content and local storage for exposed secrets, keys, and tokens.
-   **Heavy Application Support**: Uses batching and asynchronous processing to handle large and complex single-page applications without freezing the browser.
-   **Professional Reporting**: Exports all findings into a structured JSON file for easy integration with other tools and reporting.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `claude.js`.
5.  Press **Enter**. The tool will automatically start its initial hunt.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `FlawHunter.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, all functionality is accessed through the global `hunter` object.

```javascript
// Start the main scan to map and prioritize the attack surface.
hunter.hunt();

// Run advanced, active scans for vulnerabilities like SSRF and RCE.
hunter.deepScan();

// Display a high-level overview of the attack surface by risk category.
hunter.quickSummary();

// Get context-aware payloads for manual testing of discovered endpoints.
hunter.generatePayloads();

// Download the complete analysis as a JSON file for reporting.
hunter.exportResults();
```

---

## 🏹 Bug Hunting Workflow

This tool is designed to move from broad reconnaissance to targeted exploitation.

1.  **Initial Hunt**
    Run `hunter.hunt()` on your target page. The tool will automatically discover endpoints and categorize them by risk.

2.  **Triage by Risk**
    Review the prioritized attack surface in the console output. Focus on `CRITICAL` (Authentication, Business Logic) and `HIGH` (Access Control, API) categories first. These are your most likely P1 targets.

3.  **Analyze State Changers**
    Examine the identified state-changing operations (e.g., `POST /api/user/delete`, `PUT /api/profile`). These are prime targets for **IDOR**, **Business Logic Flaws**, and **Race Conditions**.

4.  **Probe Gatekeepers**
    The tool identifies authentication and authorization functions. Use the browser's debugger to set breakpoints in these functions and attempt to bypass them by modifying variables or return values.

5.  **Deep Scan for Vulnerabilities**
    Run `hunter.deepScan()` to actively check for code injection, SSRF, and other server-side vulnerabilities in the discovered JavaScript flows.

6.  **Manual Exploitation**
    Use `hunter.generatePayloads()` to get a list of tailored payloads. Use these with a proxy like Burp Suite to manually test the most promising endpoints you've identified.

7.  **Export & Report**
    Once you've found a vulnerability, use `hunter.exportResults()` to download a clean JSON report. This provides excellent evidence for your bug bounty submission.

---

## 🗂️ Attack Surface Categories

-   **🔐 Authentication/Session**: Login, logout, password reset, JWT/token handling.
-   **🛡️ Access Control**: Admin panels, user management, permission-based endpoints.
-   **📝 Data Input & Rendering**: Forms, file uploads, search queries, and other user-supplied data sinks.
-   **💰 Business Transactions**: Checkout, payments, subscriptions, and other core financial flows.
-   **🔌 API & State Changes**: Endpoints that create, update, or delete data (`POST`, `PUT`, `DELETE`).
-   **🔑 Session Management**: Cookie handling, session invalidation, and timeout logic.
-   **✅ Input Validation**: Functions related to sanitization, filtering, and validation.
-   **🚨 Error Handling**: Code that handles exceptions and errors, which may leak information.
-   **🔗 Third-Party Integrations**: OAuth flows, webhooks, and other external service calls.

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
