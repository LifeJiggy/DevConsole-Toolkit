// 🧠 Universal Parameter Extractor (Client-Side, Ultimate Edition + Banner UI)
// Extracts parameters from everywhere, checks for DOM reflection/sinks, highlights dangerous sinks, and exports results.
// Now with: network request parameter extraction from all DOM/network sources, robust visual highlighting, optional real-time/continuous scanning, payload injection stubs, and a colorful interactive banner UI.

(function () {
  const paramMap = new Map();
  let observer = null;
  let realTimeActive = false;
  let payloadMode = false;
  let rtTimeoutId = null;

  // === Settings and Utilities (quiet, validation, helpers) ===
  const SETTINGS = {
    quiet: true, // default to no-noise
    includeWindowGlobals: false,
    realTimeIntervalMs: 3000,
    scanSelector: null, // limit scan to selector subtree if set
    logLevel: "error", // "silent" | "error" | "warn" | "info" | "debug"
    caseInsensitive: true, // matching behavior for reflections/highlights
    maxHistory: 200, // cap per-param history entries to avoid memory growth
    autoPatchNetwork: false, // if true, patch network on banner show
  };

  // Wired: __origConsole.error used in catch blocks; _log respects SETTINGS.quiet
  const __origConsole = {
    error: console.error.bind(console),
  };
  // Wired: withQuietLogging replaced by _log helper that respects SETTINGS.quiet
  function _log(level, ...args) {
    if (SETTINGS.quiet && (level === "log" || level === "info")) return;
    if (SETTINGS.logLevel === "silent") return;
    const levels = ["silent", "error", "warn", "info", "debug"];
    const lvlIdx = levels.indexOf(level);
    const cfgIdx = levels.indexOf(SETTINGS.logLevel);
    if (lvlIdx <= cfgIdx) {
      try { console[level](...args); } catch {}
    }
  }
  function _table(data) {
    if (SETTINGS.logLevel === "silent" || SETTINGS.quiet) return;
    try { console.table(data); } catch {}
  }
  function _domReady() {
    return !!(document && document.body && document.querySelectorAll);
  }
  const _MAX_ELEMENTS = 5000;

  function htmlDecode(s) {
    try {
      const d = document.createElement("textarea");
      d.innerHTML = String(s);
      return d.value;
    } catch {
      return s;
    }
  }
  function decodeURIComponentSafe(s) {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  }
  function attrEscape(s) {
    return String(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // Wired: findMatchIndex returns {index, length, matched} for highlight positioning
  function findMatchIndex(haystack, needle) {
    if (haystack == null || needle == null) return null;
    const hay = String(haystack);
    const candidates = [
      String(needle),
      String(decodeURIComponentSafe(needle)),
      String(htmlDecode(needle)),
      String(attrEscape(needle)),
    ];
    if (SETTINGS.caseInsensitive) {
      const hayL = hay.toLowerCase();
      for (const n of candidates) {
        if (typeof n !== "string" || !n) continue;
        const idx = hayL.indexOf(String(n).toLowerCase());
        if (idx !== -1) return { index: idx, length: n.length, matched: n };
      }
    } else {
      for (const n of candidates) {
        if (typeof n !== "string" || !n) continue;
        const idx = hay.indexOf(String(n));
        if (idx !== -1) return { index: idx, length: n.length, matched: n };
      }
    }
    return null;
  }
  function matchesAnyEncoding(haystack, needle) {
    return findMatchIndex(haystack, needle) !== null;
  }

  // Non-destructive highlighting state
  const highlightMarkers = [];
  const outlinedElements = new Set();
  function clearHighlights() {
    for (const span of highlightMarkers.splice(0)) {
      try {
        const parent = span.parentNode;
        if (!parent) continue;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      } catch {}
    }
    outlinedElements.forEach((el) => {
      try {
        if (el && el.dataset) {
          el.style.outline = el.dataset.upeOldOutline || "";
          delete el.dataset.upeOldOutline;
        }
      } catch {}
    });
    outlinedElements.clear();
  }

  // Scan scope helpers
  function getScanRoots() {
    if (!SETTINGS.scanSelector) return [document];
    try {
      const nodes = Array.from(
        document.querySelectorAll(SETTINGS.scanSelector)
      );
      return nodes.length ? nodes : [document];
    } catch {
      return [document];
    }
  }
  function forEachRoot(cb) {
    try {
      getScanRoots().forEach(cb);
    } catch {
      cb(document);
    }
  }

  // Network helpers and patching
  function toPlainHeaders(headers) {
    const out = {};
    try {
      if (headers && typeof headers.forEach === "function") {
        headers.forEach((v, k) => (out[k] = v));
      } else if (headers && typeof headers === "object") {
        Object.entries(headers).forEach(([k, v]) => (out[k] = v));
      }
    } catch {}
    return out;
  }
  function parseBody(body) {
    try {
      if (!body) return { type: "none" };
      if (body instanceof FormData) {
        const entries = {};
        for (const [k, v] of body.entries()) entries[k] = v;
        return { type: "formdata", entries };
      }
      if (body instanceof URLSearchParams) {
        const entries = {};
        for (const [k, v] of body.entries()) entries[k] = v;
        return { type: "urlencoded", entries };
      }
      if (typeof body === "string") return { type: "text", value: body };
      if (body && typeof body === "object")
        return { type: "object", value: body };
    } catch {}
    return { type: "unknown" };
  }
  let __restoreNetworkFns = [];
  function patchNetwork() {
    if (window.__upe_fetchPatched) {
      _log("warn", "UPE: Network already patched");
      window.__upePatchNotice = "already_patched";
      return;
    }
    // Wired: interceptAPICalls is the canonical fetch/XHR patcher
    interceptAPICalls();
    __restoreNetworkFns.push(() => {
      window.__upe_fetchPatched = false;
    });

    // Patch DOM sinks: innerHTML, outerHTML, insertAdjacentHTML, document.write,
    // timers with string callbacks, location redirects
    try {
      const ElementProto = Element.prototype;
      const origInnerHTML = Object.getOwnPropertyDescriptor(ElementProto, "innerHTML");
      const origOuterHTML = Object.getOwnPropertyDescriptor(ElementProto, "outerHTML");
      const origInsertAdjacentHTML = ElementProto.insertAdjacentHTML;
      const origWrite = document.write;
      const origWriteln = document.writeln;
      const origSetTimeout = window.setTimeout;
      const origSetInterval = window.setInterval;
      const loc = window.location;
      const origLocAssign = loc.assign.bind(loc);
      const origLocReplace = loc.replace.bind(loc);

      if (origInnerHTML && origInnerHTML.set) {
        Object.defineProperty(ElementProto, "innerHTML", {
          ...origInnerHTML,
          set(value) {
            try { checkAgainstParams(value, "innerHTML"); } catch {}
            return origInnerHTML.set.call(this, value);
          },
        });
        __restoreNetworkFns.push(() =>
          Object.defineProperty(ElementProto, "innerHTML", origInnerHTML)
        );
      }
      if (origOuterHTML && origOuterHTML.set) {
        Object.defineProperty(ElementProto, "outerHTML", {
          ...origOuterHTML,
          set(value) {
            try { checkAgainstParams(value, "outerHTML"); } catch {}
            return origOuterHTML.set.call(this, value);
          },
        });
        __restoreNetworkFns.push(() =>
          Object.defineProperty(ElementProto, "outerHTML", origOuterHTML)
        );
      }
      if (origInsertAdjacentHTML) {
        ElementProto.insertAdjacentHTML = function (position, html) {
          try { checkAgainstParams(html, "insertAdjacentHTML"); } catch {}
          return origInsertAdjacentHTML.call(this, position, html);
        };
        __restoreNetworkFns.push(() => {
          ElementProto.insertAdjacentHTML = origInsertAdjacentHTML;
        });
      }
      if (origWrite) {
        document.write = function (html) {
          try { checkAgainstParams(html, "document.write"); } catch {}
          return origWrite.call(document, html);
        };
        __restoreNetworkFns.push(() => {
          document.write = origWrite;
        });
      }
      if (origWriteln) {
        document.writeln = function (html) {
          try { checkAgainstParams(html, "document.writeln"); } catch {}
          return origWriteln.call(document, html);
        };
        __restoreNetworkFns.push(() => {
          document.writeln = origWriteln;
        });
      }
      window.setTimeout = function (handler, timeout, ...args) {
        if (typeof handler === "string")
          checkAgainstParams(handler, "setTimeout(string)");
        return origSetTimeout.call(this, handler, timeout, ...args);
      };
      __restoreNetworkFns.push(() => {
        window.setTimeout = origSetTimeout;
      });
      window.setInterval = function (handler, timeout, ...args) {
        if (typeof handler === "string")
          checkAgainstParams(handler, "setInterval(string)");
        return origSetInterval.call(this, handler, timeout, ...args);
      };
      __restoreNetworkFns.push(() => {
        window.setInterval = origSetInterval;
      });

      // Patch window.location.href setter (most common redirect method)
      try {
        const locProto = Object.getPrototypeOf(window.location);
        const origHrefDesc = Object.getOwnPropertyDescriptor(locProto, "href") || Object.getOwnPropertyDescriptor(window.location, "href");
        if (origHrefDesc && origHrefDesc.set) {
          Object.defineProperty(window.location, "href", {
            get: origHrefDesc.get,
            set(val) {
              checkAgainstParams(val, "location.href");
              return origHrefDesc.set.call(window.location, val);
            },
            configurable: true,
          });
          __restoreNetworkFns.push(() => {
            if (origHrefDesc) Object.defineProperty(window.location, "href", origHrefDesc);
          });
        }
      } catch {}

      window.location.assign = function (url) {
        checkAgainstParams(url, "location.assign");
        return origLocAssign(url);
      };
      window.location.replace = function (url) {
        checkAgainstParams(url, "location.replace");
        return origLocReplace(url);
      };
      __restoreNetworkFns.push(() => {
        window.location.assign = origLocAssign;
        window.location.replace = origLocReplace;
      });
    } catch (e) {
      _log("warn", "UPE: sink patching failed", e);
    }
  }
  function unpatchNetwork() {
    __restoreNetworkFns.forEach((fn) => {
      try { fn(); } catch {}
    });
    __restoreNetworkFns = [];
  }

  // Generic sink checker
  function checkAgainstParams(str, where) {
    try {
      if (!str) return;
      const s = String(str);
      paramMap.forEach((entry, key) => {
        if (!entry || entry.value == null) return;
        if (matchesAnyEncoding(s, String(entry.value))) {
          addReflection(key, where, true);
          if (/\b(body|html)\b/i.test(where)) entry.reflectBody = true;
          entry.dangerousSink = true;
        }
      });
    } catch {}
  }

  function addParam(key, value, source) {
    if (!key) return;
    if (!paramMap.has(key)) paramMap.set(key, _newParamEntry());
    const entry = paramMap.get(key);
    entry.sources.add(source);
    const now = Date.now();
    if (value !== undefined && value !== null && value !== "") {
      entry.value = value;
      entry.lastUpdated = now;
      try {
        entry.values.push({ value, source, at: now });
        if (SETTINGS.maxHistory && entry.values.length > SETTINGS.maxHistory) {
          entry.values.splice(0, entry.values.length - SETTINGS.maxHistory);
        }
      } catch {}
    }
  }
  function addReflection(key, where, dangerous = false) {
    if (!key) return;
    if (!paramMap.has(key)) paramMap.set(key, _newParamEntry());
    paramMap.get(key).reflections.add(where);
    if (dangerous) paramMap.get(key).dangerousSink = true;
  }

  // Helper: extract params from a URL string
  function extractParamsFromURL(url, source) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.forEach((value, key) => {
        addParam(key, value, source);
        _log("log", `🌐 URL Param (${source}): ${key} = ${value}`);
      });
      // Also hash params (e.g. #foo=bar&baz=qux)
      if (u.hash && u.hash.includes("=")) {
        u.hash
          .replace(/^#/, "")
          .split("&")
          .forEach((pair) => {
            const eqIdx = pair.indexOf("=");
            if (eqIdx === -1) return;
            const k = decodeURIComponentSafe(pair.slice(0, eqIdx));
            const v = decodeURIComponentSafe(pair.slice(eqIdx + 1));
            if (k && v) {
              addParam(k, v, source + "-hash");
              _log("log", `🌐 Hash Param (${source}): ${k} = ${v}`);
            }
          });
      }
    } catch {}
  }

  // Extract from all DOM elements with URLs
  function extractDOMURLParams() {
    const urlAttrs = [
      { selector: "a[href]", attr: "href" },
      { selector: "form[action]", attr: "action" },
      { selector: "iframe[src]", attr: "src" },
      { selector: "img[src]", attr: "src" },
      { selector: "script[src]", attr: "src" },
      { selector: "link[href]", attr: "href" },
      { selector: "source[src]", attr: "src" },
      { selector: "video[src]", attr: "src" },
      { selector: "audio[src]", attr: "src" },
      { selector: "object[data]", attr: "data" },
    ];
    urlAttrs.forEach(({ selector, attr }) => {
      forEachRoot((root) => {
        try {
          safeQueryAll(root, selector).forEach((el) => {
            try {
              const url = el.getAttribute(attr);
              if (url && url.includes("=")) {
                extractParamsFromURL(url, "dom-" + attr);
              }
            } catch {}
          });
        } catch {}
      });
    });
  }

  // Helper: safe querySelectorAll on any root
  function safeQueryAll(root, selector) {
    return (root && root.querySelectorAll ? root : document).querySelectorAll(selector);
  }

  // 🌐 URL Query Parameters and Path Segments (current page)
  function extractURLParams() {
    try {
      extractParamsFromURL(window.location.href, "url");
      // Path segments: only extract each segment once as a value
      const pathSegments = window.location.pathname.split("/").filter((x) => x.length);
      pathSegments.forEach((seg, i) => {
        addParam(`segment${i}`, seg, "url-path");
        _log("log", `🟦 Path Segment Param: segment${i} = ${seg}`);
      });
    } catch {}
  }

  // 🍪 Cookies
  function extractCookies() {
    try {
      document.cookie.split(";").forEach((cookie) => {
        try {
          const idx = cookie.indexOf("=");
          if (idx === -1) return;
          const key = cookie.slice(0, idx).trim();
          const raw = cookie.slice(idx + 1);
          const value = decodeURIComponentSafe(raw);
          if (key) {
            addParam(key, value, "cookie");
            _log("log", "🍪 Cookie Param: " + key + " = " + value);
          }
        } catch {}
      });
    } catch {}
  }
  function extractMetaTags() {
    try {
      forEachRoot((root) =>
        safeQueryAll(root, "meta").forEach((meta) => {
          try {
            const name = meta.getAttribute("name") || meta.getAttribute("property");
            const content = meta.getAttribute("content");
            if (name && content) {
              addParam(name, content, "meta");
              _log("log", "🧬 Meta Param: " + name + " = " + content);
            }
          } catch {}
        })
      );
    } catch {}
  }
  function extractHiddenInputs() {
    try {
      forEachRoot((root) =>
        safeQueryAll(root, 'input[type="hidden"]').forEach((input) => {
          try {
            const key = input.name || input.id;
            addParam(key, input.value, "hidden-input");
            _log("log", "🙈 Hidden Param: " + key + " = " + input.value);
          } catch {}
        })
      );
      forEachRoot((root) =>
        safeQueryAll(root, '[hidden], [style*="display:none"], [style*="visibility:hidden"], [style*="display: none"], [style*="visibility: hidden"]').forEach((el) => {
          try {
            if (el.tagName === "INPUT" && el.type === "hidden") return;
            Array.from(el.attributes).forEach((attr) => {
              try {
                if (attr.name.startsWith("data-")) {
                  const key = attr.name.replace(/^data-/, "");
                  addParam(key, attr.value, "hidden-data-attr");
                  _log("log", "🙈 Hidden Data Param: " + key + " = " + attr.value);
                }
              } catch {}
            });
          } catch {}
        })
      );
    } catch {}
  }
  function extractFormFields() {
    try {
      forEachRoot((root) =>
        safeQueryAll(root, "form").forEach((form) => {
          try {
            const data = new FormData(form);
            for (let [key, value] of data.entries()) {
              addParam(key, value, "form");
              _log("log", "📝 Form Param: " + key + " = " + value);
            }
          } catch {}
        })
      );
    } catch {}
  }
  function extractInlineConfigs() {
    try {
      forEachRoot((root) =>
        safeQueryAll(root, "script").forEach((script) => {
          try {
            let content = script.textContent || "";
            if (content.length > 0) {
              try {
                const obj = JSON.parse(content);
                if (typeof obj === "object") {
                  Object.entries(obj).forEach(([key, value]) => {
                    addParam(key, value, "inline-json");
                    _log("log", "🧱 Inline JSON Param: " + key + " = " + value);
                  });
                }
              } catch {}
              const assignRegex =
                /([a-zA-Z0-9_$]+)\s*=\s*(["'`][^"'`]*["'`]|\d+(?:\.\d+)?|true|false|null);/g;
              let match;
              while ((match = assignRegex.exec(content))) {
                let key = match[1];
                let value = match[2];
                if (value && (value.startsWith('"') || value.startsWith("'") || value.startsWith("`")))
                  value = value.slice(1, -1);
                addParam(key, value, "inline-js");
                _log("log", "🧱 Inline JS Param: " + key + " = " + value);
              }
            }
          } catch {}
        })
      );
    } catch {}
    if (SETTINGS.includeWindowGlobals) {
      try {
        const keys = Object.keys(window).slice(0, 500);
        keys.forEach((key) => {
          try {
            if (typeof window[key] === "string" && window[key].length <= 200) {
              addParam(key, window[key], "window-global");
            }
          } catch {}
        });
      } catch {}
    }
  }

  // Intercept all fetch/XHR and extract params from URLs and bodies
  // Wired: interceptAPICalls merged into patchNetwork — this is the canonical network patching
  function interceptAPICalls() {
    if (window.__upe_fetchPatched) return;
    window.__upe_fetchPatched = true;
    const originalFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
      try {
        const url = typeof input === "string" ? input : (input && input.url) || "";
        extractParamsFromURL(url, "fetch-url");
        const headers = init.headers || {};
        if (headers && typeof headers === "object") {
          Object.entries(headers).forEach(([key, value]) => {
            addParam(key, value, "fetch-header");
          });
        }
        const body = init.body;
        if (body) {
          try {
            const parsed = typeof body === "string" ? JSON.parse(body) : body;
            if (typeof parsed === "object" && parsed !== null) {
              Object.entries(parsed).forEach(([key, value]) => {
                addParam(key, value, "fetch-body");
              });
            }
          } catch {
            addParam("raw_body", body, "fetch-body");
          }
        }
      } catch {}
      return originalFetch.call(this, input, init);
    };
    // Restore function for fetch
    __restoreNetworkFns.push(() => {
      window.fetch = originalFetch;
      window.__upe_fetchPatched = false;
    });

    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this._upe_method = method;
      this._upe_url = url;
      try { extractParamsFromURL(url, "xhr-url"); } catch {}
      return originalXHROpen.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function (body) {
      if (body) {
        try {
          const parsed = typeof body === "string" ? JSON.parse(body) : body;
          if (typeof parsed === "object" && parsed !== null) {
            Object.entries(parsed).forEach(([key, value]) => {
              addParam(key, value, "xhr-body");
            });
          }
        } catch {
          addParam("raw_body", body, "xhr-body");
        }
      }
      return originalXHRSend.call(this, body);
    };
    // Restore functions for XHR
    __restoreNetworkFns.push(() => {
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    });
  }

  function extractFromIframes() {
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        const win = iframe.contentWindow;
        if (!win || win === window) return;
        if (win.location && win.location.host === window.location.host) {
          try {
            const params = new URLSearchParams(win.location.search);
            for (const [key, value] of params.entries()) {
              addParam(key, value, "iframe-url");
            }
          } catch {}
        }
      } catch {}
    });
  }

  // Factory for default param entry (single source of truth)
  function _newParamEntry(value) {
    return {
      value: value !== undefined ? value : undefined,
      values: [],
      lastUpdated: 0,
      sources: new Set(),
      reflections: new Set(),
      reflectBody: false,
      reflectHead: false,
      dangerousSink: false,
    };
  }

  // Dangerous sink detection helpers — covers on* events, URL attrs, form actions, SVG, iframe
  const DANGEROUS_ATTRS = new Set([
    "src", "href", "action", "formaction", "data", "srcdoc", "xlink:href",
    "lowsrc", "dynsrc", "background", "poster",
  ]);
  function isDangerousAttr(attrName) {
    return /^on[a-z]+$/.test(attrName) || DANGEROUS_ATTRS.has(attrName);
  }

  function detectReflections() {
    try {
      const bodyEls = document.body ? document.body.querySelectorAll("*") : [];
      const headEls = document.head ? document.head.querySelectorAll("*") : [];
      const bodyLen = Math.min(bodyEls.length, _MAX_ELEMENTS);
      const headLen = Math.min(headEls.length, _MAX_ELEMENTS);
      paramMap.forEach((entry, key) => {
        try {
          if (!entry.value) return;
          if (
            document.body &&
            document.body.innerText &&
            matchesAnyEncoding(document.body.innerText, entry.value)
          ) {
            addReflection(key, "dom-text");
            entry.reflectBody = true;
          }
          if (
            document.head &&
            document.head.innerText &&
            matchesAnyEncoding(document.head.innerText, entry.value)
          ) {
            addReflection(key, "head-text");
            entry.reflectHead = true;
          }
          for (let i = 0; i < bodyLen; i++) {
            try {
              const el = bodyEls[i];
              Array.from(el.attributes).forEach((attr) => {
                try {
                  if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
                    addReflection(key, "body-attr:" + attr.name, isDangerousAttr(attr.name));
                    entry.reflectBody = true;
                  }
                } catch {}
              });
            } catch {}
          }
          for (let i = 0; i < headLen; i++) {
            try {
              const el = headEls[i];
              Array.from(el.attributes).forEach((attr) => {
                try {
                  if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
                    addReflection(key, "head-attr:" + attr.name, isDangerousAttr(attr.name));
                    entry.reflectHead = true;
                  }
                } catch {}
              });
            } catch {}
          }
          if (document.body) {
            document.body.querySelectorAll("script").forEach((script) => {
              try {
                if (script.textContent && matchesAnyEncoding(script.textContent, entry.value)) {
                  addReflection(key, "body-script-block", true);
                  entry.reflectBody = true;
                }
              } catch {}
            });
          }
          if (document.head) {
            document.head.querySelectorAll("script").forEach((script) => {
              try {
                if (script.textContent && matchesAnyEncoding(script.textContent, entry.value)) {
                  addReflection(key, "head-script-block", true);
                  entry.reflectHead = true;
                }
              } catch {}
            });
          }
        } catch {}
      });
    } catch {}
  }

  // Visual Highlighting (robust, dangerous sinks in red, others in orange)
  function highlightReflectedParams() {
    try {
      // Scan known JS/DOM sinks that are not attribute-based
      try {
        const sinks = [];
        paramMap.forEach((entry, key) => {
          try {
            if (!entry.value) return;
            const v = String(entry.value);
            if (document.body && matchesAnyEncoding(document.body.innerHTML, v)) {
              addReflection(key, "body-innerHTML", true);
              entry.reflectBody = true;
              entry.dangerousSink = true;
            }
            if (document.head && matchesAnyEncoding(document.head.innerHTML, v)) {
              addReflection(key, "head-innerHTML", true);
              entry.reflectHead = true;
              entry.dangerousSink = true;
            }
          } catch {}
        });
      } catch {}
      clearHighlights();
      const bodyEls = document.body ? document.body.querySelectorAll("*") : [];
      const headEls = document.head ? document.head.querySelectorAll("*") : [];
      const bodyLen = Math.min(bodyEls.length, _MAX_ELEMENTS);
      const headLen = Math.min(headEls.length, _MAX_ELEMENTS);
      paramMap.forEach((entry, key) => {
        try {
          if (!entry.value) return;
          // Highlight attributes
          for (let i = 0; i < bodyLen; i++) {
            try {
              const el = bodyEls[i];
              Array.from(el.attributes).forEach((attr) => {
                try {
                  if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
                    if (!el.dataset.upeOldOutline)
                      el.dataset.upeOldOutline = el.style.outline || "";
                    el.style.outline = isDangerousAttr(attr.name)
                      ? "2px solid red"
                      : "2px solid orange";
                    el.title = "Reflected param: " + key;
                    outlinedElements.add(el);
                  }
                } catch {}
              });
            } catch {}
          }
          for (let i = 0; i < headLen; i++) {
            try {
              const el = headEls[i];
              Array.from(el.attributes).forEach((attr) => {
                try {
                  if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
                    if (!el.dataset.upeOldOutline)
                      el.dataset.upeOldOutline = el.style.outline || "";
                    el.style.outline = isDangerousAttr(attr.name)
                      ? "2px solid red"
                      : "2px solid orange";
                    el.title = "Reflected param: " + key;
                    outlinedElements.add(el);
                  }
                } catch {}
              });
            } catch {}
          }
          // Highlight text nodes
          function highlightTextNodes(root) {
            try {
              if (!root) return;
              const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
              let node;
              while ((node = walker.nextNode())) {
                try {
                  if (!node.nodeValue || typeof node.nodeValue !== "string") continue;
                  if (!matchesAnyEncoding(node.nodeValue, entry.value)) continue;
                  const raw = String(node.nodeValue);
                  let searchStart = 0;
                  while (searchStart < raw.length) {
                    const match = findMatchIndex(raw.slice(searchStart), entry.value);
                    if (!match) break;
                    const idx = searchStart + match.index;
                    try {
                      const range = document.createRange();
                      range.setStart(node, idx);
                      range.setEnd(node, idx + match.length);
                      const span = document.createElement("span");
                      span.style.background = entry.dangerousSink ? "rgba(255,0,0,0.3)" : "rgba(255,165,0,0.3)";
                      span.title = "Reflected param: " + key;
                      range.surroundContents(span);
                      highlightMarkers.push(span);
                    } catch {}
                    searchStart = idx + match.length;
                  }
                } catch {}
              }
            } catch {}
          }
          highlightTextNodes(document.body);
          highlightTextNodes(document.head);
          // Highlight script blocks
          if (document.body) {
            document.body.querySelectorAll("script").forEach((script) => {
              try {
                if (script.textContent && matchesAnyEncoding(script.textContent, entry.value)) {
                  if (!script.dataset.upeOldOutline)
                    script.dataset.upeOldOutline = script.style.outline || "";
                  script.style.outline = "2px solid red";
                  script.title = "Reflected param (script): " + key;
                  outlinedElements.add(script);
                }
              } catch {}
            });
          }
          if (document.head) {
            document.head.querySelectorAll("script").forEach((script) => {
              try {
                if (script.textContent && matchesAnyEncoding(script.textContent, entry.value)) {
                  if (!script.dataset.upeOldOutline)
                    script.dataset.upeOldOutline = script.style.outline || "";
                  script.style.outline = "2px solid red";
                  script.title = "Reflected param (script): " + key;
                  outlinedElements.add(script);
                }
              } catch {}
            });
          }
        } catch {}
      });
      if (SETTINGS.logLevel !== "silent")
        _log("info", "Highlighted reflected parameters in DOM.");
    } catch (e) {
      _log("error", "highlightReflectedParams failed", e);
    }
  }
  window.highlightReflectedParams = highlightReflectedParams;

  // CSV Export
  function exportParamReflectionsCSV() {
    const rows = [
      [
        "Param",
        "Value",
        "Reflection",
        "Head",
        "Body",
        "DOM/Sink",
        "Dangerous Sink",
        "Sources",
      ],
    ];
    paramMap.forEach((entry, key) => {
      const domSink =
        entry.reflectBody || entry.reflectHead || entry.reflections.size > 0
          ? "yes"
          : "no";
      const bodyRef = entry.reflectBody ? "yes" : "no";
      const headRef = entry.reflectHead ? "yes" : "no";
      const dangerous = entry.dangerousSink ? "yes" : "no";
      rows.push([
        key,
        typeof entry.value === "object"
          ? JSON.stringify(entry.value)
          : entry.value,
        entry.reflections.size > 0
          ? Array.from(entry.reflections).join("; ")
          : "",
        headRef,
        bodyRef,
        domSink,
        dangerous,
        Array.from(entry.sources).join("; "),
      ]);
    });
    const csv = rows
      .map((r) =>
        r
          .map((v) =>
            typeof v === "string"
              ? `"${(v || "").replace(/"/g, '""')}"`
              : `"${JSON.stringify(v)}"`
          )
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "param_reflections.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    _log("info", "CSV exported.");
  }
  window.exportParamReflectionsCSV = exportParamReflectionsCSV;

  function extractAllParameters() {
    try { extractURLParams(); } catch (e) { _log("error", "extractURLParams failed", e); }
    try { extractDOMURLParams(); } catch (e) { _log("error", "extractDOMURLParams failed", e); }
    try { extractCookies(); } catch (e) { _log("error", "extractCookies failed", e); }
    try { extractMetaTags(); } catch (e) { _log("error", "extractMetaTags failed", e); }
    try { extractHiddenInputs(); } catch (e) { _log("error", "extractHiddenInputs failed", e); }
    try { extractFormFields(); } catch (e) { _log("error", "extractFormFields failed", e); }
    try { extractInlineConfigs(); } catch (e) { _log("error", "extractInlineConfigs failed", e); }
    try { extractFromIframes(); } catch (e) { _log("error", "extractFromIframes failed", e); }
    try { detectReflections(); } catch (e) { _log("error", "detectReflections failed", e); }
    // Output summary as table and JSON
    const table = [];
    const json = [];
    paramMap.forEach((entry, key) => {
      const domSink =
        entry.reflectBody || entry.reflectHead || entry.reflections.size > 0
          ? "yes"
          : "no";
      const bodyRef = entry.reflectBody ? "yes" : "no";
      const headRef = entry.reflectHead ? "yes" : "no";
      const dangerous = entry.dangerousSink ? "yes" : "no";
      table.push({
        Param: key,
        Value: entry.value,
        Reflection:
          entry.reflections.size > 0
            ? Array.from(entry.reflections).join(", ")
            : "",
        Head: headRef,
        Body: bodyRef,
        "DOM/Sink": domSink,
        "Dangerous Sink": dangerous,
        Sources: Array.from(entry.sources).join(", "),
      });
      json.push({
        param: key,
        value: entry.value,
        reflection: Array.from(entry.reflections),
        head: headRef,
        body: bodyRef,
        dom_sink: domSink,
        dangerous_sink: dangerous,
        sources: Array.from(entry.sources),
      });
    });
    if (table.length) {
      _log("info", "\n🧠 Parameter Reflection Table:");
      console.table(table);
    }
    window.PARAM_REFLECTIONS_JSON = json;
    _log("info", "\n🧠 Parameter Reflection JSON available as window.PARAM_REFLECTIONS_JSON");
    _log("info", "🧠 To export as CSV, run: window.exportParamReflectionsCSV()");
    _log("info", "🧠 To highlight reflected params in DOM, run: window.highlightReflectedParams()");
  }

  // Real-time/continuous scanning (optional, only if user calls it)
  function startRealTimeScan(intervalMs = 3000) {
    if (realTimeActive) return;
    realTimeActive = true;
    const startTime = Date.now();
    function loop() {
      if (!realTimeActive) return;
      try {
        clearHighlights();
        extractAllParameters();
      } catch {}
      const elapsed = Date.now() - startTime;
      const nextDelay = Math.max(100, intervalMs - (Date.now() - startTime - elapsed));
      rtTimeoutId = setTimeout(loop, nextDelay);
    }
    loop();
    _log("info", "Real-time parameter extraction started.");
  }
  function stopRealTimeScan() {
    realTimeActive = false;
    if (rtTimeoutId) { clearTimeout(rtTimeoutId); rtTimeoutId = null; }
    try { clearHighlights(); } catch {}
    _log("info", "Real-time parameter extraction stopped.");
  }
  window.startRealTimeParamScan = startRealTimeScan;
  window.stopRealTimeParamScan = stopRealTimeScan;

  // Payload injection/active testing (stub, user can extend)
  function injectPayloads(payload = "__UPE_PAYLOAD__") {
    try {
      // Remove any previously injected fields to avoid duplicates
      document.querySelectorAll('input[name="upe_test"]').forEach((el) => el.remove());
      document.querySelectorAll("form").forEach((form) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "upe_test";
        input.value = payload;
        form.appendChild(input);
      });
      document.cookie = `upe_test=${encodeURIComponent(payload)}; path=/`;
      _log("info", `Payload '${payload}' injected into forms and cookies.`);
    } catch (e) {
      _log("error", "injectPayloads failed", e);
    }
  }
  window.injectParamPayloads = injectPayloads;

  // Banner UI
  function showBanner() {
    try {
      if (!_domReady()) {
        _log("error", "UPE: document.body not ready");
        return;
      }
      const currentStatus = () =>
        window.__upe_fetchPatched ? "patched" : "unpatched";
      if (window.__upeBannerHost && window.__upeBannerHost.isConnected) {
      window.__upeBannerHost.remove();
    }
    const host = document.createElement("div");
    host.id = "upe-banner-host";
    host.style.position = "fixed";
    host.style.bottom = "16px";
    host.style.right = "16px";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "auto";
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      .upe-card {
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        color: #fff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        width: 340px;
        font-family: system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        overflow: hidden;
      }
      .upe-header { padding: 12px 14px; font-weight: 700; font-size: 16px; background: rgba(0,0,0,0.12); }
      .upe-body { padding: 12px 14px; }
      .upe-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
      .upe-btn {
        appearance: none; border: none; cursor: pointer; padding: 8px 10px; border-radius: 8px;
        background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
      }
      .upe-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.2); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
      .upe-primary { background: linear-gradient(135deg, #ff9966, #ff5e62); }
      .upe-status { padding: 8px 0 0 0; font-size: 12px; opacity: 0.95; min-height: 18px; }
      .upe-close { position: absolute; top: 8px; right: 12px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
    `;
    const wrapper = document.createElement("div");
    wrapper.className = "upe-card";
    wrapper.innerHTML = `
      <div class="upe-header">🧠 Universal Parameter Extractor <button class="upe-close" title="Close">×</button></div>
      <div class="upe-body">
        <div class="upe-btns">
          <button class="upe-btn upe-primary" id="upe-extract">Extract</button>
          <button class="upe-btn" id="upe-highlight">Highlight</button>
          <button class="upe-btn" id="upe-csv">Export CSV</button>
          <button class="upe-btn" id="upe-json">Show JSON</button>
          <button class="upe-btn" id="upe-rt">Real-Time</button>
          <button class="upe-btn" id="upe-stoprt">Stop RT</button>
          <button class="upe-btn" id="upe-payload">Inject Payload</button>
          <button class="upe-btn" id="upe-clear">Clear Highlights</button>
          <button class="upe-btn" id="upe-unpatch">Unpatch Network</button>
        </div>
        <div class="upe-status" id="upe-status"></div>
        <div style="margin-top:8px; padding:8px; background: rgba(0,0,0,0.15); border-radius:8px;">
          <div style="font-weight:600; margin-bottom:6px;">Settings</div>
          <label style="display:flex; align-items:center; gap:6px; margin:4px 0;">
            <input type="checkbox" id="upe-include-globals" /> includeWindowGlobals
          </label>
          <label style="display:flex; align-items:center; gap:6px; margin:4px 0;">
            interval(ms)
            <input type="number" min="500" step="500" id="upe-rt-interval" style="width:100px; border-radius:6px; padding:4px; border:none;"/>
          </label>
          <label style="display:flex; align-items:center; gap:6px; margin:4px 0;">
            logLevel
            <select id="upe-loglevel" style="border-radius:6px; padding:4px; border:none;">
              <option value="silent">silent</option>
              <option value="error">error</option>
              <option value="warn">warn</option>
              <option value="info">info</option>
              <option value="debug">debug</option>
            </select>
          </label>
          <label style="display:flex; align-items:center; gap:6px; margin:4px 0;">
            scan selector
            <input type="text" id="upe-scan-selector" placeholder="e.g. #app" style="flex:1; border-radius:6px; padding:4px; border:none;"/>
          </label>
          <div style="display:flex; gap:8px; margin-top:6px;">
            <button class="upe-btn" id="upe-apply-settings">Apply</button>
            <span id="upe-net-status" style="font-size:12px; opacity:0.9;">Network: ${currentStatus()}</span>
          </div>
        </div>
      </div>
    `;
    shadow.append(style, wrapper);
    const statusEl = shadow.getElementById("upe-status");
    shadow.getElementById("upe-extract").onclick = () => {
      window.extractAllParameters();
      statusEl.textContent = "Extraction complete. See console/table.";
    };
    shadow.getElementById("upe-highlight").onclick = () => {
      window.highlightReflectedParams();
      statusEl.textContent = "Highlighted reflected params in DOM.";
    };
    shadow.getElementById("upe-csv").onclick = () => {
      window.exportParamReflectionsCSV();
      statusEl.textContent = "CSV exported.";
    };
    shadow.getElementById("upe-json").onclick = () => {
      statusEl.textContent = "See window.PARAM_REFLECTIONS_JSON.";
      console.log("PARAM_REFLECTIONS_JSON:", window.PARAM_REFLECTIONS_JSON);
    };
    // prefill settings
    try {
      shadow.getElementById("upe-include-globals").checked =
        !!SETTINGS.includeWindowGlobals;
      shadow.getElementById("upe-rt-interval").value =
        Number(SETTINGS.realTimeIntervalMs) || 3000;
      shadow.getElementById("upe-loglevel").value =
        SETTINGS.logLevel || "error";
      shadow.getElementById("upe-scan-selector").value =
        SETTINGS.scanSelector || "";
    } catch {}
    shadow.getElementById("upe-apply-settings").onclick = () => {
      try {
        SETTINGS.includeWindowGlobals = !!shadow.getElementById(
          "upe-include-globals"
        ).checked;
        SETTINGS.realTimeIntervalMs =
          Number(shadow.getElementById("upe-rt-interval").value) || 3000;
        SETTINGS.logLevel = shadow.getElementById("upe-loglevel").value;
        SETTINGS.scanSelector =
          shadow.getElementById("upe-scan-selector").value || null;
        statusEl.textContent = "Settings applied.";
      } catch (e) {
        statusEl.textContent = "Failed to apply settings.";
      }
    };
    shadow.getElementById("upe-rt").onclick = () => {
      window.startRealTimeParamScan(SETTINGS.realTimeIntervalMs || 3000);
      statusEl.textContent = "Real-time scan started.";
    };
    shadow.getElementById("upe-stoprt").onclick = () => {
      window.stopRealTimeParamScan();
      statusEl.textContent = "Real-time scan stopped.";
    };
    shadow.getElementById("upe-payload").onclick = () => {
      window.injectParamPayloads();
      statusEl.textContent = "Payload injected.";
    };
    shadow.getElementById("upe-clear").onclick = () => {
      window.clearParamHighlights();
      statusEl.textContent = "Highlights cleared.";
    };
    shadow.getElementById("upe-unpatch").onclick = () => {
      window.unpatchNetwork();
      statusEl.textContent = "Network unpatched.";
    };
    shadow.querySelector(".upe-close").onclick = () => {
      host.remove();
    };
    document.body.appendChild(host);
    window.__upeBannerHost = host;
    } catch (e) {
      _log("error", "showBanner failed", e);
    }
  }
  window.showUPEBanner = showBanner;

  // Only run when user calls extractAllParameters (quiet by default)
  window.extractAllParameters = extractAllParameters;
  window.highlightReflectedParams = highlightReflectedParams;
  window.exportParamReflectionsCSV = exportParamReflectionsCSV;
  window.showUPEBanner = showBanner;
  window.startRealTimeParamScan = startRealTimeScan;
  window.stopRealTimeParamScan = stopRealTimeScan;
  window.injectParamPayloads = injectPayloads;
  window.patchNetwork = patchNetwork;
  window.unpatchNetwork = unpatchNetwork;
  window.clearParamHighlights = clearHighlights;
  window.interceptAPICalls = interceptAPICalls;

  // Auto-show banner on load
  showBanner();

  // ===================================================================
  // 20 ENHANCEMENTS - Advanced Parameter Security Analysis
  // ===================================================================

  // Enhancement 1: Analyze parameter security risk levels
  function analyzeParamSecurity() {
    try {
      const results = [];
      paramMap.forEach((entry, key) => {
        try {
          const risk = { param: key, value: String(entry.value || "").slice(0, 60), factors: [], score: 0 };
          if (entry.dangerousSink) { risk.factors.push("dangerous-sink"); risk.score += 40; }
          if (entry.reflections.size > 3) { risk.factors.push("many-reflections"); risk.score += 20; }
          if (entry.reflections.has("body-script-block") || entry.reflections.has("head-script-block")) { risk.factors.push("in-script-block"); risk.score += 30; }
          if (entry.reflectBody) { risk.factors.push("body-reflection"); risk.score += 15; }
          const nameLC = key.toLowerCase();
          if (/token|secret|password|key|auth|session|jwt/.test(nameLC)) { risk.factors.push("sensitive-name"); risk.score += 25; }
          if (/id|user|account|admin/.test(nameLC)) { risk.factors.push("pii-name"); risk.score += 10; }
          if (entry.sources.has("cookie")) { risk.factors.push("cookie-source"); risk.score += 10; }
          if (entry.sources.has("url") || entry.sources.has("url-hash")) { risk.factors.push("url-exposed"); risk.score += 15; }
          risk.level = risk.score >= 50 ? "CRITICAL" : risk.score >= 30 ? "HIGH" : risk.score >= 15 ? "MEDIUM" : "LOW";
          results.push(risk);
        } catch {}
      });
      results.sort((a, b) => b.score - a.score);
      _log("info", "=== Parameter Security Analysis (" + results.length + " params) ===");
      if (results.length) _table(results);
      return results;
    } catch (e) { _log("error", "analyzeParamSecurity failed", e); return []; }
  }
  window.analyzeParamSecurity = analyzeParamSecurity;

  // Enhancement 2: Detect parameter reflection depth (body text, attr, script, etc.)
  function detectParamReflectionDepth() {
    try {
      const depth = [];
      paramMap.forEach((entry, key) => {
        try {
          if (entry.reflections.size === 0) return;
          const locations = Array.from(entry.reflections);
          const isScript = locations.some(l => l.includes("script"));
          const isAttr = locations.some(l => l.includes("attr:"));
          const isBody = locations.some(l => l.includes("body"));
          const isHead = locations.some(l => l.includes("head"));
          depth.push({
            param: key,
            reflections: locations.length,
            inScript: isScript,
            inAttr: isAttr,
            inBodyText: isBody && !isAttr && !isScript,
            inHead: isHead,
            depth: (isScript ? 3 : 0) + (isAttr ? 2 : 0) + (isBody ? 1 : 0) + (isHead ? 1 : 0),
            risk: isScript ? "CRITICAL" : isAttr ? "HIGH" : isBody ? "MEDIUM" : "LOW",
          });
        } catch {}
      });
      depth.sort((a, b) => b.depth - a.depth);
      _log("info", "=== Reflection Depth Analysis ===");
      if (depth.length) _table(depth);
      return depth;
    } catch (e) { _log("error", "detectParamReflectionDepth failed", e); return []; }
  }
  window.detectParamReflectionDepth = detectParamReflectionDepth;

  // Enhancement 3: Map param sources → sinks flow
  function mapParamFlow() {
    try {
      const flows = [];
      paramMap.forEach((entry, key) => {
        try {
          if (!entry.value) return;
          const sources = Array.from(entry.sources);
          const sinks = Array.from(entry.reflections);
          if (sinks.length === 0) return;
          flows.push({
            param: key,
            sources: sources.join(", "),
            sinks: sinks.join(", "),
            sourceCount: sources.length,
            sinkCount: sinks.length,
            dangerous: entry.dangerousSink,
          });
        } catch {}
      });
      _log("info", "=== Parameter Flow Map (" + flows.length + " flows) ===");
      if (flows.length) _table(flows);
      return flows;
    } catch (e) { _log("error", "mapParamFlow failed", e); return []; }
  }
  window.mapParamFlow = mapParamFlow;

  // Enhancement 4: Detect sensitive parameter leakage in URLs/logs
  function detectSensitiveParamLeakage() {
    try {
      const leaks = [];
      const sensitivePatterns = /token|secret|password|key|auth|session|jwt|api[_-]?key|private/i;
      paramMap.forEach((entry, key) => {
        try {
          if (!sensitivePatterns.test(key)) return;
          if (entry.sources.has("url") || entry.sources.has("url-hash") || entry.sources.has("fetch-url") || entry.sources.has("xhr-url")) {
            leaks.push({ param: key, value: String(entry.value || "").slice(0, 40), sources: Array.from(entry.sources).join(", "), risk: "HIGH", issue: "Sensitive param in URL (logged in server logs, referrer, browser history)" });
          }
          if (entry.sources.has("cookie")) {
            leaks.push({ param: key, value: "[cookie]", sources: "cookie", risk: "MEDIUM", issue: "Sensitive param in cookie" });
          }
        } catch {}
      });
      _log("info", "=== Sensitive Param Leakage (" + leaks.length + " found) ===");
      if (leaks.length) _table(leaks);
      return leaks;
    } catch (e) { _log("error", "detectSensitiveParamLeakage failed", e); return []; }
  }
  window.detectSensitiveParamLeakage = detectSensitiveParamLeakage;

  // Enhancement 5: Analyze cookie security flags
  function analyzeCookieSecurity() {
    try {
      const results = [];
      document.cookie.split(";").forEach(c => {
        try {
          const name = c.trim().split("=")[0];
          const isSensitive = /session|token|auth|jwt|secret|key/i.test(name);
          results.push({
            name,
            sensitive: isSensitive,
            httpsOnly: location.protocol === "https:",
            note: isSensitive ? "Verify httpOnly + secure + SameSite flags server-side" : "Low risk",
          });
        } catch {}
      });
      _log("info", "=== Cookie Security Analysis (" + results.length + " cookies) ===");
      if (results.length) _table(results);
      return results;
    } catch (e) { _log("error", "analyzeCookieSecurity failed", e); return []; }
  }
  window.analyzeCookieSecurity = analyzeCookieSecurity;

  // Enhancement 6: Detect CORS-exposed parameters
  function detectCORSParams() {
    try {
      const findings = [];
      paramMap.forEach((entry, key) => {
        try {
          if (entry.sources.has("fetch-header") || entry.sources.has("xhr-header")) {
            const nameLC = key.toLowerCase();
            if (/origin|referer|cookie|authorization|token|key/.test(nameLC)) {
              findings.push({ param: key, risk: "HIGH", issue: "Sensitive header param may be exposed via CORS misconfiguration" });
            }
          }
        } catch {}
      });
      _log("info", "=== CORS Param Exposure (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "detectCORSParams failed", e); return []; }
  }
  window.detectCORSParams = detectCORSParams;

  // Enhancement 7: Scan GraphQL query parameters
  function scanGraphQLParams() {
    try {
      const findings = [];
      paramMap.forEach((entry, key) => {
        try {
          const val = String(entry.value || "");
          if (/query\s+\w+|mutation\s+\w+|subscription\s+\w+|__schema|__type/i.test(val)) {
            findings.push({ param: key, value: val.slice(0, 80), risk: "MEDIUM", issue: "GraphQL operation in parameter value" });
          }
        } catch {}
      });
      document.querySelectorAll("script:not([src])").forEach(s => {
        try {
          const code = s.textContent || "";
          if (/graphql|gql/i.test(code)) {
            const params = code.match(/["'](?:query|operationName|variables)["']\s*:/gi) || [];
            params.forEach(p => findings.push({ param: "inline-gql", value: p.slice(0, 60), risk: "INFO", issue: "GraphQL param in inline script" }));
          }
        } catch {}
      });
      _log("info", "=== GraphQL Param Scan (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "scanGraphQLParams failed", e); return []; }
  }
  window.scanGraphQLParams = scanGraphQLParams;

  // Enhancement 8: Detect JWT tokens in parameter values
  function detectJWTInParams() {
    try {
      const findings = [];
      const jwtRegex = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/;
      paramMap.forEach((entry, key) => {
        try {
          const val = String(entry.value || "");
          if (jwtRegex.test(val)) {
            findings.push({ param: key, value: val.slice(0, 40) + "...", risk: "HIGH", issue: "JWT token in parameter value" });
          }
        } catch {}
      });
      document.cookie.split(";").forEach(c => {
        try {
          const val = c.trim().split("=").slice(1).join("=");
          if (jwtRegex.test(val)) {
            findings.push({ param: c.split("=")[0].trim(), value: "[JWT in cookie]", risk: "MEDIUM", issue: "JWT token in cookie" });
          }
        } catch {}
      });
      _log("info", "=== JWT in Params (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "detectJWTInParams failed", e); return []; }
  }
  window.detectJWTInParams = detectJWTInParams;

  // Enhancement 9: Analyze form autocomplete security
  function analyzeFormAutocomplete() {
    try {
      const findings = [];
      document.querySelectorAll("form").forEach(form => {
        try {
          const sensitiveFields = form.querySelectorAll('input[name*="pass"],input[name*="token"],input[name*="key"],input[name*="secret"],input[name*="auth"],input[type="password"]');
          sensitiveFields.forEach(f => {
            try {
              const ac = f.getAttribute("autocomplete") || "not set";
              if (ac === "on" || ac === "not set") {
                findings.push({ form: form.action?.slice(0, 60) || "unknown", field: f.name || f.id || "unnamed", autocomplete: ac, risk: "LOW", issue: "Sensitive field may be cached by browser autocomplete" });
              }
            } catch {}
          });
        } catch {}
      });
      _log("info", "=== Form Autocomplete Security (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "analyzeFormAutocomplete failed", e); return []; }
  }
  window.analyzeFormAutocomplete = analyzeFormAutocomplete;

  // Enhancement 10: Detect open redirect parameters
  function detectOpenRedirectParams() {
    try {
      const findings = [];
      const redirectParams = ["redirect", "redirect_url", "redirect_uri", "return", "return_to", "next", "url", "goto", "target", "dest", "destination", "redir", "continue", "rurl"];
      paramMap.forEach((entry, key) => {
        try {
          if (redirectParams.some(p => key.toLowerCase().includes(p))) {
            const val = String(entry.value || "");
            const isExternal = /^https?:\/\//i.test(val) && !val.includes(location.hostname);
            findings.push({ param: key, value: val.slice(0, 80), external: isExternal, risk: isExternal ? "HIGH" : "MEDIUM", issue: isExternal ? "External URL in redirect param (open redirect)" : "Redirect parameter found" });
          }
        } catch {}
      });
      _log("info", "=== Open Redirect Params (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "detectOpenRedirectParams failed", e); return []; }
  }
  window.detectOpenRedirectParams = detectOpenRedirectParams;

  // Enhancement 11: Scan WebSocket URL parameters
  function scanWebSocketParams() {
    try {
      const findings = [];
      paramMap.forEach((entry, key) => {
        try {
          const val = String(entry.value || "");
          if (/^wss?:\/\//i.test(val)) {
            findings.push({ param: key, value: val.slice(0, 100), risk: "INFO", issue: "WebSocket URL in parameter" });
          }
        } catch {}
      });
      document.querySelectorAll("script:not([src])").forEach(s => {
        try {
          const code = s.textContent || "";
          const wsMatches = code.match(/wss?:\/\/[^\s'"`]+/g) || [];
          wsMatches.forEach(u => findings.push({ param: "ws-in-script", value: u.slice(0, 100), risk: "INFO", issue: "WebSocket URL in inline script" }));
        } catch {}
      });
      _log("info", "=== WebSocket Params (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "scanWebSocketParams failed", e); return []; }
  }
  window.scanWebSocketParams = scanWebSocketParams;

  // Enhancement 12: Analyze CSP for parameter-related policies
  function analyzeCSPForParams() {
    try {
      const findings = [];
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const policy = cspMeta ? cspMeta.getAttribute("content") || "" : "";
      if (!policy) {
        findings.push({ severity: "HIGH", issue: "No CSP meta tag found — params reflected without CSP protection" });
      } else {
        if (policy.includes("'unsafe-inline'")) findings.push({ severity: "HIGH", issue: "unsafe-inline allows inline script execution with reflected params" });
        if (policy.includes("'unsafe-eval'")) findings.push({ severity: "CRITICAL", issue: "unsafe-eval allows eval() with reflected params" });
        if (policy.includes("*")) findings.push({ severity: "HIGH", issue: "Wildcard source allows any origin to load resources" });
      }
      _log("info", "=== CSP Parameter Protection (" + findings.length + " issues) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "analyzeCSPForParams failed", e); return []; }
  }
  window.analyzeCSPForParams = analyzeCSPForParams;

  // Enhancement 13: Detect prototype pollution via params
  function detectPrototypePollutionParams() {
    try {
      const findings = [];
      paramMap.forEach((entry, key) => {
        try {
          const val = String(entry.value || "");
          if (/__proto__|constructor\[|prototype\[/.test(val)) {
            findings.push({ param: key, value: val.slice(0, 60), risk: "CRITICAL", issue: "Prototype pollution payload in parameter" });
          }
          if (/\[.*\]=|\.push\(|\.merge\(|Object\.assign/.test(val)) {
            findings.push({ param: key, value: val.slice(0, 60), risk: "MEDIUM", issue: "Potential prototype pollution pattern" });
          }
        } catch {}
      });
      _log("info", "=== Prototype Pollution Params (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "detectPrototypePollutionParams failed", e); return []; }
  }
  window.detectPrototypePollutionParams = detectPrototypePollutionParams;

  // Enhancement 14: Map complete param → handler → sink chains
  function mapParamToSinkChains() {
    try {
      const chains = [];
      paramMap.forEach((entry, key) => {
        try {
          if (entry.reflections.size === 0) return;
          const sinks = Array.from(entry.reflections);
          const hasScript = sinks.some(s => s.includes("script"));
          const hasInnerHTML = sinks.some(s => s.includes("innerHTML"));
          const hasLocation = sinks.some(s => s.includes("location"));
          const hasAttr = sinks.some(s => s.includes("attr:"));
          let chain = "param -> ";
          if (entry.sources.has("url") || entry.sources.has("url-hash")) chain += "URL -> ";
          if (entry.sources.has("cookie")) chain += "cookie -> ";
          if (entry.sources.has("form")) chain += "form -> ";
          if (entry.sources.has("fetch-body") || entry.sources.has("xhr-body")) chain += "request-body -> ";
          chain += sinks.join(", ");
          chains.push({
            param: key,
            chain,
            scriptSink: hasScript,
            innerHTMLSink: hasInnerHTML,
            locationSink: hasLocation,
            attrSink: hasAttr,
            risk: hasScript ? "CRITICAL" : hasInnerHTML ? "HIGH" : hasLocation ? "HIGH" : hasAttr ? "MEDIUM" : "LOW",
          });
        } catch {}
      });
      _log("info", "=== Param -> Sink Chains (" + chains.length + " chains) ===");
      if (chains.length) _table(chains);
      return chains;
    } catch (e) { _log("error", "mapParamToSinkChains failed", e); return []; }
  }
  window.mapParamToSinkChains = mapParamToSinkChains;

  // Enhancement 15: Detect SSRF-prone parameters
  function detectSSRFParams() {
    try {
      const findings = [];
      const ssrfParams = /url|uri|href|src|dest|target|redirect|fetch|load|image|link|api|endpoint|webhook|callback|notify/i;
      paramMap.forEach((entry, key) => {
        try {
          if (!ssrfParams.test(key)) return;
          const val = String(entry.value || "");
          if (/localhost|127\.0\.0\.1|10\.\d+|192\.168|169\.254|metadata\.google/i.test(val)) {
            findings.push({ param: key, value: val.slice(0, 80), risk: "CRITICAL", issue: "Internal IP in URL-type parameter (SSRF)" });
          } else if (/^https?:\/\//i.test(val)) {
            findings.push({ param: key, value: val.slice(0, 80), risk: "MEDIUM", issue: "URL-type parameter (potential SSRF vector)" });
          }
        } catch {}
      });
      _log("info", "=== SSRF-Prone Params (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "detectSSRFParams failed", e); return []; }
  }
  window.detectSSRFParams = detectSSRFParams;

  // Enhancement 16: Analyze URL path parameter patterns
  function analyzePathParamPatterns() {
    try {
      const patterns = [];
      const path = window.location.pathname;
      const segments = path.split("/").filter(x => x.length);
      segments.forEach((seg, i) => {
        try {
          const isNumeric = /^\d+$/.test(seg);
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg);
          const isHash = /^[a-f0-9]{16,}$/i.test(seg);
          patterns.push({
            position: i,
            value: seg,
            type: isUUID ? "UUID" : isNumeric ? "numeric" : isHash ? "hash" : "string",
            risk: isUUID || isHash ? "MEDIUM" : isNumeric ? "LOW" : "INFO",
            note: isUUID ? "Potential IDOR — sequential/brutable UUID" : isNumeric ? "Potential IDOR — numeric ID" : isHash ? "Potential IDOR — hash ID" : "Path segment",
          });
        } catch {}
      });
      _log("info", "=== Path Parameter Patterns (" + patterns.length + " segments) ===");
      if (patterns.length) _table(patterns);
      return patterns;
    } catch (e) { _log("error", "analyzePathParamPatterns failed", e); return []; }
  }
  window.analyzePathParamPatterns = analyzePathParamPatterns;

  // Enhancement 17: Generate exploit payloads for reflected params
  function generateParamExploits() {
    try {
      const exploits = [];
      paramMap.forEach((entry, key) => {
        try {
          if (entry.reflections.size === 0) return;
          const sinks = Array.from(entry.reflections);
          const inScript = sinks.some(s => s.includes("script"));
          const inAttr = sinks.some(s => s.includes("attr:"));
          const inBody = sinks.some(s => s.includes("body"));
          if (inScript) {
            exploits.push({ param: key, vuln: "XSS via script block", payload: "';alert(1);//", severity: "CRITICAL" });
            exploits.push({ param: key, vuln: "XSS via script block", payload: "</script><img src=x onerror=alert(1)>", severity: "CRITICAL" });
          }
          if (inAttr) {
            exploits.push({ param: key, vuln: "XSS via attribute", payload: '" onmouseover="alert(1)"', severity: "HIGH" });
            exploits.push({ param: key, vuln: "XSS via attribute", payload: "' onfocus='alert(1)' autofocus='", severity: "HIGH" });
          }
          if (inBody && !inScript && !inAttr) {
            exploits.push({ param: key, vuln: "Reflected XSS", payload: '<img src=x onerror=alert(1)>', severity: "HIGH" });
            exploits.push({ param: key, vuln: "Reflected XSS", payload: '<svg onload=alert(1)>', severity: "HIGH" });
          }
          if (entry.dangerousSink) {
            exploits.push({ param: key, vuln: "DOM XSS via sink", payload: 'javascript:alert(1)', severity: "CRITICAL" });
          }
        } catch {}
      });
      _log("info", "=== Exploit Suggestions (" + exploits.length + " payloads) ===");
      if (exploits.length) _table(exploits);
      return exploits;
    } catch (e) { _log("error", "generateParamExploits failed", e); return []; }
  }
  window.generateParamExploits = generateParamExploits;

  // Enhancement 18: Detect auth bypass parameter weaknesses
  function detectAuthBypassParams() {
    try {
      const findings = [];
      const authParams = /admin|role|permission|is_admin|is_superuser|user_id|account|verified|active|privilege|level/i;
      paramMap.forEach((entry, key) => {
        try {
          if (!authParams.test(key)) return;
          const val = String(entry.value || "").toLowerCase();
          const isElevated = /admin|true|1|superuser|root|god|master/.test(val);
          findings.push({
            param: key,
            value: String(entry.value || "").slice(0, 40),
            authRelated: true,
            elevatedValue: isElevated,
            risk: isElevated ? "HIGH" : "MEDIUM",
            issue: isElevated ? "Auth param with elevated value (potential privilege escalation)" : "Auth-related parameter found",
          });
        } catch {}
      });
      _log("info", "=== Auth Bypass Params (" + findings.length + " found) ===");
      if (findings.length) _table(findings);
      return findings;
    } catch (e) { _log("error", "detectAuthBypassParams failed", e); return []; }
  }
  window.detectAuthBypassParams = detectAuthBypassParams;

  // Enhancement 19: Visual heatmap of param risk across the page
  function visualizeParamHeatmap() {
    try {
      let highlighted = 0;
      const allEls = document.querySelectorAll("*");
      const maxEl = Math.min(allEls.length, _MAX_ELEMENTS);
      paramMap.forEach((entry, key) => {
        try {
          if (!entry.value || entry.reflections.size === 0) return;
          for (let i = 0; i < maxEl; i++) {
            try {
              const el = allEls[i];
              Array.from(el.attributes).forEach(attr => {
                try {
                  if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
                    if (!el.dataset.upeHeatmap) {
                      const score = (entry.dangerousSink ? 40 : 0) + (entry.reflections.size * 5);
                      const color = score >= 50 ? "rgba(255,0,0,0.4)" : score >= 30 ? "rgba(255,165,0,0.3)" : score >= 15 ? "rgba(255,255,0,0.3)" : "rgba(0,128,255,0.2)";
                      el.style.outline = "3px solid " + color;
                      el.dataset.upeHeatmap = "1";
                      highlighted++;
                    }
                  }
                } catch {}
              });
            } catch {}
          }
        } catch {}
      });
      _log("info", "Heatmap applied: " + highlighted + " elements highlighted");
      return { highlighted };
    } catch (e) { _log("error", "visualizeParamHeatmap failed", e); return { highlighted: 0 }; }
  }
  window.visualizeParamHeatmap = visualizeParamHeatmap;

  // Enhancement 20: Generate comprehensive parameter security report
  function generateParamReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: location.href,
      totalParams: paramMap.size,
      sections: {},
    };
    try { report.sections.security = analyzeParamSecurity(); } catch {}
    try { report.sections.reflectionDepth = detectParamReflectionDepth(); } catch {}
    try { report.sections.flow = mapParamFlow(); } catch {}
    try { report.sections.leakage = detectSensitiveParamLeakage(); } catch {}
    try { report.sections.ssrf = detectSSRFParams(); } catch {}
    try { report.sections.openRedirects = detectOpenRedirectParams(); } catch {}
    try { report.sections.jwt = detectJWTInParams(); } catch {}
    try { report.sections.prototype = detectPrototypePollutionParams(); } catch {}
    try { report.sections.authBypass = detectAuthBypassParams(); } catch {}
    try { report.sections.exploits = generateParamExploits(); } catch {}
    try { report.sections.csp = analyzeCSPForParams(); } catch {}
    let totalFindings = 0;
    Object.entries(report.sections).forEach(([cat, findings]) => {
      if (Array.isArray(findings)) totalFindings += findings.length;
    });
    report.totalFindings = totalFindings;
    _log("info", `=== Parameter Security Report: ${totalFindings} total findings ===`);
    Object.entries(report.sections).forEach(([cat, findings]) => {
      if (Array.isArray(findings) && findings.length > 0) {
        _log("info", `[${cat}] ${findings.length} findings`);
      }
    });
    window.PARAM_SECURITY_REPORT = report;
    _log("info", "Full report: window.PARAM_SECURITY_REPORT");
    return report;
  }
  window.generateParamReport = generateParamReport;

  // CLEANUP: Restore all patched functions
  window.CLEANUP = window.CLEANUP || function CLEANUP() {
    try {
      if (window.__origFetch) { window.fetch = window.__origFetch; delete window.__origFetch; }
      if (window.__origXHROpen) { XMLHttpRequest.prototype.open = window.__origXHROpen; delete window.__origXHROpen; }
      if (window.__origXHRSend) { XMLHttpRequest.prototype.send = window.__origXHRSend; delete window.__origXHRSend; }
      delete window.__PATCHED_FETCH;
      delete window.__PATCHED_XHR;
      console.log("%c🧹 All patches restored.", "color: #27ae60; font-weight: bold");
    } catch(e) { console.warn("Cleanup error:", e); }
  };

  // HELP: List all available functions
  window.HELP = window.HELP || function HELP() {
    console.log("%c╔══════════════════════════════════════════╗", "color: #3498db");
    console.log("%c║  Universal Parameter Extractor — HELP    ║", "color: #3498db; font-weight: bold");
    console.log("%c╚══════════════════════════════════════════╝", "color: #3498db");
    console.log("%cCore:", "color: #e67e22; font-weight: bold");
    console.log("  run()                          — Extract all parameters");
    console.log("  CLEANUP()                      — Restore patched functions");
    console.log("  HELP()                         — Show this help");
    console.log("%cTip: Type CLEANUP() to restore browser to original state.", "color: #7f8c8d");
  };
})();



/*
//Usage

//window.extractAllParameters();
//window.highlightReflectedParams();
//window.exportParamReflectionsCSV();
//window.showUPEBanner();
//window.startRealTimeParamScan();
//window.stopRealTimeParamScan();
//window.injectParamPayloads("your_payload");

*/
