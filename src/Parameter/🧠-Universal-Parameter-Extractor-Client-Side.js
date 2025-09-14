// 🧠 Universal Parameter Extractor (Client-Side, Ultimate Edition + Banner UI)
// Extracts parameters from everywhere, checks for DOM reflection/sinks, highlights dangerous sinks, and exports results.
// Now with: network request parameter extraction from all DOM/network sources, robust visual highlighting, optional real-time/continuous scanning, payload injection stubs, and a colorful interactive banner UI.

(function () {
  const paramMap = new Map();
  let observer = null;
  let realTimeActive = false;
  let payloadMode = false;

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

  const __origConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  function withQuietLogging(fn) {
    const prevLog = console.log;
    const prevInfo = console.info;
    if (SETTINGS.quiet) {
      console.log = function () {};
      console.info = function () {};
    }
    try {
      return fn();
    } finally {
      console.log = prevLog;
      console.info = prevInfo;
    }
  }

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
  function matchesAnyEncoding(haystack, needle) {
    if (haystack == null || needle == null) return false;
    const hay = String(haystack);
    const candidates = [
      String(needle),
      String(decodeURIComponentSafe(needle)),
      String(htmlDecode(needle)),
      String(attrEscape(needle)),
    ];
    if (SETTINGS.caseInsensitive) {
      const hayL = hay.toLowerCase();
      return candidates.some(
        (n) =>
          typeof n === "string" && n && hayL.includes(String(n).toLowerCase())
      );
    }
    return candidates.some(
      (n) => typeof n === "string" && n && hay.includes(String(n))
    );
  }

  // Non-destructive highlighting state
  const highlightMarkers = [];
  const outlinedElements = new Set();
  function clearHighlights() {
    for (const span of highlightMarkers.splice(0)) {
      const parent = span.parentNode;
      if (!parent) continue;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    }
    outlinedElements.forEach((el) => {
      if (el && el.dataset) {
        el.style.outline = el.dataset.upeOldOutline || "";
        delete el.dataset.upeOldOutline;
      }
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
      try {
        console.warn("UPE: Network already patched");
      } catch {}
      window.__upePatchNotice = "already_patched";
      return;
    }
    window.__upe_fetchPatched = true;

    const origFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      try {
        const req =
          input instanceof Request ? input : new Request(input, init || {});
        extractParamsFromURL(req.url, "fetch-url");
        const headers = toPlainHeaders(req.headers);
        Object.entries(headers).forEach(([k, v]) =>
          addParam(k, v, "fetch-header")
        );
        const bodyInfo = parseBody(init && init.body);
        if (bodyInfo.entries) {
          Object.entries(bodyInfo.entries).forEach(([k, v]) =>
            addParam(k, v, "fetch-body")
          );
        } else if (bodyInfo.value) {
          addParam("raw_body", bodyInfo.value, "fetch-body");
        }
        // Sink detection: location redirects via fetch init (rare, but keep placeholder)
      } catch (e) {
        __origConsole.error("UPE fetch patch error", e);
      }
      return origFetch.call(this, input, init);
    };
    __restoreNetworkFns.push(() => {
      window.fetch = origFetch;
      window.__upe_fetchPatched = false;
    });

    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      try {
        extractParamsFromURL(url, "xhr-url");
      } catch {}
      return open.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function (body) {
      try {
        const info = parseBody(body);
        if (info.entries) {
          Object.entries(info.entries).forEach(([k, v]) =>
            addParam(k, v, "xhr-body")
          );
        } else if (info.value) {
          addParam("raw_body", info.value, "xhr-body");
        }
      } catch (e) {
        __origConsole.error("UPE XHR patch error", e);
      }
      return send.call(this, body);
    };
    __restoreNetworkFns.push(() => {
      XMLHttpRequest.prototype.open = open;
      XMLHttpRequest.prototype.send = send;
    });

    // Patch DOM sinks: innerHTML, outerHTML, insertAdjacentHTML, document.write,
    // timers with string callbacks, and location redirects
    try {
      const ElementProto = Element.prototype;
      const origInnerHTML = Object.getOwnPropertyDescriptor(
        ElementProto,
        "innerHTML"
      );
      const origOuterHTML = Object.getOwnPropertyDescriptor(
        ElementProto,
        "outerHTML"
      );
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
            checkAgainstParams(value, "innerHTML");
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
            checkAgainstParams(value, "outerHTML");
            return origOuterHTML.set.call(this, value);
          },
        });
        __restoreNetworkFns.push(() =>
          Object.defineProperty(ElementProto, "outerHTML", origOuterHTML)
        );
      }
      if (origInsertAdjacentHTML) {
        ElementProto.insertAdjacentHTML = function (position, html) {
          checkAgainstParams(html, "insertAdjacentHTML");
          return origInsertAdjacentHTML.call(this, position, html);
        };
        __restoreNetworkFns.push(() => {
          ElementProto.insertAdjacentHTML = origInsertAdjacentHTML;
        });
      }
      if (origWrite) {
        document.write = function (html) {
          checkAgainstParams(html, "document.write");
          return origWrite.call(document, html);
        };
        __restoreNetworkFns.push(() => {
          document.write = origWrite;
        });
      }
      if (origWriteln) {
        document.writeln = function (html) {
          checkAgainstParams(html, "document.writeln");
          return origWriteln.call(document, html);
        };
        __restoreNetworkFns.push(() => {
          document.writeln = origWriteln;
        });
      }
      window.setTimeout = function (handler, timeout, ...args) {
        if (typeof handler === "string")
          checkAgainstParams(handler, "setTimeout(string)");
        return origSetTimeout(handler, timeout, ...args);
      };
      __restoreNetworkFns.push(() => {
        window.setTimeout = origSetTimeout;
      });
      window.setInterval = function (handler, timeout, ...args) {
        if (typeof handler === "string")
          checkAgainstParams(handler, "setInterval(string)");
        return origSetInterval(handler, timeout, ...args);
      };
      __restoreNetworkFns.push(() => {
        window.setInterval = origSetInterval;
      });

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
      try {
        console.warn("UPE: sink patching failed", e);
      } catch {}
    }
  }
  function unpatchNetwork() {
    try {
      __restoreNetworkFns.forEach((fn) => fn());
    } catch {}
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
          if (/body|html/i.test(where)) entry.reflectBody = true;
          entry.dangerousSink = true;
        }
      });
    } catch {}
  }

  function addParam(key, value, source) {
    if (!key) return;
    if (!paramMap.has(key)) {
      paramMap.set(key, {
        value,
        values: [], // history of { value, source, at }
        lastUpdated: 0,
        sources: new Set(),
        reflections: new Set(),
        reflectBody: false,
        reflectHead: false,
        dangerousSink: false,
      });
    }
    const entry = paramMap.get(key);
    entry.sources.add(source);
    const now = Date.now();
    if (value !== undefined && value !== null && value !== "") {
      entry.value = value;
      entry.lastUpdated = now;
      try {
        entry.values.push({ value, source, at: now });
        if (
          Array.isArray(entry.values) &&
          SETTINGS.maxHistory &&
          entry.values.length > SETTINGS.maxHistory
        ) {
          entry.values.splice(0, entry.values.length - SETTINGS.maxHistory);
        }
      } catch {}
    }
  }
  function addReflection(key, where, dangerous = false) {
    if (!key) return;
    if (!paramMap.has(key))
      paramMap.set(key, {
        value: undefined,
        values: [],
        lastUpdated: 0,
        sources: new Set(),
        reflections: new Set(),
        reflectBody: false,
        reflectHead: false,
        dangerousSink: false,
      });
    paramMap.get(key).reflections.add(where);
    if (dangerous) paramMap.get(key).dangerousSink = true;
  }

  // Helper: extract params from a URL string
  function extractParamsFromURL(url, source) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.forEach((value, key) => {
        addParam(key, value, source);
        console.log(`🌐 URL Param (${source}): ${key} = ${value}`);
      });
      // Also hash params (e.g. #foo=bar&baz=qux)
      if (u.hash && u.hash.includes("=")) {
        u.hash
          .replace(/^#/, "")
          .split("&")
          .forEach((pair) => {
            const [k, v] = pair.split("=");
            if (k && v) {
              addParam(k, v, source + "-hash");
              console.log(`🌐 Hash Param (${source}): ${k} = ${v}`);
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
        (root.querySelectorAll ? root : document)
          .querySelectorAll(selector)
          .forEach((el) => {
            const url = el.getAttribute(attr);
            if (url && url.includes("=")) {
              extractParamsFromURL(url, `dom-${attr}`);
            }
          });
      });
    });
  }

  // 🌐 URL Query Parameters and Path Segments (current page)
  function extractURLParams() {
    // Extract query and hash params as before
    extractParamsFromURL(window.location.href, "url");
    // Extract path segment parameters (e.g., /user/john/profile -> user:john, profile)
    const pathSegments = window.location.pathname
      .split("/")
      .filter((x) => x.length);
    // Attempt to pair segments as key/value pairs, fallback to numbered keys
    for (let i = 0; i < pathSegments.length; i++) {
      let key, value;
      // Heuristic: if parent segment looks like a parameter name
      if (
        i > 0 &&
        /^[a-zA-Z0-9_\-]+$/.test(pathSegments[i - 1]) &&
        /^[a-zA-Z0-9_\-]+$/.test(pathSegments[i])
      ) {
        key = pathSegments[i - 1] + "_segment";
        value = pathSegments[i];
        addParam(key, value, "url-path");
      } else {
        key = `segment${i}`;
        value = pathSegments[i];
        addParam(key, value, "url-path");
      }
      // Log each segment
      console.log(`🟦 Path Segment Param: ${key} = ${value}`);
    }
  }

  // 🍪 Cookies
  function extractCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const idx = cookie.indexOf("=");
      if (idx === -1) return;
      const key = cookie.slice(0, idx).trim();
      const raw = cookie.slice(idx + 1);
      const value = decodeURIComponentSafe(raw);
      if (key) {
        addParam(key, value, "cookie");
        console.log(`🍪 Cookie Param: ${key} = ${value}`);
      }
    });
  }
  function extractMetaTags() {
    forEachRoot((root) =>
      (root.querySelectorAll ? root : document)
        .querySelectorAll("meta")
        .forEach((meta) => {
          const name =
            meta.getAttribute("name") || meta.getAttribute("property");
          const content = meta.getAttribute("content");
          if (name && content) {
            addParam(name, content, "meta");
            console.log(`🧬 Meta Param: ${name} = ${content}`);
          }
        })
    );
  }
  function extractHiddenInputs() {
    forEachRoot((root) =>
      (root.querySelectorAll ? root : document)
        .querySelectorAll('input[type="hidden"]')
        .forEach((input) => {
          const key = input.name || input.id;
          addParam(key, input.value, "hidden-input");
          console.log(`🙈 Hidden Param: ${key} = ${input.value}`);
        })
    );
    forEachRoot((root) =>
      (root.querySelectorAll ? root : document)
        .querySelectorAll(
          '[hidden], [style*="display:none"], [style*="visibility:hidden"]'
        )
        .forEach((el) => {
          if (el.tagName === "INPUT" && el.type === "hidden") return;
          Array.from(el.attributes).forEach((attr) => {
            if (attr.name.startsWith("data-")) {
              const key = attr.name.replace(/^data-/, "");
              addParam(key, attr.value, "hidden-data-attr");
              console.log(`🙈 Hidden Data Param: ${key} = ${attr.value}`);
            }
          });
        })
    );
  }
  function extractFormFields() {
    forEachRoot((root) =>
      (root.querySelectorAll ? root : document)
        .querySelectorAll("form")
        .forEach((form) => {
          const data = new FormData(form);
          for (let [key, value] of data.entries()) {
            addParam(key, value, "form");
            console.log(`📝 Form Param: ${key} = ${value}`);
          }
        })
    );
  }
  function extractInlineConfigs() {
    forEachRoot((root) =>
      (root.querySelectorAll ? root : document)
        .querySelectorAll("script")
        .forEach((script) => {
          let content = script.textContent || "";
          if (content.length > 0) {
            try {
              const obj = JSON.parse(content);
              if (typeof obj === "object") {
                Object.entries(obj).forEach(([key, value]) => {
                  addParam(key, value, "inline-json");
                  console.log(`🧱 Inline JSON Param: ${key} = ${value}`);
                });
              }
            } catch {}
            const assignRegex =
              /([a-zA-Z0-9_\$]+)\s*=\s*(["'`].+?["'`]|\d+|true|false|null|\[.*?\]|\{.*?\});/g;
            let match;
            while ((match = assignRegex.exec(content))) {
              let key = match[1];
              let value = match[2];
              if (value && (value.startsWith('"') || value.startsWith("'")))
                value = value.slice(1, -1);
              addParam(key, value, "inline-js");
              console.log(`🧱 Inline JS Param: ${key} = ${value}`);
            }
          }
        })
    );
    if (SETTINGS.includeWindowGlobals) {
      try {
        const keys = Object.keys(window).slice(0, 500);
        keys.forEach((key) => {
          if (typeof window[key] === "string" && window[key].length <= 200) {
            addParam(key, window[key], "window-global");
          }
        });
      } catch {}
    }
  }

  // Intercept all fetch/XHR and extract params from URLs and bodies
  function interceptAPICalls() {
    if (window.__upe_fetchPatched) return;
    window.__upe_fetchPatched = true;
    const originalFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
      const url = typeof input === "string" ? input : input.url;
      extractParamsFromURL(url, "fetch-url");
      const method = init.method || "GET";
      const headers = init.headers || {};
      const body = init.body;
      if (headers && typeof headers === "object") {
        Object.entries(headers).forEach(([key, value]) => {
          addParam(key, value, "fetch-header");
        });
      }
      if (body) {
        try {
          const parsed = typeof body === "string" ? JSON.parse(body) : body;
          if (typeof parsed === "object") {
            Object.entries(parsed).forEach(([key, value]) => {
              addParam(key, value, "fetch-body");
            });
          }
        } catch {
          addParam("raw_body", body, "fetch-body");
        }
      }
      return originalFetch.call(this, input, init);
    };
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this._method = method;
      this._url = url;
      extractParamsFromURL(url, "xhr-url");
      return originalXHROpen.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function (body) {
      if (body) {
        try {
          const parsed = typeof body === "string" ? JSON.parse(body) : body;
          if (typeof parsed === "object") {
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

  // Dangerous sink detection helpers
  function isDangerousAttr(attrName) {
    return (
      /^on[a-z]+$/.test(attrName) || attrName === "src" || attrName === "href"
    );
  }

  function detectReflections() {
    paramMap.forEach((entry, key) => {
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
      if (document.body) {
        document.body.querySelectorAll("*").forEach((el) => {
          Array.from(el.attributes).forEach((attr) => {
            if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
              addReflection(
                key,
                `body-attr:${attr.name}`,
                isDangerousAttr(attr.name)
              );
              entry.reflectBody = true;
            }
          });
        });
      }
      if (document.head) {
        document.head.querySelectorAll("*").forEach((el) => {
          Array.from(el.attributes).forEach((attr) => {
            if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
              addReflection(
                key,
                `head-attr:${attr.name}`,
                isDangerousAttr(attr.name)
              );
              entry.reflectHead = true;
            }
          });
        });
      }
      document.body &&
        document.body.querySelectorAll("script").forEach((script) => {
          if (
            script.textContent &&
            matchesAnyEncoding(script.textContent, entry.value)
          ) {
            addReflection(key, "body-script-block", true);
            entry.reflectBody = true;
          }
        });
      document.head &&
        document.head.querySelectorAll("script").forEach((script) => {
          if (
            script.textContent &&
            matchesAnyEncoding(script.textContent, entry.value)
          ) {
            addReflection(key, "head-script-block", true);
            entry.reflectHead = true;
          }
        });
    });
  }

  // Visual Highlighting (robust, dangerous sinks in red, others in orange)
  function highlightReflectedParams() {
    // Scan known JS/DOM sinks that are not attribute-based
    try {
      const sinks = [];
      paramMap.forEach((entry, key) => {
        if (!entry.value) return;
        const v = String(entry.value);
        // Check innerHTML/outerHTML/insertAdjacentHTML content (read-only scan)
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
      });
    } catch {}
    clearHighlights();
    clearHighlights();
    paramMap.forEach((entry, key) => {
      if (!entry.value) return;
      // Highlight attributes
      document.body &&
        document.body.querySelectorAll("*").forEach((el) => {
          Array.from(el.attributes).forEach((attr) => {
            if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
              if (!el.dataset.upeOldOutline)
                el.dataset.upeOldOutline = el.style.outline || "";
              el.style.outline = isDangerousAttr(attr.name)
                ? "2px solid red"
                : "2px solid orange";
              el.title = `Reflected param: ${key}`;
              outlinedElements.add(el);
            }
          });
        });
      document.head &&
        document.head.querySelectorAll("*").forEach((el) => {
          Array.from(el.attributes).forEach((attr) => {
            if (attr.value && matchesAnyEncoding(attr.value, entry.value)) {
              if (!el.dataset.upeOldOutline)
                el.dataset.upeOldOutline = el.style.outline || "";
              el.style.outline = isDangerousAttr(attr.name)
                ? "2px solid red"
                : "2px solid orange";
              el.title = `Reflected param: ${key}`;
              outlinedElements.add(el);
            }
          });
        });
      // Highlight text nodes
      function highlightTextNodes(root) {
        if (!root) return;
        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let node;
        while ((node = walker.nextNode())) {
          if (
            node.nodeValue &&
            typeof node.nodeValue === "string" &&
            matchesAnyEncoding(node.nodeValue, entry.value)
          ) {
            // Non-destructive range wrapping
            const raw = String(node.nodeValue);
            const idx = raw.indexOf(entry.value);
            if (idx !== -1) {
              const range = document.createRange();
              range.setStart(node, idx);
              range.setEnd(node, idx + entry.value.length);
              const span = document.createElement("span");
              span.style.background = entry.dangerousSink
                ? "rgba(255,0,0,0.3)"
                : "rgba(255,165,0,0.3)";
              span.title = `Reflected param: ${key}`;
              try {
                range.surroundContents(span);
                highlightMarkers.push(span);
              } catch {}
            }
          }
        }
      }
      highlightTextNodes(document.body);
      highlightTextNodes(document.head);
      // Highlight script blocks
      document.body &&
        document.body.querySelectorAll("script").forEach((script) => {
          if (
            script.textContent &&
            matchesAnyEncoding(script.textContent, entry.value)
          ) {
            if (!script.dataset.upeOldOutline)
              script.dataset.upeOldOutline = script.style.outline || "";
            script.style.outline = "2px solid red";
            script.title = `Reflected param (script): ${key}`;
            outlinedElements.add(script);
          }
        });
      document.head &&
        document.head.querySelectorAll("script").forEach((script) => {
          if (
            script.textContent &&
            matchesAnyEncoding(script.textContent, entry.value)
          ) {
            if (!script.dataset.upeOldOutline)
              script.dataset.upeOldOutline = script.style.outline || "";
            script.style.outline = "2px solid red";
            script.title = `Reflected param (script): ${key}`;
            outlinedElements.add(script);
          }
        });
    });
    if (SETTINGS.logLevel !== "silent")
      console.log("Highlighted reflected parameters in DOM.");
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
    console.log("CSV exported.");
  }
  window.exportParamReflectionsCSV = exportParamReflectionsCSV;
  // Expose network patch/unpatch and clear highlights for UI/usage
  window.patchNetwork = patchNetwork;
  window.unpatchNetwork = unpatchNetwork;
  window.clearParamHighlights = clearHighlights;

  function extractAllParameters() {
    extractURLParams();
    extractDOMURLParams();
    extractCookies();
    extractMetaTags();
    extractHiddenInputs();
    extractFormFields();
    extractInlineConfigs();
    extractFromIframes && extractFromIframes();
    // Network patching is opt-in; call window.patchNetwork() manually if desired
    detectReflections();
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
      console.log("\n🧠 Parameter Reflection Table:");
      console.table(table);
    }
    window.PARAM_REFLECTIONS_JSON = json;
    console.log(
      "\n🧠 Parameter Reflection JSON available as window.PARAM_REFLECTIONS_JSON"
    );
    console.log("🧠 To export as CSV, run: window.exportParamReflectionsCSV()");
    console.log(
      "🧠 To highlight reflected params in DOM, run: window.highlightReflectedParams()"
    );
  }

  // Real-time/continuous scanning (optional, only if user calls it)
  function startRealTimeScan(intervalMs = 3000) {
    if (realTimeActive) return;
    realTimeActive = true;
    function loop() {
      if (!realTimeActive) return;
      paramMap.clear();
      extractAllParameters();
      setTimeout(loop, intervalMs);
    }
    loop();
    console.log("Real-time parameter extraction started.");
  }
  function stopRealTimeScan() {
    realTimeActive = false;
    console.log("Real-time parameter extraction stopped.");
  }
  window.startRealTimeParamScan = startRealTimeScan;
  window.stopRealTimeParamScan = stopRealTimeScan;

  // Payload injection/active testing (stub, user can extend)
  function injectPayloads(payload = "__UPE_PAYLOAD__") {
    document.querySelectorAll("form").forEach((form) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "upe_test";
      input.value = payload;
      form.appendChild(input);
    });
    document.cookie = `upe_test=${payload}; path=/`;
    console.log(`Payload '${payload}' injected into forms and cookies.`);
  }
  window.injectParamPayloads = injectPayloads;

  // Banner UI
  function showBanner() {
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
  }
  window.showUPEBanner = showBanner;

  // Only run when user calls extractAllParameters (quiet by default)
  window.extractAllParameters = extractAllParameters;
  window.exportParamReflectionsCSV = exportParamReflectionsCSV;
  window.highlightReflectedParams = highlightReflectedParams;
  window.showUPEBanner = showBanner;
  window.startRealTimeParamScan = startRealTimeScan;
  window.stopRealTimeParamScan = stopRealTimeScan;
  window.injectParamPayloads = injectPayloads;

  // Auto-show banner on load
  showBanner();
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
