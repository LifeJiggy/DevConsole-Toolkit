# 💎 Gold Digger - P1 Disclosure Extractor

A professional, single-snippet tool for discovering high-value secrets, sensitive endpoints, and risky code patterns directly from your browser's console. Designed for bug bounty hunters, Gold Digger automates the reconnaissance of client-side code to find P1-level vulnerabilities.

**No extensions. No build steps. Pure console-native power.**

---

## 🚀 Key Features

-   **Comprehensive Secret Hunting**: Detects a wide range of secrets including API keys (AWS, GitHub, Stripe), JWTs, private keys, and high-entropy strings.
-   **Sensitive Endpoint & Path Discovery**: Uncovers API endpoints, internal/admin paths, and cloud resource URLs (S3, GCP, Azure).
-   **Business Logic Mapping**: Identifies keywords and code related to authentication, file uploads, business transactions, and user flows.
-   **Code Risk Analysis**: Flags risky sinks (`innerHTML`, `eval`), obfuscation patterns, and potential path traversal or SSRF vectors in JavaScript.
-   **Interactive Console API**: Provides a powerful `GOLD` object to query, filter, and inspect findings directly in the console.
-   **Source Code Navigation**: Instantly jump to the exact line of a finding in the script source using `GOLD.goto()`.
-   **P1 Report Generation**: Includes helper functions to quickly generate, copy, and email P1-ready reports for bug bounty submissions.
-   **Full JS Coverage**: Scans inline scripts, same-origin external scripts, and dynamically added scripts.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `Qwen-Gold.js`.
5.  Press **Enter**. The tool will automatically run and display a summary of its findings.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `GoldDigger.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, all functionality is accessed through the global `GOLD` object.

### Viewing Findings

The easiest way to review findings is with the `GOLD.table()` command.

```javascript
// Display all discovered secrets in a table
GOLD.table('secrets');

// Display risky code patterns (sinks, obfuscation)
GOLD.table('riskySinks'); // or GOLD.risks()

// Display discovered API endpoints
GOLD.table('apiEndpoints');

// Display findings related to authentication
GOLD.table('auth');

// Display all findings as a raw JSON object
console.log(GOLD.json);
```

### Interactive Analysis

Dive deeper into the source code of your findings.

```javascript
// Search all cached source code for a specific pattern
GOLD.find(/dangerouslySetInnerHTML/);

// Jump to the source code of a finding (use the source and line from the table)
GOLD.goto('Inline Script #3', 42);

// Open the external script URL in a new tab
GOLD.open('External Script #5: https://example.com/app.js');
```

### P1 Reporting Workflow

Gold Digger includes helpers to streamline your bug bounty reporting process.

```javascript
// 1. Generate and display a P1 report summary in the console
GOLD.reportP1();

// 2. Copy the full report to your clipboard (requires browser permission)
await GOLD.copyReportP1();

// 3. Download a complete JSON bundle of all findings for your records
GOLD.exportFindings();

// 4. (Optional) Open your default mail client with a pre-filled report template
GOLD.mailtoP1();
```

---

## 🏹 Bug Hunting Workflow

1.  **Initial Scan**: Run the script on your target page. The initial console output will give you a high-level summary of what was found.

2.  **Triage High-Impact Areas**:
    -   Start with `GOLD.table('secrets')`. Any findings here, especially with `HIGH` confidence, are top priority.
    -   Next, check `GOLD.table('riskySinks')`. This reveals dangerous code patterns that could lead to XSS or other injection vulnerabilities.
    -   Review `GOLD.table('internalPaths')` for any exposed admin panels, debug routes, or cloud storage.

3.  **Investigate the Source**:
    -   When you find an interesting item in a table, use `GOLD.goto(source, line)` to inspect the code in its original context. This is crucial for understanding the vulnerability.
    -   For external scripts, use `GOLD.open(source)` to view the full file.

4.  **Explore Functionality**:
    -   Use `GOLD.table('userFlows')` and `GOLD.table('businessLogic')` to understand how the application works.
    -   Look for API endpoints (`GOLD.table('apiEndpoints')`) that correspond to sensitive actions like authentication or payment processing.

5.  **Document and Report**:
    -   Once you've confirmed a vulnerability, use the `GOLD.reportP1()` and `await GOLD.copyReportP1()` commands to quickly generate and copy a detailed report for your submission.

---

## 🗂️ Finding Categories

-   **secrets**: Hardcoded keys, tokens, and high-entropy strings.
-   **apiEndpoints**: URLs related to APIs, GraphQL, etc.
-   **internalPaths**: URLs pointing to admin panels, debug routes, or cloud storage.
-   **auth**: Code and keywords related to authentication flows.
-   **riskySinks**: Potentially dangerous code patterns like `eval` or `innerHTML`.
-   **userFlows**: UI elements and event listeners indicating application functionality.
-   **businessLogic**: Keywords related to payments, subscriptions, and other core business actions.
-   **fileUploads**: Code related to file handling and uploads.
-   **dbCreds**: Keywords indicating potential database credentials.
-   **debugInfo**: Version numbers, debug flags, and internal hostnames.

---

## 🤝 Contributing

Contributions are welcome! If you have an idea for a new feature, a bug fix, or an improvement, please feel free to fork the repository and submit a pull request.

## 📧 Contact

-   **X**: https://x.com/ArkhLifeJiggy
-   **Email**: bloomtonjovish@gmail.com && emperorstephenpee001@gmail.com
