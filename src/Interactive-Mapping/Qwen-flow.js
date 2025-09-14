// Complete User Action Flow Analysis Script - Enhanced and Fixed
(function () {
  "use strict";

  // Global storage for all collected data
  const analysisData = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    elements: [],
    interactiveElements: [],
    eventTriggers: [],
    eventListeners: [],
    eventHandlers: [],
    stackTraces: [],
    ajaxData: { xhrRequests: [], fetchRequests: [], activeRequests: [] },
    stateMap: {},
    domState: {},
    mutations: [],
    userActions: [],
    hiddenElements: [],
    functionalityStates: {},
  };

  // --- UTILITY ---

  // Generate XPath for an element (same as original)
  function getElementXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return "";
    if (element.id) return `//*[@id="${element.id}"]`;

    const segments = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tagName = current.tagName.toLowerCase();
      const parent = current.parentElement;

      if (!parent) {
        segments.unshift("/" + tagName);
        break;
      }

      const siblings = Array.from(parent.children).filter(
        (sib) => sib.tagName === current.tagName
      );
      const index = siblings.indexOf(current) + 1;
      const segment =
        siblings.length > 1 ? `/${tagName}[${index}]` : `/${tagName}`;
      segments.unshift(segment);
      current = parent;
    }

    return segments.join("");
  }

  // Generate safer CSS path using classes and nth-of-type
  function getCssPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return "";
    if (element.id) return `#${element.id}`;
    if (element === document.body) return "body";

    const segments = [];
    let current = element;

    while (
      current &&
      current.nodeType === Node.ELEMENT_NODE &&
      current !== document.body
    ) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = `#${current.id}`;
        segments.unshift(selector);
        break;
      }

      if (current.className && typeof current.className === "string") {
        const classes = current.className.trim().split(/\s+/).filter(Boolean);
        if (classes.length) {
          selector += "." + classes.join(".");
        }
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (sib) => sib.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      segments.unshift(selector);
      current = parent;
    }

    if (current === document.body) {
      segments.unshift("body");
    }

    return segments.join(" > ");
  }

  // --- STEP 1: Extract All Elements with Attributes ---
  function getAllElementsWithAttributes() {
    const allElements = document.querySelectorAll("*");
    const elementsData = [];

    allElements.forEach((element) => {
      const elementInfo = {
        tagName: element.tagName,
        id: element.id || null,
        className: element.className || null,
        attributes: {},
        xpath: getElementXPath(element),
        cssPath: getCssPath(element),
      };

      // Extract all attributes
      for (let attr of element.attributes) {
        elementInfo.attributes[attr.name] = attr.value;
      }

      elementsData.push(elementInfo);
    });

    return elementsData;
  }

  // --- STEP 2: Highlight Interactive Elements using CSS Class ---
  // Define CSS for highlights once
  const interactiveHighlightClass = "uafa-interactive-highlight";
  function addHighlightStyle() {
    if (document.getElementById("uafa-highlight-style")) return;
    const styleTag = document.createElement("style");
    styleTag.id = "uafa-highlight-style";
    styleTag.textContent = `
      .${interactiveHighlightClass} {
        border: 2px solid #ff0000 !important;
        background-color: rgba(255, 0, 0, 0.1) !important;
        outline: 2px solid #ff0000 !important;
      }
    `;
    document.head.appendChild(styleTag);
  }

  function highlightInteractiveElements() {
    addHighlightStyle();

    const interactiveSelectors = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "[onclick]",
      "[onchange]",
      "[onsubmit]",
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    const interactiveElements = document.querySelectorAll(
      interactiveSelectors.join(", ")
    );
    const highlightedElements = [];

    interactiveElements.forEach((element) => {
      element.classList.add(interactiveHighlightClass);
      highlightedElements.push({
        element: element,
        xpath: getElementXPath(element),
        cssPath: getCssPath(element),
      });
    });

    return highlightedElements;
  }

  function removeHighlights(highlightedElements) {
    if (!highlightedElements || !highlightedElements.length) return;
    highlightedElements.forEach(({ element }) => {
      element.classList.remove(interactiveHighlightClass);
    });
  }

  // --- STEP 3: Event Triggers Detection (Inline attributes + .on* properties) ---
  function getEventTriggers() {
    const triggers = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const elementTriggers = [];
      // Inline attributes like onclick="..."
      for (let attr of element.attributes) {
        if (attr.name.startsWith("on")) {
          elementTriggers.push({
            event: attr.name.substring(2),
            handler: attr.value,
            type: "inline-attribute",
          });
        }
      }

      // Also check properties like element.onclick assigned dynamically
      const eventsToCheck = [
        "onclick",
        "onchange",
        "onsubmit",
        "oninput",
        "onfocus",
        "onblur",
        "onkeydown",
        "onkeyup",
        "onkeypress",
      ];

      eventsToCheck.forEach((evt) => {
        try {
          if (typeof element[evt] === "function") {
            elementTriggers.push({
              event: evt.substring(2),
              handler: element[evt].toString(),
              type: "inline-property",
            });
          }
        } catch (e) {
          // Defensive catch
        }
      });

      if (elementTriggers.length > 0) {
        triggers.push({
          element: {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
          },
          triggers: elementTriggers,
          xpath: getElementXPath(element),
          cssPath: getCssPath(element),
        });
      }
    });

    return triggers;
  }

  // --- STEP 4: Event Listeners Detection with addEventListener Hook ---

  // Map: element => array of listeners
  const eventListenerRegistry = new WeakMap();

  // Hook into addEventListener once
  function hookAddEventListener() {
    if (window.__uafaAddListenerHooked) return; // only once
    window.__uafaAddListenerHooked = true;

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      if (!eventListenerRegistry.has(this)) {
        eventListenerRegistry.set(this, []);
      }
      eventListenerRegistry.get(this).push({ type, listener, options });
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // Retrieve listeners for element from registry + check .on* properties
  function getEventListenersForElement(element) {
    const listeners = [];
    const seen = new Set();

    // Listeners registered via addEventListener hook
    const registeredListeners = eventListenerRegistry.get(element) || [];

    registeredListeners.forEach(({ type, listener, options }) => {
      const sig = `${type}|${listener.toString()}`;
      if (!seen.has(sig)) {
        listeners.push({
          type,
          listener: listener.toString(),
          useCapture:
            (typeof options === "boolean" && options) ||
            (typeof options === "object" && options.capture) ||
            false,
          source: "addEventListener",
        });
        seen.add(sig);
      }
    });

    // Inline .on* properties (programmatically assigned handlers)
    const commonOnEvents = [
      "onclick",
      "ondblclick",
      "onmousedown",
      "onmouseup",
      "onmouseover",
      "onmouseout",
      "onmouseenter",
      "onmouseleave",
      "onmousemove",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onfocus",
      "onblur",
      "onchange",
      "oninput",
      "onsubmit",
      "onreset",
      "onselect",
    ];

    commonOnEvents.forEach((eventName) => {
      try {
        const handler = element[eventName];
        if (typeof handler === "function") {
          const sig = `${eventName.substring(2)}|${handler.toString()}`;
          if (!seen.has(sig)) {
            listeners.push({
              type: eventName.substring(2),
              listener: handler.toString(),
              useCapture: false,
              source: "onProperty",
            });
            seen.add(sig);
          }
        }
      } catch (e) {}
    });

    return listeners;
  }

  // Scan entire DOM for event listeners
  function getEventListeners() {
    hookAddEventListener(); // ensure hook active
    const listeners = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      try {
        const elementListeners = getEventListenersForElement(element);
        if (elementListeners.length > 0) {
          listeners.push({
            element: {
              tagName: element.tagName,
              id: element.id,
              className: element.className,
            },
            listeners: elementListeners,
            xpath: getElementXPath(element),
            cssPath: getCssPath(element),
          });
        }
      } catch (e) {
        // Defensive
      }
    });

    return listeners;
  }

  // --- STEP 5: Event Handlers (Merged with Step 3 triggers and Step 4 listeners) ---
  // We'll keep it similar, but merged data for completeness

  function getEventHandlers() {
    const handlers = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const elementHandlers = [];
      const seen = new Set();

      // Inline event handlers detected via attributes
      for (let attr of element.attributes) {
        if (attr.name.startsWith("on")) {
          const sig = `attr|${attr.name.substring(2)}|${attr.value}`;
          if (!seen.has(sig)) {
            elementHandlers.push({
              event: attr.name.substring(2),
              handler: attr.value,
              type: "inline-attribute",
              source: "attribute",
              confidence: "high"
            });
            seen.add(sig);
          }
        }
      }

      // Inline .on* properties (programmatic inline handlers)
      const commonOnEvents = [
        "onclick",
        "ondblclick",
        "onmousedown",
        "onmouseup",
        "onmouseover",
        "onmouseout",
        "onmouseenter",
        "onmouseleave",
        "onmousemove",
        "onkeydown",
        "onkeyup",
        "onkeypress",
        "onfocus",
        "onblur",
        "onchange",
        "oninput",
        "onsubmit",
        "onreset",
        "onselect",
      ];

      commonOnEvents.forEach((eventName) => {
        try {
          const handler = element[eventName];
          if (typeof handler === "function") {
            const sig = `prop|${eventName.substring(2)}|${handler.toString()}`;
            if (!seen.has(sig)) {
              elementHandlers.push({
                event: eventName.substring(2),
                handler: handler.toString(),
                type: "inline-property",
                source: "property",
                confidence: "medium"
              });
              seen.add(sig);
            }
          }
        } catch (e) {}
      });

      // Listeners added via addEventListener hook
      if (eventListenerRegistry.has(element)) {
        const listeners = eventListenerRegistry.get(element);
        listeners.forEach(({ type, listener }) => {
          const sig = `listener|${type}|${listener.toString()}`;
          if (!seen.has(sig)) {
            elementHandlers.push({
              event: type,
              handler: listener.toString(),
              type: "addEventListener",
              source: "addEventListener",
              confidence: "high"
            });
            seen.add(sig);
          }
        });
      }

      if (elementHandlers.length > 0) {
        handlers.push({
          element: {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
          },
          handlers: elementHandlers,
          xpath: getElementXPath(element),
          cssPath: getCssPath(element),
        });
      }
    });

    return handlers;
  }

  // --- STEP 6: Stack Tracing for Elements (Wrap event handlers to capture real stacks on event) ---

  // We wrap all addEventListener functions and inline handlers to capture real-time stack traces on invoked events.

  // Map of wrapped handlers to avoid multiple wraps
  const wrappedHandlers = new WeakMap();

  function wrapHandlerWithStackCapture(originalHandler) {
    if (wrappedHandlers.has(originalHandler)) {
      return wrappedHandlers.get(originalHandler);
    }

    function wrappedHandler(event) {
      // Capture stack trace here
      try {
        analysisData.stackTraces.push({
          eventType: event.type,
          timestamp: new Date().toISOString(),
          target: {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
          },
          stack: new Error().stack,
          xpath: getElementXPath(event.target),
          cssPath: getCssPath(event.target),
        });
      } catch (e) {}

      return originalHandler.apply(this, arguments);
    }

    wrappedHandlers.set(originalHandler, wrappedHandler);
    return wrappedHandler;
  }

  // Hook addEventListener to wrap handlers on add
  function hookAddEventListenerWithStack() {
    if (window.__uafaAddListenerStackHooked) return;
    window.__uafaAddListenerStackHooked = true;

    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      // Wrap to capture stack on event call
      const wrapped = wrapHandlerWithStackCapture(listener);

      if (!eventListenerRegistry.has(this)) {
        eventListenerRegistry.set(this, []);
      }
      eventListenerRegistry
        .get(this)
        .push({ type, listener: wrapped, options });

      return originalAddEventListener.call(this, type, wrapped, options);
    };
  }

  // Wrap inline .on* properties handlers to also capture stack trace on event trigger
  function wrapInlineHandlersForStack() {
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const commonOnEvents = [
        "onclick",
        "ondblclick",
        "onmousedown",
        "onmouseup",
        "onmouseover",
        "onmouseout",
        "onmouseenter",
        "onmouseleave",
        "onmousemove",
        "onkeydown",
        "onkeyup",
        "onkeypress",
        "onfocus",
        "onblur",
        "onchange",
        "oninput",
        "onsubmit",
        "onreset",
        "onselect",
      ];

      commonOnEvents.forEach((eventName) => {
        try {
          const handler = element[eventName];
          if (typeof handler === "function") {
            // Replace with wrapped version capturing stack
            element[eventName] = wrapHandlerWithStackCapture(handler);
          }
        } catch (e) {}
      });
    });
  }

  function traceElementStacks() {
    // Install hooks for live tracking
    hookAddEventListenerWithStack();
    wrapInlineHandlersForStack();

    // Return any previously collected stack traces (live capture ongoing)
    return analysisData.stackTraces;
  }

  // --- STEP 7: AJAX, XHR, FETCH TRACKING WITH LIFECYCLE EVENTS ---

  function trackAjaxRequests() {
    const ajaxData = {
      xhrRequests: [],
      fetchRequests: [],
      activeRequests: [],
    };

    // Avoid hooking multiple times
    if (window.__uafaXHRHooked) return ajaxData;
    window.__uafaXHRHooked = true;

    // Track XMLHttpRequest
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function () {
      const xhr = new OriginalXHR();
      const xhrInfo = {
        method: null,
        url: null,
        headers: {},
        data: null,
        startTime: null,
        endTime: null,
        status: null,
        response: null,
      };

      // Wrap open
      const originalOpen = xhr.open;
      xhr.open = function (method, url) {
        xhrInfo.method = method;
        xhrInfo.url = url;
        ajaxData.activeRequests.push(xhrInfo);
        return originalOpen.apply(this, arguments);
      };

      // Wrap setRequestHeader to collect headers
      const originalSetRequestHeader = xhr.setRequestHeader;
      xhr.setRequestHeader = function (header, value) {
        xhrInfo.headers[header] = value;
        return originalSetRequestHeader.apply(this, arguments);
      };

      // Wrap send to detect start time and data
      const originalSend = xhr.send;
      xhr.send = function (data) {
        xhrInfo.data = data;
        xhrInfo.startTime = new Date().getTime();
        ajaxData.xhrRequests.push(xhrInfo);
        return originalSend.apply(this, arguments);
      };

      // Wrap onload, onerror, onabort to track lifecycle and cleanup activeRequests
      ["onload", "onerror", "onabort", "onreadystatechange"].forEach(
        (event) => {
          xhr.addEventListener(event, () => {
            xhrInfo.endTime = new Date().getTime();
            xhrInfo.status = xhr.status;
            xhrInfo.response = xhr.response;
            const idx = ajaxData.activeRequests.indexOf(xhrInfo);
            if (idx > -1) {
              ajaxData.activeRequests.splice(idx, 1);
            }
          });
        }
      );

      return xhr;
    };

    // Track Fetch API
    if (!window.__uafaFetchHooked) {
      window.__uafaFetchHooked = true;
      const originalFetch = window.fetch;
      window.fetch = function (input, init = {}) {
        const fetchInfo = {
          url: typeof input === "string" ? input : input.url,
          method: (init && init.method) || "GET",
          headers: (init && init.headers) || {},
          body: (init && init.body) || null,
          startTime: Date.now(),
          endTime: null,
          status: null,
        };

        ajaxData.fetchRequests.push(fetchInfo);
        ajaxData.activeRequests.push(fetchInfo);

        return originalFetch.apply(this, arguments).then(
          (response) => {
            fetchInfo.endTime = Date.now();
            fetchInfo.status = response.status;
            const idx = ajaxData.activeRequests.indexOf(fetchInfo);
            if (idx > -1) ajaxData.activeRequests.splice(idx, 1);
            return response;
          },
          (error) => {
            fetchInfo.endTime = Date.now();
            fetchInfo.status = "error";
            const idx = ajaxData.activeRequests.indexOf(fetchInfo);
            if (idx > -1) ajaxData.activeRequests.splice(idx, 1);
            throw error;
          }
        );
      };
    }

    return ajaxData;
  }

  // --- STEP 8: JavaScript Variables and State Mapping ---
  // Same as your original function, no changes needed here
  function mapJavaScriptState() {
    const stateMap = {
      globalVariables: {},
      windowProperties: {},
      localStorage: {},
      sessionStorage: {},
      cookies: {},
    };

    Object.getOwnPropertyNames(window).forEach((prop) => {
      try {
        if (typeof window[prop] !== "function") {
          stateMap.globalVariables[prop] = window[prop];
        }
      } catch (e) {
        stateMap.globalVariables[prop] = "[Unable to access]";
      }
    });

    stateMap.windowProperties = {
      location: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        stateMap.localStorage[key] = localStorage.getItem(key);
      }
    } catch (e) {}

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        stateMap.sessionStorage[key] = sessionStorage.getItem(key);
      }
    } catch (e) {}

    stateMap.cookies = document.cookie.split(";").reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split("=");
      cookies[name] = value;
      return cookies;
    }, {});

    return stateMap;
  }

  // --- STEP 9: Full DOM State Mapping (with throttling) ---
  // Throttle heavy function by limiting frequency or maximum records

  let lastDomStateMapTime = 0;
  const DOM_STATE_MIN_INTERVAL = 2000; // ms

  function mapFullDOMState() {
    const now = Date.now();
    if (now - lastDomStateMapTime < DOM_STATE_MIN_INTERVAL) {
      return (
        analysisData.domState || {
          structure: [],
          styles: [],
          computedStyles: [],
          visibility: [],
        }
      );
    }
    lastDomStateMapTime = now;

    const domState = {
      structure: [],
      styles: [],
      computedStyles: [],
      visibility: [],
    };

    // Limit max elements processed to avoid performance hit
    const allElements = document.querySelectorAll("*");
    const MAX_ELEMENTS = 500;
    const elementsToProcess = Array.from(allElements).slice(0, MAX_ELEMENTS);

    elementsToProcess.forEach((element) => {
      // Structure
      domState.structure.push({
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        innerHTML: element.innerHTML.substring(0, 500), // truncate large content
        textContent: element.textContent
          ? element.textContent.substring(0, 500)
          : "",
        xpath: getElementXPath(element),
        cssPath: getCssPath(element),
      });

      // Styles
      domState.styles.push({
        element: {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
        },
        inlineStyles: element.getAttribute("style"),
        xpath: getElementXPath(element),
        cssPath: getCssPath(element),
      });

      // Computed styles
      try {
        const computedStyle = window.getComputedStyle(element);
        const styleObj = {};
        for (let i = 0; i < computedStyle.length; i++) {
          const prop = computedStyle[i];
          styleObj[prop] = computedStyle.getPropertyValue(prop);
        }

        domState.computedStyles.push({
          element: {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
          },
          styles: styleObj,
          xpath: getElementXPath(element),
          cssPath: getCssPath(element),
        });
      } catch (e) {}

      // Visibility
      domState.visibility.push({
        element: {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
        },
        isVisible: !!(
          element.offsetWidth ||
          element.offsetHeight ||
          element.getClientRects().length
        ),
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        xpath: getElementXPath(element),
        cssPath: getCssPath(element),
      });
    });

    analysisData.domState = domState;
    return domState;
  }

  // --- STEP 10: DOM Mutation Observer (with throttling to limit frequency) ---
  let mutationObserverInstance = null;
  let mutationsBuffer = [];
  let lastMutationFlush = 0;
  const MUTATION_FLUSH_INTERVAL = 1000; // ms

  function flushMutations() {
    analysisData.mutations = analysisData.mutations.concat(mutationsBuffer);
    mutationsBuffer = [];
    lastMutationFlush = Date.now();
  }

  function observeDOMMutations() {
    if (mutationObserverInstance)
      return {
        observer: mutationObserverInstance,
        mutations: analysisData.mutations,
      };

    const observer = new MutationObserver(function (mutationsList) {
      mutationsList.forEach((mutation) => {
        const mutationInfo = {
          type: mutation.type,
          target: {
            tagName: mutation.target.tagName,
            id: mutation.target.id,
            className: mutation.target.className,
          },
          timestamp: new Date().toISOString(),
        };

        if (mutation.type === "childList") {
          mutationInfo.addedNodes = Array.from(mutation.addedNodes).map(
            (node) => ({
              nodeType: node.nodeType,
              nodeName: node.nodeName,
              textContent: node.textContent,
            })
          );
          mutationInfo.removedNodes = Array.from(mutation.removedNodes).map(
            (node) => ({
              nodeType: node.nodeType,
              nodeName: node.nodeName,
              textContent: node.textContent,
            })
          );
        } else if (mutation.type === "attributes") {
          mutationInfo.attributeName = mutation.attributeName;
          mutationInfo.oldValue = mutation.oldValue;
          mutationInfo.newValue = mutation.target.getAttribute(
            mutation.attributeName
          );
        } else if (mutation.type === "characterData") {
          mutationInfo.oldValue = mutation.oldValue;
          mutationInfo.newValue = mutation.target.textContent;
        }

        mutationsBuffer.push(mutationInfo);
      });

      // Throttle flush to storage
      const now = Date.now();
      if (now - lastMutationFlush > MUTATION_FLUSH_INTERVAL) {
        flushMutations();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
    });

    mutationObserverInstance = observer;
    window.userActionState = window.userActionState || {};
    window.userActionState.mutationObserver = observer;

    return {
      observer: observer,
      mutations: analysisData.mutations,
    };
  }

  // --- STEP 11: User Action Flow Tracking (with throttling) ---
  let userActionEvents = [];
  let lastUserActionFlush = 0;
  const USER_ACTION_FLUSH_INTERVAL = 1000;

  function flushUserActions() {
    analysisData.userActions =
      analysisData.userActions.concat(userActionEvents);
    userActionEvents = [];
    lastUserActionFlush = Date.now();
  }

  function trackUserActions() {
    if (window.__uafaUserActionsTracked) return analysisData.userActions;
    window.__uafaUserActionsTracked = true;

    const eventTypes = [
      "click",
      "dblclick",
      "mousedown",
      "mouseup",
      "mouseover",
      "mouseout",
      "mouseenter",
      "mouseleave",
      "mousemove",
      "keydown",
      "keyup",
      "keypress",
      "focus",
      "blur",
      "change",
      "input",
      "submit",
      "reset",
      "select",
    ];

    // For deduplication/grouping
    let lastAction = null;
    let lastActionTime = 0;
    const ACTION_GROUP_INTERVAL = 300; // ms

    eventTypes.forEach((eventType) => {
      document.addEventListener(
        eventType,
        function (event) {
          const now = Date.now();
          const actionInfo = {
            eventType: eventType,
            timestamp: new Date().toISOString(),
            element: {
              tagName: event.target.tagName,
              id: event.target.id,
              className: event.target.className,
              value: event.target.value,
            },
            pageX: event.pageX,
            pageY: event.pageY,
            keyCode: event.keyCode !== undefined ? event.keyCode : null,
            stack: new Error().stack,
            xpath: getElementXPath(event.target),
            cssPath: getCssPath(event.target),
            confidence: "high",
            source: "eventListener"
          };

          // Group related events (e.g., mousedown/mouseup/click)
          if (
            lastAction &&
            lastAction.element.tagName === actionInfo.element.tagName &&
            lastAction.element.id === actionInfo.element.id &&
            lastAction.element.className === actionInfo.element.className &&
            now - lastActionTime < ACTION_GROUP_INTERVAL &&
            ["mousedown", "mouseup", "click"].includes(eventType) &&
            ["mousedown", "mouseup", "click"].includes(lastAction.eventType)
          ) {
            // Merge into last action
            lastAction.eventType += "," + eventType;
            lastActionTime = now;
            return;
          }

          userActionEvents.push(actionInfo);
          lastAction = actionInfo;
          lastActionTime = now;

          // Flush periodically
          if (now - lastUserActionFlush > USER_ACTION_FLUSH_INTERVAL) {
            flushUserActions();
          }
        },
        true
      );
    });

    return analysisData.userActions;
  }

  // --- STEP 12: Hidden Elements Detection ---
  function detectHiddenElements() {
    const hiddenElements = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const isHidden =
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden" ||
        element.hidden === true ||
        parseFloat(computedStyle.opacity) === 0 ||
        element.offsetWidth === 0 ||
        element.offsetHeight === 0;

      // Only include if interactive, important, or P1
      const isInteractive = (
        element.matches(
          "a[href], button, input, select, textarea, [onclick], [onchange], [onsubmit], [role=button], [tabindex]:not([tabindex='-1']), [contenteditable='true']"
        ) || getEventListenersForElement(element).length > 0
      );
      const isImportant = element.getAttribute("aria-important") === "true" ||
        element.getAttribute("data-priority") === "P1" ||
        element.getAttribute("data-important") === "true";

      if (isHidden && (isInteractive || isImportant)) {
        hiddenElements.push({
          element: {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            innerHTML: element.innerHTML.substring(0, 100) + "...",
          },
          reason: getHiddenReason(element, computedStyle),
          interactive: isInteractive,
          important: isImportant,
          xpath: getElementXPath(element),
          cssPath: getCssPath(element),
        });
      }
    });

    return hiddenElements;
  }

  function getHiddenReason(element, computedStyle) {
    if (computedStyle.display === "none") return "display: none";
    if (computedStyle.visibility === "hidden") return "visibility: hidden";
    if (element.hidden === true) return "hidden attribute";
    if (parseFloat(computedStyle.opacity) === 0) return "opacity: 0";
    if (element.offsetWidth === 0 && element.offsetHeight === 0)
      return "zero dimensions";
    return "unknown";
  }

  // --- STEP 13: State Mapping for User Functionality ---
  function mapUserFunctionalityStates() {
    const functionalityStates = {
      forms: [],
      interactiveElements: [],
      dynamicContent: [],
      stateTransitions: [],
    };

    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const formData = {
        id: form.id,
        action: form.action,
        method: form.method,
        elements: [],
        xpath: getElementXPath(form),
        cssPath: getCssPath(form),
      };

      const formElements = form.querySelectorAll(
        "input, select, textarea, button"
      );
      const seenFields = new Set();
      formElements.forEach((element) => {
        // Build a signature for deduplication
        const sig = `${element.tagName}|${element.name}|${element.id}`;
        if (seenFields.has(sig)) return;
        seenFields.add(sig);
        // Mark important/P1 fields
        const isImportant = element.getAttribute("aria-important") === "true" ||
          element.getAttribute("data-priority") === "P1" ||
          element.getAttribute("data-important") === "true";
        formData.elements.push({
          tagName: element.tagName,
          type: element.type,
          name: element.name,
          id: element.id,
          value: element.value,
          required: element.required,
          important: isImportant,
          validation: {
            min: element.min,
            max: element.max,
            minlength: element.minLength,
            maxlength: element.maxLength,
            pattern: element.pattern,
            step: element.step,
          },
          xpath: getElementXPath(element),
          cssPath: getCssPath(element),
        });
      });

      functionalityStates.forms.push(formData);
    });

    // Interactive Elements
    const interactiveElements = document.querySelectorAll(
      "a, button, input, select, textarea, [onclick], [onchange]"
    );
    interactiveElements.forEach((element) => {
      functionalityStates.interactiveElements.push({
        element: {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          type: element.type,
          value: element.value,
        },
        currentEventListeners: getEventListenersForElement(element),
        xpath: getElementXPath(element),
        cssPath: getCssPath(element),
      });
    });

    return functionalityStates;
  }

  // --- Steps registry and selective runner (unchanged logic) ---
  const stepsRegistry = {
    1: {
      name: "Extract All Elements with Attributes",
      key: "elements",
      run: () => (analysisData.elements = getAllElementsWithAttributes()),
    },
    2: {
      name: "Highlight Interactive Elements",
      key: "interactiveElements",
      run: () =>
        (analysisData.interactiveElements = highlightInteractiveElements()),
    },
    3: {
      name: "Event Triggers",
      key: "eventTriggers",
      run: () => (analysisData.eventTriggers = getEventTriggers()),
    },
    4: {
      name: "Event Listeners",
      key: "eventListeners",
      run: () => (analysisData.eventListeners = getEventListeners()),
    },
    5: {
      name: "Event Handlers",
      key: "eventHandlers",
      run: () => (analysisData.eventHandlers = getEventHandlers()),
    },
    6: {
      name: "Stack Tracing for Elements",
      key: "stackTraces",
      run: () => (analysisData.stackTraces = traceElementStacks()),
    },
    7: {
      name: "Ajax/Fetch/XMLHttpRequest Tracking",
      key: "ajaxData",
      run: () => (analysisData.ajaxData = trackAjaxRequests()),
    },
    8: {
      name: "JavaScript Variables and State Mapping",
      key: "stateMap",
      run: () => (analysisData.stateMap = mapJavaScriptState()),
    },
    9: {
      name: "Full DOM State Mapping",
      key: "domState",
      run: () => (analysisData.domState = mapFullDOMState()),
    },
    10: {
      name: "DOM Mutation Observer",
      key: "mutations",
      run: () => {
        const r = observeDOMMutations();
        analysisData.mutations = r.mutations;
        window.userActionState = window.userActionState || {};
        window.userActionState.mutationObserver = r.observer;
        return r;
      },
    },
    11: {
      name: "User Action Flow Tracking",
      key: "userActions",
      run: () => (analysisData.userActions = trackUserActions()),
    },
    12: {
      name: "Hidden Elements Detection",
      key: "hiddenElements",
      run: () => (analysisData.hiddenElements = detectHiddenElements()),
    },
    13: {
      name: "State Mapping for User Functionality",
      key: "functionalityStates",
      run: () =>
        (analysisData.functionalityStates = mapUserFunctionalityStates()),
    },
  };

  // List steps API
  function getStepsList() {
    return Object.entries(stepsRegistry).map(([num, meta]) => ({
      step: Number(num),
      name: meta.name,
      key: meta.key,
    }));
  }

  // Selective runner API
  function runSteps(steps, opts = {}) {
    const { silent = false } = opts;
    const log = (...args) => {
      if (!silent) console.log(...args);
    };

    let stepsArray;
    if (steps === "all") {
      stepsArray = Object.keys(stepsRegistry).map((n) => Number(n));
    } else if (Array.isArray(steps)) {
      stepsArray = steps.map((n) => Number(n)).filter((n) => stepsRegistry[n]);
    } else if (typeof steps === "number") {
      stepsArray = stepsRegistry[steps] ? [steps] : [];
    } else {
      log(
        "No valid steps provided. Use userActionGetSteps() to see available steps."
      );
      return { results: {}, analysisData };
    }

    const results = {};
    log("Starting selective analysis for steps:", stepsArray.join(", "));

    stepsArray.forEach((step) => {
      const meta = stepsRegistry[step];
      try {
        const output = meta.run();
        results[meta.key] =
          output !== undefined ? output : analysisData[meta.key];
        log(`✓ Step ${step}: ${meta.name}`);
      } catch (err) {
        console.error(`✗ Step ${step} failed: ${meta.name}`, err);
      }
    });

    log("Selective analysis completed.");
    return { results, analysisData };
  }

  // JSON download util
  function downloadJSON(data, filename = "analysis.json") {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download JSON:", e);
    }
  }

  // API to download data for specific step/key or entire dataset
  function userActionDownload(target = "analysisData", filename) {
    let data = null;
    if (typeof target === "number" && stepsRegistry[target]) {
      const { name, key } = stepsRegistry[target];
      data = analysisData[key];
      if (filename == null) filename = `step-${target}-${key}.json`;
      if (data == null) {
        console.warn(
          `No data present for step ${target} (${name}). Run it first with userActionRun(${target}).`
        );
        return;
      }
      downloadJSON(data, filename);
      return;
    }

    if (typeof target === "string" && target !== "analysisData") {
      data = analysisData[target];
      if (filename == null) filename = `${target}.json`;
      if (data == null) {
        console.warn(`No data present for key '${target}'.`);
        return;
      }
      downloadJSON(data, filename);
      return;
    }

    // Default: whole dataset
    if (filename == null) filename = "analysisData.json";
    downloadJSON(analysisData, filename);
  }

  // Remove highlights API (uses class-based highlight)
  function removeHighlightsAPI() {
    if (
      Array.isArray(analysisData.interactiveElements) &&
      analysisData.interactiveElements.length
    ) {
      removeHighlights(analysisData.interactiveElements);
    } else {
      console.warn("No highlights recorded. Run step 2 first.");
    }
  }

  // --- Full Analysis executor ---
  function executeFullAnalysis() {
    console.log("Starting comprehensive user action flow analysis...");

    // Run all steps and assign output to analysisData
    analysisData.elements = getAllElementsWithAttributes();
    console.log("✓ Elements extracted");

    const highlightedElements = highlightInteractiveElements();
    console.log("✓ Interactive elements highlighted");

    analysisData.eventTriggers = getEventTriggers();
    console.log("✓ Event triggers identified");

    analysisData.eventListeners = getEventListeners();
    console.log("✓ Event listeners identified");

    analysisData.eventHandlers = getEventHandlers();
    console.log("✓ Event handlers identified");

    analysisData.stackTraces = traceElementStacks(); // Hooks installed, live capture starts
    console.log("✓ Stack traces capturing enabled");

    analysisData.ajaxData = trackAjaxRequests();
    console.log("✓ AJAX tracking initialized");

    analysisData.stateMap = mapJavaScriptState();
    console.log("✓ JavaScript state mapped");

    analysisData.domState = mapFullDOMState();
    console.log("✓ DOM state mapped");

    const mutationObserver = observeDOMMutations();
    analysisData.mutations = mutationObserver.mutations;
    console.log("✓ DOM mutation observer started");

    analysisData.userActions = trackUserActions();
    console.log("✓ User action tracking started");

    analysisData.hiddenElements = detectHiddenElements();
    console.log("✓ Hidden elements detected");

    analysisData.functionalityStates = mapUserFunctionalityStates();
    console.log("✓ User functionality states mapped");

    // Remove highlights after 5 seconds
    setTimeout(() => {
      removeHighlights(highlightedElements);
      console.log("✓ Highlights removed");
    }, 5000);

    console.log("=== ANALYSIS COMPLETE ===");
    console.log("Data collected:", analysisData);

    return analysisData;
  }

  // --- Expose global APIs ---
  window.userActionRun = runSteps;
  window.userActionGetSteps = getStepsList;
  window.userActionDownload = userActionDownload;
  window.userActionRemoveHighlights = removeHighlightsAPI;
  window.userActionAnalysis = executeFullAnalysis;

  window.userActionAnalysisFunctions = {
    getAllElementsWithAttributes,
    highlightInteractiveElements,
    getEventTriggers,
    getEventListeners,
    getEventHandlers,
    traceElementStacks,
    trackAjaxRequests,
    mapJavaScriptState,
    mapFullDOMState,
    observeDOMMutations,
    trackUserActions,
    detectHiddenElements,
    mapUserFunctionalityStates,
    removeHighlights,
  };

  // --- Banner UI (unchanged from original, uses class-based highlight for uniformity) ---

  (function () {
    function applyPosition(host, position) {
      host.style.top =
        host.style.right =
        host.style.bottom =
        host.style.left =
          "auto";
      switch (position) {
        case "top-left":
          host.style.top = "16px";
          host.style.left = "16px";
          break;
        case "top-right":
          host.style.top = "16px";
          host.style.right = "16px";
          break;
        case "bottom-left":
          host.style.bottom = "16px";
          host.style.left = "16px";
          break;
        case "bottom-right":
        default:
          host.style.bottom = "16px";
          host.style.right = "16px";
          break;
      }
    }

    function renderStepsPanel(shadowRoot, statusEl) {
      const panel = shadowRoot.getElementById("uafa-steps-panel");
      if (!panel) return;
      const steps =
        (window.userActionGetSteps && window.userActionGetSteps()) || [];
      const items = steps
        .map(
          (s) =>
            `<label class="uafa-step"><input type="checkbox" value="${s.step}"><span class="num">${s.step}</span> <span class="name">${s.name}</span></label>`
        )
        .join("");

      panel.innerHTML = `
        <div class="uafa-steps-header">Select steps to run</div>
        <div class="uafa-steps-list">${items}</div>
        <div class="uafa-steps-actions">
          <button id="uafa-run-selected" class="uafa-btn uafa-primary">Run Selected</button>
          <button id="uafa-clear-selected" class="uafa-btn">Clear</button>
        </div>
      `;

      const runBtn = shadowRoot.getElementById("uafa-run-selected");
      const clearBtn = shadowRoot.getElementById("uafa-clear-selected");
      runBtn.onclick = () => {
        try {
          const checked = Array.from(
            panel.querySelectorAll('input[type="checkbox"]:checked')
          ).map((i) => Number(i.value));
          if (!checked.length) {
            statusEl.textContent = "No steps selected.";
            return;
          }
          statusEl.textContent = `Running steps: ${checked.join(", ")}`;
          const res = window.userActionRun
            ? window.userActionRun(checked)
            : null;
          statusEl.textContent = "Steps finished. Inspect console for details.";
          console.log("Selective run results:", res);
        } catch (e) {
          console.error(e);
          statusEl.textContent = "Error running selected steps (see console).";
        }
      };
      clearBtn.onclick = () => {
        panel
          .querySelectorAll('input[type="checkbox"]')
          .forEach((i) => (i.checked = false));
        statusEl.textContent = "Cleared selections.";
      };
    }

    function buildBanner(shadowRoot, title, subtitle, author) {
      const style = document.createElement("style");
      style.textContent = `
        :host { all: initial; }
        .uafa-wrap { width: 360px; color: #fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
        .uafa-card {
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          background-size: 200% 200%;
          animation: uafaGradient 8s ease infinite;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 0 0 2px rgba(255,255,255,0.08) inset;
          overflow: hidden;
        }
        @keyframes uafaGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .uafa-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; backdrop-filter: blur(3px); background: rgba(0,0,0,0.15); }
        .uafa-title { font-weight: 700; letter-spacing: 0.2px; }
        .uafa-author { font-size: 12px; opacity: 0.85; }
        .uafa-actions { display: flex; gap: 6px; }
        .uafa-iconbtn { appearance: none; border: none; background: rgba(255,255,255,0.15); color: #fff; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; transition: transform .15s ease, background .2s ease; }
        .uafa-iconbtn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.25); }
        .uafa-body { padding: 12px 14px; }
        .uafa-sub { font-size: 12px; opacity: 0.9; margin-bottom: 8px; }
        .uafa-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .uafa-btn {
          appearance: none; border: none; cursor: pointer; padding: 8px 10px; border-radius: 8px;
          background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; font-size: 13px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
        }
        .uafa-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.2); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
        .uafa-primary { background: linear-gradient(135deg, #ff9966, #ff5e62); }
        .uafa-primary:hover { filter: brightness(1.05); }
        .uafa-steps { padding: 10px 14px 14px; background: rgba(0,0,0,0.15); border-top: 1px solid rgba(255,255,255,0.15); }
        .uafa-steps[hidden] { display: none; }
        .uafa-steps-header { font-weight: 700; margin-bottom: 8px; font-size: 13px; }
        .uafa-steps-list { max-height: 180px; overflow: auto; display: grid; gap: 6px; padding-right: 4px; }
        .uafa-step { display: flex; gap: 8px; align-items: center; background: rgba(255,255,255,0.08); padding: 6px 8px; border-radius: 6px; }
        .uafa-step input { accent-color: #00e5ff; }
        .uafa-step .num { font-weight: 700; width: 20px; text-align: right; opacity: 0.9; }
        .uafa-step .name { flex: 1; font-size: 12px; }
        .uafa-steps-actions { display: flex; gap: 8px; margin-top: 8px; }
        .uafa-status { padding: 8px 14px 12px; font-size: 12px; opacity: 0.95; }
        .uafa-collapsed .uafa-body, .uafa-collapsed .uafa-steps, .uafa-collapsed .uafa-status, .uafa-collapsed .uafa-sub { display: none; }
        .uafa-collapsed .uafa-header { padding: 10px 12px; }
      `;

      const wrapper = document.createElement("div");
      wrapper.className = "uafa-wrap";
      wrapper.innerHTML = `
        <div class="uafa-card" id="uafa-card">
          <div class="uafa-header">
            <div>
              <div class="uafa-title">${title}</div>
              <div class="uafa-author">Author: ${author}</div>
            </div>
            <div class="uafa-actions">
              <button class="uafa-iconbtn" id="uafa-min" title="Minimize">_</button>
              <button class="uafa-iconbtn" id="uafa-close" title="Close">×</button>
            </div>
          </div>
          <div class="uafa-body">
            <div class="uafa-sub">${subtitle}</div>
            <div class="uafa-btns">
              <button class="uafa-btn uafa-primary" id="uafa-run-all">Run All</button>
              <button class="uafa-btn" id="uafa-steps-btn">Steps…</button>
              <button class="uafa-btn" id="uafa-download">Download</button>
              <button class="uafa-btn" id="uafa-unhighlight">Unhighlight</button>
            </div>
          </div>
          <div class="uafa-steps" id="uafa-steps-panel" hidden></div>
          <div class="uafa-status" id="uafa-status" aria-live="polite"></div>
        </div>
      `;

      shadowRoot.append(style, wrapper);

      const statusEl = shadowRoot.getElementById("uafa-status");

      // Bind interactions
      shadowRoot.getElementById("uafa-run-all").onclick = () => {
        try {
          statusEl.textContent = "Running all steps...";
          const res = window.userActionRun ? window.userActionRun("all") : null;
          statusEl.textContent =
            "All steps finished. Inspect console for details.";
          console.log("Full run results:", res);
        } catch (e) {
          console.error(e);
          statusEl.textContent = "Error running all steps (see console).";
        }
      };

      shadowRoot.getElementById("uafa-download").onclick = () => {
        try {
          window.userActionDownload &&
            window.userActionDownload("analysisData");
          statusEl.textContent = "Downloaded analysisData.json";
        } catch (e) {
          console.error(e);
          statusEl.textContent = "Download failed.";
        }
      };

      shadowRoot.getElementById("uafa-unhighlight").onclick = () => {
        try {
          window.userActionRemoveHighlights &&
            window.userActionRemoveHighlights();
          statusEl.textContent = "Highlights removed.";
        } catch (e) {
          console.error(e);
          statusEl.textContent = "Failed to remove highlights.";
        }
      };

      const stepsBtn = shadowRoot.getElementById("uafa-steps-btn");
      const stepsPanel = shadowRoot.getElementById("uafa-steps-panel");
      stepsBtn.onclick = () => {
        const willShow = stepsPanel.hasAttribute("hidden");
        stepsPanel.toggleAttribute("hidden", !willShow);
        if (willShow) renderStepsPanel(shadowRoot, statusEl);
      };

      shadowRoot.getElementById("uafa-close").onclick = () => {
        window.userActionHideBanner && window.userActionHideBanner();
      };
      shadowRoot.getElementById("uafa-min").onclick = () => {
        const card = shadowRoot.getElementById("uafa-card");
        card.classList.toggle("uafa-collapsed");
      };
    }

    function userActionShowBanner(opts = {}) {
      try {
        const {
          author = "ArkhAngelLifeJiggy",
          title = "User Action Flow Analysis",
          subtitle = "Selective steps 1–13 · JSON export · Highlights",
          position = "bottom-right",
        } = opts;

        if (window.__uafaBannerHost && window.__uafaBannerHost.isConnected) {
          window.__uafaBannerHost.remove();
        }

        const host = document.createElement("div");
        host.id = "uafa-banner-host";
        host.style.position = "fixed";
        host.style.zIndex = "2147483647";
        host.style.pointerEvents = "auto";
        applyPosition(host, position);

        const shadow = host.attachShadow({ mode: "open" });
        buildBanner(shadow, title, subtitle, author);

        document.body.appendChild(host);
        window.__uafaBannerHost = host;

        window.__uafaBannerOpts = opts;
      } catch (e) {
        console.error("Failed to show banner:", e);
      }
    }

    function userActionHideBanner() {
      try {
        if (window.__uafaBannerHost && window.__uafaBannerHost.isConnected) {
          window.__uafaBannerHost.remove();
        }
        window.__uafaBannerHost = null;
      } catch (e) {
        console.error("Failed to hide banner:", e);
      }
    }

    window.userActionShowBanner = userActionShowBanner;
    window.userActionHideBanner = userActionHideBanner;
  })();

  // Console log usage instructions
  console.log(
    "User Action Flow Analysis Tool loaded. Use:\n" +
      "- window.userActionAnalysis() for full run\n" +
      "- window.userActionRun(steps, { silent: true|false }) to run selected steps (number | [numbers] | 'all')\n" +
      "- window.userActionGetSteps() to list steps\n" +
      "- window.userActionDownload(target, filename?) to download JSON (target: number | key | 'analysisData')\n" +
      "- window.userActionRemoveHighlights() to revert step 2 highlights\n" +
      "- window.userActionShowBanner(options?) to display banner\n" +
      "- window.userActionHideBanner() to remove banner"
  );

  // Auto-show banner with defaults
  try {
    window.userActionShowBanner && window.userActionShowBanner();
  } catch (e) {}
})();
