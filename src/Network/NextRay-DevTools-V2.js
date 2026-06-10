/*
 * NetworkProbe — DevTools Network X-Ray for Pro Hunters
 * Evolved from NetXRay with the GOLD MINE CHECKLIST automation.
 *
 * Paste into DevTools Console. Captures fetch/XHR/beacon/WS +
 * stack, initiator, timings, sizes, and runs real‑time heuristics
 * to auto‑tag each entry with high‑value findings.
 *
 * API (unchanged + new):
 *   NetworkProbe.start() / NetworkProbe.stop() / NetworkProbe.clear()
 *   NetworkProbe.table()                 // table with tags
 *   NetworkProbe.find(/regex|TAG/)       // filter by URL or by #Tag
 *   NetworkProbe.curl(i)                 // cURL command for log i
 *   NetworkProbe.exportJSON()/CSV()/HAR()/NDJSON()
 *   NetworkProbe.analyze(i)              // rerun checklist on entry i
 *   NetworkProbe.tags(i)                 // get tags for entry i
 *   NetworkProbe.overlay(true|false)     // minimal HUD toggle
 *   NetworkProbe.config                  // tweak knobs
 *
 * GOLD MINE CHECKLIST (auto‑tagged):
 *   #Framework, #ThirdParty, #State, #Auth, #Input, #Error,
 *   #Transform, #Events, #Async, #Memory
 */
(function () {
  if (window.NetworkProbe) {
    console.warn(
      "NetworkProbe already loaded. Use NetworkProbe.stop() then re-run if needed."
    );
    return;
  }

  const CONFIG = {
    ENABLE_RESPONSE_PREVIEW: false, // set true to capture small text previews
    MAX_PREVIEW: 2048, // chars
    MAX_BODY_CAPTURE: 10000, // chars
    LOG_WEBSOCKET_MESSAGES: false, // noisy
    AUTO_START: true,
    HUD: true, // minimal overlay
    ASYNC_WINDOW_MS: 900, // duplicate/race detection window
    LARGE_RESP_KB: 512, // memory concern threshold
  };

  const _orig = {
    fetch: window.fetch,
    XHR: window.XMLHttpRequest,
    sendBeacon: navigator.sendBeacon,
    WebSocket: window.WebSocket,
  };

  const MAX_LOGS = 5000;
  const logs = [];
  const recent = []; // for async/race pattern checks
  let running = false;

  // ------- utils -------
  const now = () => performance.now();
  const iso = () => new Date().toISOString();
  const short = (s, n) =>
    s && s.length > n ? s.slice(0, n) + `…(+${s.length - n})` : s;
  const stack = () => {
    const e = new Error();
    if (!e.stack) return "<no stack available>";
    return e.stack
      .split(/\n+/)
      .slice(2)
      .filter((l) => !/NetworkProbe/.test(l))
      .join("\n");
  };
  const lower = (s) => (s || "").toLowerCase();
  function has(s, arr) {
    var ls = lower(s);
    return arr.some(function(a) { return ls.includes(lower(a)); });
  }
  const pushUnique = (arr, v) => {
    if (!arr.includes(v)) arr.push(v);
  };

  function parseHeadersFromInit(init) {
    const headers = {};
    if (!init) return headers;
    const h = init.headers;
    if (!h) return headers;
    if (h instanceof Headers) {
      h.forEach((v, k) => (headers[k.toLowerCase()] = String(v)));
    } else if (Array.isArray(h)) {
      for (const [k, v] of h) headers[String(k).toLowerCase()] = String(v);
    } else if (typeof h === "object") {
      for (const k in h) headers[String(k).toLowerCase()] = String(h[k]);
    }
    return headers;
  }

  function bodyToString(body) {
    try {
      if (body == null) return "";
      if (typeof body === "string") return short(body, CONFIG.MAX_BODY_CAPTURE);
      if (body instanceof URLSearchParams)
        return short(body.toString(), CONFIG.MAX_BODY_CAPTURE);
      if (body instanceof FormData) {
        const parts = [];
        for (const [k, v] of body.entries())
          parts.push(`${k}=${typeof v === "string" ? v : "<blob>"}`);
        return short(parts.join("&"), CONFIG.MAX_BODY_CAPTURE);
      }
      if (body instanceof Blob) return `<blob ${body.type} ${body.size}B>`;
      if (body instanceof ArrayBuffer)
        return `<arraybuffer ${body.byteLength}B>`;
      if (typeof body === "object")
        return short(JSON.stringify(body), CONFIG.MAX_BODY_CAPTURE);
    } catch(e) {
      return "";
    }
    return `<unserializable body>`;
  }

  function methodFromInit(init) {
    return init && init.method ? String(init.method).toUpperCase() : "GET";
  }

  function urlInfo(u) {
    try {
      const obj = new URL(u, location.href);
      const qs = {};
      obj.searchParams.forEach((v, k) => (qs[k] = v));
      return {
        origin: obj.origin,
        path: obj.pathname,
        query: qs,
        url: obj.href,
      };
    } catch (_) {
      return { origin: "", path: "", query: {}, url: String(u) };
    }
  }

  function collectCommon(meta) {
    meta.time = iso();
    meta.stack = stack();
    meta.initiator = deriveInitiator(meta.stack);
    meta.tags = [];
    meta.findings = [];
    analyzeEntry(meta); // auto-tag
    logs.push(meta);
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }
    recent.push({
      t: now(),
      url: meta.url,
      method: meta.method,
      status: meta.status,
    });
    cleanupRecent();
    hudBump(meta);
    return meta;
  }

  function deriveInitiator(stk) {
    const line =
      (stk || "")
        .split(/\n/)
        .find((l) => !/\(native\)|NetworkProbe|<anonymous>/.test(l)) || "";
    const m = line.match(
      /\(?([^\s\)]+\.(?:js|tsx?|vue|jsx)[^\)]*):(\d+):(\d+)\)?/
    );
    return m ? `${m[1]}:${m[2]}` : "script";
  }

  // ------- GOLD MINE CHECKLIST (heuristics) -------
  function analyzeEntry(l) {
    const { url, method, headers = {}, reqBody = "" } = l;
    var reqStack = l.stack;
    const info = urlInfo(url);
    const qp = info.query;
    const path = info.path;

    // Framework specific
    if (
      has(reqStack, [
        "react",
        "next",
        "webpack",
        "vite",
        "parcel",
        "angular",
        "zone.js",
        "vue",
        "nuxt",
        "svelte",
      ])
    )
      pushUnique(l.tags, "#Framework");

    // Third-party library risks
    if (
      has(reqStack, [
        "axios",
        "jquery",
        "zepto",
        "superagent",
        "ky",
        "whatwg-fetch",
      ]) ||
      headers["x-requested-with"] === "XMLHttpRequest"
    )
      pushUnique(l.tags, "#ThirdParty");

    // State management
    if (has(reqStack, ["redux", "ngrx", "mobx", "zustand", "pinia", "store"]))
      pushUnique(l.tags, "#State");

    // Auth pipeline
    if (
      has(url, [
        "auth",
        "oauth",
        "sso",
        "saml",
        "oidc",
        "login",
        "logout",
        "token",
        "refresh",
        "session",
      ])
    )
      pushUnique(l.tags, "#Auth");

    // Input validation gaps (redirect/callback/path/template)
    const suspectKeys = [
      "redirect",
      "next",
      "return",
      "returnurl",
      "url",
      "path",
      "file",
      "template",
      "callback",
      "cb",
      "jsonp",
      "dest",
    ];
    for (const k of suspectKeys)
      if (k in qp || has(reqBody, [k + "="])) {
        pushUnique(l.tags, "#Input");
        break;
      }

    // Error handling issues
    if ((Number(l.status) || 0) >= 500) pushUnique(l.tags, "#Error");
    if (qp.debug === "true" || has(url, ["debug=", "trace="]))
      pushUnique(l.tags, "#Error");

    // Data transformation weaknesses (export/report formats)
    if (
      has(url, [
        "export",
        "download",
        "report",
        "csv",
        "xlsx",
        "xls",
        "pdf",
        "xml",
        "txt",
      ])
    )
      pushUnique(l.tags, "#Transform");

    // Event handling / postMessage
    if (has(reqStack, ["addEventListener", "onclick", "onchange", "postMessage"]))
      pushUnique(l.tags, "#Events");

    // Async race conditions
    if (looksLikeRace(url, method)) pushUnique(l.tags, "#Async");

    // Memory leak opportunities
    const kb = Math.round((l.respSize || 0) / 1024);
    if (kb >= CONFIG.LARGE_RESP_KB) pushUnique(l.tags, "#Memory");

    // Deeper sink scans
    if (
      has(reqStack, [
        "innerHTML",
        "outerHTML",
        "insertAdjacentHTML",
        "document.write",
        "eval",
        'Function("',
        'setTimeout("',
        'setInterval("',
      ])
    )
      pushUnique(l.tags, "#Input");

    // Findings (human tips)
    if (l.tags.includes("#Auth"))
      l.findings.push("Review refresh/login flows for bypass & token leakage.");
    if (l.tags.includes("#Input"))
      l.findings.push(
        "Check open redirect/SSRF/XSS via redirect/callback/path/template params."
      );
    if (l.tags.includes("#Transform"))
      l.findings.push(
        "Test CSV/Excel formula injection; force alternative formats (csv/xml/pdf)."
      );
    if (l.tags.includes("#Error"))
      l.findings.push(
        "Probe debug/stack traces by toggling debug flags and malformed input."
      );
    if (l.tags.includes("#Async"))
      l.findings.push(
        "Try double-submit/cancel race; parallel requests mutating same resource."
      );
    if (l.tags.includes("#Memory"))
      l.findings.push(
        "Large responses retained in memory; inspect for secrets & perf leaks."
      );

    return l;
  }

  function looksLikeRace(url, method) {
    const t = now();
    for (let i = recent.length - 1; i >= 0; i--) {
      const r = recent[i];
      if (t - r.t > CONFIG.ASYNC_WINDOW_MS) break;
      if (r.url === url && r.method === method) return true;
    }
    return false;
  }

  function cleanupRecent() {
    const t = now();
    while (recent.length && t - recent[0].t > CONFIG.ASYNC_WINDOW_MS)
      recent.shift();
  }

  // ------- instrumentation -------
  function installFetch() {
    window.fetch = async function (input, init) {
      if (!running) return _orig.fetch.apply(this, arguments);
      const url =
        typeof input === "string"
          ? input
          : (input && input.url) || String(input);
      const method = methodFromInit(init);
      const headers = parseHeadersFromInit(init);
      const reqBody = init && init.body ? bodyToString(init.body) : "";
      const start = now();
      const meta = {
        kind: "fetch",
        method,
        url,
        headers,
        reqBody,
        startTime: Date.now(),
      };
      try {
        const resp = await _orig.fetch.apply(this, arguments);
        const end = now();
        const clone = resp.clone();
        let size = 0,
          preview = "";
        try {
          const buf = await clone.arrayBuffer();
          size = buf.byteLength;
          if (CONFIG.ENABLE_RESPONSE_PREVIEW) {
            const text = new TextDecoder().decode(
              buf.slice(0, CONFIG.MAX_PREVIEW)
            );
            preview = text;
          }
        } catch (e) {}
        Object.assign(meta, {
          status: resp.status,
          statusText: resp.statusText,
          durationMs: +(end - start).toFixed(2),
          respSize: size,
          respPreview: preview,
        });
        collectCommon(meta);
        return resp;
      } catch (err) {
        Object.assign(meta, {
          status: 0,
          statusText: "network-error",
          error: String(err),
          durationMs: +(now() - start).toFixed(2),
        });
        collectCommon(meta);
        throw err;
      }
    };
  }

  function installXHR() {
    function XRHWrapped() {
      const xhr = new _orig.XHR();
      var state = {
        method: "GET",
        url: "",
        headers: {},
        start: 0,
        reqBody: "",
      };
      const open = xhr.open;
      const send = xhr.send;
      const setHeader = xhr.setRequestHeader;

      xhr.open = function (method, url) {
        if (running) {
          state = {
            method: String(method || "GET").toUpperCase(),
            url: String(url),
            headers: {},
            start: 0,
            reqBody: "",
          };
        }
        return open.apply(this, arguments);
      };
      xhr.setRequestHeader = function (k, v) {
        if (running) state.headers[String(k).toLowerCase()] = String(v);
        return setHeader.apply(this, arguments);
      };
      xhr.send = function (body) {
        if (running) {
          state.start = now();
          state.reqBody = bodyToString(body);
          state.meta = {
            kind: "xhr",
            method: state.method,
            url: state.url,
            headers: state.headers,
            reqBody: state.reqBody,
            startTime: Date.now(),
          };
        }
        this.addEventListener("loadend", function () {
          if (!running || !state.meta) return;
          const end = now();
          const size = (() => {
            try {
              if (this.response == null) return 0;
              if (typeof this.response === "string")
                return this.response.length;
              if (this.response instanceof ArrayBuffer)
                return this.response.byteLength;
              if (this.response instanceof Blob) return this.response.size;
        } catch(e) {
          // Response body already consumed or clone failed
        }
            return 0;
          })();
          Object.assign(state.meta, {
            status: this.status,
            statusText: this.statusText,
            durationMs: +(end - state.start).toFixed(2),
            respSize: size,
          });
          collectCommon(state.meta);
        }, { once: true });
        return send.apply(this, arguments);
      };
      return xhr;
    }
    window.XMLHttpRequest = XRHWrapped;
  }

  function installBeacon() {
    navigator.sendBeacon = function (url, data) {
      if (!running) return _orig.sendBeacon.apply(this, arguments);
      const meta = {
        kind: "beacon",
        method: "BEACON",
        url: String(url),
        headers: {},
        reqBody: bodyToString(data),
      };
      try {
        const ok = _orig.sendBeacon.apply(this, arguments);
        Object.assign(meta, {
          status: ok ? 200 : 0,
          statusText: ok ? "sent" : "failed",
        });
        collectCommon(meta);
        return ok;
      } catch (e) {
        Object.assign(meta, {
          status: 0,
          statusText: "beacon-error",
          error: String(e),
        });
        collectCommon(meta);
        throw e;
      }
    };
  }

  function installWebSocket() {
    function WSWrapped(url, protocols) {
      try {
        var ws = new _orig.WebSocket(url, protocols);
        var meta = collectCommon({
          kind: "ws",
          method: "WS",
          url: String(url),
          headers: {},
          reqBody: "",
        });
        ws.addEventListener("open", () =>
          Object.assign(meta, { statusText: "open" })
        );
        ws.addEventListener("close", (e) =>
          Object.assign(meta, { statusText: `closed(${e.code})` })
        );
        ws.addEventListener("message", (e) => {
          try {
            var payload = short(String(e.data), 500);
            logs.push({
              kind: "ws-message",
              type: "ws",
              method: "WS_RECV",
              url: String(url),
              data: payload,
              responseBody: payload,
              status: meta.status || 0,
              time: iso(),
              stack: meta.stack,
              initiator: meta.initiator,
              tags: ["#Events"],
            });
            if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
            hudBump({ tags: ["#Events"] });
          } catch(e) {}
        });
        var origSend = ws.send;
        ws.send = function(data) {
          try {
            var payload = short(String(data), 500);
            logs.push({
              kind: "ws-message",
              type: "ws",
              method: "WS_SEND",
              url: String(url),
              data: payload,
              requestBody: payload,
              status: meta.status || 0,
              time: iso(),
              stack: meta.stack,
              initiator: meta.initiator,
              tags: ["#Events"],
            });
            if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
          } catch(e) {}
          return origSend.apply(this, arguments);
        };
        return ws;
      } catch(e) {
        collectCommon({ kind: "ws", url: String(url), error: String(e) });
        throw e;
      }
    }
    window.WebSocket = WSWrapped;
  }

  // ------- HUD -------
  let hudEl = null;
  let hudCounts = { total: 0, auth: 0, input: 0, error: 0, async: 0 };
  function ensureHUD() {
    if (!CONFIG.HUD || hudEl) return;
    hudEl = document.createElement("div");
    hudEl.style =
      "all:initial; position:fixed; z-index:2147483647; right:12px; bottom:12px; background:#111; color:#fff; font:12px/1.2 ui-monospace,monospace; padding:10px 12px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,.35); opacity:.85;";
    hudEl.textContent = "NetworkProbe ✅";
    hudEl.title = "NetworkProbe HUD — click to toggle";
    hudEl.addEventListener("click", () => NetworkProbe.overlay(false));
    document.documentElement.appendChild(hudEl);
    renderHUD();
  }
  function renderHUD() {
    if (!hudEl) return;
    hudEl.textContent = "";
    var parts = ["F:" + hudCounts.fetch, "X:" + hudCounts.xhr, "W:" + hudCounts.ws, "err:" + hudCounts.errors];
    hudEl.appendChild(document.createTextNode(parts.join(" ")));
  }
  function hudBump(meta) {
    ensureHUD();
    hudCounts.total++;
    if ((meta.tags || []).includes("#Auth")) hudCounts.auth++;
    if ((meta.tags || []).includes("#Input")) hudCounts.input++;
    if ((meta.tags || []).includes("#Error")) hudCounts.error++;
    if ((meta.tags || []).includes("#Async")) hudCounts.async++;
    renderHUD();
  }

  // ------- exporters & UI -------
  function download(name, content, mime = "application/json") {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    // Let GC handle revocation
  }

  function toCSVRow(obj, keys) {
    return keys
      .map((k) => {
        const v = obj[k] == null ? "" : String(obj[k]).replace(/"/g, '""');
        return '"' + v + '"';
      })
      .join(",");
  }

  function exportCSV() {
    const keys = [
      "time",
      "kind",
      "method",
      "status",
      "durationMs",
      "respSize",
      "url",
      "reqBody",
      "initiator",
      "tags",
    ];
    const header = keys.join(",");
    const rows = logs
      .filter((l) => l.kind !== "ws-message")
      .map((l) => {
        const o = { ...l, tags: (l.tags || []).join(" ") };
        return toCSVRow(o, keys);
      });
    download(
      `nextray_${Date.now()}.csv`,
      [header].concat(rows).join("\n"),
      "text/csv"
    );
  }
  function exportJSON() {
    download(`nextray_${Date.now()}.json`, JSON.stringify(logs, null, 2));
  }
  function exportNDJSON() {
    download(
      `nextray_${Date.now()}.ndjson`,
      logs.map((l) => JSON.stringify(l)).join("\n"),
      "application/x-ndjson"
    );
  }
  function exportHAR() {
    if (logs.length === 0) {
      console.warn("No logs to export");
      return null;
    }
    const entries = logs
      .filter((l) => l.kind === "fetch" || l.kind === "xhr")
      .map((l) => {
        try {
          return {
            startedDateTime: l.time,
            time: Math.round(l.durationMs || 0),
            request: {
              method: l.method || "GET",
              url: l.url,
              httpVersion: "HTTP/1.1",
              headers: Object.entries(l.headers || {}).map(([name, value]) => ({
                name,
                value,
              })),
              queryString: Array.from(
                new URL(l.url, location.href).searchParams.entries()
              ).map(([name, value]) => ({ name, value })),
              headersSize: -1,
              bodySize: (l.reqBody || "").length,
              postData: l.reqBody
                ? {
                    mimeType:
                      l.headers && (l.headers["content-type"] || "text/plain"),
                    text: l.reqBody,
                  }
                : undefined,
            },
            response: {
              status: l.status || 0,
              statusText: l.statusText || "",
              httpVersion: "HTTP/1.1",
              headers: [],
              content: {
                size: l.respSize || 0,
                mimeType: "",
                text: CONFIG.ENABLE_RESPONSE_PREVIEW
                  ? l.respPreview || ""
                  : undefined,
              },
              headersSize: -1,
              bodySize: l.respSize || 0,
            },
            cache: {},
            timings: { send: 0, wait: Math.round(l.durationMs || 0), receive: 0 },
            _initiator: l.initiator,
            _stack: l.stack,
            _tags: l.tags,
          };
        } catch(e) {
          return null;
        }
      })
      .filter(Boolean);
    const har = {
      log: {
        version: "1.2",
        creator: { name: "NetworkProbe", version: "2.0" },
        pages: [
          {
            startedDateTime: new Date(
              entries[0]?.startedDateTime || Date.now()
            ).toISOString(),
            id: "page_1",
            title: document.title,
            pageTimings: {},
          },
        ],
        entries,
      },
    };
    download(
      `nextray_${Date.now()}.har`,
      JSON.stringify(har, null, 2),
      "application/json"
    );
  }

  function curl(i) {
    const l = logs[i];
    if (!l) return console.warn("No log at index", i);
    if (!(l.kind === "fetch" || l.kind === "xhr"))
      return console.warn("cURL only for fetch/xhr");
    const parts = ["curl", "-i", "-X", l.method || "GET"];
    for (const [k, v] of Object.entries(l.headers || {}))
      parts.push("-H", JSON.stringify(`${k}: ${v}`));
    if (l.reqBody && !["GET", "HEAD"].includes(l.method))
      parts.push("--data-binary", JSON.stringify(l.reqBody));
    parts.push(JSON.stringify(l.url));
    const cmd = parts.join(" ");
    console.log(cmd);
    return cmd;
  }

  function _safeTable(data, max) {
    try {
      if (!data) return;
      const limit = max || 500;
      if (Array.isArray(data) && data.length > limit) {
        console.table(data.slice(0, limit));
        console.warn("(truncated " + (data.length - limit) + " more rows)");
      } else { console.table(data); }
    } catch(e) {}
  }

  function table() {
    const rows = logs
      .filter((l) => l.kind !== "ws-message")
      .map((l) => ({
        i: logs.indexOf(l),
        time: l.time.split("T")[1].replace("Z", ""),
        kind: l.kind,
        m: l.method,
        s: l.status,
        ms: l.durationMs,
        kb: Math.round((l.respSize || 0) / 1024),
        url: l.url,
        initiator: l.initiator,
        tags: (l.tags || []).join(" "),
      }));
    _safeTable(rows);
    return rows;
  }

  function find(query) {
    if (query instanceof RegExp) {
      const found = logs.filter((l) => query.test(l.url));
      _safeTable(
        found.map((l) => ({
          i: logs.indexOf(l),
          m: l.method,
          s: l.status,
          url: l.url,
          tags: (l.tags || []).join(" "),
          initiator: l.initiator,
        }))
      );
      return found;
    }
    // allow tag search: '#Auth' or 'Auth'
    const tag = String(query).startsWith("#")
      ? String(query)
      : "#" + String(query);
    const found = logs.filter((l) => (l.tags || []).includes(tag));
    _safeTable(
      found.map((l) => ({
        i: logs.indexOf(l),
        m: l.method,
        s: l.status,
        url: l.url,
        tags: (l.tags || []).join(" "),
        initiator: l.initiator,
      }))
    );
    return found;
  }

  function analyze(i) {
    const l = logs[i];
    if (!l) return console.warn("No log at", i);
    l.tags = [];
    l.findings = [];
    analyzeEntry(l);
    console.log(l.tags, l.findings);
    return l;
  }
  function tags(i) {
    const l = logs[i];
    return l ? l.tags : [];
  }

  function overlay(val) {
    if (val === false) {
      if (hudEl && hudEl.parentNode) hudEl.parentNode.removeChild(hudEl);
      hudEl = null;
      return;
    }
    if (val === true) {
      ensureHUD();
    }
    CONFIG.HUD = !!val;
  }

  // ------- lifecycle -------
  function start() {
    if (running) return console.warn("NetworkProbe already running");
    // Re-read originals in case page overwrote them between stop/start
    _orig.fetch = window.fetch;
    _orig.XHR = window.XMLHttpRequest;
    _orig.WS = window.WebSocket;
    running = true;
    installFetch();
    installXHR();
    installBeacon();
    installWebSocket();
    if (CONFIG.HUD) ensureHUD();
    console.log(
      "%cNetworkProbe started — capturing + auto-tagging",
      "color:#10b981"
    );
  }
  function stop() {
    if (!running) return console.warn("NetworkProbe not running");
    window.fetch = _orig.fetch;
    window.XMLHttpRequest = _orig.XHR;
    navigator.sendBeacon = _orig.sendBeacon;
    window.WebSocket = _orig.WebSocket;
    running = false;
    overlay(false);
    hudCounts = { total: 0, auth: 0, input: 0, error: 0, async: 0 };
    console.log("%cNetworkProbe stopped — originals restored", "color:#f59e0b");
  }
  function clear() {
    logs.length = 0;
    recent.length = 0;
    hudCounts = { total: 0, auth: 0, input: 0, error: 0, async: 0 };
    renderHUD();
    console.log("NetworkProbe logs cleared");
  }

  window.NetworkProbe = {
    get logs() {
      return logs.slice();
    },
    start,
    stop,
    clear,
    table,
    find,
    exportJSON,
    exportNDJSON,
    exportCSV,
    exportHAR,
    curl,
    analyze,
    tags,
    overlay,
    config: CONFIG,
  };

  // ===========================================
  // ENHANCEMENTS: Security Scanning Features
  // ===========================================

  // ENHANCEMENT 1: Traffic risk scoring
  NetworkProbe.scoreTraffic = function scoreTraffic() {
    try {
      var scored = [];
      logs.forEach(function(l) {
        try {
          var score = 0;
          var status = Number(l.status) || 0;
          if (status >= 500) score += 10;
          else if (status >= 400) score += 5;
          if (status === 401 || status === 403) score += 3;
          var url = l.url || "";
          if (url.indexOf("token") !== -1 || url.indexOf("auth") !== -1) score += 5;
          if (url.indexOf(".env") !== -1 || url.indexOf("config") !== -1) score += 3;
          if (l.error) score += 8;
          if (score > 0) scored.push({ url: url.substring(0, 80), status: status, score: score, method: l.method || "GET", type: l.type || "fetch" });
        } catch(e) {}
      });
      scored.sort(function(a, b) { return b.score - a.score; });
      console.log("%c📊 Risk-scored: " + scored.length, scored.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #7f8c8d");
      _safeTable(scored.slice(0, 30), 30);
      return scored;
    } catch(e) { console.warn("scoreTraffic error:", e); return []; }
  };

  // ENHANCEMENT 2: CORS analysis
  NetworkProbe.analyzeCORS = function analyzeCORS() {
    try {
      var issues = [];
      logs.forEach(function(l) {
        try {
          var headers = l.responseHeaders || {};
          var acao = headers["access-control-allow-origin"];
          var acac = headers["access-control-allow-credentials"];
          if (acao === "*") {
            issues.push({ url: (l.url || "").substring(0, 80), issue: "Wildcard ACAO", risk: acac === "true" ? "CRITICAL" : "MEDIUM" });
          }
          if (acao && acao !== "*" && acao !== location.origin) {
            issues.push({ url: (l.url || "").substring(0, 80), issue: "Cross-origin ACAO", risk: "MEDIUM", details: acao });
          }
        } catch(e) {}
      });
      console.log("%c🌐 CORS issues: " + issues.length, issues.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(issues, 20);
      return issues;
    } catch(e) { console.warn("analyzeCORS error:", e); return []; }
  };

  // ENHANCEMENT 3: Cookie security analysis
  NetworkProbe.analyzeCookies = function analyzeCookies() {
    try {
      var issues = [];
      logs.forEach(function(l) {
        try {
          var setCookie = (l.responseHeaders || {})["set-cookie"] || "";
          if (!setCookie) return;
          var flags = setCookie.toLowerCase();
          var missing = [];
          if (flags.indexOf("secure") === -1) missing.push("Secure");
          if (flags.indexOf("httponly") === -1) missing.push("HttpOnly");
          if (flags.indexOf("samesite") === -1) missing.push("SameSite");
          if (missing.length > 0) issues.push({ url: (l.url || "").substring(0, 60), missing: missing.join(", "), risk: missing.length > 2 ? "HIGH" : "MEDIUM" });
        } catch(e) {}
      });
      console.log("%c🍪 Cookie issues: " + issues.length, issues.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(issues, 20);
      return issues;
    } catch(e) { console.warn("analyzeCookies error:", e); return []; }
  };

  // ENHANCEMENT 4: Security header check
  NetworkProbe.checkSecurityHeaders = function checkSecurityHeaders() {
    try {
      var required = ["strict-transport-security", "x-content-type-options", "x-frame-options", "content-security-policy", "referrer-policy"];
      var results = [];
      logs.forEach(function(l) {
        try {
          var resp = l.responseHeaders || {};
          var missing = required.filter(function(h) { return !resp[h]; });
          if (missing.length > 0) results.push({ url: (l.url || "").substring(0, 60), missing: missing.join(", "), count: missing.length });
        } catch(e) {}
      });
      console.log("%c🛡 Missing headers: " + results.length, results.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(results, 20);
      return results;
    } catch(e) { console.warn("checkSecurityHeaders error:", e); return []; }
  };

  // ENHANCEMENT 5: Sensitive data exposure detector
  NetworkProbe.detectDataExposure = function detectDataExposure() {
    try {
      var exposure = [];
      var patterns = [
        { name: "Email", rx: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
        { name: "Phone", rx: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
        { name: "Credit Card", rx: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
        { name: "API Key", rx: /["']?(?:api[_-]?key|apikey|api_token)["']?\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}/gi }
      ];
      logs.forEach(function(l) {
        try {
          var body = l.responseBody || "";
          if (typeof body !== "string") return;
          patterns.forEach(function(p) {
            var matches = body.match(p.rx) || [];
            if (matches.length > 0) exposure.push({ url: (l.url || "").substring(0, 60), type: p.name, count: matches.length });
          });
        } catch(e) {}
      });
      console.log("%c🔓 Data exposure: " + exposure.length, exposure.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(exposure, 20);
      return exposure;
    } catch(e) { console.warn("detectDataExposure error:", e); return []; }
  };

  // ENHANCEMENT 6: API endpoint mapper
  NetworkProbe.mapEndpoints = function mapEndpoints() {
    try {
      var endpoints = {};
      logs.forEach(function(l) {
        try {
          var path = (l.url || "").replace(/https?:\/\/[^\/]+/, "").split("?")[0];
          var method = l.method || "GET";
          var key = method + " " + path;
          if (!endpoints[key]) endpoints[key] = { method: method, path: path, count: 0, statuses: [] };
          endpoints[key].count++;
          endpoints[key].statuses.push(Number(l.status) || 0);
        } catch(e) {}
      });
      var result = Object.keys(endpoints).map(function(k) { return endpoints[k]; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c🗺 Endpoints: " + result.length, "color: #3498db; font-weight: bold");
      _safeTable(result.slice(0, 30), 30);
      return result;
    } catch(e) { console.warn("mapEndpoints error:", e); return []; }
  };

  // ENHANCEMENT 7: Performance analyzer
  NetworkProbe.analyzePerformance = function analyzePerformance() {
    try {
      var slow = [];
      logs.forEach(function(l) {
        try {
          var time = l.duration || 0;
          if (time > 3000) slow.push({ url: (l.url || "").substring(0, 80), time: time + "ms", status: l.status, method: l.method || "GET" });
        } catch(e) {}
      });
      slow.sort(function(a, b) { return parseInt(b.time) - parseInt(a.time); });
      console.log("%c⏱ Slow: " + slow.length, slow.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(slow.slice(0, 20), 20);
      return slow;
    } catch(e) { console.warn("analyzePerformance error:", e); return []; }
  };

  // ENHANCEMENT 8: Technology fingerprint
  NetworkProbe.fingerprintTech = function fingerprintTech() {
    try {
      var techs = {};
      logs.forEach(function(l) {
        try {
          var h = l.responseHeaders || {};
          var server = h["server"] || "";
          var powered = h["x-powered-by"] || "";
          if (server) techs["Server: " + server] = (techs["Server: " + server] || 0) + 1;
          if (powered) techs["Stack: " + powered] = (techs["Stack: " + powered] || 0) + 1;
        } catch(e) {}
      });
      var result = Object.keys(techs).map(function(k) { return { tech: k, count: techs[k] }; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c🛠 Tech: " + result.length, "color: #e67e22; font-weight: bold");
      _safeTable(result, 20);
      return result;
    } catch(e) { console.warn("fingerprintTech error:", e); return []; }
  };

  // ENHANCEMENT 9: Compliance report
  NetworkProbe.complianceReport = function complianceReport() {
    try {
      var report = [];
      var high = logs.filter(function(l) { return (Number(l.status) || 0) >= 500; });
      if (high.length > 0) report.push({ owasp: "A09:2021 - Security Logging", findings: high.length, action: "Investigate server errors" });
      var cors = logs.filter(function(l) { return (l.responseHeaders || {})["access-control-allow-origin"] === "*"; });
      if (cors.length > 0) report.push({ owasp: "A05:2021 - Security Misconfiguration", findings: cors.length, action: "Fix wildcard CORS" });
      var noHSTS = logs.filter(function(l) { return !(l.responseHeaders || {})["strict-transport-security"] && (l.url || "").indexOf("https") === 0; });
      if (noHSTS.length > 0) report.push({ owasp: "A02:2021 - Cryptographic Failures", findings: noHSTS.length, action: "Enable HSTS" });
      console.log("%c📋 Compliance: " + report.length, "color: #3498db; font-weight: bold");
      _safeTable(report, 20);
      return report;
    } catch(e) { console.warn("complianceReport error:", e); return []; }
  };

  // ENHANCEMENT 10: Traffic diff
  NetworkProbe.trafficDiff = function trafficDiff(minutesAgo) {
    try {
      var now = Date.now();
      var windowMs = (minutesAgo || 5) * 60 * 1000;
      var recent = logs.filter(function(l) { return (now - (new Date(l.time || 0).getTime())) < windowMs; });
      var older = logs.filter(function(l) { return (now - (new Date(l.time || 0).getTime())) >= windowMs && (now - (new Date(l.time || 0).getTime())) < windowMs * 2; });
      var result = { recent: recent.length, older: older.length, change: recent.length - older.length };
      console.log("%c📸 Diff (" + (minutesAgo || 5) + "min): " + result.change, "color: #3498db; font-weight: bold");
      return result;
    } catch(e) { console.warn("trafficDiff error:", e); return {}; }
  };

  // ===========================================
  // ENHANCEMENTS #11-20: Advanced Security Features
  // ===========================================

  // ENHANCEMENT 11: JWT token analyzer
  NetworkProbe.analyzeJWTs = function analyzeJWTs() {
    try {
      var jwts = [];
      logs.forEach(function(l) {
        try {
          var headers = l.responseHeaders || {};
          var auth = headers["authorization"] || "";
          var bearer = auth.replace(/^Bearer\s+/i, "");
          if (bearer.split(".").length === 3) {
            try {
              var parts = bearer.split(".");
              var hdr = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
              var pay = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
              jwts.push({ url: (l.url || "").substring(0, 60), algorithm: hdr.alg || "unknown", issuer: pay.iss || "unknown", expiry: pay.exp ? new Date(pay.exp * 1000).toISOString() : "unknown", risk: hdr.alg === "none" ? "CRITICAL" : hdr.alg === "HS256" ? "MEDIUM" : "INFO" });
            } catch(e) {}
          }
          var body = l.responseBody || "";
          var bodyJWTs = (typeof body === "string" ? body : "").match(/\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\b/g) || [];
          bodyJWTs.slice(0, 5).forEach(function(tok) {
            try {
              var p = tok.split(".");
              var h = JSON.parse(atob(p[0].replace(/-/g, "+").replace(/_/g, "/")));
              var y = JSON.parse(atob(p[1].replace(/-/g, "+").replace(/_/g, "/")));
              jwts.push({ url: (l.url || "").substring(0, 60), algorithm: h.alg, issuer: y.iss || "unknown", expiry: y.exp ? new Date(y.exp * 1000).toISOString() : "unknown", risk: h.alg === "none" ? "CRITICAL" : "INFO", location: "body" });
            } catch(e) {}
          });
        } catch(e) {}
      });
      console.log("%c🔐 JWTs: " + jwts.length, jwts.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(jwts, 20);
      return jwts;
    } catch(e) { console.warn("analyzeJWTs error:", e); return []; }
  };

  // ENHANCEMENT 12: GraphQL endpoint detection
  NetworkProbe.detectGraphQL = function detectGraphQL() {
    try {
      var gql = [];
      logs.forEach(function(l) {
        try {
          var url = l.url || "";
          var body = l.requestBody || "";
          if (url.indexOf("graphql") !== -1 || url.indexOf("/gql") !== -1) {
            gql.push({ url: url.substring(0, 80), method: l.method || "GET", type: "endpoint", risk: "MEDIUM" });
          }
          if (typeof body === "string" && (body.indexOf("query") !== -1 || body.indexOf("mutation") !== -1)) {
            var op = body.match(/(query|mutation|subscription)\s+(\w+)/);
            if (op) gql.push({ url: url.substring(0, 80), method: l.method || "POST", type: "operation", operation: op[1], name: op[2], risk: "LOW" });
          }
        } catch(e) {}
      });
      console.log("%c📊 GraphQL: " + gql.length, gql.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #7f8c8d");
      _safeTable(gql, 20);
      return gql;
    } catch(e) { console.warn("detectGraphQL error:", e); return []; }
  };

  // ENHANCEMENT 13: Subdomain takeover indicators
  NetworkProbe.detectSubdomainTakeover = function detectSubdomainTakeover() {
    try {
      var found = [];
      var patterns = [
        { name: "Heroku", rx: /herokuapp\.com/gi, risk: "HIGH" },
        { name: "GitHub Pages", rx: /github\.io/gi, risk: "MEDIUM" },
        { name: "AWS S3", rx: /s3\.amazonaws\.com/gi, risk: "MEDIUM" },
        { name: "Azure", rx: /azurewebsites\.net/gi, risk: "MEDIUM" },
        { name: "Fastly", rx: /fastly\.net/gi, risk: "LOW" }
      ];
      logs.forEach(function(l) {
        try {
          var text = (l.url || "") + " " + (typeof l.responseBody === "string" ? l.responseBody : "");
          patterns.forEach(function(p) {
            if (p.rx.test(text)) { found.push({ url: (l.url || "").substring(0, 80), service: p.name, risk: p.risk }); p.rx.lastIndex = 0; }
          });
        } catch(e) {}
      });
      console.log("%c🌐 Subdomain takeover: " + found.length, found.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(found, 20);
      return found;
    } catch(e) { console.warn("detectSubdomainTakeover error:", e); return []; }
  };

  // ENHANCEMENT 14: Sensitive path scanner
  NetworkProbe.scanSensitivePaths = function scanSensitivePaths() {
    try {
      var found = [];
      var paths = ["/.env", "/.git/config", "/wp-config.php", "/config.json", "/secrets.json", "/.aws/credentials", "/docker-compose.yml", "/server-status", "/.DS_Store", "/debug/vars", "/actuator", "/swagger.json", "/api-docs", "/phpinfo.php", "/.svn/entries", "/backup.zip", "/dump.sql", "/phpmyadmin"];
      logs.forEach(function(l) {
        try {
          var url = l.url || "";
          paths.forEach(function(p) {
            if (url.indexOf(p) !== -1) found.push({ url: url.substring(0, 80), path: p, status: l.status, risk: (Number(l.status) || 0) < 400 ? "HIGH" : "MEDIUM" });
          });
        } catch(e) {}
      });
      console.log("%c📁 Sensitive paths: " + found.length, found.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #27ae60");
      _safeTable(found, 20);
      return found;
    } catch(e) { console.warn("scanSensitivePaths error:", e); return []; }
  };

  // ENHANCEMENT 15: Response size anomaly detector
  NetworkProbe.detectSizeAnomalies = function detectSizeAnomalies() {
    try {
      if (logs.length < 5) return [];
      var sizes = logs.map(function(l) { return { url: l.url || "", size: (l.responseBody || "").length }; });
      var avg = sizes.reduce(function(s, e) { return s + e.size; }, 0) / sizes.length;
      var std = Math.sqrt(sizes.reduce(function(s, e) { return s + Math.pow(e.size - avg, 2); }, 0) / sizes.length);
      var anomalies = sizes.filter(function(s) { return s.size > avg + 3 * std && s.size > 10000; }).map(function(s) { return { url: s.url.substring(0, 80), size: s.size, avg: Math.round(avg), deviation: Math.round((s.size - avg) / std) + "x" }; });
      console.log("%c📏 Size anomalies: " + anomalies.length, anomalies.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      _safeTable(anomalies, 20);
      return anomalies;
    } catch(e) { console.warn("detectSizeAnomalies error:", e); return []; }
  };

  // ENHANCEMENT 16: HTTP method distribution
  NetworkProbe.analyzeMethods = function analyzeMethods() {
    try {
      var methods = {};
      logs.forEach(function(l) { try { var m = (l.method || "GET").toUpperCase(); methods[m] = (methods[m] || 0) + 1; } catch(e) {} });
      var result = Object.keys(methods).map(function(k) { return { method: k, count: methods[k], pct: Math.round(methods[k] / logs.length * 100) + "%" }; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c📡 Methods:", "color: #3498db; font-weight: bold");
      _safeTable(result, 20);
      return result;
    } catch(e) { console.warn("analyzeMethods error:", e); return []; }
  };

  // ENHANCEMENT 17: Status code distribution
  NetworkProbe.analyzeStatusCodes = function analyzeStatusCodes() {
    try {
      var codes = {};
      logs.forEach(function(l) { try { var s = l.status || 0; codes[s] = (codes[s] || 0) + 1; } catch(e) {} });
      var result = Object.keys(codes).map(function(k) { return { code: k, count: codes[k] }; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c📊 Status codes:", "color: #3498db; font-weight: bold");
      _safeTable(result.slice(0, 20), 20);
      return result;
    } catch(e) { console.warn("analyzeStatusCodes error:", e); return []; }
  };

  // ENHANCEMENT 18: Third-party request detector
  NetworkProbe.detectThirdParty = function detectThirdParty() {
    try {
      var tp = {};
      var own = location.origin;
      logs.forEach(function(l) {
        try {
          var url = l.url || "";
          if (url.indexOf(own) === -1 && url.indexOf("http") === 0) {
            var host = url.replace(/https?:\/\/([^\/]+).*/, "$1");
            if (!tp[host]) tp[host] = { host: host, count: 0 };
            tp[host].count++;
          }
        } catch(e) {}
      });
      var result = Object.keys(tp).map(function(k) { return tp[k]; });
      result.sort(function(a, b) { return b.count - a.count; });
      console.log("%c🌐 Third-party: " + result.length + " domains", "color: #e67e22; font-weight: bold");
      _safeTable(result, 20);
      return result;
    } catch(e) { console.warn("detectThirdParty error:", e); return []; }
  };

  // ENHANCEMENT 19: Authentication flow tracker
  NetworkProbe.trackAuthFlows = function trackAuthFlows() {
    try {
      var flows = [];
      logs.forEach(function(l) {
        try {
          var url = (l.url || "").toLowerCase();
          if (url.indexOf("login") !== -1 || url.indexOf("signin") !== -1 || url.indexOf("auth") !== -1 || url.indexOf("oauth") !== -1 || url.indexOf("callback") !== -1) {
            flows.push({ url: (l.url || "").substring(0, 80), method: l.method || "GET", status: l.status, type: url.indexOf("login") !== -1 ? "login" : url.indexOf("oauth") !== -1 ? "oauth" : "auth" });
          }
          var sc = (l.responseHeaders || {})["set-cookie"] || "";
          if (sc && (sc.indexOf("session") !== -1 || sc.indexOf("token") !== -1)) {
            flows.push({ url: (l.url || "").substring(0, 80), method: l.method || "GET", status: l.status, type: "session_set" });
          }
        } catch(e) {}
      });
      console.log("%c🔑 Auth flows: " + flows.length, flows.length > 0 ? "color: #3498db; font-weight: bold" : "color: #7f8c8d");
      _safeTable(flows, 30);
      return flows;
    } catch(e) { console.warn("trackAuthFlows error:", e); return []; }
  };

  // ENHANCEMENT 20: Traffic summary dashboard
  NetworkProbe.trafficDashboard = function trafficDashboard() {
    try {
      var total = logs.length;
      var errors = logs.filter(function(l) { return (Number(l.status) || 0) >= 400; }).length;
      var domains = {};
      logs.forEach(function(l) { try { var h = (l.url || "").replace(/https?:\/\/([^\/]+).*/, "$1"); domains[h] = 1; } catch(e) {} });
      var dash = {
        totalRequests: total,
        errorRate: total > 0 ? Math.round(errors / total * 100) + "%" : "0%",
        uniqueDomains: Object.keys(domains).length,
        hasAuth: logs.some(function(l) { return (l.url || "").indexOf("auth") !== -1; }) ? "YES" : "NO",
        hasGraphQL: logs.some(function(l) { return (l.url || "").indexOf("graphql") !== -1; }) ? "YES" : "NO",
        hasCORS: logs.some(function(l) { return (l.responseHeaders || {})["access-control-allow-origin"]; }) ? "YES" : "NO"
      };
      console.log("%c📊 DASHBOARD", "color: #e74c3c; font-weight: bold; font-size: 14px");
      _safeTable([dash], 1);
      return dash;
    } catch(e) { console.warn("trafficDashboard error:", e); return {}; }
  };

  // Backward alias for older notes
  window.NetXRay = window.NetworkProbe;

  // ===========================================
  // ENHANCEMENTS #21-26: Advanced Traffic & Export Features
  // ===========================================

  // CAPABILITY: Traffic Replay — resend captured requests
  NetworkProbe.replayRequest = NetworkProbe.replayRequest || function replayRequest(index, opts) {
    try {
      var entry = logs[index];
      if (!entry) { console.warn("No entry at index " + index); return null; }
      var url = entry.url || "";
      var method = (entry.method || "GET").toUpperCase();
      var headers = entry.headers || {};
      var body = entry.reqBody || null;
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
  NetworkProbe.compareRequests = NetworkProbe.compareRequests || function compareRequests(idx1, idx2) {
    try {
      var e1 = logs[idx1];
      var e2 = logs[idx2];
      if (!e1 || !e2) { console.warn("Invalid indices"); return null; }
      var diffs = [];
      if (e1.url !== e2.url) diffs.push({ field: "url", left: e1.url, right: e2.url });
      if ((e1.method || "GET") !== (e2.method || "GET")) diffs.push({ field: "method", left: e1.method, right: e2.method });
      if (e1.status !== e2.status) diffs.push({ field: "status", left: e1.status, right: e2.status });
      var h1 = JSON.stringify(e1.headers || {});
      var h2 = JSON.stringify(e2.headers || {});
      if (h1 !== h2) diffs.push({ field: "requestHeaders", left: h1.substring(0, 200), right: h2.substring(0, 200) });
      var b1 = (e1.reqBody || "").substring(0, 500);
      var b2 = (e2.reqBody || "").substring(0, 500);
      if (b1 !== b2) diffs.push({ field: "requestBody", left: b1, right: b2 });
      var r1 = (e1.respPreview || "").substring(0, 500);
      var r2 = (e2.respPreview || "").substring(0, 500);
      if (r1 !== r2) diffs.push({ field: "responsePreview", left: r1.substring(0, 100), right: r2.substring(0, 100) });
      console.log("%c🔍 Request diff: " + diffs.length + " differences", diffs.length > 0 ? "color: #e67e22; font-weight: bold" : "color: #27ae60");
      if (diffs.length > 0) _safeTable(diffs, 20);
      return diffs;
    } catch(e) { console.warn("compareRequests error:", e); return []; }
  };

  // CAPABILITY: WebSocket Message Analysis
  NetworkProbe.analyzeWebSocketMessages = NetworkProbe.analyzeWebSocketMessages || function analyzeWebSocketMessages() {
    try {
      var wsEntries = logs.filter(function(l) { return l.type === "ws" || l.kind === "ws-message"; });
      var messages = [];
      wsEntries.forEach(function(l) {
        try {
          var body = l.data || l.responseBody || l.requestBody || "";
          if (typeof body === "string" && body.length > 0) {
            messages.push({ url: (l.url || "").substring(0, 80), direction: l.method === "WS_SEND" ? "out" : l.method === "WS_RECV" ? "in" : l.method || "ws", preview: body.substring(0, 100), size: body.length });
          }
        } catch(e) {}
      });
      console.log("%c🔌 WebSocket messages: " + messages.length, messages.length > 0 ? "color: #3498db; font-weight: bold" : "color: #7f8c8d");
      _safeTable(messages.slice(0, 30), 30);
      return messages;
    } catch(e) { console.warn("analyzeWebSocketMessages error:", e); return []; }
  };

  // CAPABILITY: Collaborative Export — HTML report for sharing
  NetworkProbe.exportHTMLReport = NetworkProbe.exportHTMLReport || function exportHTMLReport() {
    try {
      var log = logs;
      var findings = [];
      logs.forEach(function(l) {
        (l.findings || []).forEach(function(f) {
          findings.push({ message: f, url: l.url, tags: l.tags });
        });
      });
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
        html += '<h2>Findings (' + findings.length + ')</h2><table><tr><th>Type</th><th>Message</th><th>URL</th></tr>';
        findings.forEach(function(f) {
          var tags = (f.tags || []).join(" ");
          html += '<tr><td>' + tags + '</td><td>' + (f.message || "").substring(0, 100) + '</td><td>' + (f.url || "").substring(0, 60) + '</td></tr>';
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
  NetworkProbe.scan = NetworkProbe.scan || function scan(url, opts) {
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

  NetworkProbe.getReport = NetworkProbe.getReport || function getReport() {
    try {
      return {
        version: "2.0",
        timestamp: new Date().toISOString(),
        totalRequests: logs.length,
        errors: logs.filter(function(e) { return (e.status || 0) >= 400; }).length,
        findings: logs.reduce(function(s, l) { return s + (l.findings || []).length; }, 0),
        entries: logs.slice(0, 100).map(function(e) { return { url: e.url, method: e.method, status: e.status, duration: e.durationMs }; })
      };
    } catch(e) { return { error: String(e) }; }
  };

  if (CONFIG.AUTO_START) start();

  // CLEANUP: Restore all patched functions and clean up
  NetworkProbe.CLEANUP = NetworkProbe.CLEANUP || function CLEANUP() {
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
  NetworkProbe.HELP = NetworkProbe.HELP || function HELP() {
    var name = "NetworkProbe";
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
