# 🚀 Interactive Web Analysis Toolkit

An expert-level, in-browser toolkit for deep DOM analysis, interaction tracing, and reverse-engineering the complete event lifecycle of a web application. Designed for security researchers and QA engineers, this tool provides a comprehensive understanding of how user actions translate into application behavior, all controlled from a powerful console menu.

**No extensions. No build steps. Pure console-native execution.**

> *(Suggestion: Replace this with a GIF showing the console menu and analysis output.)*

---

## 🚀 Key Features

-   **Modular Analysis Engine**: Choose from 13 powerful analysis modules, or run them all at once for a complete picture.
-   **Deep DOM & State Mapping**: Extracts all elements, attributes, computed styles, forms, and JavaScript state (globals, storage, cookies).
-   **Interactive Element Highlighting**: Visually flags all clickable, focusable, and interactive elements on the page with a single command.
-   **Complete Event Lifecycle Tracing**: Hooks `addEventListener` and other event mechanisms to discover, map, and trace all event triggers, listeners, and handlers.
-   **Live User Flow & Network Correlation**: Captures a real-time log of user actions (clicks, keys, etc.) and automatically correlates them with the `fetch`/`XHR` network requests they trigger.
-   **Stack Trace Analysis**: Automatically captures call stacks for asynchronous operations and event callbacks, providing deep context for every action.
-   **Real-time DOM Mutation Monitoring**: Utilizes a `MutationObserver` to track all dynamic content changes, perfect for single-page applications (SPAs).
-   **Hidden Element Discovery**: Uncovers interactive elements that are hidden from view via CSS or attributes, potentially revealing unlinked functionality.
-   **Powerful Console Menu**: A rich, interactive menu system (`showMenu()`) provides full control over all analysis and export functions.
-   **Multi-Format Export**: Download the complete analysis dataset as a structured **JSON** file or a self-contained **HTML report**.

---

## ⚡ Quick Start

Get up and running in seconds.

#### Method 1: Console Paste (Recommended)

1.  Open the target website.
2.  Open your browser's Developer Tools (**F12** or **Cmd+Option+I**).
3.  Navigate to the **Console** tab.
4.  Paste the entire contents of `claude-flow.js`.
5.  Press **Enter**. The welcome banner and menu instructions will appear.

#### Method 2: Browser Snippet

For repeated use, save the script as a Snippet for one-click execution.

1.  In DevTools, go to the **Sources** tab -> **Snippets** panel.
2.  Click **New snippet**.
3.  Paste the script and save it (e.g., as `WebToolkit.js`).
4.  Run it anytime with **Ctrl+Enter** (or **Cmd+Enter**).

---

## 📖 Usage

Once loaded, the toolkit exposes a simple yet powerful API on the `window` object.

### The Interactive Menu

The primary way to control the tool is through the console menu.

```javascript
// Display the main menu with all 13 analysis options.
showMenu();
```

### Programmatic API

You can also call the core functions directly for scripting and automation.

```javascript
// Run a full, comprehensive analysis of all 13 modules.
runAll();

// Run a specific analysis module by its number (e.g., #7 for Network Interception).
runAnalysis(7);

// Run multiple specific modules at once.
runAnalysis([1, 7, 11]); // Run Element Extraction, Network, and Form Analysis

// Export all collected results.
exportResults('json'); // 'json' or 'html'

// Display a summary of current results in the console.
showResults();

// Clear all stored analysis data to start fresh.
clearResults();

// Display the help menu.
getHelp();
```

---

## 🏹 Bug Hunting & QA Workflow

This toolkit is designed to systematically map and analyze a web application's client-side attack surface.

1.  **Initial Reconnaissance**:
    -   Load the script and run `runAll()` to perform a baseline analysis of the entire page. This passively logs all elements, events, network calls, and state.
    -   Alternatively, run modules selectively. Start with `runAnalysis([1, 2, 11])` to map all elements, highlight interactive ones, and analyze forms.

2.  **Map User Functionality**:
    -   Run `runAnalysis(13)` to activate the user interaction tracer.
    -   Navigate through the application's core features (login, search, profile updates). The tool will create a detailed log of your actions.
    -   Inspect the `eventHandlers` and `eventListeners` data to see which DOM elements are tied to which JavaScript functions.

3.  **Analyze State Changes and Network Calls**:
    -   Examine the `networkRequestInterception` and `userInteractionTracing` results together.
    -   **Goal**: Correlate a specific user action (like a button click) to the API call it triggers. This is your entry point for testing the API for vulnerabilities like **IDOR**, **authorization flaws**, and **business logic bypasses**.

4.  **Discover Hidden Attack Surface**:
    -   Run `runAnalysis(12)` to find interactive elements that are hidden via CSS. This can reveal admin functionality or features that are disabled on the frontend but still present in the DOM.

5.  **Trace Data Flow for Injection Vulnerabilities**:
    -   Use the `stackTraceAnalysis` data (Module 6) to trace the origin of an event.
    -   Follow the code path from an event handler to where data is used. If user-controllable data flows into a dangerous sink (`innerHTML`, `eval()`, etc.), you may have found a **DOM XSS** vulnerability.

6.  **Document and Report**:
    -   Use `exportResults('html')` to generate a clean, self-contained HTML report of your entire analysis session.
    -   Use `exportResults('json')` to get the raw data for use in other tools or for detailed bug bounty submissions.

---

## 🗂️ The 13 Analysis Modules

1.  **Element Extraction**: Maps every DOM element with its attributes, styles, and selectors.
2.  **Interactive Highlighting**: Visually flags all interactive elements.
3.  **Event Trigger Detection**: Finds all inline `on*` event attributes.
4.  **Event Listener Monitoring**: Hooks `addEventListener` to capture all registered listeners in real-time.
5.  **Event Handler Discovery**: Finds all `element.on*` property handlers.
6.  **Stack Trace Analysis**: Wraps async functions to capture call stacks when events fire.
7.  **Network Request Interception**: Logs all `fetch` and `XHR` requests.
8.  **JavaScript State Mapping**: Snapshots `localStorage`, `sessionStorage`, cookies, and global variables.
9.  **DOM State Analysis**: Creates a deep map of the DOM structure, styles, and visibility.
10. **DOM Mutation Monitoring**: Tracks all changes to the DOM in real-time.
11. **Form Analysis**: Maps all forms, their inputs, and validation rules.
12. **Hidden Element Detection**: Finds interactive elements that are not visible.
13. **User Interaction Flow Tracing**: Records a sequential log of all user interactions.

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

```

<!--
[PROMPT_SUGGESTION]Add a `teardown()` function to the script to reverse all the monkey-patching and clean up the global scope.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Enhance the HTML export function to create a more interactive report with collapsible sections and search functionality.[/PROMPT_SUGGESTION]
