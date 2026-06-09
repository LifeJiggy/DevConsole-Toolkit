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
      a.remove();
      URL.revokeObjectURL(url);
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
    a.download = "reflection_sink_all_outputs.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
        if (attr.startsWith("on") && el[attr])
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
          if (attr.startsWith("on") && el[attr])
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

  // Start
  menuLoop();
})();
