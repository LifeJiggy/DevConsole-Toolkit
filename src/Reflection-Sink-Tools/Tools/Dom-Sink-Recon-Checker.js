// DOM Reflection & Sink Mapper Tool
// Run in DevTools console for bug bounty mapping of user-specified interactive elements.
// Outputs yes/no for reflections (body/DOM) and sinks, with state/values for further analysis.
// Features:
// 1. Extract Interactive Elements (forms, inputs, buttons, etc.) for context.
// 2. Map Event Listeners and Handlers for context.
// 3. Manual Check for Reflections (Body/DOM) via checkReflectionsAndSinks(elements).
// 4. Manual Check for Sinks (e.g., eval, innerHTML) via checkReflectionsAndSinks(elements).
// 5. Monitor DOM Mutations for context.
// Usage: Run to map context, then call checkReflectionsAndSinks([element1, element2]) for specific elements.

(function () {
  // Banner
  console.log(
    "%cDOM Reflection & Sink Mapper",
    "font-size: 20px; color: cyan; font-weight: bold;"
  );
  console.log(
    "%cMap user-specified interactive elements for reflections/sinks in bug bounty planning.",
    "font-size: 16px; color: lime;"
  );
  console.log("Features:");
  const features = [
    "1. Extract Interactive Elements (context)",
    "2. Map Event Listeners and Handlers (context)",
    "3. Check Reflections in Body/DOM (manual via checkReflectionsAndSinks)",
    "4. Check Sinks in DOM (manual via checkReflectionsAndSinks)",
    "5. Monitor DOM Mutations (context)",
  ];
  features.forEach((f) => console.log(f));
  console.log(
    'Enter 1-5 to run a feature, "all" for all, "save" for JSON, "exit" to quit.'
  );
  console.log(
    'Call checkReflectionsAndSinks(elements) to analyze your elements (e.g., checkReflectionsAndSinks(document.querySelectorAll("input"))).'
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

    if (choice.includes("console")) {
      console.table(output.data); // Tabular output for clarity
      console.log(`Feature ${featureNum} Details:`, output.description);
    }

    if (choice.includes("json")) {
      const jsonStr = JSON.stringify(output, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mapper_feature_${featureNum}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    if (choice.includes("ui")) {
      const uiDiv = document.createElement("div");
      uiDiv.style.position = "fixed";
      uiDiv.style.top = "20px";
      uiDiv.style.right = "20px";
      uiDiv.style.background = "#fff";
      uiDiv.style.border = "2px solid cyan";
      uiDiv.style.padding = "15px";
      uiDiv.style.maxWidth = "60vw";
      uiDiv.style.maxHeight = "80vh";
      uiDiv.style.overflow = "auto";
      uiDiv.style.zIndex = "10000";
      uiDiv.innerHTML = `<h3>Feature ${featureNum}: ${
        output.description
      }</h3><pre style="white-space: pre-wrap;">${JSON.stringify(
        output.data,
        null,
        2
      )}</pre>`;
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.marginTop = "10px";
      closeBtn.onclick = () => uiDiv.remove();
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
    a.download = "mapper_all_outputs.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Core Function: Check Reflections and Sinks (User-called)
  window.checkReflectionsAndSinks = function (elements) {
    const results = [];
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
      const elInfo = `${el.tagName.toLowerCase()}#${el.id || ""}.${
        el.className || ""
      }`;
      const result = {
        element: elInfo,
        bodyReflection: "No",
        domReflection: "No",
        sink: "No",
        state: {},
        listeners: [],
        handlers: [],
      };

      // Map listeners and handlers
      const handlers = {};
      for (let attr in el)
        if (attr.startsWith("on") && el[attr])
          handlers[attr] = el[attr].toString();
      result.handlers = Object.entries(handlers).map(([k, v]) => ({
        event: k,
        code: v,
      }));
      const listeners =
        typeof getEventListeners === "function" ? getEventListeners(el) : {};
      result.listeners = Object.entries(listeners).map(([k, v]) => ({
        event: k,
        code: v.map((l) => l.listener.toString()),
      }));

      // Task 1: Check Reflections
      const inputs =
        el.tagName.toLowerCase() === "input" ||
        el.tagName.toLowerCase() === "textarea"
          ? [el]
          : el.querySelectorAll("input, textarea");
      inputs.forEach((input) => {
        const testValue = `test${Math.random().toString(36).slice(2, 8)}`;
        const originalValue = input.value;
        input.value = testValue;

        // Check Body (page content)
        const bodyCheck =
          document.body.textContent.includes(testValue) ||
          document.body.innerHTML.includes(testValue);
        if (bodyCheck) {
          result.bodyReflection = "Yes";
          result.state.body = {
            value: testValue,
            elements: Array.from(
              document.querySelectorAll(
                "*:not(input):not(textarea):not(script):not(style)"
              )
            )
              .filter(
                (e) =>
                  e.textContent.includes(testValue) ||
                  e.innerHTML.includes(testValue)
              )
              .map((e) => `${e.tagName.toLowerCase()}#${e.id || ""}`),
          };
        }

        // Check DOM (URL or other elements)
        const url = new URL(window.location);
        const domCheck =
          url.search.includes(testValue) ||
          url.hash.includes(testValue) ||
          Array.from(document.querySelectorAll("*")).some(
            (e) =>
              e !== input &&
              (e.textContent.includes(testValue) ||
                e.innerHTML.includes(testValue))
          );
        if (domCheck) {
          result.domReflection = "Yes";
          result.state.dom = {
            value: testValue,
            url:
              url.search.includes(testValue) || url.hash.includes(testValue)
                ? url.toString()
                : null,
            elements: Array.from(
              document.querySelectorAll(
                "*:not(input):not(textarea):not(script):not(style)"
              )
            )
              .filter(
                (e) =>
                  e.textContent.includes(testValue) ||
                  e.innerHTML.includes(testValue)
              )
              .map((e) => `${e.tagName.toLowerCase()}#${e.id || ""}`),
          };
        }

        input.value = originalValue; // Restore
      });

      // Task 2: Check Sinks
      const codeSnippets = result.handlers
        .map((h) => h.code)
        .concat(result.listeners.flatMap((l) => l.code));
      const foundSinks = sinks.filter((sink) =>
        codeSnippets.some((code) => code.includes(sink))
      );
      if (foundSinks.length) {
        result.sink = "Yes";
        result.state.sinks = foundSinks.map((sink) => ({
          sink,
          code: codeSnippets.filter((code) => code.includes(sink)),
        }));
      }

      results.push(result);
    });

    handleOutput("custom", {
      description: "Manual Reflections and Sinks Check",
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
      return {
        description: features[0],
        data: interactiveElements.map((e) => ({
          element: `${e.tag}#${e.id || ""}.${e.class || ""}`,
          attributes: e.attributes,
        })),
      };
    },
    2: () => {
      const data = interactiveElements.map(({ element: el }) => {
        const handlers = {};
        for (let attr in el)
          if (attr.startsWith("on") && el[attr])
            handlers[attr] = el[attr].toString();
        const listeners =
          typeof getEventListeners === "function" ? getEventListeners(el) : {};
        return {
          element: `${el.tagName.toLowerCase()}#${el.id || ""}.${
            el.className || ""
          }`,
          handlers: Object.entries(handlers).map(([k, v]) => ({
            event: k,
            code: v,
          })),
          listeners: Object.entries(listeners).map(([k, v]) => ({
            event: k,
            code: v.map((l) => l.listener.toString()),
          })),
        };
      });
      interactiveElements.forEach(({ element: el }) => {
        el.style.border = "2px solid cyan";
        el.addEventListener("click", () =>
          console.trace(`Trigger on ${el.tagName.toLowerCase()}#${el.id || ""}`)
        );
      });
      return { description: features[1], data };
    },
    3: () => {
      console.log(
        'Call checkReflectionsAndSinks(elements) with your elements (e.g., checkReflectionsAndSinks(document.querySelectorAll("input"))).'
      );
      return {
        description: features[2],
        data: [{ message: "Ready for manual reflection check" }],
      };
    },
    4: () => {
      console.log(
        'Call checkReflectionsAndSinks(elements) with your elements (e.g., checkReflectionsAndSinks(document.querySelectorAll("form"))).'
      );
      return {
        description: features[3],
        data: [{ message: "Ready for manual sink check" }],
      };
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
        data: [{ message: "Mutation observer attached" }],
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
        "Mapper exited. Listeners/observers remain active—refresh to reset."
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

  // Start
  menuLoop();

  // ===========================================
  // 🔬 ADVANCED SINK DETECTION ENGINE
  // ===========================================

  const advancedSinkCatalog = {
    framework: {
      dangerouslySetInnerHTML: {
        description: "React dangerous HTML injection sink",
        risk: "CRITICAL",
        framework: "React",
        attackVector: "Direct HTML injection via React props",
        mitigation: "Use DOMPurify before setting",
      },
      vHtml: {
        description: "Vue.js HTML binding sink",
        risk: "CRITICAL",
        framework: "Vue",
        attackVector: "v-html directive injection",
        mitigation: "Sanitize content before binding",
      },
      innerHTML_binding: {
        description: "Angular HTML binding sink",
        risk: "HIGH",
        framework: "Angular",
        attackVector: "[innerHTML] property binding",
        mitigation: "Use DomSanitizer.bypassSecurityTrustHtml",
      },
    },
    template: {
      template_literal: {
        description: "Template literal injection sink",
        risk: "HIGH",
        pattern: "${userInput}",
        attackVector: "Expression injection in templates",
      },
      string_interpolation: {
        description: "String interpolation sink",
        risk: "HIGH",
        pattern: "{{userInput}}",
        attackVector: "Template expression injection",
      },
    },
    webapi: {
      postMessage: {
        description: "Cross-window messaging sink",
        risk: "HIGH",
        attackVector: "Message event injection",
        mitigation: "Validate message origin",
      },
      fetch: {
        description: "Fetch API sink",
        risk: "MEDIUM",
        attackVector: "URL injection, credential leakage",
        mitigation: "Validate URLs, use CORS properly",
      },
      XMLHttpRequest: {
        description: "XHR request sink",
        risk: "MEDIUM",
        attackVector: "URL injection, response handling",
        mitigation: "Validate URLs, sanitize responses",
      },
      WebSocket: {
        description: "WebSocket connection sink",
        risk: "HIGH",
        attackVector: "Protocol injection, data exfiltration",
        mitigation: "Validate WebSocket URLs",
      },
      importScripts: {
        description: "Service Worker import sink",
        risk: "CRITICAL",
        attackVector: "Remote script injection",
        mitigation: "Only import trusted scripts",
      },
    },
    storage: {
      localStorage_setItem: {
        description: "Local storage write sink",
        risk: "MEDIUM",
        attackVector: "Stored XSS via localStorage",
        mitigation: "Sanitize before storing",
      },
      sessionStorage_setItem: {
        description: "Session storage write sink",
        risk: "MEDIUM",
        attackVector: "Session-based XSS",
        mitigation: "Sanitize before storing",
      },
      cookie_write: {
        description: "Cookie write sink",
        risk: "HIGH",
        attackVector: "Cookie manipulation, session fixation",
        mitigation: "Use HttpOnly, Secure flags",
      },
    },
    domManipulation: {
      appendChild: {
        description: "DOM append child sink",
        risk: "MEDIUM",
        attackVector: "Dynamic element injection",
        mitigation: "Create elements safely",
      },
      prepend: {
        description: "DOM prepend sink",
        risk: "MEDIUM",
        attackVector: "Element injection at start",
        mitigation: "Validate content before prepending",
      },
      replaceWith: {
        description: "DOM replace with sink",
        risk: "HIGH",
        attackVector: "Element replacement attack",
        mitigation: "Validate replacement content",
      },
      insertAdjacentElement: {
        description: "Adjacent element insertion sink",
        risk: "MEDIUM",
        attackVector: "Positional element injection",
        mitigation: "Sanitize element before insertion",
      },
    },
    attributeManipulation: {
      setAttribute: {
        description: "Attribute setting sink",
        risk: "MEDIUM",
        attackVector: "Dynamic attribute injection",
        mitigation: "Validate attribute names and values",
      },
    },
    style: {
      style_cssText: {
        description: "CSS text injection sink",
        risk: "MEDIUM",
        attackVector: "CSS injection, expression() abuse",
        mitigation: "Sanitize CSS values",
      },
      insertRule: {
        description: "CSS rule insertion sink",
        risk: "MEDIUM",
        attackVector: "Dynamic stylesheet injection",
        mitigation: "Sanitize CSS rules",
      },
    },
    shadowDOM: {
      attachShadow: {
        description: "Shadow DOM attachment sink",
        risk: "MEDIUM",
        attackVector: "Shadow DOM injection",
        mitigation: "Validate shadow root content",
      },
      shadowRoot_innerHTML: {
        description: "Shadow root HTML injection sink",
        risk: "CRITICAL",
        attackVector: "Shadow DOM XSS",
        mitigation: "Sanitize shadow content",
      },
    },
    customElements: {
      customElements_define: {
        description: "Custom element definition sink",
        risk: "HIGH",
        attackVector: "Custom element hijacking",
        mitigation: "Validate custom element definitions",
      },
    },
    history: {
      history_pushState: {
        description: "History pushState sink",
        risk: "MEDIUM",
        attackVector: "URL manipulation, phishing",
        mitigation: "Validate state objects",
      },
      history_replaceState: {
        description: "History replaceState sink",
        risk: "MEDIUM",
        attackVector: "URL replacement attacks",
        mitigation: "Validate state objects",
      },
    },
    media: {
      getUserMedia: {
        description: "Media capture sink",
        risk: "CRITICAL",
        attackVector: "Camera/microphone access",
        mitigation: "Require explicit consent",
      },
    },
    serviceWorker: {
      navigator_serviceWorker_register: {
        description: "Service Worker registration sink",
        risk: "CRITICAL",
        attackVector: "Service Worker injection",
        mitigation: "Only register trusted workers",
      },
    },
    workers: {
      Worker: {
        description: "Web Worker creation sink",
        risk: "HIGH",
        attackVector: "Worker script injection",
        mitigation: "Only load trusted workers",
      },
    },
    iframe: {
      iframe_srcdoc: {
        description: "iframe srcdoc injection sink",
        risk: "CRITICAL",
        attackVector: "Inline frame injection",
        mitigation: "Sanitize srcdoc content",
      },
      iframe_sandbox: {
        description: "iframe sandbox manipulation sink",
        risk: "HIGH",
        attackVector: "Sandbox bypass",
        mitigation: "Set appropriate sandbox flags",
      },
    },
    clipboard: {
      clipboard_writeText: {
        description: "Clipboard write sink",
        risk: "MEDIUM",
        attackVector: "Clipboard poisoning",
        mitigation: "Validate clipboard content",
      },
      clipboard_readText: {
        description: "Clipboard read sink",
        risk: "HIGH",
        attackVector: "Clipboard data exfiltration",
        mitigation: "Require user consent",
      },
    },
    fileapi: {
      FileReader: {
        description: "File reading sink",
        risk: "HIGH",
        attackVector: "File content exfiltration",
        mitigation: "Validate file sources",
      },
      Blob: {
        description: "Blob creation sink",
        risk: "MEDIUM",
        attackVector: "Binary data injection",
        mitigation: "Validate Blob content",
      },
    },
    encoding: {
      atob: {
        description: "Base64 decoding sink",
        risk: "MEDIUM",
        attackVector: "Encoded payload execution",
        mitigation: "Validate decoded content",
      },
      btoa: {
        description: "Base64 encoding sink",
        risk: "LOW",
        attackVector: "Data encoding",
        mitigation: "Use for legitimate encoding",
      },
    },
  };

  function detectAdvancedSinks(element) {
    const detectedSinks = {
      framework: [],
      template: [],
      webapi: [],
      storage: [],
      domManipulation: [],
      attributeManipulation: [],
      style: [],
      shadowDOM: [],
      customElements: [],
      history: [],
      media: [],
      serviceWorker: [],
      workers: [],
      iframe: [],
      clipboard: [],
      fileapi: [],
      encoding: [],
    };

    Object.keys(advancedSinkCatalog.framework).forEach((sinkName) => {
      if (element.hasAttribute?.(sinkName) || element[sinkName] !== undefined) {
        detectedSinks.framework.push({
          sink: sinkName,
          ...advancedSinkCatalog.framework[sinkName],
          detected: true,
        });
      }
    });

    Object.keys(advancedSinkCatalog.webapi).forEach((sinkName) => {
      const baseName = sinkName.split("_")[0];
      if (window[baseName] !== undefined || element[sinkName] !== undefined) {
        detectedSinks.webapi.push({
          sink: sinkName,
          ...advancedSinkCatalog.webapi[sinkName],
          detected: true,
        });
      }
    });

    if (typeof element.setAttribute === "function") {
      detectedSinks.attributeManipulation.push({
        sink: "setAttribute",
        ...advancedSinkCatalog.attributeManipulation.setAttribute,
        detected: true,
      });
    }

    if (element.style) {
      detectedSinks.style.push({
        sink: "style",
        ...advancedSinkCatalog.style.style_cssText,
        detected: true,
      });
    }

    if (typeof element.attachShadow === "function") {
      detectedSinks.shadowDOM.push({
        sink: "attachShadow",
        ...advancedSinkCatalog.shadowDOM.attachShadow,
        detected: true,
      });
    }

    if (element.tagName === "IFRAME") {
      detectedSinks.iframe.push({
        sink: "iframe",
        ...advancedSinkCatalog.iframe.iframe_srcdoc,
        detected: true,
        hasSrcdoc: element.hasAttribute("srcdoc"),
        hasSandbox: element.hasAttribute("sandbox"),
      });
    }

    return detectedSinks;
  }

  // ===========================================
  // 🕸️ ENHANCED MUTATION OBSERVER
  // ===========================================

  class EnhancedMutationObserver {
    constructor() {
      this.observer = null;
      this.mutations = [];
      this.callbacks = [];
      this.isObserving = false;
    }

    start(target = document.body) {
      if (this.isObserving) return;

      this.observer = new MutationObserver(this.handleMutations.bind(this));
      this.observer.observe(target, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true,
      });
      this.isObserving = true;
      console.log("%c🕸️ Enhanced Mutation Observer started", "color: #00ced1; font-weight: bold;");
    }

    stop() {
      if (this.observer && this.isObserving) {
        this.observer.disconnect();
        this.isObserving = false;
        console.log("%c🕸️ Mutation Observer stopped", "color: #f39c12; font-weight: bold;");
      }
    }

    handleMutations(mutations) {
      mutations.forEach((mutation) => {
        const analysis = this.analyzeMutation(mutation);
        this.mutations.push(analysis);
        this.callbacks.forEach((cb) => cb(analysis));

        if (analysis.riskLevel === "CRITICAL" || analysis.riskLevel === "HIGH") {
          console.log(
            `%c⚠️ ${analysis.riskLevel} RISK MUTATION: ${analysis.type}`,
            analysis.riskLevel === "CRITICAL" ? "color: #e74c3c; font-weight: bold;" : "color: #f39c12; font-weight: bold;"
          );
          console.log("Details:", analysis.details);
        }
      });
    }

    analyzeMutation(mutation) {
      const analysis = {
        timestamp: new Date().toISOString(),
        type: mutation.type,
        riskLevel: "LOW",
        details: {},
        sinks: [],
      };

      if (mutation.type === "childList") {
        Array.from(mutation.addedNodes).forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName?.toLowerCase();
            if (tag === "script") {
              analysis.riskLevel = "CRITICAL";
              analysis.sinks.push("script_injection");
            }
            if (tag === "iframe") {
              analysis.riskLevel = "HIGH";
              analysis.sinks.push("iframe_injection");
            }
          }
        });
        analysis.details = {
          addedNodes: mutation.addedNodes.length,
          removedNodes: mutation.removedNodes.length,
        };
      } else if (mutation.type === "attributes") {
        const attr = mutation.attributeName;
        if (attr.toLowerCase().startsWith("on")) {
          analysis.riskLevel = "CRITICAL";
          analysis.sinks.push(`event_handler_change_${attr}`);
        }
        if (["src", "href", "action"].includes(attr.toLowerCase())) {
          analysis.riskLevel = "HIGH";
          analysis.sinks.push(`attribute_change_${attr}`);
        }
        analysis.details = {
          attributeName: attr,
          element: mutation.target.tagName,
        };
      }

      return analysis;
    }

    onMutation(callback) {
      this.callbacks.push(callback);
    }

    getMutationSummary() {
      const summary = {
        totalMutations: this.mutations.length,
        riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      };
      this.mutations.forEach((m) => {
        summary.riskDistribution[m.riskLevel]++;
      });
      return summary;
    }
  }

  const enhancedMutationObserver = new EnhancedMutationObserver();
  window.enhancedMutationObserver = enhancedMutationObserver;

  // ===========================================
  // 🎯 GADGET CHAIN DETECTION
  // ===========================================

  const gadgetChainCatalog = {
    prototypePollution: {
      name: "Prototype Pollution",
      risk: "CRITICAL",
      patterns: ["__proto__", "constructor.prototype"],
    },
    domClobbering: {
      name: "DOM Clobbering",
      risk: "HIGH",
      patterns: ["named elements", "id attributes"],
    },
    postMessageChain: {
      name: "PostMessage Exploitation",
      risk: "HIGH",
      patterns: ["postMessage", "message event listener"],
    },
    jqueryChains: {
      name: "jQuery Exploitation",
      risk: "HIGH",
      patterns: ["$()", ".html()", ".append()"],
    },
    serviceWorkerChain: {
      name: "Service Worker Exploitation",
      risk: "CRITICAL",
      patterns: ["serviceWorker.register", "importScripts"],
    },
    urlBasedChain: {
      name: "URL-Based Exploitation",
      risk: "HIGH",
      patterns: ["location.search", "location.hash"],
    },
  };

  function detectGadgetChains(element) {
    const detectedChains = [];

    if (element.__proto__ || element.constructor?.prototype) {
      detectedChains.push({ ...gadgetChainCatalog.prototypePollution, detected: true });
    }

    if (window.jQuery || window.$) {
      detectedChains.push({ ...gadgetChainCatalog.jqueryChains, detected: true });
    }

    if (typeof element.postMessage === "function") {
      detectedChains.push({ ...gadgetChainCatalog.postMessageChain, detected: true });
    }

    if (navigator.serviceWorker) {
      detectedChains.push({ ...gadgetChainCatalog.serviceWorkerChain, detected: true });
    }

    return detectedChains;
  }

  // ===========================================
  // 🛡️ CSP ANALYSIS
  // ===========================================

  function analyzeCSP() {
    const cspAnalysis = {
      hasCSP: false,
      policies: {},
      weaknesses: [],
      recommendations: [],
      riskLevel: "UNKNOWN",
    };

    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const cspHeader = cspMeta?.getAttribute("content");

    if (cspHeader) {
      cspAnalysis.hasCSP = true;
      const directives = cspHeader.split(";");
      directives.forEach((directive) => {
        const parts = directive.trim().split(/\s+/);
        if (parts.length >= 2) {
          cspAnalysis.policies[parts[0]] = parts.slice(1);
        }
      });

      if (cspAnalysis.policies["script-src"]) {
        const scriptSrc = cspAnalysis.policies["script-src"];
        if (scriptSrc.includes("'unsafe-inline'")) {
          cspAnalysis.weaknesses.push("script-src allows unsafe-inline");
        }
        if (scriptSrc.includes("'unsafe-eval'")) {
          cspAnalysis.weaknesses.push("script-src allows unsafe-eval");
        }
        if (scriptSrc.includes("*")) {
          cspAnalysis.weaknesses.push("script-src allows any source");
        }
      } else {
        cspAnalysis.weaknesses.push("No script-src directive");
      }

      if (!cspAnalysis.policies["frame-ancestors"]) {
        cspAnalysis.weaknesses.push("No frame-ancestors restriction");
      }

      cspAnalysis.riskLevel = cspAnalysis.weaknesses.length === 0 ? "LOW" :
        cspAnalysis.weaknesses.length <= 3 ? "MEDIUM" :
        cspAnalysis.weaknesses.length <= 6 ? "HIGH" : "CRITICAL";
    } else {
      cspAnalysis.hasCSP = false;
      cspAnalysis.weaknesses.push("No CSP policy detected");
      cspAnalysis.recommendations.push("Implement Content-Security-Policy header");
    }

    return cspAnalysis;
  }

  // ===========================================
  // 🔗 SOURCE-TO-SINK ANALYSIS
  // ===========================================

  function analyzeSourceToSink() {
    const analysis = {
      sources: [],
      sinks: [],
      flows: [],
      riskLevel: "LOW",
    };

    const sources = [
      { name: "location.search", risk: "HIGH" },
      { name: "location.hash", risk: "MEDIUM" },
      { name: "document.referrer", risk: "MEDIUM" },
      { name: "window.name", risk: "MEDIUM" },
    ];

    const sinkList = [
      { name: "eval", risk: "CRITICAL" },
      { name: "innerHTML", risk: "CRITICAL" },
      { name: "document.write", risk: "CRITICAL" },
      { name: "Function", risk: "CRITICAL" },
    ];

    sources.forEach((source) => {
      try {
        if (eval(source.name)) {
          analysis.sources.push(source);
        }
      } catch (e) {}
    });

    sinkList.forEach((sink) => {
      analysis.sinks.push(sink);
    });

    analysis.sources.forEach((source) => {
      sinkList.forEach((sink) => {
        if (source.risk === "HIGH" && sink.risk === "CRITICAL") {
          analysis.flows.push({ source: source.name, sink: sink.name, combinedRisk: "CRITICAL" });
        }
      });
    });

    if (analysis.flows.some((f) => f.combinedRisk === "CRITICAL")) {
      analysis.riskLevel = "CRITICAL";
    } else if (analysis.flows.length > 0) {
      analysis.riskLevel = "HIGH";
    }

    return analysis;
  }

  // ===========================================
  // 📊 COMPREHENSIVE REPORT GENERATOR
  // ===========================================

  function generateComprehensiveReport(elements = []) {
    const report = {
      metadata: {
        tool: "Enhanced DOM Reflection & Sink Checker",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      summary: {
        totalElements: elements.length,
        totalSinks: 0,
        totalReflections: 0,
        totalGadgetChains: 0,
        overallRisk: "UNKNOWN",
      },
      cspAnalysis: analyzeCSP(),
      sourceToSinkAnalysis: analyzeSourceToSink(),
      elements: [],
      gadgetChains: [],
      recommendations: [],
    };

    elements.forEach((element, index) => {
      const elInfo = {
        index,
        tag: element.tagName?.toLowerCase(),
        id: element.id,
        class: element.className,
        attributes: Array.from(element.attributes || []).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        advancedSinks: detectAdvancedSinks(element),
        gadgetChains: detectGadgetChains(element),
      };

      report.elements.push(elInfo);
      report.summary.totalGadgetChains += elInfo.gadgetChains.length;
    });

    report.gadgetChains = detectGadgetChains(document.body);
    report.summary.overallRisk = report.cspAnalysis.riskLevel;

    if (!report.cspAnalysis.hasCSP) {
      report.recommendations.push({
        priority: "HIGH",
        category: "CSP",
        recommendation: "Implement Content-Security-Policy header",
      });
    }

    if (report.summary.totalGadgetChains > 0) {
      report.recommendations.push({
        priority: "CRITICAL",
        category: "Gadget Chains",
        recommendation: `Investigate ${report.summary.totalGadgetChains} detected gadget chains`,
      });
    }

    return report;
  }

  // ===========================================
  // 📋 ENHANCED EXPORT FUNCTIONS
  // ===========================================

  function exportComprehensiveReport(format = "json") {
    const elements = Array.from(document.querySelectorAll("*"));
    const report = generateComprehensiveReport(elements.slice(0, 100));

    if (format === "json") {
      const jsonString = JSON.stringify(report, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprehensive-dom-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("%c✅ Comprehensive report exported as JSON!", "color: #00ced1; font-weight: bold;");
    } else if (format === "html") {
      const htmlReport = generateHTMLReport(report);
      const blob = new Blob([htmlReport], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprehensive-dom-report-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("%c✅ Comprehensive report exported as HTML!", "color: #00ced1; font-weight: bold;");
    }

    return report;
  }

  function generateHTMLReport(report) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM Security Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #00ced1; border-bottom: 3px solid #00ced1; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .section { margin: 20px 0; padding: 15px; background: #ecf0f1; border-radius: 4px; }
        .critical { background: #ffebee; border-left: 4px solid #e74c3c; }
        .high { background: #fff3e0; border-left: 4px solid #f39c12; }
        .medium { background: #e3f2fd; border-left: 4px solid #3498db; }
        .low { background: #e8f5e9; border-left: 4px solid #27ae60; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border: 1px solid #bdc3c7; }
        th { background: #34495e; color: white; }
        tr:nth-child(even) { background: #ecf0f1; }
        .risk-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
        .risk-critical { background: #e74c3c; }
        .risk-high { background: #f39c12; }
        .risk-medium { background: #3498db; }
        .risk-low { background: #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 DOM Security Analysis Report</h1>
        <div class="section">
            <h2>Report Metadata</h2>
            <p><strong>Generated:</strong> ${report.metadata.timestamp}</p>
            <p><strong>URL:</strong> ${report.metadata.url}</p>
            <p><strong>Overall Risk:</strong> <span class="risk-badge risk-${report.summary.overallRisk.toLowerCase()}">${report.summary.overallRisk}</span></p>
        </div>
        <div class="section">
            <h2>Executive Summary</h2>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Elements Analyzed</td><td>${report.summary.totalElements}</td></tr>
                <tr><td>Gadget Chains Detected</td><td>${report.summary.totalGadgetChains}</td></tr>
            </table>
        </div>
        <div class="section ${report.cspAnalysis.hasCSP ? 'medium' : 'critical'}">
            <h2>CSP Analysis</h2>
            <p><strong>CSP Present:</strong> ${report.cspAnalysis.hasCSP ? "Yes" : "No"}</p>
            <p><strong>Risk Level:</strong> <span class="risk-badge risk-${report.cspAnalysis.riskLevel.toLowerCase()}">${report.cspAnalysis.riskLevel}</span></p>
            ${report.cspAnalysis.weaknesses.length > 0 ? `<h3>Weaknesses:</h3><ul>${report.cspAnalysis.weaknesses.map(w => `<li>${w}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="section">
            <h2>Recommendations</h2>
            ${report.recommendations.map(rec => `<div class="${rec.priority.toLowerCase()}"><strong>[${rec.priority}]</strong> ${rec.recommendation}</div>`).join("")}
        </div>
    </div>
</body>
</html>`;
  }

  // ===========================================
  // 🔄 SECURITY DASHBOARD
  // ===========================================

  class SecurityDashboard {
    constructor() {
      this.mutationObserver = enhancedMutationObserver;
      this.monitoringActive = false;
      this.events = [];
      this.alerts = [];
    }

    start() {
      this.monitoringActive = true;
      this.mutationObserver.start();
      this.mutationObserver.onMutation(this.handleMutation.bind(this));
      window.addEventListener("error", this.handleError.bind(this));
      console.log("%c📊 Security Dashboard Started", "color: #00ced1; font-weight: bold;");
    }

    stop() {
      this.monitoringActive = false;
      this.mutationObserver.stop();
      console.log("%c📊 Security Dashboard Stopped", "color: #f39c12; font-weight: bold;");
    }

    handleMutation(analysis) {
      this.events.push({ type: "mutation", timestamp: new Date().toISOString(), data: analysis });
      if (analysis.riskLevel === "CRITICAL" || analysis.riskLevel === "HIGH") {
        this.alerts.push({
          type: "mutation",
          level: analysis.riskLevel,
          message: `High-risk mutation: ${analysis.sinks.join(", ")}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    handleError(event) {
      this.events.push({ type: "error", timestamp: new Date().toISOString(), data: { message: event.message } });
      this.alerts.push({ type: "error", level: "HIGH", message: `JavaScript error: ${event.message}`, timestamp: new Date().toISOString() });
    }

    displayDashboard() {
      console.log("\n%c📊 SECURITY DASHBOARD", "background: linear-gradient(45deg, #00ced1, #3498db); color: white; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 8px;");
      console.log(`Monitoring: ${this.monitoringActive ? "✅ Active" : "❌ Inactive"}`);
      console.log(`Total Events: ${this.events.length}`);
      console.log(`Total Alerts: ${this.alerts.length}`);

      if (this.alerts.length > 0) {
        console.log("\n🚨 Recent Alerts:");
        this.alerts.slice(-10).forEach((alert) => {
          console.log(`[${alert.level}] ${alert.message}`);
        });
      }

      console.log("\n📈 Mutation Summary:");
      console.table(this.mutationObserver.getMutationSummary().riskDistribution);
    }
  }

  const securityDashboard = new SecurityDashboard();
  window.securityDashboard = securityDashboard;

  // ===========================================
  // 🎯 AUTO-SCAN FUNCTIONALITY
  // ===========================================

  function autoScan(options = {}) {
    const config = {
      maxElements: options.maxElements || 500,
      includeHidden: options.includeHidden || false,
      focusSelectors: options.focusSelectors || [],
      ...options,
    };

    console.log("%c🔄 Starting Auto-Scan...", "color: #00ced1; font-weight: bold;");

    let elements = [];
    if (config.focusSelectors.length > 0) {
      config.focusSelectors.forEach((selector) => {
        try {
          elements.push(...Array.from(document.querySelectorAll(selector)));
        } catch (e) {
          console.log(`%c❌ Invalid selector: ${selector}`, "color: #e74c3c; font-weight: bold;");
        }
      });
    } else {
      elements = Array.from(document.querySelectorAll("*"));
    }

    if (!config.includeHidden) {
      elements = elements.filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    }

    elements = elements.slice(0, config.maxElements);
    console.log(`📊 Found ${elements.length} elements to analyze`);

    const report = generateComprehensiveReport(elements);
    console.log("%c✅ Auto-Scan Complete!", "color: #27ae60; font-weight: bold;");
    console.log(`🎯 Overall Risk: ${report.summary.overallRisk}`);

    return report;
  }

  window.autoScan = autoScan;

  // ===========================================
  // 📊 BATCH PROCESSING
  // ===========================================

  async function batchProcessElements(selectors, options = {}) {
    const config = {
      delay: options.delay || 100,
      batchSize: options.batchSize || 50,
      ...options,
    };

    const results = [];
    const allElements = [];

    selectors.forEach((selector) => {
      try {
        allElements.push(...Array.from(document.querySelectorAll(selector)));
      } catch (e) {
        console.log(`%c❌ Invalid selector: ${selector}`, "color: #e74c3c; font-weight: bold;");
      }
    });

    console.log(`📊 Processing ${allElements.length} elements in batches...`);

    for (let i = 0; i < allElements.length; i += config.batchSize) {
      const batch = allElements.slice(i, i + config.batchSize);
      batch.forEach((element) => {
        results.push({
          tag: element.tagName?.toLowerCase(),
          id: element.id,
          advancedSinks: detectAdvancedSinks(element),
          gadgetChains: detectGadgetChains(element),
        });
      });

      if (i + config.batchSize < allElements.length) {
        await new Promise((resolve) => setTimeout(resolve, config.delay));
      }
    }

    console.log(`%c✅ Batch processing complete: ${results.length} elements`, "color: #27ae60; font-weight: bold;");
    return results;
  }

  window.batchProcessElements = batchProcessElements;

  // ===========================================
  // 🎯 ENHANCED GLOBAL EXPOSURE
  // ===========================================

  window.detectAdvancedSinks = detectAdvancedSinks;
  window.detectGadgetChains = detectGadgetChains;
  window.analyzeCSP = analyzeCSP;
  window.analyzeSourceToSink = analyzeSourceToSink;
  window.generateComprehensiveReport = generateComprehensiveReport;
  window.exportComprehensiveReport = exportComprehensiveReport;
  window.SecurityDashboard = SecurityDashboard;

  // ===========================================
  // 🎉 ENHANCED TOOL INITIALIZATION
  // ===========================================

  console.log("%c🎯 ENHANCED DOM REFLECTION & SINK CHECKER v2.0", "background: linear-gradient(45deg, #00ced1, #3498db); color: white; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 8px;");
  console.log("%c🗺️ Enhanced Bug Bounty Reconnaissance Tool Ready!", "color: #00ced1; font-size: 18px; font-weight: bold;");

  console.log("\n%c🚀 NEW FEATURES:", "color: #00ced1; font-weight: bold;");
  console.log("%c  ✅ Advanced sink detection (100+ sinks)", "color: #27ae60;");
  console.log("%c  ✅ Enhanced mutation monitoring", "color: #27ae60;");
  console.log("%c  ✅ Gadget chain detection", "color: #27ae60;");
  console.log("%c  ✅ CSP analysis", "color: #27ae60;");
  console.log("%c  ✅ Source-to-sink flow analysis", "color: #27ae60;");
  console.log("%c  ✅ Comprehensive report generation", "color: #27ae60;");
  console.log("%c  ✅ Security dashboard", "color: #27ae60;");
  console.log("%c  ✅ Auto-scan functionality", "color: #27ae60;");
  console.log("%c  ✅ Batch processing", "color: #27ae60;");

  console.log("\n%c📋 QUICK COMMANDS:", "color: #f39c12; font-weight: bold;");
  console.log("%c  autoScan()                           %c- Quick scan current page", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  exportComprehensiveReport()          %c- Full HTML/JSON report", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  window.securityDashboard.start()     %c- Start monitoring", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  window.securityDashboard.displayDashboard() %c- Show dashboard", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  analyzeCSP()                         %c- Analyze CSP policy", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  analyzeSourceToSink()                %c- Analyze data flows", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");

  console.log("\n%c🎯 Ready for advanced reconnaissance!", "color: #00ced1; font-weight: bold;");

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - WEB COMPONENTS
  // ===========================================

  const webComponentSinks = {
    customElementRegistry: {
      define: {
        description: "Custom element definition registration",
        risk: "HIGH",
        attackVector: "Custom element hijacking, prototype pollution",
        mitigation: "Validate element definitions before registration",
        examples: ["customElements.define('xss-element', MaliciousClass)"],
      },
      get: {
        description: "Custom element retrieval",
        risk: "MEDIUM",
        attackVector: "Element definition extraction",
        mitigation: "Monitor for unauthorized element access",
      },
      upgrade: {
        description: "Element upgrade trigger",
        risk: "MEDIUM",
        attackVector: "Forced element upgrade attacks",
        mitigation: "Validate element state before upgrade",
      },
      whenDefined: {
        description: "Element definition waiter",
        risk: "LOW",
        attackVector: "Timing-based attacks",
        mitigation: "Use with appropriate timeouts",
      },
    },
    shadowDOM: {
      attachShadow: {
        description: "Shadow DOM attachment",
        risk: "MEDIUM",
        attackVector: "Shadow DOM injection, style isolation bypass",
        mitigation: "Validate shadow root configuration",
        modes: ["open", "closed"],
      },
      shadowRoot: {
        description: "Shadow root access",
        risk: "MEDIUM",
        attackVector: "Shadow DOM content manipulation",
        mitigation: "Restrict shadow root access",
      },
      slot: {
        description: "Slot element for content projection",
        risk: "LOW",
        attackVector: "Content projection attacks",
        mitigation: "Validate slotted content",
      },
    },
    template: {
      HTMLTemplateElement: {
        description: "Template element manipulation",
        risk: "MEDIUM",
        attackVector: "Template content injection",
        mitigation: "Sanitize template content",
      },
      content: {
        description: "Template content access",
        risk: "MEDIUM",
        attackVector: "Document fragment extraction",
        mitigation: "Validate template usage",
      },
      importNode: {
        description: "Node import from template",
        risk: "MEDIUM",
        attackVector: "Cross-document node injection",
        mitigation: "Sanitize imported nodes",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - MODERN APIS
  // ===========================================

  const modernAPISinks = {
    webCrypto: {
      subtle: {
        description: "Subtle crypto API access",
        risk: "MEDIUM",
        attackVector: "Cryptographic operation abuse",
        operations: ["encrypt", "decrypt", "sign", "verify", "digest"],
        mitigation: "Use appropriate algorithms and key lengths",
      },
      getRandomValues: {
        description: "Random value generation",
        risk: "LOW",
        attackVector: "Entropy depletion attacks",
        mitigation: "Use for legitimate randomness needs",
      },
      generateKey: {
        description: "Cryptographic key generation",
        risk: "MEDIUM",
        attackVector: "Weak key generation",
        mitigation: "Use secure key generation parameters",
      },
    },
    webRTC: {
      RTCPeerConnection: {
        description: "WebRTC connection establishment",
        risk: "HIGH",
        attackVector: "IP leakage, unauthorized media access",
        mitigation: "Implement proper ICE candidate filtering",
      },
      getUserMedia: {
        description: "Media device access",
        risk: "CRITICAL",
        attackVector: "Camera/microphone hijacking",
        mitigation: "Require explicit user consent",
      },
      getDisplayMedia: {
        description: "Screen sharing access",
        risk: "HIGH",
        attackVector: "Screen content capture",
        mitigation: "Validate screen sharing requests",
      },
    },
    webBluetooth: {
      requestDevice: {
        description: "Bluetooth device request",
        risk: "HIGH",
        attackVector: "Bluetooth device enumeration",
        mitigation: "Require user gesture for requests",
      },
      getPrimaryService: {
        description: "Bluetooth service access",
        risk: "MEDIUM",
        attackVector: "Service characteristic extraction",
        mitigation: "Validate service UUIDs",
      },
    },
    webUSB: {
      requestDevice: {
        description: "USB device request",
        risk: "HIGH",
        attackVector: "USB device enumeration",
        mitigation: "Require user gesture for requests",
      },
      open: {
        description: "USB device open",
        risk: "HIGH",
        attackVector: "USB device manipulation",
        mitigation: "Validate device permissions",
      },
    },
    webSerial: {
      requestPort: {
        description: "Serial port request",
        risk: "HIGH",
        attackVector: "Serial port access",
        mitigation: "Require user gesture for requests",
      },
      open: {
        description: "Serial port open",
        risk: "HIGH",
        attackVector: "Serial communication interception",
        mitigation: "Validate port configuration",
      },
    },
    webHID: {
      requestDevice: {
        description: "HID device request",
        risk: "HIGH",
        attackVector: "HID device enumeration",
        mitigation: "Require user gesture for requests",
      },
      open: {
        description: "HID device open",
        risk: "HIGH",
        attackVector: "HID device manipulation",
        mitigation: "Validate device permissions",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - PAYMENT & IDENTITY
  // ===========================================

  const paymentIdentitySinks = {
    paymentRequest: {
      show: {
        description: "Payment request display",
        risk: "HIGH",
        attackVector: "Payment form injection",
        mitigation: "Validate payment method data",
      },
      canMakePayment: {
        description: "Payment capability check",
        risk: "LOW",
        attackVector: "Payment method enumeration",
        mitigation: "Use for legitimate payment flows",
      },
    },
    credentialManagement: {
      "navigator.credentials.get": {
        description: "Credential retrieval",
        risk: "HIGH",
        attackVector: "Credential extraction",
        mitigation: "Validate credential request options",
      },
      "navigator.credentials.store": {
        description: "Credential storage",
        risk: "HIGH",
        attackVector: "Credential injection",
        mitigation: "Validate credential data before storage",
      },
      "navigator.credentials.create": {
        description: "Credential creation",
        risk: "HIGH",
        attackVector: "Credential forgery",
        mitigation: "Use secure credential creation parameters",
      },
    },
    federatedIdentity: {
      FedCM: {
        description: "Federated Credential Management",
        risk: "HIGH",
        attackVector: "Identity provider manipulation",
        mitigation: "Validate IdP configuration",
      },
      IdentityProvider: {
        description: "Identity provider registration",
        risk: "HIGH",
        attackVector: "IdP hijacking",
        mitigation: "Verify IdP ownership",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - AI & ML APIS
  // ===========================================

  const aiMLSinks = {
    webNN: {
      ml: {
        description: "Web Neural Network API",
        risk: "MEDIUM",
        attackVector: "Model manipulation, data exfiltration",
        mitigation: "Validate model inputs and outputs",
      },
      createContext: {
        description: "ML context creation",
        risk: "MEDIUM",
        attackVector: "Context isolation bypass",
        mitigation: "Use appropriate compute devices",
      },
      createGraph: {
        description: "ML graph creation",
        risk: "MEDIUM",
        attackVector: "Graph manipulation",
        mitigation: "Validate graph operations",
      },
    },
    webGPU: {
      requestAdapter: {
        description: "GPU adapter request",
        risk: "LOW",
        attackVector: "GPU fingerprinting",
        mitigation: "Limit adapter information exposure",
      },
      requestDevice: {
        description: "GPU device request",
        risk: "MEDIUM",
        attackVector: "GPU feature enumeration",
        mitigation: "Validate device requirements",
      },
      createShaderModule: {
        description: "Shader module creation",
        risk: "HIGH",
        attackVector: "Shader injection, GPU exploitation",
        mitigation: "Validate shader code",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - SENSOR APIS
  // ===========================================

  const sensorSinks = {
    accelerometer: {
      Accelerometer: {
        description: "Accelerometer sensor access",
        risk: "MEDIUM",
        attackVector: "Motion data collection, activity tracking",
        mitigation: "Require sensor permissions",
      },
      LinearAccelerationSensor: {
        description: "Linear acceleration access",
        risk: "MEDIUM",
        attackVector: "Movement pattern analysis",
        mitigation: "Require sensor permissions",
      },
      GravitySensor: {
        description: "Gravity sensor access",
        risk: "LOW",
        attackVector: "Device orientation tracking",
        mitigation: "Require sensor permissions",
      },
    },
    gyroscope: {
      Gyroscope: {
        description: "Gyroscope sensor access",
        risk: "MEDIUM",
        attackVector: "Rotation data collection",
        mitigation: "Require sensor permissions",
      },
      AbsoluteOrientationSensor: {
        description: "Absolute orientation access",
        risk: "MEDIUM",
        attackVector: "Device orientation tracking",
        mitigation: "Require sensor permissions",
      },
      RelativeOrientationSensor: {
        description: "Relative orientation access",
        risk: "LOW",
        attackVector: "Rotation change tracking",
        mitigation: "Require sensor permissions",
      },
    },
    magnetometer: {
      Magnetometer: {
        description: "Magnetometer sensor access",
        risk: "MEDIUM",
        attackVector: "Magnetic field data collection",
        mitigation: "Require sensor permissions",
      },
      AmbientLightSensor: {
        description: "Ambient light sensor access",
        risk: "LOW",
        attackVector: "Light level monitoring",
        mitigation: "Require sensor permissions",
      },
    },
    proximity: {
      ProximitySensor: {
        description: "Proximity sensor access",
        risk: "LOW",
        attackVector: "Distance measurement",
        mitigation: "Require sensor permissions",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - STORAGE APIS
  // ===========================================

  const storageSinks = {
    indexedDB: {
      open: {
        description: "IndexedDB database open",
        risk: "MEDIUM",
        attackVector: "Database enumeration, data extraction",
        mitigation: "Validate database names and versions",
      },
      deleteDatabase: {
        description: "IndexedDB database deletion",
        risk: "HIGH",
        attackVector: "Data destruction",
        mitigation: "Restrict database deletion",
      },
      createObjectStore: {
        description: "Object store creation",
        risk: "MEDIUM",
        attackVector: "Data structure manipulation",
        mitigation: "Validate store configuration",
      },
    },
    cacheStorage: {
      open: {
        description: "Cache storage open",
        risk: "MEDIUM",
        attackVector: "Cache enumeration",
        mitigation: "Validate cache names",
      },
      delete: {
        description: "Cache deletion",
        risk: "MEDIUM",
        attackVector: "Cache destruction",
        mitigation: "Restrict cache deletion",
      },
      put: {
        description: "Cache entry creation",
        risk: "MEDIUM",
        attackVector: "Cache poisoning",
        mitigation: "Validate cached responses",
      },
    },
    lockedFile: {
      requestStorageAccess: {
        description: "Storage access request",
        risk: "MEDIUM",
        attackVector: "Cross-site storage access",
        mitigation: "Require user gesture",
      },
      hasStorageAccess: {
        description: "Storage access check",
        risk: "LOW",
        attackVector: "Storage capability detection",
        mitigation: "Use for legitimate checks",
      },
    },
    fileSystemAccess: {
      showOpenFilePicker: {
        description: "File open picker",
        risk: "HIGH",
        attackVector: "File system access",
        mitigation: "Require user gesture",
      },
      showSaveFilePicker: {
        description: "File save picker",
        risk: "HIGH",
        attackVector: "File system write access",
        mitigation: "Require user gesture",
      },
      showDirectoryPicker: {
        description: "Directory picker",
        risk: "HIGH",
        attackVector: "Directory access",
        mitigation: "Require user gesture",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - NETWORK APIS
  // ===========================================

  const networkSinks = {
    beacon: {
      sendBeacon: {
        description: "Beacon API for analytics",
        risk: "MEDIUM",
        attackVector: "Data exfiltration, tracking",
        mitigation: "Validate beacon data",
      },
    },
    networkInformation: {
      connection: {
        description: "Network information access",
        risk: "LOW",
        attackVector: "Network fingerprinting",
        mitigation: "Limit information exposure",
      },
    },
    broadcastChannel: {
      BroadcastChannel: {
        description: "Cross-context communication",
        risk: "MEDIUM",
        attackVector: "Cross-origin message injection",
        mitigation: "Validate channel messages",
      },
    },
    channelMessaging: {
      MessageChannel: {
        description: "Message channel creation",
        risk: "MEDIUM",
        attackVector: "Message interception",
        mitigation: "Validate channel usage",
      },
      MessagePort: {
        description: "Message port communication",
        risk: "MEDIUM",
        attackVector: "Port message injection",
        mitigation: "Validate port messages",
      },
    },
    serverSentEvents: {
      EventSource: {
        description: "Server-sent events connection",
        risk: "MEDIUM",
        attackVector: "Event stream injection",
        mitigation: "Validate event source URL",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - ANIMATION APIS
  // ===========================================

  const animationSinks = {
    webAnimations: {
      animate: {
        description: "Web Animations API",
        risk: "LOW",
        attackVector: "Animation-based attacks",
        mitigation: "Validate animation properties",
      },
      getAnimations: {
        description: "Animation enumeration",
        risk: "LOW",
        attackVector: "Animation state detection",
        mitigation: "Limit animation information",
      },
    },
    requestAnimationFrame: {
      requestAnimationFrame: {
        description: "Animation frame request",
        risk: "LOW",
        attackVector: "Timing-based attacks",
        mitigation: "Use for legitimate animations",
      },
      cancelAnimationFrame: {
        description: "Animation frame cancellation",
        risk: "LOW",
        attackVector: "Animation disruption",
        mitigation: "Use appropriately",
      },
    },
    intersectionObserver: {
      IntersectionObserver: {
        description: "Intersection observation",
        risk: "LOW",
        attackVector: "Visibility tracking",
        mitigation: "Use for legitimate purposes",
      },
    },
    resizeObserver: {
      ResizeObserver: {
        description: "Resize observation",
        risk: "LOW",
        attackVector: "Size tracking",
        mitigation: "Use for legitimate purposes",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - INTERNATIONALIZATION
  // ===========================================

  const intlSinks = {
    dateTimeFormat: {
      DateTimeFormat: {
        description: "Date-time formatting",
        risk: "LOW",
        attackVector: "Locale-based fingerprinting",
        mitigation: "Use standard locales",
      },
      format: {
        description: "Date-time format application",
        risk: "LOW",
        attackVector: "Format string injection",
        mitigation: "Validate format options",
      },
    },
    numberFormat: {
      NumberFormat: {
        description: "Number formatting",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      format: {
        description: "Number format application",
        risk: "LOW",
        attackVector: "Format manipulation",
        mitigation: "Validate format options",
      },
    },
    collator: {
      Collator: {
        description: "String collation",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      compare: {
        description: "String comparison",
        risk: "LOW",
        attackVector: "Comparison manipulation",
        mitigation: "Validate comparison options",
      },
    },
    pluralRules: {
      PluralRules: {
        description: "Pluralization rules",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      select: {
        description: "Plural form selection",
        risk: "LOW",
        attackVector: "Rule manipulation",
        mitigation: "Validate rule options",
      },
    },
    relativeTimeFormat: {
      RelativeTimeFormat: {
        description: "Relative time formatting",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      format: {
        description: "Relative time format",
        risk: "LOW",
        attackVector: "Format manipulation",
        mitigation: "Validate format options",
      },
    },
    listFormat: {
      ListFormat: {
        description: "List formatting",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      format: {
        description: "List format application",
        risk: "LOW",
        attackVector: "Format manipulation",
        mitigation: "Validate format options",
      },
    },
    displayNames: {
      DisplayNames: {
        description: "Display name formatting",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      of: {
        description: "Display name retrieval",
        risk: "LOW",
        attackVector: "Name extraction",
        mitigation: "Validate input types",
      },
    },
    segmenter: {
      Segmenter: {
        description: "Text segmentation",
        risk: "LOW",
        attackVector: "Locale fingerprinting",
        mitigation: "Use standard locales",
      },
      segment: {
        description: "Text segmentation application",
        risk: "LOW",
        attackVector: "Segment manipulation",
        mitigation: "Validate segment options",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - PERFORMANCE APIS
  // ===========================================

  const performanceSinks = {
    performance: {
      now: {
        description: "High-resolution timestamp",
        risk: "LOW",
        attackVector: "Timing attacks, fingerprinting",
        mitigation: "Limit precision if needed",
      },
      mark: {
        description: "Performance mark creation",
        risk: "LOW",
        attackVector: "Performance tracking",
        mitigation: "Use for legitimate profiling",
      },
      measure: {
        description: "Performance measurement",
        risk: "LOW",
        attackVector: "Timing analysis",
        mitigation: "Use for legitimate profiling",
      },
      getEntries: {
        description: "Performance entry retrieval",
        risk: "LOW",
        attackVector: "Performance data extraction",
        mitigation: "Limit entry exposure",
      },
      clearMarks: {
        description: "Performance mark clearing",
        risk: "LOW",
        attackVector: "Profile manipulation",
        mitigation: "Use appropriately",
      },
    },
    "performance.getEntriesByType('navigation')": {
      description: "Navigation timing access",
      risk: "LOW",
      attackVector: "Navigation fingerprinting",
      mitigation: "Limit timing precision",
    },
    "performance.getEntriesByType('resource')": {
      description: "Resource timing access",
      risk: "LOW",
      attackVector: "Resource enumeration",
      mitigation: "Limit timing precision",
    },
    "performance.getEntriesByType('mark')": {
      description: "User timing marks",
      risk: "LOW",
      attackVector: "Custom timing data",
      mitigation: "Validate mark names",
    },
    longTasks: {
      LongTaskObserver: {
        description: "Long task observation",
        risk: "LOW",
        attackVector: "Task timing analysis",
        mitigation: "Use for legitimate optimization",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - BATTERY & POWER
  // ===========================================

  const batteryPowerSinks = {
    battery: {
      getBattery: {
        description: "Battery status access",
        risk: "LOW",
        attackVector: "Battery fingerprinting",
        mitigation: "Limit battery information",
      },
      level: {
        description: "Battery level access",
        risk: "LOW",
        attackVector: "Battery tracking",
        mitigation: "Limit precision",
      },
      charging: {
        description: "Charging status access",
        risk: "LOW",
        attackVector: "Charging state tracking",
        mitigation: "Limit exposure",
      },
    },
    wakeLock: {
      request: {
        description: "Wake lock request",
        risk: "LOW",
        attackVector: "Power state manipulation",
        mitigation: "Require user gesture",
      },
      release: {
        description: "Wake lock release",
        risk: "LOW",
        attackVector: "Power state disruption",
        mitigation: "Use appropriately",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - VIBRATION & HAPTICS
  // ===========================================

  const vibrationHapticsSinks = {
    vibration: {
      vibrate: {
        description: "Device vibration trigger",
        risk: "LOW",
        attackVector: "Vibration abuse",
        mitigation: "Require user gesture",
      },
    },
    gamepad: {
      getGamepads: {
        description: "Gamepad access",
        risk: "LOW",
        attackVector: "Gamepad fingerprinting",
        mitigation: "Limit gamepad information",
      },
      vibrationActuator: {
        description: "Gamepad haptic access",
        risk: "LOW",
        attackVector: "Haptic manipulation",
        mitigation: "Validate actuator usage",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - SPEECH APIS
  // ===========================================

  const speechSinks = {
    speechRecognition: {
      SpeechRecognition: {
        description: "Speech recognition access",
        risk: "HIGH",
        attackVector: "Audio capture, speech eavesdropping",
        mitigation: "Require explicit user consent",
      },
      start: {
        description: "Speech recognition start",
        risk: "HIGH",
        attackVector: "Unauthorized audio capture",
        mitigation: "Require user gesture",
      },
      stop: {
        description: "Speech recognition stop",
        risk: "LOW",
        attackVector: "Recognition disruption",
        mitigation: "Use appropriately",
      },
    },
    speechSynthesis: {
      speechSynthesis: {
        description: "Speech synthesis access",
        risk: "LOW",
        attackVector: "Audio output manipulation",
        mitigation: "Validate synthesis content",
      },
      speak: {
        description: "Speech synthesis trigger",
        risk: "LOW",
        attackVector: "Audio spam",
        mitigation: "Limit synthesis usage",
      },
      getVoices: {
        description: "Voice enumeration",
        risk: "LOW",
        attackVector: "Voice fingerprinting",
        mitigation: "Limit voice information",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - PRESENTATION APIS
  // ===========================================

  const presentationSinks = {
    presentation: {
      request: {
        description: "Presentation request",
        risk: "MEDIUM",
        attackVector: "Display manipulation",
        mitigation: "Require user gesture",
      },
      defaultRequest: {
        description: "Default presentation request",
        risk: "MEDIUM",
        attackVector: "Automatic display connection",
        mitigation: "Validate presentation URLs",
      },
    },
    remotePlayback: {
      RemotePlayback: {
        description: "Remote playback access",
        risk: "MEDIUM",
        attackVector: "Remote display manipulation",
        mitigation: "Require user gesture",
      },
      prompt: {
        description: "Remote playback prompt",
        risk: "MEDIUM",
        attackVector: "Device selection manipulation",
        mitigation: "Validate prompt usage",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - DOCUMENT APIS
  // ===========================================

  const documentSinks = {
    document: {
      write: {
        description: "Document write",
        risk: "CRITICAL",
        attackVector: "Document stream injection",
        mitigation: "Use DOM manipulation instead",
      },
      writeln: {
        description: "Document write with newline",
        risk: "CRITICAL",
        attackVector: "Document stream injection",
        mitigation: "Use DOM manipulation instead",
      },
      open: {
        description: "Document open",
        risk: "HIGH",
        attackVector: "Document replacement",
        mitigation: "Use sparingly",
      },
      close: {
        description: "Document close",
        risk: "MEDIUM",
        attackVector: "Stream termination",
        mitigation: "Use appropriately",
      },
      execCommand: {
        description: "Document command execution",
        risk: "MEDIUM",
        attackVector: "Command injection",
        mitigation: "Validate command parameters",
      },
      queryCommandSupported: {
        description: "Command support check",
        risk: "LOW",
        attackVector: "Feature detection",
        mitigation: "Use for legitimate checks",
      },
    },
    range: {
      createContextualFragment: {
        description: "Contextual fragment creation",
        risk: "HIGH",
        attackVector: "HTML parsing with script execution",
        mitigation: "Sanitize HTML before parsing",
      },
      cloneContents: {
        description: "Range content cloning",
        risk: "LOW",
        attackVector: "Content extraction",
        mitigation: "Use for legitimate operations",
      },
      extractContents: {
        description: "Range content extraction",
        risk: "MEDIUM",
        attackVector: "DOM manipulation",
        mitigation: "Validate extraction target",
      },
      deleteContents: {
        description: "Range content deletion",
        risk: "MEDIUM",
        attackVector: "Content removal",
        mitigation: "Validate deletion target",
      },
      insertNode: {
        description: "Node insertion into range",
        risk: "MEDIUM",
        attackVector: "DOM injection",
        mitigation: "Sanitize inserted node",
      },
      surroundContents: {
        description: "Range content wrapping",
        risk: "MEDIUM",
        attackVector: "Element wrapping attacks",
        mitigation: "Validate wrapper element",
      },
    },
    selection: {
      getSelection: {
        description: "Selection access",
        risk: "LOW",
        attackVector: "Selected text extraction",
        mitigation: "Use for legitimate operations",
      },
      addRange: {
        description: "Range addition to selection",
        risk: "LOW",
        attackVector: "Selection manipulation",
        mitigation: "Validate range addition",
      },
      removeAllRanges: {
        description: "Selection clearing",
        risk: "LOW",
        attackVector: "Selection disruption",
        mitigation: "Use appropriately",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - WINDOW APIS
  // ===========================================

  const windowSinks = {
    window: {
      open: {
        description: "Window opening",
        risk: "HIGH",
        attackVector: "Popup injection, JavaScript protocol",
        mitigation: "Validate window features",
      },
      close: {
        description: "Window closing",
        risk: "MEDIUM",
        attackVector: "Window disruption",
        mitigation: "Use appropriately",
      },
      focus: {
        description: "Window focus",
        risk: "LOW",
        attackVector: "Focus stealing",
        mitigation: "Use appropriately",
      },
      blur: {
        description: "Window blur",
        risk: "LOW",
        attackVector: "Focus manipulation",
        mitigation: "Use appropriately",
      },
      moveTo: {
        description: "Window movement",
        risk: "LOW",
        attackVector: "Window positioning",
        mitigation: "Avoid window movement",
      },
      resizeTo: {
        description: "Window resizing",
        risk: "LOW",
        attackVector: "Window size manipulation",
        mitigation: "Avoid window resizing",
      },
      scroll: {
        description: "Window scrolling",
        risk: "LOW",
        attackVector: "Scroll manipulation",
        mitigation: "Use for legitimate scrolling",
      },
      print: {
        description: "Print dialog trigger",
        risk: "LOW",
        attackVector: "Print spam",
        mitigation: "Require user gesture",
      },
      prompt: {
        description: "Prompt dialog",
        risk: "LOW",
        attackVector: "User input collection",
        mitigation: "Use native forms instead",
      },
      confirm: {
        description: "Confirm dialog",
        risk: "LOW",
        attackVector: "User confirmation",
        mitigation: "Use native UI instead",
      },
      alert: {
        description: "Alert dialog",
        risk: "LOW",
        attackVector: "Alert spam",
        mitigation: "Use native UI instead",
      },
    },
    navigation: {
      location: {
        description: "Location object access",
        risk: "HIGH",
        attackVector: "URL manipulation, JavaScript protocol",
        mitigation: "Validate URL changes",
      },
      history: {
        description: "History object access",
        risk: "MEDIUM",
        attackVector: "History manipulation",
        mitigation: "Validate state changes",
      },
      navigate: {
        description: "Navigation API",
        risk: "HIGH",
        attackVector: "Page navigation",
        mitigation: "Validate navigation targets",
      },
    },
    timers: {
      setTimeout: {
        description: "Timeout scheduling",
        risk: "CRITICAL",
        attackVector: "String evaluation, delayed execution",
        mitigation: "Use function references, not strings",
      },
      setInterval: {
        description: "Interval scheduling",
        risk: "CRITICAL",
        attackVector: "String evaluation, repeated execution",
        mitigation: "Use function references, not strings",
      },
      requestAnimationFrame: {
        description: "Animation frame scheduling",
        risk: "LOW",
        attackVector: "Timing-based attacks",
        mitigation: "Use for legitimate animations",
      },
      requestIdleCallback: {
        description: "Idle callback scheduling",
        risk: "LOW",
        attackVector: "Idle time detection",
        mitigation: "Use for legitimate background tasks",
      },
    },
  };

  // ===========================================
  // 🔬 EXTENDED SINK CATALOG - EVENT HANDLERS
  // ===========================================

  const eventHandlerSinks = {
    mouse: {
      onclick: {
        description: "Click event handler",
        risk: "HIGH",
        attackVector: "Click handler injection",
        mitigation: "Use addEventListener instead",
      },
      ondblclick: {
        description: "Double-click event handler",
        risk: "MEDIUM",
        attackVector: "Double-click handler injection",
        mitigation: "Use addEventListener instead",
      },
      onmousedown: {
        description: "Mouse down event handler",
        risk: "MEDIUM",
        attackVector: "Mouse handler injection",
        mitigation: "Use addEventListener instead",
      },
      onmouseup: {
        description: "Mouse up event handler",
        risk: "MEDIUM",
        attackVector: "Mouse handler injection",
        mitigation: "Use addEventListener instead",
      },
      onmouseover: {
        description: "Mouse over event handler",
        risk: "MEDIUM",
        attackVector: "Hover handler injection",
        mitigation: "Use addEventListener instead",
      },
      onmouseout: {
        description: "Mouse out event handler",
        risk: "MEDIUM",
        attackVector: "Mouse handler injection",
        mitigation: "Use addEventListener instead",
      },
      onmousemove: {
        description: "Mouse move event handler",
        risk: "LOW",
        attackVector: "Movement tracking",
        mitigation: "Use addEventListener instead",
      },
      onwheel: {
        description: "Wheel event handler",
        risk: "LOW",
        attackVector: "Scroll tracking",
        mitigation: "Use addEventListener instead",
      },
      oncontextmenu: {
        description: "Context menu event handler",
        risk: "MEDIUM",
        attackVector: "Context menu manipulation",
        mitigation: "Use addEventListener instead",
      },
    },
    keyboard: {
      onkeydown: {
        description: "Key down event handler",
        risk: "HIGH",
        attackVector: "Key handler injection",
        mitigation: "Use addEventListener instead",
      },
      onkeyup: {
        description: "Key up event handler",
        risk: "HIGH",
        attackVector: "Key handler injection",
        mitigation: "Use addEventListener instead",
      },
      onkeypress: {
        description: "Key press event handler",
        risk: "HIGH",
        attackVector: "Key handler injection",
        mitigation: "Use addEventListener instead",
      },
    },
    form: {
      onsubmit: {
        description: "Form submit event handler",
        risk: "HIGH",
        attackVector: "Form submission hijacking",
        mitigation: "Use addEventListener instead",
      },
      onreset: {
        description: "Form reset event handler",
        risk: "MEDIUM",
        attackVector: "Form reset manipulation",
        mitigation: "Use addEventListener instead",
      },
      onchange: {
        description: "Change event handler",
        risk: "MEDIUM",
        attackVector: "Change handler injection",
        mitigation: "Use addEventListener instead",
      },
      oninput: {
        description: "Input event handler",
        risk: "MEDIUM",
        attackVector: "Input handler injection",
        mitigation: "Use addEventListener instead",
      },
      onfocus: {
        description: "Focus event handler",
        risk: "MEDIUM",
        attackVector: "Focus handler injection",
        mitigation: "Use addEventListener instead",
      },
      onblur: {
        description: "Blur event handler",
        risk: "MEDIUM",
        attackVector: "Blur handler injection",
        mitigation: "Use addEventListener instead",
      },
    },
    document: {
      onload: {
        description: "Load event handler",
        risk: "HIGH",
        attackVector: "Auto-execution on load",
        mitigation: "Use addEventListener instead",
      },
      onerror: {
        description: "Error event handler",
        risk: "HIGH",
        attackVector: "Error handler injection",
        mitigation: "Use addEventListener instead",
      },
      onabort: {
        description: "Abort event handler",
        risk: "MEDIUM",
        attackVector: "Abort handler injection",
        mitigation: "Use addEventListener instead",
      },
      onresize: {
        description: "Resize event handler",
        risk: "LOW",
        attackVector: "Resize tracking",
        mitigation: "Use addEventListener instead",
      },
      onscroll: {
        description: "Scroll event handler",
        risk: "LOW",
        attackVector: "Scroll tracking",
        mitigation: "Use addEventListener instead",
      },
    },
    drag: {
      ondrag: {
        description: "Drag event handler",
        risk: "MEDIUM",
        attackVector: "Drag handler injection",
        mitigation: "Use addEventListener instead",
      },
      ondragstart: {
        description: "Drag start event handler",
        risk: "MEDIUM",
        attackVector: "Drag start injection",
        mitigation: "Use addEventListener instead",
      },
      ondragend: {
        description: "Drag end event handler",
        risk: "LOW",
        attackVector: "Drag end injection",
        mitigation: "Use addEventListener instead",
      },
      ondragover: {
        description: "Drag over event handler",
        risk: "MEDIUM",
        attackVector: "Drag over injection",
        mitigation: "Use addEventListener instead",
      },
      ondragenter: {
        description: "Drag enter event handler",
        risk: "MEDIUM",
        attackVector: "Drag enter injection",
        mitigation: "Use addEventListener instead",
      },
      ondragleave: {
        description: "Drag leave event handler",
        risk: "LOW",
        attackVector: "Drag leave injection",
        mitigation: "Use addEventListener instead",
      },
      ondrop: {
        description: "Drop event handler",
        risk: "HIGH",
        attackVector: "Drop handler injection",
        mitigation: "Use addEventListener instead",
      },
    },
    clipboard: {
      oncopy: {
        description: "Copy event handler",
        risk: "MEDIUM",
        attackVector: "Copy handler injection",
        mitigation: "Use addEventListener instead",
      },
      oncut: {
        description: "Cut event handler",
        risk: "MEDIUM",
        attackVector: "Cut handler injection",
        mitigation: "Use addEventListener instead",
      },
      onpaste: {
        description: "Paste event handler",
        risk: "HIGH",
        attackVector: "Paste handler injection",
        mitigation: "Use addEventListener instead",
      },
    },
    touch: {
      ontouchstart: {
        description: "Touch start event handler",
        risk: "MEDIUM",
        attackVector: "Touch handler injection",
        mitigation: "Use addEventListener instead",
      },
      ontouchmove: {
        description: "Touch move event handler",
        risk: "MEDIUM",
        attackVector: "Touch handler injection",
        mitigation: "Use addEventListener instead",
      },
      ontouchend: {
        description: "Touch end event handler",
        risk: "MEDIUM",
        attackVector: "Touch handler injection",
        mitigation: "Use addEventListener instead",
      },
      ontouchcancel: {
        description: "Touch cancel event handler",
        risk: "LOW",
        attackVector: "Touch cancel injection",
        mitigation: "Use addEventListener instead",
      },
    },
    pointer: {
      onpointerdown: {
        description: "Pointer down event handler",
        risk: "MEDIUM",
        attackVector: "Pointer handler injection",
        mitigation: "Use addEventListener instead",
      },
      onpointerup: {
        description: "Pointer up event handler",
        risk: "MEDIUM",
        attackVector: "Pointer handler injection",
        mitigation: "Use addEventListener instead",
      },
      onpointermove: {
        description: "Pointer move event handler",
        risk: "LOW",
        attackVector: "Pointer tracking",
        mitigation: "Use addEventListener instead",
      },
      onpointerover: {
        description: "Pointer over event handler",
        risk: "MEDIUM",
        attackVector: "Pointer handler injection",
        mitigation: "Use addEventListener instead",
      },
      onpointerout: {
        description: "Pointer out event handler",
        risk: "MEDIUM",
        attackVector: "Pointer handler injection",
        mitigation: "Use addEventListener instead",
      },
    },
  };

  // ===========================================
  // 📊 COMPREHENSIVE SINK REGISTRY
  // ===========================================

  const comprehensiveSinkRegistry = {
    advancedSinks: advancedSinkCatalog,
    webComponentSinks: webComponentSinks,
    modernAPISinks: modernAPISinks,
    paymentIdentitySinks: paymentIdentitySinks,
    aiMLSinks: aiMLSinks,
    sensorSinks: sensorSinks,
    storageSinks: storageSinks,
    networkSinks: networkSinks,
    animationSinks: animationSinks,
    intlSinks: intlSinks,
    performanceSinks: performanceSinks,
    batteryPowerSinks: batteryPowerSinks,
    vibrationHapticsSinks: vibrationHapticsSinks,
    speechSinks: speechSinks,
    presentationSinks: presentationSinks,
    documentSinks: documentSinks,
    windowSinks: windowSinks,
    eventHandlerSinks: eventHandlerSinks,
  };

  // ===========================================
  // 🔍 ENHANCED SINK DETECTION ENGINE
  // ===========================================

  function enhancedDetectAllSinks(element) {
    const allDetectedSinks = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      summary: {
        totalDetected: 0,
        riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      },
    };

    Object.entries(comprehensiveSinkRegistry).forEach(([category, sinks]) => {
      Object.entries(sinks).forEach(([subCategory, items]) => {
        Object.entries(items).forEach(([sinkName, sinkInfo]) => {
          if (typeof sinkInfo === 'object' && sinkInfo.description) {
            const detected = checkSinkPresence(element, sinkName, category);
            if (detected) {
              const sinkEntry = {
                category,
                subCategory,
                sink: sinkName,
                ...sinkInfo,
                detected: true,
              };

              const riskLevel = sinkInfo.risk?.toLowerCase() || 'low';
              if (allDetectedSinks[riskLevel]) {
                allDetectedSinks[riskLevel].push(sinkEntry);
                allDetectedSinks.summary.riskDistribution[sinkInfo.risk]++;
                allDetectedSinks.summary.totalDetected++;
              }
            }
          }
        });
      });
    });

    return allDetectedSinks;
  }

  function checkSinkPresence(element, sinkName, category) {
    try {
      if (element[sinkName] !== undefined) return true;
      if (element.hasAttribute?.(sinkName)) return true;
      if (window[sinkName] !== undefined) return true;

      const parts = sinkName.split('.');
      if (parts.length > 1) {
        let obj = window;
        for (const part of parts) {
          if (obj === undefined) return false;
          obj = obj[part];
        }
        return obj !== undefined;
      }

      return false;
    } catch {
      return false;
    }
  }

  window.enhancedDetectAllSinks = enhancedDetectAllSinks;
  window.comprehensiveSinkRegistry = comprehensiveSinkRegistry;

  // ===========================================
  // 📊 DETAILED REPORTING ENGINE
  // ===========================================

  function generateDetailedSinkReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sinkAnalysis: enhancedDetectAllSinks(document.body),
      elementAnalysis: [],
      recommendations: [],
    };

    const interactiveElements = document.querySelectorAll(
      'input, textarea, select, button, form, a, [onclick], [onchange], [onsubmit], [role="button"]'
    );

    interactiveElements.forEach((el, index) => {
      const elementSinks = enhancedDetectAllSinks(el);
      if (elementSinks.summary.totalDetected > 0) {
        report.elementAnalysis.push({
          index,
          tag: el.tagName?.toLowerCase(),
          id: el.id,
          name: el.name,
          sinks: elementSinks,
        });
      }
    });

    generateDetailedRecommendations(report);

    return report;
  }

  function generateDetailedRecommendations(report) {
    const { sinkAnalysis } = report;

    if (sinkAnalysis.critical.length > 0) {
      report.recommendations.push({
        priority: "CRITICAL",
        category: "Critical Sinks",
        count: sinkAnalysis.critical.length,
        action: "Immediately review and sanitize all critical sink usage",
        sinks: sinkAnalysis.critical.map(s => s.sink),
      });
    }

    if (sinkAnalysis.high.length > 0) {
      report.recommendations.push({
        priority: "HIGH",
        category: "High-Risk Sinks",
        count: sinkAnalysis.high.length,
        action: "Implement input validation and output encoding",
        sinks: sinkAnalysis.high.map(s => s.sink),
      });
    }

    if (sinkAnalysis.critical.length > 0 || sinkAnalysis.high.length > 0) {
      report.recommendations.push({
        priority: "HIGH",
        category: "Content Security Policy",
        action: "Implement strict CSP to mitigate sink exploitation",
        policy: "default-src 'self'; script-src 'self'; object-src 'none'",
      });
    }

    const eventHandlers = sinkAnalysis.medium.filter(s =>
      s.subCategory === 'mouse' || s.subCategory === 'keyboard' ||
      s.subCategory === 'form' || s.subCategory === 'clipboard'
    );
    if (eventHandlers.length > 0) {
      report.recommendations.push({
        priority: "MEDIUM",
        category: "Event Handlers",
        count: eventHandlers.length,
        action: "Replace inline event handlers with addEventListener",
      });
    }

    const storageSinks = sinkAnalysis.medium.filter(s =>
      s.category === 'storageSinks'
    );
    if (storageSinks.length > 0) {
      report.recommendations.push({
        priority: "MEDIUM",
        category: "Storage Security",
        action: "Sanitize data before storage and validate on retrieval",
      });
    }

    return report.recommendations;
  }

  window.generateDetailedSinkReport = generateDetailedSinkReport;

  // ===========================================
  // 📋 EXPORT DETAILED REPORT
  // ===========================================

  function exportDetailedReport(format = "json") {
    const report = generateDetailedSinkReport();

    if (format === "json") {
      const jsonString = JSON.stringify(report, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detailed-sink-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("%c✅ Detailed sink report exported as JSON!", "color: #00ced1; font-weight: bold;");
    } else if (format === "csv") {
      const csvData = convertSinksToCSV(report);
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detailed-sink-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("%c✅ Detailed sink report exported as CSV!", "color: #00ced1; font-weight: bold;");
    }

    return report;
  }

  function convertSinksToCSV(report) {
    const headers = [
      "Category",
      "SubCategory",
      "Sink",
      "Risk",
      "Description",
      "AttackVector",
      "Mitigation",
    ];

    const rows = [];

    ['critical', 'high', 'medium', 'low'].forEach(riskLevel => {
      report.sinkAnalysis[riskLevel].forEach(sink => {
        rows.push([
          sink.category,
          sink.subCategory,
          sink.sink,
          sink.risk,
          `"${sink.description}"`,
          `"${sink.attackVector}"`,
          `"${sink.mitigation}"`,
        ]);
      });
    });

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  window.exportDetailedReport = exportDetailedReport;

  // ===========================================
  // 🎯 VISUALIZATION ENGINE
  // ===========================================

  function visualizeSinks() {
    const report = generateDetailedSinkReport();
    const vizContainer = document.createElement("div");
    vizContainer.id = "sink-visualization";
    vizContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 80vh;
      overflow: auto;
      background: white;
      border: 3px solid #00ced1;
      border-radius: 10px;
      padding: 20px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;

    let html = `
      <h2 style="color: #00ced1; margin-top: 0;">🎯 Sink Visualization</h2>
      <button onclick="document.getElementById('sink-visualization').remove()"
        style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
        ✕
      </button>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #34495e;">Risk Distribution</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div style="background: #e74c3c; color: white; padding: 10px 20px; border-radius: 5px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${report.sinkAnalysis.summary.riskDistribution.CRITICAL}</div>
            <div style="font-size: 12px;">CRITICAL</div>
          </div>
          <div style="background: #f39c12; color: white; padding: 10px 20px; border-radius: 5px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${report.sinkAnalysis.summary.riskDistribution.HIGH}</div>
            <div style="font-size: 12px;">HIGH</div>
          </div>
          <div style="background: #3498db; color: white; padding: 10px 20px; border-radius: 5px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${report.sinkAnalysis.summary.riskDistribution.MEDIUM}</div>
            <div style="font-size: 12px;">MEDIUM</div>
          </div>
          <div style="background: #27ae60; color: white; padding: 10px 20px; border-radius: 5px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${report.sinkAnalysis.summary.riskDistribution.LOW}</div>
            <div style="font-size: 12px;">LOW</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #34495e;">Total Sinks: ${report.sinkAnalysis.summary.totalDetected}</h3>
      </div>
    `;

    if (report.sinkAnalysis.critical.length > 0) {
      html += `
        <div style="margin-bottom: 15px;">
          <h4 style="color: #e74c3c;">⚠️ Critical Sinks (${report.sinkAnalysis.critical.length})</h4>
          <ul style="list-style: none; padding: 0;">
            ${report.sinkAnalysis.critical.map(sink => `
              <li style="padding: 8px; margin: 5px 0; background: #ffebee; border-left: 3px solid #e74c3c; border-radius: 3px;">
                <strong>${sink.sink}</strong><br>
                <small style="color: #666;">${sink.description}</small>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    if (report.sinkAnalysis.high.length > 0) {
      html += `
        <div style="margin-bottom: 15px;">
          <h4 style="color: #f39c12;">⚠️ High-Risk Sinks (${report.sinkAnalysis.high.length})</h4>
          <ul style="list-style: none; padding: 0;">
            ${report.sinkAnalysis.high.map(sink => `
              <li style="padding: 8px; margin: 5px 0; background: #fff3e0; border-left: 3px solid #f39c12; border-radius: 3px;">
                <strong>${sink.sink}</strong><br>
                <small style="color: #666;">${sink.description}</small>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    if (report.recommendations.length > 0) {
      html += `
        <div>
          <h4 style="color: #00ced1;">📋 Recommendations</h4>
          <ul style="list-style: none; padding: 0;">
            ${report.recommendations.map(rec => `
              <li style="padding: 8px; margin: 5px 0; background: #e0f7fa; border-left: 3px solid #00ced1; border-radius: 3px;">
                <strong>[${rec.priority}]</strong> ${rec.action}
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    vizContainer.innerHTML = html;
    document.body.appendChild(vizContainer);
    console.log("%c✅ Sink visualization displayed!", "color: #00ced1; font-weight: bold;");
  }

  window.visualizeSinks = visualizeSinks;

  // ===========================================
  // 🎯 INTERACTIVE SINK EXPLORER
  // ===========================================

  function exploreSink(sinkName) {
    const registry = comprehensiveSinkRegistry;
    let foundSink = null;
    let category = "";
    let subCategory = "";

    for (const [cat, sinks] of Object.entries(registry)) {
      for (const [subCat, items] of Object.entries(sinks)) {
        if (items[sinkName]) {
          foundSink = items[sinkName];
          category = cat;
          subCategory = subCat;
          break;
        }
      }
      if (foundSink) break;
    }

    if (foundSink) {
      console.log(`%c🔍 Sink Information: ${sinkName}`, "font-size: 16px; font-weight: bold; color: #00ced1;");
      console.log(`%cCategory: ${category}`, "color: #3498db; font-weight: bold;");
      console.log(`%cSubCategory: ${subCategory}`, "color: #3498db; font-weight: bold;");
      console.log(`%cRisk: ${foundSink.risk}`, `color: ${
        foundSink.risk === 'CRITICAL' ? '#e74c3c' :
        foundSink.risk === 'HIGH' ? '#f39c12' :
        foundSink.risk === 'MEDIUM' ? '#3498db' : '#27ae60'
      }; font-weight: bold;`);
      console.log(`%cDescription: ${foundSink.description}`, "color: #2c3e50;");
      console.log(`%cAttack Vector: ${foundSink.attackVector}`, "color: #e74c3c;");
      console.log(`%cMitigation: ${foundSink.mitigation}`, "color: #27ae60;");

      if (foundSink.examples) {
        console.log("%cExamples:", "color: #f39c12; font-weight: bold;");
        foundSink.examples.forEach(ex => console.log(`  - ${ex}`));
      }

      return foundSink;
    } else {
      console.log(`%c❌ Sink not found: ${sinkName}`, "color: #e74c3c; font-weight: bold;");
      console.log("%c💡 Try: exploreSink('innerHTML') or exploreSink('eval')", "color: #7f8c8d;");
      return null;
    }
  }

  window.exploreSink = exploreSink;

  // ===========================================
  // 📊 SINK STATISTICS
  // ===========================================

  function getSinkStatistics() {
    const registry = comprehensiveSinkRegistry;
    const stats = {
      totalCategories: 0,
      totalSubCategories: 0,
      totalSinks: 0,
      riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      categories: {},
    };

    Object.entries(registry).forEach(([category, sinks]) => {
      stats.totalCategories++;
      stats.categories[category] = {
        subCategories: 0,
        sinks: 0,
        riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      };

      Object.entries(sinks).forEach(([subCategory, items]) => {
        stats.totalSubCategories++;
        stats.categories[category].subCategories++;

        Object.entries(items).forEach(([sinkName, sinkInfo]) => {
          if (typeof sinkInfo === 'object' && sinkInfo.risk) {
            stats.totalSinks++;
            stats.categories[category].sinks++;
            const risk = sinkInfo.risk;
            stats.riskDistribution[risk]++;
            stats.categories[category].riskDistribution[risk]++;
          }
        });
      });
    });

    console.log("%c📊 Sink Registry Statistics", "font-size: 16px; font-weight: bold; color: #00ced1;");
    console.log(`Total Categories: ${stats.totalCategories}`);
    console.log(`Total SubCategories: ${stats.totalSubCategories}`);
    console.log(`Total Sinks: ${stats.totalSinks}`);
    console.log("%cRisk Distribution:", "font-weight: bold;");
    console.table(stats.riskDistribution);

    return stats;
  }

  window.getSinkStatistics = getSinkStatistics;

  console.log("\n%c📚 ADDITIONAL COMMANDS AVAILABLE:", "color: #f39c12; font-weight: bold;");
  console.log("%c  enhancedDetectAllSinks(element)      %c- Detect all sinks on element", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  generateDetailedSinkReport()         %c- Generate detailed report", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  exportDetailedReport('json')         %c- Export as JSON", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  exportDetailedReport('csv')          %c- Export as CSV", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  visualizeSinks()                     %c- Show visual sink map", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  exploreSink('sinkName')              %c- Get sink details", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  getSinkStatistics()                  %c- View registry stats", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");

  // ===========================================
  // 📖 COMPREHENSIVE SINK DOCUMENTATION
  // ===========================================

  const sinkDocumentation = {
    innerHTML: {
      name: "innerHTML",
      category: "DOM Manipulation",
      risk: "CRITICAL",
      description: "Sets or returns the HTML content of an element",
      attackVectors: [
        "Direct XSS through unsanitized user input",
        "HTML injection attacks",
        "Script tag injection",
        "Event handler injection",
      ],
      examples: {
        vulnerable: "element.innerHTML = userInput;",
        safe: "element.textContent = userInput;",
        sanitized: "element.innerHTML = DOMPurify.sanitize(userInput);",
      },
      mitigations: [
        "Use textContent instead when possible",
        "Sanitize with DOMPurify before setting",
        "Implement strict CSP",
        "Validate and encode all user input",
      ],
      relatedSinks: ["outerHTML", "insertAdjacentHTML", "document.write"],
      csp: "Requires script-src 'unsafe-inline' to exploit",
      frameworks: {
        React: "Use dangerouslySetInnerHTML with caution",
        Angular: "Use [innerHTML] binding with DomSanitizer",
        Vue: "Use v-html directive with sanitized content",
      },
    },
    eval: {
      name: "eval",
      category: "Code Execution",
      risk: "CRITICAL",
      description: "Evaluates JavaScript code from a string",
      attackVectors: [
        "Direct code execution",
        "Arbitrary JavaScript injection",
        "Variable access and manipulation",
        "Function call injection",
      ],
      examples: {
        vulnerable: "eval(userInput);",
        safe: "JSON.parse(userInput); // for JSON data",
        alternative: "Function('" + userInput + "')(); // Also dangerous!",
      },
      mitigations: [
        "Never use eval with user input",
        "Use JSON.parse for JSON data",
        "Use Function constructor with static code",
        "Implement strict CSP without unsafe-eval",
      ],
      relatedSinks: ["Function", "setTimeout", "setInterval"],
      csp: "Blocked by script-src without 'unsafe-eval'",
    },
    setTimeout: {
      name: "setTimeout",
      category: "Delayed Execution",
      risk: "CRITICAL",
      description: "Executes code after a delay (string form is dangerous)",
      attackVectors: [
        "String-based code execution",
        "Delayed payload execution",
        "Evasion of security controls",
      ],
      examples: {
        vulnerable: "setTimeout(userInput, 1000);",
        safe: "setTimeout(() => { /* static code */ }, 1000);",
      },
      mitigations: [
        "Use function references instead of strings",
        "Implement strict CSP",
        "Validate timeout values",
      ],
      relatedSinks: ["setInterval", "eval", "Function"],
      csp: "Blocked by script-src without 'unsafe-eval'",
    },
    "document.write": {
      name: "document.write",
      category: "Document Manipulation",
      risk: "CRITICAL",
      description: "Writes HTML content to the document stream",
      attackVectors: [
        "Document replacement",
        "Script injection",
        "HTML injection",
        "Page content manipulation",
      ],
      examples: {
        vulnerable: "document.write(userInput);",
        safe: "element.textContent = userInput;",
      },
      mitigations: [
        "Avoid document.write entirely",
        "Use DOM manipulation methods",
        "Implement strict CSP",
      ],
      relatedSinks: ["document.writeln", "innerHTML"],
      csp: "Blocked by strict CSP",
    },
    "location.href": {
      name: "location.href",
      category: "Navigation",
      risk: "HIGH",
      description: "Sets or returns the current URL",
      attackVectors: [
        "JavaScript protocol injection",
        "Open redirect attacks",
        "Phishing via URL manipulation",
      ],
      examples: {
        vulnerable: "location.href = userInput;",
        safe: "if (isValidURL(userInput)) { location.href = userInput; }",
      },
      mitigations: [
        "Validate URLs before navigation",
        "Use allowlists for redirect targets",
        "Block javascript: protocol",
      ],
      relatedSinks: ["location.assign", "location.replace", "window.open"],
    },
    postMessage: {
      name: "postMessage",
      category: "Cross-Origin Communication",
      risk: "HIGH",
      description: "Enables cross-origin communication between windows",
      attackVectors: [
        "Cross-origin message injection",
        "Data exfiltration",
        "XSS via message handlers",
      ],
      examples: {
        vulnerable: "window.addEventListener('message', (e) => { eval(e.data); });",
        safe: "window.addEventListener('message', (e) => { if (e.origin === 'trusted.com') { /* process */ } });",
      },
      mitigations: [
        "Always validate event.origin",
        "Validate message data",
        "Use specific target origins",
      ],
      relatedSinks: ["eval", "innerHTML"],
    },
    "localStorage": {
      name: "localStorage",
      category: "Storage",
      risk: "MEDIUM",
      description: "Provides persistent key-value storage",
      attackVectors: [
        "Stored XSS via localStorage",
        "Sensitive data storage",
        "Persistence of malicious data",
      ],
      examples: {
        vulnerable: "localStorage.setItem('data', userInput); document.write(localStorage.getItem('data'));",
        safe: "localStorage.setItem('data', sanitize(userInput));",
      },
      mitigations: [
        "Sanitize data before storage",
        "Encode data on retrieval",
        "Don't store sensitive data",
      ],
      relatedSinks: ["sessionStorage", "innerHTML"],
    },
  };

  // ===========================================
  // 📖 SINK LOOKUP FUNCTION
  // ===========================================

  function lookupSink(sinkName) {
    const doc = sinkDocumentation[sinkName];
    if (!doc) {
      console.log(`%c❌ Sink documentation not found: ${sinkName}`, "color: #e74c3c; font-weight: bold;");
      console.log("%c💡 Available sinks:", "color: #7f8c8d;");
      console.log(Object.keys(sinkDocumentation).join(", "));
      return null;
    }

    console.log(`%c📖 Sink Documentation: ${doc.name}`, "font-size: 16px; font-weight: bold; color: #00ced1;");
    console.log(`%cCategory: ${doc.category}`, "color: #3498db; font-weight: bold;");
    console.log(`%cRisk: ${doc.risk}`, `color: ${
      doc.risk === 'CRITICAL' ? '#e74c3c' :
      doc.risk === 'HIGH' ? '#f39c12' :
      doc.risk === 'MEDIUM' ? '#3498db' : '#27ae60'
    }; font-weight: bold;`);
    console.log(`%cDescription: ${doc.description}`, "color: #2c3e50;");

    console.log("\n%c⚔️ Attack Vectors:", "color: #e74c3c; font-weight: bold;");
    doc.attackVectors.forEach(v => console.log(`  - ${v}`));

    console.log("\n%c💻 Examples:", "color: #f39c12; font-weight: bold;");
    Object.entries(doc.examples).forEach(([type, code]) => {
      console.log(`  %c${type}:%c ${code}`, "font-weight: bold;", "color: #27ae60;");
    });

    console.log("\n%c🛡️ Mitigations:", "color: #27ae60; font-weight: bold;");
    doc.mitigations.forEach(m => console.log(`  - ${m}`));

    console.log("\n%c🔗 Related Sinks:", "color: #9b59b6; font-weight: bold;");
    doc.relatedSinks.forEach(s => console.log(`  - ${s}`));

    if (doc.csp) {
      console.log(`%c🔒 CSP: ${doc.csp}`, "color: #34495e; font-weight: bold;");
    }

    if (doc.frameworks) {
      console.log("\n%c🏗️ Framework Notes:", "color: #e67e22; font-weight: bold;");
      Object.entries(doc.frameworks).forEach(([fw, note]) => {
        console.log(`  ${fw}: ${note}`);
      });
    }

    return doc;
  }

  window.lookupSink = lookupSink;

  // ===========================================
  // 📊 RISK ASSESSMENT MATRIX
  // ===========================================

  function generateRiskMatrix() {
    const matrix = {
      CRITICAL: {
        sinks: [],
        impact: "Immediate exploitation possible",
        urgency: "Fix immediately",
        color: "#e74c3c",
      },
      HIGH: {
        sinks: [],
        impact: "Exploitation likely with user interaction",
        urgency: "Fix within 24 hours",
        color: "#f39c12",
      },
      MEDIUM: {
        sinks: [],
        impact: "Exploitation possible under specific conditions",
        urgency: "Fix within 1 week",
        color: "#3498db",
      },
      LOW: {
        sinks: [],
        impact: "Limited exploitation potential",
        urgency: "Fix in next release",
        color: "#27ae60",
      },
    };

    Object.entries(sinkDocumentation).forEach(([name, doc]) => {
      const riskLevel = doc.risk;
      if (matrix[riskLevel]) {
        matrix[riskLevel].sinks.push(name);
      }
    });

    console.log("%c📊 RISK ASSESSMENT MATRIX", "font-size: 18px; font-weight: bold; color: #00ced1;");
    console.log("");

    Object.entries(matrix).forEach(([level, data]) => {
      console.log(`%c${level} RISK (${data.sinks.length} sinks)`, `color: ${data.color}; font-weight: bold; font-size: 14px;`);
      console.log(`  Impact: ${data.impact}`);
      console.log(`  Urgency: ${data.urgency}`);
      console.log(`  Sinks: ${data.sinks.join(", ")}`);
      console.log("");
    });

    return matrix;
  }

  window.generateRiskMatrix = generateRiskMatrix;

  // ===========================================
  // 📋 SECURITY CHECKLIST
  // ===========================================

  function generateSecurityChecklist() {
    const checklist = {
      "Input Validation": [
        "All user input is validated server-side",
        "Input length limits are enforced",
        "Input type validation is implemented",
        "Allowlists are used instead of blocklists",
      ],
      "Output Encoding": [
        "HTML entities are encoded for HTML context",
        "JavaScript escaping is used for JS context",
        "URL encoding is used for URL context",
        "CSS encoding is used for CSS context",
      ],
      "DOM Manipulation": [
        "textContent is used instead of innerHTML",
        "createElement is used for dynamic elements",
        "setAttribute validates attribute names",
        "Event listeners use addEventListener",
      ],
      "CSP Implementation": [
        "Content-Security-Policy header is set",
        "unsafe-inline is not used",
        "unsafe-eval is not used",
        "default-src is restrictive",
        "script-src limits trusted sources",
      ],
      "Cross-Origin Security": [
        "postMessage validates origin",
        "CORS headers are properly configured",
        "iframe sandbox is used when needed",
        "window.open validates URLs",
      ],
      "Storage Security": [
        "Sensitive data is not stored client-side",
        "localStorage data is sanitized",
        "Cookies have HttpOnly and Secure flags",
        "sessionStorage is used for temporary data",
      ],
      "Event Handlers": [
        "Inline event handlers are avoided",
        "addEventListener is used instead",
        "Event data is validated",
        "Dynamic handler registration is controlled",
      ],
      "Third-Party Libraries": [
        "Libraries are from trusted sources",
        "Library versions are pinned",
        "Known vulnerabilities are patched",
        "Subresource Integrity (SRI) is used",
      ],
    };

    console.log("%c📋 SECURITY CHECKLIST", "font-size: 18px; font-weight: bold; color: #00ced1;");
    console.log("");

    Object.entries(checklist).forEach(([category, items]) => {
      console.log(`%c${category}`, "color: #3498db; font-weight: bold; font-size: 14px;");
      items.forEach((item, index) => {
        console.log(`  [ ] ${item}`);
      });
      console.log("");
    });

    return checklist;
  }

  window.generateSecurityChecklist = generateSecurityChecklist;

  // ===========================================
  // 📚 COMMON XSS PATTERNS
  // ===========================================

  const commonXSSPatterns = {
    basicScript: {
      pattern: "<script>alert('XSS')</script>",
      description: "Basic script injection",
      mitigation: "Encode < and > characters",
    },
    imgOnError: {
      pattern: "<img src=x onerror=alert('XSS')>",
      description: "Image error handler injection",
      mitigation: "Validate image sources and handlers",
    },
    svgOnload: {
      pattern: "<svg onload=alert('XSS')>",
      description: "SVG load event injection",
      mitigation: "Sanitize SVG elements",
    },
    iframeSrc: {
      pattern: "<iframe src='javascript:alert(1)'>",
      description: "Iframe JavaScript protocol",
      mitigation: "Validate iframe sources",
    },
    anchorHref: {
      pattern: "<a href='javascript:alert(1)'>",
      description: "Anchor JavaScript protocol",
      mitigation: "Validate href attributes",
    },
    divInnerHTML: {
      pattern: "element.innerHTML = userInput",
      description: "Direct innerHTML assignment",
      mitigation: "Use textContent or sanitize",
    },
    evalInjection: {
      pattern: "eval('(' + userInput + ')')",
      description: "Eval-based injection",
      mitigation: "Never use eval with user input",
    },
    domClobbering: {
      pattern: "<a id='someId'>",
      description: "DOM clobbering via element IDs",
      mitigation: "Avoid relying on global element access",
    },
    templateInjection: {
      pattern: "{{constructor.constructor('return this')()}}",
      description: "Template injection (Angular)",
      mitigation: "Use Angular sandbox properly",
    },
    postMessageXSS: {
      pattern: "window.addEventListener('message', ...)",
      description: "PostMessage-based XSS",
      mitigation: "Validate message origin",
    },
  };

  function testXSSPatterns(element) {
    const results = [];
    const elementHTML = element.innerHTML || "";
    const elementText = element.textContent || "";

    Object.entries(commonXSSPatterns).forEach(([name, info]) => {
      if (elementHTML.includes(info.pattern) || elementText.includes(info.pattern)) {
        results.push({
          pattern: name,
          description: info.description,
          found: true,
          mitigation: info.mitigation,
        });
      }
    });

    if (results.length > 0) {
      console.log("%c⚠️ XSS Patterns Detected:", "color: #e74c3c; font-weight: bold;");
      results.forEach(r => {
        console.log(`  - ${r.pattern}: ${r.description}`);
        console.log(`    Mitigation: ${r.mitigation}`);
      });
    } else {
      console.log("%c✅ No common XSS patterns detected in element", "color: #27ae60;");
    }

    return results;
  }

  window.testXSSPatterns = testXSSPatterns;
  window.commonXSSPatterns = commonXSSPatterns;

  // ===========================================
  // 🔍 ELEMENT SECURITY ANALYZER
  // ===========================================

  function analyzeElementSecurity(element) {
    const analysis = {
      element: {
        tag: element.tagName?.toLowerCase(),
        id: element.id,
        class: element.className,
        attributes: {},
      },
      risks: [],
      recommendations: [],
      score: 100,
    };

    Array.from(element.attributes || []).forEach(attr => {
      analysis.element.attributes[attr.name] = attr.value;

      if (attr.name.toLowerCase().startsWith("on")) {
        analysis.risks.push({
          type: "EVENT_HANDLER",
          attribute: attr.name,
          value: attr.value,
          severity: "HIGH",
        });
        analysis.score -= 20;
        analysis.recommendations.push(`Remove inline event handler: ${attr.name}`);
      }

      if (attr.name === "style" && attr.value.includes("expression")) {
        analysis.risks.push({
          type: "CSS_EXPRESSION",
          attribute: "style",
          value: attr.value,
          severity: "HIGH",
        });
        analysis.score -= 20;
        analysis.recommendations.push("Remove CSS expression from style attribute");
      }

      if (attr.name === "src" && attr.value.toLowerCase().startsWith("javascript:")) {
        analysis.risks.push({
          type: "JAVASCRIPT_PROTOCOL",
          attribute: "src",
          value: attr.value,
          severity: "CRITICAL",
        });
        analysis.score -= 30;
        analysis.recommendations.push("Remove javascript: protocol from src");
      }

      if (attr.name === "href" && attr.value.toLowerCase().startsWith("javascript:")) {
        analysis.risks.push({
          type: "JAVASCRIPT_PROTOCOL",
          attribute: "href",
          value: attr.value,
          severity: "CRITICAL",
        });
        analysis.score -= 30;
        analysis.recommendations.push("Remove javascript: protocol from href");
      }
    });

    const dangerousTags = ["script", "iframe", "object", "embed", "applet", "form"];
    const tag = element.tagName?.toLowerCase();
    if (dangerousTags.includes(tag)) {
      analysis.risks.push({
        type: "DANGEROUS_TAG",
        tag: tag,
        severity: "HIGH",
      });
      analysis.score -= 25;
      analysis.recommendations.push(`Review usage of <${tag}> tag`);
    }

    analysis.score = Math.max(0, analysis.score);

    console.log(`%c🔍 Element Security Analysis: ${tag}#${element.id || ""}`, "font-size: 14px; font-weight: bold; color: #00ced1;");
    console.log(`%cSecurity Score: ${analysis.score}/100`, `color: ${
      analysis.score >= 80 ? '#27ae60' :
      analysis.score >= 50 ? '#f39c12' : '#e74c3c'
    }; font-weight: bold;`);

    if (analysis.risks.length > 0) {
      console.log("\n%c⚠️ Risks Found:", "color: #e74c3c; font-weight: bold;");
      analysis.risks.forEach(risk => {
        console.log(`  [${risk.severity}] ${risk.type}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log("\n%c🛡️ Recommendations:", "color: #27ae60; font-weight: bold;");
      analysis.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    return analysis;
  }

  window.analyzeElementSecurity = analyzeElementSecurity;

  // ===========================================
  // 📊 PAGE SECURITY SUMMARY
  // ===========================================

  function getPageSecuritySummary() {
    const summary = {
      totalElements: 0,
      elementsAnalyzed: 0,
      averageScore: 0,
      totalRisks: 0,
      riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      topIssues: [],
    };

    const allElements = document.querySelectorAll("*");
    summary.totalElements = allElements.length;

    let totalScore = 0;

    allElements.forEach(el => {
      const analysis = analyzeElementSecurity(el);
      summary.elementsAnalyzed++;
      totalScore += analysis.score;

      analysis.risks.forEach(risk => {
        summary.totalRisks++;
        if (risk.severity === "CRITICAL") summary.riskDistribution.CRITICAL++;
        else if (risk.severity === "HIGH") summary.riskDistribution.HIGH++;
        else if (risk.severity === "MEDIUM") summary.riskDistribution.MEDIUM++;
        else summary.riskDistribution.LOW++;

        summary.topIssues.push({
          element: `${analysis.element.tag}#${analysis.element.id || ""}`,
          risk: risk.type,
          severity: risk.severity,
        });
      });
    });

    summary.averageScore = summary.elementsAnalyzed > 0 ?
      Math.round(totalScore / summary.elementsAnalyzed) : 0;

    console.log("%c📊 PAGE SECURITY SUMMARY", "font-size: 18px; font-weight: bold; color: #00ced1;");
    console.log(`Total Elements: ${summary.totalElements}`);
    console.log(`Elements Analyzed: ${summary.elementsAnalyzed}`);
    console.log(`Average Security Score: ${summary.averageScore}/100`);
    console.log(`Total Risks Found: ${summary.totalRisks}`);
    console.log("\nRisk Distribution:");
    console.table(summary.riskDistribution);

    if (summary.topIssues.length > 0) {
      console.log("\nTop Issues (first 20):");
      console.table(summary.topIssues.slice(0, 20));
    }

    return summary;
  }

  window.getPageSecuritySummary = getPageSecuritySummary;

  // ===========================================
  // 🎯 QUICK SECURITY SCAN
  // ===========================================

  function quickSecurityScan() {
    console.log("%c🔍 Starting Quick Security Scan...", "font-size: 16px; font-weight: bold; color: #00ced1;");
    console.time("Scan completed in");

    const results = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      csp: analyzeCSP(),
      sourceToSink: analyzeSourceToSink(),
      pageSummary: getPageSecuritySummary(),
      recommendations: [],
    };

    if (results.csp.riskLevel === "CRITICAL" || results.csp.riskLevel === "HIGH") {
      results.recommendations.push("Implement or strengthen Content-Security-Policy");
    }

    if (results.sourceToSink.riskLevel === "CRITICAL" || results.sourceToSink.riskLevel === "HIGH") {
      results.recommendations.push("Review and secure source-to-sink data flows");
    }

    if (results.pageSummary.averageScore < 70) {
      results.recommendations.push("Improve overall element security practices");
    }

    if (results.pageSummary.riskDistribution.CRITICAL > 0) {
      results.recommendations.push(`Address ${results.pageSummary.riskDistribution.CRITICAL} critical security issues immediately`);
    }

    console.log("\n%c✅ Scan Complete!", "color: #27ae60; font-weight: bold; font-size: 16px;");
    console.log("%c📋 Recommendations:", "color: #f39c12; font-weight: bold;");
    results.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));

    console.timeEnd("Scan completed in");

    window.lastScanResults = results;

    return results;
  }

  window.quickSecurityScan = quickSecurityScan;

  // ===========================================
  // 📚 BUG BOUNTY METHODOLOGY
  // ===========================================

  const bugBountyMethodology = {
    phase1_Reconnaissance: {
      name: "Phase 1: Reconnaissance",
      steps: [
        "Identify all input vectors (forms, URL parameters, headers)",
        "Map all interactive elements on the page",
        "Identify third-party scripts and libraries",
        "Check for CSP and other security headers",
        "Document all data entry and exit points",
      ],
      tools: [
        "autoScan() - Automated element scanning",
        "analyzeCSP() - CSP analysis",
        "getPageSecuritySummary() - Page overview",
      ],
    },
    phase2_Analysis: {
      name: "Phase 2: Analysis",
      steps: [
        "Identify reflection points for user input",
        "Map source-to-sink data flows",
        "Check for DOM-based vulnerabilities",
        "Analyze event handlers and listeners",
        "Review third-party code for vulnerabilities",
      ],
      tools: [
        "analyzeSourceToSink() - Flow analysis",
        "detectGadgetChains(element) - Chain detection",
        "testXSSPatterns(element) - Pattern testing",
      ],
    },
    phase3_Exploitation: {
      name: "Phase 3: Proof of Concept",
      steps: [
        "Craft targeted payloads for identified sinks",
        "Test reflection with safe payloads",
        "Verify vulnerability without causing harm",
        "Document reproduction steps",
        "Capture evidence (screenshots, logs)",
      ],
      warnings: [
        "Always use safe test payloads (alert, console.log)",
        "Never exfiltrate data or cause damage",
        "Respect scope and rules of engagement",
        "Report responsibly",
      ],
    },
    phase4_Reporting: {
      name: "Phase 4: Reporting",
      steps: [
        "Document vulnerability details",
        "Include impact assessment",
        "Provide reproduction steps",
        "Suggest remediation",
        "Include proof of concept code",
      ],
      tools: [
        "exportComprehensiveReport() - Generate reports",
        "exportDetailedReport() - Detailed export",
      ],
    },
  };

  function displayMethodology() {
    console.log("%c📚 BUG BOUNTY METHODOLOGY", "font-size: 18px; font-weight: bold; color: #00ced1;");

    Object.entries(bugBountyMethodology).forEach(([phase, data]) => {
      console.log(`\n%c${data.name}`, "color: #3498db; font-weight: bold; font-size: 14px;");

      console.log("  Steps:");
      data.steps.forEach((step, i) => console.log(`    ${i + 1}. ${step}`));

      if (data.tools) {
        console.log("  Tools:");
        data.tools.forEach(tool => console.log(`    - ${tool}`));
      }

      if (data.warnings) {
        console.log("  ⚠️ Warnings:");
        data.warnings.forEach(warning => console.log(`    - ${warning}`));
      }
    });
  }

  window.displayMethodology = displayMethodology;
  window.bugBountyMethodology = bugBountyMethodology;

  // ===========================================
  // 🧪 SAFE TEST PAYLOADS
  // ===========================================

  const safeTestPayloads = {
    basic: [
      { payload: "test123", description: "Basic text input", risk: "NONE" },
      { payload: "<b>bold</b>", description: "HTML tag test", risk: "LOW" },
    ],
    xss: [
      { payload: "alert(1)", description: "Basic XSS (use in safe context)", risk: "MEDIUM" },
      { payload: "console.log('XSS')", description: "Safer XSS test", risk: "LOW" },
      { payload: "prompt(document.domain)", description: "Domain verification", risk: "MEDIUM" },
    ],
    dom: [
      { payload: "javascript:console.log(1)", description: "JavaScript protocol", risk: "MEDIUM" },
      { payload: "data:text/html,<script>alert(1)</script>", description: "Data URL test", risk: "MEDIUM" },
    ],
    template: [
      { payload: "{{7*7}}", description: "Template injection test", risk: "LOW" },
      { payload: "${7*7}", description: "String interpolation test", risk: "LOW" },
    ],
  };

  function displaySafePayloads() {
    console.log("%c🧪 SAFE TEST PAYLOADS", "font-size: 18px; font-weight: bold; color: #00ced1;");

    Object.entries(safeTestPayloads).forEach(([category, payloads]) => {
      console.log(`\n%c${category.toUpperCase()}`, "color: #3498db; font-weight: bold;");
      payloads.forEach(p => {
        console.log(`  %c[${p.risk}]%c ${p.payload} - ${p.description}`, "font-weight: bold; color: #f39c12;", "color: #2c3e50;");
      });
    });

    console.log("\n%c⚠️ Always test responsibly and within scope!", "color: #e74c3c; font-weight: bold;");
  }

  window.displaySafePayloads = displaySafePayloads;
  window.safeTestPayloads = safeTestPayloads;

  // ===========================================
  // 📖 VULNERABILITY DATABASE
  // ===========================================

  const vulnerabilityDatabase = {
    DOMXSS: {
      id: "DOM-XSS-001",
      name: "DOM-based Cross-Site Scripting",
      description: "Client-side XSS vulnerability through DOM manipulation",
      severity: "HIGH",
      cvss: "7.5",
      cwe: "CWE-79",
      owasp: "A03:2021 - Injection",
      mitigation: "Use safe DOM APIs, implement CSP, sanitize input",
    },
    PrototypePollution: {
      id: "PROTO-001",
      name: "Prototype Pollution",
      description: "Object prototype manipulation leading to property injection",
      severity: "HIGH",
      cvss: "7.3",
      cwe: "CWE-1321",
      owasp: "A08:2021 - Software and Data Integrity Failures",
      mitigation: "Freeze Object.prototype, validate object merging",
    },
    DOMClobbering: {
      id: "DOM-CLOB-001",
      name: "DOM Clobbering",
      description: "Overwriting global variables via element IDs/names",
      severity: "MEDIUM",
      cvss: "5.3",
      cwe: "CWE-345",
      owasp: "A08:2021 - Software and Data Integrity Failures",
      mitigation: "Avoid global variable reliance on DOM properties",
    },
    OpenRedirect: {
      id: "REDIR-001",
      name: "Open Redirect",
      description: "Unvalidated redirect to attacker-controlled URL",
      severity: "MEDIUM",
      cvss: "4.7",
      cwe: "CWE-601",
      owasp: "A01:2021 - Broken Access Control",
      mitigation: "Validate redirect URLs against allowlist",
    },
    ClientSideTemplate: {
      id: "CSTI-001",
      name: "Client-Side Template Injection",
      description: "Template injection in client-side frameworks",
      severity: "CRITICAL",
      cvss: "9.0",
      cwe: "CWE-1336",
      owasp: "A03:2021 - Injection",
      mitigation: "Use framework security features, sandbox templates",
    },
  };

  function lookupVulnerability(vulnId) {
    const vuln = Object.values(vulnerabilityDatabase).find(v => v.id === vulnId || v.name.toLowerCase().includes(vulnId.toLowerCase()));

    if (!vuln) {
      console.log(`%c❌ Vulnerability not found: ${vulnId}`, "color: #e74c3c;");
      console.log("%cAvailable vulnerabilities:", "color: #7f8c8d;");
      Object.values(vulnerabilityDatabase).forEach(v => console.log(`  - ${v.id}: ${v.name}`));
      return null;
    }

    console.log(`%c📖 Vulnerability: ${vuln.name}`, "font-size: 16px; font-weight: bold; color: #00ced1;");
    console.log(`ID: ${vuln.id}`);
    console.log(`Severity: ${vuln.severity} (CVSS: ${vuln.cvss})`);
    console.log(`CWE: ${vuln.cwe}`);
    console.log(`OWASP: ${vuln.owasp}`);
    console.log(`\nDescription: ${vuln.description}`);
    console.log(`Mitigation: ${vuln.mitigation}`);

    return vuln;
  }

  window.lookupVulnerability = lookupVulnerability;
  window.vulnerabilityDatabase = vulnerabilityDatabase;

  console.log("\n%c📚 DOCUMENTATION & REFERENCE COMMANDS:", "color: #f39c12; font-weight: bold;");
  console.log("%c  lookupSink('sinkName')               %c- Get detailed sink docs", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  generateRiskMatrix()                 %c- View risk assessment", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  generateSecurityChecklist()          %c- Get security checklist", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  testXSSPatterns(element)             %c- Test for XSS patterns", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  analyzeElementSecurity(element)      %c- Analyze element security", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  getPageSecuritySummary()             %c- Get page security summary", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  quickSecurityScan()                  %c- Run quick security scan", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  displayMethodology()                 %c- Show bug bounty methodology", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  displaySafePayloads()                %c- Show safe test payloads", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  lookupVulnerability('id')            %c- Look up vulnerability info", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");

  // ===========================================
  // 📊 ADVANCED REFLECTION DETECTION
  // ===========================================

  function advancedReflectionDetection(element) {
    const reflectionAnalysis = {
      element: {
        tag: element.tagName?.toLowerCase(),
        id: element.id,
        class: element.className,
      },
      reflections: {
        bodyReflection: false,
        domReflection: false,
        urlReflection: false,
        attributeReflection: false,
        textReflection: false,
      },
      reflectionPoints: [],
      riskScore: 0,
      recommendations: [],
    };

    // Get element content
    const elementContent = element.value || element.textContent || element.innerText || "";

    if (elementContent && elementContent.trim().length > 0) {
      // Check body reflection
      const bodyHTML = document.body.innerHTML;
      const bodyText = document.body.textContent || document.body.innerText;

      if (bodyHTML.includes(elementContent)) {
        reflectionAnalysis.reflections.bodyReflection = true;
        reflectionAnalysis.reflectionPoints.push({
          type: "BODY_HTML",
          content: elementContent.substring(0, 100),
          context: "Element content found in body HTML",
        });
        reflectionAnalysis.riskScore += 20;
      }

      if (bodyText.includes(elementContent)) {
        reflectionAnalysis.reflections.bodyReflection = true;
        reflectionAnalysis.reflectionPoints.push({
          type: "BODY_TEXT",
          content: elementContent.substring(0, 100),
          context: "Element content found in body text",
        });
        reflectionAnalysis.riskScore += 15;
      }

      // Check URL reflection
      const url = window.location.href;
      const searchParams = new URLSearchParams(window.location.search);

      searchParams.forEach((value, key) => {
        if (elementContent.includes(value) || value.includes(elementContent)) {
          reflectionAnalysis.reflections.urlReflection = true;
          reflectionAnalysis.reflectionPoints.push({
            type: "URL_PARAM",
            param: key,
            value: value.substring(0, 100),
            context: `Content matches URL parameter: ${key}`,
          });
          reflectionAnalysis.riskScore += 25;
        }
      });

      if (window.location.hash.includes(elementContent)) {
        reflectionAnalysis.reflections.urlReflection = true;
        reflectionAnalysis.reflectionPoints.push({
          type: "URL_HASH",
          content: elementContent.substring(0, 100),
          context: "Content found in URL hash",
        });
        reflectionAnalysis.riskScore += 20;
      }

      // Check attribute reflection
      Array.from(element.attributes || []).forEach(attr => {
        const attrValue = attr.value;
        if (attrValue && attrValue.trim().length > 2) {
          const occurrences = bodyHTML.split(attrValue).length - 1;
          if (occurrences > 1) {
            reflectionAnalysis.reflections.attributeReflection = true;
            reflectionAnalysis.reflectionPoints.push({
              type: "ATTRIBUTE_REFLECTION",
              attribute: attr.name,
              value: attrValue.substring(0, 100),
              occurrences: occurrences,
              context: `Attribute value reflected ${occurrences} times in DOM`,
            });
            reflectionAnalysis.riskScore += 15;
          }
        }
      });

      // Check text reflection in other elements
      const allElements = document.querySelectorAll("*");
      let reflectionCount = 0;

      allElements.forEach(el => {
        if (el !== element) {
          const elText = el.textContent || el.innerHTML || "";
          if (elText.includes(elementContent)) {
            reflectionCount++;
            if (reflectionCount <= 5) {
              reflectionAnalysis.reflections.domReflection = true;
              reflectionAnalysis.reflectionPoints.push({
                type: "ELEMENT_REFLECTION",
                element: `${el.tagName?.toLowerCase()}#${el.id || ""}`,
                context: "Content reflected in another element",
              });
            }
          }
        }
      });

      if (reflectionCount > 5) {
        reflectionAnalysis.riskScore += 30;
        reflectionAnalysis.recommendations.push(`Content reflected in ${reflectionCount} elements - potential widespread XSS`);
      } else if (reflectionCount > 0) {
        reflectionAnalysis.riskScore += 15;
        reflectionAnalysis.recommendations.push("Content reflected in other elements - review for XSS");
      }
    }

    // Check for template syntax
    const elementHTML = element.outerHTML || "";
    if (elementHTML.includes("{{") || elementHTML.includes("${") || elementHTML.includes("{%")) {
      reflectionAnalysis.reflectionPoints.push({
        type: "TEMPLATE_SYNTAX",
        context: "Template syntax detected in element",
      });
      reflectionAnalysis.riskScore += 25;
      reflectionAnalysis.recommendations.push("Template syntax detected - check for template injection");
    }

    // Cap risk score at 100
    reflectionAnalysis.riskScore = Math.min(100, reflectionAnalysis.riskScore);

    // Display results
    console.log(`%c🔍 Advanced Reflection Analysis: ${reflectionAnalysis.element.tag}#${reflectionAnalysis.element.id || ""}`, "font-size: 14px; font-weight: bold; color: #00ced1;");
    console.log(`%cReflection Score: ${reflectionAnalysis.riskScore}/100`, `color: ${
      reflectionAnalysis.riskScore >= 70 ? '#e74c3c' :
      reflectionAnalysis.riskScore >= 40 ? '#f39c12' : '#27ae60'
    }; font-weight: bold;`);

    console.log("\n%cReflection Status:", "font-weight: bold;");
    Object.entries(reflectionAnalysis.reflections).forEach(([type, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${type}: ${status ? 'DETECTED' : 'Not Found'}`);
    });

    if (reflectionAnalysis.reflectionPoints.length > 0) {
      console.log("\n%cReflection Points:", "color: #f39c12; font-weight: bold;");
      reflectionAnalysis.reflectionPoints.forEach((point, i) => {
        console.log(`  ${i + 1}. ${point.type}: ${point.context}`);
      });
    }

    if (reflectionAnalysis.recommendations.length > 0) {
      console.log("\n%cRecommendations:", "color: #27ae60; font-weight: bold;");
      reflectionAnalysis.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    return reflectionAnalysis;
  }

  window.advancedReflectionDetection = advancedReflectionDetection;

  // ===========================================
  // 🔍 COMPREHENSIVE ELEMENT ANALYZER
  // ===========================================

  function comprehensiveElementAnalysis(element) {
    console.log(`%c🔬 Comprehensive Element Analysis: ${element.tagName?.toLowerCase()}#${element.id || ""}`, "font-size: 16px; font-weight: bold; color: #00ced1;");

    const analysis = {
      basicInfo: {
        tag: element.tagName?.toLowerCase(),
        id: element.id,
        class: element.className,
        name: element.name,
        type: element.type,
        value: element.value,
        placeholder: element.placeholder,
      },
      attributes: {},
      eventHandlers: {},
      listeners: [],
      advancedSinks: detectAdvancedSinks(element),
      gadgetChains: detectGadgetChains(element),
      reflectionAnalysis: advancedReflectionDetection(element),
      securityAnalysis: analyzeElementSecurity(element),
      xpath: getElementXPath(element),
      cssPath: getElementCSSPath(element),
    };

    // Get attributes
    Array.from(element.attributes || []).forEach(attr => {
      analysis.attributes[attr.name] = attr.value;
    });

    // Get event handlers
    const eventTypes = [
      "click", "dblclick", "mousedown", "mouseup", "mousemove",
      "keydown", "keyup", "keypress", "submit", "change", "input",
      "focus", "blur", "load", "error", "scroll", "resize",
      "mouseover", "mouseout", "mouseenter", "mouseleave",
      "contextmenu", "copy", "cut", "paste", "drag", "drop",
    ];

    eventTypes.forEach(eventType => {
      const handler = element[`on${eventType}`];
      if (handler && typeof handler === "function") {
        analysis.eventHandlers[eventType] = handler.toString().substring(0, 200);
      }
    });

    // Display summary
    console.log("\n%c📊 Basic Information:", "color: #3498db; font-weight: bold;");
    console.table(analysis.basicInfo);

    console.log("\n%c🎯 Event Handlers:", "color: #f39c12; font-weight: bold;");
    const handlerCount = Object.keys(analysis.eventHandlers).length;
    console.log(`  Found ${handlerCount} inline event handlers`);
    if (handlerCount > 0) {
      Object.keys(analysis.eventHandlers).forEach(handler => {
        console.log(`  - on${handler}`);
      });
    }

    console.log("\n%c⚠️ Advanced Sinks:", "color: #e74c3c; font-weight: bold;");
    const sinkCount = Object.values(analysis.advancedSinks).flat().filter(s => s.detected).length;
    console.log(`  Found ${sinkCount} advanced sinks`);

    console.log("\n%c🔗 Gadget Chains:", "color: #9b59b6; font-weight: bold;");
    console.log(`  Found ${analysis.gadgetChains.length} gadget chains`);

    console.log("\n%c📍 Location:", "color: #27ae60; font-weight: bold;");
    console.log(`  XPath: ${analysis.xpath}`);
    console.log(`  CSS Path: ${analysis.cssPath}`);

    return analysis;
  }

  window.comprehensiveElementAnalysis = comprehensiveElementAnalysis;

  // ===========================================
  // 📍 ELEMENT PATH UTILITIES
  // ===========================================

  function getElementXPath(element) {
    if (element.id) {
      return `id("${element.id}")`;
    }

    const path = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.tagName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : "";
      path.unshift(`${tagName}${pathIndex}`);

      current = current.parentNode;
    }

    return "/" + path.join("/");
  }

  function getElementCSSPath(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    const path = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();

      if (current.className) {
        const classes = current.className.split(" ").filter(Boolean).join(".");
        if (classes) {
          selector += `.${classes}`;
        }
      }

      path.unshift(selector);
      current = current.parentNode;

      if (path.length > 5) break;
    }

    return path.join(" > ");
  }

  window.getElementXPath = getElementXPath;
  window.getElementCSSPath = getElementCSSPath;

  // ===========================================
  // 📊 COMPARATIVE ANALYSIS
  // ===========================================

  function compareElements(element1, element2) {
    const analysis1 = comprehensiveElementAnalysis(element1);
    const analysis2 = comprehensiveElementAnalysis(element2);

    const comparison = {
      element1: {
        tag: analysis1.basicInfo.tag,
        id: analysis1.basicInfo.id,
        securityScore: analysis1.securityAnalysis.score,
        sinkCount: Object.values(analysis1.advancedSinks).flat().filter(s => s.detected).length,
        gadgetChainCount: analysis1.gadgetChains.length,
        reflectionScore: analysis1.reflectionAnalysis.riskScore,
      },
      element2: {
        tag: analysis2.basicInfo.tag,
        id: analysis2.basicInfo.id,
        securityScore: analysis2.securityAnalysis.score,
        sinkCount: Object.values(analysis2.advancedSinks).flat().filter(s => s.detected).length,
        gadgetChainCount: analysis2.gadgetChains.length,
        reflectionScore: analysis2.reflectionAnalysis.riskScore,
      },
      summary: {
        moreSecure: analysis1.securityAnalysis.score > analysis2.securityAnalysis.score ? "element1" : "element2",
        moreSinks: Object.values(analysis1.advancedSinks).flat().filter(s => s.detected).length >
                   Object.values(analysis2.advancedSinks).flat().filter(s => s.detected).length ? "element1" : "element2",
        moreReflections: analysis1.reflectionAnalysis.riskScore > analysis2.reflectionAnalysis.riskScore ? "element1" : "element2",
      },
    };

    console.log("%c📊 Element Comparison", "font-size: 16px; font-weight: bold; color: #00ced1;");
    console.table(comparison);

    return comparison;
  }

  window.compareElements = compareElements;

  // ===========================================
  // 🎯 TARGETED SCANNING
  // ===========================================

  function targetedScan(selectors, options = {}) {
    const config = {
      includeReflections: options.includeReflections !== false,
      includeSinks: options.includeSinks !== false,
      includeGadgetChains: options.includeGadgetChains !== false,
      includeSecurity: options.includeSecurity !== false,
      ...options,
    };

    console.log("%c🎯 Starting Targeted Scan...", "font-size: 16px; font-weight: bold; color: #00ced1;");

    const elements = [];
    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (e) {
        console.log(`%c❌ Invalid selector: ${selector}`, "color: #e74c3c; font-weight: bold;");
      }
    });

    console.log(`📊 Found ${elements.length} elements to analyze`);

    const results = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      elementsAnalyzed: elements.length,
      findings: [],
      summary: {
        totalSinks: 0,
        totalReflections: 0,
        totalGadgetChains: 0,
        averageSecurityScore: 0,
        riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      },
    };

    let totalSecurityScore = 0;

    elements.forEach((element, index) => {
      const finding = {
        index,
        tag: element.tagName?.toLowerCase(),
        id: element.id,
        class: element.className,
        xpath: getElementXPath(element),
        cssPath: getElementCSSPath(element),
      };

      if (config.includeSinks) {
        finding.sinks = detectAdvancedSinks(element);
        const sinkCount = Object.values(finding.sinks).flat().filter(s => s.detected).length;
        results.summary.totalSinks += sinkCount;
      }

      if (config.includeReflections) {
        finding.reflection = advancedReflectionDetection(element);
        if (finding.reflection.reflectionPoints.length > 0) {
          results.summary.totalReflections += finding.reflection.reflectionPoints.length;
        }
      }

      if (config.includeGadgetChains) {
        finding.gadgetChains = detectGadgetChains(element);
        results.summary.totalGadgetChains += finding.gadgetChains.length;
      }

      if (config.includeSecurity) {
        finding.security = analyzeElementSecurity(element);
        totalSecurityScore += finding.security.score;

        if (finding.security.score < 50) {
          results.summary.riskDistribution.CRITICAL++;
        } else if (finding.security.score < 70) {
          results.summary.riskDistribution.HIGH++;
        } else if (finding.security.score < 85) {
          results.summary.riskDistribution.MEDIUM++;
        } else {
          results.summary.riskDistribution.LOW++;
        }
      }

      results.findings.push(finding);
    });

    results.summary.averageSecurityScore = elements.length > 0 ?
      Math.round(totalSecurityScore / elements.length) : 0;

    console.log("%c✅ Targeted Scan Complete!", "color: #27ae60; font-weight: bold;");
    console.log("\n%c📊 Summary:", "font-weight: bold;");
    console.log(`  Total Sinks: ${results.summary.totalSinks}`);
    console.log(`  Total Reflections: ${results.summary.totalReflections}`);
    console.log(`  Total Gadget Chains: ${results.summary.totalGadgetChains}`);
    console.log(`  Average Security Score: ${results.summary.averageSecurityScore}/100`);
    console.log("\nRisk Distribution:");
    console.table(results.summary.riskDistribution);

    window.lastTargetedScan = results;

    return results;
  }

  window.targetedScan = targetedScan;

  // ===========================================
  // 📋 BATCH EXPORT FUNCTIONS
  // ===========================================

  function exportAllData(format = "json") {
    const allData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      csp: analyzeCSP(),
      sourceToSink: analyzeSourceToSink(),
      sinkStatistics: getSinkStatistics(),
      lastScanResults: window.lastScanResults || null,
      lastTargetedScan: window.lastTargetedScan || null,
    };

    if (format === "json") {
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `complete-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("%c✅ Complete analysis exported as JSON!", "color: #00ced1; font-weight: bold;");
    }

    return allData;
  }

  window.exportAllData = exportAllData;

  console.log("\n%c🆕 ADDITIONAL ADVANCED COMMANDS:", "color: #f39c12; font-weight: bold;");
  console.log("%c  advancedReflectionDetection(element)   %c- Deep reflection analysis", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  comprehensiveElementAnalysis(element)  %c- Full element analysis", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  compareElements(el1, el2)              %c- Compare two elements", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  targetedScan(selectors, options)       %c- Scan specific elements", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  exportAllData('json')                  %c- Export all analysis data", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  getElementXPath(element)               %c- Get element XPath", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");
  console.log("%c  getElementCSSPath(element)             %c- Get element CSS path", "font-weight: bold; color: #e74c3c;", "color: #7f8c8d;");

})();

// ===========================================
// 🗺️ RECONNAISSANCE TOOL READY!
