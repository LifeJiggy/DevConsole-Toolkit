/**
 * --- GOLD DIGGER: P1 Disclosure Extractor ---
 * A standalone snippet to find sensitive disclosures in the current page's JS/DOM.
 * Run this directly in the browser console of any target URL.
 */
(function extractP1Gold() {
  console.group("🚨 GOLD DIGGER: P1 Disclosure Extractor");
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
        window.open(url, "_blank");
      } catch {}
    };
  } catch {}

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
        out.push(`${i + 1}${i + 1 === ln ? " ▶" : ""}  ${lines[i]}`);
      }
      console.log(out.join("\n"));
    } catch (e) {
      console.warn("Snippet error:", e);
    }
  }

  try {
    window.GOLD = {
      json: jsonFindings,
      table: (key) => console.table(jsonFindings[key] || []),
      risks: () => console.table(jsonFindings.riskySinks || []),
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
          console.table(results);
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
  console.log("⛏️ Digging for potential secrets...");

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
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const m = String(match);
          const loc = locateInSource(text, m);
          try {
            gold.secrets.add(
              `[${confidence}] ${name}: '${m}' (Source: ${source})`
            );
          } catch {}
          pushJson("secrets", {
            name,
            confidence,
            match: m,
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
  console.log("🗺️ Mapping potential endpoints and internal paths...");

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
  console.log("🔦 Illuminating debug info and configuration...");

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
  console.log("⚙️ Locating configuration objects...");
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
  console.log("📚 Scanning various data sources in memory and DOM...");

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
    const windowPropsStr = JSON.stringify(windowProps, null, 2);
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
  console.log("📄 Excavating the DOM structure...");
  try {
    const allElements = document.querySelectorAll("*");
    let domAttributesStr = "";
    let domTextStr = "";
    allElements.forEach((el) => {
      // Attributes
      for (let attr of el.attributes) {
        domAttributesStr += `${attr.name}="${attr.value}" `;
      }
      // Text (limit size to prevent performance issues)
      if (domTextStr.length < 500000) {
        domTextStr += ` ${el.textContent || ""}`;
      }
    });
    // Hidden elements and data-* attributes
    const hiddenSel =
      '[hidden], [type="hidden"], [style*="display:none"], [style*="visibility:hidden"]';
    document.querySelectorAll(hiddenSel).forEach((el, i) => {
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
    });

    // Sensitive hidden inputs
    document.querySelectorAll('input[type="hidden"]').forEach((el) => {
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
    });

    // Interactive elements (user functionality calling)
    const interactiveSel =
      'a[href], button, input, select, textarea, [role="button"], [onclick], [onchange], [onsubmit], [contenteditable="true"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
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
  console.log("📜 Sifting through inline and external scripts/styles...");
  try {
    const allScripts = document.querySelectorAll("script");
    allScripts.forEach((script, index) => {
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
      const content = style.textContent;
      if (content) {
        const source = `Inline Style #${index}`;
        scanForEndpoints(content, source);
        scanForDebugInfo(content, source);
      }
    });
  } catch (e) {
    console.warn("Could not scan scripts/styles:", e);
  }

  // --- OUTPUT RESULTS ---
  console.log("✅ Treasure hunt complete! Review findings below:");

  if (gold.secrets.size > 0) {
    console.group("🔐 POTENTIAL SECRETS FOUND:");
    [...gold.secrets].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.endpoints.size > 0) {
    console.group("🌐 API Endpoints:");
    [...gold.endpoints].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.internalPaths.size > 0) {
    console.group("🛡️ Internal/Admin/Infra Paths:");
    [...gold.internalPaths].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.authFindings.size > 0) {
    console.group("🔑 Authentication Findings:");
    [...gold.authFindings].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.fileUploads.size > 0) {
    console.group("🗂️ File Uploads:");
    [...gold.fileUploads].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.businessLogic.size > 0) {
    console.group("🏭 Business Logic:");
    [...gold.businessLogic].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.userFlows.size > 0) {
    console.group("� User Flows:");
    [...gold.userFlows].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.dbCreds.size > 0) {
    console.group("💾 Database Credentials:");
    [...gold.dbCreds].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.debugInfo.size > 0) {
    console.group("🐛 Debug/Info:");
    [...gold.debugInfo].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.configObjects.size > 0) {
    console.group("⚙️ Configuration Objects:");
    [...gold.configObjects].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.riskySinks.size > 0) {
    console.group("⚠️ Risky Sinks / Vectors:");
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
  console.log("📄 Summary Object:", findings);
  console.log("📄 JSON Findings:", jsonFindings);
  try {
    window.GOLD_JSON = findings;
  } catch {}

  return findings;
})();
/**
 * --- GOLD DIGGER: P1 Disclosure Extractor ---
 * A standalone snippet to find sensitive disclosures in the current page's JS/DOM.
 * Run this directly in the browser console of any target URL.
 */
(function extractP1Gold() {
  console.group("🚨 GOLD DIGGER: P1 Disclosure Extractor");
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
        window.open(url, "_blank");
      } catch {}
    };
  } catch {}

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
        out.push(`${i + 1}${i + 1 === ln ? " ▶" : ""}  ${lines[i]}`);
      }
      console.log(out.join("\n"));
    } catch (e) {
      console.warn("Snippet error:", e);
    }
  }

  try {
    window.GOLD = {
      json: jsonFindings,
      table: (key) => console.table(jsonFindings[key] || []),
      risks: () => console.table(jsonFindings.riskySinks || []),
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
          console.table(results);
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

  // --- 1. SEARCH FOR SECRETS ---
  console.log("⛏️ Digging for potential secrets...");

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
    codeRiskPatterns.forEach(({ name, key, pattern }) => {
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
                gold.secrets.add(rec);
                pushJson("secrets", {
                  name,
                  confidence,
                  match: trimmedMatch,
                  source,
                });
              }
            }
          });
        }
      }
    });
  }

  // --- 2. SEARCH FOR ENDPOINTS & PATHS ---
  console.log("🗺️ Mapping potential endpoints and internal paths...");

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
            match,
            source,
            line: loc?.line ?? null,
            index: loc?.index ?? null,
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
  console.log("🔦 Illuminating debug info and configuration...");

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
  console.log("⚙️ Locating configuration objects...");
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
  console.log("📚 Scanning various data sources in memory and DOM...");

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
    const windowPropsStr = JSON.stringify(windowProps, null, 2);
    scanForSecrets(windowPropsStr, "Window Properties");
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
    scanForEndpoints(cookiesStr, "Cookies");
    scanForDebugInfo(cookiesStr, "Cookies");
  } catch (e) {
    console.warn("Could not scan cookies:", e);
  }

  // 4. DOM Structure (attributes, text content, hidden elements, interactive)
  console.log("📄 Excavating the DOM structure...");
  try {
    const allElements = document.querySelectorAll("*");
    let domAttributesStr = "";
    let domTextStr = "";
    allElements.forEach((el) => {
      // Attributes
      for (let attr of el.attributes) {
        domAttributesStr += `${attr.name}="${attr.value}" `;
      }
      // Text (limit size to prevent performance issues)
      if (domTextStr.length < 500000) {
        domTextStr += ` ${el.textContent || ""}`;
      }
    });
    // Hidden elements and data-* attributes
    const hiddenSel =
      '[hidden], [type="hidden"], [style*="display:none"], [style*="visibility:hidden"]';
    document.querySelectorAll(hiddenSel).forEach((el, i) => {
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
    });
    // Interactive elements (user functionality calling)
    const interactiveSel =
      'a[href], button, input, select, textarea, datalist, progress, legend, option, [role="button"], [onclick], [onchange], [onsubmit], [onreset], [onkeyup], [oninput], [contenteditable="true"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const act =
        el.getAttribute("href") ||
        el.getAttribute("action") ||
        el.getAttribute("onclick") ||
        el.getAttribute("onchange") ||
        el.getAttribute("onsubmit") ||
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
    });

    scanForSecrets(domAttributesStr, "DOM Attributes");
    scanForEndpoints(domAttributesStr, "DOM Attributes");
    scanForCodeRisks(domAttributesStr, "DOM Attributes");
    scanForSecrets(domTextStr, "DOM Text Content");
    scanForEndpoints(domTextStr, "DOM Text Content");
    scanForDebugInfo(domTextStr, "DOM Text Content");
    scanForCodeRisks(domTextStr, "DOM Text Content");
  } catch (e) {
    console.warn("Could not scan DOM structure:", e);
  }

  // 5. Inline & External Scripts and Styles — Enhanced full JS coverage
  console.log(
    "📜 Sifting through inline and external scripts/styles (enhanced)..."
  );
  try {
    // --- helpers for extended coverage ---
    const scannedUrlsPlus = new Set();
    // Coverage counters attached later to gold.__stats for summary
    const counters = {
      scriptUrlsObserved: 0,
      sameOriginFetched: 0,
      inlineHandlers: 0,
      globalFunctions: 0,
      iframesScanned: 0,
      workersSeen: 0,
      sharedWorkersSeen: 0,
      serviceWorkersSeen: 0,
    };
    function sameOriginPlus(u, base) {
      try {
        const url = new URL(u, base || location.href);
        return url.origin === (base ? new URL(base).origin : location.origin);
      } catch {
        return false;
      }
    }
    function recordScriptUrlPlus(url, note) {
      try {
        counters.scriptUrlsObserved++;
        gold.endpoints.add(`[API] ${url} (Source: ${note || "resource"})`);
        pushJson("apiEndpoints", {
          name: "URL",
          type: "URL",
          match: url,
          source: note || "resource",
          line: null,
          index: null,
          loc: clickableLocation(note || "resource", null, null),
        });
      } catch {}
    }
    function tryFetchIfSameOriginPlus(url, label) {
      try {
        if (!url || scannedUrlsPlus.has(url)) return;
        scannedUrlsPlus.add(url);
        if (!sameOriginPlus(url)) {
          return;
        }
        return fetch(url)
          .then((r) => r.text())
          .then((content) => {
            counters.sameOriginFetched++;
            const source = `${label}`;
            registerSource(source, content);
            // full content scan using existing scanners
            scanForSecrets(content, source);
            try {
              scanForExtraSecrets?.(content, source);
            } catch {}
            scanForEntropySecrets(content, source);
            scanForObfuscation(content, source);
            scanForEndpoints(content, source);
            scanForDebugInfo(content, source);
            scanForConfigObjects(content, source);
            scanForCodeRisks(content, source);
            // record network
            const meta = { type: "JS", url, source };
            try {
              gold.networkCalls.add(`${url}`);
              pushJson("network", meta);
            } catch {}
          })
          .catch(() => {});
      } catch {}
    }

    const inlineEventAttrsPlus = [
      "onclick",
      "onchange",
      "oninput",
      "onfocus",
      "onblur",
      "onsubmit",
      "onload",
      "onerror",
      "onmouseover",
      "onmouseout",
      "onkeydown",
      "onkeyup",
      "onkeypress",
    ];
    function scanInlineHandlersPlus(doc, label) {
      try {
        inlineEventAttrsPlus.forEach((attr) => {
          doc.querySelectorAll(`[${attr}]`).forEach((el) => {
            const code = el.getAttribute(attr) || "";
            const sig = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "");
            try {
              gold.userFlows.add(
                `[INLINE] ${sig} ${attr} -> ${code.slice(0, 80)}`
              );
              pushJson("userFlows", {
                type: "INLINE",
                event: attr,
                target: sig,
                handler: code.slice(0, 200),
                source: label,
              });
            } catch {}
            // scan inline handler code body as JS source
            scanForSecrets(code, `${label} ${attr} handler on ${sig}`);
            try {
              scanForExtraSecrets?.(code, `${label} ${attr} handler on ${sig}`);
            } catch {}
            scanForEntropySecrets(code, `${label} ${attr} handler on ${sig}`);
            scanForObfuscation(code, `${label} ${attr} handler on ${sig}`);
            scanForEndpoints(code, `${label} ${attr} handler on ${sig}`);
          });
        });
      } catch {}
    }

    function scanGlobalFunctionsPlus(win, label) {
      const seen = new WeakSet();
      const MAX_FUNCS = 500;
      let count = 0;
      try {
        const keys = Object.getOwnPropertyNames(win);
        for (const k of keys) {
          if (count >= MAX_FUNCS) break;
          let v;
          try {
            v = win[k];
          } catch {
            continue;
          }
          if (typeof v === "function" && !seen.has(v)) {
            seen.add(v);
            count++;
            let src = "";
            try {
              src = Function.prototype.toString.call(v);
            } catch {
              src = "";
            }
            if (src && src.length > 20 && !/\[native code\]/.test(src)) {
              const source = `${label} window.${k} (fn source)`;
              registerSource(source, src);
              scanForSecrets(src, source);
              try {
                scanForExtraSecrets?.(src, source);
              } catch {}
              scanForEntropySecrets(src, source);
              scanForObfuscation(src, source);
              scanForEndpoints(src, source);
              scanForDebugInfo(src, source);
              scanForConfigObjects(src, source);
              scanForCodeRisks(src, source);
            }
          }
        }
      } catch {}
    }

    function scanServiceWorkersPlus() {
      try {
        if (!("serviceWorker" in navigator)) return;
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => {
            regs.forEach((reg) => {
              const url =
                reg?.active?.scriptURL ||
                reg?.installing?.scriptURL ||
                reg?.waiting?.scriptURL;
              if (!url) return;
              recordScriptUrlPlus(url, "ServiceWorker");
              tryFetchIfSameOriginPlus(url, `ServiceWorker: ${url}`);
            });
          })
          .catch(() => {});
      } catch {}
    }

    function scanDocumentPlus(doc, label) {
      try {
        // Inline scripts
        const inline = doc.querySelectorAll("script:not([src])");
        inline.forEach((s, idx) => {
          const content = s.textContent || "";
          if (!content) return;
          const source = `${label} Inline Script #${idx}`;
          registerSource(source, content);
          scanForSecrets(content, source);
          try {
            scanForExtraSecrets?.(content, source);
          } catch {}
          scanForEntropySecrets(content, source);
          scanForObfuscation(content, source);
          scanForEndpoints(content, source);
          scanForDebugInfo(content, source);
          scanForConfigObjects(content, source);
          scanForCodeRisks(content, source);
        });

        // External scripts
        const ext = Array.from(doc.querySelectorAll("script[src]")).map(
          (s, i) => ({ src: s.src, idx: i })
        );
        ext.forEach(({ src, idx }) => {
          recordScriptUrlPlus(src, `${label} DOM`);
          tryFetchIfSameOriginPlus(
            src,
            `${label} External Script #${idx}: ${src}`
          );
        });

        // Styles (URLs inside CSS)
        doc.querySelectorAll("style").forEach((st, i) => {
          const css = st.textContent || "";
          if (css) {
            scanForEndpoints(css, `${label} Inline Style #${i}`);
            scanForDebugInfo(css, `${label} Inline Style #${i}`);
          }
        });

        // Map inline DOM event handlers
        scanInlineHandlersPlus(doc, label);
      } catch (e) {
        console.warn("scanDocumentPlus error", e);
      }
    }

    function scanIframesPlus(rootDoc) {
      try {
        const iframes = Array.from(rootDoc.querySelectorAll("iframe"));
        iframes.forEach((ifr, i) => {
          const src = ifr.getAttribute("src") || "";
          if (src) recordScriptUrlPlus(src, "iframe");
          try {
            const w = ifr.contentWindow;
            if (!w) return;
            void w.location.href; // provoke security error if cross-origin
            scanDocumentPlus(w.document, `Iframe#${i}`);
            scanGlobalFunctionsPlus(w, `Iframe#${i}`);
          } catch {
            /* cross-origin */
          }
        });
      } catch {}
    }

    // Workers hooks (capture URLs)
    try {
      const _Worker = window.Worker;
      if (typeof _Worker === "function") {
        window.Worker = function (url, opts) {
          try {
            const u = String(url);
            recordScriptUrlPlus(u, "Worker");
            tryFetchIfSameOriginPlus(u, `Worker Script: ${u}`);
          } catch {}
          return new _Worker(url, opts);
        };
      }
      const _SharedWorker = window.SharedWorker;
      if (typeof _SharedWorker === "function") {
        window.SharedWorker = function (url, opts) {
          try {
            const u = String(url);
            recordScriptUrlPlus(u, "SharedWorker");
            tryFetchIfSameOriginPlus(u, `SharedWorker Script: ${u}`);
          } catch {}
          return new _SharedWorker(url, opts);
        };
      }
    } catch {}

    // Capture dynamically set <script src>
    try {
      const ScriptProto = HTMLScriptElement.prototype;
      const _setSrc = Object.getOwnPropertyDescriptor(ScriptProto, "src")?.set;
      if (_setSrc) {
        Object.defineProperty(ScriptProto, "src", {
          set(value) {
            try {
              const v = String(value);
              recordScriptUrlPlus(v, "Dynamic <script>");
              tryFetchIfSameOriginPlus(v, `Dynamic Script: ${v}`);
            } catch {}
            return _setSrc.call(this, value);
          },
        });
      }
    } catch {}

    // PerformanceObserver to catch late-loaded scripts
    try {
      if ("PerformanceObserver" in window) {
        const po = new PerformanceObserver((list) => {
          list.getEntries().forEach((e) => {
            if (
              e.initiatorType === "script" ||
              e.initiatorType === "importscript" ||
              e.initiatorType === "link"
            ) {
              const url = e.name;
              recordScriptUrlPlus(url, `Perf:${e.initiatorType}`);
              tryFetchIfSameOriginPlus(url, `Observed Script: ${url}`);
            }
          });
        });
        po.observe({ type: "resource", buffered: true });
      }
    } catch {}

    // Kick off extended scanning for main doc + iframes + workers + SW + globals
    scanDocumentPlus(document, "Main");
    scanGlobalFunctionsPlus(window, "Main");
    scanIframesPlus(document);
    scanServiceWorkersPlus();
  } catch (e) {
    console.warn("Could not scan scripts/styles (enhanced):", e);
  }

  // --- OUTPUT RESULTS ---
  console.log("✅ Treasure hunt complete! Review findings below:");

  if (gold.secrets.size > 0) {
    console.group("🔐 POTENTIAL SECRETS FOUND:");
    [...gold.secrets].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.endpoints.size > 0) {
    console.group("🌐 API Endpoints:");
    [...gold.endpoints].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.internalPaths.size > 0) {
    console.group("🛡️ Internal/Admin/Infra Paths:");
    [...gold.internalPaths].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.authFindings.size > 0) {
    console.group("🔑 Authentication Findings:");
    [...gold.authFindings].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.fileUploads.size > 0) {
    console.group("🗂️ File Uploads:");
    [...gold.fileUploads].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.businessLogic.size > 0) {
    console.group("🏭 Business Logic:");
    [...gold.businessLogic].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.userFlows.size > 0) {
    console.group("� User Flows:");
    [...gold.userFlows].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.dbCreds.size > 0) {
    console.group("💾 Database Credentials:");
    [...gold.dbCreds].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.debugInfo.size > 0) {
    console.group("🐛 Debug/Info:");
    [...gold.debugInfo].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.configObjects.size > 0) {
    console.group("⚙️ Configuration Objects:");
    [...gold.configObjects].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.riskySinks.size > 0) {
    console.group("⚠️ Risky Sinks / Vectors:");
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
  console.log("📄 Summary Object:", findings);
  console.log("📄 JSON Findings:", jsonFindings);
  try {
    window.GOLD_JSON = findings;
  } catch {}

  return findings;
})();
/**
 * --- GOLD DIGGER: P1 Disclosure Extractor ---
 * A standalone snippet to find sensitive disclosures in the current page's JS/DOM.
 * Run this directly in the browser console of any target URL.
 */
(function extractP1Gold() {
  console.group("🚨 GOLD DIGGER: P1 Disclosure Extractor");
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
        window.open(url, "_blank");
      } catch {}
    };
  } catch {}

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
        out.push(`${i + 1}${i + 1 === ln ? " ▶" : ""}  ${lines[i]}`);
      }
      console.log(out.join("\n"));
    } catch (e) {
      console.warn("Snippet error:", e);
    }
  }

  try {
    window.GOLD = {
      json: jsonFindings,
      table: (key) => console.table(jsonFindings[key] || []),
      risks: () => console.table(jsonFindings.riskySinks || []),
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
          console.table(results);
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
  console.log("⛏️ Digging for potential secrets...");

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
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const m = String(match);
          const loc = locateInSource(text, m);
          try {
            gold.secrets.add(
              `[${confidence}] ${name}: '${m}' (Source: ${source})`
            );
          } catch {}
          pushJson("secrets", {
            name,
            confidence,
            match: m,
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
  console.log("🗺️ Mapping potential endpoints and internal paths...");

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
  console.log("🔦 Illuminating debug info and configuration...");

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
  console.log("⚙️ Locating configuration objects...");
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
  console.log("📚 Scanning various data sources in memory and DOM...");

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
    const windowPropsStr = JSON.stringify(windowProps, null, 2);
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
  console.log("📄 Excavating the DOM structure...");
  try {
    const allElements = document.querySelectorAll("*");
    let domAttributesStr = "";
    let domTextStr = "";
    allElements.forEach((el) => {
      // Attributes
      for (let attr of el.attributes) {
        domAttributesStr += `${attr.name}="${attr.value}" `;
      }
      // Text (limit size to prevent performance issues)
      if (domTextStr.length < 500000) {
        domTextStr += ` ${el.textContent || ""}`;
      }
    });
    // Hidden elements and data-* attributes
    const hiddenSel =
      '[hidden], [type="hidden"], [style*="display:none"], [style*="visibility:hidden"]';
    document.querySelectorAll(hiddenSel).forEach((el, i) => {
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
    });

    // Sensitive hidden inputs
    document.querySelectorAll('input[type="hidden"]').forEach((el) => {
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
    });

    // Interactive elements (user functionality calling)
    const interactiveSel =
      'a[href], button, input, select, textarea, [role="button"], [onclick], [onchange], [onsubmit], [contenteditable="true"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
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
  console.log("📜 Sifting through inline and external scripts/styles...");
  try {
    const allScripts = document.querySelectorAll("script");
    allScripts.forEach((script, index) => {
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
      const content = style.textContent;
      if (content) {
        const source = `Inline Style #${index}`;
        scanForEndpoints(content, source);
        scanForDebugInfo(content, source);
      }
    });
  } catch (e) {
    console.warn("Could not scan scripts/styles:", e);
  }

  // --- OUTPUT RESULTS ---
  console.log("✅ Treasure hunt complete! Review findings below:");

  if (gold.secrets.size > 0) {
    console.group("🔐 POTENTIAL SECRETS FOUND:");
    [...gold.secrets].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.endpoints.size > 0) {
    console.group("🌐 API Endpoints:");
    [...gold.endpoints].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.internalPaths.size > 0) {
    console.group("🛡️ Internal/Admin/Infra Paths:");
    [...gold.internalPaths].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.authFindings.size > 0) {
    console.group("🔑 Authentication Findings:");
    [...gold.authFindings].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.fileUploads.size > 0) {
    console.group("🗂️ File Uploads:");
    [...gold.fileUploads].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.businessLogic.size > 0) {
    console.group("🏭 Business Logic:");
    [...gold.businessLogic].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.userFlows.size > 0) {
    console.group("� User Flows:");
    [...gold.userFlows].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.dbCreds.size > 0) {
    console.group("💾 Database Credentials:");
    [...gold.dbCreds].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.debugInfo.size > 0) {
    console.group("🐛 Debug/Info:");
    [...gold.debugInfo].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.configObjects.size > 0) {
    console.group("⚙️ Configuration Objects:");
    [...gold.configObjects].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.riskySinks.size > 0) {
    console.group("⚠️ Risky Sinks / Vectors:");
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
  console.log("📄 Summary Object:", findings);
  console.log("📄 JSON Findings:", jsonFindings);
  try {
    window.GOLD_JSON = findings;
  } catch {}

  return findings;
})();
/**
 * --- GOLD DIGGER: P1 Disclosure Extractor ---
 * A standalone snippet to find sensitive disclosures in the current page's JS/DOM.
 * Run this directly in the browser console of any target URL.
 */
(function extractP1Gold() {
  console.group("🚨 GOLD DIGGER: P1 Disclosure Extractor");
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
        window.open(url, "_blank");
      } catch {}
    };
  } catch {}

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
        out.push(`${i + 1}${i + 1 === ln ? " ▶" : ""}  ${lines[i]}`);
      }
      console.log(out.join("\n"));
    } catch (e) {
      console.warn("Snippet error:", e);
    }
  }

  try {
    window.GOLD = {
      json: jsonFindings,
      table: (key) => console.table(jsonFindings[key] || []),
      risks: () => console.table(jsonFindings.riskySinks || []),
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
          console.table(results);
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

  // --- 1. SEARCH FOR SECRETS ---
  console.log("⛏️ Digging for potential secrets...");

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
    codeRiskPatterns.forEach(({ name, key, pattern }) => {
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
                gold.secrets.add(rec);
                pushJson("secrets", {
                  name,
                  confidence,
                  match: trimmedMatch,
                  source,
                });
              }
            }
          });
        }
      }
    });
  }

  // --- 2. SEARCH FOR ENDPOINTS & PATHS ---
  console.log("🗺️ Mapping potential endpoints and internal paths...");

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
            match,
            source,
            line: loc?.line ?? null,
            index: loc?.index ?? null,
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
  console.log("🔦 Illuminating debug info and configuration...");

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
  console.log("⚙️ Locating configuration objects...");
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
  console.log("📚 Scanning various data sources in memory and DOM...");

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
    const windowPropsStr = JSON.stringify(windowProps, null, 2);
    scanForSecrets(windowPropsStr, "Window Properties");
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
    scanForEndpoints(cookiesStr, "Cookies");
    scanForDebugInfo(cookiesStr, "Cookies");
  } catch (e) {
    console.warn("Could not scan cookies:", e);
  }

  // 4. DOM Structure (attributes, text content, hidden elements, interactive)
  console.log("📄 Excavating the DOM structure...");
  try {
    const allElements = document.querySelectorAll("*");
    let domAttributesStr = "";
    let domTextStr = "";
    allElements.forEach((el) => {
      // Attributes
      for (let attr of el.attributes) {
        domAttributesStr += `${attr.name}="${attr.value}" `;
      }
      // Text (limit size to prevent performance issues)
      if (domTextStr.length < 500000) {
        domTextStr += ` ${el.textContent || ""}`;
      }
    });
    // Hidden elements and data-* attributes
    const hiddenSel =
      '[hidden], [type="hidden"], [style*="display:none"], [style*="visibility:hidden"]';
    document.querySelectorAll(hiddenSel).forEach((el, i) => {
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
    });
    // Interactive elements (user functionality calling)
    const interactiveSel =
      'a[href], button, input, select, textarea, datalist, progress, legend, option, [role="button"], [onclick], [onchange], [onsubmit], [onreset], [onkeyup], [oninput], [contenteditable="true"]';
    document.querySelectorAll(interactiveSel).forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const act =
        el.getAttribute("href") ||
        el.getAttribute("action") ||
        el.getAttribute("onclick") ||
        el.getAttribute("onchange") ||
        el.getAttribute("onsubmit") ||
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
    });

    scanForSecrets(domAttributesStr, "DOM Attributes");
    scanForEndpoints(domAttributesStr, "DOM Attributes");
    scanForCodeRisks(domAttributesStr, "DOM Attributes");
    scanForSecrets(domTextStr, "DOM Text Content");
    scanForEndpoints(domTextStr, "DOM Text Content");
    scanForDebugInfo(domTextStr, "DOM Text Content");
    scanForCodeRisks(domTextStr, "DOM Text Content");
  } catch (e) {
    console.warn("Could not scan DOM structure:", e);
  }

  // 5. Inline & External Scripts and Styles
  console.log("📜 Sifting through inline and external scripts/styles...");
  try {
    const allScripts = document.querySelectorAll("script");
    allScripts.forEach((script, index) => {
      if (script.src) return; // external handled below
      const content = script.textContent;
      if (content) {
        const source = `Inline Script #${index}`;
        registerSource(source, content);
        scanForSecrets(content, source);
        scanForEndpoints(content, source);
        scanForDebugInfo(content, source);
        scanForConfigObjects(content, source);
        scanForCodeRisks(content, source);
      }
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
      const content = style.textContent;
      if (content) {
        const source = `Inline Style #${index}`;
        scanForEndpoints(content, source);
        scanForDebugInfo(content, source);
      }
    });
  } catch (e) {
    console.warn("Could not scan scripts/styles:", e);
  }

  // --- OUTPUT RESULTS ---
  console.log("✅ Treasure hunt complete! Review findings below:");

  if (gold.secrets.size > 0) {
    console.group("🔐 POTENTIAL SECRETS FOUND:");
    [...gold.secrets].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.endpoints.size > 0) {
    console.group("🌐 API Endpoints:");
    [...gold.endpoints].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.internalPaths.size > 0) {
    console.group("🛡️ Internal/Admin/Infra Paths:");
    [...gold.internalPaths].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.authFindings.size > 0) {
    console.group("🔑 Authentication Findings:");
    [...gold.authFindings].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.fileUploads.size > 0) {
    console.group("🗂️ File Uploads:");
    [...gold.fileUploads].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.businessLogic.size > 0) {
    console.group("🏭 Business Logic:");
    [...gold.businessLogic].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.userFlows.size > 0) {
    console.group("� User Flows:");
    [...gold.userFlows].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.dbCreds.size > 0) {
    console.group("💾 Database Credentials:");
    [...gold.dbCreds].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.debugInfo.size > 0) {
    console.group("🐛 Debug/Info:");
    [...gold.debugInfo].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.configObjects.size > 0) {
    console.group("⚙️ Configuration Objects:");
    [...gold.configObjects].forEach((f) => console.warn(`- ${f}`));
    console.groupEnd();
  }
  if (gold.riskySinks.size > 0) {
    console.group("⚠️ Risky Sinks / Vectors:");
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
  console.log("📄 Summary Object:", findings);
  console.log("📄 JSON Findings:", jsonFindings);
  try {
    window.GOLD_JSON = findings;
  } catch {}

  return findings;
})();
