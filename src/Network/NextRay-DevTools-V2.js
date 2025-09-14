/*
 * NextRay — DevTools Network X-Ray for Pro Hunters
 * Evolved from NetXRay with the GOLD MINE CHECKLIST automation.
 *
 * Paste into DevTools Console. Captures fetch/XHR/beacon/WS +
 * stack, initiator, timings, sizes, and runs real‑time heuristics
 * to auto‑tag each entry with high‑value findings.
 *
 * API (unchanged + new):
 *   NextRay.start() / NextRay.stop() / NextRay.clear()
 *   NextRay.table()                 // table with tags
 *   NextRay.find(/regex|TAG/)       // filter by URL or by #Tag
 *   NextRay.curl(i)                 // cURL command for log i
 *   NextRay.exportJSON()/CSV()/HAR()/NDJSON()
 *   NextRay.analyze(i)              // rerun checklist on entry i
 *   NextRay.tags(i)                 // get tags for entry i
 *   NextRay.overlay(true|false)     // minimal HUD toggle
 *   NextRay.config                  // tweak knobs
 *
 * GOLD MINE CHECKLIST (auto‑tagged):
 *   #Framework, #ThirdParty, #State, #Auth, #Input, #Error,
 *   #Transform, #Events, #Async, #Memory
 */
(function () {
  if (window.NextRay) {
    console.warn(
      "NextRay already loaded. Use NextRay.stop() then re-run if needed."
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
      .filter((l) => !/NextRay/.test(l))
      .join("\n");
  };
  const lower = (s) => (s || "").toLowerCase();
  const has = (s, arr) => arr.some((a) => lower(s).includes(lower(a)));
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
    } catch (e) {}
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
        .find((l) => !/\(native\)|NextRay|<anonymous>/.test(l)) || "";
    const m = line.match(
      /\(?([^\s\)]+\.(?:js|tsx?|vue|jsx)[^\)]*):(\d+):(\d+)\)?/
    );
    return m ? `${m[1]}:${m[2]}` : "script";
  }

  // ------- GOLD MINE CHECKLIST (heuristics) -------
  function analyzeEntry(l) {
    const { url, method, headers = {}, reqBody = "", stack = "" } = l;
    const info = urlInfo(url);
    const qp = info.query;
    const path = info.path;

    // Framework specific
    if (
      has(stack, [
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
      has(stack, [
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
    if (has(stack, ["redux", "ngrx", "mobx", "zustand", "pinia", "store"]))
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
    if ((l.status | 0) >= 500) pushUnique(l.tags, "#Error");
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
    if (has(stack, ["addEventListener", "onclick", "onchange", "postMessage"]))
      pushUnique(l.tags, "#Events");

    // Async race conditions
    if (looksLikeRace(url, method)) pushUnique(l.tags, "#Async");

    // Memory leak opportunities
    const kb = Math.round((l.respSize || 0) / 1024);
    if (kb >= CONFIG.LARGE_RESP_KB) pushUnique(l.tags, "#Memory");

    // Deeper sink scans
    if (
      has(stack, [
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
      const state = {
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
          state.method = String(method || "GET").toUpperCase();
          state.url = String(url);
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
            } catch (e) {}
            return 0;
          })();
          Object.assign(state.meta, {
            status: this.status,
            statusText: this.statusText,
            durationMs: +(end - state.start).toFixed(2),
            respSize: size,
          });
          collectCommon(state.meta);
        });
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
      const ws = new _orig.WebSocket(url, protocols);
      const meta = collectCommon({
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
      if (CONFIG.LOG_WEBSOCKET_MESSAGES) {
        ws.addEventListener("message", (e) => {
          logs.push({
            kind: "ws-message",
            url: String(url),
            data: short(String(e.data), 500),
            time: iso(),
            stack: meta.stack,
            initiator: meta.initiator,
            tags: ["#Events"],
          });
        });
      }
      return ws;
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
    hudEl.textContent = "NextRay ✅";
    hudEl.title = "NextRay HUD — click to toggle";
    hudEl.addEventListener("click", () => NextRay.overlay(false));
    document.documentElement.appendChild(hudEl);
    renderHUD();
  }
  function renderHUD() {
    if (!hudEl) return;
    hudEl.innerHTML = `NextRay <b>${hudCounts.total}</b> · <span>#Auth ${hudCounts.auth}</span> · <span>#Input ${hudCounts.input}</span> · <span>#Error ${hudCounts.error}</span> · <span>#Async ${hudCounts.async}</span>`;
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
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
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
    const entries = logs
      .filter((l) => l.kind === "fetch" || l.kind === "xhr")
      .map((l) => ({
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
      }));
    const har = {
      log: {
        version: "1.2",
        creator: { name: "NextRay", version: "2.0" },
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

  function table() {
    const rows = logs
      .filter((l) => l.kind !== "ws-message")
      .map((l, i) => ({
        i,
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
    console.table(rows);
    return rows;
  }

  function find(query) {
    if (query instanceof RegExp) {
      const found = logs.filter((l) => query.test(l.url));
      console.table(
        found.map((l, i) => ({
          i,
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
    console.table(
      found.map((l, i) => ({
        i,
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
    if (running) return console.warn("NextRay already running");
    running = true;
    installFetch();
    installXHR();
    installBeacon();
    installWebSocket();
    if (CONFIG.HUD) ensureHUD();
    console.log(
      "%cNextRay started — capturing + auto-tagging",
      "color:#10b981"
    );
  }
  function stop() {
    if (!running) return console.warn("NextRay not running");
    window.fetch = _orig.fetch;
    window.XMLHttpRequest = _orig.XHR;
    navigator.sendBeacon = _orig.sendBeacon;
    window.WebSocket = _orig.WebSocket;
    running = false;
    overlay(false);
    console.log("%cNextRay stopped — originals restored", "color:#f59e0b");
  }
  function clear() {
    logs.length = 0;
    hudCounts = { total: 0, auth: 0, input: 0, error: 0, async: 0 };
    renderHUD();
    console.log("NextRay logs cleared");
  }

  window.NextRay = {
    get logs() {
      return logs;
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
  // Backward alias for older notes
  window.NetXRay = window.NextRay;

  if (CONFIG.AUTO_START) start();
})();
