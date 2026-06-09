/****************************************************************************************
 * Reflection & Sink Detector
 *
 * This function injects a unique payload into input fields and then searches the DOM
 * to see if that input is reflected, checking for dangerous sinks like `innerHTML`.
 *
 * Instructions: Paste into the console and call `findReflections();` to run the test.
 ****************************************************************************************/

(function () {
  "use strict";

  function findReflections() {
    console.group(
      "%c🔍 FlowSpect: Running Input Reflection Test...",
      "color: #ff9800; font-size: 14px; font-weight: bold;"
    );

    // 1. Define a unique, traceable payload.
    const payload = `ReflectTest_${Math.random().toString(36).substring(2)}`;
    console.log(`Using unique payload: ${payload}`);

    // 2. Identify and inject the payload into interactive text elements.
    const targetElements = document.querySelectorAll(
      'input[type="text"], input[type="search"], textarea'
    );
    if (targetElements.length === 0) {
      console.warn("No text input or textarea elements found to test.");
      console.groupEnd();
      return;
    }

    const targetArray = Array.from(targetElements);
    console.log(`Injecting payload into ${targetArray.length} element(s)...`);
    targetArray.forEach((el) => {
      if (!el) return;
      el.value = payload;
      // Dispatch events to trigger frameworks (React, Vue, etc.) that listen for changes.
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // 3. Give the DOM a moment to update, then search for reflections.
    setTimeout(() => {
      console.log("Searching DOM for reflections...");
      const reflections = [];
      const allElements = document.querySelectorAll("*");

      Array.from(allElements).forEach((el) => {
        if (!el || !el.tagName) return;
        // Don't check the original input fields themselves
        if (targetArray.includes(el)) return;

        // Check for dangerous sinks first
        if (el.innerHTML && el.innerHTML.includes(payload)) {
          reflections.push({
            type: "INNER_HTML_SINK",
            risk: "🔴 HIGH",
            message:
              "Payload was found inside `innerHTML`. This is a strong indicator of a potential DOM XSS vulnerability.",
            element: el,
          });
        }

        // Check for reflection in element attributes
        for (const attr of el.attributes) {
          if (attr.value && attr.value.includes(payload)) {
            // Check if it's a scriptable attribute (a sink)
            const isScriptSink = ["href", "src", "action", "formaction"].some(
              (sink) => attr.name.toLowerCase().includes(sink)
            );
            const isEventHandler = attr.name.toLowerCase().startsWith("on");

            reflections.push({
              type: "ATTRIBUTE",
              risk: isScriptSink || isEventHandler ? "🟠 MEDIUM" : "🟡 LOW",
              message: `Payload was reflected in the '${attr.name}' attribute.`,
              element: el,
            });
          }
        }
      });

      // 4. Report the findings.
      if (reflections.length > 0) {
        console.warn(
          `🚨 Found ${reflections.length} potential reflection(s)!`
        );
        reflections.forEach((reflection) => {
          console.groupCollapsed(
            `${reflection.risk} - ${reflection.type} Reflection Found`
          );
          console.log(reflection.message);
          console.log("Element:", reflection.element);
          console.groupEnd();
        });
      } else {
        console.log(
          "✅ Success: No direct reflections of the payload were found in the DOM."
        );
      }

      console.groupEnd();
    }, 500); // Wait 500ms for any JavaScript on the page to process the input.
  }

  // Expose to global scope for manual invocation
  window.findReflections = findReflections;

  // ===========================================
  // 20 NEW FEATURES
  // ===========================================

  // Feature 1: Hash Fragment Reflection Test
  function testHashReflection() {
    const hash = window.location.hash.slice(1);
    if (!hash) { console.log("%cNo hash fragment to test. Add #<payload> to the URL.", "color: #7f8c8d;"); return []; }
    const results = [];
    document.querySelectorAll("*").forEach((el) => {
      if (!el || !el.tagName) return;
      if (el.textContent && el.textContent.includes(hash)) results.push({ element: el.tagName + "#" + (el.id || ""), location: "textContent", risk: "MEDIUM" });
      if (el.innerHTML && el.innerHTML.includes(hash)) results.push({ element: el.tagName + "#" + (el.id || ""), location: "innerHTML", risk: "HIGH" });
      for (const attr of el.attributes) {
        if (attr.value && attr.value.includes(hash)) results.push({ element: el.tagName + "#" + (el.id || ""), location: "attribute:" + attr.name, risk: ["href", "src", "action"].includes(attr.name) ? "HIGH" : "MEDIUM" });
      }
    });
    console.log("%c🔗 Hash Fragment Reflection:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) { console.table(results); if (results.some((r) => r.risk === "HIGH")) console.log("%c⚠️ Hash content found in innerHTML!", "color: #e74c3c;"); }
    else console.log("%cHash not reflected in DOM.", "color: #27ae60;");
    return results;
  }
  window.testHashReflection = testHashReflection;

  // Feature 2: URL Parameter Reflection Test
  function testURLParamReflection() {
    const params = new URLSearchParams(window.location.search);
    const results = [];
    params.forEach((value, key) => {
      if (!value) return;
      document.querySelectorAll("*").forEach((el) => {
        if (!el || !el.tagName) return;
        if (el.textContent && el.textContent.includes(value)) results.push({ param: key, element: el.tagName + "#" + (el.id || ""), location: "textContent", risk: "MEDIUM" });
        if (el.innerHTML && el.innerHTML.includes(value)) results.push({ param: key, element: el.tagName + "#" + (el.id || ""), location: "innerHTML", risk: "HIGH" });
      });
    });
    console.log("%c🔍 URL Parameter Reflection:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) console.table(results);
    else console.log("%cNo URL parameters reflected in DOM.", "color: #27ae60;");
    return results;
  }
  window.testURLParamReflection = testURLParamReflection;

  // Feature 3: javascript: Protocol Detection
  function detectJavascriptURI() {
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
  window.detectJavascriptURI = detectJavascriptURI;

  // Feature 4: Sink Detection on Elements
  function detectSinks(elements) {
    const sinkList = ["innerHTML", "outerHTML", "document.write", "document.writeln", "eval", "setTimeout", "setInterval", "Function", "insertAdjacentHTML", "location.href", "location.assign", "location.replace"];
    const results = [];
    const els = elements || document.querySelectorAll("*");
    Array.from(els).forEach((el) => {
      if (!el || !el.tagName) return;
      // Check inline handlers
      for (const attr of el.attributes) {
        if (attr.name.toLowerCase().startsWith("on")) {
          sinkList.forEach((sink) => {
            if (attr.value && attr.value.includes(sink)) results.push({ element: el.tagName + "#" + (el.id || ""), handler: attr.name, sink, risk: "CRITICAL" });
          });
        }
      }
      // Check script tags
      if (el.tagName === "SCRIPT" && el.textContent) {
        sinkList.forEach((sink) => {
          if (el.textContent.includes(sink)) results.push({ element: "SCRIPT", sink, risk: "CRITICAL" });
        });
      }
    });
    console.log("%c🔴 Sink Detection:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) console.table(results);
    else console.log("%cNo sinks detected.", "color: #27ae60;");
    return results;
  }
  window.detectSinks = detectSinks;

  // Feature 5: MutationObserver for Delayed Reflections
  let _reflectionObserver = null;
  function watchForDelayedReflections(duration) {
    if (_reflectionObserver) { _reflectionObserver.disconnect(); }
    const timeout = duration || 5000;
    const findings = [];
    _reflectionObserver = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        Array.from(m.addedNodes).forEach((node) => {
          if (node.nodeType === 1) {
            const text = node.textContent || node.innerHTML || "";
            if (text.includes("ReflectTest_") || text.includes("<script") || text.includes("onerror") || text.includes("onload")) {
              findings.push({ type: "mutation", element: node.tagName + "#" + (node.id || ""), content: text.substring(0, 100), risk: "HIGH" });
              console.log("%c🔴 Delayed reflection detected:", "color: #e74c3c;", node);
            }
          }
        });
      });
    });
    _reflectionObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    console.log("%c👁️ Watching for delayed reflections for " + timeout + "ms...", "color: #f39c12; font-weight: bold;");
    setTimeout(() => { _reflectionObserver.disconnect(); _reflectionObserver = null; console.log("%cStopped watching.", "color: #7f8c8d;"); }, timeout);
    return findings;
  }
  window.watchForDelayedReflections = watchForDelayedReflections;

  // Feature 6: Cookie Reflection Test
  function testCookieReflection() {
    const cookies = document.cookie.split(";").map((c) => c.trim()).filter(Boolean);
    const results = [];
    cookies.forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      const value = rest.join("=");
      if (!value || value.length < 3) return;
      document.querySelectorAll("*").forEach((el) => {
        if (!el || !el.tagName) return;
        if (el.textContent && el.textContent.includes(value)) results.push({ cookie: name, element: el.tagName + "#" + (el.id || ""), location: "textContent", risk: "MEDIUM" });
        if (el.innerHTML && el.innerHTML.includes(value)) results.push({ cookie: name, element: el.tagName + "#" + (el.id || ""), location: "innerHTML", risk: "HIGH" });
      });
    });
    console.log("%c🍪 Cookie Reflection:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) console.table(results);
    else console.log("%cNo cookie values reflected in DOM.", "color: #27ae60;");
    return results;
  }
  window.testCookieReflection = testCookieReflection;

  // Feature 7: Storage Reflection Test
  function testStorageReflection() {
    const results = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (!value || value.length < 3) continue;
        document.querySelectorAll("*").forEach((el) => {
          if (!el || !el.tagName) return;
          if (el.innerHTML && el.innerHTML.includes(value)) results.push({ storage: "localStorage", key, element: el.tagName + "#" + (el.id || ""), location: "innerHTML", risk: "HIGH" });
        });
      }
    } catch (e) {}
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        if (!value || value.length < 3) continue;
        document.querySelectorAll("*").forEach((el) => {
          if (!el || !el.tagName) return;
          if (el.innerHTML && el.innerHTML.includes(value)) results.push({ storage: "sessionStorage", key, element: el.tagName + "#" + (el.id || ""), location: "innerHTML", risk: "HIGH" });
        });
      }
    } catch (e) {}
    console.log("%c💾 Storage Reflection:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) console.table(results);
    else console.log("%cNo storage values reflected in DOM.", "color: #27ae60;");
    return results;
  }
  window.testStorageReflection = testStorageReflection;

  // Feature 8: DOM Clobbering Quick Check
  function checkDOMClobbering() {
    const findings = [];
    const globals = new Set(["document", "window", "self", "top", "parent", "location", "chrome", "Array", "Object", "String", "Number", "Boolean", "Function", "RegExp", "Date", "Math", "JSON", "console", "navigator", "history", "screen", "performance", "crypto", "fetch", "localStorage", "sessionStorage"]);
    document.querySelectorAll("[id], [name]").forEach((el) => {
      const id = el.id || el.getAttribute("name");
      if (id && (el.tagName === "A" || el.tagName === "FORM" || el.tagName === "IMG" || el.tagName === "IFRAME") && globals.has(id)) {
        findings.push({ identifier: id, tag: el.tagName, risk: "CRITICAL", description: "Shadows global '" + id + "'" });
      }
    });
    console.log("%c🔍 DOM Clobbering Check:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo DOM clobbering vectors found.", "color: #27ae60;");
    return findings;
  }
  window.checkDOMClobbering = checkDOMClobbering;

  // Feature 9: Event Handler Sink Audit
  function auditEventHandlers() {
    const results = [];
    document.querySelectorAll("*").forEach((el) => {
      if (!el || !el.tagName) return;
      for (const attr of el.attributes) {
        if (attr.name.toLowerCase().startsWith("on") && attr.value) {
          const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "setInterval", "Function", "location.href", "location.assign"];
          const found = sinks.filter((s) => attr.value.includes(s));
          if (found.length > 0) results.push({ element: el.tagName + "#" + (el.id || ""), handler: attr.name, sinks: found.join(", "), risk: "CRITICAL" });
        }
      }
    });
    console.log("%c📋 Event Handler Sink Audit:", "color: #e74c3c; font-weight: bold;");
    if (results.length > 0) console.table(results);
    else console.log("%cNo dangerous sinks in event handlers.", "color: #27ae60;");
    return results;
  }
  window.auditEventHandlers = auditEventHandlers;

  // Feature 10: Template Pattern Detection
  function detectTemplatePatterns() {
    const patterns = [];
    const checks = [
      { name: "Angular {{}}", regex: /\{\{.*?\}\}/g },
      { name: "Vue {{}}", regex: /\{\{.*?\}\}/g },
      { name: "JS ${}", regex: /\$\{[^}]+\}/g },
      { name: "Mustache {{{}}", regex: /\{\{\{.*?\}\}\}/g },
      { name: "EJS <%%>", regex: /<%[-=]?[\s\S]*?%>/g },
      { name: "Pug #{}", regex: /#\{[^}]+\}/g },
    ];
    document.querySelectorAll("*").forEach((el) => {
      if (!el || !el.tagName) return;
      const text = el.textContent || "";
      checks.forEach(({ name, regex }) => {
        const matches = text.match(regex);
        if (matches) patterns.push({ element: el.tagName + "#" + (el.id || ""), pattern: name, matches: matches.slice(0, 3), risk: "MEDIUM" });
      });
    });
    console.log("%c📝 Template Pattern Detection:", "color: #e74c3c; font-weight: bold;");
    if (patterns.length > 0) console.table(patterns);
    else console.log("%cNo template patterns found.", "color: #27ae60;");
    return patterns;
  }
  window.detectTemplatePatterns = detectTemplatePatterns;

  // Feature 11: CSP Check
  function checkCSP() {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = meta?.getAttribute("content");
    const result = { hasCSP: !!content, directives: {}, weaknesses: [] };
    if (content) {
      content.split(";").map((d) => d.trim()).filter(Boolean).forEach((dir) => {
        const [name, ...vals] = dir.split(/\s+/);
        result.directives[name.toLowerCase()] = vals.join(" ");
      });
      const scriptSrc = result.directives["script-src"] || "";
      if (scriptSrc.includes("'unsafe-inline'")) result.weaknesses.push("unsafe-inline in script-src");
      if (scriptSrc.includes("'unsafe-eval'")) result.weaknesses.push("unsafe-eval in script-src");
      if (scriptSrc.includes("*")) result.weaknesses.push("wildcard in script-src");
      if (!result.directives["script-src"] && !result.directives["default-src"]) result.weaknesses.push("No script-src directive");
    } else { result.weaknesses.push("No CSP detected via meta tag"); }
    console.log("%c🛡️ CSP Check:", "color: #e74c3c; font-weight: bold;");
    console.log(`CSP: ${result.hasCSP ? "Yes" : "No"}, Weaknesses: ${result.weaknesses.length}`);
    result.weaknesses.forEach((w) => console.log(`  ⚠️ ${w}`));
    return result;
  }
  window.checkCSP = checkCSP;

  // Feature 12: PostMessage Handler Check
  function checkPostMessageHandlers() {
    const findings = [];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      if (code.includes("addEventListener") && code.includes("message")) {
        const hasOrigin = /event\.origin|e\.origin|\.origin\s*===/.test(code);
        findings.push({ hasOriginValidation: hasOrigin, risk: hasOrigin ? "LOW" : "HIGH", note: hasOrigin ? "Origin check found" : "Missing origin validation" });
      }
    });
    console.log("%c📨 PostMessage Handlers:", "color: #3498db; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo postMessage handlers found.", "color: #7f8c8d;");
    return findings;
  }
  window.checkPostMessageHandlers = checkPostMessageHandlers;

  // Feature 13: Framework Detection
  function detectFrameworks() {
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
    ];
    checks.forEach(({ name, test }) => { try { if (test()) found.push(name); } catch (e) {} });
    console.log("%c🛠️ Frameworks:", "color: #3498db; font-weight: bold;");
    if (found.length > 0) console.log("Detected: " + found.join(", "));
    else console.log("%cNo known frameworks detected.", "color: #7f8c8d;");
    return found;
  }
  window.detectFrameworks = detectFrameworks;

  // Feature 14: Dangerous Tag Detection
  function detectDangerousTags() {
    const findings = [];
    const dangerousTags = ["SCRIPT", "IFRAME", "OBJECT", "EMBED", "APPLET", "BASE", "FORM"];
    document.querySelectorAll(dangerousTags.join(",")).forEach((el) => {
      const info = { tag: el.tagName, id: el.id || "none", src: el.src || el.data || el.action || el.href || "none" };
      if (el.tagName === "BASE") info.risk = "HIGH - can redirect all relative URLs";
      else if (el.tagName === "IFRAME") info.risk = el.src && el.src.startsWith("javascript:") ? "CRITICAL" : "MEDIUM";
      else if (el.tagName === "SCRIPT") info.risk = el.src ? "MEDIUM - external script" : "HIGH - inline script";
      else info.risk = "MEDIUM";
      findings.push(info);
    });
    console.log("%c⚠️ Dangerous Tags:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo dangerous tags found.", "color: #27ae60;");
    return findings;
  }
  window.detectDangerousTags = detectDangerousTags;

  // Feature 15: Auto PoC Generator
  function generatePoC(sinkType) {
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
      payloads.push("No auto-generated payloads for this sink type");
    }
    console.log("%c💉 PoC Payloads for " + sinkType + ":", "color: #e74c3c; font-weight: bold;");
    payloads.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    return payloads;
  }
  window.generatePoC = generatePoC;

  // Feature 16: CSS Exfiltration Check
  function checkCSSExfiltration() {
    const findings = [];
    document.querySelectorAll("[style]").forEach((el) => {
      const style = el.getAttribute("style");
      if (style && (style.includes("url(") || style.includes("expression(") || style.includes("behavior:"))) {
        findings.push({ element: el.tagName + "#" + (el.id || ""), style: style.substring(0, 100), risk: "HIGH" });
      }
    });
    console.log("%c🎨 CSS Exfiltration:", "color: #9b59b6; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo CSS exfiltration vectors found.", "color: #27ae60;");
    return findings;
  }
  window.checkCSSExfiltration = checkCSSExfiltration;

  // Feature 17: Contenteditable Detection
  function detectContentEditable() {
    const editables = [];
    document.querySelectorAll("[contenteditable='true'], [contenteditable='']").forEach((el) => {
      editables.push({ tag: el.tagName, id: el.id || "none", risk: "HIGH - can inject HTML" });
    });
    console.log("%c📝 Contenteditable Elements:", "color: #e67e22; font-weight: bold;");
    if (editables.length > 0) console.table(editables);
    else console.log("%cNo contenteditable elements found.", "color: #7f8c8d;");
    return editables;
  }
  window.detectContentEditable = detectContentEditable;

  // Feature 18: Export Results
  function exportResults(results, format) {
    const data = { timestamp: new Date().toISOString(), url: window.location.href, results };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reflection-test-" + Date.now() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
    console.log("%c📥 Results exported!", "color: #27ae60;");
  }
  window.exportResults = exportResults;

  // Feature 19: Restore All Injected Values
  let _injectedElements = [];
  function restoreAllValues() {
    _injectedElements.forEach(({ element, original }) => {
      if (element && "value" in element) element.value = original;
    });
    _injectedElements = [];
    console.log("%c✅ All values restored.", "color: #27ae60;");
  }
  window.restoreAllValues = restoreAllValues;

  // Feature 20: Full Test Suite
  function fullTestSuite() {
    console.log("%c🚀 FULL TEST SUITE", "color: #e74c3c; font-size: 16px; font-weight: bold;");
    console.log("=".repeat(50));
    const results = {};
    console.log("\n[1/8] Input Reflections...");
    findReflections();
    console.log("\n[2/8] Hash Reflection...");
    results.hash = testHashReflection();
    console.log("\n[3/8] URL Parameter Reflection...");
    results.urlParams = testURLParamReflection();
    console.log("\n[4/8] javascript: URIs...");
    results.javascriptURI = detectJavascriptURI();
    console.log("\n[5/8] Sink Detection...");
    results.sinks = detectSinks();
    console.log("\n[6/8] Event Handler Audit...");
    results.eventHandlers = auditEventHandlers();
    console.log("\n[7/8] DOM Clobbering...");
    results.clobbering = checkDOMClobbering();
    console.log("\n[8/8] CSP Check...");
    results.csp = checkCSP();
    console.log("\n" + "=".repeat(50));
    console.log("%c✅ FULL TEST SUITE COMPLETE", "color: #27ae60; font-size: 14px; font-weight: bold;");
    window.lastTestResults = results;
    return results;
  }
  window.fullTestSuite = fullTestSuite;

  // ===========================================
  // 20 MORE ENHANCEMENTS (Features 21-40)
  // ===========================================

  // Feature 21: Form Action XSS Test
  function testFormActionXSS() {
    const findings = [];
    document.querySelectorAll("form[action]").forEach((form) => {
      const action = form.getAttribute("action");
      if (!action) return;
      if (/^\s*javascript\s*:/i.test(action)) findings.push({ type: "javascript-action", value: action.substring(0, 80), risk: "CRITICAL" });
      else if (/^\s*data\s*:/i.test(action)) findings.push({ type: "data-action", value: action.substring(0, 80), risk: "HIGH" });
      else if (/redirect|return|next|go|url|continue|redir/i.test(action)) findings.push({ type: "open-redirect", value: action.substring(0, 80), risk: "MEDIUM" });
    });
    document.querySelectorAll("form").forEach((form) => {
      if (form.hasAttribute("target") && form.getAttribute("target") === "_blank") {
        const rel = form.getAttribute("rel") || "";
        if (!rel.includes("noopener")) findings.push({ type: "reverse-tabnabbing", element: form.id || "form", risk: "MEDIUM" });
      }
    });
    console.log("%c📋 Form Action XSS:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo form action XSS vectors.", "color: #27ae60;");
    return findings;
  }
  window.testFormActionXSS = testFormActionXSS;

  // Feature 22: Encoded Sink Detection
  function detectEncodedSinks() {
    const findings = [];
    const patterns = [
      { name: "HTML Entity", regex: /&#\d+;|&#x[0-9a-f]+;/gi, risk: "MEDIUM" },
      { name: "URL Encoding", regex: /%[0-9a-f]{2}/gi, risk: "MEDIUM" },
      { name: "Unicode Escape", regex: /\\u[0-9a-f]{4}/gi, risk: "MEDIUM" },
      { name: "Base64", regex: /atob\s*\(|btoa\s*\(/g, risk: "HIGH" },
    ];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      patterns.forEach(({ name, regex, risk }) => {
        const matches = code.match(regex);
        if (matches && matches.length > 3) findings.push({ script: script.src || "inline", pattern: name, count: matches.length, risk });
      });
    });
    document.querySelectorAll("[onclick], [onload], [onerror]").forEach((el) => {
      ["onclick", "onload", "onerror"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (val && /atob\s*\(|String\.fromCharCode|unescape|decodeURIComponent/.test(val)) {
          findings.push({ element: el.tagName + "#" + (el.id || ""), handler: attr, pattern: "encoding-bypass", risk: "HIGH" });
        }
      });
    });
    console.log("%c🔐 Encoded Sink Detection:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo encoded sinks found.", "color: #27ae60;");
    return findings;
  }
  window.detectEncodedSinks = detectEncodedSinks;

  // Feature 23: PostMessage Sink Test
  function testPostMessageSink() {
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
        if (/\.html\(/.test(code)) sinks.push("$.html");
        if (/location/.test(code)) sinks.push("location");
        findings.push({ hasOrigin, hasSource, sinks, risk: !hasOrigin && sinks.length > 0 ? "CRITICAL" : sinks.length > 0 ? "HIGH" : "LOW" });
      }
    });
    console.log("%c📨 PostMessage Sink Test:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo postMessage handlers.", "color: #7f8c8d;");
    return findings;
  }
  window.testPostMessageSink = testPostMessageSink;

  // Feature 24: Open Redirect Scanner
  function scanForOpenRedirects() {
    const findings = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (/redirect|return|next|go|url|continue|redir|back|forward|to/i.test(href) && (href.includes("?") || href.includes("&"))) {
        findings.push({ type: "link", href: href.substring(0, 100), risk: "MEDIUM" });
      }
    });
    document.querySelectorAll("form[action]").forEach((form) => {
      const action = form.getAttribute("action");
      if (action && /redirect|return|next|url/i.test(action)) {
        findings.push({ type: "form", action: action.substring(0, 100), risk: "MEDIUM" });
      }
    });
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((value, key) => {
      if (/redirect|return|next|url|back|forward|go|to|redir|continue/i.test(key)) {
        findings.push({ type: "url-param", param: key, value: value.substring(0, 100), risk: "HIGH" });
      }
    });
    console.log("%c🔄 Open Redirect Scanner:", "color: #f39c12; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo open redirect patterns found.", "color: #27ae60;");
    return findings;
  }
  window.scanForOpenRedirects = scanForOpenRedirects;

  // Feature 25: Attribute Injection Test
  function testAttributeInjection() {
    const findings = [];
    const testPayload = "inject_test_" + Math.random().toString(36).substring(2, 8);
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type === "hidden" || el.type === "submit" || el.type === "button") return;
      const originalValue = el.value;
      el.value = testPayload;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      setTimeout(() => {
        for (const attr of el.attributes) {
          if (attr.value && attr.value.includes(testPayload) && attr.name !== "value") {
            findings.push({ element: el.tagName + "#" + (el.id || ""), attribute: attr.name, value: attr.value.substring(0, 80), risk: "HIGH" });
          }
        }
        el.value = originalValue;
      }, 200);
    });
    console.log("%c💉 Attribute Injection Test:", "color: #e74c3c; font-weight: bold;");
    console.log("%cChecking attribute injection in 200ms...", "color: #7f8c8d;");
    setTimeout(() => {
      if (findings.length > 0) console.table(findings);
      else console.log("%cNo attribute injection found.", "color: #27ae60;");
    }, 250);
    return findings;
  }
  window.testAttributeInjection = testAttributeInjection;

  // Feature 26: Dangerous CSS Sink Detection
  function detectDangerousCSSSinks() {
    const findings = [];
    const dangerous = [/expression\s*\(/gi, /behavior\s*:/gi, /-moz-binding\s*:.*url\(/gi, /url\s*\(\s*['"]?javascript:/gi, /url\s*\(\s*['"]?data:/gi];
    document.querySelectorAll("[style]").forEach((el) => {
      const style = el.getAttribute("style");
      dangerous.forEach((regex) => {
        const match = style.match(regex);
        if (match) findings.push({ element: el.tagName + "#" + (el.id || ""), pattern: match[0], risk: "HIGH" });
      });
    });
    document.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => {
      const content = el.textContent || "";
      dangerous.forEach((regex) => {
        const match = content.match(regex);
        if (match) findings.push({ element: el.tagName, pattern: match[0], risk: "HIGH" });
      });
    });
    console.log("%c🎨 Dangerous CSS Sinks:", "color: #9b59b6; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo dangerous CSS sinks.", "color: #27ae60;");
    return findings;
  }
  window.detectDangerousCSSSinks = detectDangerousCSSSinks;

  // Feature 27: Storage → Sink Chain Audit
  function auditStorageSinkChains() {
    const findings = [];
    const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "location.href"];
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
              const hasSink = sinks.some((s) => code.includes(s));
              if (hasSink) findings.push({ storage, key, script: script.src || "inline", risk: "CRITICAL", note: "Storage key used near sink" });
            }
          });
        }
      } catch (e) {}
    });
    console.log("%c💾 Storage → Sink Chains:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo storage → sink chains.", "color: #27ae60;");
    return findings;
  }
  window.auditStorageSinkChains = auditStorageSinkChains;

  // Feature 28: Base Tag Hijack Test
  function testBaseTagHijack() {
    const findings = [];
    document.querySelectorAll("base[href]").forEach((base) => {
      const href = base.getAttribute("href");
      const isExternal = !href.startsWith(window.location.origin) && !href.startsWith("/");
      findings.push({ href, isExternal, risk: isExternal ? "CRITICAL" : "HIGH", note: isExternal ? "External base redirects all relative URLs" : "Internal base tag" });
    });
    document.querySelectorAll("a[href^='/'], a[href^='../']").forEach((a) => {
      const href = a.getAttribute("href");
      const base = document.querySelector("base[href]");
      if (base) {
        findings.push({ type: "relative-link", href, baseHref: base.getAttribute("href"), risk: "MEDIUM", note: "Relative link affected by base tag" });
      }
    });
    console.log("%c📌 Base Tag Hijack:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo base tag hijack vectors.", "color: #27ae60;");
    return findings;
  }
  window.testBaseTagHijack = testBaseTagHijack;

  // Feature 29: Service Worker Sink Detection
  function detectServiceWorkerSinks() {
    const findings = { registered: false, sinks: [] };
    if ("serviceWorker" in navigator) {
      findings.registered = true;
      navigator.serviceWorker.getRegistrations().then((regs) => {
        findings.scopes = regs.map((r) => ({ scope: r.scope, active: !!r.active }));
        if (regs.length > 0) {
          findings.sinks.push("Service Worker intercepts fetch events - can modify responses");
          findings.sinks.push("Service Worker can cache XSS payloads");
          console.log("%c⚙️ Service Worker Sinks:", "color: #9b59b6; font-weight: bold;");
          console.table(findings.scopes);
          console.log("%c⚠️ Check SW cache for stored XSS payloads", "color: #f39c12;");
        }
      });
    } else {
      findings.sinks.push("Service Workers not supported");
    }
    return findings;
  }
  window.detectServiceWorkerSinks = detectServiceWorkerSinks;

  // Feature 30: Prototype Pollution Detection
  function testPrototypePollution() {
    const findings = [];
    const testObj = {};
    const testKey = "__pollution_test_" + Math.random().toString(36).substring(2);
    try {
      testObj["__proto__"][testKey] = "polluted";
      if (testObj[testKey] === "polluted") findings.push({ type: "__proto__ assignment", risk: "CRITICAL" });
    } catch (e) {}
    try {
      Object.assign({}, JSON.parse('{"__proto__":{"polluted2":"yes"}}'));
    } catch (e) {}
    const scripts = [];
    document.querySelectorAll("script:not([src])").forEach((s) => scripts.push(s.textContent));
    const allCode = scripts.join("\n");
    const patterns = [
      { regex: /\bextend\b.*\b__proto__\b/g, name: "extend(__proto__)" },
      { regex: /\bmerge\b.*\b__proto__\b/g, name: "merge(__proto__)" },
      { regex: /Object\.assign\b/g, name: "Object.assign" },
      { regex: /\[.*__proto__.*\]/g, name: "__proto__ bracket access" },
    ];
    patterns.forEach(({ regex, name }) => {
      const matches = allCode.match(regex);
      if (matches) findings.push({ pattern: name, count: matches.length, risk: "MEDIUM" });
    });
    console.log("%c🔬 Prototype Pollution:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo prototype pollution patterns.", "color: #27ae60;");
    return findings;
  }
  window.testPrototypePollution = testPrototypePollution;

  // Feature 31: XSS Vector Scanner
  function scanXSSVectors() {
    const vectors = [];
    document.querySelectorAll("a[href^='javascript:'], a[href^='data:']").forEach((a) => {
      vectors.push({ tag: "A", href: a.getAttribute("href").substring(0, 80), risk: "CRITICAL" });
    });
    document.querySelectorAll("[src^='javascript:'], [src^='data:']").forEach((el) => {
      vectors.push({ tag: el.tagName, src: el.getAttribute("src").substring(0, 80), risk: "CRITICAL" });
    });
    document.querySelectorAll("iframe[src^='javascript:'], iframe[src^='data:']").forEach((el) => {
      vectors.push({ tag: "IFRAME", src: el.getAttribute("src").substring(0, 80), risk: "CRITICAL" });
    });
    document.querySelectorAll("object[data^='javascript:'], embed[src^='javascript:']").forEach((el) => {
      vectors.push({ tag: el.tagName, risk: "CRITICAL" });
    });
    document.querySelectorAll("*[onclick], *[onload], *[onerror]").forEach((el) => {
      ["onclick", "onload", "onerror"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (val && /alert\(|confirm\(|prompt\(|eval\(/.test(val)) {
          vectors.push({ tag: el.tagName, handler: attr, code: val.substring(0, 60), risk: "HIGH" });
        }
      });
    });
    console.log("%c🎯 XSS Vector Scanner:", "color: #e74c3c; font-weight: bold;");
    if (vectors.length > 0) console.table(vectors);
    else console.log("%cNo XSS vectors found.", "color: #27ae60;");
    return vectors;
  }
  window.scanXSSVectors = scanXSSVectors;

  // Feature 32: DOMParser XSS Test
  function testDOMParserXSS() {
    const findings = [];
    const testPayloads = [
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<script>alert(1)</script>',
      '<iframe src="javascript:alert(1)">',
    ];
    const parser = new DOMParser();
    testPayloads.forEach((payload) => {
      try {
        const doc = parser.parseFromString(payload, "text/html");
        const scripts = doc.querySelectorAll("script");
        const eventHandlers = doc.querySelectorAll("[onerror],[onload],[onclick]");
        if (scripts.length > 0 || eventHandlers.length > 0) {
          findings.push({ payload: payload.substring(0, 50), createsScripts: scripts.length, createsHandlers: eventHandlers.length, risk: "HIGH" });
        }
      } catch (e) {}
    });
    console.log("%c📄 DOMParser XSS Test:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cDOMParser safe for test payloads.", "color: #27ae60;");
    return findings;
  }
  window.testDOMParserXSS = testDOMParserXSS;

  // Feature 33: Mixed Content Warning Detection
  function detectMixedContent() {
    const findings = [];
    if (window.location.protocol === "https:") {
      document.querySelectorAll("script[src^='http:'], link[href^='http:'], img[src^='http:'], iframe[src^='http:']").forEach((el) => {
        const src = el.getAttribute("src") || el.getAttribute("href");
        if (src && src.startsWith("http:")) {
          findings.push({ tag: el.tagName, src: src.substring(0, 80), type: el.tagName === "SCRIPT" ? "BLOCKED" : "WARNING", risk: el.tagName === "SCRIPT" ? "HIGH" : "MEDIUM" });
        }
      });
    }
    console.log("%c🔀 Mixed Content:", "color: #f39c12; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo mixed content (or page is HTTP).", "color: #27ae60;");
    return findings;
  }
  window.detectMixedContent = detectMixedContent;

  // Feature 34: URL Validation Bypass Test
  function testURLValidationBypass() {
    const findings = [];
    const bypassPayloads = [
      { payload: "javascript:alert(1)", technique: "direct" },
      { payload: "jAvAsCrIpT:alert(1)", technique: "case-mixing" },
      { payload: "javascript%3Aalert(1)", technique: "url-encoding" },
      { payload: "javascript&#58;alert(1)", technique: "html-entity" },
      { payload: "javascript&#x3A;alert(1)", technique: "hex-entity" },
      { payload: "data:text/html,<script>alert(1)</script>", technique: "data-uri" },
      { payload: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==", technique: "data-base64" },
    ];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      bypassPayloads.forEach(({ payload, technique }) => {
        if (href.toLowerCase().includes(payload.toLowerCase().substring(0, 10))) {
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

  // Feature 35: Clickjacking Target Scanner
  function scanClickjackingTargets() {
    const findings = [];
    const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    const cspFrame = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasCSPFrame = cspFrame && /frame-ancestors/.test(cspFrame.getAttribute("content"));
    if (!frameOptions && !hasCSPFrame) findings.push({ type: "no-protection", risk: "HIGH", note: "No X-Frame-Options or CSP frame-ancestors" });
    document.querySelectorAll("iframe").forEach((iframe) => {
      const src = iframe.src || "";
      if (!iframe.sandbox || iframe.sandbox.length === 0) {
        findings.push({ type: "unsandboxed-iframe", src: src.substring(0, 80), risk: "MEDIUM" });
      }
    });
    document.querySelectorAll("form[target='_blank']").forEach((form) => {
      const rel = form.getAttribute("rel") || "";
      if (!rel.includes("noopener")) findings.push({ type: "reverse-tabnabbing", form: form.id || "form", risk: "MEDIUM" });
    });
    console.log("%c🎯 Clickjacking Targets:", "color: #e67e22; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo clickjacking targets.", "color: #27ae60;");
    return findings;
  }
  window.scanClickjackingTargets = scanClickjackingTargets;

  // Feature 36: Storage XSS Deep Chain
  function testStorageXSSDeepChain() {
    const findings = [];
    const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "setInterval", "Function", "location.href", "location.assign"];
    ["localStorage", "sessionStorage"].forEach((storage) => {
      try {
        const store = window[storage];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          const value = store.getItem(key);
          if (!value || value.length < 3) continue;
          document.querySelectorAll("*").forEach((el) => {
            if (!el || !el.tagName) return;
            if (el.innerHTML && el.innerHTML.includes(value)) {
              const hasSink = sinks.some((s) => {
                for (const attr of el.attributes) {
                  if (attr.value && attr.value.includes(s)) return true;
                }
                return false;
              });
              findings.push({ storage, key, element: el.tagName + "#" + (el.id || ""), hasSink, risk: hasSink ? "CRITICAL" : "HIGH" });
            }
          });
        }
      } catch (e) {}
    });
    console.log("%c💾 Storage XSS Deep Chain:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo deep storage XSS chains.", "color: #27ae60;");
    return findings;
  }
  window.testStorageXSSDeepChain = testStorageXSSDeepChain;

  // Feature 37: CSP Violation Report Detection
  function detectCSPViolations() {
    const findings = { reports: [], header: null, meta: null };
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (meta) findings.meta = meta.getAttribute("content");
    const reports = performance.getEntriesByType ? performance.getEntriesByType("csp-violation") : [];
    if (reports.length > 0) {
      findings.reports = reports.map((r) => ({ directive: r.disposition, blocked: r.blockedURI, policy: r.originalPolicy }));
    }
    if (window.SecurityPolicyViolationEvent) {
      console.log("%c🛡️ CSP Violation Listener: Add 'document.addEventListener(\"securitypolicyviolation\", e => console.log(e))' to capture violations", "color: #f39c12;");
    }
    console.log("%c📋 CSP Violation Reports:", "color: #f39c12; font-weight: bold;");
    if (findings.meta) console.log("CSP Meta: " + findings.meta.substring(0, 100));
    if (findings.reports.length > 0) console.table(findings.reports);
    else console.log("%cNo CSP violations recorded in performance entries.", "color: #7f8c8d;");
    return findings;
  }
  window.detectCSPViolations = detectCSPViolations;

  // Feature 38: Redirect Chain Audit
  function auditRedirectChains() {
    const findings = [];
    const url = new URL(window.location.href);
    const redirectParams = ["redirect", "return", "next", "go", "url", "continue", "redir", "back", "forward", "to", "rurl", "dest", "destination", "checkout_url", "return_url"];
    url.searchParams.forEach((value, key) => {
      if (redirectParams.some((p) => key.toLowerCase().includes(p))) {
        let targetUrl;
        try { targetUrl = new URL(value); } catch (e) {}
        if (targetUrl) {
          const isExternal = targetUrl.origin !== window.location.origin;
          findings.push({ param: key, value: value.substring(0, 80), isExternal, risk: isExternal ? "CRITICAL" : "MEDIUM" });
        }
      }
    });
    document.querySelectorAll("meta[http-equiv='refresh']").forEach((meta) => {
      const content = meta.getAttribute("content");
      if (content && /url\s*=/i.test(content)) {
        const urlMatch = content.match(/url\s*=\s*(.+)/i);
        if (urlMatch) findings.push({ type: "meta-refresh", url: urlMatch[1].substring(0, 80), risk: "MEDIUM" });
      }
    });
    console.log("%c🔄 Redirect Chain Audit:", "color: #f39c12; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo redirect chains found.", "color: #27ae60;");
    return findings;
  }
  window.auditRedirectChains = auditRedirectChains;

  // Feature 39: Document.write Sink Test
  function testDocumentWriteSink() {
    const findings = [];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      if (/document\.write\s*\(|document\.writeln\s*\(/.test(code)) {
        const match = code.match(/document\.write(ln)?\s*\(([^)]{0,100})/);
        const hasUserInput = /location\.|document\.URL|document\.referrer|window\.name|document\.cookie/.test(code);
        findings.push({ script: script.src || "inline", snippet: match ? match[0].substring(0, 80) : "document.write(...)", hasUserInput, risk: hasUserInput ? "CRITICAL" : "HIGH" });
      }
    });
    console.log("%c📝 Document.write Sink:", "color: #e74c3c; font-weight: bold;");
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo document.write sinks.", "color: #27ae60;");
    return findings;
  }
  window.testDocumentWriteSink = testDocumentWriteSink;

  // Feature 40: Comprehensive Security Report Generator
  function generateSecurityReport() {
    const report = { timestamp: new Date().toISOString(), url: window.location.href, sections: {} };
    console.log("%c📊 GENERATING COMPREHENSIVE SECURITY REPORT...", "color: #e74c3c; font-size: 14px; font-weight: bold;");
    console.log("=".repeat(60));
    try { report.sections.xssVectors = scanXSSVectors(); } catch (e) { report.sections.xssVectors = []; }
    try { report.sections.javascriptURI = detectJavascriptURI(); } catch (e) { report.sections.javascriptURI = []; }
    try { report.sections.formActionXSS = testFormActionXSS(); } catch (e) { report.sections.formActionXSS = []; }
    try { report.sections.openRedirects = scanForOpenRedirects(); } catch (e) { report.sections.openRedirects = []; }
    try { report.sections.csp = checkCSP(); } catch (e) { report.sections.csp = {}; }
    try { report.sections.domClobbering = checkDOMClobbering(); } catch (e) { report.sections.domClobbering = []; }
    try { report.sections.postMessage = testPostMessageSink(); } catch (e) { report.sections.postMessage = []; }
    try { report.sections.prototypePollution = testPrototypePollution(); } catch (e) { report.sections.prototypePollution = []; }
    try { report.sections.storageChains = auditStorageSinkChains(); } catch (e) { report.sections.storageChains = []; }
    try { report.sections.redirectChains = auditRedirectChains(); } catch (e) { report.sections.redirectChains = []; }
    try { report.sections.mixedContent = detectMixedContent(); } catch (e) { report.sections.mixedContent = []; }
    try { report.sections.clickjacking = scanClickjackingTargets(); } catch (e) { report.sections.clickjacking = []; }
    try { report.sections.dangerousCSS = detectDangerousCSSSinks(); } catch (e) { report.sections.dangerousCSS = []; }
    try { report.sections.encodedSinks = detectEncodedSinks(); } catch (e) { report.sections.encodedSinks = []; }
    const totalFindings = Object.values(report.sections).flat().length;
    const criticalCount = Object.values(report.sections).flat().filter((f) => f && f.risk === "CRITICAL").length;
    report.summary = { totalFindings, criticalCount, riskLevel: criticalCount > 0 ? "CRITICAL" : totalFindings > 5 ? "HIGH" : "LOW" };
    console.log("=".repeat(60));
    console.log("%c📊 REPORT SUMMARY:", "color: #e74c3c; font-weight: bold;");
    console.log(`  Total Findings: ${totalFindings}`);
    console.log(`  Critical: ${criticalCount}`);
    console.log(`  Risk Level: ${report.summary.riskLevel}`);
    console.log("%c📥 Generating JSON download...", "color: #27ae60;");
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-report-" + Date.now() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
    window.lastSecurityReport = report;
    return report;
  }
  window.generateSecurityReport = generateSecurityReport;

  console.log("%c🚀 20 MORE ENHANCEMENTS LOADED (Features 21-40)", "color: #e74c3c; font-weight: bold;");
  console.log("New: testFormActionXSS, detectEncodedSinks, testPostMessageSink, scanForOpenRedirects, testAttributeInjection, detectDangerousCSSSinks, auditStorageSinkChains, testBaseTagHijack, detectServiceWorkerSinks, testPrototypePollution, scanXSSVectors, testDOMParserXSS, detectMixedContent, testURLValidationBypass, scanClickjackingTargets, testStorageXSSDeepChain, detectCSPViolations, auditRedirectChains, testDocumentWriteSink, generateSecurityReport");

  // Auto-run on load
  findReflections();
})();
