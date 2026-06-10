(function () {
  "use strict";
  function _domReady() { return document && document.readyState !== "loading"; }
  // Network Mapper - Enhanced, configurable, robotic console utility for bug hunting
  // Features:
  // - Robust request/response capture (fetch/XHR/WebSocket)
  // - Rich element + user event context, call stacks
  // - Request/response headers + bodies with redaction
  // - Filters, performance controls, persistence
  // - Automated analysis engine with rule-based detection + severity
  // - Findings store, filtering, summaries, and console reporting API

  if (window.NetworkMapper && window.NetworkMapper.__installed) {
    console.warn(
      "[NetworkMapper] Already installed. Use NetworkMapper.setOptions(), NetworkMapper.stop(), or NetworkMapper.start()."
    );
    // Ensure backward-compat alias still works
    if (typeof window.exportNetworkLogs !== "function") {
      window.exportNetworkLogs = function () {
        try {
          const json = window.NetworkMapper?.exportLogs?.() || "[]";
          console.log("%c[Exported JSON] Copy below:\n", "color: yellow;");
          console.log(json);
          return json;
        } catch (e) {
          console.error("exportNetworkLogs failed", e);
          return "[]";
        }
      };
    }
    return;
  }

  const VERSION = "2.0.1";

  // ---- Configuration ----
  const defaultOptions = {
    // Capture level for bodies: 'none' | 'snippet' | 'full' | number (max chars)
    requestBodyCapture: "snippet",
    responseBodyCapture: "snippet",
    maxSnippetChars: 200,

    parseJSON: true,

    headers: {
      captureRequest: true,
      captureResponse: true,
      redactHeaderKeys: [
        /^authorization$/i,
        /^cookie$/i,
        /^set-cookie$/i,
        /x-api-key/i,
        /token/i,
        /apikey/i,
        /secret/i,
      ],
      redactionText: "[REDACTED]",
    },

    bodyRedaction: {
      enable: true,
      redactKeys: [
        /password/i,
        /token/i,
        /secret/i,
        /api[-_]?key/i,
        /authorization/i,
        /session/i,
        /cookie/i,
      ],
      redactionText: "[REDACTED]",
      stringRedactPatterns: [
        /(Bearer\s+[A-Za-z0-9\-_.=]+)/i,
        /("?password"?\s*:\s*")([^"]+)(")/i,
      ],
    },

    filters: {
      includeUrl: null,
      excludeUrl: null,
      methods: null,
      // Granular controls
      minDurationMs: null, // only log if timing.durationMs >= this
      maxRequestBodyBytes: null, // if request body > this, omit body capture
      maxResponseBodyBytes: null, // if response body > this, omit body capture
      types: [
        "fetch",
        "xhr",
        "websocket",
        "websocket-open",
        "websocket-send",
        "websocket-receive",
        "xhr-headers",
      ],
    },

    elementDetails: {
      includeSelector: true,
      includeXPath: true,
      includeAttributes: ["name", "type", "value", "role", "aria-label"],
      includeDataAttributes: true,
      maxText: 100,
    },

    performance: {
      throttleConsole: true,
      consoleIntervalMs: 300,
      bufferSize: 300,
      maxEntries: 3000,
      // Async processing controls
      asyncAnalysis: true,
      useIdleCallback: false,
      maxProcessPerTick: 50,
    },

    persistence: {
      enabled: false,
      storage: "localStorage",
      key: "__network_mapper_logs__",
      findingsKey: "__network_mapper_findings__",
    },

    // Emit custom DOM events so external tools/tests can consume entries/findings
    events: {
      emitCustomEvents: false,
      prefix: "NetworkMapper",
    },

    captureStack: true,
    safeMode: true,

    // Automated analysis options
    analysis: {
      enabled: true,
      autoSummarize: false,
      autoSummarizeIdleMs: 15000,
      severityOrder: ["P1", "P2", "P3", "P4"],
      findingsMax: 1500,
      filters: {
        severities: null, // e.g., ["P1", "P2"]
        types: null, // e.g., ["sensitive-data", "cors", "cookie"]
      },
      rules: {
        /* individual rule enable flags will be filled during init */
      },
    },
  };

  // ---- Internal state ----
  const state = {
    options: deepClone(defaultOptions),
    installed: false,
    paused: false,
    log: [],
    consoleBuffer: [],
    lastClickedElement: null,
    lastUserEvent: null, // { type, details, at }
    idCounter: 1,

    orig: {
      fetch: null,
      XHROpen: null,
      XHRSend: null,
      XHRSetRequestHeader: null,
      WebSocket: null,
    },

    consoleTimer: null,

    persistPending: false,
    persistTimer: null,

    // Findings store
    findings: [],
    findingsBuffer: [],
    findingsTimer: null,
    summarizeTimer: null,

    // Analysis batching queue
    analysisQueue: [],
    analysisTimer: null,

    // Overlay UI
    overlay: {
      el: null,
      filterSeverity: null,
      filterType: null,
      visible: false,
    },
  };

  function _safeTable(data, max) {
    try {
      if (!data) return;
      const limit = max || 100;
      if (Array.isArray(data) && data.length > limit) {
        console.table(data.slice(0, limit));
        console.warn("(truncated " + (data.length - limit) + " more rows)");
      } else if (typeof data === "object" && Object.keys(data).length > limit) {
        const keys = Object.keys(data).slice(0, limit);
        const truncated = {};
        keys.forEach(function(k) { truncated[k] = data[k]; });
        console.table(truncated);
        console.warn("(truncated " + (Object.keys(data).length - limit) + " more keys)");
      } else {
        console.table(data);
      }
    } catch(e) {}
  }
  // ---- Utilities ----
  function deepClone(obj) {
    try {
      return structuredClone(obj);
    } catch (_) {
      return JSON.parse(JSON.stringify(obj));
    }
  }
  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${state.idCounter++}`;
  }
  function isNative(fn) {
    return (
      typeof fn === "function" &&
      /\[native code\]/.test(Function.prototype.toString.call(fn))
    );
  }
  function captureStack() {
    if (!state.options.captureStack) return null;
    const e = new Error();
    return (e.stack || "").split("\n").slice(2, 12).join("\n");
  }

  function buildSelector(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    while (el && el.nodeType === 1 && parts.length < 6) {
      let part = el.tagName.toLowerCase();
      try {
        if (el.classList && el.classList.length)
          part +=
            "." +
            Array.from(el.classList)
              .slice(0, 3)
              .map((c) => CSS.escape(c))
              .join(".");
      } catch (e) {}
      const parent = el.parentElement;
      if (parent) {
        try {
          const siblings = Array.from(parent.children).filter(
            (n) => n.tagName === el.tagName
          );
          if (siblings.length > 1)
            part += `:nth-of-type(${siblings.indexOf(el) + 1})`;
        } catch (e) {}
      }
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(" > ");
  }

  function buildXPath(el) {
    if (!el || el.nodeType !== 1) return null;
    const segs = [];
    var depth = 0;
    while (el && el.nodeType === 1 && depth < 10) {
      depth++;
      let index = 1;
      let sib = el.previousSibling;
      while (sib) {
        if (sib.nodeType === 1 && sib.nodeName === el.nodeName) index++;
        sib = sib.previousSibling;
      }
      segs.unshift(`${el.nodeName.toLowerCase()}[${index}]`);
      el = el.parentNode;
      if (el && el.nodeType === 9) break;
    }
    return "//" + segs.join("/");
  }

  function getElementDetails(el) {
    if (!el) return null;
    const o = {
      tag: el.tagName,
      id: el.id || null,
      classes: el.className || null,
      text: el.innerText
        ? el.innerText.slice(0, state.options.elementDetails.maxText)
        : null,
    };
    const {
      includeAttributes,
      includeDataAttributes,
      includeSelector,
      includeXPath,
    } = state.options.elementDetails;
    if (includeAttributes && includeAttributes.length) {
      o.attributes = {};
      includeAttributes.forEach((name) => {
        try {
          const v = el.getAttribute(name);
          if (v != null) o.attributes[name] = v;
        } catch (e) {}
      });
    }
    if (includeDataAttributes) {
      const data = {};
      for (const { name, value } of Array.from(el.attributes || [])) {
        if (name.startsWith("data-")) data[name] = value;
      }
      if (Object.keys(data).length) o.dataAttributes = data;
    }
    if (includeSelector) o.selector = buildSelector(el);
    if (includeXPath) o.xpath = buildXPath(el);
    return o;
  }

  function redactHeaders(headers) {
    if (!headers) return headers;
    const { redactHeaderKeys, redactionText } = state.options.headers;
    const out = {};
    Object.keys(headers).forEach((k) => {
      try {
        const r = redactHeaderKeys?.some((rx) => rx.test(k));
        out[k] = r ? redactionText : headers[k];
      } catch (e) {
        out[k] = headers[k];
      }
    });
    return out;
  }

  function redactJson(obj) {
    if (!state.options.bodyRedaction.enable) return obj;
    const { redactKeys, redactionText } = state.options.bodyRedaction;
    const seen = new WeakSet();
    function walk(x) {
      if (!x || typeof x !== "object") return x;
      if (seen.has(x)) return "[Circular]";
      seen.add(x);
      if (Array.isArray(x)) return x.map(walk);
      const o = Array.isArray(x) ? [] : {};
      for (const k of Object.keys(x)) {
        const v = x[k];
        const m = redactKeys?.some((rx) => rx.test(k));
        o[k] = m ? redactionText : walk(v);
      }
      return o;
    }
    try {
      return walk(obj);
    } catch (_) {
      return obj;
    }
  }

  function redactStringBody(str) {
    if (!state.options.bodyRedaction.enable || !str) return str;
    let out = str;
    for (const rx of state.options.bodyRedaction.stringRedactPatterns || []) {
      try {
        out = out.replace(rx, (m, p1, p2, p3) =>
          typeof p3 !== "undefined"
            ? `${p1 || ""}${state.options.bodyRedaction.redactionText}${
                p3 || ""
              }`
            : state.options.bodyRedaction.redactionText
        );
      } catch (_) {}
    }
    return out;
  }

  function trimBody(str, captureMode) {
    if (captureMode === "none") return null;
    if (captureMode === "full") return str;
    if (typeof captureMode === "number")
      return str?.slice(0, captureMode) ?? null;
    return str?.slice(0, state.options.maxSnippetChars) ?? null;
  }

  function headersToObject(h) {
    const o = {};
    try {
      h.forEach((v, k) => {
        o[k] = v;
      });
    } catch (_) {}
    return o;
  }
  function parseMaybeJSON(str) {
    if (!state.options.parseJSON || typeof str !== "string") return null;
    try {
      return JSON.parse(str);
    } catch (_) {
      return null;
    }
  }

  function shouldLogEntry(entry) {
    const { filters } = state.options;
    if (!filters) return true;
    if (filters.types && !filters.types.includes(entry.type)) return false;
    if (
      filters.methods &&
      entry.method &&
      !filters.methods.includes(entry.method)
    )
      return false;
    if (entry.url) {
      if (filters.includeUrl) {
        const list = Array.isArray(filters.includeUrl)
          ? filters.includeUrl
          : [filters.includeUrl];
        if (!list.some((rx) => rx.test(entry.url))) return false;
      }
      if (filters.excludeUrl) {
        const list = Array.isArray(filters.excludeUrl)
          ? filters.excludeUrl
          : [filters.excludeUrl];
        if (list.some((rx) => rx.test(entry.url))) return false;
      }
    }
    // Duration filter (applies when timing already attached)
    if (
      typeof filters.minDurationMs === "number" &&
      entry.timing &&
      typeof entry.timing.durationMs === "number" &&
      entry.timing.durationMs < filters.minDurationMs
    ) {
      return false;
    }
    return true;
  }

  function ringPush(arr, item, max) {
    arr.push(item);
    if (arr.length > max) arr.splice(0, arr.length - max);
  }

  // Size-aware helpers for body capture constraints
  function maybeOmitBodyBySize(bodyStr, side /* 'request'|'response' */) {
    try {
      const { maxRequestBodyBytes, maxResponseBodyBytes } =
        state.options.filters;
      const limit =
        side === "request" ? maxRequestBodyBytes : maxResponseBodyBytes;
      if (!limit || !bodyStr) return bodyStr;
      const bytes = new Blob([bodyStr]).size; // rough byte size
      if (bytes > limit) return null; // omit body
      return bodyStr;
    } catch (_) {
      return bodyStr;
    }
  }

  function persistLater() {
    const { persistence } = state.options;
    if (!persistence.enabled) return;
    if (state.persistPending) return;
    state.persistPending = true;
    clearTimeout(state.persistTimer);
    state.persistTimer = setTimeout(() => {
      try {
        const store =
          persistence.storage === "sessionStorage"
            ? window.sessionStorage
            : window.localStorage;
        store.setItem(persistence.key, JSON.stringify(state.log));
        store.setItem(persistence.findingsKey, JSON.stringify(state.findings));
      } catch (_) {}
      state.persistPending = false;
    }, 400);
  }

  function restorePersisted() {
    const { persistence } = state.options;
    if (!persistence.enabled) return;
    try {
      const store =
        persistence.storage === "sessionStorage"
          ? window.sessionStorage
          : window.localStorage;
      const raw = store.getItem(persistence.key);
      const rawF = store.getItem(persistence.findingsKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) state.log = arr;
      }
      if (rawF) {
        const arrF = JSON.parse(rawF);
        if (Array.isArray(arrF)) state.findings = arrF;
      }
    } catch (_) {}
  }

  function startConsoleFlusher() {
    stopConsoleFlusher();
    if (!state.options.performance.throttleConsole) return;
    state.consoleTimer = setInterval(() => {
      if (!state.consoleBuffer.length || state.paused) return;
      const entry = state.consoleBuffer.shift();
      console.log("%c[NetworkMapper]", "color: cyan;", entry);
    }, state.options.performance.consoleIntervalMs);
    state.findingsTimer = setInterval(() => {
      if (!state.findingsBuffer.length || state.paused) return;
      const f = state.findingsBuffer.shift();
      printFindingToConsole(f);
    }, Math.max(250, state.options.performance.consoleIntervalMs));
  }

  function stopConsoleFlusher() {
    if (state.consoleTimer) {
      clearInterval(state.consoleTimer);
      state.consoleTimer = null;
    }
    if (state.findingsTimer) {
      clearInterval(state.findingsTimer);
      state.findingsTimer = null;
    }
  }

  // ---- Body readers ----
  async function readBodyFromRequest(req) {
    try {
      if (!req) return { body: null };
      const clone = req.clone();
      const ct = clone.headers.get("content-type") || "";
      if (/multipart\/form-data|application\/x-www-form-urlencoded/i.test(ct)) {
        try {
          const fd = await clone.formData();
          const obj = {};
          for (const [k, v] of fd.entries())
            obj[k] = typeof v === "string" ? v : `[File:${v.name || "blob"}]`;
          return { body: JSON.stringify(obj), json: obj, contentType: ct };
        } catch (_) {}
      }
      try {
        const text = await clone.text();
        const json = parseMaybeJSON(text);
        return { body: text, json, contentType: ct };
      } catch (_) {
        try {
          const ab = await clone.arrayBuffer();
          return {
            body: `[binary ${ab.byteLength} bytes]`,
            binaryBytes: ab.byteLength,
            contentType: ct,
          };
        } catch (_) {
          return { body: null };
        }
      }
    } catch(e) {
      console.warn("Failed to clone request body:", e);
      return { body: null };
    }
  }

  async function readBodyFromResponse(res) {
    try {
      const ct = res.headers.get("content-type") || "";
      if (/^text\//i.test(ct) || /json/i.test(ct) || ct === "") {
        const text = await res.text();
        const json = parseMaybeJSON(text);
        return { body: text, json, contentType: ct };
      }
      if (/^application\/(?:json|javascript)/i.test(ct)) {
        const text = await res.text();
        const json = parseMaybeJSON(text);
        return { body: text, json, contentType: ct };
      }
      const ab = await res.arrayBuffer();
      return {
        body: `[binary ${ab.byteLength} bytes]`,
        binaryBytes: ab.byteLength,
        contentType: ct,
      };
    } catch (_) {
      return { body: null };
    }
  }

  // ---- Hook: Fetch ----
  function hookFetch() {
    if (!window.fetch) return;
    if (state.options.safeMode && !isNative(window.fetch)) {
      console.warn(
        "[NetworkMapper] fetch appears non-native. Skipping hook (safeMode)."
      );
      return;
    }
    state.orig.fetch = window.fetch;
    window.fetch = async function (input, init) {
      if (state.paused) return state.orig.fetch.apply(this, arguments);
      const id = generateId("fetch");
      let req;
      try {
        req = input instanceof Request ? input : new Request(input, init);
      } catch (_) {
        return state.orig.fetch.apply(this, arguments);
      }

      const start = performance.now();
      const { body: reqBody, json: reqJson } = await readBodyFromRequest(req);
      const requestHeaders = state.options.headers.captureRequest
        ? headersToObject(req.headers)
        : null;

      const triggeredBy = getElementDetails(state.lastClickedElement);
      const userEvent = state.lastUserEvent
        ? deepClone(state.lastUserEvent)
        : null;
      const stack = captureStack();

      try {
        const response = await state.orig.fetch.call(this, req);
        const end = performance.now();
        const resClone = response.clone();
        const { body: resBody, json: resJson } = await readBodyFromResponse(
          resClone
        );
        const responseHeaders = state.options.headers.captureResponse
          ? headersToObject(response.headers)
          : null;

        const entry = {
          id,
          type: "fetch",
          url: req.url,
          method: req.method,
          status: response.status,
          requestHeaders,
          responseHeaders,
          requestBody: trimBody(
            maybeOmitBodyBySize(reqBody, "request"),
            state.options.requestBodyCapture
          ),
          requestBodyJSON: reqJson || null,
          responseBody: trimBody(
            maybeOmitBodyBySize(resBody, "response"),
            state.options.responseBodyCapture
          ),
          responseBodyJSON: resJson || null,
          timing: {
            startTime: new Date().toISOString(),
            durationMs: +(end - start).toFixed(2),
          },
          triggeredBy,
          userEvent,
          stack,
        };
        saveLog(entry);
        return response;
      } catch (err) {
        const end = performance.now();
        const entry = {
          id,
          type: "fetch",
          url: req.url,
          method: req.method,
          error: String(err?.message || err),
          timing: {
            startTime: new Date().toISOString(),
            durationMs: +(end - start).toFixed(2),
          },
          triggeredBy,
          userEvent,
          stack,
        };
        saveLog(entry);
        throw err;
      }
    };
  }

  // ---- Hook: XMLHttpRequest ----
  function hookXHR() {
    if (!window.XMLHttpRequest) return;
    const proto = XMLHttpRequest.prototype;
    if (
      state.options.safeMode &&
      (!isNative(proto.open) || !isNative(proto.send))
    ) {
      console.warn(
        "[NetworkMapper] XHR methods appear non-native. Skipping hook (safeMode)."
      );
      return;
    }
    state.orig.XHROpen = proto.open;
    state.orig.XHRSend = proto.send;
    state.orig.XHRSetRequestHeader = proto.setRequestHeader;

    proto.open = function (method, url) {
      this.__nm = this.__nm || {};
      this.__nm.id = generateId("xhr");
      this.__nm.method = method;
      this.__nm.url = url;
      this.__nm.requestHeaders = {};
      this.__nm.start = null;
      return state.orig.XHROpen.apply(this, arguments);
    };

    proto.setRequestHeader = function (key, value) {
      try {
        this.__nm = this.__nm || { requestHeaders: {} };
        this.__nm.requestHeaders[key] = value;
      } catch (_) {}
      return state.orig.XHRSetRequestHeader.apply(this, arguments);
    };

    proto.send = function (body) {
      this.__nm = this.__nm || {};
      this.__nm.start = performance.now();
      this.__nm.requestBody = body;
      const xhr = this;
      const id = this.__nm.id || generateId("xhr");
      const triggeredBy = getElementDetails(state.lastClickedElement);
      const userEvent = state.lastUserEvent
        ? deepClone(state.lastUserEvent)
        : null;
      const stack = captureStack();

      // Headers-only snapshot when headers received (readyState 2)
      xhr.addEventListener("readystatechange", function () {
        try {
          if (xhr.readyState === 2) {
            let responseHeaders = null;
            if (state.options.headers.captureResponse) {
              const raw = xhr.getAllResponseHeaders?.() || "";
              responseHeaders = {};
              raw
                .trim()
                .split(/\r?\n/)
                .forEach((line) => {
                  const idx = line.indexOf(":");
                  if (idx > -1) {
                    const k = line.slice(0, idx).trim();
                    const v = line.slice(idx + 1).trim();
                    if (k) responseHeaders[k.toLowerCase()] = v;
                  }
                });
            }
            const entry = {
              id,
              type: "xhr-headers",
              url: xhr.__nm?.url,
              method: xhr.__nm?.method,
              status: xhr.status,
              responseHeaders,
              timing: { startTime: new Date().toISOString(), phase: "headers" },
              triggeredBy,
              userEvent,
              stack,
            };
            saveLog(entry);
          }
        } catch (_) {}
      });

      function finalize(type) {
        try {
          const end = performance.now();
          let responseHeaders = null;
          if (state.options.headers.captureResponse) {
            const raw = xhr.getAllResponseHeaders?.() || "";
            responseHeaders = {};
            raw
              .trim()
              .split(/\r?\n/)
              .forEach((line) => {
                const idx = line.indexOf(":");
                if (idx > -1) {
                  const k = line.slice(0, idx).trim();
                  const v = line.slice(idx + 1).trim();
                  if (k) responseHeaders[k.toLowerCase()] = v;
                }
              });
          }
          let responseBody = null,
            responseBodyJSON = null;
          try {
            if (xhr.responseType === "" || xhr.responseType === "text") {
              responseBody = xhr.responseText || null;
              responseBodyJSON = parseMaybeJSON(responseBody);
            } else if (xhr.responseType === "json") {
              responseBodyJSON = xhr.response || null;
              responseBody = responseBodyJSON
                ? JSON.stringify(responseBodyJSON)
                : null;
            } else if (xhr.responseType === "document") {
              responseBody = xhr.responseXML
                ? new XMLSerializer()
                    .serializeToString(xhr.responseXML)
                    .slice(0, 2000)
                : "[document]";
            } else if (xhr.responseType === "blob") {
              responseBody = xhr.response
                ? `[blob ${xhr.response.size || 0} bytes]`
                : null;
            } else if (xhr.responseType === "arraybuffer") {
              responseBody = xhr.response
                ? `[arraybuffer ${xhr.response.byteLength || 0} bytes]`
                : null;
            }
          } catch (_) {}

          const requestHeaders = state.options.headers.captureRequest
            ? this.__nm?.requestHeaders || null
            : null;
          const entry = {
            id,
            type: "xhr",
            url: xhr.__nm?.url,
            method: xhr.__nm?.method,
            status: xhr.status,
            requestHeaders,
            responseHeaders,
            requestBody: trimBody(
              stringifyBody(xhr.__nm?.requestBody),
              state.options.requestBodyCapture
            ),
            requestBodyJSON: parseMaybeJSON(
              stringifyBody(xhr.__nm?.requestBody)
            ),
            responseBody: trimBody(
              responseBody,
              state.options.responseBodyCapture
            ),
            responseBodyJSON,
            timing: {
              startTime: new Date().toISOString(),
              durationMs: +(end - (xhr.__nm?.start || end)).toFixed(2),
            },
            triggeredBy,
            userEvent,
            stack,
            event: type,
          };
          saveLog(entry);
        } catch(e) {
          console.warn("finalize error:", e);
        }
      }

      xhr.addEventListener("load", function () {
        finalize.call(xhr, "load");
      });
      xhr.addEventListener("error", function () {
        finalize.call(xhr, "error");
      });
      xhr.addEventListener("abort", function () {
        finalize.call(xhr, "abort");
      });
      xhr.addEventListener("timeout", function () {
        finalize.call(xhr, "timeout");
      });

      return state.orig.XHRSend.apply(this, arguments);
    };
  }

  function stringifyBody(body) {
    if (body == null) return null;
    try {
      if (typeof body === "string") return body;
      if (body instanceof Document)
        return new XMLSerializer().serializeToString(body);
      if (body instanceof Blob) return `[blob ${body.size} bytes]`;
      if (body instanceof ArrayBuffer)
        return `[arraybuffer ${body.byteLength} bytes]`;
      if (
        typeof URLSearchParams !== "undefined" &&
        body instanceof URLSearchParams
      )
        return body.toString();
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        const obj = {};
        for (const [k, v] of body.entries())
          obj[k] = typeof v === "string" ? v : `[File:${v.name || "blob"}]`;
        return JSON.stringify(obj);
      }
      return JSON.stringify(body);
    } catch (_) {
      return String(body);
    }
  }

  // ---- Hook: WebSocket ----
  function hookWebSocket() {
    if (!window.WebSocket) return;
    if (state.options.safeMode && !isNative(window.WebSocket)) {
      console.warn(
        "[NetworkMapper] WebSocket appears non-native. Skipping hook (safeMode)."
      );
      return;
    }
    state.orig.WebSocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
      const id = generateId("ws");
      const ws = protocols
        ? new state.orig.WebSocket(url, protocols)
        : new state.orig.WebSocket(url);
      const triggeredBy = getElementDetails(state.lastClickedElement);
      const userEvent = state.lastUserEvent
        ? deepClone(state.lastUserEvent)
        : null;
      const stack = captureStack();

      ws.addEventListener("open", () => {
        saveLog({
          id,
          type: "websocket-open",
          url,
          protocols: protocols || null,
          time: new Date().toISOString(),
          triggeredBy,
          userEvent,
          stack,
        });
      });
      saveLog({
        id,
        type: "websocket",
        url,
        protocols: protocols || null,
        time: new Date().toISOString(),
        triggeredBy,
        userEvent,
        stack,
      });

      const origSend = ws.send;
      ws.send = function (data) {
        const payload = normalizeWsData(
          data,
          state.options.responseBodyCapture
        );
        saveLog({
          id,
          type: "websocket-send",
          url,
          data: payload.preview,
          parsed: payload.parsed,
          length: payload.length,
          time: new Date().toISOString(),
        });
        return origSend.apply(this, arguments);
      };

      ws.addEventListener("message", (evt) => {
        const payload = normalizeWsData(
          evt.data,
          state.options.responseBodyCapture
        );
        saveLog({
          id,
          type: "websocket-receive",
          url,
          dataSnippet: payload.preview,
          parsed: payload.parsed,
          length: payload.length,
          time: new Date().toISOString(),
        });
      });
      ws.addEventListener("error", () => {
        saveLog({
          id,
          type: "websocket-error",
          url,
          time: new Date().toISOString(),
        });
      });
      ws.addEventListener("close", (e) => {
        saveLog({
          id,
          type: "websocket-close",
          url,
          code: e.code,
          reason: e.reason,
          wasClean: e.wasClean,
          time: new Date().toISOString(),
        });
      });

      return ws;
    };
    window.WebSocket.prototype = state.orig.WebSocket.prototype;
    window.WebSocket.CONNECTING = state.orig.WebSocket.CONNECTING;
    window.WebSocket.OPEN = state.orig.WebSocket.OPEN;
    window.WebSocket.CLOSING = state.orig.WebSocket.CLOSING;
    window.WebSocket.CLOSED = state.orig.WebSocket.CLOSED;
  }

  function normalizeWsData(data, captureMode) {
    let preview = null,
      parsed = null,
      length = null;
    try {
      if (typeof data === "string") {
        length = data.length;
        preview = trimBody(data, captureMode);
        parsed = parseMaybeJSON(data);
      } else if (data instanceof Blob) {
        length = data.size;
        preview = `[blob ${data.size} bytes]`;
      } else if (data instanceof ArrayBuffer) {
        length = data.byteLength;
        preview = `[arraybuffer ${data.byteLength} bytes]`;
      } else {
        const s = stringifyBody(data);
        preview = trimBody(s, captureMode);
        parsed = parseMaybeJSON(s);
      }
    } catch (_) {
      preview = "[unavailable]";
    }
    return { preview, parsed, length };
  }

  // ---- Automated Analysis Engine ----
  const severities = {
    P1: { color: "#ff1744", label: "P1" },
    P2: { color: "#ff9100", label: "P2" },
    P3: { color: "#ffd600", label: "P3" },
    P4: { color: "#29b6f6", label: "P4" },
  };

  // Helper patterns
  const RX = {
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, // header.payload.signature
    apiKeyLike:
      /(?:api[-_]?key|x[-_]?api[-_]?key|access[-_]?key)[=:\s]?[A-Za-z0-9\-_]{16,}/i,
    bearer: /Bearer\s+[A-Za-z0-9\-_.=]+/i,
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    creditCard:
      /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/,
    internalHost:
      /^(?:localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|.*\.(?:local|internal|intra|corp)\b)/i,
  };

  function urlQueryPairs(url) {
    try {
      const u = new URL(url, location.href);
      const out = [];
      for (const [k, v] of u.searchParams.entries()) out.push({ k, v });
      return out;
    } catch (_) {
      return [];
    }
  }
  function hasWildcardACAO(h) {
    const v = (h?.["access-control-allow-origin"] || "").trim();
    return v === "*";
  }
  function hasCredentialsAllowed(h) {
    const v = (h?.["access-control-allow-credentials"] || "").toLowerCase();
    return v === "true";
  }

  function base64UrlDecode(str) {
    try {
      const pad = str.length % 4 === 2 ? "==" : str.length % 4 === 3 ? "=" : "";
      return atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
    } catch (_) {
      return null;
    }
  }
  function parseJwtHeader(token) {
    try {
      const [h] = String(token).split(".");
      const json = base64UrlDecode(h);
      if (!json) return null;
      return JSON.parse(json);
    } catch (_) {
      return null;
    }
  }

  const ssrfIndicators = [
    /metadata\.googleapis\.com|169\.254\.169\.254|\.internal\b|\.local\b/i,
    /file:\/\//i,
    /@/,
    /\b(?:localhost|127\.0\.0\.1)\b/i,
  ];

  const defaultRules = [
    // New: SSRF indicators
    {
      id: "ssrf-indicators",
      type: "ssrf",
      desc: "Potential SSRF indicators in request",
      enabled: true,
      test(entry) {
        const out = [];
        try {
          const body =
            (entry.requestBody || "") +
            JSON.stringify(entry.requestBodyJSON || {});
          const headers = entry.requestHeaders || {};
          const url = entry.url || "";
          const indicators = ssrfIndicators;
          if (indicators.some((rx) => rx.test(url) || rx.test(body))) {
            out.push({
              severity: "P2",
              message: "Possible SSRF target indicator in URL/body",
            });
          }
          // Dangerous redirect-like parameters
          const qp = urlQueryPairs(url);
          const redirectKeys = /url|redirect|next|return|to|dest|target/i;
          for (const { k, v } of qp) {
            if (redirectKeys.test(k) && /^(?:https?:)?\/\//i.test(v)) {
              out.push({
                severity: "P3",
                message: `Open-redirect-like param ${k}=${truncate(v, 80)}`,
              });
            }
          }
          // Header that might be abused
          if (
            /\bforwarded\b|\bx-forwarded-for\b|\bx-original-url\b/i.test(
              Object.keys(headers).join(",")
            )
          ) {
            out.push({
              severity: "P3",
              message: "Potentially spoofable forwarding headers present",
            });
          }
        } catch (_) {}
        return out;
      },
    },

    // New: SOAP/XPath injection hints
    {
      id: "soap-xpath-injection",
      type: "injection",
      desc: "Potential SOAP/XPath injection indicators",
      enabled: true,
      test(entry) {
        const out = [];
        const ct =
          (entry.requestHeaders?.["content-type"] || "") +
          " " +
          (entry.responseHeaders?.["content-type"] || "");
        const body =
          (entry.requestBody || "") + "\n" + (entry.responseBody || "");
        // SOAP envelope pattern
        if (
          /<\s*Envelope[\s>].*<\s*Body[\s>]/i.test(body) ||
          /xml\b/i.test(ct)
        ) {
          // Common XPath injection patterns
          if (
            /['"]\s*or\s*['"]?\w+['"]?\s*=\s*['"]?\w+['"]?/i.test(body) ||
            /\bcontains\s*\(|starts-with\s*\(/i.test(body)
          ) {
            out.push({
              severity: "P2",
              message: "XPath-like predicate patterns in XML",
            });
          }
          // External entity DOCTYPE (XXE)
          if (/<!DOCTYPE\s+[^>]*\[\s*<!ENTITY/i.test(body)) {
            out.push({
              severity: "P1",
              message: "XML DOCTYPE/ENTITY detected (possible XXE)",
            });
          }
        }
        return out;
      },
    },

    // New: CSRF absence heuristics
    {
      id: "csrf-absence-heuristic",
      type: "csrf",
      desc: "State-changing request without CSRF indicators",
      enabled: true,
      test(entry) {
        const out = [];
        const method = (entry.method || "").toUpperCase();
        if (!/POST|PUT|PATCH|DELETE/i.test(method)) return out;
        const url = entry.url || "";
        // Skip obvious safe endpoints
        if (/\b(?:login|auth|token|csrf|xsrf)\b/i.test(url)) return out;
        // Heuristic: look for anti-CSRF header or token in body
        const hdrs = entry.requestHeaders || {};
        const hasHeader = Object.keys(hdrs).some((k) =>
          /x-?csrf-?token|x-?xsrf-?token|x-requested-with/i.test(k)
        );
        const body =
          (entry.requestBody || "") +
          JSON.stringify(entry.requestBodyJSON || {});
        const hasTokenInBody =
          /csrf|xsrf|anti[-_]?csrf|_token|authenticity_token/i.test(body);
        if (!hasHeader && !hasTokenInBody) {
          out.push({
            severity: "P2",
            message: "State-changing request without CSRF indicators",
          });
        }
        return out;
      },
    },

    // New: SOAP action/method exposure
    {
      id: "soap-action-exposure",
      type: "headers",
      desc: "SOAPAction header exposed (may disclose methods)",
      enabled: true,
      test(entry) {
        const h = entry.requestHeaders || {};
        for (const [k, v] of Object.entries(h)) {
          if (/^soapaction$/i.test(k)) {
            return [
              {
                severity: "P4",
                message: `SOAPAction header: ${truncate(String(v), 100)}`,
              },
            ];
          }
        }
        return [];
      },
    },
    {
      id: "sensitive-in-url",
      type: "sensitive-data",
      desc: "Sensitive data present in URL query/path",
      enabled: true,
      test(entry) {
        if (!entry.url) return [];
        const findings = [];
        const pairs = urlQueryPairs(entry.url);
        const keyMatch = /pass|pwd|token|secret|key|auth|session|otp|email/i;
        for (const { k, v } of pairs) {
          if (
            keyMatch.test(k) ||
            RX.jwt.test(v) ||
            RX.apiKeyLike.test(`${k}=${v}`) ||
            RX.email.test(v)
          ) {
            findings.push({
              severity: keyMatch.test(k) ? "P1" : "P2",
              message: `Sensitive-looking query param ${k}=${truncate(v, 80)}`,
            });
          }
        }
        const path = new URL(entry.url, location.href).pathname;
        if (/\/access[-_]?token\//i.test(path))
          findings.push({
            severity: "P1",
            message: `Token-like value in path: ${path}`,
          });
        return findings;
      },
    },
    {
      id: "sensitive-in-headers",
      type: "sensitive-data",
      desc: "Sensitive headers present",
      enabled: true,
      test(entry) {
        const out = [];
        const check = (headers, side) => {
          if (!headers) return;
          for (const [k, v] of Object.entries(headers)) {
            if (/authorization|x-?api-?key|token|cookie/i.test(k)) {
              out.push({
                severity: /authorization|token/i.test(k) ? "P1" : "P2",
                message: `Sensitive header (${side}) ${k}: ${truncate(
                  String(v),
                  100
                )}`,
              });
            }
            if (
              RX.bearer.test(String(v)) ||
              RX.apiKeyLike.test(`${k}:${v}`) ||
              RX.jwt.test(String(v))
            ) {
              out.push({
                severity: "P1",
                message: `Secret-like value in ${side} header ${k}`,
              });
            }
            // JWT none alg detection for Authorization: Bearer <jwt>
            if (/authorization/i.test(k)) {
              const token = String(v)
                .replace(/Bearer\s+/i, "")
                .trim();
              if (RX.jwt.test(token)) {
                const h = parseJwtHeader(token);
                if (h && /none/i.test(h.alg || ""))
                  out.push({
                    severity: "P1",
                    message: "JWT using 'none' alg in Authorization header",
                  });
              }
            }
          }
        };
        check(entry.requestHeaders, "request");
        check(entry.responseHeaders, "response");
        return out;
      },
    },
    {
      id: "sensitive-in-bodies",
      type: "sensitive-data",
      desc: "Sensitive data present in request/response bodies",
      enabled: true,
      test(entry) {
        const out = [];
        const checkText = (text, side) => {
          if (!text) return;
          if (
            RX.jwt.test(text) ||
            RX.bearer.test(text) ||
            RX.apiKeyLike.test(text)
          )
            out.push({
              severity: "P1",
              message: `Secret-like value in ${side} body`,
            });
          if (
            RX.email.test(text) ||
            RX.ssn.test(text) ||
            RX.creditCard.test(text)
          )
            out.push({
              severity: "P2",
              message: `PII-like pattern in ${side} body`,
            });
        };
        checkText(entry.requestBody, "request");
        checkText(entry.responseBody, "response");
        const keyMatch = /pass|pwd|token|secret|api[-_]?key|ssn|email/i;
        const checkJSON = (obj, side, path = [], depth = 0) => {
          if (!obj || typeof obj !== "object") return;
          if (depth > 10) return;
          for (const k of Object.keys(obj)) {
            const v = obj[k];
            const p = [...path, k].join(".");
            if (keyMatch.test(k))
              out.push({
                severity: "P1",
                message: `Sensitive key '${p}' in ${side} JSON`,
              });
            if (typeof v === "string") checkText(v, `${side} (${p})`);
            else if (typeof v === "object") checkJSON(v, side, [...path, k], depth + 1);
          }
        };
        if (entry.requestBodyJSON) checkJSON(entry.requestBodyJSON, "request");
        if (entry.responseBodyJSON)
          checkJSON(entry.responseBodyJSON, "response");
        return out;
      },
    },
    {
      id: "insecure-cookies",
      type: "cookie",
      desc: "Insecure Set-Cookie attributes",
      enabled: true,
      test(entry) {
        const h = entry.responseHeaders;
        if (!h) return [];
        const setCookie = h["set-cookie"];
        if (!setCookie) return [];
        const items = Array.isArray(setCookie) ? setCookie : [setCookie];
        const out = [];
        items.forEach((c) => {
          try {
            const lc = String(c).toLowerCase();
            if (!/;\s*secure\b/.test(lc) && location.protocol === "https:")
              out.push({
                severity: "P2",
                message: `Set-Cookie without Secure over HTTPS: ${truncate(
                  c,
                  120
                )}`,
              });
            if (!/;\s*httponly\b/.test(lc))
              out.push({
                severity: "P3",
                message: `Set-Cookie without HttpOnly: ${truncate(c, 120)}`,
              });
            if (c.length > 4096)
              out.push({
                severity: "P4",
                message: `Very large cookie (~${c.length} bytes)`,
              });
          } catch (e) {}
        });
        return out;
      },
    },
    {
      id: "internal-endpoint",
      type: "endpoint",
      desc: "Request to internal-looking endpoint",
      enabled: true,
      test(entry) {
        if (!entry.url) return [];
        try {
          const u = new URL(entry.url, location.href);
          if (RX.internalHost.test(u.hostname))
            return [
              {
                severity: "P2",
                message: `Internal-looking host: ${u.hostname}`,
              },
            ];
        } catch (_) {}
        return [];
      },
    },
    {
      id: "info-disclosure-headers",
      type: "headers",
      desc: "Information disclosure via response headers",
      enabled: true,
      test(entry) {
        const h = entry.responseHeaders;
        if (!h) return [];
        const out = [];
        ["server", "x-powered-by", "x-aspnet-version", "x-runtime"].forEach(
          (k) => {
            try {
              if (h[k])
                out.push({
                  severity: "P3",
                  message: `Header '${k}': ${truncate(String(h[k]), 100)}`,
                });
            } catch (e) {}
          }
        );
        return out;
      },
    },
    {
      id: "cors-misconfig",
      type: "cors",
      desc: "Permissive CORS headers",
      enabled: true,
      test(entry) {
        const h = entry.responseHeaders;
        if (!h) return [];
        const star = hasWildcardACAO(h);
        const creds = hasCredentialsAllowed(h);
        if (star && creds)
          return [
            {
              severity: "P1",
              message: "CORS: ACAO '*' with credentials allowed",
            },
          ];
        if (star) return [{ severity: "P3", message: "CORS: ACAO '*'" }];
        return [];
      },
    },
    {
      id: "weak-protocol-mixed",
      type: "protocol",
      desc: "Insecure or mixed-content request",
      enabled: true,
      test(entry) {
        if (!entry.url) return [];
        try {
          const u = new URL(entry.url, location.href);
          if (location.protocol === "https:" && u.protocol === "http:")
            return [
              { severity: "P2", message: `Mixed content over HTTP: ${u.href}` },
            ];
        } catch (_) {}
        return [];
      },
    },
    {
      id: "verbose-errors",
      type: "error",
      desc: "Server error with verbose message",
      enabled: true,
      test(entry) {
        if (!entry.status || entry.status < 500) return [];
        const body = entry.responseBody || "";
        if (/Exception|Traceback|at\s+[A-Za-z_.]+\(/.test(body))
          return [
            {
              severity: "P3",
              message: "Verbose error content in 5xx response",
            },
          ];
        return [];
      },
    },
    {
      id: "graphql-introspection",
      type: "api",
      desc: "GraphQL introspection usage detected",
      enabled: true,
      test(entry) {
        try {
          if (!entry.url) return [];
          const u = new URL(entry.url, location.href);
          const isGraphQL =
            /graphql/i.test(u.pathname) ||
            /graphql/i.test(entry.requestHeaders?.["content-type"] || "") ||
            /graphql/i.test(entry.responseHeaders?.["content-type"] || "");
          const q =
            (entry.requestBody || "") +
            "\n" +
            (JSON.stringify(entry.requestBodyJSON || {}) || "");
          if (isGraphQL && /__schema|IntrospectionQuery/i.test(q))
            return [
              {
                severity: "P3",
                message: "GraphQL introspection query present",
              },
            ];
        } catch (_) {}
        return [];
      },
    },
    {
      id: "directory-listing",
      type: "content",
      desc: "Possible directory listing exposed",
      enabled: true,
      test(entry) {
        const body = entry.responseBody || "";
        if (/\bIndex of \/\b/i.test(body) || /<title>Index of /i.test(body))
          return [
            { severity: "P3", message: "Directory listing content detected" },
          ];
        return [];
      },
    },
    {
      id: "missing-cache-control",
      type: "cache",
      desc: "Sensitive response without no-store/no-cache",
      enabled: true,
      test(entry) {
        const h = entry.responseHeaders;
        if (!h) return [];
        const cc = (h["cache-control"] || "").toLowerCase();
        const sensitiveHint = /token|auth|secret|password|session/i;
        const bodyStr =
          (entry.responseBody || "") +
          JSON.stringify(entry.responseBodyJSON || {});
        if (!cc || (!/no-store|no-cache/i.test(cc) && /public/.test(cc))) {
          if (sensitiveHint.test(bodyStr))
            return [
              {
                severity: "P3",
                message: "Sensitive-looking response without no-store/no-cache",
              },
            ];
        }
        return [];
      },
    },
  ];

  function truncate(str, n) {
    if (typeof str !== "string") return String(str);
    return str.length > n ? str.slice(0, n) + "…" : str;
  }

  function analyzeEntry(entry) {
    if (!state.options.analysis.enabled) return;
    const findings = [];
    for (const rule of defaultRules) {
      const enabledFlag = state.options.analysis.rules[rule.id];
      if (enabledFlag === false) continue;
      try {
        const res = rule.test(entry) || [];
        for (const r of res) {
          const f = {
            id: generateId("f"),
            ruleId: rule.id,
            type: rule.type,
            severity: r.severity || "P4",
            message: r.message || rule.desc,
            entryId: entry.id,
            url: entry.url || null,
            method: entry.method || null,
            status: entry.status || null,
            at: new Date().toISOString(),
          };
          if (shouldKeepFinding(f)) {
            pushFinding(f);
          }
          findings.push(f);
        }
      } catch(e) {
        console.warn("Rule error (" + (rule.id || "unknown") + "):", e);
      }
    }
    if (findings.length) scheduleSummary();
  }

  function shouldKeepFinding(f) {
    const { filters } = state.options.analysis;
    if (!filters) return true;
    if (filters.severities && !filters.severities.includes(f.severity))
      return false;
    if (filters.types && !filters.types.includes(f.type)) return false;
    return true;
  }

  function pushFinding(f) {
    ringPush(state.findings, f, state.options.analysis.findingsMax);
    ringPush(
      state.findingsBuffer,
      f,
      Math.min(500, state.options.analysis.findingsMax)
    );
    // Emit custom event for findings
    try {
      if (
        state.options.events.emitCustomEvents &&
        typeof window.CustomEvent === "function"
      ) {
        const evt = new CustomEvent(`${state.options.events.prefix}:finding`, {
          detail: f,
        });
        window.dispatchEvent(evt);
      }
    } catch (_) {}
    persistLater();
  }

  function printFindingToConsole(f) {
    const sev = severities[f.severity] || severities.P4;
    const style = `color: ${sev.color}; font-weight: bold;`;
    console.log(`%c[NM ${sev.label}] ${f.type}: ${f.message}`, style, {
      entryId: f.entryId,
      url: f.url,
      method: f.method,
      status: f.status,
      rule: f.ruleId,
      at: f.at,
    });
  }

  function scheduleSummary() {
    if (!state.options.analysis.autoSummarize) return;
    clearTimeout(state.summarizeTimer);
    state.summarizeTimer = setTimeout(() => {
      API.printCriticalFindings();
    }, state.options.analysis.autoSummarizeIdleMs);
  }

  // ---- Analysis batching ----
  function processAnalysisQueueSlice() {
    const { maxProcessPerTick = 50, useIdleCallback = false } =
      state.options.performance || {};
    let count = 0;
    while (state.analysisQueue.length && count < maxProcessPerTick) {
      const e = state.analysisQueue.shift();
      try {
        analyzeEntry(e);
      } catch (_) {}
      count++;
    }
    if (state.analysisQueue.length) scheduleAnalysisDrain();
  }
  function scheduleAnalysisDrain() {
    clearTimeout(state.analysisTimer);
    const run = () => processAnalysisQueueSlice();
    if (
      state.options.performance?.useIdleCallback &&
      typeof window.requestIdleCallback === "function"
    ) {
      try {
        window.requestIdleCallback(() => run(), { timeout: 200 });
        return;
      } catch (_) {}
    }
    state.analysisTimer = setTimeout(run, 0);
  }
  function enqueueForAnalysis(entry) {
    if (!state.options.analysis.enabled) return;
    state.analysisQueue.push(entry);
    scheduleAnalysisDrain();
  }

  // ---- Core saveLog ----
  function saveLog(entry) {
    if (!shouldLogEntry(entry)) return;

    if (entry.requestHeaders && state.options.headers.captureRequest)
      entry.requestHeaders = redactHeaders(entry.requestHeaders);
    if (entry.responseHeaders && state.options.headers.captureResponse)
      entry.responseHeaders = redactHeaders(entry.responseHeaders);

    if (entry.requestBodyJSON)
      entry.requestBodyJSON = redactJson(entry.requestBodyJSON);
    if (entry.responseBodyJSON)
      entry.responseBodyJSON = redactJson(entry.responseBodyJSON);

    if (typeof entry.requestBody === "string")
      entry.requestBody = redactStringBody(entry.requestBody);
    if (typeof entry.responseBody === "string")
      entry.responseBody = redactStringBody(entry.responseBody);

    ringPush(state.log, entry, state.options.performance.maxEntries);
    ringPush(state.consoleBuffer, entry, state.options.performance.bufferSize);
    if (!state.options.performance.throttleConsole)
      console.log("%c[NetworkMapper]", "color: cyan;", entry);

    // Emit custom event for integrations
    try {
      if (
        state.options.events.emitCustomEvents &&
        typeof window.CustomEvent === "function"
      ) {
        const evt = new CustomEvent(`${state.options.events.prefix}:entry`, {
          detail: entry,
        });
        window.dispatchEvent(evt);
      }
    } catch (_) {}

    // Automated analysis: batch queue to smooth bursts
    enqueueForAnalysis(entry);

    persistLater();
  }

  // ---- User event context ----
  state._eventListeners = [];
  function setupUserEventTracking() {
    const capture = (type) => (e) => {
      state.lastUserEvent = {
        type,
        at: Date.now(),
        details: getElementDetails(e.target),
      };
    };
    try {
      const clickHandler = capture("click");
      const submitHandler = capture("submit");
      const changeHandler = capture("change");
      const keydownHandler = (e) => {
        state.lastUserEvent = {
          type: "keydown",
          key: e.key,
          at: Date.now(),
          details: getElementDetails(e.target),
        };
      };
      document.addEventListener("click", clickHandler, true);
      document.addEventListener("submit", submitHandler, true);
      document.addEventListener("change", changeHandler, true);
      document.addEventListener("keydown", keydownHandler, true);
      state._eventListeners.push({ target: document, type: "click", handler: clickHandler });
      state._eventListeners.push({ target: document, type: "submit", handler: submitHandler });
      state._eventListeners.push({ target: document, type: "change", handler: changeHandler });
      state._eventListeners.push({ target: document, type: "keydown", handler: keydownHandler });
    } catch (_) {}
  }
  function teardownUserEventTracking() {
    (state._eventListeners || []).forEach(function(ref) {
      try { ref.target.removeEventListener(ref.type, ref.handler); } catch(e) {}
    });
    state._eventListeners = [];
  }

  // ---- Public API ----
  const API = {
    // Overlay UI controls
    toggleOverlay(show = !state.overlay.visible) {
      try {
        if (show) createOrShowOverlay();
        else hideOverlay();
      } catch (e) {
        console.warn("[NetworkMapper] overlay error", e);
      }
      return this;
    },
    setOverlayFilter({ severity = null, type = null } = {}) {
      state.overlay.filterSeverity = severity;
      state.overlay.filterType = type;
      renderOverlay();
      return this;
    },
    __installed: true,
    version: VERSION,

    start(opts) {
      if (opts) this.setOptions(opts);
      if (state.installed) return this;

      setupUserEventTracking();
      hookFetch();
      hookXHR();
      hookWebSocket();
      startConsoleFlusher();
      restorePersisted();

      state.installed = true;
      console.log(
        `%c[NetworkMapper v${VERSION}] Started...`,
        "color: green; font-weight: bold;"
      );
      return this;
    },

    stop() {
      if (!state.installed) return this;
      teardownUserEventTracking();
      if (state.orig.fetch) window.fetch = state.orig.fetch;
      const proto = XMLHttpRequest.prototype;
      if (state.orig.XHROpen) proto.open = state.orig.XHROpen;
      if (state.orig.XHRSend) proto.send = state.orig.XHRSend;
      if (state.orig.XHRSetRequestHeader)
        proto.setRequestHeader = state.orig.XHRSetRequestHeader;
      if (state.orig.WebSocket) window.WebSocket = state.orig.WebSocket;
      stopConsoleFlusher();
      state.installed = false;
      console.warn("[NetworkMapper] Stopped and restored originals.");
      return this;
    },

    pause() {
      state.paused = true;
      return this;
    },
    resume() {
      state.paused = false;
      return this;
    },
    isRunning() {
      return state.installed && !state.paused;
    },

    setOptions(partial) {
      if (!partial || typeof partial !== "object") return this;
      state.options = { ...state.options, ...partial };
      if (partial.headers)
        state.options.headers = {
          ...state.options.headers,
          ...partial.headers,
        };
      if (partial.bodyRedaction)
        state.options.bodyRedaction = {
          ...state.options.bodyRedaction,
          ...partial.bodyRedaction,
        };
      if (partial.filters)
        state.options.filters = {
          ...state.options.filters,
          ...partial.filters,
        };
      if (partial.elementDetails)
        state.options.elementDetails = {
          ...state.options.elementDetails,
          ...partial.elementDetails,
        };
      if (partial.performance)
        state.options.performance = {
          ...state.options.performance,
          ...partial.performance,
        };
      if (partial.persistence)
        state.options.persistence = {
          ...state.options.persistence,
          ...partial.persistence,
        };
      if (partial.analysis)
        state.options.analysis = {
          ...state.options.analysis,
          ...partial.analysis,
          filters: {
            ...state.options.analysis.filters,
            ...(partial.analysis.filters || {}),
          },
          rules: {
            ...state.options.analysis.rules,
            ...(partial.analysis.rules || {}),
          },
        };
      startConsoleFlusher();
      return this;
    },

    clear() {
      state.log = [];
      state.consoleBuffer = [];
      persistLater();
      console.log("[NetworkMapper] Logs cleared.");
      return this;
    },
    getLogs() {
      return state.log.slice();
    },
    getEntryById(id) {
      return state.log.find((e) => e.id === id) || null;
    },

    exportLogs(opts = {}) {
      const { format = "json", includeFindings = false } = opts;
      if (state.log.length > 5000) {
        console.warn("Large export: " + state.log.length + " entries. Consider filtering.");
      }
      const items = state.log.map((e) => deepClone(e));
      if (format === "har") {
        // Basic HAR 1.2 compatible structure
        const har = {
          log: {
            version: "1.2",
            creator: { name: "NetworkMapper", version: VERSION },
            entries: items
              .filter((e) => e.type === "fetch" || e.type === "xhr")
              .map((e) => ({
                startedDateTime:
                  e.timing?.startTime || new Date().toISOString(),
                time: e.timing?.durationMs || 0,
                request: {
                  method: e.method || "GET",
                  url: e.url || "",
                  headers: Object.entries(e.requestHeaders || {}).map(
                    ([name, value]) => ({ name, value: String(value) })
                  ),
                  queryString: (() => {
                    try {
                      const u = new URL(e.url, location.href);
                      return Array.from(u.searchParams.entries()).map(
                        ([name, value]) => ({ name, value })
                      );
                    } catch (_) {
                      return [];
                    }
                  })(),
                  postData: e.requestBody
                    ? {
                        mimeType:
                          e.requestHeaders?.["content-type"] || "text/plain",
                        text: e.requestBody,
                      }
                    : undefined,
                },
                response: {
                  status: e.status || 0,
                  statusText: "",
                  headers: Object.entries(e.responseHeaders || {}).map(
                    ([name, value]) => ({ name, value: String(value) })
                  ),
                  content: {
                    size:
                      (e.responseBody && new Blob([e.responseBody]).size) || 0,
                    mimeType:
                      e.responseHeaders?.["content-type"] || "text/plain",
                    text: e.responseBody || "",
                  },
                },
              })),
          },
        };
        return JSON.stringify(har, null, 2);
      }
      if (format === "csv") {
        function csvEscape(val) {
          return '"' + String(val || "").replace(/"/g, '""') + '"';
        }
        const header = ["id", "type", "url", "method", "status", "durationMs"];
        const lines = [header.map(csvEscape).join(",")];
        for (const e of items) {
          const row = [
            e.id,
            e.type,
            e.url || "",
            e.method || "",
            e.status || "",
            e.timing?.durationMs || "",
          ].map(csvEscape);
          lines.push(row.join(","));
        }
        return lines.join("\n");
      }
      if (format === "summary") {
        const payload = {
          logs: items.length,
          findings: includeFindings ? state.findings.slice() : undefined,
        };
        return JSON.stringify(payload, null, 2);
      }
      // default json
      return JSON.stringify(items, null, 2);
    },
    download(filename = "network-mapper-logs.json", opts = {}) {
      try {
        filename = String(filename || "download").replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);
        const data = this.exportLogs(opts);
        const type = opts?.format === "csv" ? "text/csv" : "application/json";
        const blob = new Blob([data], { type });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download =
          filename ||
          (opts?.format === "csv"
            ? "network-mapper.csv"
            : opts?.format === "har"
            ? "network-mapper.har.json"
            : "network-mapper-logs.json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error("[NetworkMapper] download failed:", e);
      }
      return this;
    },

    showStats() {
      const stats = state.log.reduce(
        (acc, e) => {
          const k = e.type;
          acc.types[k] = (acc.types[k] || 0) + 1;
          if (e.method)
            acc.methods[e.method] = (acc.methods[e.method] || 0) + 1;
          if (e.status) acc.status[e.status] = (acc.status[e.status] || 0) + 1;
          return acc;
        },
        { types: {}, methods: {}, status: {} }
      );
      _safeTable(stats.types);
      _safeTable(stats.methods);
      _safeTable(stats.status);
      return stats;
    },

    flush() {
      while (state.consoleBuffer.length) {
        console.log(
          "%c[NetworkMapper]",
          "color: cyan;",
          state.consoleBuffer.shift()
        );
      }
      while (state.findingsBuffer.length) {
        printFindingToConsole(state.findingsBuffer.shift());
      }
      return this;
    },

    // Findings API
    getFindings(filter = {}) {
      const { severity, type } = filter;
      return state.findings.filter(
        (f) =>
          (!severity || f.severity === severity) && (!type || f.type === type)
      );
    },
    clearFindings() {
      state.findings = [];
      state.findingsBuffer = [];
      persistLater();
      console.log("[NetworkMapper] Findings cleared.");
      return this;
    },
    printCriticalFindings(limit = 20) {
      const order = state.options.analysis.severityOrder;
      const sorted = state.findings
        .slice()
        .sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
      console.group(
        "%c[NetworkMapper Findings]",
        "color:#0bf; font-weight:bold;"
      );
      sorted.slice(0, limit).forEach((f) => printFindingToConsole(f));
      if (sorted.length > limit)
        console.log(`(+${sorted.length - limit} more)`);
      console.groupEnd();
      return sorted.slice(0, limit);
    },
    getAnalysisSummary() {
      const sum = state.findings.reduce(
        (acc, f) => {
          acc.bySeverity[f.severity] = (acc.bySeverity[f.severity] || 0) + 1;
          acc.byType[f.type] = (acc.byType[f.type] || 0) + 1;
          return acc;
        },
        { bySeverity: {}, byType: {} }
      );
      _safeTable(sum.bySeverity);
      _safeTable(sum.byType);
      return sum;
    },

    // Rule control
    addRule(rule) {
      if (!rule || !rule.id || typeof rule.test !== "function") {
        console.warn("Invalid rule");
        return this;
      }
      defaultRules.push({ enabled: true, ...rule });
      state.options.analysis.rules[rule.id] = true;
      return this;
    },
    enableRule(id, enabled = true) {
      state.options.analysis.rules[id] = !!enabled;
      return this;
    },

    // Filters helpers
    setNetworkFilter(urlRegex, methods = null) {
      const f = state.options.filters;
      f.includeUrl = urlRegex || null;
      f.methods = methods || null;
      return this;
    },
    ignoreNetworkUrls(patterns) {
      const f = state.options.filters;
      f.excludeUrl = patterns || null;
      return this;
    },
    setFindingsFilter({ severities = null, types = null } = {}) {
      state.options.analysis.filters = { severities, types };
      return this;
    },

    // Indicators integration (correlate strings with traffic)
    setIndicators(patterns) {
      this.__indicators = Array.isArray(patterns) ? patterns : [];
      return this;
    },
    correlateIndicators() {
      const out = [];
      if (!this.__indicators || !this.__indicators.length) return out;
      const maxEntries = Math.min(state.log.length, 1000);
      for (let i = 0; i < maxEntries; i++) {
        const e = state.log[i];
        const bucket = [];
        const corpus = [
          e.url,
          e.requestBody,
          e.responseBody,
          JSON.stringify(e.requestHeaders || {}),
          JSON.stringify(e.responseHeaders || {}),
        ]
          .filter(Boolean)
          .join("\n");
        for (const p of this.__indicators) {
          try {
            const rx = p instanceof RegExp ? p : new RegExp(p, "i");
            if (rx.test(corpus)) bucket.push(String(p));
          } catch (_) {}
        }
        if (bucket.length)
          out.push({ entryId: e.id, url: e.url, matches: bucket });
      }
      console.log(
        "%c[NetworkMapper] Indicator correlations:",
        "color:#0bf",
        out
      );
      return out;
    },

    help() {
      const cmds = [
        "NetworkMapper.start(opts)",
        "NetworkMapper.stop(); NetworkMapper.pause(); NetworkMapper.resume()",
        "NetworkMapper.setOptions(opts); NetworkMapper.setNetworkFilter(/api/, ['GET','POST']); NetworkMapper.ignoreNetworkUrls([/\\.png$/])",
        "NetworkMapper.getLogs(); NetworkMapper.clear(); NetworkMapper.download('logs.json')",
        "NetworkMapper.getFindings({severity:'P1'}); NetworkMapper.printCriticalFindings(); NetworkMapper.getAnalysisSummary(); NetworkMapper.clearFindings()",
        "NetworkMapper.enableRule('ruleId', true|false); NetworkMapper.addRule({id, type, desc, test(entry){...}})",
        "NetworkMapper.setIndicators([/secret/i, 'my_api_key']); NetworkMapper.correlateIndicators()",
        "exportNetworkLogs() - legacy alias to export logs",
      ];
      console.log(
        "%c[NetworkMapper Commands]\n" + cmds.join("\n"),
        "color: #0bf"
      );
      return this;
    },
  };

  // ===========================================
  // ENHANCEMENTS: Security Scanning Features
  // ===========================================

  // ENHANCEMENT 1: Traffic risk scoring
  API.scoreTraffic = function scoreTraffic() {
    try {
      var scored = [];
      var risky = state.log.filter(function(e) {
        return e.risk === "high" || e.risk === "critical" || (e.status >= 400);
      });
      risky.forEach(function(entry) {
        var score = 0;
        if (entry.risk === "critical") score += 15;
        else if (entry.risk === "high") score += 10;
        if (entry.status >= 500) score += 5;
        if (entry.status === 401 || entry.status === 403) score += 3;
        var url = entry.url || "";
        if (url.indexOf("token") !== -1 || url.indexOf("auth") !== -1) score += 5;
        if (url.indexOf(".env") !== -1 || url.indexOf("config") !== -1) score += 3;
        scored.push({ url: url.substring(0, 80), status: entry.status, risk: entry.risk || "low", score: score, method: entry.method || "GET" });
      });
      scored.sort(function(a, b) { return b.score - a.score; });
      console.log("%c📊 Risk-scored traffic: " + scored.length + " entries", scored.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #7f8c8d");
      _safeTable(scored.slice(0, 30), 30);
      return scored;
    } catch(e) { console.warn("scoreTraffic error:", e); return []; }
  };

  // ENHANCEMENT 2: CORS analysis
  API.analyzeCORS = function analyzeCORS() {
    try {
      var corsIssues = [];
      state.log.forEach(function(entry) {
        try {
          var headers = entry.responseHeaders || {};
          var acao = headers["access-control-allow-origin"];
          var acac = headers["access-control-allow-credentials"];
          if (acao === "*") {
            corsIssues.push({ url: (entry.url || "").substring(0, 80), issue: "Wildcard ACAO", risk: acac === "true" ? "CRITICAL" : "MEDIUM", details: "Allow-Origin: * with credentials" });
          }
          if (acao && acao !== "*" && acao !== location.origin) {
            corsIssues.push({ url: (entry.url || "").substring(0, 80), issue: "Cross-origin ACAO", risk: "MEDIUM", details: "Origin: " + acao });
          }
          if (headers["access-control-allow-methods"]) {
            var methods = headers["access-control-allow-methods"];
            if (methods.indexOf("PUT") !== -1 || methods.indexOf("DELETE") !== -1) {
              corsIssues.push({ url: (entry.url || "").substring(0, 80), issue: "Dangerous CORS methods", risk: "LOW", details: methods });
            }
          }
        } catch(e) {}
      });
      console.log("%c🌐 CORS issues: " + corsIssues.length, corsIssues.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(corsIssues, 20);
      return corsIssues;
    } catch(e) { console.warn("analyzeCORS error:", e); return []; }
  };

  // ENHANCEMENT 3: Cookie security analysis
  API.analyzeCookies = function analyzeCookies() {
    try {
      var issues = [];
      state.log.forEach(function(entry) {
        try {
          var setCookie = entry.responseHeaders || {};
          var cookie = setCookie["set-cookie"] || "";
          if (!cookie) return;
          var flags = cookie.toLowerCase();
          var missing = [];
          if (flags.indexOf("secure") === -1) missing.push("Secure");
          if (flags.indexOf("httponly") === -1) missing.push("HttpOnly");
          if (flags.indexOf("samesite") === -1) missing.push("SameSite");
          if (missing.length > 0) {
            issues.push({ url: (entry.url || "").substring(0, 60), missing: missing.join(", "), risk: missing.length > 2 ? "HIGH" : "MEDIUM", cookie: cookie.substring(0, 60) });
          }
        } catch(e) {}
      });
      console.log("%c🍪 Cookie issues: " + issues.length, issues.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(issues, 20);
      return issues;
    } catch(e) { console.warn("analyzeCookies error:", e); return []; }
  };

  // ENHANCEMENT 4: HSTS and security header check
  API.checkSecurityHeaders = function checkSecurityHeaders() {
    try {
      var headers = ["strict-transport-security", "x-content-type-options", "x-frame-options", "x-xss-protection", "content-security-policy", "referrer-policy", "permissions-policy"];
      var results = [];
      state.log.forEach(function(entry) {
        try {
          var found = {};
          var resp = entry.responseHeaders || {};
          headers.forEach(function(h) {
            found[h] = resp[h] ? "PRESENT" : "MISSING";
          });
          var missing = headers.filter(function(h) { return !resp[h]; });
          if (missing.length > 0) {
            results.push({ url: (entry.url || "").substring(0, 60), missing: missing.join(", "), count: missing.length });
          }
        } catch(e) {}
      });
      console.log("%c🛡 Security headers: " + results.length + " endpoints with missing headers", results.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(results, 20);
      return results;
    } catch(e) { console.warn("checkSecurityHeaders error:", e); return []; }
  };

  // ENHANCEMENT 5: Sensitive data exposure detector
  API.detectDataExposure = function detectDataExposure() {
    try {
      var exposure = [];
      var patterns = [
        { name: "Email", rx: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
        { name: "Phone", rx: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
        { name: "SSN", rx: /\b\d{3}-\d{2}-\d{4}\b/g },
        { name: "Credit Card", rx: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
        { name: "API Key in Body", rx: /["']?(?:api[_-]?key|apikey|api_token)["']?\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}/gi }
      ];
      state.log.forEach(function(entry) {
        try {
          var body = entry.responseBody || "";
          if (typeof body !== "string") return;
          patterns.forEach(function(p) {
            var matches = body.match(p.rx) || [];
            if (matches.length > 0) {
              exposure.push({ url: (entry.url || "").substring(0, 60), type: p.name, count: matches.length, preview: matches[0].substring(0, 30) });
            }
          });
        } catch(e) {}
      });
      console.log("%c🔓 Data exposure: " + exposure.length + " findings", exposure.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(exposure, 20);
      return exposure;
    } catch(e) { console.warn("detectDataExposure error:", e); return []; }
  };

  // ENHANCEMENT 6: API endpoint mapper
  API.mapEndpoints = function mapEndpoints() {
    try {
      var endpoints = {};
      state.log.forEach(function(entry) {
        try {
          var url = entry.url || "";
          var path = url.replace(/https?:\/\/[^\/]+/, "").split("?")[0];
          var method = entry.method || "GET";
          var key = method + " " + path;
          if (!endpoints[key]) {
            endpoints[key] = { method: method, path: path, count: 0, statuses: [], avgResponseTime: 0 };
          }
          endpoints[key].count++;
          endpoints[key].statuses.push(entry.status || 0);
        } catch(e) {}
      });
      var result = Object.keys(endpoints).map(function(k) { return endpoints[k]; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c🗺 API endpoints: " + result.length + " unique", "color: #3498db; font-weight: bold");
      _safeTable(result.slice(0, 30), 30);
      return result;
    } catch(e) { console.warn("mapEndpoints error:", e); return []; }
  };

  // ENHANCEMENT 7: Response time analyzer
  API.analyzePerformance = function analyzePerformance() {
    try {
      var slow = [];
      state.log.forEach(function(entry) {
        try {
          var time = entry.duration || entry.responseTime || 0;
          if (time > 3000) {
            slow.push({ url: (entry.url || "").substring(0, 80), time: time + "ms", status: entry.status, method: entry.method || "GET", risk: time > 10000 ? "HIGH" : "MEDIUM" });
          }
        } catch(e) {}
      });
      slow.sort(function(a, b) { return parseInt(b.time) - parseInt(a.time); });
      console.log("%c⏱ Slow requests: " + slow.length, slow.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(slow.slice(0, 20), 20);
      return slow;
    } catch(e) { console.warn("analyzePerformance error:", e); return []; }
  };

  // ENHANCEMENT 8: Technology fingerprint from traffic
  API.fingerprintTech = function fingerprintTech() {
    try {
      var techs = {};
      state.log.forEach(function(entry) {
        try {
          var headers = entry.responseHeaders || {};
          var server = headers["server"] || "";
          var powered = headers["x-powered-by"] || "";
          var via = headers["via"] || "";
          if (server) techs["Server: " + server] = (techs["Server: " + server] || 0) + 1;
          if (powered) techs["Powered-By: " + powered] = (techs["Powered-By: " + powered] || 0) + 1;
          if (via) techs["Via: " + via] = (techs["Via: " + via] || 0) + 1;
        } catch(e) {}
      });
      var result = Object.keys(techs).map(function(k) { return { technology: k, count: techs[k] }; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c🛠 Technology: " + result.length + " detected", "color: #e67e22; font-weight: bold");
      _safeTable(result, 20);
      return result;
    } catch(e) { console.warn("fingerprintTech error:", e); return []; }
  };

  // ENHANCEMENT 9: Compliance report (OWASP mapping)
  API.complianceReport = function complianceReport() {
    try {
      var report = [];
      var log = state.log;
      var highRisk = log.filter(function(e) { return e.risk === "high" || e.risk === "critical"; });
      if (highRisk.length > 0) report.push({ owasp: "A03:2021 - Injection", findings: highRisk.length, action: "Review high-risk requests for injection vectors" });
      var cors = log.filter(function(e) { var h = e.responseHeaders || {}; return h["access-control-allow-origin"] === "*"; });
      if (cors.length > 0) report.push({ owasp: "A05:2021 - Security Misconfiguration", findings: cors.length, action: "Fix wildcard CORS policies" });
      var noHSTS = log.filter(function(e) { var h = e.responseHeaders || {}; return !h["strict-transport-security"] && (e.url || "").indexOf("https") === 0; });
      if (noHSTS.length > 0) report.push({ owasp: "A02:2021 - Cryptographic Failures", findings: noHSTS.length, action: "Enable HSTS on all HTTPS endpoints" });
      var errors = log.filter(function(e) { return e.status >= 500; });
      if (errors.length > 0) report.push({ owasp: "A09:2021 - Security Logging and Monitoring Failures", findings: errors.length, action: "Investigate server errors for potential attacks" });
      console.log("%c📋 Compliance: " + report.length + " categories", "color: #3498db; font-weight: bold");
      _safeTable(report, 20);
      return report;
    } catch(e) { console.warn("complianceReport error:", e); return []; }
  };

  // ENHANCEMENT 10: Traffic diff (compare two time windows)
  API.trafficDiff = function trafficDiff(minutesAgo) {
    try {
      var now = Date.now();
      var windowMs = (minutesAgo || 5) * 60 * 1000;
      var recent = state.log.filter(function(e) { return (now - (e.timestamp || 0)) < windowMs; });
      var older = state.log.filter(function(e) { return (now - (e.timestamp || 0)) >= windowMs && (now - (e.timestamp || 0)) < windowMs * 2; });
      var result = {
        recentCount: recent.length,
        olderCount: older.length,
        change: recent.length - older.length,
        recentErrors: recent.filter(function(e) { return e.status >= 400; }).length,
        olderErrors: older.filter(function(e) { return e.status >= 400; }).length,
        recentAvgTime: recent.length > 0 ? Math.round(recent.reduce(function(s, e) { return s + (e.duration || 0); }, 0) / recent.length) : 0,
        olderAvgTime: older.length > 0 ? Math.round(older.reduce(function(s, e) { return s + (e.duration || 0); }, 0) / older.length) : 0
      };
      console.log("%c📸 Traffic diff (" + (minutesAgo || 5) + "min windows): " + result.change + " change", "color: #3498db; font-weight: bold");
      _safeTable([result], 1);
      return result;
    } catch(e) { console.warn("trafficDiff error:", e); return {}; }
  };

  // ===========================================
  // ENHANCEMENTS #11-20: Advanced Security Features
  // ===========================================

  // ENHANCEMENT 11: JWT token analyzer
  API.analyzeJWTs = function analyzeJWTs() {
    try {
      var jwts = [];
      state.log.forEach(function(entry) {
        try {
          var headers = entry.responseHeaders || {};
          var auth = headers["authorization"] || "";
          var bearer = auth.replace(/^Bearer\s+/i, "");
          if (bearer.split(".").length === 3) {
            try {
              var parts = bearer.split(".");
              var header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
              var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
              jwts.push({ url: (entry.url || "").substring(0, 60), algorithm: header.alg || "unknown", issuer: payload.iss || "unknown", subject: payload.sub || "unknown", expiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : "unknown", risk: header.alg === "none" ? "CRITICAL" : header.alg === "HS256" ? "MEDIUM" : "INFO" });
            } catch(e) {}
          }
          var body = entry.responseBody || "";
          var bodyJWTs = (typeof body === "string" ? body : "").match(/\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\b/g) || [];
          bodyJWTs.slice(0, 5).forEach(function(tok) {
            try {
              var p = tok.split(".");
              var hdr = JSON.parse(atob(p[0].replace(/-/g, "+").replace(/_/g, "/")));
              var pay = JSON.parse(atob(p[1].replace(/-/g, "+").replace(/_/g, "/")));
              jwts.push({ url: (entry.url || "").substring(0, 60), algorithm: hdr.alg, issuer: pay.iss || "unknown", expiry: pay.exp ? new Date(pay.exp * 1000).toISOString() : "unknown", risk: hdr.alg === "none" ? "CRITICAL" : "INFO", location: "response_body" });
            } catch(e) {}
          });
        } catch(e) {}
      });
      console.log("%c🔐 JWTs found: " + jwts.length, jwts.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(jwts, 20);
      return jwts;
    } catch(e) { console.warn("analyzeJWTs error:", e); return []; }
  };

  // ENHANCEMENT 12: GraphQL endpoint detection
  API.detectGraphQL = function detectGraphQL() {
    try {
      var gql = [];
      state.log.forEach(function(entry) {
        try {
          var url = entry.url || "";
          var method = entry.method || "GET";
          var body = entry.requestBody || "";
          if (url.indexOf("graphql") !== -1 || url.indexOf("/gql") !== -1) {
            gql.push({ url: url.substring(0, 80), method: method, type: "endpoint_match", risk: "MEDIUM" });
          }
          if (typeof body === "string" && (body.indexOf("query") !== -1 || body.indexOf("mutation") !== -1 || body.indexOf("subscription") !== -1)) {
            var operation = body.match(/(query|mutation|subscription)\s+(\w+)/);
            if (operation) gql.push({ url: url.substring(0, 80), method: method, type: "operation", operation: operation[1], name: operation[2], risk: "LOW" });
          }
        } catch(e) {}
      });
      console.log("%c📊 GraphQL: " + gql.length + " found", gql.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #7f8c8d");
      _safeTable(gql, 20);
      return gql;
    } catch(e) { console.warn("detectGraphQL error:", e); return []; }
  };

  // ENHANCEMENT 13: Subdomain takeover indicators
  API.detectSubdomainTakeover = function detectSubdomainTakeover() {
    try {
      var indicators = [];
      var patterns = [
        { name: "Heroku", rx: /herokuapp\.com/gi, risk: "HIGH" },
        { name: "GitHub Pages", rx: /github\.io/gi, risk: "MEDIUM" },
        { name: "AWS S3", rx: /s3\.amazonaws\.com/gi, risk: "MEDIUM" },
        { name: "Azure", rx: /azurewebsites\.net/gi, risk: "MEDIUM" },
        { name: "Shopify", rx: /myshopify\.com/gi, risk: "LOW" },
        { name: "Fastly", rx: /fastly\.net/gi, risk: "LOW" },
        { name: "Pantheon", rx: /pantheonsite\.io/gi, risk: "LOW" }
      ];
      state.log.forEach(function(entry) {
        try {
          var url = entry.url || "";
          var body = entry.responseBody || "";
          var text = url + " " + (typeof body === "string" ? body : "");
          patterns.forEach(function(p) {
            if (p.rx.test(text)) {
              indicators.push({ url: url.substring(0, 80), service: p.name, risk: p.risk });
              p.rx.lastIndex = 0;
            }
          });
        } catch(e) {}
      });
      console.log("%c🌐 Subdomain takeover indicators: " + indicators.length, indicators.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(indicators, 20);
      return indicators;
    } catch(e) { console.warn("detectSubdomainTakeover error:", e); return []; }
  };

  // ENHANCEMENT 14: Sensitive path scanner
  API.scanSensitivePaths = function scanSensitivePaths() {
    try {
      var found = [];
      var paths = ["/.env", "/.git/config", "/wp-config.php", "/config.json", "/secrets.json", "/.aws/credentials", "/docker-compose.yml", "/.htaccess", "/server-status", "/.DS_Store", "/debug/vars", "/actuator", "/swagger.json", "/api-docs", "/phpinfo.php", "/.svn/entries", "/backup.zip", "/dump.sql", "/admin", "/phpmyadmin"];
      state.log.forEach(function(entry) {
        try {
          var url = entry.url || "";
          paths.forEach(function(p) {
            if (url.indexOf(p) !== -1) {
              found.push({ url: url.substring(0, 80), path: p, status: entry.status, risk: entry.status < 400 ? "HIGH" : "MEDIUM" });
            }
          });
        } catch(e) {}
      });
      console.log("%c📁 Sensitive paths: " + found.length, found.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(found, 20);
      return found;
    } catch(e) { console.warn("scanSensitivePaths error:", e); return []; }
  };

  // ENHANCEMENT 15: Request/response size anomaly detector
  API.detectSizeAnomalies = function detectSizeAnomalies() {
    try {
      var anomalies = [];
      var sizes = state.log.map(function(e) { return { url: e.url || "", reqSize: (e.requestBody || "").length, resSize: (e.responseBody || "").length }; });
      if (sizes.length < 5) return anomalies;
      var avgRes = sizes.reduce(function(s, e) { return s + e.resSize; }, 0) / sizes.length;
      var stdDev = Math.sqrt(sizes.reduce(function(s, e) { return s + Math.pow(e.resSize - avgRes, 2); }, 0) / sizes.length);
      sizes.forEach(function(s) {
        if (s.resSize > avgRes + 3 * stdDev && s.resSize > 10000) {
          anomalies.push({ url: s.url.substring(0, 80), size: s.resSize, avg: Math.round(avgRes), deviation: Math.round((s.resSize - avgRes) / stdDev) + "x", risk: "MEDIUM" });
        }
      });
      console.log("%c📏 Size anomalies: " + anomalies.length, anomalies.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(anomalies, 20);
      return anomalies;
    } catch(e) { console.warn("detectSizeAnomalies error:", e); return []; }
  };

  // ENHANCEMENT 16: HTTP method distribution
  API.analyzeMethods = function analyzeMethods() {
    try {
      var methods = {};
      state.log.forEach(function(entry) {
        try {
          var m = (entry.method || "GET").toUpperCase();
          methods[m] = (methods[m] || 0) + 1;
        } catch(e) {}
      });
      var result = Object.keys(methods).map(function(k) { return { method: k, count: methods[k], percentage: Math.round(methods[k] / state.log.length * 100) + "%" }; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c📡 HTTP methods:", "color: #3498db; font-weight: bold");
      _safeTable(result, 20);
      return result;
    } catch(e) { console.warn("analyzeMethods error:", e); return []; }
  };

  // ENHANCEMENT 17: Status code distribution
  API.analyzeStatusCodes = function analyzeStatusCodes() {
    try {
      var codes = {};
      state.log.forEach(function(entry) {
        try {
          var s = entry.status || 0;
          var bucket = Math.floor(s / 100) + "xx";
          codes[bucket] = (codes[bucket] || 0) + 1;
          codes[s] = (codes[s] || 0) + 1;
        } catch(e) {}
      });
      var result = Object.keys(codes).map(function(k) { return { code: k, count: codes[k] }; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c📊 Status codes:", "color: #3498db; font-weight: bold");
      _safeTable(result.slice(0, 20), 20);
      return result;
    } catch(e) { console.warn("analyzeStatusCodes error:", e); return []; }
  };

  // ENHANCEMENT 18: Third-party request detector
  API.detectThirdParty = function detectThirdParty() {
    try {
      var thirdParty = {};
      var ownOrigin = location.origin;
      state.log.forEach(function(entry) {
        try {
          var url = entry.url || "";
          if (url.indexOf(ownOrigin) === -1 && url.indexOf("http") === 0) {
            var host = url.replace(/https?:\/\/([^\/]+).*/, "$1");
            if (!thirdParty[host]) thirdParty[host] = { host: host, count: 0, urls: [] };
            thirdParty[host].count++;
            if (thirdParty[host].urls.length < 3) thirdParty[host].urls.push(url.substring(0, 60));
          }
        } catch(e) {}
      });
      var result = Object.keys(thirdParty).map(function(k) { return thirdParty[k]; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c🌐 Third-party domains: " + result.length, "color: #e67e22; font-weight: bold");
      _safeTable(result, 20);
      return result;
    } catch(e) { console.warn("detectThirdParty error:", e); return []; }
  };

  // ENHANCEMENT 19: Authentication flow tracker
  API.trackAuthFlows = function trackAuthFlows() {
    try {
      var authFlows = [];
      state.log.forEach(function(entry) {
        try {
          var url = (entry.url || "").toLowerCase();
          var method = (entry.method || "GET").toUpperCase();
          var status = entry.status || 0;
          if (url.indexOf("login") !== -1 || url.indexOf("signin") !== -1 || url.indexOf("auth") !== -1 || url.indexOf("oauth") !== -1 || url.indexOf("saml") !== -1 || url.indexOf("callback") !== -1) {
            authFlows.push({ url: (entry.url || "").substring(0, 80), method: method, status: status, type: url.indexOf("login") !== -1 ? "login" : url.indexOf("oauth") !== -1 ? "oauth" : url.indexOf("callback") !== -1 ? "callback" : "auth", risk: status === 200 ? "INFO" : status === 302 ? "REDIRECT" : status >= 400 ? "FAILURE" : "INFO" });
          }
          var headers = entry.responseHeaders || {};
          var setCookie = headers["set-cookie"] || "";
          if (setCookie && (setCookie.indexOf("session") !== -1 || setCookie.indexOf("token") !== -1 || setCookie.indexOf("jwt") !== -1)) {
            authFlows.push({ url: (entry.url || "").substring(0, 80), method: method, status: status, type: "session_set", risk: "INFO" });
          }
        } catch(e) {}
      });
      console.log("%c🔑 Auth flows: " + authFlows.length, authFlows.length > 0 ? "color: #3498db; font-weight: bold" : "color: #7f8c8d");
      _safeTable(authFlows, 30);
      return authFlows;
    } catch(e) { console.warn("trackAuthFlows error:", e); return []; }
  };

  // ENHANCEMENT 20: Traffic summary dashboard
  API.trafficDashboard = function trafficDashboard() {
    try {
      var log = state.log;
      var total = log.length;
      var errors = log.filter(function(e) { return (e.status || 0) >= 400; }).length;
      var uniqueDomains = {};
      log.forEach(function(e) { try { var h = (e.url || "").replace(/https?:\/\/([^\/]+).*/, "$1"); uniqueDomains[h] = 1; } catch(ex) {} });
      var uniqueMethods = {};
      log.forEach(function(e) { try { uniqueMethods[(e.method || "GET").toUpperCase()] = 1; } catch(ex) {} });
      var dash = {
        totalRequests: total,
        errorRate: total > 0 ? Math.round(errors / total * 100) + "%" : "0%",
        uniqueDomains: Object.keys(uniqueDomains).length,
        uniqueMethods: Object.keys(uniqueMethods).join(", "),
        avgResponseSize: total > 0 ? Math.round(log.reduce(function(s, e) { return s + (e.responseBody || "").length; }, 0) / total) : 0,
        hasAuth: log.some(function(e) { return (e.url || "").indexOf("auth") !== -1 || (e.url || "").indexOf("login") !== -1; }) ? "YES" : "NO",
        hasGraphQL: log.some(function(e) { return (e.url || "").indexOf("graphql") !== -1; }) ? "YES" : "NO",
        hasCORS: log.some(function(e) { return (e.responseHeaders || {})["access-control-allow-origin"]; }) ? "YES" : "NO"
      };
      console.log("%c📊 TRAFFIC DASHBOARD", "color: #e74c3c; font-weight: bold; font-size: 14px");
      _safeTable([dash], 1);
      return dash;
    } catch(e) { console.warn("trafficDashboard error:", e); return {}; }
  };

  // ===========================================
  // ENHANCEMENTS #21-26: Advanced Traffic & Export Features
  // ===========================================

  // CAPABILITY: Traffic Replay — resend captured requests
  API.replayRequest = API.replayRequest || function replayRequest(index, opts) {
    try {
      var entry = state.log[index] || logs[index];
      if (!entry) { console.warn("No entry at index " + index); return null; }
      var url = entry.url || "";
      var method = (entry.method || "GET").toUpperCase();
      var headers = entry.requestHeaders || {};
      var body = entry.requestBody || null;
      var options = opts || {};
      var fetchOpts = { method: method, headers: Object.assign({}, headers), credentials: "include" };
      if (method !== "GET" && method !== "HEAD") fetchOpts.body = options.body || body;
      if (options.headers) Object.assign(fetchOpts.headers, options.headers);
      console.log("%c🔄 Replaying: " + method + " " + url.substring(0, 80), "color: #3498db; font-weight: bold");
      return fetch(url, fetchOpts).then(function(resp) {
        console.log("%c   Response: " + resp.status + " " + resp.statusText, resp.ok ? "color: #27ae60" : "color: #e74c3c");
        return resp;
      }).catch(function(e) {
        console.warn("Replay failed:", e);
        return null;
      });
    } catch(e) { console.warn("replayRequest error:", e); return Promise.resolve(null); }
  };

  // CAPABILITY: Request Comparison — diff two captured requests
  API.compareRequests = API.compareRequests || function compareRequests(idx1, idx2) {
    try {
      var e1 = state.log[idx1] || logs[idx1];
      var e2 = state.log[idx2] || logs[idx2];
      if (!e1 || !e2) { console.warn("Invalid indices"); return null; }
      var diffs = [];
      if (e1.url !== e2.url) diffs.push({ field: "url", left: e1.url, right: e2.url });
      if ((e1.method || "GET") !== (e2.method || "GET")) diffs.push({ field: "method", left: e1.method, right: e2.method });
      if (e1.status !== e2.status) diffs.push({ field: "status", left: e1.status, right: e2.status });
      var h1 = JSON.stringify(e1.requestHeaders || {});
      var h2 = JSON.stringify(e2.requestHeaders || {});
      if (h1 !== h2) diffs.push({ field: "requestHeaders", left: h1.substring(0, 200), right: h2.substring(0, 200) });
      var b1 = (e1.requestBody || "").substring(0, 500);
      var b2 = (e2.requestBody || "").substring(0, 500);
      if (b1 !== b2) diffs.push({ field: "requestBody", left: b1, right: b2 });
      var r1 = (e1.responseBody || "").substring(0, 500);
      var r2 = (e2.responseBody || "").substring(0, 500);
      if (r1 !== r2) diffs.push({ field: "responseBody", left: r1.substring(0, 100), right: r2.substring(0, 100) });
      console.log("%c🔍 Request diff: " + diffs.length + " differences", diffs.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      if (diffs.length > 0) _safeTable(diffs, 20);
      return diffs;
    } catch(e) { console.warn("compareRequests error:", e); return []; }
  };

  // CAPABILITY: WebSocket Message Analysis
  API.analyzeWebSocketMessages = API.analyzeWebSocketMessages || function analyzeWebSocketMessages() {
    try {
      var wsEntries = state.log.filter(function(e) { return e.type === "ws" || e.type === "websocket-send" || e.type === "websocket-receive" || e.type === "websocket-open" || e.type === "websocket-error" || e.type === "websocket-close" || e.url.indexOf("ws") === 0 || e.url.indexOf("wss") === 0; });
      var messages = [];
      wsEntries.forEach(function(entry) {
        try {
          var meta = entry.data || entry.dataSnippet || entry.requestBody || entry.responseBody || "";
          if (typeof meta === "string" && meta.length > 0) {
            messages.push({ url: (entry.url || "").substring(0, 80), direction: entry.type === "websocket-send" ? "out" : entry.type === "websocket-receive" ? "in" : entry.type, preview: meta.substring(0, 100), size: meta.length });
          } else if (entry.type === "websocket-open" || entry.type === "websocket-close") {
            messages.push({ url: (entry.url || "").substring(0, 80), direction: entry.type === "websocket-open" ? "open" : "close", preview: entry.code ? "code=" + entry.code : "", size: 0 });
          }
        } catch(e) {}
      });
      console.log("%c🔌 WebSocket messages: " + messages.length, messages.length > 0 ? "color: #3498db; font-weight: bold" : "color: #7f8c8d");
      _safeTable(messages.slice(0, 30), 30);
      return messages;
    } catch(e) { console.warn("analyzeWebSocketMessages error:", e); return []; }
  };

  // CAPABILITY: Collaborative Export — HTML report for sharing
  API.exportHTMLReport = API.exportHTMLReport || function exportHTMLReport() {
    try {
      var log = state.log || logs;
      var findings = state.findings || [];
      var html = '<!DOCTYPE html><html><head><title>Security Report</title><style>body{font-family:monospace;margin:20px;background:#1a1a1a;color:#e0e0e0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#333}tr:nth-child(even){background:#222}.high{color:#e74c3c}.medium{color:#e67e22}.low{color:#27ae60}h1{color:#3498db}h2{color:#e67e22}</style></head><body>';
      html += '<h1>Security Assessment Report</h1>';
      html += '<p>Generated: ' + new Date().toISOString() + '</p>';
      html += '<p>Total requests: ' + log.length + '</p>';
      html += '<h2>Traffic Summary</h2><table><tr><th>Metric</th><th>Value</th></tr>';
      html += '<tr><td>Total Requests</td><td>' + log.length + '</td></tr>';
      var errors = log.filter(function(e) { return (e.status || 0) >= 400; }).length;
      html += '<tr><td>Error Rate</td><td>' + (log.length > 0 ? Math.round(errors / log.length * 100) : 0) + '%</td></tr>';
      html += '</table>';
      if (findings.length > 0) {
        html += '<h2>Security Findings (' + findings.length + ')</h2><table><tr><th>Severity</th><th>Type</th><th>Message</th><th>URL</th></tr>';
        findings.forEach(function(f) {
          var cls = (f.severity === "P1" || f.severity === "critical") ? "high" : (f.severity === "P2" || f.severity === "high") ? "medium" : "low";
          html += '<tr class="' + cls + '"><td>' + (f.severity || "INFO") + '</td><td>' + (f.type || "") + '</td><td>' + (f.message || "").substring(0, 100) + '</td><td>' + (f.url || "").substring(0, 60) + '</td></tr>';
        });
        html += '</table>';
      }
      html += '</body></html>';
      var blob = new Blob([html], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "security-report-" + Date.now() + ".html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("%c📋 HTML report exported", "color: #27ae60; font-weight: bold");
    } catch(e) { console.warn("exportHTMLReport error:", e); }
  };

  // CAPABILITY: CI/CD Programmatic API
  API.scan = API.scan || function scan(url, opts) {
    return new Promise(function(resolve) {
      try {
        var options = opts || {};
        var timeout = options.timeout || 10000;
        var results = { url: url, timestamp: new Date().toISOString(), requests: [], findings: [], errors: [] };
        fetch(url, { method: options.method || "GET", headers: options.headers || {}, credentials: "include" })
          .then(function(resp) {
            results.status = resp.status;
            results.statusText = resp.statusText;
            var headers = {};
            resp.headers.forEach(function(v, k) { headers[k] = v; });
            results.responseHeaders = headers;
            return resp.text();
          })
          .then(function(body) {
            results.responseBody = body.substring(0, options.maxBodySize || 10000);
            results.timestamp_end = new Date().toISOString();
            console.log("%c🤖 CI/CD scan complete: " + url, "color: #27ae60; font-weight: bold");
            resolve(results);
          })
          .catch(function(e) {
            results.errors.push(String(e));
            results.timestamp_end = new Date().toISOString();
            console.warn("CI/CD scan error:", e);
            resolve(results);
          });
      } catch(e) { resolve({ error: String(e) }); }
    });
  };

  API.getReport = API.getReport || function getReport() {
    try {
      var log = state.log || logs;
      return {
        version: VERSION || "2.0",
        timestamp: new Date().toISOString(),
        totalRequests: log.length,
        errors: log.filter(function(e) { return (e.status || 0) >= 400; }).length,
        findings: (state.findings || []).length,
        entries: log.slice(0, 100).map(function(e) { return { url: e.url, method: e.method, status: e.status, duration: e.duration }; })
      };
    } catch(e) { return { error: String(e) }; }
  };

  // Expose API
  window.NetworkMapper = API;

  // Backward-compat export
  window.exportNetworkLogs = function () {
    try {
      const json = API.exportLogs();
      console.log("%c[Exported JSON] Copy below:\n", "color: yellow;");
      console.log(json);
      return json;
    } catch (e) {
      console.error("[NetworkMapper] exportNetworkLogs failed", e);
      return "[]";
    }
  };



  // Auto-start for snippet ergonomics
  API.start();

  // ---- Overlay implementation ----
  function createOrShowOverlay() {
    if (!state.overlay.el) {
      const el = document.createElement("div");
      el.id = "nm-overlay";
      Object.assign(el.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 2147483647,
        width: "380px",
        maxHeight: "70vh",
        overflow: "auto",
        background: "rgba(10,10,10,0.9)",
        color: "#eee",
        font: "12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial",
        border: "1px solid #333",
        borderRadius: "6px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
      });
      el.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-bottom:1px solid #333;">
          <strong>NetworkMapper Findings</strong>
          <div>
            <select id="nm-filter-sev" title="Severity">
              <option value="">All severities</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
            <input id="nm-filter-type" placeholder="type filter" style="width:110px;" />
            <button id="nm-overlay-close" title="Close">✕</button>
          </div>
        </div>
        <div id="nm-overlay-body" style="padding:8px;"></div>
      `;
      document.body.appendChild(el);
      state.overlay.el = el;
      el.querySelector("#nm-overlay-close").onclick = () =>
        API.toggleOverlay(false);
      el.querySelector("#nm-filter-sev").onchange = (e) => {
        state.overlay.filterSeverity = e.target.value || null;
        renderOverlay();
      };
      el.querySelector("#nm-filter-type").oninput = (e) => {
        const v = (e.target.value || "").trim();
        state.overlay.filterType = v || null;
        renderOverlay();
      };
    }
    state.overlay.visible = true;
    state.overlay.el.style.display = "block";
    renderOverlay();
  }
  function hideOverlay() {
    if (state.overlay.el) state.overlay.el.style.display = "none";
    state.overlay.visible = false;
  }
  function renderOverlay() {
    if (!state.overlay.visible || !state.overlay.el) return;
    const body = state.overlay.el.querySelector("#nm-overlay-body");
    const order = state.options.analysis.severityOrder;
    const filtered = state.findings
      .filter((f) => {
        if (
          state.overlay.filterSeverity &&
          f.severity !== state.overlay.filterSeverity
        )
          return false;
        if (
          state.overlay.filterType &&
          !String(f.type)
            .toLowerCase()
            .includes(state.overlay.filterType.toLowerCase())
        )
          return false;
        return true;
      })
      .slice()
      .sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
    body.innerHTML =
      filtered
        .map(
          (f) => `
      <div style="border:1px solid #444; padding:6px; margin:6px 0; border-radius:4px;">
        <div><strong style="color:${
          (severities[f.severity] || severities.P4).color
        }">${f.severity}</strong> · ${escapeHtml(f.type)} · <em>${escapeHtml(
            f.ruleId
          )}</em></div>
        <div>${escapeHtml(f.message)}</div>
        <div style="color:#aaa; font-size:11px; word-break:break-all;">${escapeHtml(
          f.url || ""
        )}</div>
      </div>
    `
        )
        .join("") || '<div style="color:#aaa">No findings.</div>';
  }
  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }

  // CLEANUP: Restore all patched functions and clean up
  API.CLEANUP = API.CLEANUP || function CLEANUP() {
    try {
      if (window.__origFetch) { window.fetch = window.__origFetch; delete window.__origFetch; }
      if (window.__origXHROpen) { XMLHttpRequest.prototype.open = window.__origXHROpen; delete window.__origXHROpen; }
      if (window.__origXHRSend) { XMLHttpRequest.prototype.send = window.__origXHRSend; delete window.__origXHRSend; }
      if (window.__origWS) { window.WebSocket = window.__origWS; delete window.__origWS; }
      delete window.__PATCHED_FETCH;
      delete window.__PATCHED_XHR;
      console.log("%c🧹 All patches restored.", "color: #27ae60; font-weight: bold");
    } catch(e) { console.warn("Cleanup error:", e); }
  };

  // HELP: List all available functions
  API.HELP = API.HELP || function HELP() {
    var name = "NetworkMapper";
    console.log("%c╔══════════════════════════════════════════╗", "color: #3498db");
    console.log("%c║    " + name + " — HELP                     ║", "color: #3498db; font-weight: bold");
    console.log("%c╚══════════════════════════════════════════╝", "color: #3498db");
    console.log("%cCore:", "color: #e67e22; font-weight: bold");
    console.log("  " + name + ".start()             — Start capture");
    console.log("  " + name + ".stop()              — Stop capture");
    console.log("  " + name + ".CLEANUP()           — Restore all patched functions");
    console.log("  " + name + ".HELP()              — Show this help");
    console.log("%cAnalysis:", "color: #e67e22; font-weight: bold");
    console.log("  " + name + ".scoreTraffic()      — Risk scoring");
    console.log("  " + name + ".analyzeCORS()       — CORS analysis");
    console.log("  " + name + ".analyzeCookies()    — Cookie security");
    console.log("  " + name + ".checkSecurityHeaders() — Header check");
    console.log("  " + name + ".detectDataExposure() — PII detection");
    console.log("  " + name + ".analyzeJWTs()       — JWT analysis");
    console.log("  " + name + ".detectGraphQL()     — GraphQL detection");
    console.log("  " + name + ".scanSensitivePaths() — Sensitive paths");
    console.log("  " + name + ".replayRequest(i)   — Replay request #i");
    console.log("  " + name + ".compareRequests(a,b) — Diff requests a & b");
    console.log("  " + name + ".exportHTMLReport()  — Export HTML report");
    console.log("  " + name + ".trafficDashboard()  — Summary dashboard");
    console.log("%cTip: Type " + name + ".CLEANUP() to restore browser.", "color: #7f8c8d");
  };
})();
