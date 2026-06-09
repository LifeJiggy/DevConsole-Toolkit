// DOM Reflection and Sink Analyzer Tool
// Run in DevTools console to analyze interactive elements for reflections and sinks.
// Features:
// 1. Extracts interactive elements (forms, inputs, buttons, etc.) with attributes.
// 2. Maps triggers, listeners, and handlers for these elements.
// 3. Checks for reflections in DOM/body (e.g., URL params, innerHTML).
// 4. Identifies potential sinks (e.g., eval, innerHTML, document.write).
// 5. Allows calling checkReflectionsAndSinks() with specific elements after declaration.
// 6. Outputs results via console, JSON, or UI, with save-at-any-stage.
// Usage: Run script, use menu to extract/map, then call checkReflectionsAndSinks() with elements.

(function () {
  "use strict";

  // Helper: Escape HTML
  function escapeHTML(str) {
    if (typeof str !== "string") return String(str);
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Helper: Escape CSV
  function escapeCSV(str) {
    if (typeof str !== "string") return String(str);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  // Banner
  console.log(
    "%cDOM Reflection & Sink Analyzer",
    "font-size: 20px; color: purple; font-weight: bold;"
  );
  console.log(
    "%cAnalyze interactive elements for reflections and sinks in DOM/body.",
    "font-size: 16px; color: blue;"
  );
  console.log("Features:");
  const features = [
    "1. Extract Interactive Elements (forms, inputs, buttons, etc.)",
    "2. Map Event Triggers, Listeners, and Handlers",
    "3. Check Reflections in DOM/Body (e.g., URL params, innerHTML)",
    "4. Identify Sinks (e.g., eval, innerHTML, document.write)",
    "5. Monitor DOM Mutations for Changes",
  ];
  features.forEach((f) => console.log(f));
  console.log(
    'Enter 1-5 to run a feature, "all" for all, "save" for JSON, "exit" to quit.'
  );
  console.log(
    "After extraction, call checkReflectionsAndSinks(elements) to test specific elements."
  );

  // Global storage
  const outputs = {};
  let mutationObservers = [];
  let interactiveElements = [];

  // Helper: Output handling
  function handleOutput(featureNum, output) {
    outputs[featureNum] = output;
    let choice = prompt(
      `Feature ${featureNum} done! Output via: console, json, ui (comma-separated or "all"). Leave blank to skip.`
    );
    if (!choice) return;
    choice = choice
      .toLowerCase()
      .split(",")
      .map((c) => c.trim());
    if (choice.includes("all")) choice = ["console", "json", "ui"];

    if (choice.includes("console"))
      console.log(`Feature ${featureNum}:`, output);

    if (choice.includes("json")) {
      const jsonStr = JSON.stringify(output, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflection_sink_feature_${featureNum}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
    }

    if (choice.includes("ui")) {
      const uiDiv = document.createElement("div");
      uiDiv.style.position = "fixed";
      uiDiv.style.top = "20px";
      uiDiv.style.right = "20px";
      uiDiv.style.background = "#fff";
      uiDiv.style.border = "2px solid purple";
      uiDiv.style.padding = "15px";
      uiDiv.style.maxWidth = "50vw";
      uiDiv.style.maxHeight = "80vh";
      uiDiv.style.overflow = "auto";
      uiDiv.style.zIndex = "10000";
      const pre = document.createElement("pre");
      pre.style.whiteSpace = "pre-wrap";
      pre.textContent = JSON.stringify(output, null, 2);
      const heading = document.createElement("h3");
      heading.textContent = `Feature ${featureNum} Output`;
      uiDiv.appendChild(heading);
      uiDiv.appendChild(pre);
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.marginTop = "10px";
      closeBtn.addEventListener("click", () => uiDiv.remove());
      uiDiv.appendChild(closeBtn);
      document.body.appendChild(uiDiv);
    }
  }

  // Helper: Save all outputs
  function saveAllAsJson() {
    if (!Object.keys(outputs).length) {
      console.log("No outputs to save.");
      return;
    }
    const jsonStr = JSON.stringify(outputs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reflection_sink_all_outputs.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
  }

  // Main Function: Check Reflections and Sinks
  window.checkReflectionsAndSinks = function (elements) {
    const results = { reflections: [], sinks: [] };
    const sinks = [
      "innerHTML",
      "outerHTML",
      "document.write",
      "document.writeln",
      "eval",
      "setTimeout",
      "setInterval",
      "Function",
    ];

    Array.from(elements).forEach((el) => {
      if (!el || !el.tagName) return;
      const elInfo = `${el.tagName}#${el.id || ""}.${el.className || ""}`;
      // Check reflections (DOM/body)
      const inputs =
        el.tagName.toLowerCase() === "input" ||
        el.tagName.toLowerCase() === "textarea"
          ? [el]
          : el.querySelectorAll("input, textarea");
      inputs.forEach((input) => {
        const testValue = `test${Math.random().toString(36).slice(2)}`;
        input.value = testValue;
        const reflected = [];
        // Check URL params
        const url = new URL(window.location);
        if (url.search.includes(testValue) || url.hash.includes(testValue)) {
          reflected.push({
            type: "URL",
            value: testValue,
            location: url.toString(),
          });
        }
        // Check DOM/body
        if (document.body.innerHTML.includes(testValue)) {
          reflected.push({
            type: "Body",
            value: testValue,
            elements: Array.from(
              document.querySelectorAll(
                `:not(input):not(textarea):not(script):not(style):not([type="hidden"])`
              )
            )
              .filter((e) => e.textContent.includes(testValue))
              .map((e) => `${e.tagName}#${e.id || ""}`),
          });
        }
        if (reflected.length)
          results.reflections.push({ element: elInfo, reflected });
      });

      // Check sinks in handlers/listeners
      const handlers = {};
      for (let attr in el)
        if (Object.prototype.hasOwnProperty.call(el, attr) && attr.startsWith("on") && el[attr])
          handlers[attr] = el[attr].toString();
      const listeners =
        typeof getEventListeners === "function" ? getEventListeners(el) : {};
      const codeSnippets = Object.values(handlers).concat(
        Object.values(listeners).map((l) => l.listener.toString())
      );
      codeSnippets.forEach((code) => {
        sinks.forEach((sink) => {
          if (code.includes(sink)) {
            results.sinks.push({ element: elInfo, sink, code });
          }
        });
      });
    });

    handleOutput("custom", {
      description: "Check Reflections and Sinks",
      data: results,
    });
    return results;
  };

  // Feature Functions
  const featureFunctions = {
    1: () => {
      const selectors =
        'form, input, button, textarea, select, [onclick], [onchange], [onsubmit], [role="button"], [role="link"], [tabindex]';
      interactiveElements = Array.from(
        document.querySelectorAll(selectors)
      ).map((el) => ({
        element: el,
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        class: el.className || null,
        attributes: Array.from(el.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
      }));
      return { description: features[0], data: interactiveElements };
    },
    2: () => {
      const data = interactiveElements.map(({ element: el }) => {
        const handlers = {};
        for (let attr in el)
          if (Object.prototype.hasOwnProperty.call(el, attr) && attr.startsWith("on") && el[attr])
            handlers[attr] = el[attr].toString();
        const listeners =
          typeof getEventListeners === "function" ? getEventListeners(el) : {};
        return {
          element: `${el.tagName}#${el.id || ""}.${el.className || ""}`,
          handlers,
          listeners: Object.keys(listeners).map((k) => ({
            event: k,
            code: listeners[k].map((l) => l.listener.toString()),
          })),
        };
      });
      interactiveElements.forEach(({ element: el }) => {
        el.style.border = "2px solid red";
        el.addEventListener("click", () =>
          console.trace(`Trigger on ${el.tagName}#${el.id || ""}`)
        );
      });
      return { description: features[1], data };
    },
    3: () => {
      const results = window.checkReflectionsAndSinks(
        interactiveElements.map((e) => e.element)
      );
      return { description: features[2], data: results };
    },
    4: () => {
      const results = window.checkReflectionsAndSinks(
        interactiveElements.map((e) => e.element)
      );
      return { description: features[3], data: results.sinks };
    },
    5: () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          console.log("DOM Mutation:", m);
          if (m.addedNodes.length) console.log("Added:", m.addedNodes);
          if (m.removedNodes.length) console.log("Removed:", m.removedNodes);
          if (m.type === "attributes")
            console.log("Attribute Change:", m.attributeName, "on", m.target);
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      mutationObservers.push(observer);
      return {
        description: features[4],
        message: "Mutation observer attached",
      };
    },
  };

  // Menu Loop
  function menuLoop() {
    let input = prompt(
      'Choose: 1-5 (feature), "all" (run all), "save" (export JSON), "exit" (quit):'
    );
    input = input?.toLowerCase().trim();
    if (!input || input === "exit") {
      console.log(
        "Tool exited. Listeners/observers remain active—refresh to reset."
      );
      return;
    }

    if (input === "all") {
      for (let i = 1; i <= 5; i++) {
        const output = featureFunctions[i]();
        handleOutput(i, output);
      }
    } else if (input === "save") {
      saveAllAsJson();
    } else {
      const num = parseInt(input);
      if (num >= 1 && num <= 5) {
        const output = featureFunctions[num]();
        handleOutput(num, output);
      } else {
        console.log('Invalid—try 1-5, "all", "save", or "exit".');
      }
    }

    setTimeout(menuLoop, 0);
  }

  // ===========================================
  // 20 NEW FEATURES
  // ===========================================

  // Feature 6: javascript: URI Detection
  function detectJavascriptURIs() {
    const findings = [];
    document.querySelectorAll("[href], [src], [action], [formaction], [data], [poster], [background]").forEach((el) => {
      ["href", "src", "action", "formaction", "data", "poster", "background"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (val && /^\s*javascript\s*:/i.test(val)) {
          findings.push({ element: el.tagName + "#" + (el.id || ""), attribute: attr, value: val.substring(0, 80), risk: "CRITICAL" });
        }
      });
    });
    console.log("%c⚡ javascript: URI Detection:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo javascript: URIs found.", "color: #27ae60;");
    return findings;
  }
  window.detectJavascriptURIs = detectJavascriptURIs;

  // Feature 7: DOM Clobbering Detection
  function detectDOMClobbering() {
    const findings = [];
    const globals = new Set(["document", "window", "self", "top", "parent", "location", "chrome", "fetch", "XMLHttpRequest", "localStorage", "sessionStorage", "navigator", "history", "screen", "performance", "crypto"]);
    document.querySelectorAll("[id], [name]").forEach((el) => {
      const id = el.id || el.getAttribute("name");
      if (id && (el.tagName === "A" || el.tagName === "FORM" || el.tagName === "IMG" || el.tagName === "IFRAME" || el.tagName === "INPUT") && globals.has(id)) {
        findings.push({ identifier: id, tag: el.tagName, risk: "CRITICAL", description: "Shadows global '" + id + "'" });
      }
    });
    console.log("%c🔍 DOM Clobbering:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo DOM clobbering vectors.", "color: #27ae60;");
    return findings;
  }
  window.detectDOMClobbering = detectDOMClobbering;

  // Feature 8: CSP Analysis
  function analyzeCSP() {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = meta?.getAttribute("content");
    const result = { hasCSP: !!content, directives: {}, weaknesses: [], recommendations: [] };
    if (content) {
      content.split(";").map((d) => d.trim()).filter(Boolean).forEach((dir) => {
        const [name, ...vals] = dir.split(/\s+/);
        result.directives[name.toLowerCase()] = vals.join(" ");
      });
      const scriptSrc = result.directives["script-src"] || result.directives["default-src"] || "";
      if (scriptSrc.includes("'unsafe-inline'")) result.weaknesses.push("unsafe-inline in script-src");
      if (scriptSrc.includes("'unsafe-eval'")) result.weaknesses.push("unsafe-eval in script-src");
      if (scriptSrc.includes("*")) result.weaknesses.push("wildcard in script-src");
      if (!result.directives["script-src"]) result.recommendations.push("Add script-src directive");
      if (!result.directives["object-src"]) result.recommendations.push("Add object-src 'none'");
      if (!result.directives["base-uri"]) result.recommendations.push("Add base-uri 'self'");
    } else {
      result.weaknesses.push("No CSP detected");
      result.recommendations.push("Implement Content Security Policy");
    }
    console.log("%c🛡️ CSP Analysis:", "color: #3498db; font-weight: bold;");
    console.log("Has CSP: " + (result.hasCSP ? "Yes" : "No"));
    result.weaknesses.forEach((w) => console.log("  ⚠️ " + w));
    result.recommendations.forEach((r) => console.log("  💡 " + r));
    return result;
  }
  window.analyzeCSP = analyzeCSP;

  // Feature 9: Event Handler Sink Audit
  function auditAllEventHandlers() {
    const results = [];
    const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "setInterval", "Function", "location.href", "location.assign"];
    document.querySelectorAll("*").forEach((el) => {
      if (!el || !el.tagName) return;
      for (const attr of el.attributes) {
        if (attr.name.toLowerCase().startsWith("on") && attr.value) {
          const found = sinks.filter((s) => attr.value.includes(s));
          if (found.length > 0) results.push({ element: el.tagName + "#" + (el.id || ""), handler: attr.name, sinks: found.join(", "), code: attr.value.substring(0, 80), risk: "CRITICAL" });
        }
      }
    });
    console.log("%c📋 Event Handler Sink Audit:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) console.table(results);
    else console.log("%cNo dangerous sinks in event handlers.", "color: #27ae60;");
    return results;
  }
  window.auditAllEventHandlers = auditAllEventHandlers;

  // Feature 10: Open Redirect Detection
  function detectOpenRedirects() {
    const findings = [];
    const url = new URL(window.location.href);
    const redirectParams = ["redirect", "return", "next", "go", "url", "continue", "redir", "back", "forward", "to", "rurl", "dest", "destination", "checkout_url", "return_url"];
    url.searchParams.forEach((value, key) => {
      if (redirectParams.some((p) => key.toLowerCase().includes(p))) {
        let isExternal = false;
        try { const u = new URL(value); isExternal = u.origin !== window.location.origin; } catch (e) {}
        findings.push({ param: key, value: value.substring(0, 80), isExternal, risk: isExternal ? "CRITICAL" : "MEDIUM" });
      }
    });
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && /redirect|return|next|url|back|forward/i.test(href) && href.includes("=")) {
        findings.push({ type: "link", href: href.substring(0, 100), risk: "MEDIUM" });
      }
    });
    document.querySelectorAll("form[action]").forEach((form) => {
      const action = form.getAttribute("action");
      if (action && /redirect|return|next|url/i.test(action)) findings.push({ type: "form", action: action.substring(0, 100), risk: "MEDIUM" });
    });
    console.log("%c🔄 Open Redirect Detection:", "color: #f39c12; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo open redirect patterns.", "color: #27ae60;");
    return findings;
  }
  window.detectOpenRedirects = detectOpenRedirects;

  // Feature 11: PostMessage Handler Audit
  function auditPostMessageHandlers() {
    const findings = [];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      if (code.includes("addEventListener") && code.includes("message")) {
        const hasOrigin = /event\.origin|e\.origin|\.origin\s*===/.test(code);
        const hasSource = /event\.source|e\.source/.test(code);
        const sinks = [];
        if (/innerHTML/.test(code)) sinks.push("innerHTML");
        if (/document\.write/.test(code)) sinks.push("document.write");
        if (/eval\(/.test(code)) sinks.push("eval");
        if (/location/.test(code)) sinks.push("location");
        findings.push({ hasOrigin, hasSource, sinks, risk: !hasOrigin && sinks.length > 0 ? "CRITICAL" : sinks.length > 0 ? "HIGH" : "LOW" });
      }
    });
    console.log("%c📨 PostMessage Handlers:", "color: #3498db; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo postMessage handlers.", "color: #7f8c8d;");
    return findings;
  }
  window.auditPostMessageHandlers = auditPostMessageHandlers;

  // Feature 12: Framework Detection
  function detectAllFrameworks() {
    const found = [];
    const checks = [
      { name: "React", test: () => !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || !!window.React },
      { name: "Vue.js", test: () => !!window.__VUE__ || !!window.Vue },
      { name: "Angular", test: () => !!window.ng || !!document.querySelector("[ng-version]") },
      { name: "jQuery", test: () => !!window.jQuery || !!window.$ },
      { name: "Next.js", test: () => !!window.__NEXT_DATA__ },
      { name: "Nuxt.js", test: () => !!window.__NUXT__ },
      { name: "Webpack", test: () => !!window.webpackJsonp || !!window.__webpack_require__ },
      { name: "Google Tag Manager", test: () => !!window.dataLayer },
      { name: "Backbone.js", test: () => !!window.Backbone },
      { name: "Ember.js", test: () => !!window.Ember },
      { name: "Svelte", test: () => !!document.querySelector("[class*='svelte-']") },
      { name: "Solid.js", test: () => !!window._$HY },
    ];
    checks.forEach(({ name, test }) => { try { if (test()) found.push(name); } catch (e) {} });
    console.log("%c🛠️ Frameworks:", "color: #3498db; font-weight: bold;");
    if (found.length > 0) console.log("Detected: " + found.join(", "));
    else console.log("%cNo frameworks detected.", "color: #7f8c8d;");
    return found;
  }
  window.detectAllFrameworks = detectAllFrameworks;

  // Feature 13: Dangerous Tag Scanner
  function scanDangerousTags() {
    const findings = [];
    const dangerousTags = ["SCRIPT", "IFRAME", "OBJECT", "EMBED", "APPLET", "BASE", "FORM"];
    document.querySelectorAll(dangerousTags.join(",")).forEach((el) => {
      const info = { tag: el.tagName, id: el.id || "none", src: (el.src || el.data || el.action || el.href || "none").substring(0, 80) };
      if (el.tagName === "BASE") info.risk = "HIGH - can redirect all relative URLs";
      else if (el.tagName === "IFRAME") info.risk = el.src && /^\s*javascript\s*:/i.test(el.src) ? "CRITICAL" : "MEDIUM";
      else if (el.tagName === "SCRIPT") info.risk = el.src ? "MEDIUM - external script" : "HIGH - inline script";
      else info.risk = "MEDIUM";
      findings.push(info);
    });
    console.log("%c⚠️ Dangerous Tags:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo dangerous tags.", "color: #27ae60;");
    return findings;
  }
  window.scanDangerousTags = scanDangerousTags;

  // Feature 14: Prototype Pollution Detection
  function detectPrototypePollution() {
    const findings = [];
    const scripts = [];
    document.querySelectorAll("script:not([src])").forEach((s) => scripts.push(s.textContent));
    const allCode = scripts.join("\n");
    const patterns = [
      { regex: /\bextend\b.*\b__proto__\b/g, name: "extend(__proto__)", risk: "CRITICAL" },
      { regex: /\bmerge\b.*\b__proto__\b/g, name: "merge(__proto__)", risk: "CRITICAL" },
      { regex: /Object\.assign\b/g, name: "Object.assign", risk: "MEDIUM" },
      { regex: /\bdeepCopy\b|\bcloneDeep\b|\bdeepMerge\b/g, name: "deep-clone-functions", risk: "MEDIUM" },
      { regex: /\[\s*['"]__proto__['"]\s*\]/g, name: "__proto__ bracket", risk: "HIGH" },
      { regex: /\[\s*['"]constructor['"]\s*\]/g, name: "constructor bracket", risk: "HIGH" },
      { regex: /prototype\s*\[/g, name: "prototype bracket", risk: "HIGH" },
    ];
    patterns.forEach(({ regex, name, risk }) => {
      const matches = allCode.match(regex);
      if (matches) findings.push({ pattern: name, count: matches.length, risk });
    });
    console.log("%c🔬 Prototype Pollution:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo prototype pollution patterns.", "color: #27ae60;");
    return findings;
  }
  window.detectPrototypePollution = detectPrototypePollution;

  // Feature 15: Storage Sink Chain Analysis
  function analyzeStorageSinkChains() {
    const findings = [];
    const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "setInterval", "Function", "location.href"];
    ["localStorage", "sessionStorage"].forEach((storage) => {
      try {
        const store = window[storage];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          const value = store.getItem(key);
          if (!value || value.length < 3) continue;
          document.querySelectorAll("script:not([src])").forEach((script) => {
            const code = script.textContent;
            if (code.includes(key)) {
              const usedSinks = sinks.filter((s) => code.includes(s));
              if (usedSinks.length > 0) findings.push({ storage, key, sinks: usedSinks, risk: "CRITICAL" });
            }
          });
        }
      } catch (e) {}
    });
    console.log("%c💾 Storage Sink Chains:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo storage → sink chains.", "color: #27ae60;");
    return findings;
  }
  window.analyzeStorageSinkChains = analyzeStorageSinkChains;

  // Feature 16: CSS Exfiltration Detection
  function detectCSSExfiltration() {
    const findings = [];
    const patterns = [/expression\s*\(/gi, /behavior\s*:/gi, /-moz-binding\s*:.*url\(/gi, /url\s*\(\s*['"]?\s*javascript:/gi, /url\s*\(\s*['"]?\s*data:/gi];
    document.querySelectorAll("[style]").forEach((el) => {
      const style = el.getAttribute("style");
      patterns.forEach((regex) => {
        const match = style.match(regex);
        if (match) findings.push({ element: el.tagName + "#" + (el.id || ""), pattern: match[0], risk: "HIGH" });
      });
    });
    document.querySelectorAll("style").forEach((el) => {
      const content = el.textContent || "";
      patterns.forEach((regex) => {
        const match = content.match(regex);
        if (match) findings.push({ element: "STYLE", pattern: match[0], risk: "HIGH" });
      });
    });
    console.log("%c🎨 CSS Exfiltration:", "color: #9b59b6; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo CSS exfiltration vectors.", "color: #27ae60;");
    return findings;
  }
  window.detectCSSExfiltration = detectCSSExfiltration;

  // Feature 17: Contenteditable XSS Detection
  function detectContenteditableXSS() {
    const findings = [];
    document.querySelectorAll("[contenteditable='true'], [contenteditable='']").forEach((el) => {
      const hasSink = Array.from(el.attributes).some((a) => a.name.startsWith("on"));
      findings.push({ tag: el.tagName, id: el.id || "none", hasInlineHandler: hasSink, risk: hasSink ? "CRITICAL" : "HIGH" });
    });
    console.log("%c📝 Contenteditable XSS:", "color: #e67e22; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo contenteditable elements.", "color: #7f8c8d;");
    return findings;
  }
  window.detectContenteditableXSS = detectContenteditableXSS;

  // Feature 18: Mixed Content Detection
  function detectMixedContent() {
    const findings = [];
    if (window.location.protocol === "https:") {
      document.querySelectorAll("script[src^='http:'], link[href^='http:'], img[src^='http:'], iframe[src^='http:']").forEach((el) => {
        const src = el.getAttribute("src") || el.getAttribute("href");
        if (src && src.startsWith("http:")) findings.push({ tag: el.tagName, src: src.substring(0, 80), risk: el.tagName === "SCRIPT" ? "HIGH" : "MEDIUM" });
      });
    }
    console.log("%c🔀 Mixed Content:", "color: #f39c12; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo mixed content.", "color: #27ae60;");
    return findings;
  }
  window.detectMixedContent = detectMixedContent;

  // Feature 19: Auto PoC Generator
  function generateAutoPoC(sinkType) {
    const payloads = [];
    const sink = (sinkType || "innerHTML").toLowerCase();
    if (sink.includes("innerhtml") || sink.includes("document.write")) {
      payloads.push('<img src=x onerror=alert(1)>', '<svg onload=alert(1)>', '<details open ontoggle=alert(1)>', '<iframe src="javascript:alert(1)">');
    } else if (sink.includes("eval") || sink.includes("function")) {
      payloads.push("alert(1)", "1,alert(1)", "typeof this.alert");
    } else if (sink.includes("location") || sink.includes("href")) {
      payloads.push("javascript:alert(1)", "data:text/html,<script>alert(1)</script>");
    } else if (sink.includes("settimeout") || sink.includes("setinterval")) {
      payloads.push("alert(1)", "1;alert(1)");
    } else {
      payloads.push("alert(1)");
    }
    console.log("%c💉 Auto PoC for " + sinkType + ":", "color: #e74c3c; font-weight: bold;");
    payloads.forEach((p, i) => console.log("  " + (i + 1) + ". " + p));
    return payloads;
  }
  window.generateAutoPoC = generateAutoPoC;

  // Feature 20: Clickjacking Detection
  function detectClickjacking() {
    const findings = [];
    const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasFrameAncestors = csp && /frame-ancestors/.test(csp.getAttribute("content"));
    if (!frameOptions && !hasFrameAncestors) findings.push({ type: "no-protection", risk: "HIGH", note: "Page can be framed - no X-Frame-Options or CSP frame-ancestors" });
    document.querySelectorAll("iframe").forEach((iframe) => {
      if (!iframe.sandbox || iframe.sandbox.length === 0) findings.push({ type: "unsandboxed-iframe", src: (iframe.src || "").substring(0, 80), risk: "MEDIUM" });
    });
    console.log("%c🎯 Clickjacking:", "color: #e67e22; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo clickjacking vectors.", "color: #27ae60;");
    return findings;
  }
  window.detectClickjacking = detectClickjacking;

  // Feature 21: Redirect Chain Audit
  function auditRedirectChains() {
    const findings = [];
    const url = new URL(window.location.href);
    const redirectParams = ["redirect", "return", "next", "go", "url", "continue", "redir", "back", "forward", "to"];
    url.searchParams.forEach((value, key) => {
      if (redirectParams.some((p) => key.toLowerCase().includes(p))) {
        let isExternal = false;
        try { const u = new URL(value); isExternal = u.origin !== window.location.origin; } catch (e) {}
        findings.push({ param: key, value: value.substring(0, 80), isExternal, risk: isExternal ? "CRITICAL" : "MEDIUM" });
      }
    });
    document.querySelectorAll("meta[http-equiv='refresh']").forEach((meta) => {
      const content = meta.getAttribute("content");
      if (content && /url\s*=/i.test(content)) findings.push({ type: "meta-refresh", value: content.substring(0, 80), risk: "MEDIUM" });
    });
    console.log("%c🔄 Redirect Chains:", "color: #f39c12; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo redirect chains.", "color: #27ae60;");
    return findings;
  }
  window.auditRedirectChains = auditRedirectChains;

  // Feature 22: URL Validation Bypass Test
  function testURLValidationBypass() {
    const findings = [];
    const bypasses = [
      { payload: "javascript:alert(1)", technique: "direct" },
      { payload: "jAvAsCrIpT:alert(1)", technique: "case-mixing" },
      { payload: "javascript%3Aalert(1)", technique: "url-encoding" },
      { payload: "javascript&#58;alert(1)", technique: "html-entity" },
      { payload: "data:text/html,<script>alert(1)</script>", technique: "data-uri" },
    ];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      bypasses.forEach(({ payload, technique }) => {
        if (href.toLowerCase().includes(payload.toLowerCase().substring(0, 8))) {
          findings.push({ element: "A#" + (a.id || ""), href: href.substring(0, 80), technique, risk: "CRITICAL" });
        }
      });
    });
    console.log("%c🔗 URL Validation Bypass:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo URL bypass patterns.", "color: #27ae60;");
    return findings;
  }
  window.testURLValidationBypass = testURLValidationBypass;

  // Feature 23: Document.write Sink Analysis
  function analyzeDocumentWriteSink() {
    const findings = [];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      if (/document\.write\s*\(|document\.writeln\s*\(/.test(code)) {
        const hasUserInput = /location\.|document\.URL|document\.referrer|window\.name|document\.cookie/.test(code);
        findings.push({ script: script.src || "inline", hasUserInput, risk: hasUserInput ? "CRITICAL" : "HIGH" });
      }
    });
    console.log("%c📝 Document.write Sink:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo document.write sinks.", "color: #27ae60;");
    return findings;
  }
  window.analyzeDocumentWriteSink = analyzeDocumentWriteSink;

  // Feature 24: Service Worker Detection
  function detectServiceWorkers() {
    const findings = { registered: false, scopes: [] };
    if ("serviceWorker" in navigator) {
      findings.registered = true;
      navigator.serviceWorker.getRegistrations().then((regs) => {
        findings.scopes = regs.map((r) => ({ scope: r.scope, active: !!r.active }));
        console.log("%c⚙️ Service Workers:", "color: #9b59b6; font-weight: bold;");
        if (findings.scopes.length > 0) console.table(findings.scopes);
        else console.log("%cNo active Service Workers.", "color: #7f8c8d;");
      });
    }
    return findings;
  }
  window.detectServiceWorkers = detectServiceWorkers;

  // Feature 25: XSS Vector Summary
  function generateXSSSummary() {
    const summary = { total: 0, critical: 0, high: 0, medium: 0, low: 0, vectors: [] };
    const addFindings = (findings) => {
      findings.forEach((f) => {
        summary.total++;
        const risk = (f.risk || "LOW").toUpperCase();
        if (risk === "CRITICAL") summary.critical++;
        else if (risk === "HIGH") summary.high++;
        else if (risk === "MEDIUM") summary.medium++;
        else summary.low++;
      });
    };
    try { addFindings(detectJavascriptURIs()); } catch (e) {}
    try { addFindings(detectDOMClobbering()); } catch (e) {}
    try { addFindings(auditAllEventHandlers()); } catch (e) {}
    try { addFindings(detectOpenRedirects()); } catch (e) {}
    try { addFindings(auditPostMessageHandlers()); } catch (e) {}
    try { addFindings(detectPrototypePollution()); } catch (e) {}
    try { addFindings(scanDangerousTags()); } catch (e) {}
    try { addFindings(detectCSSExfiltration()); } catch (e) {}
    console.log("%c📊 XSS SUMMARY:", "color: #e74c3c; font-size: 16px; font-weight: bold;");
    console.log("  Total: " + summary.total);
    console.log("  Critical: " + summary.critical);
    console.log("  High: " + summary.high);
    console.log("  Medium: " + summary.medium);
    console.log("  Low: " + summary.low);
    return summary;
  }
  window.generateXSSSummary = generateXSSSummary;

  console.log("%c🚀 20 NEW FEATURES LOADED", "color: #e74c3c; font-weight: bold;");
  console.log("Commands: detectJavascriptURIs, detectDOMClobbering, analyzeCSP, auditAllEventHandlers, detectOpenRedirects, auditPostMessageHandlers, detectAllFrameworks, scanDangerousTags, detectPrototypePollution, analyzeStorageSinkChains, detectCSSExfiltration, detectContenteditableXSS, detectMixedContent, generateAutoPoC, detectClickjacking, auditRedirectChains, testURLValidationBypass, analyzeDocumentWriteSink, detectServiceWorkers, generateXSSSummary");

  // Start
  menuLoop();
})();
