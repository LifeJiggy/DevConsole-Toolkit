#!/usr/bin/env node
/**
 * DevConsole Toolkit — CLI Launcher
 * Usage: node dct.js [command] [tool-name] [url]
 *
 * Commands:
 *   list                        — List all available tools
 *   info <tool>                 — Show tool details
 *   inject <tool> [url]         — Generate injectable script for browser console
 *   open <tool> <url>           — Open URL in browser and copy tool script
 *   serve [port]                — Start local HTTP server for tool access
 *   help                        — Show CLI help
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const SRC = path.join(__dirname, "src");

const TOOLS = {
  "universal-user": {
    name: "Universal User Input",
    file: "src/User-Input/Universal-User-.js",
    category: "User-Input",
    description: "Extracts all user input handlers, DOM injection sinks, event listeners, and input validation patterns",
    commands: ["run()", "HELP()", "CLEANUP()", "generateAllPayloads()"],
    load: "console.log('(paste Universal-User-.js content)');"
  },
  "nextray-user": {
    name: "NextRay Validation Scanner",
    file: "src/User-Input/NextRay.js",
    category: "User-Input",
    description: "10 security scans for input validation, debug endpoints, info disclosure, framework patterns",
    commands: ["NextRay.run()", "NextRay.report()", "NextRay.HELP()", "NextRay.CLEANUP()"]
  },
  "parameter-extractor": {
    name: "Universal Parameter Extractor",
    file: "src/Parameter/Universal-Parameter-Extractor-Client-Side.js",
    category: "Parameter",
    description: "Extracts GET, POST, hash, cookie, localStorage, sessionStorage parameters with cross-validation",
    commands: ["run()", "HELP()", "CLEANUP()", "exportJSON()"]
  },
  "network-mapper": {
    name: "Network Mapper",
    file: "src/Network/Nerwork-Mapper.js",
    category: "Network",
    description: "Full network mapper — intercepts fetch/XHR, CORS analysis, cookie security, JWT analysis, GraphQL detection",
    commands: ["NetworkMapper.start()", "NetworkMapper.stop()", "NetworkMapper.scoreTraffic()", "NetworkMapper.HELP()"]
  },
  "network-probe": {
    name: "Network Probe (Lightweight)",
    file: "src/Network/NextRay-DevTools-V2.js",
    category: "Network",
    description: "Lightweight network X-Ray — security scoring, data exposure detection, traffic analysis",
    commands: ["NetworkProbe.start()", "NetworkProbe.stop()", "NetworkProbe.HELP()"]
  },
  "gold-digger": {
    name: "Gold Digger — P1 Disclosure",
    file: "src/Sensitive-Disclousure/Gold-Digger.js",
    category: "Sensitive-Disclousure",
    description: "P1 credential/API key/secret scanner with live fetch interception",
    commands: ["run()", "HELP()", "CLEANUP()"]
  },
  "hidden-gold": {
    name: "Hidden Gold — JS Disclosure",
    file: "src/Sensitive-Disclousure/Hidden-Gold.js",
    category: "Sensitive-Disclousure",
    description: "Deep JavaScript source code disclosure scanner — API keys, tokens, secrets, URLs, credentials",
    commands: ["run()", "HELP()", "CLEANUP()"]
  },
  "interactive-analysis": {
    name: "Interactive Web Analysis",
    file: "src/Interactive-Mapping/Interactive-Web-Analysis.js",
    category: "Interactive-Mapping",
    description: "DOM mutation tracking, event flow mapping, page interaction analysis, collaborative export",
    commands: ["run()", "startMutationTracking()", "exportHTMLReport()", "HELP()"]
  },
  "error-handler": {
    name: "Error & Debug Handler",
    file: "src/Error-debug-handling/Error-handling-debugger.js",
    category: "Error-debug-handling",
    description: "Error interception, debug mode detection, performance monitoring, console message capture",
    commands: ["start()", "stop()", "getReport()", "HELP()"]
  }
};

// ─── Helpers ───────────────────────────────────────────────────────
function c(color, text) {
  const colors = { red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", cyan: "\x1b[36m", bold: "\x1b[1m", dim: "\x1b[2m", reset: "\x1b[0m" };
  return (colors[color] || "") + text + colors.reset;
}

function header() {
  console.log(c("cyan", "\n╔══════════════════════════════════════════════════╗"));
  console.log(c("cyan", "║") + c("bold", "    DevConsole Toolkit — CLI Launcher v6.0.1     ") + c("cyan", "║"));
  console.log(c("cyan", "╚══════════════════════════════════════════════════╝\n"));
}

// ─── Commands ──────────────────────────────────────────────────────
function cmdList() {
  header();
  console.log(c("yellow", "Available Tools:"));
  console.log("─".repeat(55));
  Object.entries(TOOLS).forEach(([key, t]) => {
    console.log(c("green", "  " + key.padEnd(28)) + c("dim", t.category.padEnd(22)) + t.description.slice(0, 50));
  });
  console.log("─".repeat(55));
  console.log(c("dim", "  Use: node dct.js info <tool>     — View details"));
  console.log(c("dim", "  Use: node dct.js inject <tool>   — Get injectable script"));
  console.log(c("dim", "  Use: node dct.js open <tool> <url> — Open browser + inject"));
  console.log();
}

function cmdInfo(toolKey) {
  const t = TOOLS[toolKey];
  if (!t) { console.error(c("red", "  Unknown tool: " + toolKey)); console.log(c("dim", "  Run: node dct.js list")); return; }
  header();
  console.log(c("bold", "  " + t.name));
  console.log(c("dim", "  Category: " + t.category));
  console.log(c("dim", "  File:     " + t.file));
  console.log("  " + t.description);
  console.log(c("yellow", "\n  Commands:"));
  t.commands.forEach(cmd => console.log(c("green", "    " + cmd)));
  console.log();
}

function cmdInject(toolKey) {
  const t = TOOLS[toolKey];
  if (!t) { console.error(c("red", "  Unknown tool: " + toolKey)); return; }
  const filePath = path.join(__dirname, t.file);
  if (!fs.existsSync(filePath)) { console.error(c("red", "  File not found: " + t.file)); return; }
  header();
  console.log(c("yellow", "  Inject into browser console:"));
  console.log(c("dim", "  ─────────────────────────────"));
  console.log(c("cyan", "  1. Open DevTools (F12) on your target page"));
  console.log(c("cyan", "  2. Paste the following into Console:"));
  console.log(c("dim", "  ─────────────────────────────\n"));
  // Output a compact loader that fetches from local file
  const content = fs.readFileSync(filePath, "utf8");
  // Wrap in try-catch for safety
  console.log("try {\n" + content + '\nconsole.log("%c✓ ' + t.name + ' loaded!", "color: #27ae60; font-weight: bold");\n} catch(e) { console.error("Load error:", e); }');
  console.log(c("dim", "\n  ─────────────────────────────"));
  console.log(c("green", "  Script length: " + content.length + " chars"));
  console.log();
}

function cmdOpen(toolKey, url) {
  const t = TOOLS[toolKey];
  if (!t) { console.error(c("red", "  Unknown tool: " + toolKey)); return; }
  if (!url) { console.error(c("red", "  URL required: node dct.js open " + toolKey + " <url>")); return; }
  // Ensure URL has protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
  header();
  console.log(c("cyan", "  Opening: " + url));
  console.log(c("dim", "  Tool: " + t.name));
  console.log(c("yellow", "\n  Instructions:"));
  console.log(c("cyan", "  1. Browser will open to " + url));
  console.log(c("cyan", "  2. Open DevTools (F12) → Console"));
  console.log(c("cyan", "  3. Run: " + (t.commands[0] || "run()")));
  console.log(c("dim", "  Or paste the full tool with: node dct.js inject " + toolKey));
  console.log();
  // Try to open browser
  const platform = process.platform;
  const cmd = platform === "win32" ? "start" : platform === "darwin" ? "open" : "xdg-open";
  try { execSync(cmd + ' "' + url + '"', { stdio: "ignore" }); } catch (e) { /* manual open */ }
}

function cmdServe(port) {
  port = port || 8765;
  const http = require("http");
  const server = http.createServer((req, res) => {
    let url = req.url;
    if (url === "/" || url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(generateIndexPage());
      return;
    }
    // Serve tool files
    let filePath = path.join(SRC, url);
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(filePath);
    const mime = { ".js": "application/javascript", ".html": "text/html", ".css": "text/css", ".md": "text/markdown" };
    res.writeHead(200, { "Content-Type": mime[ext] || "text/plain" });
    res.end(fs.readFileSync(filePath, "utf8"));
  });
  server.listen(port, () => {
    header();
    console.log(c("green", "  Server running at: http://localhost:" + port));
    console.log(c("cyan", "  Open this page in any browser to access all tools.\n"));
    console.log(c("dim", "  Press Ctrl+C to stop.\n"));
    try { execSync((process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open") + ' "http://localhost:' + port + '"', { stdio: "ignore" }); } catch (e) {}
  });
}

function generateIndexPage() {
  const toolList = Object.entries(TOOLS).map(([key, t]) => {
    const filePath = path.join(__dirname, t.file);
    const exists = fs.existsSync(filePath);
    return `<div class="tool-card">
  <h3>${t.name}</h3>
  <p class="cat">${t.category}</p>
  <p>${t.description}</p>
  <div class="cmds">${t.commands.map(c => "<code>" + c + "</code>").join(" ")}</div>
  ${exists ? '<button onclick="loadTool(\'' + key + '\',\'' + t.file.replace(/\\/g, "/") + '\')">Load Tool</button>' : '<span class="missing">File not found</span>'}
</div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DevConsole Toolkit</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 2rem; }
h1 { color: #00d4ff; font-size: 2rem; margin-bottom: 0.5rem; }
.subtitle { color: #888; margin-bottom: 2rem; }
.tool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1rem; }
.tool-card { background: #141414; border: 1px solid #2a2a2a; border-radius: 8px; padding: 1.2rem; transition: border-color 0.2s; }
.tool-card:hover { border-color: #00d4ff; }
.tool-card h3 { color: #00d4ff; margin-bottom: 0.3rem; font-size: 1.1rem; }
.cat { color: #666; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.5rem; }
.tool-card p { color: #aaa; font-size: 0.9rem; margin-bottom: 0.8rem; }
.cmds { margin-bottom: 0.8rem; }
.cmds code { background: #1e1e1e; color: #4ec9b0; padding: 2px 6px; border-radius: 3px; font-size: 0.8rem; margin-right: 4px; }
button { background: #00d4ff; color: #000; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; }
button:hover { background: #00b8e6; }
.missing { color: #666; font-style: italic; }
#injected { position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a2e; border-top: 2px solid #00d4ff; padding: 1rem; display: none; max-height: 40vh; overflow: auto; }
#injected pre { color: #4ec9b0; font-size: 0.85rem; white-space: pre-wrap; }
.injected-label { color: #00d4ff; font-weight: bold; margin-bottom: 0.5rem; }
</style></head>
<body>
<h1>DevConsole Toolkit</h1>
<p class="subtitle">Browser console security tools — click Load to inject into current page</p>
<div class="tool-grid">${toolList}</div>
<div id="injected"><div class="injected-label">✓ Tool loaded — check browser console</div><pre id="code-preview"></pre></div>
<script>
function loadTool(key, file) {
  fetch('/' + file.replace('src/', '')).then(r => r.text()).then(code => {
    try { eval(code); } catch(e) { console.error('Load error:', e); }
    var el = document.getElementById('injected');
    document.getElementById('code-preview').textContent = 'Tool loaded: ' + key + '\\nCheck browser console (F12 → Console)';
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 5000);
  });
}
</script>
</body></html>`;
}

function cmdHelp() {
  header();
  console.log(c("bold", "  Commands:"));
  console.log("  " + c("green", "list") + "                        List all tools");
  console.log("  " + c("green", "info <tool>") + "                Show tool details");
  console.log("  " + c("green", "inject <tool>") + "              Copy injectable script to clipboard");
  console.log("  " + c("green", "open <tool> <url>") + "          Open browser + show inject instructions");
  console.log("  " + c("green", "serve [port]") + "               Start local HTTP server (default: 8765)");
  console.log("  " + c("green", "help") + "                       Show this help");
  console.log(c("dim", "\n  Tool keys: " + Object.keys(TOOLS).join(", ")));
  console.log();
}

// ─── Main ──────────────────────────────────────────────────────────
const [,, cmd, toolKey, url] = process.argv;

switch (cmd) {
  case "list": cmdList(); break;
  case "info": cmdInfo(toolKey); break;
  case "inject": cmdInject(toolKey); break;
  case "open": cmdOpen(toolKey, url || toolKey); break;
  case "serve": cmdServe(toolKey); break;
  case "help": case undefined: cmdHelp(); break;
  default: console.error(c("red", "  Unknown command: " + cmd)); cmdHelp(); break;
}
