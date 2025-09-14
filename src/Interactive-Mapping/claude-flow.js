// ===========================================
// 🚀 INTERACTIVE WEB ANALYSIS TOOLKIT 🚀
// ===========================================
// Expert Level - 20+ Years Experience
// Your Ultimate Reverse Engineering Tool
// ===========================================

(function () {
  "use strict";

  // Global storage for results
  window.webAnalysisToolkit = {
    results: {},
    currentAnalysis: null,
    version: "5.0.0",
  };

  // ===========================================
  // 🎨 CONSOLE STYLING & BANNER
  // ===========================================

  const styles = {
    banner:
      "background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 8px; margin: 10px 0;",
    title:
      "color: #ff6b6b; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);",
    subtitle: "color: #4ecdc4; font-size: 14px; font-weight: bold;",
    success:
      "color: #27ae60; font-weight: bold; background: rgba(39, 174, 96, 0.1); padding: 5px; border-radius: 4px;",
    warning:
      "color: #f39c12; font-weight: bold; background: rgba(243, 156, 18, 0.1); padding: 5px; border-radius: 4px;",
    error:
      "color: #e74c3c; font-weight: bold; background: rgba(231, 76, 60, 0.1); padding: 5px; border-radius: 4px;",
    info: "color: #3498db; font-weight: bold; background: rgba(52, 152, 219, 0.1); padding: 5px; border-radius: 4px;",
    feature:
      "color: #9b59b6; font-weight: bold; padding: 3px 8px; background: rgba(155, 89, 182, 0.1); border-radius: 4px; margin: 2px;",
  };

  function showBanner() {
    console.clear();
    console.log("%c🚀 INTERACTIVE WEB ANALYSIS TOOLKIT 🚀", styles.banner);
    console.log("%cExpert Level Reverse Engineering Tool", styles.title);
    console.log("%cVersion 2.0.0 - Professional Edition", styles.subtitle);
    console.log("\n%c🔥 CORE FEATURES:", styles.info);
    console.log(
      "%c1. Element Extraction",
      styles.feature,
      "- All elements with attributes"
    );
    console.log(
      "%c2. Interactive Highlighting",
      styles.feature,
      "- Visual element identification"
    );
    console.log(
      "%c3. Event Trigger Detection",
      styles.feature,
      "- Inline event handlers"
    );
    console.log(
      "%c4. Event Listener Monitoring",
      styles.feature,
      "- addEventListener tracking"
    );
    console.log(
      "%c5. Event Handler Discovery",
      styles.feature,
      "- Property-based handlers"
    );
    console.log(
      "%c6. Stack Trace Analysis",
      styles.feature,
      "- Call stack monitoring"
    );
    console.log(
      "%c7. Network Request Interception",
      styles.feature,
      "- AJAX/Fetch tracking"
    );
    console.log(
      "%c8. JavaScript State Mapping",
      styles.feature,
      "- Variables & storage"
    );
    console.log(
      "%c9. DOM State Analysis",
      styles.feature,
      "- Complete DOM mapping"
    );
    console.log(
      "%c10. DOM Mutation Monitoring",
      styles.feature,
      "- Real-time change tracking"
    );
    console.log(
      "%c11. Form Analysis",
      styles.feature,
      "- Parameters & validation"
    );
    console.log(
      "%c12. Hidden Element Detection",
      styles.feature,
      "- Invisible element discovery"
    );
    console.log(
      "%c13. User Interaction Tracing",
      styles.feature,
      "- User flow analysis"
    );
    console.log(
      "\n%c💾 EXPORT OPTIONS: Console, JSON, HTML Report",
      styles.success
    );
    console.log("\n%c🎯 QUICK START:", styles.warning);
    console.log(
      "%cshowMenu()     %c- Show interactive menu",
      "font-weight: bold; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      "%crunAll()      %c- Execute all 13 analyses",
      "font-weight: bold; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      "%crunAnalysis(n)%c- Run specific analysis (1-13)",
      "font-weight: bold; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      "%cexportResults()%c- Export current results",
      "font-weight: bold; color: #e74c3c;",
      "color: #7f8c8d;"
    );
  }

  // ===========================================
  // 🎯 INTERACTIVE MENU SYSTEM
  // ===========================================

  function showMenu() {
    console.log("\n%c📋 INTERACTIVE ANALYSIS MENU", styles.banner);
    console.log(
      "%c┌─────────────────────────────────────────────────────────┐",
      "color: #3498db;"
    );
    console.log(
      "%c│  Choose Analysis Type:                                  │",
      "color: #3498db;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #3498db;"
    );
    console.log(
      "%c│  1️⃣  Element Extraction (Tag/ID/Class + Attributes)    │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  2️⃣  Interactive Element Highlighting                   │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  3️⃣  Event Trigger Detection                            │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  4️⃣  Event Listener Monitoring                          │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  5️⃣  Event Handler Discovery                            │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  6️⃣  Stack Trace Analysis                               │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  7️⃣  Network Request Interception                       │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  8️⃣  JavaScript State Mapping                           │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  9️⃣  DOM State Analysis                                  │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  🔟 DOM Mutation Monitoring                             │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  1️⃣1️⃣ Form Analysis & Parameter Mapping                 │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  1️⃣2️⃣ Hidden Element Detection                          │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  1️⃣3️⃣ User Interaction Flow Tracing                     │",
      "color: #2ecc71;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #3498db;"
    );
    console.log(
      "%c│  🚀 runAll()        - Execute ALL analyses              │",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  🎯 runAnalysis(n)  - Run specific analysis (1-13)     │",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  💾 exportResults() - Export data (JSON/HTML)          │",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  🔍 showResults()   - Display current results          │",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  🧹 clearResults()  - Clear all stored data            │",
      "color: #e74c3c;"
    );
    console.log(
      "%c└─────────────────────────────────────────────────────────┘",
      "color: #3498db;"
    );
    console.log("\n%c💡 Example: runAnalysis(1) or runAll()", styles.info);
  }

  // ===========================================
  // 🛠️ UTILITY FUNCTIONS
  // ===========================================

  function getXPath(element) {
    if (element.id !== "") {
      return 'id("' + element.id + '")';
    }
    if (element === document.body) {
      return element.tagName;
    }
    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element) {
        return (
          getXPath(element.parentNode) +
          "/" +
          element.tagName +
          "[" +
          (ix + 1) +
          "]"
        );
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }

  function getCssSelector(element) {
    if (element.id) {
      return "#" + element.id;
    }
    if (element.className) {
      return (
        element.tagName.toLowerCase() +
        "." +
        element.className.replace(/\s+/g, ".")
      );
    }
    return element.tagName.toLowerCase();
  }

  function logProgress(step, total, message) {
    const progress = Math.round((step / total) * 100);
    const progressBar =
      "█".repeat(Math.floor(progress / 5)) +
      "░".repeat(20 - Math.floor(progress / 5));
    console.log(`%c[${progressBar}] ${progress}% - ${message}`, styles.info);
  }

  // ===========================================
  // 🔍 ANALYSIS FUNCTIONS (1-13)
  // ===========================================

  const analysisModules = {
    // 1. Element Extraction
    elementExtraction: function () {
      console.log("%c🔍 Analysis 1: Element Extraction", styles.success);

      const results = {
        byTag: {},
        byId: {},
        byClass: {},
        allElements: [],
        summary: {},
      };

      const allElements = document.querySelectorAll("*");

      allElements.forEach((el, index) => {
        logProgress(
          index + 1,
          allElements.length,
          `Processing element ${index + 1}`
        );

        const elementData = {
          index: index,
          tagName: el.tagName.toLowerCase(),
          id: el.id || null,
          classes: Array.from(el.classList),
          attributes: {},
          textContent: el.textContent
            ? el.textContent.substring(0, 100) + "..."
            : "",
          innerHTML: el.innerHTML ? el.innerHTML.substring(0, 200) + "..." : "",
          xpath: getXPath(el),
          cssSelector: getCssSelector(el),
          boundingRect: el.getBoundingClientRect(),
          computedStyle: {
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            position: window.getComputedStyle(el).position,
          },
        };

        // Extract all attributes
        for (let attr of el.attributes) {
          elementData.attributes[attr.name] = attr.value;
        }

        // Organize by tag
        if (!results.byTag[el.tagName.toLowerCase()]) {
          results.byTag[el.tagName.toLowerCase()] = [];
        }
        results.byTag[el.tagName.toLowerCase()].push(elementData);

        // Organize by ID
        if (el.id) {
          results.byId[el.id] = elementData;
        }

        // Organize by class
        el.classList.forEach((className) => {
          if (!results.byClass[className]) {
            results.byClass[className] = [];
          }
          results.byClass[className].push(elementData);
        });

        results.allElements.push(elementData);
      });

      results.summary = {
        totalElements: results.allElements.length,
        uniqueTags: Object.keys(results.byTag).length,
        elementsWithId: Object.keys(results.byId).length,
        uniqueClasses: Object.keys(results.byClass).length,
      };

      console.log("%c✅ Element extraction complete!", styles.success);
      console.table(results.summary);
      return results;
    },

    // 2. Interactive Element Highlighting
    interactiveHighlighting: function () {
      console.log(
        "%c🎯 Analysis 2: Interactive Element Highlighting",
        styles.success
      );

      const interactiveSelectors = [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "form",
        "[onclick]",
        "[onchange]",
        "[onsubmit]",
        "[onkeyup]",
        "[onkeydown]",
        '[role="button"]',
        '[role="link"]',
        '[role="tab"]',
        '[role="menuitem"]',
        "[contenteditable]",
        "[draggable]",
        "[tabindex]",
        ".clickable",
        ".btn",
        ".button",
        ".link",
      ];

      const interactiveElements = [];
      let elementCount = 0;

      interactiveSelectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((el) => {
            if (!interactiveElements.find((item) => item.element === el)) {
              elementCount++;

              // Highlight with colored border and label
              el.style.outline = "3px solid #ff6b6b";
              el.style.outlineOffset = "2px";
              el.style.position = "relative";

              // Add interactive label
              const label = document.createElement("div");
              label.textContent = `Interactive #${elementCount}`;
              label.style.cssText = `
                                position: absolute;
                                top: -25px;
                                left: 0;
                                background: #ff6b6b;
                                color: white;
                                padding: 2px 8px;
                                font-size: 10px;
                                border-radius: 3px;
                                z-index: 10000;
                                pointer-events: none;
                            `;

              if (el.parentNode) {
                el.parentNode.insertBefore(label, el);
              }

              el.setAttribute("data-interactive-element", elementCount);

              const elementData = {
                element: el,
                id: elementCount,
                tag: el.tagName,
                elementId: el.id,
                classes: el.className,
                type: el.type || "N/A",
                role: el.getAttribute("role") || "N/A",
                xpath: getXPath(el),
                selector: selector,
                interactionMethods: [],
              };

              // Detect interaction methods
              if (el.onclick) elementData.interactionMethods.push("onclick");
              if (el.addEventListener)
                elementData.interactionMethods.push("addEventListener");
              if (el.href) elementData.interactionMethods.push("navigation");
              if (el.type === "submit")
                elementData.interactionMethods.push("form-submit");

              interactiveElements.push(elementData);

              logProgress(
                elementCount,
                50,
                `Highlighting interactive element ${elementCount}`
              );
            }
          });
        } catch (e) {
          console.warn("%cSelector failed: " + selector, styles.warning, e);
        }
      });

      console.log(
        `%c✅ Found and highlighted ${interactiveElements.length} interactive elements!`,
        styles.success
      );
      return {
        elements: interactiveElements,
        count: interactiveElements.length,
      };
    },

    // 3. Event Trigger Detection
    eventTriggerDetection: function () {
      console.log("%c⚡ Analysis 3: Event Trigger Detection", styles.success);

      const eventTriggers = [];
      const allElements = document.querySelectorAll("*");

      const eventAttributes = [
        "onclick",
        "onchange",
        "onsubmit",
        "onload",
        "onmouseover",
        "onmouseout",
        "onkeyup",
        "onkeydown",
        "onfocus",
        "onblur",
        "ondblclick",
        "onmousedown",
        "onmouseup",
        "onscroll",
        "onresize",
        "onerror",
        "onabort",
        "oncanplay",
        "onended",
      ];

      allElements.forEach((el, index) => {
        const triggers = {};

        eventAttributes.forEach((attr) => {
          if (el.hasAttribute(attr)) {
            triggers[attr] = {
              code: el.getAttribute(attr),
              length: el.getAttribute(attr).length,
              complexity: el.getAttribute(attr).split(";").length,
            };
          }
        });

        if (Object.keys(triggers).length > 0) {
          eventTriggers.push({
            element: el,
            tagName: el.tagName,
            id: el.id,
            classes: el.className,
            triggers: triggers,
            xpath: getXPath(el),
            triggerCount: Object.keys(triggers).length,
          });
        }

        if (index % 100 === 0) {
          logProgress(index + 1, allElements.length, `Scanning for triggers`);
        }
      });

      console.log(
        `%c✅ Found ${eventTriggers.length} elements with inline event triggers!`,
        styles.success
      );
      console.table(eventTriggers);
      return { triggers: eventTriggers, count: eventTriggers.length };
    },

    // 4. Event Listener Monitoring
    eventListenerMonitoring: function () {
      console.log("%c👂 Analysis 4: Event Listener Monitoring", styles.success);

      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener =
        EventTarget.prototype.removeEventListener;
      const eventListeners = [];

      EventTarget.prototype.addEventListener = function (
        type,
        listener,
        options
      ) {
        const listenerData = {
          element: this,
          type: type,
          listener: listener.toString().substring(0, 200) + "...",
          options: options,
          tagName: this.tagName || "Window/Document",
          id: this.id || "N/A",
          className: this.className || "N/A",
          timestamp: new Date().toISOString(),
          stack: new Error().stack.split("\n").slice(1, 4),
        };

        eventListeners.push(listenerData);

        console.log("%cEvent Listener Added:", styles.info, {
          type: type,
          element: this.tagName || "Window/Document",
          id: this.id || "N/A",
        });

        return originalAddEventListener.call(this, type, listener, options);
      };

      EventTarget.prototype.removeEventListener = function (
        type,
        listener,
        options
      ) {
        console.log("%cEvent Listener Removed:", styles.warning, {
          type: type,
          element: this.tagName || "Window/Document",
        });

        return originalRemoveEventListener.call(this, type, listener, options);
      };

      console.log("%c✅ Event listener monitoring activated!", styles.success);
      console.log(
        "%cListeners will be tracked as they are added...",
        styles.info
      );

      return {
        listeners: eventListeners,
        monitoring: true,
        getListeners: () => eventListeners,
      };
    },

    // 5. Event Handler Discovery
    eventHandlerDiscovery: function () {
      console.log("%c🔍 Analysis 5: Event Handler Discovery", styles.success);

      const handlers = [];
      const allElements = document.querySelectorAll("*");

      allElements.forEach((el, index) => {
        const elementHandlers = {};

        // Check for event handler properties
        for (let prop in el) {
          if (prop.startsWith("on") && typeof el[prop] === "function") {
            elementHandlers[prop] = {
              code: el[prop].toString(),
              name: el[prop].name,
              length: el[prop].toString().length,
            };
          }
        }

        if (Object.keys(elementHandlers).length > 0) {
          handlers.push({
            element: el,
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            handlers: elementHandlers,
            xpath: getXPath(el),
            handlerCount: Object.keys(elementHandlers).length,
          });
        }

        if (index % 100 === 0) {
          logProgress(
            index + 1,
            allElements.length,
            `Discovering event handlers`
          );
        }
      });

      console.log(
        `%c✅ Found ${handlers.length} elements with event handler properties!`,
        styles.success
      );
      console.table(handlers);
      return { handlers: handlers, count: handlers.length };
    },

    // 6. Stack Trace Analysis
    stackTraceAnalysis: function () {
      console.log("%c📚 Analysis 6: Stack Trace Analysis", styles.success);

      const stackTraces = [];
      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;
      const originalRequestAnimationFrame = window.requestAnimationFrame;

      function captureStack(functionName) {
        const stack = new Error().stack;
        const stackData = {
          functionName: functionName,
          timestamp: new Date().toISOString(),
          stack: stack.split("\n"),
          location: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100),
        };
        stackTraces.push(stackData);
        return stackData;
      }

      // Monitor setTimeout
      window.setTimeout = function (fn, delay) {
        const stack = captureStack("setTimeout");
        console.log("%csetTimeout called:", styles.info, {
          delay,
          stack: stack.stack.slice(0, 3),
        });
        return originalSetTimeout.call(
          window,
          function () {
            captureStack("setTimeout-callback");
            return fn.apply(this, arguments);
          },
          delay
        );
      };

      // Monitor setInterval
      window.setInterval = function (fn, delay) {
        const stack = captureStack("setInterval");
        console.log("%csetInterval called:", styles.info, {
          delay,
          stack: stack.stack.slice(0, 3),
        });
        return originalSetInterval.call(
          window,
          function () {
            captureStack("setInterval-callback");
            return fn.apply(this, arguments);
          },
          delay
        );
      };

      // Monitor requestAnimationFrame
      window.requestAnimationFrame = function (fn) {
        const stack = captureStack("requestAnimationFrame");
        console.log("%crequestAnimationFrame called:", styles.info, {
          stack: stack.stack.slice(0, 3),
        });
        return originalRequestAnimationFrame.call(window, function () {
          captureStack("requestAnimationFrame-callback");
          return fn.apply(this, arguments);
        });
      };

      console.log("%c✅ Stack trace monitoring activated!", styles.success);
      return {
        traces: stackTraces,
        monitoring: true,
        getTraces: () => stackTraces,
      };
    },

    // 7. Network Request Interception
    networkRequestInterception: function () {
      console.log(
        "%c🌐 Analysis 7: Network Request Interception",
        styles.success
      );

      const networkRequests = [];

      // Monitor XMLHttpRequest
      const originalXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;

        let requestData = {
          type: "XMLHttpRequest",
          method: "",
          url: "",
          headers: {},
          data: null,
          response: null,
          status: null,
          timestamp: null,
          duration: null,
          stack: new Error().stack.split("\n").slice(1, 4),
        };

        xhr.open = function (method, url, async, user, password) {
          requestData.method = method;
          requestData.url = url;
          requestData.timestamp = new Date().toISOString();

          console.log("%c🌐 XHR Request:", styles.info, method, url);
          return originalOpen.apply(this, arguments);
        };

        xhr.send = function (data) {
          const startTime = Date.now();
          requestData.data = data;

          xhr.addEventListener("load", function () {
            requestData.response = xhr.responseText.substring(0, 500) + "...";
            requestData.status = xhr.status;
            requestData.duration = Date.now() - startTime;
            networkRequests.push({ ...requestData });

            console.log("%c✅ XHR Complete:", styles.success, {
              url: requestData.url,
              status: requestData.status,
              duration: requestData.duration + "ms",
            });
          });

          xhr.addEventListener("error", function () {
            requestData.status = "error";
            requestData.duration = Date.now() - startTime;
            networkRequests.push({ ...requestData });

            console.log("%c❌ XHR Error:", styles.error, requestData.url);
          });

          return originalSend.apply(this, arguments);
        };

        return xhr;
      };

      // Monitor Fetch API
      const originalFetch = window.fetch;
      window.fetch = function (url, options = {}) {
        const startTime = Date.now();
        const requestData = {
          type: "Fetch",
          url: url,
          method: options.method || "GET",
          headers: options.headers,
          body: options.body,
          timestamp: new Date().toISOString(),
          stack: new Error().stack.split("\n").slice(1, 4),
        };

        console.log(
          "%c🌐 Fetch Request:",
          styles.info,
          requestData.method,
          url
        );

        return originalFetch
          .apply(this, arguments)
          .then((response) => {
            requestData.status = response.status;
            requestData.duration = Date.now() - startTime;
            networkRequests.push(requestData);

            console.log("%c✅ Fetch Complete:", styles.success, {
              url: requestData.url,
              status: requestData.status,
              duration: requestData.duration + "ms",
            });

            return response;
          })
          .catch((error) => {
            requestData.status = "error";
            requestData.error = error.message;
            requestData.duration = Date.now() - startTime;
            networkRequests.push(requestData);

            console.log("%c❌ Fetch Error:", styles.error, url, error.message);
            throw error;
          });
      };

      console.log(
        "%c✅ Network request interception activated!",
        styles.success
      );
      return {
        requests: networkRequests,
        monitoring: true,
        getRequests: () => networkRequests,
      };
    },

    // 8. JavaScript State Mapping
    javascriptStateMapping: function () {
      console.log("%c📊 Analysis 8: JavaScript State Mapping", styles.success);

      const stateMap = {
        globalVariables: {},
        windowProperties: [],
        documentProperties: {},
        localStorage: {},
        sessionStorage: {},
        cookies: {},
        customObjects: {},
        frameworks: [],
        libraries: [],
      };

      // Map global variables (sample top properties to avoid overwhelming output)
      const globalProps = Object.getOwnPropertyNames(window);
      console.log("%cScanning global variables...", styles.info);

      globalProps.slice(0, 100).forEach((prop) => {
        try {
          if (window.hasOwnProperty(prop)) {
            const value = window[prop];
            stateMap.globalVariables[prop] = {
              type: typeof value,
              constructor:
                value && value.constructor ? value.constructor.name : "N/A",
              isFunction: typeof value === "function",
              isObject: typeof value === "object" && value !== null,
              hasPrototype: !!(value && value.prototype),
            };
          }
        } catch (e) {
          stateMap.globalVariables[prop] = {
            type: "inaccessible",
            error: e.message,
          };
        }
      });

      // Detect popular frameworks/libraries
      const frameworks = [
        "jQuery",
        "$",
        "React",
        "ReactDOM",
        "Vue",
        "angular",
        "Angular",
        "lodash",
        "_",
        "moment",
        "axios",
        "bootstrap",
        "Foundation",
      ];

      frameworks.forEach((fw) => {
        if (window[fw]) {
          stateMap.frameworks.push({
            name: fw,
            version: window[fw].version || window[fw].VERSION || "unknown",
            type: typeof window[fw],
          });
        }
      });

      // Map localStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          stateMap.localStorage[key] = {
            value: localStorage.getItem(key).substring(0, 200),
            length: localStorage.getItem(key).length,
          };
        }
      } catch (e) {
        stateMap.localStorage = { error: "Access denied" };
      }

      // Map sessionStorage
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          stateMap.sessionStorage[key] = {
            value: sessionStorage.getItem(key).substring(0, 200),
            length: sessionStorage.getItem(key).length,
          };
        }
      } catch (e) {
        stateMap.sessionStorage = { error: "Access denied" };
      }

      // Parse cookies
      if (document.cookie) {
        document.cookie.split(";").forEach((cookie) => {
          const [name, value] = cookie.split("=").map((c) => c.trim());
          if (name && value) {
            stateMap.cookies[name] = value;
          }
        });
      }

      // Document properties
      stateMap.documentProperties = {
        readyState: document.readyState,
        URL: document.URL,
        title: document.title,
        domain: document.domain,
        referrer: document.referrer,
        lastModified: document.lastModified,
        charset: document.charset,
        contentType: document.contentType,
      };

      console.log("%c✅ JavaScript state mapping complete!", styles.success);
      console.table(stateMap.frameworks);
      return stateMap;
    },

    // 9. DOM State Analysis
    domStateAnalysis: function () {
      console.log("%c🌳 Analysis 9: DOM State Analysis", styles.success);

      const domState = {
        documentState: {
          readyState: document.readyState,
          URL: document.URL,
          title: document.title,
          cookie: document.cookie ? "Present" : "None",
          lastModified: document.lastModified,
          characterSet: document.characterSet,
          compatMode: document.compatMode,
          doctype: document.doctype ? document.doctype.name : "None",
        },
        formStates: [],
        inputStates: [],
        elementVisibility: [],
        cssStyles: [],
        mediaQueries: [],
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          devicePixelRatio: window.devicePixelRatio,
        },
      };

      // Map form states
      console.log("%cAnalyzing forms...", styles.info);
      document.querySelectorAll("form").forEach((form, index) => {
        const formData = {
          index: index,
          id: form.id,
          name: form.name,
          action: form.action,
          method: form.method,
          enctype: form.enctype,
          autocomplete: form.autocomplete,
          novalidate: form.novalidate,
          elements: [],
        };

        Array.from(form.elements).forEach((element) => {
          formData.elements.push({
            name: element.name,
            type: element.type,
            value: element.value ? element.value.substring(0, 50) : "",
            checked: element.checked,
            selected: element.selected,
            disabled: element.disabled,
            required: element.required,
            readonly: element.readOnly,
            placeholder: element.placeholder,
          });
        });

        domState.formStates.push(formData);
      });

      // Map input states
      console.log("%cAnalyzing inputs...", styles.info);
      document
        .querySelectorAll("input, select, textarea")
        .forEach((input, index) => {
          domState.inputStates.push({
            index: index,
            id: input.id,
            name: input.name,
            type: input.type,
            value: input.value ? input.value.substring(0, 50) : "",
            checked: input.checked,
            selected: input.selected,
            disabled: input.disabled,
            readonly: input.readOnly,
            required: input.required,
            validity: input.validity
              ? {
                  valid: input.validity.valid,
                  valueMissing: input.validity.valueMissing,
                  typeMismatch: input.validity.typeMismatch,
                  patternMismatch: input.validity.patternMismatch,
                }
              : null,
          });
        });

      // Check element visibility
      console.log("%cChecking element visibility...", styles.info);
      document.querySelectorAll("*").forEach((el, index) => {
        if (index < 200) {
          // Limit to first 200 elements for performance
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          domState.elementVisibility.push({
            tagName: el.tagName,
            id: el.id,
            visible:
              rect.width > 0 &&
              rect.height > 0 &&
              style.visibility !== "hidden" &&
              style.display !== "none",
            inViewport:
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= window.innerHeight &&
              rect.right <= window.innerWidth,
            dimensions: {
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left,
            },
          });
        }
      });

      console.log("%c✅ DOM state analysis complete!", styles.success);
      return domState;
    },

    // 10. DOM Mutation Monitoring
    domMutationMonitoring: function () {
      console.log("%c🔄 Analysis 10: DOM Mutation Monitoring", styles.success);

      const mutations = [];

      const observer = new MutationObserver(function (mutationsList) {
        mutationsList.forEach((mutation) => {
          const mutationData = {
            type: mutation.type,
            target: {
              tagName: mutation.target.tagName,
              id: mutation.target.id,
              className: mutation.target.className,
            },
            addedNodes: Array.from(mutation.addedNodes).map((node) => ({
              nodeType: node.nodeType,
              tagName: node.tagName,
              textContent: node.textContent
                ? node.textContent.substring(0, 50)
                : "",
            })),
            removedNodes: Array.from(mutation.removedNodes).map((node) => ({
              nodeType: node.nodeType,
              tagName: node.tagName,
              textContent: node.textContent
                ? node.textContent.substring(0, 50)
                : "",
            })),
            attributeName: mutation.attributeName,
            oldValue: mutation.oldValue,
            timestamp: new Date().toISOString(),
          };

          mutations.push(mutationData);

          console.log("%c🔄 DOM Mutation:", styles.info, {
            type: mutation.type,
            target: mutation.target.tagName,
            attribute: mutation.attributeName,
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
      });

      console.log("%c✅ DOM mutation monitoring activated!", styles.success);
      return {
        observer: observer,
        mutations: mutations,
        monitoring: true,
        getMutations: () => mutations,
        stop: () => observer.disconnect(),
      };
    },

    // 11. Form Analysis
    formAnalysis: function () {
      console.log(
        "%c📋 Analysis 11: Form Analysis & Parameter Mapping",
        styles.success
      );

      const formAnalysis = [];

      document.querySelectorAll("form").forEach((form, index) => {
        console.log(`%cAnalyzing form ${index + 1}...`, styles.info);

        const formData = {
          index: index,
          element: form,
          id: form.id,
          name: form.name,
          action: form.action,
          method: form.method,
          enctype: form.enctype,
          autocomplete: form.autocomplete,
          novalidate: form.novalidate,
          target: form.target,
          inputs: [],
          buttons: [],
          fieldsets: [],
          validation: {
            hasValidation: false,
            requiredFields: 0,
            patternFields: 0,
          },
          serializedData: {},
        };

        // Analyze inputs
        form.querySelectorAll("input, select, textarea").forEach((input) => {
          const inputData = {
            name: input.name,
            type: input.type,
            value: input.value,
            required: input.required,
            pattern: input.pattern,
            minLength: input.minLength,
            maxLength: input.maxLength,
            min: input.min,
            max: input.max,
            step: input.step,
            placeholder: input.placeholder,
            autocomplete: input.autocomplete,
            disabled: input.disabled,
            readonly: input.readOnly,
            multiple: input.multiple,
            accept: input.accept,
            validity: input.validity
              ? {
                  valid: input.validity.valid,
                  valueMissing: input.validity.valueMissing,
                  typeMismatch: input.validity.typeMismatch,
                  patternMismatch: input.validity.patternMismatch,
                  tooLong: input.validity.tooLong,
                  tooShort: input.validity.tooShort,
                  rangeUnderflow: input.validity.rangeUnderflow,
                  rangeOverflow: input.validity.rangeOverflow,
                  stepMismatch: input.validity.stepMismatch,
                  badInput: input.validity.badInput,
                }
              : null,
          };

          if (input.required) formData.validation.requiredFields++;
          if (input.pattern) formData.validation.patternFields++;
          if (input.required || input.pattern)
            formData.validation.hasValidation = true;

          formData.inputs.push(inputData);

          // Add to serialized data
          if (input.name) {
            if (input.type === "checkbox" || input.type === "radio") {
              if (input.checked) {
                formData.serializedData[input.name] = input.value;
              }
            } else {
              formData.serializedData[input.name] = input.value;
            }
          }
        });

        // Analyze buttons
        form
          .querySelectorAll(
            'button, input[type="submit"], input[type="button"], input[type="reset"]'
          )
          .forEach((button) => {
            formData.buttons.push({
              type: button.type,
              value: button.value,
              textContent: button.textContent,
              name: button.name,
              disabled: button.disabled,
              formaction: button.formaction,
              formmethod: button.formmethod,
              onclick: button.onclick
                ? button.onclick.toString().substring(0, 200)
                : null,
            });
          });

        // Analyze fieldsets
        form.querySelectorAll("fieldset").forEach((fieldset) => {
          formData.fieldsets.push({
            name: fieldset.name,
            disabled: fieldset.disabled,
            legend: fieldset.querySelector("legend")
              ? fieldset.querySelector("legend").textContent
              : null,
          });
        });

        formAnalysis.push(formData);
      });

      console.log(
        `%c✅ Found and analyzed ${formAnalysis.length} forms!`,
        styles.success
      );
      console.table(
        formAnalysis.map((f) => ({
          id: f.id,
          action: f.action,
          method: f.method,
          inputs: f.inputs.length,
          buttons: f.buttons.length,
          hasValidation: f.validation.hasValidation,
        }))
      );

      return { forms: formAnalysis, count: formAnalysis.length };
    },

    // 12. Hidden Element Detection
    hiddenElementDetection: function () {
      console.log("%c👻 Analysis 12: Hidden Element Detection", styles.success);

      const hiddenElements = [];
      const allElements = document.querySelectorAll("*");

      allElements.forEach((el, index) => {
        const computedStyle = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        const hiddenReasons = [];

        if (computedStyle.display === "none")
          hiddenReasons.push("display: none");
        if (computedStyle.visibility === "hidden")
          hiddenReasons.push("visibility: hidden");
        if (computedStyle.opacity === "0") hiddenReasons.push("opacity: 0");
        if (el.hidden) hiddenReasons.push("hidden attribute");
        if (el.type === "hidden") hiddenReasons.push('input type="hidden"');
        if (rect.width === 0 && rect.height === 0)
          hiddenReasons.push("zero dimensions");
        if (
          computedStyle.position === "absolute" &&
          (computedStyle.left === "-9999px" || computedStyle.top === "-9999px")
        ) {
          hiddenReasons.push("positioned off-screen");
        }
        if (computedStyle.clipPath === "inset(100%)")
          hiddenReasons.push("clipped");

        if (hiddenReasons.length > 0) {
          hiddenElements.push({
            element: el,
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            hiddenReasons: hiddenReasons,
            computedStyles: {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              opacity: computedStyle.opacity,
              position: computedStyle.position,
              left: computedStyle.left,
              top: computedStyle.top,
            },
            dimensions: {
              width: rect.width,
              height: rect.height,
            },
            xpath: getXPath(el),
            hasContent: el.textContent && el.textContent.trim().length > 0,
            contentPreview: el.textContent
              ? el.textContent.substring(0, 100)
              : "",
          });
        }

        if (index % 200 === 0) {
          logProgress(
            index + 1,
            allElements.length,
            `Scanning for hidden elements`
          );
        }
      });

      console.log(
        `%c✅ Found ${hiddenElements.length} hidden elements!`,
        styles.success
      );

      // Group by hidden reasons
      const groupedByReason = {};
      hiddenElements.forEach((el) => {
        el.hiddenReasons.forEach((reason) => {
          if (!groupedByReason[reason]) groupedByReason[reason] = 0;
          groupedByReason[reason]++;
        });
      });

      console.table(groupedByReason);

      return {
        elements: hiddenElements,
        count: hiddenElements.length,
        groupedByReason: groupedByReason,
      };
    },

    // 13. User Interaction Flow Tracing
    userInteractionTracing: function () {
      console.log(
        "%c🎯 Analysis 13: User Interaction Flow Tracing",
        styles.success
      );

      const interactions = [];
      const interactionFlow = [];

      // Track all user interactions
      const eventTypes = [
        "click",
        "dblclick",
        "mousedown",
        "mouseup",
        "mouseover",
        "mouseout",
        "keydown",
        "keyup",
        "keypress",
        "focus",
        "blur",
        "change",
        "submit",
        "scroll",
        "resize",
        "load",
        "unload",
        "input",
        "select",
      ];

      eventTypes.forEach((eventType) => {
        document.addEventListener(
          eventType,
          function (event) {
            const interaction = {
              id: interactions.length + 1,
              type: eventType,
              target: {
                tagName: event.target.tagName,
                id: event.target.id,
                className: event.target.className,
                name: event.target.name,
                type: event.target.type,
                value: event.target.value
                  ? event.target.value.substring(0, 50)
                  : "",
              },
              timestamp: new Date().toISOString(),
              coordinates: {
                clientX: event.clientX,
                clientY: event.clientY,
                pageX: event.pageX,
                pageY: event.pageY,
                screenX: event.screenX,
                screenY: event.screenY,
              },
              keys: {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
              },
              details: {
                button: event.button,
                buttons: event.buttons,
                detail: event.detail,
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                wheelDelta: event.wheelDelta,
              },
              page: {
                url: window.location.href,
                title: document.title,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
              },
              stack: new Error().stack.split("\n").slice(1, 5),
              xpath: getXPath(event.target),
            };

            interactions.push(interaction);

            // Build interaction flow
            if (interactions.length > 1) {
              const previousInteraction = interactions[interactions.length - 2];
              const timeDiff =
                new Date(interaction.timestamp) -
                new Date(previousInteraction.timestamp);

              interactionFlow.push({
                from: previousInteraction.id,
                to: interaction.id,
                timeDiff: timeDiff,
                pattern: `${previousInteraction.type} → ${interaction.type}`,
                sameElement: previousInteraction.xpath === interaction.xpath,
              });
            }

            console.log(
              `%c👆 User Interaction #${interaction.id}:`,
              styles.info,
              {
                type: eventType,
                target: event.target.tagName,
                id: event.target.id,
              }
            );
          },
          true
        );
      });

      // Track page navigation
      window.addEventListener("beforeunload", function () {
        console.log(
          "%c🚪 Page unloading - interaction session ending",
          styles.warning
        );
      });

      console.log("%c✅ User interaction tracing activated!", styles.success);
      console.log(
        "%cInteractions will be tracked in real-time...",
        styles.info
      );

      return {
        interactions: interactions,
        flow: interactionFlow,
        monitoring: true,
        getInteractions: () => interactions,
        getFlow: () => interactionFlow,
        getStats: () => ({
          totalInteractions: interactions.length,
          uniqueTargets: [...new Set(interactions.map((i) => i.xpath))].length,
          eventTypes: [...new Set(interactions.map((i) => i.type))],
          averageTimeBetween:
            interactionFlow.length > 0
              ? interactionFlow.reduce((sum, f) => sum + f.timeDiff, 0) /
                interactionFlow.length
              : 0,
        }),
      };
    },
  };

  // ===========================================
  // 🎯 MAIN EXECUTION FUNCTIONS
  // ===========================================

  function runAnalysis(analysisNumber) {
    const analysisNames = [
      "",
      "elementExtraction",
      "interactiveHighlighting",
      "eventTriggerDetection",
      "eventListenerMonitoring",
      "eventHandlerDiscovery",
      "stackTraceAnalysis",
      "networkRequestInterception",
      "javascriptStateMapping",
      "domStateAnalysis",
      "domMutationMonitoring",
      "formAnalysis",
      "hiddenElementDetection",
      "userInteractionTracing",
    ];

    if (analysisNumber < 1 || analysisNumber > 13) {
      console.log("%c❌ Invalid analysis number. Use 1-13.", styles.error);
      return;
    }

    const analysisName = analysisNames[analysisNumber];
    const startTime = Date.now();

    console.log(`%c🚀 Starting Analysis ${analysisNumber}...`, styles.banner);

    try {
      const result = analysisModules[analysisName]();
      const duration = Date.now() - startTime;

      // Store result
      window.webAnalysisToolkit.results[analysisName] = result;
      window.webAnalysisToolkit.currentAnalysis = analysisName;

      console.log(
        `%c✅ Analysis ${analysisNumber} completed in ${duration}ms`,
        styles.success
      );
      console.log(
        "%c📊 Result stored in window.webAnalysisToolkit.results",
        styles.info
      );

      return result;
    } catch (error) {
      console.log(
        `%c❌ Analysis ${analysisNumber} failed:`,
        styles.error,
        error
      );
      return { error: error.message, stack: error.stack };
    }
  }

  function runAll() {
    console.log("%c🚀 EXECUTING ALL 13 ANALYSES", styles.banner);
    console.log("%c⚡ This may take a few moments...", styles.info);

    const startTime = Date.now();
    const results = {};

    for (let i = 1; i <= 13; i++) {
      try {
        console.log(`\n%c📊 Running Analysis ${i}/13...`, styles.info);
        results[i] = runAnalysis(i);

        // Small delay between analyses
        if (i < 13) {
          setTimeout(() => {}, 100);
        }
      } catch (error) {
        console.log(`%c❌ Analysis ${i} failed:`, styles.error, error);
        results[i] = { error: error.message };
      }
    }

    const totalDuration = Date.now() - startTime;

    console.log(`\n%c🎉 ALL ANALYSES COMPLETED!`, styles.banner);
    console.log(
      `%c⏱️ Total execution time: ${totalDuration}ms`,
      styles.success
    );
    console.log(
      "%c📊 Results available in window.webAnalysisToolkit.results",
      styles.info
    );

    // Generate summary
    const summary = {
      totalAnalyses: 13,
      successful: Object.values(results).filter((r) => !r.error).length,
      failed: Object.values(results).filter((r) => r.error).length,
      executionTime: totalDuration,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    console.log("\n%c📋 EXECUTION SUMMARY:", styles.banner);
    console.table(summary);

    window.webAnalysisToolkit.lastExecution = summary;
    return results;
  }

  // ===========================================
  // 💾 EXPORT & SAVE FUNCTIONS
  // ===========================================

  function exportResults(format = "json") {
    const results = window.webAnalysisToolkit.results;

    if (Object.keys(results).length === 0) {
      console.log(
        "%c❌ No results to export. Run some analyses first!",
        styles.error
      );
      return;
    }

    const exportData = {
      metadata: {
        version: window.webAnalysisToolkit.version,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        exportFormat: format,
      },
      results: results,
      summary: generateSummary(),
    };

    switch (format.toLowerCase()) {
      case "json":
        exportAsJSON(exportData);
        break;
      case "html":
        exportAsHTML(exportData);
        break;
      case "console":
        exportToConsole(exportData);
        break;
      default:
        console.log(
          "%c❌ Invalid format. Use: json, html, or console",
          styles.error
        );
    }
  }

  function exportAsJSON(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `web-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("%c✅ Results exported as JSON file!", styles.success);
    console.log(
      "%c📁 File downloaded to your default download folder",
      styles.info
    );
  }

  function exportAsHTML(data) {
    const htmlContent = generateHTMLReport(data);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `web-analysis-report-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("%c✅ Results exported as HTML report!", styles.success);
    console.log(
      "%c📁 File downloaded to your default download folder",
      styles.info
    );
  }

  function exportToConsole(data) {
    console.log("\n%c📊 COMPLETE ANALYSIS RESULTS", styles.banner);
    console.log(
      "%c════════════════════════════════════════",
      "color: #3498db; font-weight: bold;"
    );

    console.log("\n%c📋 METADATA:", styles.info);
    console.table(data.metadata);

    console.log("\n%c📊 SUMMARY:", styles.info);
    console.table(data.summary);

    console.log("\n%c🔍 DETAILED RESULTS:", styles.info);

    Object.entries(data.results).forEach(([analysisName, result]) => {
      console.log(`\n%c${analysisName.toUpperCase()}:`, styles.feature);

      if (result.error) {
        console.log("%c❌ Error:", styles.error, result.error);
      } else {
        // Display relevant data based on analysis type
        if (result.count !== undefined) {
          console.log(`%cCount: ${result.count}`, styles.success);
        }

        if (result.elements && Array.isArray(result.elements)) {
          console.log(
            `%cElements found: ${result.elements.length}`,
            styles.success
          );
          if (result.elements.length > 0 && result.elements.length <= 10) {
            console.table(result.elements.slice(0, 5));
          }
        }

        if (result.summary) {
          console.table(result.summary);
        }
      }
    });

    console.log(
      "\n%c════════════════════════════════════════",
      "color: #3498db; font-weight: bold;"
    );
    console.log("%c🎯 Export complete! Data displayed above.", styles.success);
  }

  function generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Analysis Report - ${data.metadata.url}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; padding: 20px; background: #f8f9fa; line-height: 1.6;
        }
        .header { 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4); 
            color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;
        }
        .section { 
            background: white; margin: 20px 0; padding: 20px; border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .metric h3 { margin: 0 0 10px 0; color: #2c3e50; }
        .metric .number { font-size: 2em; font-weight: bold; color: #3498db; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
        .highlight { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; }
        .code { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Web Analysis Report</h1>
        <p>Expert Level Analysis - Generated ${data.metadata.timestamp}</p>
        <p>Target URL: ${data.metadata.url}</p>
    </div>

    <div class="section">
        <h2>📊 Analysis Summary</h2>
        <div class="grid">
            ${Object.entries(data.summary)
              .map(
                ([key, value]) => `
                <div class="metric">
                    <h3>${key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}</h3>
                    <div class="number">${
                      typeof value === "number" ? value.toLocaleString() : value
                    }</div>
                </div>
            `
              )
              .join("")}
        </div>
    </div>

    <div class="section">
        <h2>🔍 Detailed Results</h2>
        ${Object.entries(data.results)
          .map(
            ([analysisName, result]) => `
            <div class="section">
                <h3>${analysisName
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}</h3>
                ${
                  result.error
                    ? `<div class="error">❌ Error: ${result.error}</div>`
                    : `<div class="success">✅ Analysis completed successfully</div>
                     ${
                       result.count
                         ? `<p><strong>Items found:</strong> ${result.count}</p>`
                         : ""
                     }
                     ${
                       result.summary
                         ? `<pre>${JSON.stringify(
                             result.summary,
                             null,
                             2
                           )}</pre>`
                         : ""
                     }
                    `
                }
            </div>
        `
          )
          .join("")}
    </div>

    <div class="section">
        <h2>ℹ️ Metadata</h2>
        <table>
            <tr><th>Property</th><th>Value</th></tr>
            ${Object.entries(data.metadata)
              .map(
                ([key, value]) => `
                <tr><td>${key}</td><td>${value}</td></tr>
            `
              )
              .join("")}
        </table>
    </div>

</body>
</html>`;
  }

  function generateSummary() {
    const results = window.webAnalysisToolkit.results;
    const summary = {
      totalAnalysesRun: Object.keys(results).length,
      elementsAnalyzed: 0,
      interactiveElements: 0,
      formsFound: 0,
      hiddenElements: 0,
      networkRequests: 0,
      eventListeners: 0,
      domMutations: 0,
      jsVariables: 0,
    };

    // Extract key metrics from results
    if (results.elementExtraction && results.elementExtraction.summary) {
      summary.elementsAnalyzed =
        results.elementExtraction.summary.totalElements || 0;
    }

    if (results.interactiveHighlighting) {
      summary.interactiveElements = results.interactiveHighlighting.count || 0;
    }

    if (results.formAnalysis) {
      summary.formsFound = results.formAnalysis.count || 0;
    }

    if (results.hiddenElementDetection) {
      summary.hiddenElements = results.hiddenElementDetection.count || 0;
    }

    if (
      results.networkRequestInterception &&
      results.networkRequestInterception.getRequests
    ) {
      summary.networkRequests =
        results.networkRequestInterception.getRequests().length || 0;
    }

    if (
      results.eventListenerMonitoring &&
      results.eventListenerMonitoring.getListeners
    ) {
      summary.eventListeners =
        results.eventListenerMonitoring.getListeners().length || 0;
    }

    if (
      results.domMutationMonitoring &&
      results.domMutationMonitoring.getMutations
    ) {
      summary.domMutations =
        results.domMutationMonitoring.getMutations().length || 0;
    }

    if (
      results.javascriptStateMapping &&
      results.javascriptStateMapping.globalVariables
    ) {
      summary.jsVariables =
        Object.keys(results.javascriptStateMapping.globalVariables).length || 0;
    }

    return summary;
  }

  // ===========================================
  // 🎛️ UTILITY FUNCTIONS
  // ===========================================

  function showResults(analysisName = null) {
    const results = window.webAnalysisToolkit.results;

    if (Object.keys(results).length === 0) {
      console.log(
        "%c❌ No results available. Run some analyses first!",
        styles.error
      );
      return;
    }

    if (analysisName && results[analysisName]) {
      console.log(
        `%c📊 Results for ${analysisName.toUpperCase()}:`,
        styles.banner
      );
      console.log(results[analysisName]);
    } else {
      console.log("%c📊 ALL STORED RESULTS:", styles.banner);
      console.log(
        "%c════════════════════════════════════════",
        "color: #3498db; font-weight: bold;"
      );

      Object.entries(results).forEach(([name, result]) => {
        console.log(`\n%c${name.toUpperCase()}:`, styles.feature);
        if (result.count !== undefined) {
          console.log(`%c  Count: ${result.count}`, styles.info);
        }
        if (result.error) {
          console.log(`%c  Error: ${result.error}`, styles.error);
        } else {
          console.log(`%c  Status: ✅ Success`, styles.success);
        }
      });

      console.log("\n%c📋 SUMMARY:", styles.info);
      console.table(generateSummary());
    }
  }

  function clearResults() {
    window.webAnalysisToolkit.results = {};
    window.webAnalysisToolkit.currentAnalysis = null;

    console.log("%c🧹 All results cleared!", styles.success);
    console.log("%c💾 Storage reset and ready for new analyses", styles.info);
  }

  function getHelp() {
    console.log("\n%c🆘 WEB ANALYSIS TOOLKIT - HELP", styles.banner);
    console.log(
      "%c┌─────────────────────────────────────────────────────────┐",
      "color: #3498db;"
    );
    console.log(
      "%c│  MAIN FUNCTIONS:                                        │",
      "color: #3498db;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #3498db;"
    );
    console.log(
      "%c│  showMenu()         - Display interactive menu          │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  runAll()          - Execute all 13 analyses           │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  runAnalysis(n)    - Run specific analysis (1-13)      │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  showResults()     - Display current results           │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  exportResults()   - Export as JSON (default)          │",
      "color: #2ecc71;"
    );
    console.log(
      '%c│  exportResults("html") - Export as HTML report         │',
      "color: #2ecc71;"
    );
    console.log(
      '%c│  exportResults("console") - Display in console         │',
      "color: #2ecc71;"
    );
    console.log(
      "%c│  clearResults()    - Clear all stored data             │",
      "color: #2ecc71;"
    );
    console.log(
      "%c│  getHelp()         - Show this help menu               │",
      "color: #2ecc71;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #3498db;"
    );
    console.log(
      "%c│  ANALYSIS TYPES (1-13):                                │",
      "color: #3498db;"
    );
    console.log(
      "%c│  1=Elements  2=Interactive  3=Triggers  4=Listeners    │",
      "color: #95a5a6;"
    );
    console.log(
      "%c│  5=Handlers  6=StackTrace   7=Network   8=JSState      │",
      "color: #95a5a6;"
    );
    console.log(
      "%c│  9=DOMState  10=Mutations   11=Forms    12=Hidden       │",
      "color: #95a5a6;"
    );
    console.log(
      "%c│  13=Interactions                                        │",
      "color: #95a5a6;"
    );
    console.log(
      "%c└─────────────────────────────────────────────────────────┘",
      "color: #3498db;"
    );
    console.log("\n%c💡 Examples:", styles.warning);
    console.log(
      "%c  runAnalysis(1)           %c- Analyze all elements",
      "font-family: monospace; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      '%c  exportResults("json")    %c- Save as JSON file',
      "font-family: monospace; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      '%c  showResults("formAnalysis") %c- Show specific results',
      "font-family: monospace; color: #e74c3c;",
      "color: #7f8c8d;"
    );
  }

  // ===========================================
  // 🚀 INITIALIZATION & GLOBAL EXPOSURE
  // ===========================================

  // Expose functions globally
  window.showMenu = showMenu;
  window.runAnalysis = runAnalysis;
  window.runAll = runAll;
  window.exportResults = exportResults;
  window.showResults = showResults;
  window.clearResults = clearResults;
  window.getHelp = getHelp;

  // Auto-show banner on load
  showBanner();

  console.log("\n%c🎯 QUICK ACTIONS:", styles.warning);
  console.log(
    "%cshowMenu()     %c- Show full interactive menu",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%crunAll()       %c- Run all analyses at once",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cgetHelp()      %c- Detailed help and examples",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
})();

// ===========================================
// 🎉 TOOLKIT LOADED - READY FOR ACTION!
// ===========================================
