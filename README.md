## ‎🔥 Browser Dev Console Toolkit.
‎
**‎A powerful open-source suite of utilities for extracting, mapping, debugging, inspection, monitoring, and rapid exploration inside the browser console.**


**‎This professional collection of console-ready tools is designed for developers, researchers, and security engineers who need fast, flexible, and stealthy workflows without relying on external dependencies.**


**Built for high-stakes environments where visibility equals control.**  
‎

**No extensions. No network calls. No build steps. Pure console-native execution.**  
‎

**Trusted in production audits, bug bounties, and enterprise performance investigations.**  
‎

**All tools operate at runtime — no compilation, no packaging, no trust assumptions.**  
‎

**Designed to survive minification, CSP restrictions, and anti-debugging measures.**  
‎

**Deployable in under 3 seconds. Silent. Untraceable. Unstoppable.**



## ‎Quick Start
1. **‎In Chrome DevTools**
‎
2. **‎Open DevTools (F12 or Cmd+Option+I).**

3. **‎Navigate to the Sources tab > Snippets panel.**
‎
4. **‎Create a new snippet, paste the code from any tool below, and hit Run (Ctrl+Enter).**
‎
5. **‎Save snippets for reuse—boom, instant toolkit!**
‎


## 📦 NPM Installation

For programmatic access and easy distribution:

```bash
npm install devconsole-toolkit
```

Then in your Node.js code:

```javascript
const toolkit = require('devconsole-toolkit');

// Get any tool's code as a string
const code = toolkit.interactiveMappingClaude;

// Available tools:
// - interactiveMappingClaude
// - interactiveMappingQwen
// - networkMapperGPT
// - networkMapperNextRay
// - parameterExtractor
// - sensitiveDisclosureClaude
// - sensitiveDisclosureQwen
// - userInputExtractor
// - validationExploitHelper

// Copy to clipboard, save to file, or integrate into your workflow
```

Perfect for automation, CI/CD pipelines, or distributing tools programmatically!

## CLI Launcher

Launch tools from the command line with the built-in CLI:

```bash
# List all available tools
node dct.js list

# Get injectable script for a tool
node dct.js inject universal-user

# Open browser + show inject instructions
node dct.js open network-mapper https://target.com

# Start local web server with all tools
node dct.js serve [port]
```

### Tool Keys

| Key | Tool | Category |
|-----|------|----------|
| `universal-user` | Universal User Input | User-Input |
| `nextray-user` | NextRay Validation Scanner | User-Input |
| `parameter-extractor` | Universal Parameter Extractor | Parameter |
| `network-mapper` | Network Mapper | Network |
| `network-probe` | Network Probe (Lightweight) | Network |
| `gold-digger` | Gold Digger — P1 Disclosure | Sensitive-Disclousure |
| `hidden-gold` | Hidden Gold — JS Disclosure | Sensitive-Disclousure |
| `interactive-analysis` | Interactive Web Analysis | Interactive-Mapping |
| `error-handler` | Error & Debug Handler | Error-debug-handling |

## Browser Console Launcher

Start a local server and access all tools from a web dashboard:

```bash
node dct.js serve 8765
# Opens http://localhost:8765 in your browser
```

Each tool card has a **Load Tool** button that injects the script into the current page.

## Universal Console Paste!!!

## For one-off use: Just open the Console tab and paste the snippet directly. Instant gratification!**
‎


## ‎💀☠️Perfect for:
1. **‎Extracting all interactive elements**
‎
2. **‎Detecting All User Inputs & check for reflection via (Body, Dom, sink)**
‎
3. **‎Extracting Parameters across the globe**
‎
4. **‎Debugging hidden behaviors**
‎
5. **‎Full-mapping  user's functionality**
‎
6. ‎**DOM manipulation & event listener inspection**
‎
7. ‎**All Network flows  and monitoring**
‎
8. ‎**Detecting vulnerabilities (XSS, bypass, logic flaws, etc.)**
‎
‎9. **Hunting hidden URLs & flows**
‎
10. ‎**Experimenting with browser-native automation**
‎
‎
‎
‎---

## ‎🚀 Features / Tools
‎1. **Over 10+ custom tools already built, including:**

‎
2. **‎Event Listener Tracker → Inspect and hook into dynamic event listeners.**
‎

‎3. **DOM Manipulator → Live overwrite, inject, and trace DOM changes.**

‎
4. **‎Hidden URL Detector → Surface hidden/obfuscated endpoints.**
‎

5. **‎Console Flow Logger → Stealthy dynamic logging with full trace.**
‎

‎6. **Source Breakpoint Helper → Script-friendly breakpoint manager.**
‎

7. **‎Obfuscation Mapper → Detect patterns & behaviors in obfuscated JS.**
‎

8. **‎Payload Injector → Test sanitization & validation bypasses.**

‎
‎9. **Session Explorer → Inspect storage, cookies, tokens in real time.**
‎

‎10. **XHR/Fetch Interceptor → Hook into requests & responses dynamically.**
‎

11. **‎Bug Hunter Utilities → Advanced snippets for edge-case testing.**
‎

‎12. **and more 🔥**
‎
‎

## ‎Why These Tools?

1. **‎Zero Overhead: Pure vanilla JS—no libraries, no bloat.**
‎
2. **‎Cross-Browser: Tested on Chrome 100+, Firefox 70+, Safari 15+, Edge 100+.**
‎
3. **‎Extensible: Modular design—mix, match, or chain them for custom workflows.**
‎
4. **‎Community-Driven: Built from our shared dev war stories; evolve it with us!**
‎
5. **‎If you've ever muttered "There must be a better way..." while staring at a console, this is it.**
‎


## ‎✅ All tools are **one-liners**. No dependencies.
‎
## ‎> 🧪 Tested on React, Vue, Svelte, Angular, Next.js, legacy jQuery apps, and shady ad networks.

## 📁 Project Structure

```
DevConsole-Toolkit/
├── LICENSE
├── README.md
├── package.json
├── index.js
├── dct.js                    # CLI Launcher
├── dashboard.js              # Unified Browser Console Dashboard
├── agents/
│   ├── agent.js              # Intelligent Automation Agent
│   └── README.md
├── rules/
│   ├── rules.js              # Security Rules Engine
│   └── README.md
├── memory/
│   ├── memory.js             # Persistent State Management
│   └── README.md
├── storage/
│   ├── storage.js            # Browser Storage Manager
│   └── README.md
├── tools/
│   ├── utils.js              # Utility Functions
│   └── README.md
├── dashboard/
│   └── README.md
└── src/
    ├── Error-debug-handling/
    ├── Global-Hunter/
    ├── Interactive-Mapping/
    ├── Network/
    ├── Parameter/
    ├── Sensitive-Disclousure/
    └── User-Input/
```

## 🆕 New Modules (v6.1.0)

### Dashboard (Quick Start)
Paste `dashboard.js` into browser console for instant security scan with scoring:

```js
DCTDashboard.scan()       // Run scan + display results
DCTDashboard.export()     // Download JSON report
DCTDashboard.exportCSV()  // Download CSV report
DCTDashboard.history()    // View scan history
DCTDashboard.help()       // Show all commands
```

### Tools (`tools/utils.js`)
Utility functions for URL parsing, encoding, hashing, validation:

```js
DCTUtils.parseURL(url)
DCTUtils.b64Encode(str)
DCTUtils.sha256(str)
DCTUtils.isJWT(str)
DCTUtils.downloadJSON(data)
```

### Rules (`rules/rules.js`)
Custom security detection rules engine:

```js
DCTRules.add('my-rule', { pattern: /secret/i, severity: 'critical' })
DCTRules.execute(content, source)
DCTRules.executeOnDOM()
DCTRules.save()  // Persist to localStorage
```

### Memory (`memory/memory.js`)
Persistent state for scan results and preferences:

```js
DCTMemory.set('key', value)
DCTMemory.get('key')
DCTMemory.saveScanResult('tool', results)
DCTMemory.compareScans('tool')
```

### Storage (`storage/storage.js`)
Browser storage audit and monitoring:

```js
DCTStorage.auditLocalStorage()
DCTStorage.auditCookies()
DCTStorage.startMonitoring()
DCTStorage.exportJSON()
```

### Agents (`agents/agent.js`)
Intelligent automation workflows:

```js
await DCTAgent.quickAudit()
await DCTAgent.fullRecon()
await DCTAgent.secretHunter()
await DCTAgent.runWorkflow('custom', steps)
```

## 🛠️ Usage

### Interactive Mapping Tools
**Location:** `src/Interactive-Mapping/`

- **`claude-flow.js`** - Interactive flow mapping for Claude AI integration
- **`Qwen-flow.js`** - Interactive flow mapping for Qwen AI models
- **README files** - Detailed documentation for user action flow analysis

**Usage:** Copy and paste the JavaScript files directly into your browser console or DevTools snippets.

### Network Analysis Tools
**Location:** `src/Network/`

- **`GPT-NETWORK-MAPPER.js`** - Advanced network mapping and monitoring
- **`NextRay-DevTools-V2.js`** - Next-generation DevTools for network inspection
- **README files** - Comprehensive guides for network mapping and NextRay usage

**Usage:** Load these scripts in your browser console to monitor and analyze network traffic in real-time.

### Parameter Extraction Tools
**Location:** `src/Parameter/`

- **`🧠-Universal-Parameter-Extractor-Client-Side.js`** - Extract parameters from any web application
- **README.md** - Documentation for parameter extraction techniques

**Usage:** Run the extractor script in your browser console to automatically identify and extract all parameters from the current page.

### Security & Vulnerability Tools
**Location:** `src/Sensitive-Disclousure/`

- **`Claude.js`** - Security analysis tool powered by Claude AI
- **`Qwen-Gold.js`** - Advanced vulnerability detection using Qwen models
- **README files** - Critical security documentation and flaw hunting guides

**Usage:** Use these tools to detect XSS vulnerabilities, logic flaws, and other security issues in web applications.

### User Input Analysis Tools
**Location:** `src/User-Input/`

- **`🧠-Universal-User-Input-Extractor-Client-Side.js`** - Extract all user input fields and data
- **`Validation&Exploit Helper-all‑in‑one Snippet.js`** - Comprehensive validation and exploit testing
- **`input.txt`** - Sample input data for testing
- **README files** - Guides for input analysis and NextRay integration

**Usage:** Deploy these scripts to analyze user inputs, test validation bypasses, and identify potential injection points.

### Quick Start for Any Tool:
1. Navigate to the desired tool directory
2. Copy the JavaScript file content
3. Paste into browser DevTools Console or Snippets
4. Execute and analyze the results
5. Refer to accompanying README files for detailed usage instructions

## Contributing:

‎1. **Love it? Hate a bug? Got a killer snippet to add?  I'm all ears (and code reviewers)!**
    **‎Fork the repo.**
 
‎
2. **‎Create a feature branch (git checkout -b feature/amazing-new-tool).**
‎

3. **‎Commit your changes (git commit -m "Add amazing new tool 🔥").**
‎

4. **‎Push to the branch (git push origin feature/amazing-new-tool).**
‎

5. **‎Open a Pull Request—describe your magic!**
‎

## ‎I follow the Contributor Covenant Code of Conduct. Questions? Ping me in Issues.
‎

## Contact: 

1. **X:https://x.com/ArkhLifeJiggy**

2. **Email: bloomtonjovish@gmail.com && emperorstephenpee001@gmail.com**
    
