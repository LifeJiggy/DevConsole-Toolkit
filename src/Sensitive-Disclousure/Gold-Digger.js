/**
 * --- GOLD DIGGER: P1 Disclosure Extractor ---
 * A standalone snippet to find sensitive disclosures in the current page's JS/DOM.
 * Run this directly in the browser console of any target URL.
 */
(function extractP1Gold() {
  "use strict";
  const _MAX_SCRIPTS = 200;
  const _MAX_ELEMENTS = 10000;
  function _safeTable(data, max) {
    try {
      if (!data) return;
      const limit = max || 200;
      if (Array.isArray(data) && data.length > limit) {
        console.table(data.slice(0, limit));
        console.warn("(truncated " + (data.length - limit) + " more rows)");
      } else { console.table(data); }
    } catch {}
  }

  console.group("ðŸš¨ GOLD DIGGER: P1 Disclosure Extractor");
  console.log("Scanning current page for HIGH-VALUE disclosures...");

  // --- FINDINGS CONTAINER ---
  const gold = {
    secrets: new Set(),
    endpoints: new Set(),
    internalPaths: new Set(),
    debugInfo: new Set(),
    configObjects: new Set(),
    awsResources: new Set(),
    authFindings: new Set(),
    fileUploads: new Set(),
    businessLogic: new Set(),
    userFlows: new Set(),
    hiddenElements: new Set(),
    dbCreds: new Set(),
    networkCalls: new Set(),
    riskySinks: new Set(),
  };

  // Click helper: try to open URLs printed in console
  try {
    window.GOLD_OPEN = (url) => {
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {}
    };
  } catch {}

  // safeTable removed — using _safeTable wrapper instead

  // Structured JSON findings with richer metadata
  const jsonFindings = {
    secrets: [],
    apiEndpoints: [],
    internalPaths: [],
    debugInfo: [],
    configObjects: [],
    awsResources: [],
    auth: [],
    fileUpload: [],
    businessLogic: [],
    userFlows: [],
    hidden: [],
    dbCreds: [],
    network: [],
    riskySinks: [],
  };

  function clickableLocation(source, line, index) {
    // creates a label that we can click to trigger a re-scan focus or open URL
    return {
      source,
      line,
      index,
      open: (url) => {
        try {
          window.open(url, "_blank");
        } catch {}
      },
    };
  }

  // --- Source cache and navigation helpers ---
  const sourceTextIndex = new Map();
  function registerSource(source, content) {
    try {
      if (typeof content === "string" && content.length)
        sourceTextIndex.set(source, content);
    } catch {}
  }
  function parseSourceUrl(source) {
    try {
      const s = String(source || "");
      const m = s.match(/External Script #\d+:\s*(.+)$/);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }
  function printSnippet(text, line, before = 3, after = 3) {
    try {
      const lines = String(text).split("\n");
      const ln = Math.max(1, parseInt(line || 1, 10));
      const start = Math.max(0, ln - 1 - before);
      const end = Math.min(lines.length, ln - 1 + after + 1);
      const out = [];
      for (let i = start; i < end; i++) {
        out.push(`${i + 1}${i + 1 === ln ? " â–¶" : ""}  ${lines[i]}`);
      }
      console.log(out.join("\n"));
    } catch (e) {
      console.warn("Snippet error:", e);
    }
  }

  try {
    window.GOLD = {
      json: jsonFindings,
      table: (key) => _safeTable(jsonFindings[key] || []),
      risks: () => _safeTable(jsonFindings.riskySinks || []),
      goto: (source, line = 1, ctx = 3) => {
        try {
          const text = sourceTextIndex.get(source);
          if (!text) return console.warn("No cached source for", source);
          printSnippet(text, line, ctx, ctx);
        } catch (e) {
          console.warn("goto error", e);
        }
      },
      open: (sourceLike) => {
        try {
          const s =
            typeof sourceLike === "object" && sourceLike?.source
              ? sourceLike.source
              : sourceLike;
          const url = parseSourceUrl(s);
          if (url) window.open(url, "_blank");
          else console.warn("No URL to open for source", s);
        } catch (e) {
          console.warn("open error", e);
        }
      },
      find: (re) => {
        try {
          const rx = re instanceof RegExp ? re : new RegExp(String(re), "gi");
          const results = [];
          sourceTextIndex.forEach((content, src) => {
            rx.lastIndex = 0;
            let m;
            while ((m = rx.exec(content))) {
              const loc = locateInSource(content, m[0]);
              results.push({
                source: src,
                match: m[0],
                line: loc?.line || null,
                index: loc?.index || null,
              });
            }
          });
          _safeTable(results);
          return results;
        } catch (e) {
          console.warn("find error", e);
        }
      },
    };
  } catch {}

  // Patch event and network hooks (lightweight) once
  (function () {
    try {
      if (window.__GOLD_PATCHED) return;
      window.__GOLD_PATCHED = true;
      window.__origAddEventListener = EventTarget.prototype.addEventListener;
      window.__origFetch = window.fetch;
      window.__origXHROpen = XMLHttpRequest.prototype.open;
      window.__origXHRSend = XMLHttpRequest.prototype.send;
      function nodeSignature(el) {
        try {
          if (!el || !el.tagName) return "[unknown]";
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : "";
          const cls = el.className
            ? "." + String(el.className).trim().split(/\s+/).join(".")
            : "";
          return `${tag}${id}${cls}`;
        } catch {
          return "[unknown]";
        }
      }
      const _add = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (
        type,
        listener,
        options
      ) {
        try {
          const sig = nodeSignature(this);
          const handlerName = listener?.name || "anonymous";
          gold.userFlows?.add(`[EVENT] ${sig} on ${type} -> ${handlerName}`);
          pushJson("userFlows", {
            type: "LISTENER",
            event: type,
            target: sig,
            handler: handlerName,
            source: "addEventListener",
          });
        } catch {}
        return _add.call(this, type, listener, options);
      };
      const _fetch = window.fetch;
      if (typeof _fetch === "function") {
        window.fetch = function (input, init) {
          const url = typeof input === "string" ? input : input?.url || "";
          const method = String(init?.method || "GET").toUpperCase();
          const body =
            init && typeof init.body === "string"
              ? init.body.slice(0, 512)
              : undefined;
          const meta = { type: "FETCH", url, method, body, source: "fetch" };
          try {
            pushJson("network", meta);
            gold.networkCalls.add(`${method} ${url}`);
          } catch {}
          return _fetch(input, init).then((res) => {
            try {
              meta.status = res.status;
            } catch {}
            return res;
          });
        };
      }
      const _open = XMLHttpRequest.prototype.open;
      const _send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (method, url) {
        this.__gold_meta = {
          type: "XHR",
          url,
          method: String(method || "GET").toUpperCase(),
          source: "xhr",
        };
        return _open.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function (body) {
        try {
          const m = this.__gold_meta || {};
          m.body = typeof body === "string" ? body.slice(0, 512) : undefined;
          pushJson("network", m);
          gold.networkCalls.add(`${m.method || "GET"} ${m.url}`);
        } catch {}
        return _send.apply(this, arguments);
      };
    } catch {}
  })();

  function locateInSource(text, match) {
    try {
      const idx = text.indexOf(match);
      if (idx === -1) return null;
      const line = text.slice(0, idx).split("\n").length;
      return { line, index: idx };
    } catch {
      return null;
    }
  }

  function pushJson(key, obj) {
    try {
      (jsonFindings[key] || (jsonFindings[key] = [])).push(obj);
    } catch {}
  }

  // --- High-entropy secret detection ---
  function shannonEntropy(str) {
    const len = str.length || 1;
    const freq = {};
    for (let i = 0; i < str.length; i++) freq[str[i]] = (freq[str[i]] || 0) + 1;
    return Object.values(freq).reduce((h, c) => {
      const p = c / len;
      return h - p * Math.log2(p);
    }, 0);
  }

  function decodeJwtPayload(token) {
    try {
      const parts = String(token).split(".");
      if (parts.length < 2) return null;
      const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
      const json = atob(b64 + pad);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function scanForEntropySecrets(text, source) {
    if (typeof text !== "string") return;
    const candidates = text.match(/\b[A-Za-z0-9+\/= _-]{24,}\b/g) || [];
    const hexes = text.match(/\b[0-9a-f]{32,}\b/gi) || [];
    const all = [...new Set([...candidates, ...hexes])].slice(0, 500);
    all.forEach((tok) => {
      const clean = tok.replace(/\s+/g, "");
      const ent = shannonEntropy(clean);
      if (ent >= 3.5) {
        const idx = text.indexOf(tok);
        const loc = locateInSource(text, tok);
        const ctx = text
          .slice(Math.max(0, idx - 60), idx + tok.length + 60)
          .toLowerCase();
        const contextHit =
          /(secret|token|key|bearer|auth|passwd|password|cookie|jwt|cred|aws|sk_|pk_)/i.test(
            ctx
          );
        const confidence = contextHit ? "MEDIUM" : "LOW";
        pushJson("secrets", {
          name: "High-Entropy Candidate",
          confidence,
          entropy: ent.toFixed(2),
          match: clean,
          source,
          line: loc?.line ?? null,
          index: loc?.index ?? null,
          loc: clickableLocation(source, loc?.line ?? null, loc?.index ?? null),
        });
        try {
          gold.secrets.add(
            `[${confidence}] High-Entropy Candidate: '${clean.slice(
              0,
              40
            )}...' (Source: ${source})`
          );
        } catch {}
      }
    });
  }

  // --- Obfuscation patterns and simple decoding ---
  function scanForObfuscation(text, source) {
    if (typeof text !== "string") return;
    const patterns = [
      { name: "Obfuscation Identifier Pattern", rx: /_0x[a-f0-9]{4,}\b/gi },
      {
        name: "String Array Decoder",
        rx: /\bvar\s+_0x[a-f0-9]{4,}\s*=\s*\[[^\]]{100,}\]/gi,
      },
      { name: "Dynamic Function Constructor", rx: /\bnew\s+Function\s*\(/g },
      {
        name: "Atob Decoder Use",
        rx: /\batob\s*\(\s*["'][A-Za-z0-9+/=_-]{16,}["']\s*\)/g,
      },
      {
        name: "SetTimeout/String Eval",
        rx: /\bset(?:Timeout|Interval)\s*\(\s*["'`][^"'`]{10,}["'`]\s*,/g,
      },
    ];
    patterns.forEach(({ name, rx }) => {
      const m = text.match(rx);
      if (m) {
        const unique = [...new Set(m)].slice(0, 20);
        unique.forEach((match) => {
          const loc = locateInSource(text, match);
          pushJson("riskySinks", {
            name,
            match,
            source,
            line: loc?.line ?? null,
            index: loc?.index ?? null,
            loc: clickableLocation(
              source,
              loc?.line ?? null,
              loc?.index ?? null
            ),
          });
          try {
            gold.riskySinks.add(
              `[OBFUSCATION] ${name}: '${String(match).slice(
                0,
                120
              )}' (Source: ${source})`
            );
          } catch {}
        });
      }
    });

    // base64-like inline decoding and re-scan
    const base64s = text.match(/["'`](?:[A-Za-z0-9+/]{24,}={0,2})["'`]/g) || [];
    base64s.slice(0, 50).forEach((q) => {
      const s = q.slice(1, -1);
      try {
        const decoded = atob(s);
        if (decoded && /secret|token|key|auth|jwt/i.test(decoded)) {
          scanForSecrets(decoded, `${source} (decoded)`);
          scanForEntropySecrets(decoded, `${source} (decoded)`);
        }
      } catch {}
    });
  }

  // --- 1. SEARCH FOR SECRETS ---
  console.log("â›ï¸ Digging for potential secrets...");

  // Additional high-value secret patterns (augment without touching original list)
  function scanForExtraSecrets(text, source) {
    if (typeof text !== "string") return;
    const extraPatterns = [
      {
        name: "AWS Secret Access Key",
        pattern:
          /(?:(?:aws_)?secret(?:_access)?_key\s*[:=]\s*["']?)([A-Za-z0-9\/+=]{40})(?:["'])?/i,
        confidence: "HIGH",
      },
      {
        name: "Google API Key",
        pattern: /\bAIza[0-9A-Za-z\-_]{35}\b/,
        confidence: "HIGH",
      },
      {
        name: "Stripe Secret Key",
        pattern: /\bsk_(?:live|test)_[0-9a-zA-Z]{24,}\b/,
        confidence: "HIGH",
      },
      {
        name: "Stripe Publishable Key",
        pattern: /\bpk_(?:live|test)_[0-9a-zA-Z]{24,}\b/,
        confidence: "MEDIUM",
      },
      {
        name: "Slack Webhook URL",
        pattern: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9_\-\/]{20,}/,
        confidence: "HIGH",
      },
      {
        name: "Twilio Account SID",
        pattern: /\bAC[a-f0-9]{32}\b/i,
        confidence: "HIGH",
      },
      {
        name: "Twilio Auth Token",
        pattern:
          /(?:(?:twilio_)?auth[_-]?token\s*[:=]\s*["']?)([a-f0-9]{32})(?:["'])?/i,
        confidence: "HIGH",
      },
      {
        name: "OpenAI API Key",
        pattern: /\bsk-[A-Za-z0-9]{20,}\b/,
        confidence: "HIGH",
      },
      {
        name: "HuggingFace Token",
        pattern: /\bhf_[A-Za-z0-9]{30,}\b/,
        confidence: "MEDIUM",
      },
      {
        name: "PostgreSQL Connection URL",
        pattern: /\bpostgres(?:ql)?:\/\/[^ \n"']{10,}/i,
        confidence: "MEDIUM",
      },
      {
        name: "MongoDB Connection URL",
        pattern: /\bmongodb(?:\+srv)?:\/\/[^ \n"']{10,}/i,
        confidence: "MEDIUM",
      },
      {
        name: "Azure Storage Connection String",
        pattern: /\bDefaultEndpointsProtocol=.+;AccountName=.+;AccountKey=.+;/i,
        confidence: "HIGH",
      },
      {
        name: "Cloudflare API Token",
        pattern:
          /\b(?:(?:CLOUDFLARE|CF)_API[_-]TOKEN\s*[:=]\s*["']?)([A-Za-z0-9_\-]{30,})(?:["'])?/i,
        confidence: "MEDIUM",
      },
    ];
    extraPatterns.forEach(({ name, pattern, confidence }) => {
      const rx = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      let m;
      while ((m = rx.exec(text))) {
        const matched = m[1] || m[0];
        const loc = locateInSource(text, matched);
        try {
          gold.secrets.add(
            `[${confidence}] ${name}: '${matched}' (Source: ${source})`
          );
        } catch {}
        pushJson("secrets", {
          name,
          confidence,
          match: matched,
          source,
          line: loc?.line ?? null,
          index: loc?.index ?? null,
          loc: clickableLocation(
            source,
            loc?.line ?? null,
            loc?.index ?? null
          ),
        });
      }
    });
  }

  // Extra risk patterns to augment risky sink detection
  const EXTRA_RISK_PATTERNS = [
    {
      name: "Cookie Write",
      key: "riskySinks",
      pattern: /\bdocument\.cookie\s*=\s*[^;]+/g,
    },
    {
      name: "URL Navigation",
      key: "riskySinks",
      pattern:
        /\b(?:location\.href|location\.assign|location\.replace)\s*=\s*[^;]+/g,
    },
    {
      name: "LocalStorage Write",
      key: "riskySinks",
      pattern: /\blocalStorage\.(?:setItem|removeItem|clear)\s*\(/g,
    },
    {
      name: "SessionStorage Write",
      key: "riskySinks",
      pattern: /\bsessionStorage\.(?:setItem|removeItem|clear)\s*\(/g,
    },
    {
      name: "Window.postMessage Wildcard",
      key: "riskySinks",
      pattern: /\bpostMessage\s*\([^,]+,\s*["']\*["']\s*\)/g,
    },
    {
      name: "Dynamic Code (Function)",
      key: "riskySinks",
      pattern: /\bFunction\s*\(\s*["'`]/g,
    },
    {
      name: "setTimeout with String",
      key: "riskySinks",
      pattern: /\bsetTimeout\s*\(\s*["'`]/g,
    },
  ];

  const codeRiskPatterns = [
    {
      name: "Dangerous Function",
      key: "riskySinks",
      pattern: /\b(?:eval|execScript|document\.write|document\.writeln)\s*\(/g,
    },
    {
      name: "Dangerous innerHTML",
      key: "riskySinks",
      pattern: /\.innerHTML\s*=\s*[^;]+/g,
    },
    {
      name: "Dangerous outerHTML",
      key: "riskySinks",
      pattern: /\.outerHTML\s*=\s*[^;]+/g,
    },
    {
      name: "Sensitive HTML Comment",
      key: "debugInfo",
      pattern: /<!--\s*(?:secret|password|todo|fixme|debug|remove)[^>]*-->/gi,
    },
    { name: "FIXME Comment", key: "debugInfo", pattern: /\/\/\s*FIXME[:]?/g },
    { name: "TODO Comment", key: "debugInfo", pattern: /\/\/\s*TODO[:]?/g },
    {
      name: "Path Traversal Vector",
      key: "internalPaths",
      pattern: /\.\.\/+|\.\.\/\.\.\//g,
    },
    {
      name: "SSRF Vector Host",
      key: "internalPaths",
      pattern: /\b(?:127\.0\.0\.1|localhost|0\.0\.0\.0|::1)\b/g,
    },
    {
      name: "Inline XSS Payload",
      key: "riskySinks",
      pattern: /<img\s+src=['"][^"']*onerror=['"][^"']*['"]/gi,
    },
  ];

  function scanForCodeRisks(text, source) {
    if (typeof text !== "string") return;
    const patternsToUse = codeRiskPatterns.concat(EXTRA_RISK_PATTERNS || []);
    patternsToUse.forEach(({ name, key, pattern }) => {
      const matches = text.match(pattern);
      if (matches) {
        [...new Set(matches)].forEach((match) => {
          const loc = locateInSource(text, match);
          const msg = `[RISK] ${name}: '${String(match).slice(
            0,
            180
          )}' (Source: ${source})`;
          gold.riskySinks.add(msg);
          pushJson(key, {
            name,
            match: String(match),
            source,
            line: loc?.line ?? null,
            index: loc?.index ?? null,
            loc: clickableLocation(
              source,
              loc?.line ?? null,
              loc?.index ?? null
            ),
          });
        });
      }
    });
  }

  const secretPatterns = [
    // High Confidence
    {
      name: "AWS Access Key ID",
      pattern:
        /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/,
      confidence: "HIGH",
    },
    {
      name: "GitHub Token (Classic)",
      pattern: /\bghp_[a-zA-Z0-9]{36}\b/,
      confidence: "HIGH",
    },
    {
      name: "GitHub Token (Fine-grained)",
      pattern: /\bgithub_pat_[a-zA-Z0-9_]{82}\b/,
      confidence: "HIGH",
    },
    {
      name: "JWT",
      pattern: /\beyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\b/,
      confidence: "HIGH",
    },
    {
      name: "Slack Token",
      pattern:
        /\bxox[baprs]-[a-zA-Z0-9]{10,}-[a-zA-Z0-9]{10,}-[a-zA-Z0-9]{10,}\b/,
      confidence: "HIGH",
    },
    {
      name: "Private Key (PEM)",
      pattern:
        /-----BEGIN\s+(DSA|RSA|EC|OPENSSH|PRIVATE)\s+KEY-----.+?-----END\s+\1\s+KEY-----/gs,
      confidence: "HIGH",
    },
    // Medium Confidence (context-dependent or more generic)
    {
      name: "Generic API Key (Long Hex)",
      pattern: /\b[A-Fa-f0-9]{32}\b/,
      context: ["key", "api", "secret"],
      confidence: "MEDIUM",
    },
    {
      name: "Generic Secret (Key=Value)",
      pattern:
        /\b(key|secret|password|token)\s*[=:]\s*["']?[A-Za-z0-9\-_]{15,}["']?/gi,
      confidence: "MEDIUM",
    },
    {
      name: "Bearer Token",
      pattern:
        /\bBearer\s+[A-Za-z0-9\-_]{20,}\.[A-Za-z0-9\-_]*\.?[A-Za-z0-9\-_]*\b/,
      confidence: "MEDIUM",
    },
  ];

  function scanForSecrets(text, source) {
    if (typeof text !== "string") return;
    secretPatterns.forEach(({ name, pattern, context = [], confidence }) => {
      let shouldScan = true;
      if (context.length > 0) {
        shouldScan = context.some((keyword) =>
          text.toLowerCase().includes(keyword)
        );
      }

      if (shouldScan) {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            const trimmedMatch = match.trim();
            if (
              trimmedMatch.length > 10 ||
              name.includes("Key ID") ||
              name.includes("JWT") ||
              name.includes("Token")
            ) {
              // filter out common non-secret React-like DOM key attributes
              let skip = false;
              if (
                name === "Generic Secret (Key=Value)" &&
                typeof source === "string" &&
                source.includes("DOM Attributes")
              ) {
                const lower = trimmedMatch.toLowerCase();
                if (
                  /^key\s*[=:]/i.test(trimmedMatch) &&
                  !/(api|secret|token)/.test(lower)
                ) {
                  skip = true;
                }
              }
              if (!skip) {
                const rec = `[${confidence}] ${name}: '${trimmedMatch}' (Source: ${source})`;
                const loc = locateInSource(text, trimmedMatch);
                gold.secrets.add(rec);
                pushJson("secrets", {
                  name,
                  confidence,
                  match: trimmedMatch,
                  source,
                  line: loc?.line ?? null,
                  index: loc?.index ?? null,
                  loc: clickableLocation(
                    source,
                    loc?.line ?? null,
                    loc?.index ?? null
                  ),
                });
              }
            }
          });
        }
      }
    });
  }

  // --- 2. SEARCH FOR ENDPOINTS & PATHS ---
  console.log("ðŸ—ºï¸ Mapping potential endpoints and internal paths...");

  const endpointPatterns = [
    {
      name: "API Endpoint",
      pattern:
        /\bhttps?:\/\/[^\s"'<>]+\/(?:api|v\d+|graphql|rest)\b[^\s"'<>]*/gi,
      type: "API",
    },
    {
      name: "Admin Path",
      pattern:
        /\/(admin|adm|administrator|admin-panel|dashboard|control)\/[a-zA-Z0-9\-_\/.]*/gi,
      type: "ADMIN",
    },
    {
      name: "File Upload Endpoint",
      pattern:
        /\/(?:upload|uploads|uploader|file\-upload|api\/upload|media\/upload)(?:\b|\/)[^\s"'<>]*/gi,
      type: "UPLOAD",
    },
    {
      name: "Auth Endpoint",
      pattern:
        /\/(?:login|logout|signin|signup|register|oauth|token|jwt|mfa|reset\-password)\b[^\s"'<>]*/gi,
      type: "AUTH",
    },
    {
      name: "Business Logic Endpoint",
      pattern:
        /\/(?:invoice|payment|order|billing|cart|checkout|refund|subscription|report|admin\/[\w\-\/]+)\b[^\s"'<>]*/gi,
      type: "BIZ",
    },
    {
      name: "Debug Path",
      pattern:
        /\/(debug|_debug|test|tmp|temp|backup|\.git)\/[a-zA-Z0-9\-_\/.]*/gi,
      type: "DEBUG",
    },
    {
      name: "Config File",
      pattern:
        /[a-zA-Z0-9\-_]+\.(?:json|yaml|yml|env|config|conf|ini|properties)[^a-zA-Z0-9]/gi,
      type: "CONFIG_FILE",
    },
    {
      name: "AWS S3 Bucket",
      pattern: /[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]\.s3\.amazonaws\.com/gi,
      type: "AWS",
    },
    {
      name: "AWS S3 Path",
      pattern: /s3:\/\/[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]/gi,
      type: "AWS",
    },
    {
      name: "GCP Storage",
      pattern: /[-\w]+\.storage\.googleapis\.com/gi,
      type: "GCP",
    },
    {
      name: "Azure Blob",
      pattern: /[-\w]+\.blob\.core\.windows\.net/gi,
      type: "AZURE",
    },
  ];

  function scanForEndpoints(text, source) {
    if (typeof text !== "string") return;
    endpointPatterns.forEach(({ name, pattern, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches)];
        uniqueMatches.forEach((match) => {
          const record = `[${type}] ${match} (Source: ${source})`;
          const loc = locateInSource(text, match);
          const meta = {
            type,
            name,
            match,
            source,
            line: loc?.line ?? null,
            index: loc?.index ?? null,
            loc: clickableLocation(
              source,
              loc?.line ?? null,
              loc?.index ?? null
            ),
          };
          switch (type) {
            case "ADMIN":
            case "DEBUG":
            case "CONFIG_FILE":
            case "AWS":
            case "GCP":
            case "AZURE":
              gold.internalPaths.add(record);
              pushJson("internalPaths", meta);
              break;
            case "UPLOAD":
              gold.fileUploads.add(record);
              pushJson("fileUpload", meta);
              break;
            case "AUTH":
              gold.authFindings.add(record);
              pushJson("auth", meta);
              break;
            case "BIZ":
              gold.businessLogic.add(record);
              pushJson("businessLogic", meta);
              break;
            default:
              gold.endpoints.add(record);
              pushJson("apiEndpoints", meta);
          }
        });
      }
    });
  }

  // --- 3. SEARCH FOR DEBUG/INFO & CONFIG ---
  console.log("ðŸ”¦ Illuminating debug info and configuration...");

  const debugPatterns = [
    {
      name: "Debug Flag",
      pattern: /\b(debug|verbose|dev|development)\s*[:=]\s*(true|1|on|yes)\b/gi,
    },
    {
      name: "Internal Host/Service",
      pattern:
        /\b(internal|private|local|localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)\b/gi,
    },
    {
      name: "Version Info",
      pattern:
        /\b(version|ver|build|revision)\s*[:=]\s*["']?[\d.a-zA-Z\-_]+["']?/gi,
    },
    {
      name: "Todo/Fixme Comment",
      pattern: /(?:\/\/|#|\/\*)\s*(todo|fixme|hack|xxx)\s*:?\s*.*/gi,
    },
    {
      name: "Authentication Keywords",
      pattern:
        /\b(auth|authenticate|authorization|bearer|jwt|session|cookie|csrf|xsrf|mfa|otp|sso|saml|oauth|oidc|refresh[_-]?token|access[_-]?token|client[_-]?secret)\b/gi,
    },
    {
      name: "File Upload Keywords",
      pattern:
        /\b(upload|multipart|form-data|file\s*:\s*|content-disposition|filename=)\b/gi,
    },
    {
      name: "User Flow Keywords",
      pattern:
        /\b(user|profile|account|settings|preferences|dashboard|confirm\s*email|verify|forgot\s*password|reset\s*password)\b/gi,
    },
    {
      name: "Business Logic Keywords",
      pattern:
        /\b(order|invoice|payment|checkout|cart|subscription|plan|quota|limit|role|permission|entitlement|feature\s*flag)\b/gi,
    },
    {
      name: "Database Credentials",
      pattern:
        /\b(db|database|mysql|postgres|pg|mssql|mongo|redis|connection\s*string|dsn|jdbc|host|port|username|user|password|passwd|pwd)\s*[:=]\s*[^\s,'"}]+/gi,
    },
  ];

  function scanForDebugInfo(text, source) {
    if (typeof text !== "string") return;
    debugPatterns.forEach(({ name, pattern }) => {
      const matches = text.match(pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches)];
        uniqueMatches.forEach((match) => {
          const msg = `${name}: '${match.trim()}' (Source: ${source})`;
          const loc = locateInSource(text, match);
          const meta = {
            name,
            match: match.trim(),
            source,
            line: loc?.line ?? null,
            index: loc?.index ?? null,
            loc: clickableLocation(
              source,
              loc?.line ?? null,
              loc?.index ?? null
            ),
          };
          if (name.includes("Authentication")) {
            gold.authFindings.add(`[AUTH] ${msg}`);
            pushJson("auth", meta);
          } else if (name.includes("File Upload")) {
            gold.fileUploads.add(`[UPLOAD] ${msg}`);
            pushJson("fileUpload", meta);
          } else if (name.includes("Business Logic")) {
            gold.businessLogic.add(`[BIZ] ${msg}`);
            pushJson("businessLogic", meta);
          } else if (name.includes("User Flow")) {
            gold.userFlows.add(`[USER] ${msg}`);
            pushJson("userFlows", meta);
          } else if (name.includes("Database")) {
            gold.dbCreds.add(`[DB] ${msg}`);
            pushJson("dbCreds", meta);
          } else if (name.includes("Host") || name.includes("Debug")) {
            gold.debugInfo.add(`[POTENTIALLY_SENSITIVE] ${msg}`);
            pushJson("debugInfo", meta);
          } else {
            gold.debugInfo.add(`[INFO] ${msg}`);
            pushJson("debugInfo", meta);
          }
        });
      }
    });
  }

  // --- 4. SEARCH FOR CONFIG OBJECTS ---
  console.log("âš™ï¸ Locating configuration objects...");
  function scanForConfigObjects(text, source) {
    if (typeof text !== "string") return;
    const configAssignments = text.match(
      /\b(?:window\.)?(?:config|settings|env|environment|appConfig|firebase|amplify|supabase|aws|gcp|azure|stripe|paypal|braintree)\s*[=:]\s*{[^}]+}/gi
    );
    if (configAssignments) {
      configAssignments.forEach((match) => {
        gold.configObjects.add(
          `${match.substring(0, 200)}... (Source: ${source})`
        );
      });
    }
  }

  // --- DATA SOURCES TO SCAN ---
  console.log("ðŸ“š Scanning various data sources in memory and DOM...");

  // 1. Global Window Object Properties
  try {
    const windowProps = {};
    Object.getOwnPropertyNames(window).forEach((prop) => {
      try {
        if (typeof window[prop] !== "function" && window[prop] !== window) {
          windowProps[prop] = window[prop];
        }
      } catch (e) {
        windowProps[prop] = `[Inaccessible: ${e.message}]`;
      }
    });
    const seen = new WeakSet();
    const windowPropsStr = JSON.stringify(windowProps, function(key, val) {
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    }, 2);
    scanForSecrets(windowPropsStr, "Window Properties");
    scanForExtraSecrets(windowPropsStr, "Window Properties");
    scanForEntropySecrets(windowPropsStr, "Window Properties");
    scanForObfuscation(windowPropsStr, "Window Properties");
    scanForEndpoints(windowPropsStr, "Window Properties");
    scanForDebugInfo(windowPropsStr, "Window Properties");
    scanForConfigObjects(windowPropsStr, "Window Properties");
  } catch (e) {
    console.warn("Could not scan window properties:", e);
  }

  // 2. Web Storage (LocalStorage/SessionStorage)
  try {
    const storageData = {
      localStorage: {},
      sessionStorage: {},
    };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storageData.localStorage[key] = localStorage.getItem(key);
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      storageData.sessionStorage[key] = sessionStorage.getItem(key);
    }
    const storageStr = JSON.stringify(storageData, null, 2);
    scanForSecrets(storageStr, "Web Storage");
    scanForExtraSecrets(storageStr, "Web Storage");
    scanForEntropySecrets(storageStr, "Web Storage");
    scanForObfuscation(storageStr, "Web Storage");
    scanForEndpoints(storageStr, "Web Storage");
    scanForDebugInfo(storageStr, "Web Storage");
    scanForConfigObjects(storageStr, "Web Storage");
  } catch (e) {
    console.warn("Could not scan web storage:", e);
  }

  // 3. Cookies
  try {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [name, ...val] = cookie.trim().split("=");
      acc[name] = val.join("=");
      return acc;
    }, {});
    const cookiesStr = JSON.stringify(cookies, null, 2);
    scanForSecrets(cookiesStr, "Cookies");
    scanForExtraSecrets(cookiesStr, "Cookies");
    scanForEntropySecrets(cookiesStr, "Cookies");
    scanForObfuscation(cookiesStr, "Cookies");
    scanForEndpoints(cookiesStr, "Cookies");
    scanForDebugInfo(cookiesStr, "Cookies");
  } catch (e) {
    console.warn("Could not scan cookies:", e);
  }

  // 4. DOM Structure (attributes, text content, hidden elements, interactive)
  console.log("ðŸ“„ Excavating the DOM structure...");
  try {
    const allElements = Array.from(document.querySelectorAll("*")).slice(0, _MAX_ELEMENTS);
    let domAttributesStr = "";
    let domTextStr = "";
    for (let i = 0; i < maxEl; i++) {
      const el = allElements[i];
      // Attributes (cap total size)
      if (domAttributesStr.length < 500000) {
        for (let attr of el.attributes) {
          domAttributesStr += attr.name + '="' + attr.value + '" ';
        }
      }
      // Text (limit size to prevent performance issues)
      if (domTextStr.length < 500000) {
        domTextStr += " " + (el.textContent || "");
      }
    }
    // Hidden elements and data-* attributes
    const hiddenSel =
      '[hidden], [type="hidden"], [style*="display:none"], [style*="visibility:hidden"]';
    document.querySelectorAll(hiddenSel).forEach((el, i) => {
      try {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const cls = el.className
        ? `.${String(el.className).split(/\s+/).join(".")}`
        : "";
      const sig = `${tag}${id}${cls}`;
      gold.hiddenElements.add(`HIDDEN ${sig}`);
      const attrs = Array.from(el.attributes || [])
        .map((a) => `${a.name}=${a.value}`)
        .join(" ");
      pushJson("hidden", {
        selector: sig,
        attrs,
        source: "DOM Hidden Elements",
      });
      } catch(e) {}
    });

    // Sensitive hidden inputs
    document.querySelectorAll('input[type="hidden"]').forEach((el) => {
      try {
      const name = (el.getAttribute("name") || "").toLowerCase();
      const val = el.value || "";
      if (
        /secret|token|key|auth|passwd|password|csrf|xsrf/.test(name) &&
        val &&
        val.length > 4
      ) {
        pushJson("hidden", {
          selector: `input[type="hidden"][name="${name}"]`,
          value: val.slice(0, 200),
          source: "DOM Hidden Sensitive",
        });
        try {
          gold.hiddenElements.add(
            `HIDDEN sensitive: ${name}=${val.slice(0, 60)}...`
          );
        } catch {}
        // also treat as potential secret for triage
        scanForSecrets(val, `Hidden Input: ${name}`);
        scanForEntropySecrets(val, `Hidden Input: ${name}`);
      }
      } catch(e) {}
    });

    // Interactive elements (user functionality calling)
    const interactiveSel =
      'a[href], button, input, select, textarea, [role="button"], [onclick], [onchange], [onsubmit], [contenteditable="true"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
      try {
      const tag = el.tagName.toLowerCase();
      const act =
        el.getAttribute("href") ||
        el.getAttribute("action") ||
        el.getAttribute("onclick") ||
        "";
      const label =
        el.getAttribute("aria-label") ||
        el.getAttribute("placeholder") ||
        el.textContent?.trim()?.slice(0, 80) ||
        "";
      const id = el.id ? `#${el.id}` : "";
      const cls = el.className
        ? "." + String(el.className).trim().split(/\s+/).join(".")
        : "";
      const rec = `[UI] ${tag}${id}${cls} ${label} ${act ? "-> " + act : ""}`;
      gold.userFlows.add(rec);
      pushJson("userFlows", {
        type: "UI",
        tag,
        id: el.id || "",
        class: el.className || "",
        label,
        action: act,
        source: "DOM Interactive",
      });
      } catch(e) {}
    });

    scanForSecrets(domAttributesStr, "DOM Attributes");
    scanForExtraSecrets(domAttributesStr, "DOM Attributes");
    scanForEntropySecrets(domAttributesStr, "DOM Attributes");
    scanForObfuscation(domAttributesStr, "DOM Attributes");
    scanForEndpoints(domAttributesStr, "DOM Attributes");
    scanForCodeRisks(domAttributesStr, "DOM Attributes");

    scanForSecrets(domTextStr, "DOM Text Content");
    scanForExtraSecrets(domTextStr, "DOM Text Content");
    scanForEntropySecrets(domTextStr, "DOM Text Content");
    scanForObfuscation(domTextStr, "DOM Text Content");
    scanForEndpoints(domTextStr, "DOM Text Content");
    scanForDebugInfo(domTextStr, "DOM Text Content");
    scanForCodeRisks(domTextStr, "DOM Text Content");
  } catch (e) {
    console.warn("Could not scan DOM structure:", e);
  }

  // 5. Inline & External Scripts and Styles
  console.log("ðŸ“œ Sifting through inline and external scripts/styles...");
  try {
    const allScripts = Array.from(document.querySelectorAll("script")).slice(0, _MAX_SCRIPTS);
    allScripts.forEach((script, index) => {
      try {
      if (script.src) return; // external handled below
      const content = script.textContent;
      if (content) {
        const source = `Inline Script #${index}`;
        registerSource(source, content);
        scanForSecrets(content, source);
        // If JWTs present, decode and attach payload preview
        (
          content.match(
            /\beyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\b/g
          ) || []
        )
          .slice(0, 20)
          .forEach((tok) => {
            const payload = decodeJwtPayload(tok);
            if (payload) {
              const loc = locateInSource(content, tok);
              pushJson("secrets", {
                name: "JWT Payload Preview",
                confidence: "INFO",
                match: tok,
                payload,
                source,
                line: loc?.line ?? null,
                index: loc?.index ?? null,
                loc: clickableLocation(
                  source,
                  loc?.line ?? null,
                  loc?.index ?? null
                ),
              });
            }
          });
        scanForExtraSecrets(content, source);
        scanForEntropySecrets(content, source);
        scanForObfuscation(content, source);
        scanForEndpoints(content, source);
        scanForDebugInfo(content, source);
        scanForConfigObjects(content, source);
        scanForCodeRisks(content, source);
      }
      } catch(e) {}
    });

    // External same-origin scripts: fetch and scan
    const extScripts = Array.from(document.querySelectorAll("script[src]"))
      .map((s, i) => ({ el: s, idx: i, src: s.src }))
      .filter(({ src }) => {
        try {
          const u = new URL(src, location.href);
          return u.origin === location.origin; // same-origin only
        } catch {
          return false;
        }
      });
    extScripts.forEach(({ src, idx }) => {
      try {
        fetch(src)
          .then((r) => r.text())
          .then((content) => {
            const source = `External Script #${idx}: ${src}`;
            registerSource(source, content);
            scanForSecrets(content, source);
            scanForExtraSecrets(content, source);
            scanForEntropySecrets(content, source);
            scanForObfuscation(content, source);
            scanForEndpoints(content, source);
            scanForDebugInfo(content, source);
            scanForConfigObjects(content, source);
            scanForCodeRisks(content, source);
            // record network call for external JS fetch
            const meta = {
              type: "JS",
              url: src,
              source,
            };
            try {
              gold.networkCalls.add(`${src}`);
              pushJson("network", meta);
            } catch {}
          })
          .catch(() => {});
      } catch {}
    });

    const styles = document.querySelectorAll("style");
    styles.forEach((style, index) => {
      try {
      const content = style.textContent;
      if (content) {
        const source = `Inline Style #${index}`;
        scanForEndpoints(content, source);
        scanForDebugInfo(content, source);
      }
      } catch(e) {}
    });
  } catch (e) {
    console.warn("Could not scan scripts/styles:", e);
  }

  // --- OUTPUT RESULTS ---
  console.log("âœ… Treasure hunt complete! Review findings below:");

  if (gold.secrets.size > 0) {
    console.group("ðŸ” POTENTIAL SECRETS FOUND:");
    [...gold.secrets].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.endpoints.size > 0) {
    console.group("ðŸŒ API Endpoints:");
    [...gold.endpoints].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.internalPaths.size > 0) {
    console.group("ðŸ›¡ï¸ Internal/Admin/Infra Paths:");
    [...gold.internalPaths].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.authFindings.size > 0) {
    console.group("ðŸ”‘ Authentication Findings:");
    [...gold.authFindings].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.fileUploads.size > 0) {
    console.group("ðŸ—‚ï¸ File Uploads:");
    [...gold.fileUploads].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.businessLogic.size > 0) {
    console.group("ðŸ­ Business Logic:");
    [...gold.businessLogic].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.userFlows.size > 0) {
    console.group("User Flows:");
    [...gold.userFlows].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.dbCreds.size > 0) {
    console.group("ðŸ’¾ Database Credentials:");
    [...gold.dbCreds].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.debugInfo.size > 0) {
    console.group("ðŸ› Debug/Info:");
    [...gold.debugInfo].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.configObjects.size > 0) {
    console.group("âš™ï¸ Configuration Objects:");
    [...gold.configObjects].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.riskySinks.size > 0) {
    console.group("âš ï¸ Risky Sinks / Vectors:");
    [...gold.riskySinks].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }

  console.groupEnd(); // End main group

  // Return findings object for programmatic access (richer JSON)
  const findings = {
    secrets: [...gold.secrets],
    apiEndpoints: [...gold.endpoints],
    internalPaths: [...gold.internalPaths],
    debugInfo: [...gold.debugInfo],
    configObjects: [...gold.configObjects],
    auth: [...gold.authFindings],
    fileUpload: [...gold.fileUploads],
    businessLogic: [...gold.businessLogic],
    userFlows: [...gold.userFlows],
    dbCreds: [...gold.dbCreds],
    network: [...gold.networkCalls],
    json: jsonFindings,
  };
  try {
    window.GOLD_JSON = findings;
  } catch {}

  // Also log a summary object for easy copying
  console.log("ðŸ“„ Summary Object:", findings);
  console.log("ðŸ“„ JSON Findings:", jsonFindings);
  try {
    window.GOLD_JSON = findings;
  } catch {}

  // Cleanup function to restore prototypes
  try {
    window.GOLD_CLEANUP = function() {
      try { if (window.__origFetch) { window.fetch = window.__origFetch; delete window.__origFetch; } } catch {}
      try { if (window.__origXHROpen) { XMLHttpRequest.prototype.open = window.__origXHROpen; delete window.__origXHROpen; } } catch {}
      try { if (window.__origXHRSend) { XMLHttpRequest.prototype.send = window.__origXHRSend; delete window.__origXHRSend; } } catch {}
      try { if (window.__origAddEventListener) { EventTarget.prototype.addEventListener = window.__origAddEventListener; delete window.__origAddEventListener; } } catch {}
      delete window.__GOLD_PATCHED;
      console.log("GOLD: All patches removed.");
    };
  } catch {}

  // ===========================================
  // ENHANCEMENTS: Additional Security Scanning
  // ===========================================

  // ENHANCEMENT 1: Score findings by risk and confidence
  try {
    window.GOLD.scoreFindings = function scoreFindings() {
      try {
        var scored = [];
        var weights = { CRITICAL: 15, HIGH: 10, MEDIUM: 5, LOW: 2, INFO: 1 };
        ["secrets", "endpoints", "internalPaths", "authFindings", "configObjects", "debugInfo"].forEach(function(cat) {
          var items = findings[cat] || [];
          if (Array.isArray(items)) {
            items.forEach(function(item) {
              try {
                var risk = (item.risk || item.confidence || "INFO").toUpperCase();
                var score = weights[risk] || 1;
                var val = item.match || item.value || item.name || "";
                if (val.length > 20) score += 2;
                scored.push({ category: cat, name: item.name || "unknown", risk: risk, score: score, source: item.source || "unknown", preview: val.substring(0, 30) });
              } catch(e) {}
            });
          }
        });
        scored.sort(function(a, b) { return b.score - a.score; });
        console.log("%c📊 Scored findings: " + scored.length, scored.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #7f8c8d");
        _safeTable(scored.slice(0, 30), 30);
        return scored;
      } catch(e) { console.warn("scoreFindings error:", e); return []; }
    };
  } catch {}

  // ENHANCEMENT 2: Cross-reference secrets with endpoints
  try {
    window.GOLD.crossReference = function crossReference() {
      try {
        var refs = [];
        var secrets = findings.secrets || [];
        var endpoints = findings.endpoints || [];
        secrets.forEach(function(secret) {
          try {
            var secVal = (secret.match || "").toLowerCase();
            endpoints.forEach(function(ep) {
              try {
                var epVal = (ep.match || ep.url || "").toLowerCase();
                if (secVal.length > 5 && epVal.indexOf(secVal.substring(0, 8)) !== -1) {
                  refs.push({ secret: secret.name || "unknown", endpoint: ep.match || ep.url || "unknown", risk: "HIGH", reason: "Secret value appears in endpoint" });
                }
              } catch(e) {}
            });
          } catch(e) {}
        });
        console.log("%c🔗 Cross-references: " + refs.length, refs.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #7f8c8d");
        if (refs.length > 0) _safeTable(refs, 20);
        return refs;
      } catch(e) { console.warn("crossReference error:", e); return []; }
    };
  } catch {}

  // ENHANCEMENT 3: Secret entropy ranking
  try {
    window.GOLD.rankByEntropy = function rankByEntropy() {
      try {
        var tokens = [];
        var all = (findings.secrets || []).concat(findings.configObjects || []);
        all.forEach(function(item) {
          try {
            var val = item.match || item.value || "";
            if (val.length > 8) {
              var freq = {};
              for (var i = 0; i < val.length; i++) { freq[val[i]] = (freq[val[i]] || 0) + 1; }
              var entropy = 0;
              Object.keys(freq).forEach(function(ch) { var p = freq[ch] / val.length; entropy -= p * Math.log2(p); });
              tokens.push({ value: val.substring(0, 12) + "...", length: val.length, entropy: Math.round(entropy * 100) / 100, risk: entropy > 4.5 ? "HIGH" : entropy > 3.5 ? "MEDIUM" : "LOW", source: item.source || "unknown" });
            }
          } catch(e) {}
        });
        tokens.sort(function(a, b) { return b.entropy - a.entropy; });
        console.log("%c🧬 Entropy ranking: " + tokens.length + " tokens", "color: #3498db; font-weight: bold");
        if (tokens.length > 0) _safeTable(tokens.slice(0, 20), 20);
        return tokens;
      } catch(e) { console.warn("rankByEntropy error:", e); return []; }
    };
  } catch {}

  // ENHANCEMENT 4: Domain/IP extraction from all findings
  try {
    window.GOLD.extractDomains = function extractDomains() {
      try {
        var domains = new Set();
        var ips = new Set();
        var allText = JSON.stringify(findings);
        var domainMatches = allText.match(/(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g) || [];
        domainMatches.forEach(function(d) { domains.add(d.replace(/https?:\/\//, "")); });
        var ipMatches = allText.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
        ipMatches.forEach(function(ip) { if (!ip.startsWith("0.") && ip !== "127.0.0.1") ips.add(ip); });
        var result = { domains: Array.from(domains), ips: Array.from(ips) };
        console.log("%c🌐 Domains: " + result.domains.length + ", IPs: " + result.ips.length, "color: #3498db; font-weight: bold");
        if (result.domains.length > 0) _safeTable(result.domains.slice(0, 20).map(function(d) { return { domain: d }; }), 20);
        return result;
      } catch(e) { console.warn("extractDomains error:", e); return { domains: [], ips: [] }; }
    };
  } catch {}

  // ENHANCEMENT 5: Technology fingerprint from secrets and configs
  try {
    window.GOLD.fingerprintTech = function fingerprintTech() {
      try {
        var techs = [];
        var allText = JSON.stringify(findings);
        var patterns = [
          { name: "AWS", pattern: /AKIA[0-9A-Z]{16}/ },
          { name: "Google API", pattern: /AIza[0-9A-Za-z_-]{35}/ },
          { name: "GitHub Token", pattern: /ghp_[0-9a-zA-Z]{36}/ },
          { name: "Stripe", pattern: /sk_live_[0-9a-zA-Z]{24,}/ },
          { name: "Firebase", pattern: /firebaseio\.com/ },
          { name: "Heroku", pattern: /herokuapp\.com/ },
          { name: "Cloudflare", pattern: /cloudflare\.com|cf-ray/i },
          { name: "Vercel", pattern: /vercel\.app|vercel\.dev/ },
          { name: "Netlify", pattern: /netlify\.app|netlify\.com/ },
          { name: "MongoDB", pattern: /mongodb(\+srv)?:\/\// },
          { name: "PostgreSQL", pattern: /postgresql:\/\// },
          { name: "MySQL", pattern: /mysql:\/\// },
          { name: "Redis", pattern: /redis:\/\// },
          { name: "Docker", pattern: /docker\.io|docker\.com/ },
          { name: "Kubernetes", pattern: /kubernetes\.io|kube-/ }
        ];
        patterns.forEach(function(p) {
          try {
            if (p.pattern.test(allText)) techs.push({ technology: p.name, confidence: "FOUND" });
          } catch(e) {}
        });
        console.log("%c🛠 Technology fingerprint: " + techs.length + " detected", "color: #e67e22; font-weight: bold");
        if (techs.length > 0) _safeTable(techs, 20);
        return techs;
      } catch(e) { console.warn("fingerprintTech error:", e); return []; }
    };
  } catch {}

  // ENHANCEMENT 6: JWT deep analysis
  try {
    window.GOLD.analyzeJWTs = function analyzeJWTs() {
      try {
        var jwts = [];
        var allText = JSON.stringify(findings);
        var jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\b/g;
        var matches = allText.match(jwtPattern) || [];
        matches.forEach(function(token) {
          try {
            var parts = token.split(".");
            var header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
            var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            jwts.push({
              algorithm: header.alg || "unknown",
              type: header.typ || "unknown",
              issuer: payload.iss || "unknown",
              subject: payload.sub || "unknown",
              expiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : "unknown",
              risk: header.alg === "none" ? "CRITICAL" : header.alg === "HS256" ? "MEDIUM" : "INFO"
            });
          } catch(e) {}
        });
        console.log("%c🔐 JWT analysis: " + jwts.length + " tokens", jwts.length > 0 ? "color: #e74c3c; font-weight: bold" : "color: #7f8c8d");
        if (jwts.length > 0) _safeTable(jwts, 20);
        return jwts;
      } catch(e) { console.warn("analyzeJWTs error:", e); return []; }
    };
  } catch {}

  // ENHANCEMENT 7: Compliance report (OWASP mapping)
  try {
    window.GOLD.complianceReport = function complianceReport() {
      try {
        var report = [];
        var sc = (findings.secrets || []).length;
        var ec = (findings.endpoints || []).length;
        var dc = (findings.debugInfo || []).length;
        var cc = (findings.configObjects || []).length;
        if (sc > 0) report.push({ owasp: "A07:2021 - Identification and Auth Failures", findings: sc, action: "Rotate secrets, move to server-side" });
        if (ec > 5) report.push({ owasp: "A01:2021 - Broken Access Control", findings: ec, action: "Audit endpoint access controls" });
        if (dc > 0) report.push({ owasp: "A05:2021 - Security Misconfiguration", findings: dc, action: "Disable debug mode in production" });
        if (cc > 3) report.push({ owasp: "A04:2021 - Insecure Design", findings: cc, action: "Review configuration exposure" });
        console.log("%c📋 Compliance: " + report.length + " categories", "color: #3498db; font-weight: bold");
        if (report.length > 0) _safeTable(report, 20);
        return report;
      } catch(e) { console.warn("complianceReport error:", e); return []; }
    };
  } catch {}

  // ENHANCEMENT 8: Risk summary dashboard
  try {
    window.GOLD.riskDashboard = function riskDashboard() {
      try {
        var dash = {
          totalSecrets: (findings.secrets || []).length,
          totalEndpoints: (findings.endpoints || []).length,
          totalInternalPaths: (findings.internalPaths || []).length,
          totalAuthFindings: (findings.authFindings || []).length,
          totalDebugInfo: (findings.debugInfo || []).length,
          totalConfigObjects: (findings.configObjects || []).length,
          totalUserFlows: (findings.userFlows || []).length,
          totalHiddenElements: (findings.hiddenElements || []).size || 0,
          riskScore: 0
        };
        dash.riskScore = (dash.totalSecrets * 10) + (dash.totalAuthFindings * 8) + (dash.totalEndpoints * 3) + (dash.totalDebugInfo * 2);
        dash.riskLevel = dash.riskScore > 50 ? "CRITICAL" : dash.riskScore > 20 ? "HIGH" : dash.riskScore > 5 ? "MEDIUM" : "LOW";
        console.log("%c📊 RISK DASHBOARD", "color: #e74c3c; font-weight: bold; font-size: 14px");
        console.log("%c  Risk Score: " + dash.riskScore + " (" + dash.riskLevel + ")", "color: " + (dash.riskLevel === "CRITICAL" ? "#e74c3c" : dash.riskLevel === "HIGH" ? "#e67e22" : "#f1c40f"));
        _safeTable([dash], 1);
        return dash;
      } catch(e) { console.warn("riskDashboard error:", e); return {}; }
    };
  } catch {}

  // ENHANCEMENT 9: Diff scan (compare with previous run)
  try {
    window.GOLD.diffScan = function diffScan() {
      try {
        var current = JSON.stringify({ secrets: findings.secrets, endpoints: findings.endpoints });
        var prev = window.__GOLD_LAST_SCAN || null;
        window.__GOLD_LAST_SCAN = current;
        if (!prev) { console.log("%c📸 First scan - baseline saved", "color: #3498db"); return { new: 0, removed: 0 }; }
        var old = JSON.parse(prev);
        var newItems = (findings.secrets || []).filter(function(s) { return !(old.secrets || []).some(function(os) { return os.match === s.match && os.source === s.source; }); });
        var removedItems = (old.secrets || []).filter(function(s) { return !(findings.secrets || []).some(function(ns) { return ns.match === s.match && ns.source === s.source; }); });
        var result = { new: newItems.length, removed: removedItems.length };
        console.log("%c📸 Diff: +" + result.new + " new, -" + result.removed + " removed", "color: #e67e22; font-weight: bold");
        return result;
      } catch(e) { console.warn("diffScan error:", e); return { new: 0, removed: 0 }; }
    };
  } catch {}

  // ENHANCEMENT 10: Auto-remediation report
  try {
    window.GOLD.remediationReport = function remediationReport() {
      try {
        var fixes = [];
        (findings.secrets || []).forEach(function(s) {
          fixes.push({ finding: s.name || "Secret", source: s.source || "unknown", action: s.risk === "HIGH" ? "IMMEDIATE: Rotate and move to server-side" : "Review and secure", priority: s.risk === "HIGH" ? "P0" : "P1" });
        });
        (findings.authFindings || []).forEach(function(a) {
          fixes.push({ finding: a.name || "Auth Issue", source: a.source || "unknown", action: "Audit authentication flow", priority: "P1" });
        });
        (findings.debugInfo || []).forEach(function(d) {
          fixes.push({ finding: d.name || "Debug Info", source: d.source || "unknown", action: "Disable debug mode in production", priority: "P1" });
        });
        console.log("%c🔧 Remediation: " + fixes.length + " actions needed", "color: #e67e22; font-weight: bold");
        if (fixes.length > 0) _safeTable(fixes, 30);
        return fixes;
      } catch(e) { console.warn("remediationReport error:", e); return []; }
    };
  } catch {}

  return findings;
})();
