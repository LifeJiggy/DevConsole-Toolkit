# 🌊 User Action Flow Analyzer

A comprehensive, in-browser toolkit for reverse-engineering user interactions, mapping DOM states, and analyzing the complete event lifecycle of a web application. Designed for security researchers and QA engineers, this tool provides a deep understanding of how a user's actions translate into application behavior.

**No extensions. No build steps. Pure console-native execution.**

> *(Suggestion: Replace this with a GIF showing the UI panel and console output.)*

---

## 🚀 Key Features

-   **Full DOM & Element Mapping**: Extracts every element, its attributes, and computed styles to build a complete structural map.
-   **Interactive Element Highlighting**: Visually identifies all clickable, focusable, and interactive elements on the page with a single command.
-   **Deep Event Analysis**: Discovers and maps all event triggers, listeners (via `addEventListener` hooking), and handlers to understand how the application responds to user input.
-   **Live User Flow Tracing**: Captures a real-time, sequential log of user actions (clicks, key presses, form submissions) complete with stack traces for deep context.
-   **Network Correlation**: Hooks `fetch` and `XHR` to automatically correlate network requests with the user actions that trigger them.
-   **Complete State Snapshotting**: Maps JavaScript state (global variables, `localStorage`, `sessionStorage`, cookies) and the full DOM state at any point in time.
-   **Real-time DOM Mutation Monitoring**: Uses a throttled `MutationObserver` to track dynamic content changes, perfect for single-page applications (SPAs).
-   **Hidden Element Discovery**: Uncovers interactive elements that are hidden from view via CSS or attributes, potentially revealing unlinked functionality.
-   **Interactive UI Panel**: A draggable banner provides one-click access to run analyses and download results.
-   **Modular Analysis**: Run all 13 analysis steps at once or select specific ones for targeted investigation.
-   **Data Export**: Download the complete analysis dataset as a single JSON file for offline analysis or reporting.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `Qwen-flow.js`.
5.  Press **Enter**. The UI panel will appear on the page.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `FlowAnalyzer.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

The tool can be controlled via the interactive UI panel or programmatically from the console.

### The Interactive UI Panel

The draggable banner is the easiest way to use the tool:

-   **Run All**: Executes all 13 analysis modules and logs the results.
-   **Steps…**: Opens a panel to select and run specific analysis steps (e.g., only run network tracking and event listener mapping).
-   **Download**: Exports the entire `analysisData` object as a JSON file.
-   **Unhighlight**: Removes the visual highlights from interactive elements.
-   **Minimize/Close**: Toggles the panel's visibility.

### Programmatic API

All features are available as global functions on the `window` object.

```javascript
// Run a full, comprehensive analysis.
window.userActionAnalysis();

// Get a list of all available analysis steps.
window.userActionGetSteps();
/* Returns:
[
  { step: 1, name: 'Extract All Elements with Attributes', key: 'elements' },
  { step: 2, name: 'Highlight Interactive Elements', key: 'interactiveElements' },
  ...and so on for all 13 steps.
]
*/

// Run specific steps (e.g., only track user actions and network requests).
window.userActionRun([7, 11]);

// Download the results of a specific analysis step (e.g., step 11: User Actions).
window.userActionDownload(11, 'user_actions.json');

// Download the entire collected dataset.
window.userActionDownload('analysisData', 'full_report.json');

// Manually remove highlights added by Step 2.
window.userActionRemoveHighlights();

// Control the UI panel.
window.userActionShowBanner();
window.userActionHideBanner();
```

---

## 🏹 Bug Hunting & QA Workflow

This tool is designed to give you a complete picture of an application's client-side logic.

1.  **Initial Reconnaissance**:
    -   Load the script and click **Run All** on the UI panel.
    -   Interact with the application's core features (login, search, profile updates, etc.). The tool will passively log all actions, DOM changes, and network calls.

2.  **Map User Functionality**:
    -   Inspect the `eventHandlers` and `eventListeners` data. This tells you which DOM elements are tied to JavaScript functions.
    -   Use the `userActions` log to see a chronological flow of events. This helps you understand multi-step processes.

3.  **Analyze State Changes and Network Calls**:
    -   Look at the `ajaxData` (XHR/Fetch) and `userActions` logs together.
    -   **Goal**: Correlate a specific user action (like a button click) to the API call it triggers. This is your entry point for testing the API for vulnerabilities like **IDOR**, **authorization flaws**, and **business logic bypasses**.

4.  **Discover Hidden Attack Surface**:
    -   Run the "Hidden Element Detection" (Step 12). This can reveal admin functionality or features that are disabled on the frontend but still present in the DOM.
    -   Analyze the `elements` and `functionalityStates` data to find forms or inputs that aren't immediately visible.

5.  **Trace Data Flow for Injection Vulnerabilities**:
    -   Use the `stackTraces` data to trace the origin of an event.
    -   Follow the code path from an event handler to where data is used. If user-controllable data flows into a dangerous sink (`innerHTML`, `eval()`, etc.), you may have found a **DOM XSS** vulnerability.

6.  **Document and Report**:
    -   Use `window.userActionDownload()` to save your entire analysis session.
    -   This JSON file provides concrete evidence of application flows, event handlers, and network activity, making for a high-quality bug bounty report.

---

## 🗂️ The 13 Analysis Modules

1.  **Element Extraction**: Maps every DOM element and its attributes.
2.  **Interactive Highlighting**: Visually flags interactive elements.
3.  **Event Trigger Detection**: Finds inline `on*` event attributes.
4.  **Event Listener Monitoring**: Hooks `addEventListener` to capture all registered listeners.
5.  **Event Handler Discovery**: Finds all `element.on*` property handlers.
6.  **Stack Trace Analysis**: Wraps handlers to capture call stacks when events fire.
7.  **Network Request Interception**: Logs all `fetch` and `XHR` requests.
8.  **JavaScript State Mapping**: Snapshots `localStorage`, `sessionStorage`, cookies, and globals.
9.  **DOM State Analysis**: Creates a deep map of the DOM structure, styles, and visibility.
10. **DOM Mutation Monitoring**: Tracks all changes to the DOM in real-time.
11. **User Action Flow Tracing**: Records a sequential log of all user interactions.
12. **Hidden Element Detection**: Finds interactive elements that are not visible.
13. **Functionality State Mapping**: Analyzes forms and their inputs in detail.

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
