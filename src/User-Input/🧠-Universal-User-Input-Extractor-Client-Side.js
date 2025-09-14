// 🧠 Universal User Input Extractor & Handler-Network Mapper (Final Full Mapping Version)
// Includes extractInteractiveInputs, mapInteractiveInputsNetwork, mapInputListenersHandlers (trigger, listener, handler, file/line for every input+event+listener)

(function () {
  const inputMap = new Map();
  const networkTriggers = [];
  let CURRENT_HANDLER_CONTEXT = null;

  function isDangerousAttr(attr) {
    if (!attr || typeof attr !== "string") {
      console.log("Usage: isDangerousAttr('attributeName')");
      console.log("Example: isDangerousAttr('onclick') // returns true");
      console.log("Example: isDangerousAttr('src') // returns true");
      console.log("Example: isDangerousAttr('class') // returns false");
      return false;
    }

    const dangerous =
      /^on[a-z]+$/.test(attr) ||
      [
        // Event handlersK
        "onclick",
        "onload",
        "onerror",
        "onmouseover",
        "onfocus",
        "onblur",
        "onchange",
        "onsubmit",
        "onreset",
        "onkeydown",
        "onkeyup",
        "onkeypress",
        "onmouseenter",
        "onmouseleave",
        "onmousedown",
        "onmouseup",
        "onwheel",
        "oncontextmenu",
        "ondrag",
        "ondrop",
        "oninput",
        "onpaste",
        "oncut",
        "oncopy",

        // Injection-prone attributes
        "src",
        "href",
        "style",
        "action",
        "formaction",
        "data",
        "srcdoc",
        "poster",
        "background",
        "codebase",
        "classid",
        "profile",
        "usemap",
        "longdesc",
        "cite",

        // DOM manipulation
        "innerHTML",
        "outerHTML",
        "insertAdjacentHTML",
        "documentURI",
        "textContent",

        // Media and embeds
        "autoplay",
        "controls",
        "loop",
        "muted",
        "preload",
        "target",
        "sandbox",
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",

        // Form and input
        "autocomplete",
        "enctype",
        "method",
        "novalidate",
        "target",
        "inputmode",
        "dirname",
        "form",
        "formenctype",
        "formmethod",
        "formtarget",

        // Meta and redirects
        "http-equiv",
        "content",
        "refresh",
        "charset",
      ].includes(attr.toLowerCase());

    console.log(`Attribute '${attr}' is ${dangerous ? "DANGEROUS" : "safe"}`);
    return dangerous;
  }
  window.isDangerousAttr = isDangerousAttr;

  (function installGlobalNetworkTracker() {
    const origFetch = window.fetch;
    window.fetch = function (...args) {
      if (
        CURRENT_HANDLER_CONTEXT &&
        !(CURRENT_HANDLER_CONTEXT.netCalls || []).includes("fetch")
      ) {
        CURRENT_HANDLER_CONTEXT.netCalls = (
          CURRENT_HANDLER_CONTEXT.netCalls || []
        ).concat("fetch");
        networkTriggers.push(
          Object.assign({}, CURRENT_HANDLER_CONTEXT, {
            networkType: "fetch",
            networkArgs: args,
            networkTime: Date.now(),
          })
        );
      }
      return origFetch.apply(this, args);
    };
    const OrigXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function XHRWrap() {
      const xhr = new OrigXHR();
      if (CURRENT_HANDLER_CONTEXT) {
        xhr.addEventListener("readystatechange", function () {
          if (xhr.readyState === 4) {
            CURRENT_HANDLER_CONTEXT.netCalls = (
              CURRENT_HANDLER_CONTEXT.netCalls || []
            ).concat("xhr");
            networkTriggers.push(
              Object.assign({}, CURRENT_HANDLER_CONTEXT, {
                networkType: "xhr",
                networkArgs: arguments,
                networkTime: Date.now(),
              })
            );
          }
        });
      }
      return xhr;
    };
    document.addEventListener(
      "submit",
      function (e) {
        if (CURRENT_HANDLER_CONTEXT) {
          CURRENT_HANDLER_CONTEXT.netCalls = (
            CURRENT_HANDLER_CONTEXT.netCalls || []
          ).concat("form-submit");
          networkTriggers.push(
            Object.assign({}, CURRENT_HANDLER_CONTEXT, {
              networkType: "form-submit",
              networkArgs: e,
              networkTime: Date.now(),
            })
          );
        }
      },
      true
    );
  })();

  function getHandlerSourceInfo(fn) {
    if (!fn || typeof fn !== "function") return "";
    try {
      const str = fn.toString();
      if (str.length < 600) return str;
      return str.slice(0, 597) + "...";
    } catch {
      return "";
    }
  }
  function getFunctionLocation(fn) {
    if (!fn || typeof fn !== "function") return "";

    // Try to get location from function's own stack trace
    try {
      const originalPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, stack) => stack;
      const stack = new Error().stack;
      Error.prepareStackTrace = originalPrepareStackTrace;

      if (stack && stack.length > 1) {
        const caller = stack[1];
        if (caller.getFileName && caller.getLineNumber) {
          return `${caller.getFileName()}:${caller.getLineNumber()}:${caller.getColumnNumber()}`;
        }
      }
    } catch (e) {
      // Fallback to string parsing
    }

    // Fallback: parse stack trace string
    try {
      throw new Error();
    } catch (e) {
      if (e.stack && typeof e.stack === "string") {
        const lines = e.stack.split("\n");
        for (let l of lines) {
          if (
            (l.includes(".js") ||
              l.includes(".ts") ||
              l.includes("file:///") ||
              l.includes("http://") ||
              l.includes("https://")) &&
            !l.includes("getFunctionLocation") &&
            !l.includes("getHandlerSourceInfo")
          ) {
            return l.trim();
          }
        }
      }
    }

    // Try to extract from function string if it has source map info
    try {
      const fnStr = fn.toString();
      if (
        fnStr.includes("//# sourceURL=") ||
        fnStr.includes("//@ sourceURL=")
      ) {
        const match = fnStr.match(/\/\/[#@] sourceURL=(.+)/);
        if (match) return match[1];
      }
    } catch (e) {
      // Ignore
    }

    return "unknown-location";
  }

  function deepWrapElementHandlers(el, inputMeta) {
    const events = [
      "input",
      "change",
      "click",
      "submit",
      "mouseover",
      "mouseout",
      "focus",
      "blur",
      "keydown",
      "keyup",
      "paste",
      "mousedown",
      "mouseup",
      "dblclick",
      "contextmenu",
      "touchstart",
      "touchend",
      "touchmove",
      "pointerdown",
      "pointerup",
      "pointerenter",
      "pointerleave",
      "drop",
      "dragover",
      "dragenter",
      "dragleave",
    ];

    // Initialize handler tracking
    if (!el._upe_eventHandlers) {
      el._upe_eventHandlers = [];
    }

    events.forEach((evtName) => {
      let attrHandler = el.getAttribute && el.getAttribute("on" + evtName);
      if (attrHandler && typeof attrHandler === "string") {
        try {
          const rawHandler = new Function(attrHandler);
          el.removeAttribute("on" + evtName);
          el.addEventListener(
            evtName,
            wrapHandlerFn(evtName, rawHandler, inputMeta, "inline-attr")
          );
          // Track the handler
          el._upe_eventHandlers.push({
            event: evtName,
            handler: rawHandler,
            method: "inline-attr",
          });
        } catch {}
      }
      if (el["on" + evtName] && typeof el["on" + evtName] === "function") {
        const realPropertyHandler = el["on" + evtName];
        el["on" + evtName] = wrapHandlerFn(
          evtName,
          realPropertyHandler,
          inputMeta,
          "property"
        );
        // Track the handler
        el._upe_eventHandlers.push({
          event: evtName,
          handler: realPropertyHandler,
          method: "property",
        });
      }
    });

    if (!el._upe_monkeyPatched) {
      const addEvOrig = el.addEventListener;
      el.addEventListener = function (type, listener, ...args) {
        if (typeof listener === "function") {
          const wrapped = wrapHandlerFn(
            type,
            listener,
            inputMeta,
            "addEventListener"
          );
          // Track the handler
          if (!this._upe_eventHandlers) {
            this._upe_eventHandlers = [];
          }
          this._upe_eventHandlers.push({
            event: type,
            handler: listener,
            method: "addEventListener",
          });
          return addEvOrig.call(this, type, wrapped, ...args);
        }
        return addEvOrig.call(this, type, listener, ...args);
      };
      el._upe_monkeyPatched = true;
    }

    // Capture existing event listeners using getEventListeners (Chrome DevTools)
    if (typeof getEventListeners === "function") {
      try {
        const existingListeners = getEventListeners(el);
        for (const [eventType, listeners] of Object.entries(
          existingListeners
        )) {
          listeners.forEach((listenerObj) => {
            if (
              listenerObj.listener &&
              typeof listenerObj.listener === "function"
            ) {
              el._upe_eventHandlers.push({
                event: eventType,
                handler: listenerObj.listener,
                method: "existing-addEventListener",
              });
            }
          });
        }
      } catch (e) {
        // getEventListeners not available or failed
      }
    }
  }

  function wrapHandlerFn(evt, handler, meta, method) {
    function wrappedHandler(...args) {
      const prev = CURRENT_HANDLER_CONTEXT;
      CURRENT_HANDLER_CONTEXT = {
        input: meta,
        event: evt,
        handler: handler,
        handlerMethod: method,
        handlerSource: getHandlerSourceInfo(handler),
        fileLineHint: getFunctionLocation(handler),
        handlerTime: Date.now(),
      };
      try {
        return handler.apply(this, args);
      } finally {
        CURRENT_HANDLER_CONTEXT = prev;
      }
    }
    wrappedHandler._upe_real = handler;
    wrappedHandler._upe_metadata = { evt, meta, method };
    return wrappedHandler;
  }

  // 🎯 COMPREHENSIVE INPUT EXTRACTION - Wide range of input fields
  function extractAndWrapAllInputs() {
    inputMap.clear();

    // 📝 ENHANCED INPUT SELECTORS - Covers modern web applications
    const comprehensiveInputSelectors = [
      // Standard form elements
      "input",
      "textarea",
      "select",
      "button",
      "fieldset",
      "output",
      "datalist",
      "meter",
      "progress",

      // HTML5 input types
      "input[type='text']",
      "input[type='password']",
      "input[type='email']",
      "input[type='tel']",
      "input[type='url']",
      "input[type='search']",
      "input[type='number']",
      "input[type='range']",
      "input[type='date']",
      "input[type='time']",
      "input[type='datetime-local']",
      "input[type='month']",
      "input[type='week']",
      "input[type='color']",
      "input[type='file']",
      "input[type='checkbox']",
      "input[type='radio']",
      "input[type='submit']",
      "input[type='reset']",
      "input[type='button']",
      "input[type='image']",
      "input[type='hidden']",

      // Interactive elements
      "details",
      "summary",
      "label",
      "legend",
      "optgroup",
      "option",

      // Media and embedded content
      "iframe",
      "embed",
      "object",
      "audio",
      "video",
      "canvas",

      // Contenteditable elements
      "[contenteditable='true']",
      "[contenteditable='']",
      "[contenteditable]",

      // ARIA interactive elements
      "[role='textbox']",
      "[role='searchbox']",
      "[role='combobox']",
      "[role='listbox']",
      "[role='button']",
      "[role='checkbox']",
      "[role='radio']",
      "[role='switch']",
      "[role='slider']",
      "[role='spinbutton']",
      "[role='menuitem']",
      "[role='tab']",

      // Modern UI components (common class patterns)
      ".input",
      ".form-control",
      ".form-field",
      ".text-input",
      ".search-input",
      ".btn",
      ".button",
      ".clickable",
      ".interactive",
      ".selectable",
      ".dropdown",
      ".select",
      ".picker",
      ".toggle",
      ".switch",
      ".slider",
      ".range",
      ".rating",
      ".star-rating",
      ".emoji-picker",
      ".color-picker",
      ".date-picker",
      ".time-picker",
      ".file-upload",
      ".drag-drop",
      ".sortable",
      ".resizable",
      ".editable",

      // Custom input patterns
      "[data-input]",
      "[data-field]",
      "[data-control]",
      "[data-interactive]",
      "[data-editable]",
      "[data-clickable]",
      "[data-selectable]",

      // Event handler attributes (potential interactive elements)
      "[onclick]",
      "[onchange]",
      "[oninput]",
      "[onkeydown]",
      "[onkeyup]",
      "[onfocus]",
      "[onblur]",
      "[onsubmit]",
      "[onreset]",

      // Accessibility attributes indicating interactivity
      "[tabindex]",
      "[accesskey]",
      "[draggable='true']",

      // Modern framework patterns
      ".v-input",
      ".el-input",
      ".ant-input",
      ".mat-input", // Vue, Element, Ant Design, Angular Material
      ".form-group input",
      ".form-item input",
      ".field input",

      // Custom elements (web components)
      "*[is]",
      "custom-input",
      "ui-input",
      "app-input",
    ];

    // Process forms first
    document.querySelectorAll("form").forEach((form) => {
      const meta = {
        type: "form",
        inputType: "",
        name: form.name || "",
        id: form.id || "",
        value: "",
        checked: null,
        visibility: form.hidden ? "hidden" : "visible",
        source: "form",
        ref: form,
      };
      inputMap.set(form, meta);
      deepWrapElementHandlers(form, meta);

      // Extract all inputs within this form
      comprehensiveInputSelectors.forEach((selector) => {
        try {
          form.querySelectorAll(selector).forEach((el) => {
            if (!inputMap.has(el)) {
              extractAndWrapSingleInput(el, form);
            }
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });
    });

    // Process all inputs in document (including those outside forms)
    comprehensiveInputSelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          if (!inputMap.has(el)) {
            extractAndWrapSingleInput(el, el.form || null);
          }
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });
    document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
      if (!inputMap.has(el)) {
        const meta = {
          type: "contenteditable",
          inputType: "",
          name: el.getAttribute("name") || "",
          id: el.id || "",
          value: el.innerText,
          checked: null,
          visibility:
            getComputedStyle(el).display === "none" || el.hidden
              ? "hidden"
              : "visible",
          source: "contenteditable",
          ref: el,
        };
        inputMap.set(el, meta);
        deepWrapElementHandlers(el, meta);
      }
    });
    document
      .querySelectorAll(
        '[role="slider"], [role="checkbox"], [role="switch"], .star-rating, .emoji-picker, .color-picker'
      )
      .forEach((el) => {
        if (!inputMap.has(el)) {
          const meta = {
            type: "custom-interactive",
            inputType: el.getAttribute("role") || "",
            name: el.getAttribute("name") || "",
            id: el.id || "",
            value:
              el.value ||
              el.getAttribute("aria-checked") ||
              el.getAttribute("aria-valuenow") ||
              "",
            checked: el.getAttribute("aria-checked"),
            visibility:
              getComputedStyle(el).display === "none" || el.hidden
                ? "hidden"
                : "visible",
            source: "custom-interactive",
            ref: el,
          };
          inputMap.set(el, meta);
          deepWrapElementHandlers(el, meta);
        }
      });
    document
      .querySelectorAll(
        'input[type="hidden"], [hidden], [style*="display:none"], [style*="visibility:hidden"]'
      )
      .forEach((el) => {
        if (!inputMap.has(el)) {
          const meta = {
            type: el.tagName.toLowerCase(),
            inputType: el.type || "",
            name: el.name || "",
            id: el.id || "",
            value: el.value || el.textContent || "",
            checked: el.checked !== undefined ? el.checked : null,
            visibility: "hidden",
            source: "hidden",
            ref: el,
          };
          inputMap.set(el, meta);
          deepWrapElementHandlers(el, meta);
        }
      });
    document
      .querySelectorAll('input[type="file"], .drag-drop-zone')
      .forEach((el) => {
        if (!inputMap.has(el)) {
          const meta = {
            type:
              el.tagName.toLowerCase() === "input" ? "file" : "custom-dragdrop",
            inputType: el.type || "",
            name: el.name || "",
            id: el.id || "",
            value: "",
            checked: null,
            visibility:
              getComputedStyle(el).display === "none" || el.hidden
                ? "hidden"
                : "visible",
            source: el.tagName.toLowerCase() === "input" ? "file" : "dragdrop",
            ref: el,
          };
          inputMap.set(el, meta);
          deepWrapElementHandlers(el, meta);
        }
      });
    document
      .querySelectorAll('input[type="search"], .search-bar, [autocomplete]')
      .forEach((el) => {
        if (!inputMap.has(el)) {
          const meta = {
            type: "search",
            inputType: el.type || "",
            name: el.name || "",
            id: el.id || "",
            value: el.value,
            checked: null,
            visibility:
              getComputedStyle(el).display === "none" || el.hidden
                ? "hidden"
                : "visible",
            source: "search",
            ref: el,
          };
          inputMap.set(el, meta);
          deepWrapElementHandlers(el, meta);
        }
      });
  }
  window.extractAndWrapAllInputs = extractAndWrapAllInputs;
  function extractAndWrapSingleInput(el, parentForm) {
    const meta = {
      type: el.tagName.toLowerCase(),
      inputType: detectInputType(el), // Use enhanced detection
      name: el.name || "",
      id: el.id || "",
      value: el.value || el.textContent?.slice(0, 100) || "",
      checked: el.checked !== undefined ? el.checked : null,
      visibility:
        getComputedStyle(el).display === "none" || el.hidden
          ? "hidden"
          : "visible",
      source: parentForm ? "form" : "standalone",
      classes: el.className || "",
      hasClickHandler: !!el.onclick || el.hasAttribute("onclick"),
      hasDangerousAttrs: checkForDangerousAttributes(el),
      framework: detectFramework(el),
      ref: el,
    };
    inputMap.set(el, meta);
    deepWrapElementHandlers(el, meta);
  }

  // 🎯 FRAMEWORK DETECTION - Detect which framework/library is being used
  function detectFramework(element) {
    const className = element.className?.toLowerCase() || "";
    const attributes = Array.from(element.attributes).map((attr) =>
      attr.name.toLowerCase()
    );

    // Vue.js
    if (
      attributes.some((attr) => attr.startsWith("v-")) ||
      className.includes("v-")
    ) {
      return "vue";
    }

    // React
    if (
      attributes.some((attr) => attr.startsWith("data-react")) ||
      className.includes("__react")
    ) {
      return "react";
    }

    // Angular
    if (
      attributes.some(
        (attr) => attr.startsWith("ng-") || attr.startsWith("mat-")
      ) ||
      className.includes("mat-") ||
      className.includes("ng-")
    ) {
      return "angular";
    }

    // Ant Design
    if (className.includes("ant-")) {
      return "antd";
    }

    // Element UI
    if (className.includes("el-")) {
      return "element";
    }

    // Bootstrap
    if (className.includes("form-control") || className.includes("btn-")) {
      return "bootstrap";
    }

    // Tailwind CSS
    if (
      className.includes("focus:") ||
      className.includes("hover:") ||
      className.includes("bg-")
    ) {
      return "tailwind";
    }

    // Bulma
    if (className.includes("input") && className.includes("control")) {
      return "bulma";
    }

    return "vanilla";
  }

  // Extract interactive inputs (both visible and hidden for comprehensive analysis)
  function extractInteractiveInputs() {
    if (!executionTracker.track("extractInteractiveInputs")) return inputMap;

    inputMap.clear();

    // Enhanced selector to capture more interactive elements
    const visibleSelectors = [
      // Standard form inputs (visible)
      "input:not([type='hidden']):not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "textarea:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "select:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "button:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "label:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "fieldset:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "legend:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "optgroup:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "option:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "meter:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "progress:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "output:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "datalist:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",

      // HTML5 input types
      "input[type='text']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='password']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='email']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='tel']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='url']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='search']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='number']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='range']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='date']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='time']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='datetime-local']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='month']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='week']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='color']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='file']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='checkbox']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='radio']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='submit']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='reset']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='button']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "input[type='image']:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",

      // Interactive elements
      "details:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",
      "summary:not([hidden]):not([style*='display:none']):not([style*='visibility:hidden'])",

      // Contenteditable elements
      "[contenteditable='true']:not([hidden]):not([style*='display:none'])",
      "[contenteditable='']:not([hidden]):not([style*='display:none'])",
      "[contenteditable]:not([hidden]):not([style*='display:none'])",

      // ARIA interactive elements
      "[role='textbox']:not([hidden]):not([style*='display:none'])",
      "[role='searchbox']:not([hidden]):not([style*='display:none'])",
      "[role='combobox']:not([hidden]):not([style*='display:none'])",
      "[role='listbox']:not([hidden]):not([style*='display:none'])",
      "[role='button']:not([hidden]):not([style*='display:none'])",
      "[role='checkbox']:not([hidden]):not([style*='display:none'])",
      "[role='radio']:not([hidden]):not([style*='display:none'])",
      "[role='switch']:not([hidden]):not([style*='display:none'])",
      "[role='slider']:not([hidden]):not([style*='display:none'])",
      "[role='spinbutton']:not([hidden]):not([style*='display:none'])",
      "[role='menuitem']:not([hidden]):not([style*='display:none'])",
      "[role='tab']:not([hidden]):not([style*='display:none'])",
      "[role='tabpanel']:not([hidden]):not([style*='display:none'])",
      "[role='dialog']:not([hidden]):not([style*='display:none'])", // Modal
      "[role='tooltip']:not([hidden]):not([style*='display:none'])", // Tooltip
      "[role='treeitem']:not([hidden]):not([style*='display:none'])", // Tree Item
      "[role='option']:not([hidden]):not([style*='display:none'])", // Option in listbox/combobox

      // Modern UI components (common class patterns)
      ".input:not([hidden]):not([style*='display:none'])",
      ".form-control:not([hidden]):not([style*='display:none'])",
      ".form-field:not([hidden]):not([style*='display:none'])",
      ".text-input:not([hidden]):not([style*='display:none'])",
      ".search-input:not([hidden]):not([style*='display:none'])",
      ".btn:not([hidden]):not([style*='display:none'])",
      ".button:not([hidden]):not([style*='display:none'])",
      ".clickable:not([hidden]):not([style*='display:none'])",
      ".interactive:not([hidden]):not([style*='display:none'])",
      ".selectable:not([hidden]):not([style*='display:none'])",
      ".dropdown:not([hidden]):not([style*='display:none'])",
      ".select:not([hidden]):not([style*='display:none'])",
      ".picker:not([hidden]):not([style*='display:none'])",
      ".toggle:not([hidden]):not([style*='display:none'])",
      ".switch:not([hidden]):not([style*='display:none'])",
      ".slider:not([hidden]):not([style*='display:none'])",
      ".range:not([hidden]):not([style*='display:none'])",
      ".rating:not([hidden]):not([style*='display:none'])",
      ".star-rating:not([hidden]):not([style*='display:none'])",
      ".emoji-picker:not([hidden]):not([style*='display:none'])",
      ".color-picker:not([hidden]):not([style*='display:none'])",
      ".date-picker:not([hidden]):not([style*='display:none'])",
      ".time-picker:not([hidden]):not([style*='display:none'])",
      ".file-upload:not([hidden]):not([style*='display:none'])",
      ".drag-drop:not([hidden]):not([style*='display:none'])",
      ".sortable:not([hidden]):not([style*='display:none'])",
      ".resizable:not([hidden]):not([style*='display:none'])",
      ".editable:not([hidden]):not([style*='display:none'])",
      ".modal:not([hidden]):not([style*='display:none'])", // Modal
      ".accordion:not([hidden]):not([style*='display:none'])", // Accordion
      ".accordion-item:not([hidden]):not([style*='display:none'])", // Accordion Item
      ".accordion-header:not([hidden]):not([style*='display:none'])", // Accordion Header
      ".accordion-body:not([hidden]):not([style*='display:none'])", // Accordion Body
      ".tab:not([hidden]):not([style*='display:none'])", // Tab
      ".tab-pane:not([hidden]):not([style*='display:none'])", // Tab Pane
      ".tooltip:not([hidden]):not([style*='display:none'])", // Tooltip
      ".menu:not([hidden]):not([style*='display:none'])", // Menu
      ".menu-item:not([hidden]):not([style*='display:none'])", // Menu Item
      ".breadcrumb:not([hidden]):not([style*='display:none'])", // Breadcrumb
      ".pagination:not([hidden]):not([style*='display:none'])", // Pagination
      ".page-item:not([hidden]):not([style*='display:none'])", // Page Item
      ".chat-input:not([hidden]):not([style*='display:none'])", // Chat Input
      ".chat-message:not([hidden]):not([style*='display:none'])", // Chat Message
      ".rte:not([hidden]):not([style*='display:none'])", // Rich Text Editor
      ".editor:not([hidden]):not([style*='display:none'])", // Editor

      // Custom input patterns
      "[data-input]:not([hidden]):not([style*='display:none'])",
      "[data-field]:not([hidden]):not([style*='display:none'])",
      "[data-control]:not([hidden]):not([style*='display:none'])",
      "[data-interactive]:not([hidden]):not([style*='display:none'])",
      "[data-editable]:not([hidden]):not([style*='display:none'])",
      "[data-clickable]:not([hidden]):not([style*='display:none'])",
      "[data-selectable]:not([hidden]):not([style*='display:none'])",

      // Event handler attributes (potential interactive elements)
      "[onclick]:not([hidden]):not([style*='display:none'])",
      "[onchange]:not([hidden]):not([style*='display:none'])",
      "[oninput]:not([hidden]):not([style*='display:none'])",
      "[onkeydown]:not([hidden]):not([style*='display:none'])",
      "[onkeyup]:not([hidden]):not([style*='display:none'])",
      "[onfocus]:not([hidden]):not([style*='display:none'])",
      "[onblur]:not([hidden]):not([style*='display:none'])",
      "[onsubmit]:not([hidden]):not([style*='display:none'])",
      "[onreset]:not([hidden]):not([style*='display:none'])",
      "[onmouseover]:not([hidden]):not([style*='display:none'])",
      "[onmouseout]:not([hidden]):not([style*='display:none'])",
      "[ondragstart]:not([hidden]):not([style*='display:none'])",
      "[ondrop]:not([hidden]):not([style*='display:none'])",

      // Accessibility attributes indicating interactivity
      "[tabindex]:not([hidden]):not([style*='display:none'])",
      "[accesskey]:not([hidden]):not([style*='display:none'])",
      "[draggable='true']:not([hidden]):not([style*='display:none'])",

      // Modern framework patterns
      ".v-input:not([hidden]):not([style*='display:none'])",
      ".el-input:not([hidden]):not([style*='display:none'])",
      ".ant-input:not([hidden]):not([style*='display:none'])",
      ".mat-input:not([hidden]):not([style*='display:none'])", // Vue, Element, Ant Design, Angular Material
      ".form-group input:not([hidden]):not([style*='display:none'])",
      ".form-item input:not([hidden]):not([style*='display:none'])",
      ".field input:not([hidden]):not([style*='display:none'])",
      ".mdc-text-field:not([hidden]):not([style*='display:none'])", // Material
      ".ms-TextField:not([hidden]):not([style*='display:none'])", // Fluent UI

      // Custom elements (web components)
      "*[is]:not([hidden]):not([style*='display:none'])",
      "custom-input:not([hidden]):not([style*='display:none'])",
      "ui-input:not([hidden]):not([style*='display:none'])",
      "app-input:not([hidden]):not([style*='display:none'])",

      // Links with href (often interactive)
      "a[href]:not([hidden]):not([style*='display:none'])",
    ];

    // Hidden selectors for comprehensive analysis
    const hiddenSelectors = [
      "input[type='hidden']",
      "input[hidden]",
      "textarea[hidden]",
      "select[hidden]",
      "button[hidden]",
      "[style*='display:none']",
      "[style*='visibility:hidden']",
    ];

    const allElements = new Set();
    let visibleCount = 0;
    let hiddenCount = 0;

    // Process visible elements
    visibleSelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          // Check if element is actually visible
          if (
            el.offsetParent !== null ||
            el === document.activeElement ||
            (el.offsetWidth > 0 && el.offsetHeight > 0)
          ) {
            allElements.add(el);
            visibleCount++;
          }
        });
      } catch (e) {
        console.warn(`Visible selector failed: ${selector}`, e);
      }
    });

    // Process hidden elements
    hiddenSelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          if (!allElements.has(el)) {
            // Avoid duplicates
            allElements.add(el);
            hiddenCount++;
          }
        });
      } catch (e) {
        console.warn(`Hidden selector failed: ${selector}`, e);
      }
    });

    // Process all found elements
    allElements.forEach((el) => {
      const isVisible =
        el.offsetParent !== null ||
        el === document.activeElement ||
        (el.offsetWidth > 0 && el.offsetHeight > 0);

      const meta = {
        type: el.tagName.toLowerCase(),
        inputType: el.type || el.getAttribute("role") || "",
        name: el.name || "",
        id: el.id || "",
        value: el.value || el.textContent?.slice(0, 50) || "",
        checked: el.checked !== undefined ? el.checked : null,
        visibility: isVisible ? "visible" : "hidden",
        source: el.form ? "form" : "standalone",
        classes: el.className || "",
        hasClickHandler: !!el.onclick || el.hasAttribute("onclick"),
        hasDangerousAttrs: checkForDangerousAttributes(el),
        ref: el,
      };
      inputMap.set(el, meta);
      deepWrapElementHandlers(el, meta);
    });

    console.log(`🎯 Extracted interactive inputs. Total: ${inputMap.size}`);
    console.log(`   👁️ Visible: ${visibleCount}, 🔒 Hidden: ${hiddenCount}`);
    console.log(`   🏷️ Types found:`, [
      ...new Set(Array.from(inputMap.values()).map((m) => m.type)),
    ]);
    return inputMap;
  }

  // Helper function to check for dangerous attributes
  function checkForDangerousAttributes(el) {
    const dangerousAttrs = [
      "onclick",
      "onload",
      "onerror",
      "onmouseover",
      "onfocus",
      "onblur",
      "src",
      "href",
      "action",
      "formaction",
      "onchange",
      "onsubmit",
      "onreset",
      "onselect",
      "onunload",
      "onabort",
      "onbeforeunload",
      "onhashchange",
      "oninput",
      "oninvalid",
      "onresize",
      "onscroll",
      "onwheel",
      "oncontextmenu",
      "ondblclick",
      "onmousedown",
      "onmouseup",
      "onmousemove",
      "onmouseenter",
      "onmouseleave",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "oncut",
      "oncopy",
      "onpaste",
      "ondrag",
      "ondragend",
      "ondragenter",
      "ondragleave",
      "ondragover",
      "ondragstart",
      "ondrop",
      "onanimationstart",
      "onanimationend",
      "onanimationiteration",
      "ontransitionend",
      "onmessage",
      "onopen",
      "onclose",
      "onpopstate",
      "onstorage",
      "onpointerdown",
      "onpointerup",
      "onpointermove",
      "onpointerover",
      "onpointerout",
      "onpointerenter",
      "onpointerleave",
      "onselectstart",
      "onshow",
    ];
    return dangerousAttrs.some((attr) => el.hasAttribute(attr));
  }

  // 🎯 ENHANCED INPUT TYPE DETECTION - Categorize wide range of input types
  function detectInputType(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();
    const role = element.getAttribute("role")?.toLowerCase();
    const className = element.className?.toLowerCase() || "";

    // Standard HTML input types
    if (tagName === "input") {
      return type || "text";
    }

    // Standard form elements
    if (
      [
        "textarea",
        "select",
        "button",
        "fieldset",
        "output",
        "datalist",
        "meter",
        "progress",
      ].includes(tagName)
    ) {
      return tagName;
    }

    // Interactive elements
    if (
      ["details", "summary", "label", "legend", "optgroup", "option"].includes(
        tagName
      )
    ) {
      return tagName;
    }

    // Media elements
    if (
      ["iframe", "embed", "object", "audio", "video", "canvas"].includes(
        tagName
      )
    ) {
      return `${tagName}-interactive`;
    }

    // Contenteditable
    if (element.hasAttribute("contenteditable")) {
      return "contenteditable";
    }

    // ARIA roles
    if (role) {
      const interactiveRoles = [
        "textbox",
        "searchbox",
        "combobox",
        "listbox",
        "button",
        "checkbox",
        "radio",
        "switch",
        "slider",
        "spinbutton",
        "menuitem",
        "tab",
      ];
      if (interactiveRoles.includes(role)) {
        return `aria-${role}`;
      }
    }

    // Class-based detection
    const classPatterns = {
      input: /\b(input|text-input|search-input|form-control|form-field)\b/,
      button: /\b(btn|button|clickable)\b/,
      select: /\b(dropdown|select|picker)\b/,
      toggle: /\b(toggle|switch|checkbox)\b/,
      slider: /\b(slider|range|rating)\b/,
      upload: /\b(file-upload|drag-drop|upload)\b/,
      interactive: /\b(interactive|selectable|editable|sortable|resizable)\b/,
    };

    for (const [pattern, regex] of Object.entries(classPatterns)) {
      if (regex.test(className)) {
        return `class-${pattern}`;
      }
    }

    // Data attribute detection
    const dataAttrs = [
      "data-input",
      "data-field",
      "data-control",
      "data-interactive",
      "data-editable",
    ];
    for (const attr of dataAttrs) {
      if (element.hasAttribute(attr)) {
        return `data-${attr.replace("data-", "")}`;
      }
    }

    // Event handler detection
    const eventAttrs = [
      "onclick",
      "onchange",
      "oninput",
      "onkeydown",
      "onkeyup",
      "onfocus",
      "onblur",
    ];
    for (const attr of eventAttrs) {
      if (element.hasAttribute(attr)) {
        return `event-${attr.replace("on", "")}`;
      }
    }

    // Framework patterns
    const frameworkPatterns = {
      vue: /\bv-/,
      angular: /\bmat-|ng-/,
      react: /\b__react/,
      antd: /\bant-/,
      element: /\bel-/,
    };

    for (const [framework, regex] of Object.entries(frameworkPatterns)) {
      if (regex.test(className)) {
        return `${framework}-component`;
      }
    }

    // Custom elements
    if (tagName.includes("-") || element.hasAttribute("is")) {
      return "custom-element";
    }

    // Accessibility indicators
    if (element.hasAttribute("tabindex") || element.hasAttribute("accesskey")) {
      return "accessible-interactive";
    }

    // Default fallback
    return tagName || "unknown";
  }

  window.extractInteractiveInputs = extractInteractiveInputs;

  // Map INTERACTIVE input-to-network relationships (AJAX, fetch, XHR)
  function mapInteractiveInputsNetwork() {
    if (!window.NETWORK_INPUT_TRIGGERS)
      window.outputUserInputsReport && outputUserInputsReport();
    const outs = window.NETWORK_INPUT_TRIGGERS
      ? window.NETWORK_INPUT_TRIGGERS.filter(
          (n) =>
            n.input &&
            (n.input.visibility === "visible" ||
              (n.input.type && n.input.type !== "hidden"))
        ).map((net, i) => {
          const details = {
            inputType: net.input && net.input.type,
            inputName: net.input && net.input.name,
            inputID: net.input && net.input.id,
            event: net.event,
            handlerShort: (net.handlerSource || "").slice(0, 140),
            fileLineHint: net.fileLineHint,
            networkType: net.networkType,
            time: net.networkTime,
          };
          console.log(
            `#${i + 1}: UserInput:[type=${details.inputType}, name=${
              details.inputName
            }, id=${details.inputID}]  →  Event: ${
              details.event
            }  →  Handler: [file: ${details.fileLineHint}]  →  Network: ${
              details.networkType
            }`
          );
          return details;
        })
      : [];
    if (!outs.length)
      console.log(
        "No interactive network input triggers - interact with the inputs and try again!"
      );
    return outs;
  }
  window.mapInteractiveInputsNetwork = mapInteractiveInputsNetwork;

  // NEW: Map all triggers, listeners, handlers for every input+event
  function mapInputListenersHandlers() {
    const all = [];
    inputMap.forEach((meta, el) => {
      const listeners = [];
      const events = [
        "input",
        "change",
        "click",
        "submit",
        "mouseover",
        "mouseout",
        "focus",
        "blur",
        "keydown",
        "keyup",
        "paste",
        "mousedown",
        "mouseup",
        "dblclick",
        "contextmenu",
        "touchstart",
        "touchend",
        "touchmove",
        "pointerdown",
        "pointerup",
        "pointerenter",
        "pointerleave",
        "drop",
        "dragover",
        "dragenter",
        "dragleave",
        "reset", // Form reset
        "keydown", // Key pressed
        "keyup", // Key released
        "keypress", // Key character input (deprecated but still used)
        "cut", // Content cut
        "copy", // Content copied
        "mouseenter", // Mouse enters element
        "mouseleave", // Mouse leaves element
        "wheel", // Mouse wheel scroll
        "touchstart", // Touch begins
        "touchend", // Touch ends
        "touchcancel", // Touch interrupted
        "pointermove", // Pointer moves
        "pointercancel", // Pointer canceled
        "dragstart", // Drag begins
        "dragend", // Drag ends
        "drop", // Dropped on target
        "animationstart", // CSS animation begins
        "animationend", // CSS animation ends
        "transitionend", // CSS transition ends
        "focusin", // Focus enters an element or its children
        "focusout", // Focus leaves an element or its children
        "reset", // Form reset
        "select", // Text selected
        "invalid", // Form element fails validation
        "beforeinput", // Before input is processed
        "compositionstart", // IME composition begins
        "compositionupdate", // IME composition updates
        "compositionend", // IME composition ends
        "wheel", // Mouse wheel scroll
        "scroll", // Element or document scrolls
        "resize", // Window or element resizes
        "animationstart", // CSS animation begins
        "animationend", // CSS animation ends
        "animationiteration", // CSS animation repeats
        "transitionstart", // CSS transition begins
        "transitionend", // CSS transition ends
        "transitioncancel", // CSS transition canceled
        "dragstart", // Drag begins
        "dragend", // Drag ends
        "drag", // Dragging in progress
        "pointermove", // Pointer moves
        "pointercancel", // Pointer canceled
        "pointerout", // Pointer leaves element
        "pointerover", // Pointer enters element
        "gotpointercapture", // Pointer captured
        "lostpointercapture", // Pointer released
        "mouseenter", // Mouse enters element (no bubbling)
        "mouseleave", // Mouse leaves element (no bubbling)
        "error", // Resource loading error
      ];
      events.forEach((eventName) => {
        // Check property handler
        if (typeof el["on" + eventName] === "function") {
          listeners.push({
            inputType: meta.type,
            inputName: meta.name,
            inputID: meta.id,
            trigger: eventName,
            listener: "property",
            handler: getHandlerSourceInfo(el["on" + eventName]),
            fileLine: getFunctionLocation(el["on" + eventName]),
          });
        }
        // Check addEventListener-registered handlers
        if (el._upe_eventHandlers) {
          for (const h of el._upe_eventHandlers) {
            if (h.event === eventName) {
              listeners.push({
                inputType: meta.type,
                inputName: meta.name,
                inputID: meta.id,
                trigger: eventName,
                listener: "addEventListener",
                handler: getHandlerSourceInfo(h.handler),
                fileLine: getFunctionLocation(h.handler),
              });
            }
          }
        }
      });
      if (listeners.length) all.push(...listeners);
    });
    if (all.length) {
      console.table(all);
      return all;
    } else {
      console.log("No triggers/listeners/handlers detected.");
      return [];
    }
  }
  window.mapInputListenersHandlers = mapInputListenersHandlers;

  // Enhanced version that captures more handler details
  function mapInputListenersHandlersEnhanced() {
    const all = [];
    inputMap.forEach((meta, el) => {
      const listeners = [];
      const events = [
        "input",
        "change",
        "click",
        "submit",
        "mouseover",
        "mouseout",
        "focus",
        "blur",
        "keydown",
        "keyup",
        "paste",
        "mousedown",
        "mouseup",
        "dblclick",
        "contextmenu",
        "touchstart",
        "touchend",
        "touchmove",
        "pointerdown",
        "pointerup",
        "pointerenter",
        "pointerleave",
        "drop",
        "dragover",
        "dragenter",
        "dragleave",
        "reset", // Form reset
        "keydown", // Key pressed
        "keyup", // Key released
        "keypress", // Key character input (deprecated but still used)
        "cut", // Content cut
        "copy", // Content copied
        "mouseenter", // Mouse enters element
        "mouseleave", // Mouse leaves element
        "wheel", // Mouse wheel scroll
        "touchstart", // Touch begins
        "touchend", // Touch ends
        "touchcancel", // Touch interrupted
        "pointermove", // Pointer moves
        "pointercancel", // Pointer canceled
        "dragstart", // Drag begins
        "dragend", // Drag ends
        "drop", // Dropped on target
        "animationstart", // CSS animation begins
        "animationend", // CSS animation ends
        "transitionend", // CSS transition ends
        "focusin", // Focus enters an element or its children
        "focusout", // Focus leaves an element or its children
        "reset", // Form reset
        "select", // Text selected
        "invalid", // Form element fails validation
        "beforeinput", // Before input is processed
        "compositionstart", // IME composition begins
        "compositionupdate", // IME composition updates
        "compositionend", // IME composition ends
        "wheel", // Mouse wheel scroll
        "scroll", // Element or document scrolls
        "resize", // Window or element resizes
        "animationstart", // CSS animation begins
        "animationend", // CSS animation ends
        "animationiteration", // CSS animation repeats
        "transitionstart", // CSS transition begins
        "transitionend", // CSS transition ends
        "transitioncancel", // CSS transition canceled
        "dragstart", // Drag begins
        "dragend", // Drag ends
        "drag", // Dragging in progress
        "pointermove", // Pointer moves
        "pointercancel", // Pointer canceled
        "pointerout", // Pointer leaves element
        "pointerover", // Pointer enters element
        "gotpointercapture", // Pointer captured
        "lostpointercapture", // Pointer released
        "mouseenter", // Mouse enters element (no bubbling)
        "mouseleave", // Mouse leaves element (no bubbling)
        "error", // Resource loading error
      ];

      events.forEach((eventName) => {
        // Check property handler (unwrapped)
        const propHandler = el["on" + eventName];
        if (typeof propHandler === "function") {
          const realHandler = propHandler._upe_real || propHandler;
          listeners.push({
            inputType: meta.type,
            inputName: meta.name,
            inputID: meta.id,
            trigger: eventName,
            listener: "property",
            handler: getHandlerSourceInfo(realHandler),
            fileLine: getFunctionLocation(realHandler),
          });
        }

        // Check inline attribute handlers
        const attrHandler =
          el.getAttribute && el.getAttribute("on" + eventName);
        if (attrHandler && typeof attrHandler === "string") {
          listeners.push({
            inputType: meta.type,
            inputName: meta.name,
            inputID: meta.id,
            trigger: eventName,
            listener: "inline-attr",
            handler:
              attrHandler.length > 100
                ? attrHandler.slice(0, 97) + "..."
                : attrHandler,
            fileLine: "inline-attribute",
          });
        }
      });

      // Check addEventListener-registered handlers
      if (el._upe_eventHandlers && el._upe_eventHandlers.length > 0) {
        el._upe_eventHandlers.forEach((h) => {
          listeners.push({
            inputType: meta.type,
            inputName: meta.name,
            inputID: meta.id,
            trigger: h.event,
            listener: h.method || "addEventListener",
            handler: getHandlerSourceInfo(h.handler),
            fileLine: getFunctionLocation(h.handler),
          });
        });
      }

      // Try to detect existing listeners using Chrome DevTools API
      if (typeof getEventListeners === "function") {
        try {
          const existingListeners = getEventListeners(el);
          for (const [eventType, listenerArray] of Object.entries(
            existingListeners
          )) {
            listenerArray.forEach((listenerObj) => {
              if (
                listenerObj.listener &&
                typeof listenerObj.listener === "function"
              ) {
                const handlerStr = getHandlerSourceInfo(listenerObj.listener);
                const isDuplicate = listeners.some(
                  (l) => l.trigger === eventType && l.handler === handlerStr
                );
                if (!isDuplicate) {
                  listeners.push({
                    inputType: meta.type,
                    inputName: meta.name,
                    inputID: meta.id,
                    trigger: eventType,
                    listener: "existing-addEventListener",
                    handler: handlerStr,
                    fileLine: getFunctionLocation(listenerObj.listener),
                  });
                }
              }
            });
          }
        } catch (e) {
          // getEventListeners not available
        }
      }

      if (listeners.length) all.push(...listeners);
    });

    if (all.length) {
      console.log(`Found ${all.length} input event handlers:`);
      console.table(all);
      return all;
    } else {
      console.log("No triggers/listeners/handlers detected.");
      return [];
    }
  }
  window.mapInputListenersHandlersEnhanced = mapInputListenersHandlersEnhanced;

  // Override the original function to use the enhanced version
  window.mapInputListenersHandlers = mapInputListenersHandlersEnhanced;

  // Additional function to capture ALL existing event listeners (more comprehensive)
  function captureAllExistingListeners() {
    console.log("=== Capturing ALL existing event listeners ===");
    const allListeners = [];

    // Get all elements
    const allElements = document.querySelectorAll("*");

    allElements.forEach((el) => {
      // Skip if not an interactive element
      if (
        !["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A", "FORM"].includes(
          el.tagName
        ) &&
        !el.hasAttribute("onclick") &&
        !el.hasAttribute("onchange") &&
        !el.hasAttribute("onsubmit") &&
        !el.hasAttribute("onfocus") &&
        !el.hasAttribute("onblur") &&
        !el.hasAttribute("onkeydown") &&
        !el.hasAttribute("onkeyup") &&
        !el.hasAttribute("onmousedown") &&
        !el.hasAttribute("onmouseup") &&
        !el.hasAttribute("onmouseover") &&
        !el.hasAttribute("onmouseout")
      ) {
        return;
      }

      const elementInfo = {
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        name: el.name || "",
        classes: el.className || "",
        listeners: [],
      };

      // Check for inline event handlers
      const events = [
        "click",
        "change",
        "submit",
        "focus",
        "blur",
        "keydown",
        "keyup",
        "mousedown",
        "mouseup",
        "mouseover",
        "mouseout",
        "input",
        "dblclick", // Double click
        "contextmenu", // Right-click menu
        "touchstart", // Touch begins
        "touchend", // Touch ends
        "touchmove", // Touch moves
        "pointerdown", // Pointer interaction begins
        "pointerup", // Pointer interaction ends
        "pointermove", // Pointer moves
        "pointerenter", // Pointer enters element
        "pointerleave", // Pointer leaves element
        "pointercancel", // Pointer canceled
        "dragstart", // Drag begins
        "drag", // Dragging in progress
        "dragenter", // Drag enters drop target
        "dragover", // Drag over drop target
        "dragleave", // Drag leaves drop target
        "drop", // Dropped on target
        "animationstart", // CSS animation begins
        "animationend", // CSS animation ends
        "animationiteration", // CSS animation repeats
        "transitionstart", // CSS transition begins
        "transitionend", // CSS transition ends
        "transitioncancel", // CSS transition canceled
        "wheel", // Mouse wheel scroll
        "scroll", // Element or window scrolls
        "resize", // Window or element resizes
        "select", // Text selection
        "paste", // Content pasted
        "cut", // Content cut
        "copy",
      ];
      events.forEach((eventName) => {
        const attrName = "on" + eventName;
        if (el.hasAttribute(attrName)) {
          elementInfo.listeners.push({
            event: eventName,
            type: "inline-attribute",
            handler: el.getAttribute(attrName),
          });
        }

        if (typeof el[attrName] === "function") {
          elementInfo.listeners.push({
            event: eventName,
            type: "property",
            handler: getHandlerSourceInfo(el[attrName]),
          });
        }
      });

      // Try Chrome DevTools getEventListeners
      if (typeof getEventListeners === "function") {
        try {
          const listeners = getEventListeners(el);
          for (const [eventType, listenerArray] of Object.entries(listeners)) {
            listenerArray.forEach((listenerObj) => {
              if (
                listenerObj.listener &&
                typeof listenerObj.listener === "function"
              ) {
                elementInfo.listeners.push({
                  event: eventType,
                  type: "addEventListener",
                  handler: getHandlerSourceInfo(listenerObj.listener),
                  useCapture: listenerObj.useCapture,
                  passive: listenerObj.passive,
                });
              }
            });
          }
        } catch (e) {
          // getEventListeners not available
        }
      }

      if (elementInfo.listeners.length > 0) {
        allListeners.push(elementInfo);
      }
    });

    console.log(`Found ${allListeners.length} elements with event listeners:`);
    console.table(
      allListeners.flatMap((el) =>
        el.listeners.map((listener) => ({
          tag: el.tag,
          id: el.id,
          name: el.name,
          event: listener.event,
          type: listener.type,
          handler: listener.handler ? listener.handler.slice(0, 100) : "",
          useCapture: listener.useCapture,
          passive: listener.passive,
        }))
      )
    );

    return allListeners;
  }
  window.captureAllExistingListeners = captureAllExistingListeners;

  // 🎯 CORE FUNCTIONALITY RUNNER - Run all main functions in sequence
  function runAllCoreFunctions() {
    console.log("🚀 === Running All Core Functions ===");

    console.log("\n1️⃣ Extracting Interactive Inputs...");
    const interactiveInputs = extractInteractiveInputs();

    console.log("\n2️⃣ Mapping Input Listeners & Handlers...");
    const handlersMap = mapInputListenersHandlers();

    console.log("\n3️⃣ Capturing All Existing Listeners...");
    const allListeners = captureAllExistingListeners();

    console.log("\n4️⃣ Mapping Interactive Network Triggers...");
    const networkMap = mapInteractiveInputsNetwork();

    console.log("\n5️⃣ Generating Full Report...");
    const fullReport = outputUserInputsReport();

    console.log("\n✅ === All Core Functions Completed ===");

    return {
      interactiveInputs,
      handlersMap,
      allListeners,
      networkMap,
      fullReport,
      summary: {
        totalInputs: inputMap.size,
        totalHandlers: handlersMap.length,
        totalListeners: allListeners.length,
        totalNetworkTriggers: networkMap.length,
      },
    };
  }
  window.runAllCoreFunctions = runAllCoreFunctions;

  // 🎯 ROBUST CORE FUNCTIONALITY RUNNER - Uses anti-false positive detection
  function runAllCoreFunctionsRobust() {
    console.log("🎯 === Running All Core Functions (Robust Mode) ===");

    console.log("\n1️⃣ Extracting Interactive Inputs...");
    const interactiveInputs = extractInteractiveInputs();

    console.log("\n2️⃣ Mapping Input Listeners & Handlers...");
    const handlersMap = mapInputListenersHandlers();

    console.log("\n3️⃣ Capturing All Existing Listeners...");
    const allListeners = captureAllExistingListeners();

    console.log("\n4️⃣ Mapping Interactive Network Triggers...");
    const networkMap = mapInteractiveInputsNetwork();

    console.log("\n5️⃣ Analyzing Input Statistics...");
    const statistics = analyzeInputStatistics();

    console.log("\n6️⃣ Robust Reflection Detection (Anti-False Positive)...");
    const robustReflections = detectInputReflectionsRobust();

    console.log("\n7️⃣ Generating Full Report...");
    const fullReport = outputUserInputsReport();

    console.log("\n✅ === All Robust Core Functions Completed ===");
    console.log(
      `🎯 Summary: ${statistics.total} inputs, ${robustReflections.totalReflections} meaningful reflections, ${robustReflections.highRiskInputs} high-risk`
    );

    return {
      interactiveInputs,
      handlersMap,
      allListeners,
      networkMap,
      statistics,
      robustReflections,
      fullReport,
      summary: {
        totalInputs: inputMap.size,
        totalHandlers: handlersMap.length,
        totalListeners: allListeners.length,
        totalNetworkTriggers: networkMap.length,
        meaningfulReflections: robustReflections.totalReflections,
        highRiskInputs: robustReflections.highRiskInputs,
        mediumRiskInputs: robustReflections.mediumRiskInputs,
      },
    };
  }
  window.runAllCoreFunctionsRobust = runAllCoreFunctionsRobust;

  // 📋 HELP FUNCTION - Show all available functions
  function showAvailableFunctions() {
    console.log(
      "🧠 === Universal User Input Extractor - Available Functions ==="
    );
    console.log("");
    console.log("🎯 CORE FUNCTIONS:");
    console.log(
      "• window.runAllCoreFunctions() - Run all core functions in sequence"
    );
    console.log(
      "• window.runAllCoreFunctionsRobust() - 🎯 Run all functions with anti-false positive detection"
    );
    console.log(
      "• window.extractInteractiveInputs() - Extract only visible interactive inputs"
    );
    console.log(
      "• window.extractAndWrapAllInputs() - Extract and wrap ALL inputs (runs automatically)"
    );
    console.log("");
    console.log("🔍 HANDLER & LISTENER MAPPING:");
    console.log(
      "• window.mapInputListenersHandlers() - Map all input event handlers (enhanced)"
    );
    console.log(
      "• window.captureAllExistingListeners() - Capture ALL existing event listeners"
    );
    console.log("");
    console.log("🌐 NETWORK ANALYSIS:");
    console.log(
      "• window.mapInteractiveInputsNetwork() - Map input-to-network relationships"
    );
    console.log("");
    console.log("📊 REPORTING & ANALYSIS:");
    console.log(
      "• window.outputUserInputsReport() - Generate comprehensive report"
    );
    console.log(
      "• window.detectInputReflections() - Detect input reflections in DOM"
    );
    console.log(
      "• window.detectInputReflectionsRobust() - 🎯 Robust reflection detection (anti-false positive)"
    );
    console.log(
      "• window.analyzeInputStatistics() - Analyze input statistics & breakdown"
    );
    console.log("");
    console.log("🆕 NEW ADVANCED FEATURES:");
    console.log(
      "• window.analyzeUserInputField(selector) - � Analyze specific input field"
    );
    console.log(
      "• window.startLiveInputMonitor() - 📝 Monitor input changes in real-time"
    );
    console.log(
      "• window.stopLiveInputMonitor() - ⏹️ Stop live input monitoring"
    );
    console.log(
      "• window.scanInputSecurity() - 🛡️ Comprehensive security scan"
    );
    console.log(
      "• window.analyzeInputPerformance() - ⚡ Performance impact analysis"
    );
    console.log("");
    console.log("�🛠️ UTILITY FUNCTIONS:");
    console.log(
      "• window.isDangerousAttr(attr) - Check if attribute is dangerous"
    );
    console.log("• window.showAvailableFunctions() - Show this help");
    console.log(
      "• window.showExecutionHistory() - Show function execution history"
    );
    console.log("• window.resetExecutionTracker() - Reset execution tracking");
    console.log("");
    console.log("🚨 DANGEROUS INPUT IDENTIFICATION:");
    console.log(
      "• window.analyzeDangerousInputs() - 🚨 Identify specific dangerous inputs with full context"
    );
    console.log(
      "• window.identifyCriticalHotspots() - 🔥 Focus on the most critical security issues"
    );
    console.log("");
    console.log("📋 PROFESSIONAL SECURITY REPORTING:");
    console.log(
      "• window.generateSecurityReport() - 📋 Generate comprehensive security report"
    );
    console.log(
      "• window.startLiveSecurityMonitor() - 🔴 Real-time security monitoring"
    );
    console.log(
      "• window.exportSecurityData('json'|'csv') - 📤 Export findings for external analysis"
    );
    console.log("");
    console.log("🎯 MASSIVE DATA ANALYSIS TOOLS:");
    console.log(
      "• window.analyzeReflectionSummary() - � Manage massive reflection results"
    );
    console.log("• window.quickSecurityScan() - ⚡ Fast security overview");
    console.log(
      "• window.filterReflections({dangerousOnly: true}) - 🔍 Filter reflection results"
    );
    console.log("");
    console.log(
      "�💡 QUICK START: Run window.runAllCoreFunctions() for complete analysis!"
    );
    console.log(
      "==============================================================="
    );
  }
  window.showAvailableFunctions = showAvailableFunctions;

  // 📊 INPUT STATISTICS ANALYZER
  function analyzeInputStatistics() {
    if (!executionTracker.track("analyzeInputStatistics")) return {};

    console.log("📊 === Input Statistics Analysis ===");

    const allInputs = Array.from(inputMap.values());
    const stats = {
      total: allInputs.length,
      byType: {},
      byVisibility: {},
      bySource: {},
      withHandlers: 0,
      withValues: 0,
      dangerous: 0,
    };

    allInputs.forEach((meta) => {
      // Count by type
      stats.byType[meta.type] = (stats.byType[meta.type] || 0) + 1;

      // Count by visibility
      stats.byVisibility[meta.visibility] =
        (stats.byVisibility[meta.visibility] || 0) + 1;

      // Count by source
      stats.bySource[meta.source] = (stats.bySource[meta.source] || 0) + 1;

      // Count inputs with values
      if (meta.value && meta.value.length > 0) {
        stats.withValues++;
      }

      // Count inputs with event handlers
      if (
        meta.ref &&
        meta.ref._upe_eventHandlers &&
        meta.ref._upe_eventHandlers.length > 0
      ) {
        stats.withHandlers++;
      }

      // Count dangerous inputs (with dangerous sinks OR dangerous attributes)
      if (meta.dangerousSink === "yes" || meta.hasDangerousAttrs) {
        stats.dangerous++;
      }
    });

    console.log(`\n📈 Overall Statistics:`);
    console.log(`   Total inputs found: ${stats.total}`);
    console.log(`   Inputs with values: ${stats.withValues}`);
    console.log(`   Inputs with handlers: ${stats.withHandlers}`);
    console.log(`   Dangerous inputs: ${stats.dangerous}`);

    console.log(`\n🏷️ By Type:`);
    console.table(
      Object.entries(stats.byType).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / stats.total) * 100).toFixed(1) + "%",
      }))
    );

    console.log(`\n👁️ By Visibility:`);
    console.table(
      Object.entries(stats.byVisibility).map(([visibility, count]) => ({
        visibility,
        count,
        percentage: ((count / stats.total) * 100).toFixed(1) + "%",
      }))
    );

    console.log(`\n📍 By Source:`);
    console.table(
      Object.entries(stats.bySource).map(([source, count]) => ({
        source,
        count,
        percentage: ((count / stats.total) * 100).toFixed(1) + "%",
      }))
    );

    return stats;
  }
  window.analyzeInputStatistics = analyzeInputStatistics;

  // 🎯 ROBUST INPUT REFLECTION DETECTOR (Anti-False Positive)
  function detectInputReflectionsRobust() {
    if (!executionTracker.track("detectInputReflectionsRobust")) return {};

    console.log(
      "🎯 === Robust Input Reflection Detection (Anti-False Positive) ==="
    );

    let totalReflections = 0;
    let dangerousReflections = 0;
    const reflectionSummary = [];
    const processedValues = new Set(); // Prevent duplicate processing

    inputMap.forEach((meta, el) => {
      let foundBody = false,
        foundHead = false,
        foundDomSink = false,
        foundDangerous = false;
      let domSinkList = [],
        dangerousList = [],
        reflections = [];

      // Enhanced validation to reduce false positives
      if (
        !meta.value ||
        typeof meta.value !== "string" ||
        meta.value.length < 3 || // Minimum 3 chars
        /^[\s\n\r\t]*$/.test(meta.value) || // Skip whitespace-only
        /^[0-9]+$/.test(meta.value) || // Skip pure numbers
        /^[a-zA-Z]$/.test(meta.value) || // Skip single letters
        ["on", "off", "yes", "no", "true", "false", "1", "0"].includes(
          meta.value.toLowerCase()
        ) // Skip common values
      ) {
        meta.bodyRef = meta.headRef = meta.domSink = meta.dangerousSink = "no";
        meta.reflectionDetail = "";
        return;
      }

      const searchValue = meta.value.trim();

      // Skip if already processed (prevent duplicates)
      if (processedValues.has(searchValue)) {
        return;
      }
      processedValues.add(searchValue);

      // Only check meaningful values (not common UI text)
      const commonUIText = [
        "submit",
        "cancel",
        "ok",
        "close",
        "save",
        "delete",
        "edit",
        "add",
        "remove",
        "search",
        "filter",
        "sort",
        "login",
        "logout",
        "register",
        "sign in",
        "sign up",
        "home",
        "back",
        "next",
        "previous",
        "continue",
        "finish",
        "start",
        "stop",
        "play",
        "pause",
        "reset",
        "clear",
        "refresh",
        "reload",
        "update",
        "upload",
        "download",
        "print",
        "share",
        "copy",
        "paste",
        "cut",
        "undo",
        "redo",
      ];

      if (commonUIText.includes(searchValue.toLowerCase())) {
        meta.bodyRef = meta.headRef = meta.domSink = meta.dangerousSink = "no";
        meta.reflectionDetail = "";
        return;
      }

      // Check body text content (but not in script tags or style tags)
      if (document.body) {
        const bodyTextNodes = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function (node) {
              // Skip script and style content
              const parent = node.parentElement;
              if (
                parent &&
                ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)
              ) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            },
          }
        );

        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent.includes(searchValue)) {
            foundBody = true;
            reflections.push("body-text");
            totalReflections++;
            break; // Only count once per input
          }
        }
      }

      // Check head text content (excluding scripts and styles)
      if (document.head) {
        const headText = Array.from(
          document.head.querySelectorAll(
            'title, meta[name="description"], meta[name="keywords"]'
          )
        )
          .map((el) => el.textContent || el.getAttribute("content") || "")
          .join(" ");

        if (headText.includes(searchValue)) {
          foundHead = true;
          reflections.push("head-meta");
          totalReflections++;
        }
      }

      // Check ONLY dangerous attributes (focused approach)
      const dangerousAttrs = [
        "onclick",
        "onload",
        "onerror",
        "onmouseover",
        "onfocus",
        "onblur",
        "src",
        "href",
        "action",
        "formaction",
        "onchange",
        "onsubmit",
        "onreset",
        "onselect",
        "onunload",
        "onabort",
        "onbeforeunload",
        "onhashchange",
        "oninput",
        "oninvalid",
        "onresize",
        "onscroll",
        "onwheel",
        "oncontextmenu",
        "ondblclick",
        "onmousedown",
        "onmouseup",
        "onmousemove",
        "onmouseenter",
        "onmouseleave",
        "onkeydown",
        "onkeypress",
        "onkeyup",
        "oncut",
        "oncopy",
        "onpaste",
        "ondrag",
        "ondragend",
        "ondragenter",
        "ondragleave",
        "ondragover",
        "ondragstart",
        "ondrop",
        "onanimationstart",
        "onanimationend",
        "onanimationiteration",
        "ontransitionend",
        "onmessage",
        "onopen",
        "onclose",
        "onpopstate",
        "onstorage",
        "onpointerdown",
        "onpointerup",
        "onpointermove",
        "onpointerover",
        "onpointerout",
        "onpointerenter",
        "onpointerleave",
        "onselectstart",
        "onshow",
      ];
      const elementsToCheck = [
        ...document.body.querySelectorAll("*"),
        ...document.head.querySelectorAll("*"),
      ];

      elementsToCheck.forEach((nd) => {
        Array.from(nd.attributes).forEach((attr) => {
          if (
            dangerousAttrs.includes(attr.name.toLowerCase()) &&
            attr.value &&
            attr.value.includes(searchValue)
          ) {
            const location = nd.closest("head") ? "head" : "body";
            const sinkName = `${location}-attr:${attr.name}`;

            if (!domSinkList.includes(sinkName)) {
              // Prevent duplicates
              domSinkList.push(sinkName);
              foundDomSink = true;
              totalReflections++;

              // All dangerous attributes are... dangerous
              foundDangerous = true;
              dangerousList.push(sinkName);
              dangerousReflections++;
            }
          }
        });
      });

      // Check script blocks (highly dangerous) - but only for non-common values
      if (searchValue.length > 5) {
        // Only check longer values in scripts
        [
          ...document.body.querySelectorAll("script"),
          ...document.head.querySelectorAll("script"),
        ].forEach((scr) => {
          if (scr.textContent && scr.textContent.includes(searchValue)) {
            const location = scr.closest("head") ? "head" : "body";
            const scriptSink = `${location}-script-block`;

            if (!dangerousList.includes(scriptSink)) {
              dangerousList.push(scriptSink);
              foundDomSink = foundDangerous = true;
              reflections.push(scriptSink);
              totalReflections++;
              dangerousReflections++;
            }
          }
        });
      }

      // Update metadata
      meta.bodyRef = foundBody ? "yes" : "no";
      meta.headRef = foundHead ? "yes" : "no";
      meta.domSink = foundDomSink ? "yes" : "no";
      meta.dangerousSink = foundDangerous ? "yes" : "no";
      meta.reflectionDetail = [
        ...new Set([...reflections, ...domSinkList, ...dangerousList]),
      ].join(", ");

      // Add to summary ONLY if meaningful reflections found
      if (foundDangerous || (foundDomSink && domSinkList.length > 0)) {
        reflectionSummary.push({
          inputType: meta.type,
          inputName: meta.name,
          inputID: meta.id,
          value: searchValue.slice(0, 30),
          bodyRef: meta.bodyRef,
          headRef: meta.headRef,
          domSink: meta.domSink,
          dangerousSink: meta.dangerousSink,
          details: meta.reflectionDetail,
          riskLevel: foundDangerous
            ? "🔴 HIGH"
            : foundDomSink
            ? "🟡 MEDIUM"
            : "🟢 LOW",
        });
      }
    });

    // Enhanced summary with risk assessment
    console.log(`📊 Robust Reflection Analysis Complete:`);
    console.log(`   🎯 Meaningful reflections: ${totalReflections}`);
    console.log(`   🚨 Dangerous reflections: ${dangerousReflections}`);
    console.log(
      `   📋 High-risk inputs: ${
        reflectionSummary.filter((r) => r.riskLevel === "🔴 HIGH").length
      }`
    );
    console.log(
      `   ⚠️ Medium-risk inputs: ${
        reflectionSummary.filter((r) => r.riskLevel === "🟡 MEDIUM").length
      }`
    );

    if (reflectionSummary.length > 0) {
      console.log("\n🎯 Significant DOM Reflections (Filtered):");
      console.table(
        reflectionSummary.sort((a, b) => {
          // Sort by risk level: HIGH -> MEDIUM -> LOW
          const riskOrder = { "🔴 HIGH": 3, "🟡 MEDIUM": 2, "🟢 LOW": 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        })
      );
    } else {
      console.log("✅ No significant input reflections detected");
    }

    return {
      totalReflections,
      dangerousReflections,
      inputsWithReflections: reflectionSummary.length,
      highRiskInputs: reflectionSummary.filter((r) => r.riskLevel === "🔴 HIGH")
        .length,
      mediumRiskInputs: reflectionSummary.filter(
        (r) => r.riskLevel === "🟡 MEDIUM"
      ).length,
      details: reflectionSummary,
    };
  }
  window.detectInputReflectionsRobust = detectInputReflectionsRobust;

  // 🔄 EXECUTION TRACKER - Prevent multiple runs and show execution history
  const executionTracker = {
    history: [],
    lastRun: {},

    track(functionName) {
      const now = Date.now();
      const lastExecution = this.lastRun[functionName];

      // Prevent rapid re-execution (within 1 second)
      if (lastExecution && now - lastExecution < 1000) {
        console.warn(
          `⚠️ ${functionName} was just executed ${
            now - lastExecution
          }ms ago. Skipping to prevent spam.`
        );
        return false;
      }

      this.lastRun[functionName] = now;
      this.history.push({
        function: functionName,
        timestamp: now,
        time: new Date().toLocaleTimeString(),
      });

      // Keep only last 20 executions
      if (this.history.length > 20) {
        this.history.shift();
      }

      return true;
    },

    showHistory() {
      console.log("📊 Function Execution History:");
      console.table(this.history.slice(-10)); // Show last 10
    },

    reset() {
      this.history = [];
      this.lastRun = {};
      console.log("🔄 Execution tracker reset");
    },
  };

  window.showExecutionHistory = () => executionTracker.showHistory();
  window.resetExecutionTracker = () => executionTracker.reset();

  // 🔍 ENHANCED INPUT REFLECTION DETECTOR
  function detectInputReflections() {
    console.log("🔍 === Detecting Input Reflections & DOM Sinks ===");

    let totalReflections = 0;
    let dangerousReflections = 0;
    const reflectionSummary = [];

    inputMap.forEach((meta, el) => {
      let foundBody = false,
        foundHead = false,
        foundDomSink = false,
        foundDangerous = false;
      let domSinkList = [],
        dangerousList = [],
        reflections = [];

      // Skip empty values
      if (
        !meta.value ||
        typeof meta.value !== "string" ||
        meta.value.length < 2
      ) {
        meta.bodyRef = meta.headRef = meta.domSink = meta.dangerousSink = "no";
        meta.reflectionDetail = "";
        return;
      }

      const searchValue = meta.value.trim();

      // Check body text content
      if (document.body && document.body.innerText.includes(searchValue)) {
        foundBody = true;
        reflections.push("body-text");
        totalReflections++;
      }

      // Check head text content
      if (document.head && document.head.innerText.includes(searchValue)) {
        foundHead = true;
        reflections.push("head-text");
        totalReflections++;
      }

      // Check all attributes in body
      document.body &&
        document.body.querySelectorAll("*").forEach((nd) => {
          Array.from(nd.attributes).forEach((attr) => {
            if (attr.value && attr.value.includes(searchValue)) {
              domSinkList.push(`body-attr:${attr.name}`);
              foundDomSink = true;
              totalReflections++;

              // Check if attribute is dangerous (suppress console output)
              const isDangerous =
                /^on[a-z]+$/.test(attr.name) ||
                [
                  "src",
                  "href",
                  "style",
                  "action",
                  "formaction",
                  "data",
                  "srcdoc",
                  "innerHTML",
                  "outerHTML",
                  "insertAdjacentHTML",
                  "poster",
                ].includes(attr.name.toLowerCase());

              if (isDangerous) {
                foundDangerous = true;
                dangerousList.push(`body-attr:${attr.name}`);
                dangerousReflections++;
              }
            }
          });
        });

      // Check all attributes in head
      document.head &&
        document.head.querySelectorAll("*").forEach((nd) => {
          Array.from(nd.attributes).forEach((attr) => {
            if (attr.value && attr.value.includes(searchValue)) {
              domSinkList.push(`head-attr:${attr.name}`);
              foundDomSink = true;
              totalReflections++;

              const isDangerous =
                /^on[a-z]+$/.test(attr.name) ||
                [
                  // Event handlers
                  "onclick",
                  "onload",
                  "onerror",
                  "onmouseover",
                  "onfocus",
                  "onblur",
                  "onchange",
                  "onsubmit",
                  "onreset",
                  "onkeydown",
                  "onkeyup",
                  "onkeypress",
                  "onmouseenter",
                  "onmouseleave",
                  "onmousedown",
                  "onmouseup",
                  "onwheel",
                  "oncontextmenu",
                  "ondrag",
                  "ondrop",
                  "oninput",
                  "onpaste",
                  "oncut",
                  "oncopy",

                  // Injection-prone attributes
                  "src",
                  "href",
                  "style",
                  "action",
                  "formaction",
                  "data",
                  "srcdoc",
                  "poster",
                  "background",
                  "codebase",
                  "classid",
                  "profile",
                  "usemap",
                  "longdesc",
                  "cite",

                  // DOM manipulation
                  "innerHTML",
                  "outerHTML",
                  "insertAdjacentHTML",
                  "documentURI",
                  "textContent",

                  // Media and embeds
                  "autoplay",
                  "controls",
                  "loop",
                  "muted",
                  "preload",
                  "target",
                  "sandbox",
                  "allow",
                  "allowfullscreen",
                  "frameborder",
                  "scrolling",

                  // Form and input
                  "autocomplete",
                  "enctype",
                  "method",
                  "novalidate",
                  "target",
                  "inputmode",
                  "dirname",
                  "form",
                  "formenctype",
                  "formmethod",
                  "formtarget",

                  // Meta and redirects
                  "http-equiv",
                  "content",
                  "refresh",
                  "charset",
                ].includes((attr.name || "").toLowerCase());

              if (isDangerous) {
                foundDangerous = true;
                dangerousList.push(`head-attr:${attr.name}`);
                dangerousReflections++;
              }
            }
          });
        });

      // Check script blocks (highly dangerous)
      document.body &&
        document.body.querySelectorAll("script").forEach((scr) => {
          if (scr.textContent && scr.textContent.includes(searchValue)) {
            dangerousList.push("body-script-block");
            foundDomSink = foundDangerous = true;
            reflections.push("body-script-block");
            totalReflections++;
            dangerousReflections++;
          }
        });

      document.head &&
        document.head.querySelectorAll("script").forEach((scr) => {
          if (scr.textContent && scr.textContent.includes(searchValue)) {
            dangerousList.push("head-script-block");
            foundDomSink = foundDangerous = true;
            reflections.push("head-script-block");
            totalReflections++;
            dangerousReflections++;
          }
        });

      // Update metadata
      meta.bodyRef = foundBody ? "yes" : "no";
      meta.headRef = foundHead ? "yes" : "no";
      meta.domSink = foundDomSink ? "yes" : "no";
      meta.dangerousSink = foundDangerous ? "yes" : "no";
      meta.reflectionDetail = [
        ...reflections,
        ...domSinkList,
        ...dangerousList,
      ].join(", ");

      // Add to summary if reflections found
      if (foundDomSink || foundBody || foundHead) {
        reflectionSummary.push({
          inputType: meta.type,
          inputName: meta.name,
          inputID: meta.id,
          value: searchValue.slice(0, 30),
          bodyRef: meta.bodyRef,
          headRef: meta.headRef,
          domSink: meta.domSink,
          dangerousSink: meta.dangerousSink,
          details: meta.reflectionDetail,
        });
      }
    });

    // Display summary
    console.log(`📊 Reflection Analysis Complete:`);
    console.log(`   Total reflections found: ${totalReflections}`);
    console.log(`   Dangerous reflections: ${dangerousReflections}`);
    console.log(`   Inputs with reflections: ${reflectionSummary.length}`);

    if (reflectionSummary.length > 0) {
      console.log("\n🚨 Inputs with DOM Reflections:");
      console.table(reflectionSummary);
    } else {
      console.log("✅ No input reflections detected in DOM");
    }

    return {
      totalReflections,
      dangerousReflections,
      inputsWithReflections: reflectionSummary.length,
      details: reflectionSummary,
    };
  }
  window.detectInputReflections = detectInputReflections;

  function outputUserInputsReport() {
    detectInputReflections();

    // Store network triggers for later access
    window.NETWORK_INPUT_TRIGGERS = networkTriggers;

    // Create comprehensive report
    const report = {
      inputCount: inputMap.size,
      inputs: Array.from(inputMap.values()),
      networkTriggers: networkTriggers,
      timestamp: new Date().toISOString(),
    };

    console.log("=== Universal User Input Extractor Report ===");
    console.log(`Total inputs found: ${inputMap.size}`);
    console.log(`Network triggers captured: ${networkTriggers.length}`);

    if (inputMap.size > 0) {
      console.log("\n--- Input Details ---");
      console.table(
        Array.from(inputMap.values()).map((meta) => ({
          type: meta.type,
          inputType: meta.inputType,
          name: meta.name,
          id: meta.id,
          visibility: meta.visibility,
          source: meta.source,
          bodyRef: meta.bodyRef || "unknown",
          headRef: meta.headRef || "unknown",
          domSink: meta.domSink || "unknown",
          dangerousSink: meta.dangerousSink || "unknown",
        }))
      );
    }

    if (networkTriggers.length > 0) {
      console.log("\n--- Network Triggers ---");
      console.table(
        networkTriggers.map((trigger) => ({
          inputType: trigger.input?.type,
          inputName: trigger.input?.name,
          inputID: trigger.input?.id,
          event: trigger.event,
          networkType: trigger.networkType,
          handlerMethod: trigger.handlerMethod,
          time: new Date(trigger.networkTime).toLocaleTimeString(),
        }))
      );
    }

    return report;
  }
  window.outputUserInputsReport = outputUserInputsReport;

  // 🆕 USER INPUT FIELD ANALYZER - Analyze specific user input fields
  function analyzeUserInputField(selector) {
    if (!selector) {
      console.log("Usage: analyzeUserInputField('input[name=\"username\"]')");
      console.log("Example: analyzeUserInputField('#email')");
      console.log("Example: analyzeUserInputField('.search-input')");
      return null;
    }

    const element = document.querySelector(selector);
    if (!element) {
      console.log(`❌ Element not found: ${selector}`);
      return null;
    }

    const meta = inputMap.get(element);
    if (!meta) {
      console.log(`⚠️ Element not tracked by extractor: ${selector}`);
      return null;
    }

    const analysis = {
      element: element,
      selector: selector,
      metadata: meta,
      security: {
        hasDangerousAttrs: meta.hasDangerousAttrs || false,
        dangerousSink: meta.dangerousSink || "no",
        reflectionDetail: meta.reflectionDetail || "",
        riskLevel:
          meta.dangerousSink === "yes"
            ? "🔴 HIGH"
            : meta.hasDangerousAttrs
            ? "🟡 MEDIUM"
            : "🟢 LOW",
      },
      handlers: element._upe_eventHandlers || [],
      currentValue: element.value || element.textContent || "",
      attributes: Array.from(element.attributes).map((attr) => ({
        name: attr.name,
        value: attr.value,
        dangerous: isDangerousAttr(attr.name),
      })),
    };

    console.log(`🔍 === User Input Field Analysis: ${selector} ===`);
    console.log(`🏷️ Type: ${meta.type} (${meta.inputType})`);
    console.log(`👁️ Visibility: ${meta.visibility}`);
    console.log(`🛡️ Security Risk: ${analysis.security.riskLevel}`);
    console.log(`🎯 Handlers: ${analysis.handlers.length}`);
    console.log(`📝 Current Value: "${analysis.currentValue.slice(0, 50)}"`);

    if (analysis.security.reflectionDetail) {
      console.log(`🚨 Reflections: ${analysis.security.reflectionDetail}`);
    }

    console.table(analysis.attributes);

    if (analysis.handlers.length > 0) {
      console.log("\n🎯 Event Handlers:");
      console.table(analysis.handlers);
    }

    return analysis;
  }
  window.analyzeUserInputField = analyzeUserInputField;

  // 🆕 LIVE INPUT MONITOR - Monitor user input changes in real-time
  function startLiveInputMonitor(options = {}) {
    const config = {
      logChanges: options.logChanges !== false,
      trackKeystrokes: options.trackKeystrokes || false,
      maxHistory: options.maxHistory || 100,
      ...options,
    };

    if (window.liveInputMonitor) {
      console.log(
        "⚠️ Live input monitor already running. Stop it first with stopLiveInputMonitor()"
      );
      return;
    }

    const monitor = {
      isActive: true,
      history: [],
      config: config,

      logChange(element, event, oldValue, newValue) {
        const meta = inputMap.get(element);
        const change = {
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString(),
          element: element,
          selector: element.id
            ? `#${element.id}`
            : element.name
            ? `[name="${element.name}"]`
            : element.tagName.toLowerCase(),
          type: meta?.type || element.tagName.toLowerCase(),
          event: event.type,
          oldValue: oldValue,
          newValue: newValue,
          dangerous: meta?.hasDangerousAttrs || false,
        };

        this.history.push(change);
        if (this.history.length > this.config.maxHistory) {
          this.history.shift();
        }

        if (this.config.logChanges) {
          console.log(
            `📝 Input Change: ${change.selector} | ${event.type} | "${oldValue}" → "${newValue}"`
          );
        }
      },
    };

    // Monitor all tracked inputs
    inputMap.forEach((meta, element) => {
      let lastValue = element.value || element.textContent || "";

      const events = config.trackKeystrokes
        ? ["input", "change", "keydown", "keyup", "paste", "focus", "blur"]
        : ["input", "change", "focus", "blur"];

      events.forEach((eventType) => {
        element.addEventListener(eventType, function (e) {
          if (!monitor.isActive) return;

          const currentValue = this.value || this.textContent || "";
          if (
            currentValue !== lastValue ||
            ["focus", "blur"].includes(eventType)
          ) {
            monitor.logChange(this, e, lastValue, currentValue);
            lastValue = currentValue;
          }
        });
      });
    });

    window.liveInputMonitor = monitor;
    console.log(
      `🎯 Live Input Monitor Started! Tracking ${inputMap.size} inputs`
    );
    console.log("📊 View history: window.liveInputMonitor.history");
    console.log("⏹️ Stop monitoring: stopLiveInputMonitor()");

    return monitor;
  }
  window.startLiveInputMonitor = startLiveInputMonitor;

  function stopLiveInputMonitor() {
    if (window.liveInputMonitor) {
      window.liveInputMonitor.isActive = false;
      console.log("⏹️ Live Input Monitor Stopped");
      console.log(
        `📊 Final History: ${window.liveInputMonitor.history.length} changes recorded`
      );
      delete window.liveInputMonitor;
    } else {
      console.log("⚠️ No active live input monitor found");
    }
  }
  window.stopLiveInputMonitor = stopLiveInputMonitor;

  // 🆕 INPUT SECURITY SCANNER - Comprehensive security analysis
  function scanInputSecurity() {
    if (!executionTracker.track("scanInputSecurity")) return {};

    console.log("🛡️ === Input Security Scanner ===");

    const securityReport = {
      totalInputs: inputMap.size,
      highRisk: [],
      mediumRisk: [],
      lowRisk: [],
      vulnerabilities: [],
      recommendations: [],
    };

    inputMap.forEach((meta, element) => {
      const analysis = {
        element: element,
        selector: element.id
          ? `#${element.id}`
          : element.name
          ? `[name="${element.name}"]`
          : element.tagName.toLowerCase(),
        type: meta.type,
        visibility: meta.visibility,
        hasDangerousAttrs: meta.hasDangerousAttrs || false,
        dangerousSink: meta.dangerousSink || "no",
        reflections: meta.reflectionDetail || "",
        handlers: element._upe_eventHandlers?.length || 0,
        value: (element.value || element.textContent || "").slice(0, 100),
        vulnerabilities: [],
      };

      // Check for specific vulnerabilities
      if (meta.dangerousSink === "yes") {
        analysis.vulnerabilities.push("DOM_SINK_REFLECTION");
      }
      if (meta.hasDangerousAttrs) {
        analysis.vulnerabilities.push("DANGEROUS_ATTRIBUTES");
      }
      if (
        element.type === "password" &&
        !element.form?.hasAttribute("autocomplete")
      ) {
        analysis.vulnerabilities.push("PASSWORD_AUTOCOMPLETE");
      }
      if (element.type === "hidden" && element.value) {
        analysis.vulnerabilities.push("HIDDEN_INPUT_WITH_VALUE");
      }
      if (meta.visibility === "hidden" && meta.dangerousSink === "yes") {
        analysis.vulnerabilities.push("HIDDEN_DANGEROUS_SINK");
      }

      // Risk classification
      if (
        analysis.vulnerabilities.length >= 2 ||
        meta.dangerousSink === "yes"
      ) {
        analysis.riskLevel = "🔴 HIGH";
        securityReport.highRisk.push(analysis);
      } else if (
        analysis.vulnerabilities.length === 1 ||
        meta.hasDangerousAttrs
      ) {
        analysis.riskLevel = "🟡 MEDIUM";
        securityReport.mediumRisk.push(analysis);
      } else {
        analysis.riskLevel = "🟢 LOW";
        securityReport.lowRisk.push(analysis);
      }

      securityReport.vulnerabilities.push(...analysis.vulnerabilities);
    });

    // Generate recommendations
    const vulnCounts = securityReport.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln] = (acc[vuln] || 0) + 1;
      return acc;
    }, {});

    Object.entries(vulnCounts).forEach(([vuln, count]) => {
      switch (vuln) {
        case "DOM_SINK_REFLECTION":
          securityReport.recommendations.push(
            `🚨 ${count} inputs reflect into dangerous DOM sinks - implement output encoding`
          );
          break;
        case "DANGEROUS_ATTRIBUTES":
          securityReport.recommendations.push(
            `⚠️ ${count} inputs have dangerous attributes - review event handlers`
          );
          break;
        case "PASSWORD_AUTOCOMPLETE":
          securityReport.recommendations.push(
            `🔐 ${count} password fields missing autocomplete attribute`
          );
          break;
        case "HIDDEN_INPUT_WITH_VALUE":
          securityReport.recommendations.push(
            `👁️ ${count} hidden inputs contain values - review for sensitive data`
          );
          break;
        case "HIDDEN_DANGEROUS_SINK":
          securityReport.recommendations.push(
            `🎯 ${count} hidden inputs with dangerous sinks - high priority review`
          );
          break;
      }
    });

    // Display results
    console.log(`📊 Security Scan Results:`);
    console.log(`   🔴 High Risk: ${securityReport.highRisk.length}`);
    console.log(`   🟡 Medium Risk: ${securityReport.mediumRisk.length}`);
    console.log(`   🟢 Low Risk: ${securityReport.lowRisk.length}`);

    if (securityReport.highRisk.length > 0) {
      console.log("\n🚨 HIGH RISK INPUTS:");
      console.table(
        securityReport.highRisk.map((item) => ({
          selector: item.selector,
          type: item.type,
          vulnerabilities: item.vulnerabilities.join(", "),
          reflections: item.reflections.slice(0, 50),
        }))
      );
    }

    if (securityReport.recommendations.length > 0) {
      console.log("\n💡 SECURITY RECOMMENDATIONS:");
      securityReport.recommendations.forEach((rec) => console.log(`   ${rec}`));
    }

    return securityReport;
  }
  window.scanInputSecurity = scanInputSecurity;

  // 🆕 INPUT PERFORMANCE ANALYZER - Analyze input performance impact
  function analyzeInputPerformance() {
    if (!executionTracker.track("analyzeInputPerformance")) return {};

    console.log("⚡ === Input Performance Analysis ===");

    const performanceReport = {
      totalInputs: inputMap.size,
      totalHandlers: 0,
      heavyInputs: [],
      recommendations: [],
    };

    inputMap.forEach((meta, element) => {
      const handlers = element._upe_eventHandlers || [];
      const handlerCount = handlers.length;
      performanceReport.totalHandlers += handlerCount;

      const analysis = {
        selector: element.id
          ? `#${element.id}`
          : element.name
          ? `[name="${element.name}"]`
          : element.tagName.toLowerCase(),
        type: meta.type,
        handlerCount: handlerCount,
        events: [...new Set(handlers.map((h) => h.event))],
        complexity:
          handlerCount > 5 ? "HIGH" : handlerCount > 2 ? "MEDIUM" : "LOW",
        impact: handlerCount * (meta.visibility === "visible" ? 2 : 1),
      };

      if (analysis.complexity !== "LOW") {
        performanceReport.heavyInputs.push(analysis);
      }
    });

    // Sort by impact
    performanceReport.heavyInputs.sort((a, b) => b.impact - a.impact);

    // Generate recommendations
    if (performanceReport.totalHandlers > 100) {
      performanceReport.recommendations.push(
        "🎯 Consider event delegation for better performance"
      );
    }
    if (performanceReport.heavyInputs.length > 10) {
      performanceReport.recommendations.push(
        "⚡ Review inputs with high handler counts"
      );
    }

    console.log(`📊 Performance Analysis:`);
    console.log(`   📝 Total Inputs: ${performanceReport.totalInputs}`);
    console.log(`   🎯 Total Handlers: ${performanceReport.totalHandlers}`);
    console.log(`   ⚡ Heavy Inputs: ${performanceReport.heavyInputs.length}`);

    if (performanceReport.heavyInputs.length > 0) {
      console.log("\n⚡ PERFORMANCE IMPACT INPUTS:");
      console.table(performanceReport.heavyInputs.slice(0, 10));
    }

    if (performanceReport.recommendations.length > 0) {
      console.log("\n💡 PERFORMANCE RECOMMENDATIONS:");
      performanceReport.recommendations.forEach((rec) =>
        console.log(`   ${rec}`)
      );
    }

    return performanceReport;
  }
  window.analyzeInputPerformance = analyzeInputPerformance;

  // 🆕 REFLECTION SUMMARY ANALYZER - Manage massive reflection results
  function analyzeReflectionSummary(options = {}) {
    if (!executionTracker.track("analyzeReflectionSummary")) return {};

    const config = {
      showTop: options.showTop || 20,
      minReflections: options.minReflections || 1,
      dangerousOnly: options.dangerousOnly || false,
      groupByType: options.groupByType !== false,
      ...options,
    };

    console.log("📊 === Reflection Summary Analysis ===");

    const summary = {
      totalInputs: inputMap.size,
      inputsWithReflections: 0,
      totalReflections: 0,
      dangerousReflections: 0,
      byType: {},
      byRisk: { high: [], medium: [], low: [] },
      topOffenders: [],
    };

    inputMap.forEach((meta, element) => {
      if (meta.reflectionDetail && meta.reflectionDetail.length > 0) {
        summary.inputsWithReflections++;

        const reflectionCount = meta.reflectionDetail.split(",").length;
        summary.totalReflections += reflectionCount;

        if (meta.dangerousSink === "yes") {
          summary.dangerousReflections += reflectionCount;
        }

        // Group by type
        const type = meta.inputType || meta.type;
        if (!summary.byType[type]) {
          summary.byType[type] = { count: 0, dangerous: 0, reflections: 0 };
        }
        summary.byType[type].count++;
        summary.byType[type].reflections += reflectionCount;
        if (meta.dangerousSink === "yes") {
          summary.byType[type].dangerous++;
        }

        // Risk classification
        const analysis = {
          selector: element.id
            ? `#${element.id}`
            : element.name
            ? `[name="${element.name}"]`
            : element.tagName.toLowerCase(),
          type: type,
          reflections: reflectionCount,
          dangerous: meta.dangerousSink === "yes",
          details: meta.reflectionDetail.slice(0, 100),
          value: (meta.value || "").slice(0, 30),
        };

        if (meta.dangerousSink === "yes" && reflectionCount > 10) {
          analysis.risk = "🔴 CRITICAL";
          summary.byRisk.high.push(analysis);
        } else if (meta.dangerousSink === "yes" || reflectionCount > 5) {
          analysis.risk = "🟡 MEDIUM";
          summary.byRisk.medium.push(analysis);
        } else {
          analysis.risk = "🟢 LOW";
          summary.byRisk.low.push(analysis);
        }

        summary.topOffenders.push(analysis);
      }
    });

    // Sort top offenders by reflection count
    summary.topOffenders.sort((a, b) => b.reflections - a.reflections);
    summary.byRisk.high.sort((a, b) => b.reflections - a.reflections);

    // Display results
    console.log(`📈 Summary Results:`);
    console.log(`   📝 Total Inputs: ${summary.totalInputs}`);
    console.log(
      `   🔍 Inputs with Reflections: ${summary.inputsWithReflections}`
    );
    console.log(
      `   📊 Total Reflections: ${summary.totalReflections.toLocaleString()}`
    );
    console.log(
      `   🚨 Dangerous Reflections: ${summary.dangerousReflections.toLocaleString()}`
    );

    if (config.groupByType) {
      console.log("\n📋 BY INPUT TYPE:");
      console.table(
        Object.entries(summary.byType).map(([type, data]) => ({
          type,
          inputs: data.count,
          reflections: data.reflections.toLocaleString(),
          dangerous: data.dangerous,
          avgReflections: Math.round(data.reflections / data.count),
        }))
      );
    }

    if (summary.byRisk.high.length > 0) {
      console.log(`\n🔴 CRITICAL RISK INPUTS (${summary.byRisk.high.length}):`);
      console.table(summary.byRisk.high.slice(0, config.showTop));
    }

    if (summary.topOffenders.length > 0) {
      console.log(`\n🎯 TOP REFLECTION OFFENDERS (Top ${config.showTop}):`);
      console.table(
        summary.topOffenders.slice(0, config.showTop).map((item) => ({
          selector: item.selector,
          type: item.type,
          reflections: item.reflections.toLocaleString(),
          risk: item.risk,
          value: item.value,
        }))
      );
    }

    return summary;
  }
  window.analyzeReflectionSummary = analyzeReflectionSummary;

  // 🆕 QUICK SECURITY SCAN - Fast overview of security issues
  function quickSecurityScan() {
    if (!executionTracker.track("quickSecurityScan")) return {};

    console.log("⚡ === Quick Security Scan ===");

    const scan = {
      criticalIssues: 0,
      highRiskInputs: 0,
      dangerousAttributes: 0,
      hiddenDangerousInputs: 0,
      reflectionHotspots: 0,
      recommendations: [],
    };

    inputMap.forEach((meta, element) => {
      // Critical issues
      if (meta.dangerousSink === "yes" && meta.visibility === "hidden") {
        scan.criticalIssues++;
        scan.hiddenDangerousInputs++;
      }

      if (meta.dangerousSink === "yes") {
        scan.highRiskInputs++;
      }

      if (meta.hasDangerousAttrs) {
        scan.dangerousAttributes++;
      }

      if (
        meta.reflectionDetail &&
        meta.reflectionDetail.split(",").length > 10
      ) {
        scan.reflectionHotspots++;
      }
    });

    // Generate quick recommendations
    if (scan.criticalIssues > 0) {
      scan.recommendations.push(
        `🚨 URGENT: ${scan.criticalIssues} hidden inputs with dangerous sinks - immediate review required`
      );
    }
    if (scan.highRiskInputs > 20) {
      scan.recommendations.push(
        `⚠️ HIGH: ${scan.highRiskInputs} inputs with dangerous reflections - implement output encoding`
      );
    }
    if (scan.reflectionHotspots > 5) {
      scan.recommendations.push(
        `🎯 FOCUS: ${scan.reflectionHotspots} inputs with 10+ reflections - priority review targets`
      );
    }

    console.log(`⚡ Quick Scan Results:`);
    console.log(`   🚨 Critical Issues: ${scan.criticalIssues}`);
    console.log(`   🔴 High Risk Inputs: ${scan.highRiskInputs}`);
    console.log(`   ⚠️ Dangerous Attributes: ${scan.dangerousAttributes}`);
    console.log(`   👁️ Hidden Dangerous: ${scan.hiddenDangerousInputs}`);
    console.log(`   🎯 Reflection Hotspots: ${scan.reflectionHotspots}`);

    if (scan.recommendations.length > 0) {
      console.log("\n💡 IMMEDIATE ACTIONS:");
      scan.recommendations.forEach((rec) => console.log(`   ${rec}`));
    }

    return scan;
  }
  window.quickSecurityScan = quickSecurityScan;

  // 🆕 FILTER REFLECTIONS - Filter massive reflection results
  function filterReflections(criteria = {}) {
    const config = {
      dangerousOnly: criteria.dangerousOnly || false,
      minReflections: criteria.minReflections || 1,
      maxResults: criteria.maxResults || 50,
      inputType: criteria.inputType || null,
      visibility: criteria.visibility || null, // 'visible' or 'hidden'
      ...criteria,
    };

    console.log("🔍 === Filtering Reflections ===");

    const filtered = [];

    inputMap.forEach((meta, element) => {
      if (!meta.reflectionDetail) return;

      const reflectionCount = meta.reflectionDetail.split(",").length;

      // Apply filters
      if (config.dangerousOnly && meta.dangerousSink !== "yes") return;
      if (reflectionCount < config.minReflections) return;
      if (config.inputType && meta.inputType !== config.inputType) return;
      if (config.visibility && meta.visibility !== config.visibility) return;

      filtered.push({
        selector: element.id
          ? `#${element.id}`
          : element.name
          ? `[name="${element.name}"]`
          : element.tagName.toLowerCase(),
        type: meta.inputType || meta.type,
        reflections: reflectionCount,
        dangerous: meta.dangerousSink === "yes",
        visibility: meta.visibility,
        value: (meta.value || "").slice(0, 50),
        details: meta.reflectionDetail.slice(0, 150),
      });
    });

    // Sort by reflection count
    filtered.sort((a, b) => b.reflections - a.reflections);

    const results = filtered.slice(0, config.maxResults);

    console.log(
      `🔍 Filter Results: ${results.length} of ${filtered.length} total matches`
    );
    console.table(results);

    return results;
  }
  window.filterReflections = filterReflections;

  // 🆕 DETAILED DANGEROUS INPUT ANALYZER - Identify specific dangerous inputs with full context
  function analyzeDangerousInputs(options = {}) {
    if (!executionTracker.track("analyzeDangerousInputs")) return {};

    const config = {
      showTop: options.showTop || 20,
      includeHidden: options.includeHidden !== false,
      minReflections: options.minReflections || 1,
      showDetails: options.showDetails !== false,
      ...options,
    };

    console.log("🚨 === Detailed Dangerous Input Analysis ===");

    const dangerousInputs = [];

    inputMap.forEach((meta, element) => {
      if (meta.dangerousSink === "yes") {
        const reflectionCount = meta.reflectionDetail
          ? meta.reflectionDetail.split(",").length
          : 0;

        if (reflectionCount >= config.minReflections) {
          const analysis = {
            // Element identification
            selector: element.id
              ? `#${element.id}`
              : element.name
              ? `[name="${element.name}"]`
              : element.className
              ? `.${element.className.split(" ")[0]}`
              : element.tagName.toLowerCase(),

            // Basic info
            tagName: element.tagName.toLowerCase(),
            type: meta.inputType || meta.type,
            id: element.id || "NO_ID",
            name: element.name || "NO_NAME",
            className: element.className || "NO_CLASS",

            // Security details
            reflections: reflectionCount,
            visibility: meta.visibility,
            value: (meta.value || "").slice(0, 100),

            // Dangerous attributes
            hasDangerousAttrs: meta.hasDangerousAttrs,
            hasClickHandler: meta.hasClickHandler,

            // Location context
            parentForm: element.form
              ? element.form.id || element.form.name || "UNNAMED_FORM"
              : "NO_FORM",

            // Reflection details (truncated for readability)
            reflectionTypes: meta.reflectionDetail
              ? [
                  ...new Set(
                    meta.reflectionDetail
                      .split(",")
                      .map((r) => r.trim().split("-")[0])
                  ),
                ].slice(0, 5)
              : [],

            // Risk assessment
            riskLevel:
              reflectionCount > 10000
                ? "🔴 CRITICAL"
                : reflectionCount > 1000
                ? "🟠 HIGH"
                : reflectionCount > 100
                ? "🟡 MEDIUM"
                : "🟢 LOW",

            // Element position (for manual inspection)
            xpath: generateXPath(element),

            // Full reflection detail (for deep analysis)
            fullReflectionDetail: config.showDetails
              ? meta.reflectionDetail
              : "Use showDetails:true to see full details",
          };

          dangerousInputs.push(analysis);
        }
      }
    });

    // Sort by reflection count (most dangerous first)
    dangerousInputs.sort((a, b) => b.reflections - a.reflections);

    // Filter by visibility if needed
    const filtered = config.includeHidden
      ? dangerousInputs
      : dangerousInputs.filter((input) => input.visibility === "visible");

    const results = filtered.slice(0, config.showTop);

    // Display summary
    console.log(`🚨 Dangerous Input Summary:`);
    console.log(`   📊 Total Dangerous Inputs: ${dangerousInputs.length}`);
    console.log(
      `   👁️ Visible Dangerous: ${
        dangerousInputs.filter((i) => i.visibility === "visible").length
      }`
    );
    console.log(
      `   🔒 Hidden Dangerous: ${
        dangerousInputs.filter((i) => i.visibility === "hidden").length
      }`
    );
    console.log(
      `   🔴 Critical Risk (10K+ reflections): ${
        dangerousInputs.filter((i) => i.reflections > 10000).length
      }`
    );
    console.log(
      `   🟠 High Risk (1K+ reflections): ${
        dangerousInputs.filter((i) => i.reflections > 1000).length
      }`
    );

    // Display top dangerous inputs
    console.log(`\n🎯 TOP ${results.length} MOST DANGEROUS INPUTS:`);
    console.table(
      results.map((input) => ({
        selector: input.selector,
        type: input.type,
        id: input.id,
        name: input.name,
        reflections: input.reflections.toLocaleString(),
        risk: input.riskLevel,
        visibility: input.visibility,
        form: input.parentForm,
        value: input.value.slice(0, 30),
      }))
    );

    if (config.showDetails && results.length > 0) {
      console.log(`\n🔍 DETAILED ANALYSIS OF TOP 5 MOST DANGEROUS:`);
      results.slice(0, 5).forEach((input, index) => {
        console.log(`\n--- #${index + 1}: ${input.selector} ---`);
        console.log(`🏷️ Type: ${input.type} | Tag: ${input.tagName}`);
        console.log(`🆔 ID: ${input.id} | Name: ${input.name}`);
        console.log(
          `📊 Reflections: ${input.reflections.toLocaleString()} | Risk: ${
            input.riskLevel
          }`
        );
        console.log(
          `👁️ Visibility: ${input.visibility} | Form: ${input.parentForm}`
        );
        console.log(`🎯 XPath: ${input.xpath}`);
        console.log(`🔍 Reflection Types: ${input.reflectionTypes.join(", ")}`);
        console.log(`💾 Value: "${input.value}"`);
        console.log(
          `⚠️ Dangerous Attrs: ${input.hasDangerousAttrs} | Click Handler: ${input.hasClickHandler}`
        );
      });
    }

    return {
      total: dangerousInputs.length,
      visible: dangerousInputs.filter((i) => i.visibility === "visible").length,
      hidden: dangerousInputs.filter((i) => i.visibility === "hidden").length,
      critical: dangerousInputs.filter((i) => i.reflections > 10000).length,
      high: dangerousInputs.filter((i) => i.reflections > 1000).length,
      results: results,
      all: dangerousInputs,
    };
  }
  window.analyzeDangerousInputs = analyzeDangerousInputs;

  // Helper function to generate XPath for element location
  function generateXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return "";

    if (element.id) return `//*[@id="${element.id}"]`;

    const parts = [];
    let current = element;

    while (
      current &&
      current.nodeType === Node.ELEMENT_NODE &&
      current !== document.body
    ) {
      let selector = current.tagName.toLowerCase();

      if (current.className) {
        selector += `[@class="${current.className}"]`;
      } else if (current.name) {
        selector += `[@name="${current.name}"]`;
      } else {
        // Get position among siblings
        const siblings = Array.from(current.parentNode?.children || []);
        const index = siblings.indexOf(current) + 1;
        selector += `[${index}]`;
      }

      parts.unshift(selector);
      current = current.parentNode;

      // Limit depth to avoid overly long XPaths
      if (parts.length > 6) break;
    }

    return "//" + parts.join("/");
  }

  // 🆕 CRITICAL SECURITY HOTSPOTS - Focus on the most dangerous findings
  function identifyCriticalHotspots(options = {}) {
    if (!executionTracker.track("identifyCriticalHotspots")) return {};

    console.log("🔥 === Critical Security Hotspots ===");

    const hotspots = [];

    inputMap.forEach((meta, element) => {
      const reflectionCount = meta.reflectionDetail
        ? meta.reflectionDetail.split(",").length
        : 0;

      // Define critical criteria
      const isCritical =
        (meta.dangerousSink === "yes" && reflectionCount > 5000) ||
        (meta.visibility === "hidden" && meta.dangerousSink === "yes") ||
        (meta.hasDangerousAttrs && reflectionCount > 1000) ||
        reflectionCount > 10000;

      if (isCritical) {
        hotspots.push({
          selector: element.id
            ? `#${element.id}`
            : element.name
            ? `[name="${element.name}"]`
            : element.tagName.toLowerCase(),
          type: meta.inputType || meta.type,
          reflections: reflectionCount,
          visibility: meta.visibility,
          dangerous: meta.dangerousSink === "yes",
          hasAttrs: meta.hasDangerousAttrs,
          reason: getCriticalReason(meta, reflectionCount),
          urgency: getUrgencyLevel(meta, reflectionCount),
          element: element,
        });
      }
    });

    // Sort by urgency and reflection count
    hotspots.sort((a, b) => {
      const urgencyOrder = { IMMEDIATE: 3, HIGH: 2, MEDIUM: 1 };
      return (
        (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0) ||
        b.reflections - a.reflections
      );
    });

    console.log(`🔥 Found ${hotspots.length} Critical Security Hotspots:`);
    console.table(
      hotspots.slice(0, 15).map((h) => ({
        selector: h.selector,
        type: h.type,
        reflections: h.reflections.toLocaleString(),
        visibility: h.visibility,
        urgency: h.urgency,
        reason: h.reason,
      }))
    );

    return hotspots;
  }
  window.identifyCriticalHotspots = identifyCriticalHotspots;

  function getCriticalReason(meta, reflectionCount) {
    const reasons = [];
    if (meta.visibility === "hidden" && meta.dangerousSink === "yes")
      reasons.push("Hidden+Dangerous");
    if (reflectionCount > 10000) reasons.push("Massive Reflections");
    if (meta.hasDangerousAttrs && reflectionCount > 1000)
      reasons.push("Dangerous Attrs");
    if (meta.dangerousSink === "yes" && reflectionCount > 5000)
      reasons.push("High Reflection Sink");
    return reasons.join(", ") || "Critical Threshold";
  }

  function getUrgencyLevel(meta, reflectionCount) {
    if (
      meta.visibility === "hidden" &&
      meta.dangerousSink === "yes" &&
      reflectionCount > 5000
    )
      return "IMMEDIATE";
    if (reflectionCount > 10000) return "IMMEDIATE";
    if (meta.dangerousSink === "yes" && reflectionCount > 5000) return "HIGH";
    return "MEDIUM";
  }

  // 🆕 COMPREHENSIVE SECURITY REPORT GENERATOR - Professional security report
  function generateSecurityReport(options = {}) {
    if (!executionTracker.track("generateSecurityReport")) return {};

    const config = {
      includeRecommendations: options.includeRecommendations !== false,
      includeXPaths: options.includeXPaths !== false,
      format: options.format || "console", // 'console' or 'json'
      ...options,
    };

    console.log("📋 === COMPREHENSIVE SECURITY REPORT ===");
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Analysis Target: ${window.location.href}`);
    console.log("=".repeat(60));

    // Executive Summary
    const summary = {
      totalInputs: inputMap.size,
      dangerousInputs: 0,
      criticalInputs: 0,
      hiddenDangerousInputs: 0,
      totalReflections: 0,
      dangerousReflections: 0,
    };

    const criticalFindings = [];
    const recommendations = [];

    inputMap.forEach((meta, element) => {
      const reflectionCount = meta.reflectionDetail
        ? meta.reflectionDetail.split(",").length
        : 0;
      summary.totalReflections += reflectionCount;

      if (meta.dangerousSink === "yes") {
        summary.dangerousInputs++;
        summary.dangerousReflections += reflectionCount;

        if (reflectionCount > 10000) {
          summary.criticalInputs++;
        }

        if (meta.visibility === "hidden") {
          summary.hiddenDangerousInputs++;
        }

        // Collect critical findings
        if (reflectionCount > 5000 || meta.visibility === "hidden") {
          criticalFindings.push({
            selector: element.id
              ? `#${element.id}`
              : element.tagName.toLowerCase(),
            type: meta.inputType || meta.type,
            reflections: reflectionCount,
            visibility: meta.visibility,
            risk: reflectionCount > 10000 ? "CRITICAL" : "HIGH",
            xpath: config.includeXPaths ? generateXPath(element) : "N/A",
          });
        }
      }
    });

    // Display Executive Summary
    console.log("\n🎯 EXECUTIVE SUMMARY:");
    console.log(
      `   📊 Total Interactive Elements: ${summary.totalInputs.toLocaleString()}`
    );
    console.log(
      `   🚨 Dangerous Elements: ${summary.dangerousInputs.toLocaleString()}`
    );
    console.log(
      `   🔴 Critical Risk Elements: ${summary.criticalInputs.toLocaleString()}`
    );
    console.log(
      `   👁️ Hidden Dangerous Elements: ${summary.hiddenDangerousInputs.toLocaleString()}`
    );
    console.log(
      `   📈 Total DOM Reflections: ${summary.totalReflections.toLocaleString()}`
    );
    console.log(
      `   ⚠️ Dangerous Reflections: ${summary.dangerousReflections.toLocaleString()}`
    );

    // Risk Assessment
    const riskLevel =
      summary.criticalInputs > 50
        ? "🔴 CRITICAL"
        : summary.criticalInputs > 20
        ? "🟠 HIGH"
        : summary.criticalInputs > 5
        ? "🟡 MEDIUM"
        : "🟢 LOW";

    console.log(`\n🎯 OVERALL RISK ASSESSMENT: ${riskLevel}`);

    // Critical Findings
    if (criticalFindings.length > 0) {
      console.log(
        `\n🚨 TOP ${Math.min(criticalFindings.length, 10)} CRITICAL FINDINGS:`
      );
      console.table(criticalFindings.slice(0, 10));
    }

    // Generate Recommendations
    if (config.includeRecommendations) {
      if (summary.hiddenDangerousInputs > 0) {
        recommendations.push(
          `🚨 URGENT: Review ${summary.hiddenDangerousInputs} hidden elements with dangerous DOM reflections`
        );
      }
      if (summary.criticalInputs > 10) {
        recommendations.push(
          `⚠️ HIGH: Implement Content Security Policy (CSP) to mitigate ${summary.criticalInputs} critical elements`
        );
      }
      if (summary.dangerousReflections > 100000) {
        recommendations.push(
          `🎯 MEDIUM: Consider input sanitization for ${summary.dangerousReflections.toLocaleString()} dangerous reflections`
        );
      }
      recommendations.push(
        `💡 INFO: Regular security audits recommended for ${summary.totalInputs} interactive elements`
      );

      console.log(`\n💡 SECURITY RECOMMENDATIONS:`);
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log(
      "📋 Report Complete - Use window.analyzeDangerousInputs() for detailed analysis"
    );

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      summary,
      criticalFindings,
      recommendations,
      riskLevel,
    };

    return config.format === "json" ? report : summary;
  }
  window.generateSecurityReport = generateSecurityReport;

  // 🆕 LIVE SECURITY MONITOR - Real-time security monitoring
  function startLiveSecurityMonitor(options = {}) {
    if (window._liveSecurityMonitor) {
      console.log(
        "⚠️ Live security monitor already running. Use stopLiveSecurityMonitor() first."
      );
      return;
    }

    const config = {
      interval: options.interval || 30000, // 30 seconds
      alertThreshold: options.alertThreshold || 5,
      trackNewInputs: options.trackNewInputs !== false,
      ...options,
    };

    console.log("🔴 === LIVE SECURITY MONITOR STARTED ===");
    console.log(`   ⏱️ Monitoring interval: ${config.interval / 1000}s`);
    console.log(
      `   🚨 Alert threshold: ${config.alertThreshold} new dangerous inputs`
    );

    let lastInputCount = inputMap.size;
    let lastDangerousCount = 0;

    // Count current dangerous inputs
    inputMap.forEach((meta) => {
      if (meta.dangerousSink === "yes") lastDangerousCount++;
    });

    window._liveSecurityMonitor = setInterval(() => {
      // Re-scan for new inputs
      if (config.trackNewInputs) {
        extractAndWrapAllInputs();
        detectInputReflections();
      }

      const currentInputCount = inputMap.size;
      let currentDangerousCount = 0;

      inputMap.forEach((meta) => {
        if (meta.dangerousSink === "yes") currentDangerousCount++;
      });

      const newInputs = currentInputCount - lastInputCount;
      const newDangerous = currentDangerousCount - lastDangerousCount;

      if (newInputs > 0 || newDangerous > 0) {
        console.log(
          `🔍 [${new Date().toLocaleTimeString()}] Security Monitor Update:`
        );
        console.log(`   📊 New inputs detected: ${newInputs}`);
        console.log(`   🚨 New dangerous inputs: ${newDangerous}`);

        if (newDangerous >= config.alertThreshold) {
          console.warn(
            `🚨 SECURITY ALERT: ${newDangerous} new dangerous inputs detected!`
          );
          console.log(`   💡 Run window.analyzeDangerousInputs() for details`);
        }
      }

      lastInputCount = currentInputCount;
      lastDangerousCount = currentDangerousCount;
    }, config.interval);

    console.log(
      "✅ Live security monitor active. Use stopLiveSecurityMonitor() to stop."
    );
    return window._liveSecurityMonitor;
  }
  window.startLiveSecurityMonitor = startLiveSecurityMonitor;

  function stopLiveSecurityMonitor() {
    if (window._liveSecurityMonitor) {
      clearInterval(window._liveSecurityMonitor);
      window._liveSecurityMonitor = null;
      console.log("🛑 Live security monitor stopped.");
      return true;
    }
    console.log("ℹ️ No live security monitor running.");
    return false;
  }
  window.stopLiveSecurityMonitor = stopLiveSecurityMonitor;

  // 🆕 EXPORT SECURITY DATA - Export findings for external analysis
  function exportSecurityData(format = "json") {
    if (!executionTracker.track("exportSecurityData")) return {};

    console.log(`📤 === EXPORTING SECURITY DATA (${format.toUpperCase()}) ===`);

    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        totalInputs: inputMap.size,
      },
      inputs: [],
      summary: {
        dangerous: 0,
        critical: 0,
        hidden: 0,
        totalReflections: 0,
      },
    };

    inputMap.forEach((meta, element) => {
      const reflectionCount = meta.reflectionDetail
        ? meta.reflectionDetail.split(",").length
        : 0;

      const inputData = {
        selector: element.id ? `#${element.id}` : element.tagName.toLowerCase(),
        tagName: element.tagName.toLowerCase(),
        type: meta.inputType || meta.type,
        id: element.id || null,
        name: element.name || null,
        className: element.className || null,
        value: meta.value || "",
        visibility: meta.visibility,
        reflections: reflectionCount,
        dangerous: meta.dangerousSink === "yes",
        hasDangerousAttrs: meta.hasDangerousAttrs,
        hasClickHandler: meta.hasClickHandler,
        reflectionDetail: meta.reflectionDetail || "",
        xpath: generateXPath(element),
      };

      exportData.inputs.push(inputData);
      exportData.summary.totalReflections += reflectionCount;

      if (meta.dangerousSink === "yes") {
        exportData.summary.dangerous++;
        if (reflectionCount > 10000) exportData.summary.critical++;
        if (meta.visibility === "hidden") exportData.summary.hidden++;
      }
    });

    if (format === "csv") {
      const csvHeaders =
        "Selector,Type,ID,Name,Reflections,Dangerous,Visibility,XPath\n";
      const csvData = exportData.inputs
        .map(
          (input) =>
            `"${input.selector}","${input.type}","${input.id || ""}","${
              input.name || ""
            }",${input.reflections},${input.dangerous},"${input.visibility}","${
              input.xpath
            }"`
        )
        .join("\n");

      const csvContent = csvHeaders + csvData;
      console.log("📊 CSV Data Ready:");
      console.log("Copy the following CSV data:");
      console.log("-".repeat(50));
      console.log(csvContent);
      return csvContent;
    }

    console.log(
      `📊 Exported ${
        exportData.inputs.length
      } inputs with ${exportData.summary.totalReflections.toLocaleString()} total reflections`
    );
    console.log("💾 JSON data ready for download or analysis");

    return exportData;
  }
  window.exportSecurityData = exportSecurityData;

  extractAndWrapAllInputs();
  detectInputReflections();
  outputUserInputsReport();
  // Enhanced observeDOMChange defined later will be called here after injection.
  if (typeof observeDOMChange === "function") {
    try {
      observeDOMChange();
    } catch {}
  }

  // ===== ENHANCEMENTS INJECTION START =====
  // 🔧 GLOBAL CONFIG & HELPERS
  window.UPE_CONFIG = Object.assign(
    {
      observerEnabled: true,
      throttleMs: 250,
      maskSensitive: true,
      maskFieldsPatterns: [
        /pass(word)?/i,
        /token/i,
        /secret/i,
        /apikey/i,
        /api-key/i,
        /ssn/i,
        /credit|card/i,
        /email/i,
      ],
      selectorProfile: "balanced",
      extraSelectors: [
        ".select2",
        ".select2-selection__rendered",
        ".ql-editor",
        ".tox-tinymce",
        ".tox-edit-area iframe",
        ".mce-content-body",
      ],
      excludeSelectors: [],
      overlay: { enabled: false },
      safeMode: false,
      monkeyPatch: {
        fetch: true,
        xhr: true,
        websocket: true,
        eventsource: true,
        timers: true,
      },
      stackTraceLimit: 50,
      captureStacks: false,
      useRobustReflection: false,
    },
    window.UPE_CONFIG || {}
  );
  try {
    if (typeof Error !== "undefined" && UPE_CONFIG.stackTraceLimit) {
      Error.stackTraceLimit = UPE_CONFIG.stackTraceLimit;
    }
  } catch {}
  try {
    (function () {
      const defaults = {
        observerEnabled: true,
        throttleMs: 250,
        maskSensitive: true,
        maskFieldsPatterns: [
          /pass(word)?/i,
          /token/i,
          /secret/i,
          /apikey/i,
          /api-key/i,
          /ssn/i,
          /credit|card/i,
          /email/i,
        ],
        selectorProfile: "balanced",
        extraSelectors: [
          ".select2",
          ".select2-selection__rendered",
          ".ql-editor",
          ".tox-tinymce",
          ".tox-edit-area iframe",
          ".mce-content-body",
        ],
        excludeSelectors: [],
        overlay: { enabled: false },
        safeMode: false,
        monkeyPatch: {
          fetch: true,
          xhr: true,
          websocket: true,
          eventsource: true,
          timers: true,
        },
        stackTraceLimit: 50,
        captureStacks: false,
        useRobustReflection: false,
      };
      let _cfg = Object.assign({}, defaults, window.UPE_CONFIG || {});
      if (!Array.isArray(_cfg.extraSelectors)) _cfg.extraSelectors = [];
      if (!_cfg.monkeyPatch)
        _cfg.monkeyPatch = {
          fetch: true,
          xhr: true,
          websocket: true,
          eventsource: true,
          timers: true,
        };
      try {
        Object.defineProperty(window, "UPE_CONFIG", {
          configurable: true,
          enumerable: true,
          get: function () {
            return _cfg;
          },
          set: function (v) {
            _cfg = Object.assign({}, defaults, v || {});
            if (!Array.isArray(_cfg.extraSelectors)) _cfg.extraSelectors = [];
            if (!_cfg.monkeyPatch)
              _cfg.monkeyPatch = {
                fetch: true,
                xhr: true,
                websocket: true,
                eventsource: true,
                timers: true,
              };
          },
        });
      } catch (e) {
        window.UPE_CONFIG = _cfg;
      }
      window.UPE_PLUGINS = window.UPE_PLUGINS || [];
    })();
  } catch {}
  try {
    (function () {
      const defaults = {
        observerEnabled: true,
        throttleMs: 250,
        maskSensitive: true,
        maskFieldsPatterns: [
          /pass(word)?/i,
          /token/i,
          /secret/i,
          /apikey/i,
          /api-key/i,
          /ssn/i,
          /credit|card/i,
          /email/i,
        ],
        selectorProfile: "balanced",
        extraSelectors: [
          ".select2",
          ".select2-selection__rendered",
          ".ql-editor",
          ".tox-tinymce",
          ".tox-edit-area iframe",
          ".mce-content-body",
        ],
        excludeSelectors: [],
        overlay: { enabled: false },
        safeMode: false,
        monkeyPatch: {
          fetch: true,
          xhr: true,
          websocket: true,
          eventsource: true,
          timers: true,
        },
        stackTraceLimit: 50,
        captureStacks: false,
        useRobustReflection: false,
      };
      let _cfg = Object.assign({}, defaults, window.UPE_CONFIG || {});
      if (!Array.isArray(_cfg.extraSelectors)) _cfg.extraSelectors = [];
      if (!_cfg.monkeyPatch)
        _cfg.monkeyPatch = {
          fetch: true,
          xhr: true,
          websocket: true,
          eventsource: true,
          timers: true,
        };
      try {
        Object.defineProperty(window, "UPE_CONFIG", {
          configurable: true,
          enumerable: true,
          get: function () {
            return _cfg;
          },
          set: function (v) {
            _cfg = Object.assign({}, defaults, v || {});
            if (!Array.isArray(_cfg.extraSelectors)) _cfg.extraSelectors = [];
            if (!_cfg.monkeyPatch)
              _cfg.monkeyPatch = {
                fetch: true,
                xhr: true,
                websocket: true,
                eventsource: true,
                timers: true,
              };
          },
        });
      } catch (e) {
        window.UPE_CONFIG = _cfg;
      }
      window.UPE_PLUGINS = window.UPE_PLUGINS || [];
    })();
  } catch {}

  function _upeThrottle(fn, wait) {
    let last = 0,
      timer = null;
    return function (...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        last = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }
  function _upeIsSensitive(el, meta) {
    try {
      if (!meta) meta = {};
      if (meta.inputType === "password") return true;
      const name = (meta.name || el?.name || "").toString();
      const id = (meta.id || el?.id || "").toString();
      const cls = (el?.className || "").toString();
      return UPE_CONFIG.maskFieldsPatterns.some(
        (re) => re.test(name) || re.test(id) || re.test(cls)
      );
    } catch {
      return false;
    }
  }
  function _upeMask(val) {
    if (val == null) return "";
    const s = String(val);
    if (s.length <= 4) return "****";
    return s.slice(0, 2) + "***" + s.slice(-2);
  }

  // 🌐 EXTENDED NETWORK MONITORING
  (function () {
    if (UPE_CONFIG.safeMode) return;
    try {
      if (
        UPE_CONFIG.monkeyPatch.websocket &&
        typeof window.WebSocket === "function"
      ) {
        const OrigWS = window.WebSocket;
        window.WebSocket = function (url, protocols) {
          const ws = new OrigWS(url, protocols);
          const ctx = CURRENT_HANDLER_CONTEXT
            ? Object.assign({}, CURRENT_HANDLER_CONTEXT)
            : null;
          const origSend = ws.send;
          try {
            ws.send = function (data) {
              if (CURRENT_HANDLER_CONTEXT) {
                CURRENT_HANDLER_CONTEXT.netCalls = (
                  CURRENT_HANDLER_CONTEXT.netCalls || []
                ).concat("websocket");
                networkTriggers.push(
                  Object.assign({}, CURRENT_HANDLER_CONTEXT, {
                    networkType: "websocket-send",
                    networkArgs: [url, data],
                    networkTime: Date.now(),
                  })
                );
              }
              return origSend.apply(this, arguments);
            };
          } catch {}
          try {
            ws.addEventListener("message", function (ev) {
              const context = CURRENT_HANDLER_CONTEXT || ctx || {};
              networkTriggers.push(
                Object.assign({}, context, {
                  networkType: "websocket-recv",
                  networkArgs: [url, ("" + ev.data).slice(0, 200)],
                  networkTime: Date.now(),
                })
              );
            });
          } catch {}
          return ws;
        };
      }
      if (
        UPE_CONFIG.monkeyPatch.eventsource &&
        typeof window.EventSource === "function"
      ) {
        const OrigES = window.EventSource;
        window.EventSource = function (url, config) {
          const es = new OrigES(url, config);
          try {
            es.addEventListener("message", function (e) {
              const context = CURRENT_HANDLER_CONTEXT || {};
              networkTriggers.push(
                Object.assign({}, context, {
                  networkType: "eventsource-message",
                  networkArgs: [
                    url,
                    e && e.data ? String(e.data).slice(0, 200) : "",
                  ],
                  networkTime: Date.now(),
                })
              );
            });
          } catch {}
          return es;
        };
      }
      if (UPE_CONFIG.monkeyPatch.timers) {
        const _st = window.setTimeout;
        window.setTimeout = function (cb, d, ...rest) {
          const ctx = CURRENT_HANDLER_CONTEXT;
          return _st(
            function () {
              const prev = CURRENT_HANDLER_CONTEXT;
              CURRENT_HANDLER_CONTEXT = ctx;
              try {
                return cb.apply(this, arguments);
              } finally {
                CURRENT_HANDLER_CONTEXT = prev;
              }
            },
            d,
            ...rest
          );
        };
      }
    } catch {}
  })();

  // 🛡️ CSP & SEVERITY
  function detectCSP() {
    try {
      const metas = Array.from(
        document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
      )
        .map((m) => m.getAttribute("content"))
        .filter(Boolean);
      return { present: metas.length > 0, policies: metas };
    } catch {
      return { present: false, policies: [] };
    }
  }
  function scoreSeverity(meta) {
    try {
      const reflections = meta.reflectionDetail
        ? meta.reflectionDetail.split(",").length
        : 0;
      let score = 0;
      if (meta.dangerousSink === "yes") score += 3;
      if (meta.hasDangerousAttrs) score += 2;
      if (reflections > 10000) score += 4;
      else if (reflections > 1000) score += 3;
      else if (reflections > 100) score += 2;
      else if (reflections > 0) score += 1;
      if (meta.visibility === "hidden") score += 1;
      return score >= 6
        ? "🔴 CRITICAL"
        : score >= 4
        ? "🟠 HIGH"
        : score >= 2
        ? "🟡 MEDIUM"
        : "🟢 LOW";
    } catch {
      return "🟢 LOW";
    }
  }

  // 🧩 PLUGINS & SELECTORS
  window.UPE_PLUGINS = window.UPE_PLUGINS || [];
  function applyPluginsToAll() {
    try {
      inputMap.forEach((meta, el) => {
        meta.pluginData = meta.pluginData || {};
        (UPE_PLUGINS || []).forEach((plugin, idx) => {
          try {
            const r = plugin && plugin(el, meta, { window, document });
            if (r && typeof r === "object")
              meta.pluginData[plugin.name || `plugin_${idx}`] = r;
          } catch {}
        });
      });
    } catch {}
  }
  function buildExtraSelectors() {
    const profile = (UPE_CONFIG.selectorProfile || "balanced").toLowerCase();
    const baseLite = [
      "input",
      "textarea",
      "select",
      "button",
      "[contenteditable]",
    ];
    const baseBalanced = baseLite.concat([
      "[role='textbox']",
      "[role='combobox']",
      "[onclick]",
      "[oninput]",
      ".form-control",
      ".btn",
    ]);
    const baseAggressive = baseBalanced.concat([
      "*[*|onclick]",
      "[tabindex]",
      "[draggable='true']",
    ]);
    const component = [
      ".select2",
      ".select2-selection__rendered",
      ".ql-editor",
      ".ql-container",
      ".tox-tinymce",
      ".mce-content-body",
      ".tox-edit-area iframe",
    ];
    let base = baseBalanced;
    if (profile === "lite") base = baseLite;
    else if (profile === "aggressive") base = baseAggressive;
    return Array.from(
      new Set(base.concat(component).concat(UPE_CONFIG.extraSelectors || []))
    );
  }
  function incrementalScanWithExtraSelectors(root) {
    try {
      const selectors = buildExtraSelectors();
      const scope = root && root.querySelectorAll ? root : document;
      selectors.forEach((sel) => {
        if ((UPE_CONFIG.excludeSelectors || []).some((ex) => sel.includes(ex)))
          return;
        try {
          scope.querySelectorAll(sel).forEach((el) => {
            if (!inputMap.has(el)) {
              extractAndWrapSingleInput(el, el.form || null);
            }
          });
        } catch {}
      });
    } catch {}
  }

  // 👀 LIVE DOM OBSERVER (THROTTLED)
  function observeDOMChange() {
    if (!UPE_CONFIG.observerEnabled) return false;
    if (window._upeObserver) return true;
    try {
      const handler = _upeThrottle(() => {
        incrementalScanWithExtraSelectors();
        if (UPE_CONFIG.useRobustReflection) {
          try {
            detectInputReflectionsRobust();
          } catch {}
        }
      }, UPE_CONFIG.throttleMs || 250);
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            handler();
            break;
          }
        }
      });
      mo.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
      window._upeObserver = mo;
      return true;
    } catch {
      return false;
    }
  }
  window.observeDOMChange = observeDOMChange;

  // 🖼️ MINIMAL OVERLAY
  function highlightDangerousInputs() {
    try {
      inputMap.forEach((meta, el) => {
        if (meta.dangerousSink === "yes" || meta.hasDangerousAttrs) {
          el.style.outline = "2px solid rgba(255,0,0,0.6)";
          el.style.outlineOffset = "1px";
        }
      });
    } catch {}
  }

  (function () {
    if (!window.captureInputSnapshot) {
      window.captureInputSnapshot = function () {
        const snapshot = {
          timestamp: new Date().toISOString(),
          inputs: [],
        };
        inputMap.forEach((meta, el) => {
          snapshot.inputs.push({
            selector: el.id
              ? `#${el.id}`
              : el.name
              ? `[name="${el.name}"]`
              : el.tagName.toLowerCase(),
            type: meta.type,
            inputType: meta.inputType,
            value: meta.value,
            visibility: meta.visibility,
            handlers: (el._upe_eventHandlers || []).map((h) => ({
              event: h.event,
              method: h.method,
              handlerSource: getHandlerSourceInfo(h.handler),
            })),
            directHandlers: Object.entries(el)
              .filter(
                ([key, val]) =>
                  key.startsWith("on") && typeof val === "function"
              )
              .map(([key, val]) => ({
                event: key.slice(2),
                handlerSource: getHandlerSourceInfo(val),
              })),
          });
        });
        console.log(
          `📸 Input Snapshot captured (${snapshot.inputs.length} inputs) at ${snapshot.timestamp}`
        );
        return snapshot;
      };
    }

    if (!window.compareInputSnapshots) {
      window.compareInputSnapshots = function (prevSnap, newSnap) {
        if (!prevSnap || !newSnap) {
          console.error("⛔ Both snapshots must be provided for comparison");
          return null;
        }

        const differences = [];

        const prevMap = new Map();
        prevSnap.inputs.forEach((i) => prevMap.set(i.selector, i));

        newSnap.inputs.forEach((newInput) => {
          const prevInput = prevMap.get(newInput.selector);
          if (!prevInput) {
            differences.push({
              selector: newInput.selector,
              changeType: "NEW_INPUT",
              details: newInput,
            });
            return;
          }

          const changes = [];

          if (prevInput.value !== newInput.value) {
            changes.push({
              field: "value",
              from: prevInput.value,
              to: newInput.value,
            });
          }

          // Compare handlers count or source
          const prevHandlers = (prevInput.handlers || []).map(
            (h) => h.handlerSource
          );
          const newHandlers = (newInput.handlers || []).map(
            (h) => h.handlerSource
          );
          if (
            prevHandlers.length !== newHandlers.length ||
            !newHandlers.every((h) => prevHandlers.includes(h))
          ) {
            changes.push({
              field: "handlers",
              from: prevHandlers,
              to: newHandlers,
            });
          }

          if (changes.length > 0) {
            differences.push({
              selector: newInput.selector,
              changeType: "MODIFIED",
              changes,
            });
          }
        });

        console.log(
          `🔍 Comparison done between snapshots: ${differences.length} differences detected`
        );
        if (differences.length > 0) {
          console.table(
            differences.map(({ selector, changeType }) => ({
              Selector: selector,
              Change: changeType,
            }))
          );
        } else {
          console.log("✅ No differences detected");
        }

        return differences;
      };
    }
  })();
  function ensureUPEOverlay() {
    if (!UPE_CONFIG.overlay || !UPE_CONFIG.overlay.enabled) return;
    if (document.getElementById("upe-overlay")) return;
    const panel = document.createElement("div");
    panel.id = "upe-overlay";
    panel.style.cssText =
      "position:fixed;z-index:2147483647;right:10px;bottom:10px;background:#111;color:#fff;padding:10px 12px;border-radius:8px;font:12px/1.4 sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.4);max-width:300px;";
    panel.innerHTML =
      '<div style="font-weight:700;margin-bottom:6px">UPE Panel</div><div id="upe-stats" style="margin-bottom:8px"></div><button id="upe-export" style="margin-right:6px">Export JSON</button><button id="upe-highlight">Highlight</button>';
    document.body.appendChild(panel);
    document.getElementById("upe-export").onclick = function () {
      console.log(window.exportSecurityData("json"));
    };
    document.getElementById("upe-highlight").onclick = function () {
      highlightDangerousInputs();
    };
    const statsEl = document.getElementById("upe-stats");
    const update = () => {
      try {
        statsEl.textContent = `Inputs: ${inputMap.size} | Triggers: ${networkTriggers.length}`;
      } catch {}
    };
    update();
    setInterval(update, 1000);
  }

  // 🔁 WRAP extractAndWrapAllInputs
  const _upe_orig_extract = extractAndWrapAllInputs;
  function _upe_extract_wrapper() {
    const res = _upe_orig_extract();
    try {
      incrementalScanWithExtraSelectors();
    } catch {}
    try {
      if (window.UPE_PLUGINS && UPE_PLUGINS.length) applyPluginsToAll();
    } catch {}
    try {
      ensureUPEOverlay();
      if (UPE_CONFIG.overlay.enabled) highlightDangerousInputs();
    } catch {}
    return res;
  }
  extractAndWrapAllInputs = _upe_extract_wrapper;
  window.extractAndWrapAllInputs = extractAndWrapAllInputs;

  // 📤 OVERRIDE EXPORT/REPORT WITH MASK & CSP
  function exportSecurityData(format = "json") {
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        totalInputs: inputMap.size,
        csp: detectCSP(),
      },
      inputs: [],
      summary: { dangerous: 0, critical: 0, hidden: 0, totalReflections: 0 },
    };
    inputMap.forEach((meta, element) => {
      const reflectionCount = meta.reflectionDetail
        ? meta.reflectionDetail.split(",").length
        : 0;
      const sensitive =
        UPE_CONFIG.maskSensitive && _upeIsSensitive(element, meta);
      const value = sensitive ? _upeMask(meta.value) : meta.value || "";
      const inputData = {
        selector: element.id ? `#${element.id}` : element.tagName.toLowerCase(),
        tagName: element.tagName.toLowerCase(),
        type: meta.inputType || meta.type,
        id: element.id || null,
        name: element.name || null,
        className: element.className || null,
        value,
        visibility: meta.visibility,
        reflections: reflectionCount,
        dangerous: meta.dangerousSink === "yes",
        hasDangerousAttrs: !!meta.hasDangerousAttrs,
        hasClickHandler: !!meta.hasClickHandler,
        reflectionDetail: meta.reflectionDetail || "",
        xpath: generateXPath(element),
        severity: scoreSeverity(meta),
      };
      exportData.inputs.push(inputData);
      exportData.summary.totalReflections += reflectionCount;
      if (meta.dangerousSink === "yes") {
        exportData.summary.dangerous++;
        if (reflectionCount > 10000) exportData.summary.critical++;
        if (meta.visibility === "hidden") exportData.summary.hidden++;
      }
    });
    if (format === "csv") {
      const csvHeaders =
        "Selector,Type,ID,Name,Reflections,Dangerous,Visibility,Severity,XPath\n";
      const csvData = exportData.inputs
        .map(
          (input) =>
            `"${input.selector}","${input.type}","${input.id || ""}","${
              input.name || ""
            }",${input.reflections},${input.dangerous},"${input.visibility}","${
              input.severity
            }","${input.xpath}"`
        )
        .join("\n");
      const csvContent = csvHeaders + csvData;
      console.log(csvContent);
      return csvContent;
    }
    console.log(
      `📊 Exported ${
        exportData.inputs.length
      } inputs with ${exportData.summary.totalReflections.toLocaleString()} total reflections`
    );
    return exportData;
  }
  window.exportSecurityData = exportSecurityData;

  function outputUserInputsReport() {
    try {
      UPE_CONFIG.useRobustReflection
        ? detectInputReflectionsRobust()
        : detectInputReflections();
    } catch {}
    window.NETWORK_INPUT_TRIGGERS = networkTriggers;
    const csp = detectCSP();
    const inputs = Array.from(inputMap.values()).map((meta) => {
      const masked = UPE_CONFIG.maskSensitive && _upeIsSensitive(null, meta);
      const clone = Object.assign({}, meta);
      if (masked) clone.value = _upeMask(meta.value);
      clone.severity = scoreSeverity(meta);
      return clone;
    });
    const report = {
      inputCount: inputMap.size,
      inputs,
      networkTriggers,
      timestamp: new Date().toISOString(),
      csp,
    };
    console.log("=== Universal User Input Extractor Report (Enhanced) ===");
    console.log(`Total inputs found: ${inputMap.size}`);
    console.log(`Network triggers captured: ${networkTriggers.length}`);
    console.log(
      `CSP present: ${csp.present} ${
        csp.present ? "" : "(consider adding CSP)"
      }`
    );
    if (inputMap.size > 0) {
      console.log("\n--- Input Details (masked if sensitive) ---");
      console.table(
        inputs.map((meta) => ({
          type: meta.type,
          inputType: meta.inputType,
          name: meta.name,
          id: meta.id,
          visibility: meta.visibility,
          severity: meta.severity,
        }))
      );
    }
    if (networkTriggers.length > 0) {
      console.log("\n--- Network Triggers (incl. WS/EventSource) ---");
      console.table(
        networkTriggers.map((trigger) => ({
          inputType: trigger.input?.type,
          inputName: trigger.input?.name,
          inputID: trigger.input?.id,
          event: trigger.event,
          networkType: trigger.networkType,
          handlerMethod: trigger.handlerMethod,
          time: new Date(
            trigger.networkTime || Date.now()
          ).toLocaleTimeString(),
        }))
      );
    }
    return report;
  }
  window.outputUserInputsReport = outputUserInputsReport;

  if (typeof observeDOMChange === "function") {
    try {
      observeDOMChange();
    } catch {}
  }
  // ===== ENHANCEMENTS INJECTION END =====
})();
