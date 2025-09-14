// ===========================================
// 💎 JAVASCRIPT DISCLOSURE & SECRET EXTRACTOR
// ===========================================
// Autor: ArkhAngelLifeJiggy
// P1 Bug Bounty Hunter Tool
// Extract Hidden Gold from JavaScript
// ===========================================

(function () {
  "use strict";

  // Global storage for extracted secrets
  window.jsDisclosureHunter = {
    secrets: {},
    endpoints: [],
    apiKeys: [],
    credentials: [],
    configurations: {},
    listeners: [],
    mapping: {},
    advancedFlags: [],
    networkLogs: [],
    config: {
      enableOverlay: false,
      enableRuntimeInterception: true,
      categories: {
        thirdParty: true,
        analytics: true,
        advancedFlags: true,
      },
    },
    export: function () {
      try {
        const payload = {
          timestamp: new Date().toISOString(),
          url: window.location.href,
          secrets: {
            apiKeys: this.apiKeys,
            endpoints: this.endpoints,
            credentials: this.credentials,
            configurations: this.configurations,
            listeners: this.listeners,
            mapping: this.mapping,
            advancedFlags: this.advancedFlags,
          },
          networkLogs: this.networkLogs,
        };
        const json = JSON.stringify(payload, null, 2);
        console.log(
          "%c📦 Export JSON copied to clipboard (if permitted).",
          styles.gold
        );
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(json).catch(() => {});
        }
        return json;
      } catch (e) {
        console.warn("Export failed:", e);
        return "{}";
      }
    },
  };

  // P1 Hunter styling 💎
  const styles = {
    p1: "background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3); color: white; padding: 15px 30px; font-size: 20px; font-weight: bold; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);",
    gold: "color: #fff; background: #f39c12; padding: 8px 16px; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);",
    secret:
      "color: #fff; background: #e74c3c; padding: 8px 16px; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);",
    endpoint:
      "color: #fff; background: #9b59b6; padding: 8px 16px; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 8px rgba(155, 89, 182, 0.3);",
    key: "color: #fff; background: #e67e22; padding: 8px 16px; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 8px rgba(230, 126, 34, 0.3);",
    config:
      "color: #fff; background: #2ecc71; padding: 8px 16px; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);",
    info: "color: #3498db; font-weight: bold;",
    warning: "color: #f39c12; font-weight: bold;",
  };

  // ===========================================
  // 🎯 MAIN EXTRACTION FUNCTION
  // ===========================================

  function extractJSSecrets() {
    console.log("%c💎 JAVASCRIPT DISCLOSURE & SECRET EXTRACTOR", styles.p1);
    console.log(
      "%c🔍 Hunting for P1 disclosures in JavaScript...",
      styles.gold
    );

    // Initialize runtime interception if enabled
    try {
      if (
        window.jsDisclosureHunter &&
        window.jsDisclosureHunter.config &&
        window.jsDisclosureHunter.config.enableRuntimeInterception
      ) {
        setupRuntimeInterception();
      }
    } catch (e) {}

    // Ethical usage reminder (shown once per session)
    try {
      showEthicalReminderOnce();
    } catch (e) {}

    const extraction = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      secrets: {},
      totalFindings: 0,
    };

    console.log("%c1/6 - 🔑 Extracting API Keys & Tokens...", styles.info);
    extraction.secrets.apiKeys = extractAPIKeys();

    console.log("%c2/6 - 🌐 Extracting Hidden Endpoints...", styles.info);
    extraction.secrets.endpoints = extractHiddenEndpoints();

    console.log("%c3/6 - 🔐 Extracting Credentials & Secrets...", styles.info);
    extraction.secrets.credentials = extractCredentials();

    console.log("%c4/6 - ⚙️ Extracting Configuration Data...", styles.info);
    extraction.secrets.configurations = extractConfigurations();

    console.log("%c5/6 - 👂 Mapping Event Listeners...", styles.info);
    extraction.secrets.listeners = mapEventListeners();

    console.log("%c6/6 - 🗺️ Creating Disclosure Map...", styles.info);
    extraction.secrets.mapping = createDisclosureMap();

    console.log("%c7/7 - 🚩 Scanning Advanced Flags...", styles.info);
    extraction.secrets.advancedFlags = extractAdvancedFlags();

    // Normalize + de-duplicate endpoints and strengthen risk engine
    normalizeAndDedupe(extraction);
    // strengthenRisks was removed/merged into normalizeAndDedupe by validation/dedupe pipeline

    // Calculate total findings
    extraction.totalFindings = Object.values(extraction.secrets).reduce(
      (total, category) => {
        if (Array.isArray(category)) {
          return total + category.length;
        } else if (typeof category === "object") {
          return total + Object.keys(category).length;
        }
        return total;
      },
      0
    );

    // Display results
    displayExtractionResults(extraction);

    // Store globally
    window.jsDisclosureHunter = {
      ...window.jsDisclosureHunter,
      ...extraction.secrets,
    };

    // If overlay is enabled, render quick panel (non-intrusive)
    try {
      if (
        window.jsDisclosureHunter.config &&
        window.jsDisclosureHunter.config.enableOverlay
      ) {
        renderOverlaySummary(extraction);
      }
    } catch (e) {}

    return extraction;
  }

  // ===========================================
  // 🔑 API KEYS & TOKENS EXTRACTOR
  // ===========================================

  function extractAPIKeys() {
    const apiKeys = [];

    // Optional pre-deobfuscation pass: base64/url decode candidates in script text
    function tryDecodeCandidates(text) {
      const out = [];
      try {
        // base64-like chunks
        const b64 = text.match(/[A-Za-z0-9+/=]{24,}/g) || [];
        b64.slice(0, 20).forEach((chunk) => {
          try {
            const decoded = atob(chunk.replace(/_/g, "/").replace(/-/g, "+"));
            if (/api|key|token|secret|aws|ghp_|sk_live_/i.test(decoded))
              out.push(decoded);
          } catch {}
        });
      } catch {}
      try {
        // URL-decoded strings
        if (/%[0-9A-Fa-f]{2}/.test(text)) {
          const decoded = decodeURIComponent(text);
          if (decoded && decoded !== text)
            out.push(decoded.substring(0, 20000));
        }
      } catch {}
      return out;
    }

    const keyPatterns = {
      // === Cloud & Infrastructure ===
      aws_access_key: /AKIA[0-9A-Z]{16}/gi,
      aws_secret_key: /[0-9a-zA-Z/+]{40}/gi,
      aws_session_token: /ASIA[0-9A-Z]{16}/gi,

      gcp_service_account: /-----BEGIN PRIVATE KEY-----/gi,
      gcp_api_key: /[A-Za-z0-9\-_]{39}/gi,

      // DigitalOcean tokens have an explicit prefix; avoid raw 64-hex noise
      digitalocean_token: /do_[A-Za-z0-9]{64}/gi,

      // === CI/CD & DevOps ===
      github_token: /ghp_[a-zA-Z0-9]{36}/gi,
      github_oauth: /gho_[a-zA-Z0-9]{36}/gi,
      github_refresh: /ghr_[a-zA-Z0-9]{76}/gi,
      gitlab_token: /glpat-[0-9a-zA-Z\-_]{20}/gi,

      // === Communication & Messaging ===
      twilio_api: /SK[0-9a-fA-F]{32}/gi,
      sendgrid_api_key: /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/gi,
      mailgun_api_key: /key-[0-9a-zA-Z]{32}/gi,
      slack_token: /xox[baprs]-[0-9a-zA-Z]{10,48}/gi,
      slack_webhook:
        /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{9}\/[A-Z0-9]{9}\/[A-Za-z0-9]{24}/gi,
      discord_token: /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/gi,

      // === Payment & Commerce ===
      stripe_publishable: /pk_live_[0-9a-zA-Z]{24}/gi,
      stripe_secret: /sk_live_[0-9a-zA-Z]{24}/gi,
      stripe_restricted_key: /rk_live_[0-9a-zA-Z]{24,34}/gi,
      paypal_access: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/gi,
      square_access: /sq0atp-[0-9A-Za-z\-_]{22}/gi,

      // === Social Media & Auth ===
      facebook_access: /EAA[0-9A-Za-z\-_]+/gi,
      twitter_bearer: /Bearer [A-Za-z0-9\-_]{50,100}/gi,

      // === Analytics & Monitoring ===
      newrelic_insert_key: /NRII-[A-Za-z0-9\-_]{32}/gi,

      // === E-commerce & Platforms ===
      shopify_access_token: /shpat_[a-fA-F0-9]{32}/gi,
      shopify_custom_app_token: /shpca_[a-fA-F0-9]{32}/gi,
      woocommerce_key: /ck_[0-9a-f]{32}/gi,
      woocommerce_secret: /cs_[0-9a-f]{32}/gi,

      // === Database & Storage ===
      mongodb_connection: /mongodb\+srv:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9\-_]+@/gi,
      redis_connection: /rediss?:\/\/.*:[a-zA-Z0-9\-_@.]+/gi,

      // === API Management ===
      postman_api_key: /PMAK-[0-9a-f]{24}-[0-9a-f]{34}/gi,

      // === Authentication & Identity ===
      jwt_token: /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/gi,
      auth0_management_api:
        /ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/gi,

      // === Generic Patterns ===
      generic_api_keys:
        /['"]?(?:api[_-]?key|apikey|key|access[_-]?token|auth[_-]?token|token|secret|client[_-]?secret|private[_-]?key)['"]?\s*[:=]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/gi,

      // === Crypto & Blockchain ===
      bitcoin_private_key: /[5KL][1-9A-HJ-NP-Za-km-z]{51}/gi,

      // === Other Popular Services ===
      airtable_api_key: /key[a-zA-Z0-9]{14}/gi,
      notion_token: /secret_[A-Za-z0-9]{43}/gi,
      openai_api_key: /sk-[a-zA-Z0-9]{48}/gi,
      anthropic_api_key: /sk-ant-[a-zA-Z0-9\-_]{94}/gi,
      cohere_api_key: /[0-9a-zA-Z]{45}/gi,
      pinecone_api_key:
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,

      // === Security & Secrets ===
      ssh_private_key: /-----BEGIN [A-Z ]*PRIVATE KEY-----/gi,
      pem_private_key: /-----BEGIN RSA PRIVATE KEY-----/gi,
      pgp_private_key: /-----BEGIN PGP PRIVATE KEY BLOCK-----/gi,
    };

    // Extract from all script tags
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const scriptContent = script.textContent || script.innerHTML || "";
      const scriptSrc = script.src || "inline";

      const candidates = [scriptContent, ...tryDecodeCandidates(scriptContent)];
      Object.entries(keyPatterns).forEach(([keyType, pattern]) => {
        candidates.forEach((scanText) => {
          const matches = scanText.match(pattern);
          if (matches) {
            matches.forEach((match) => {
              apiKeys.push({
                type: keyType,
                value: match,
                location: `script[${index}]`,
                source: scriptSrc,
                context: getContext(scriptContent, match, 50),
                risk: getKeyRiskLevel(keyType),
                timestamp: new Date().toISOString(),
              });
            });
          }
        });
      });

      // Extract from global variables
      const globalVars = Object.keys(window);
      globalVars.forEach((varName) => {
        try {
          const varValue = window[varName];
          if (typeof varValue === "string") {
            Object.entries(keyPatterns).forEach(([keyType, pattern]) => {
              const matches = varValue.match(pattern);
              if (matches) {
                matches.forEach((match) => {
                  apiKeys.push({
                    type: keyType,
                    value: match,
                    location: `window.${varName}`,
                    source: "global_variable",
                    context: varValue.substring(0, 100),
                    risk: getKeyRiskLevel(keyType),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            });
          }
        } catch (e) {
          // Skip inaccessible variables
        }
      });

      console.log(
        `%c🔑 Found ${apiKeys.length} potential API keys/tokens`,
        apiKeys.length > 0 ? styles.secret : styles.info
      );
    });

    return apiKeys;
  }

  // ===========================================
  // 🌐 HIDDEN ENDPOINTS EXTRACTOR
  // ===========================================

  function extractHiddenEndpoints() {
    const endpoints = [];
    const endpointPatterns = {
      // REST API patterns
      api_endpoints:
        /['"](\/api|\/api\/v[0-9]+|\/api\/v[0-9]+\/[^'"]+|\/api\/[^'"]+)['"]/gi,
      rest_endpoints: /['"](\/v[0-9]+|\/v[0-9]+\/[^'"]+)['"]/gi,
      users_api: /['"](\/api\/users|\/v[0-9]+\/users|\/users\/[^'"]*)['"]/gi,
      auth_api: /['"](\/api\/auth|\/v[0-9]+\/auth|\/auth\/[^'"]*)['"]/gi,
      login_api: /['"](\/api\/login|\/v[0-9]+\/login|\/login\/[^'"]*)['"]/gi,
      logout_api:
        /['"](\/api\/logout|\/v[0-9]+\/logout|\/logout\/[^'"]*)['"]/gi,
      register_api:
        /['"](\/api\/register|\/v[0-9]+\/register|\/register\/[^'"]*)['"]/gi,
      profile_api:
        /['"](\/api\/profile|\/v[0-9]+\/profile|\/profile\/[^'"]*)['"]/gi,
      products_api:
        /['"](\/api\/products|\/v[0-9]+\/products|\/products\/[^'"]*)['"]/gi,
      orders_api:
        /['"](\/api\/orders|\/v[0-9]+\/orders|\/orders\/[^'"]*)['"]/gi,
      cart_api: /['"](\/api\/cart|\/v[0-9]+\/cart|\/cart\/[^'"]*)['"]/gi,
      checkout_api:
        /['"](\/api\/checkout|\/v[0-9]+\/checkout|\/checkout\/[^'"]*)['"]/gi,
      payment_api:
        /['"](\/api\/payment|\/v[0-9]+\/payment|\/payment\/[^'"]*)['"]/gi,
      invoice_api:
        /['"](\/api\/invoice|\/v[0-9]+\/invoice|\/invoice\/[^'"]*)['"]/gi,
      shipping_api:
        /['"](\/api\/shipping|\/v[0-9]+\/shipping|\/shipping\/[^'"]*)['"]/gi,
      tracking_api:
        /['"](\/api\/tracking|\/v[0-9]+\/tracking|\/tracking\/[^'"]*)['"]/gi,
      notifications_api:
        /['"](\/api\/notifications|\/v[0-9]+\/notifications|\/notifications\/[^'"]*)['"]/gi,
      messages_api:
        /['"](\/api\/messages|\/v[0-9]+\/messages|\/messages\/[^'"]*)['"]/gi,
      comments_api:
        /['"](\/api\/comments|\/v[0-9]+\/comments|\/comments\/[^'"]*)['"]/gi,
      likes_api: /['"](\/api\/likes|\/v[0-9]+\/likes|\/likes\/[^'"]*)['"]/gi,
      posts_api: /['"](\/api\/posts|\/v[0-9]+\/posts|\/posts\/[^'"]*)['"]/gi,
      feed_api: /['"](\/api\/feed|\/v[0-9]+\/feed|\/feed\/[^'"]*)['"]/gi,
      search_api:
        /['"](\/api\/search|\/v[0-9]+\/search|\/search\/[^'"]*)['"]/gi,
      tags_api: /['"](\/api\/tags|\/v[0-9]+\/tags|\/tags\/[^'"]*)['"]/gi,
      categories_api:
        /['"](\/api\/categories|\/v[0-9]+\/categories|\/categories\/[^'"]*)['"]/gi,
      settings_api:
        /['"](\/api\/settings|\/v[0-9]+\/settings|\/settings\/[^'"]*)['"]/gi,
      config_api:
        /['"](\/api\/config|\/v[0-9]+\/config|\/config\/[^'"]*)['"]/gi,
      status_api:
        /['"](\/api\/status|\/v[0-9]+\/status|\/status\/[^'"]*)['"]/gi,
      health_api:
        /['"](\/api\/health|\/v[0-9]+\/health|\/health\/[^'"]*)['"]/gi,
      metrics_api:
        /['"](\/api\/metrics|\/v[0-9]+\/metrics|\/metrics\/[^'"]*)['"]/gi,
      logs_api: /['"](\/api\/logs|\/v[0-9]+\/logs|\/logs\/[^'"]*)['"]/gi,
      reports_api:
        /['"](\/api\/reports|\/v[0-9]+\/reports|\/reports\/[^'"]*)['"]/gi,
      analytics_api:
        /['"](\/api\/analytics|\/v[0-9]+\/analytics|\/analytics\/[^'"]*)['"]/gi,
      dashboard_api:
        /['"](\/api\/dashboard|\/v[0-9]+\/dashboard|\/dashboard\/[^'"]*)['"]/gi,
      admin_api: /['"](\/api\/admin|\/v[0-9]+\/admin|\/admin\/[^'"]*)['"]/gi,
      internal_api:
        /['"](\/api\/internal|\/v[0-9]+\/internal|\/internal\/[^'"]*)['"]/gi,
      debug_api: /['"](\/api\/debug|\/v[0-9]+\/debug|\/debug\/[^'"]*)['"]/gi,
      test_api: /['"](\/api\/test|\/v[0-9]+\/test|\/test\/[^'"]*)['"]/gi,
      dev_api: /['"](\/api\/dev|\/v[0-9]+\/dev|\/dev\/[^'"]*)['"]/gi,
      staging_api:
        /['"](\/api\/staging|\/v[0-9]+\/staging|\/staging\/[^'"]*)['"]/gi,
      upload_api:
        /['"](\/api\/upload|\/v[0-9]+\/upload|\/upload\/[^'"]*)['"]/gi,
      download_api:
        /['"](\/api\/download|\/v[0-9]+\/download|\/download\/[^'"]*)['"]/gi,
      files_api: /['"](\/api\/files|\/v[0-9]+\/files|\/files\/[^'"]*)['"]/gi,
      media_api: /['"](\/api\/media|\/v[0-9]+\/media|\/media\/[^'"]*)['"]/gi,
      images_api:
        /['"](\/api\/images|\/v[0-9]+\/images|\/images\/[^'"]*)['"]/gi,
      videos_api:
        /['"](\/api\/videos|\/v[0-9]+\/videos|\/videos\/[^'"]*)['"]/gi,
      docs_api: /['"](\/api\/docs|\/v[0-9]+\/docs|\/docs\/[^'"]*)['"]/gi,
      swagger_api:
        /['"](\/api\/swagger|\/v[0-9]+\/swagger|\/swagger\/[^'"]*)['"]/gi,
      graphql_api:
        /['"](\/api\/graphql|\/v[0-9]+\/graphql|\/graphql\/[^'"]*)['"]/gi,
      webhooks_api:
        /['"](\/api\/webhooks|\/v[0-9]+\/webhooks|\/webhooks\/[^'"]*)['"]/gi,
      events_api:
        /['"](\/api\/events|\/v[0-9]+\/events|\/events\/[^'"]*)['"]/gi,
      subscriptions_api:
        /['"](\/api\/subscriptions|\/v[0-9]+\/subscriptions|\/subscriptions\/[^'"]*)['"]/gi,
      billing_api:
        /['"](\/api\/billing|\/v[0-9]+\/billing|\/billing\/[^'"]*)['"]/gi,
      plans_api: /['"](\/api\/plans|\/v[0-9]+\/plans|\/plans\/[^'"]*)['"]/gi,
      support_api:
        /['"](\/api\/support|\/v[0-9]+\/support|\/support\/[^'"]*)['"]/gi,
      feedback_api:
        /['"](\/api\/feedback|\/v[0-9]+\/feedback|\/feedback\/[^'"]*)['"]/gi,

      // GraphQL
      graphql_endpoints: /['"](.*\/graphql[^'"]*)['\"]/gi,

      // WebSocket
      websocket_endpoints: /ws[s]?:\/\/[^'"\s]+/gi,

      // Admin/Internal endpoints
      admin_endpoints:
        /['"](\/admin|\/admin-panel|\/admin-dashboard|\/admin\/[^'"]*)['"]/gi,
      internal_endpoints:
        /['"](\/internal|\/private|\/restricted|\/core|\/infra|\/internal\/[^'"]*)['"]/gi,
      debug_endpoints:
        /['"](\/debug|\/dev-debug|\/debug-tools|\/debug\/[^'"]*)['"]/gi,
      superuser_endpoints:
        /['"](\/superuser|\/root|\/sudo|\/superuser\/[^'"]*)['"]/gi,
      config_endpoints:
        /['"](\/config|\/admin-config|\/system-config|\/config\/[^'"]*)['"]/gi,
      settings_endpoints:
        /['"](\/settings|\/admin-settings|\/system-settings|\/settings\/[^'"]*)['"]/gi,
      control_endpoints:
        /['"](\/control|\/control-panel|\/admin-control|\/control\/[^'"]*)['"]/gi,
      manage_endpoints:
        /['"](\/manage|\/management|\/admin-manage|\/manage\/[^'"]*)['"]/gi,
      panel_endpoints:
        /['"](\/panel|\/admin-panel|\/dashboard-panel|\/panel\/[^'"]*)['"]/gi,
      console_endpoints:
        /['"](\/console|\/admin-console|\/system-console|\/console\/[^'"]*)['"]/gi,
      system_endpoints:
        /['"](\/system|\/system-tools|\/system-api|\/system\/[^'"]*)['"]/gi,
      tools_endpoints:
        /['"](\/tools|\/admin-tools|\/debug-tools|\/tools\/[^'"]*)['"]/gi,
      monitor_endpoints:
        /['"](\/monitor|\/monitoring|\/admin-monitor|\/monitor\/[^'"]*)['"]/gi,
      metrics_endpoints:
        /['"](\/metrics|\/admin-metrics|\/system-metrics|\/metrics\/[^'"]*)['"]/gi,
      logs_endpoints:
        /['"](\/logs|\/admin-logs|\/system-logs|\/logs\/[^'"]*)['"]/gi,
      trace_endpoints:
        /['"](\/trace|\/tracing|\/debug-trace|\/trace\/[^'"]*)['"]/gi,
      audit_endpoints:
        /['"](\/audit|\/audit-log|\/admin-audit|\/audit\/[^'"]*)['"]/gi,
      status_endpoints:
        /['"](\/status|\/health|\/admin-status|\/status\/[^'"]*)['"]/gi,
      ping_endpoints:
        /['"](\/ping|\/admin-ping|\/system-ping|\/ping\/[^'"]*)['"]/gi,
      info_endpoints:
        /['"](\/info|\/system-info|\/admin-info|\/info\/[^'"]*)['"]/gi,
      version_endpoints:
        /['"](\/version|\/system-version|\/admin-version|\/version\/[^'"]*)['"]/gi,
      env_endpoints:
        /['"](\/env|\/environment|\/admin-env|\/env\/[^'"]*)['"]/gi,
      config_dump_endpoints:
        /['"](\/config-dump|\/dump-config|\/admin-dump|\/config-dump\/[^'"]*)['"]/gi,
      internal_api_endpoints:
        /['"](\/api\/internal|\/internal-api|\/private-api|\/api\/internal\/[^'"]*)['"]/gi,
      internal_data_endpoints:
        /['"](\/internal-data|\/data\/internal|\/private-data|\/internal-data\/[^'"]*)['"]/gi,
      internal_user_endpoints:
        /['"](\/internal-user|\/user\/internal|\/admin-user|\/internal-user\/[^'"]*)['"]/gi,
      internal_auth_endpoints:
        /['"](\/internal-auth|\/auth\/internal|\/admin-auth|\/internal-auth\/[^'"]*)['"]/gi,
      internal_config_endpoints:
        /['"](\/internal-config|\/config\/internal|\/admin-config|\/internal-config\/[^'"]*)['"]/gi,
      internal_logs_endpoints:
        /['"](\/internal-logs|\/logs\/internal|\/admin-logs|\/internal-logs\/[^'"]*)['"]/gi,
      internal_metrics_endpoints:
        /['"](\/internal-metrics|\/metrics\/internal|\/admin-metrics|\/internal-metrics\/[^'"]*)['"]/gi,
      internal_monitor_endpoints:
        /['"](\/internal-monitor|\/monitor\/internal|\/admin-monitor|\/internal-monitor\/[^'"]*)['"]/gi,
      internal_tools_endpoints:
        /['"](\/internal-tools|\/tools\/internal|\/admin-tools|\/internal-tools\/[^'"]*)['"]/gi,
      internal_panel_endpoints:
        /['"](\/internal-panel|\/panel\/internal|\/admin-panel|\/internal-panel\/[^'"]*)['"]/gi,
      internal_console_endpoints:
        /['"](\/internal-console|\/console\/internal|\/admin-console|\/internal-console\/[^'"]*)['"]/gi,
      internal_status_endpoints:
        /['"](\/internal-status|\/status\/internal|\/admin-status|\/internal-status\/[^'"]*)['"]/gi,
      internal_ping_endpoints:
        /['"](\/internal-ping|\/ping\/internal|\/admin-ping|\/internal-ping\/[^'"]*)['"]/gi,
      internal_trace_endpoints:
        /['"](\/internal-trace|\/trace\/internal|\/admin-trace|\/internal-trace\/[^'"]*)['"]/gi,
      internal_audit_endpoints:
        /['"](\/internal-audit|\/audit\/internal|\/admin-audit|\/internal-audit\/[^'"]*)['"]/gi,
      internal_version_endpoints:
        /['"](\/internal-version|\/version\/internal|\/admin-version|\/internal-version\/[^'"]*)['"]/gi,
      internal_info_endpoints:
        /['"](\/internal-info|\/info\/internal|\/admin-info|\/internal-info\/[^'"]*)['"]/gi,
      internal_env_endpoints:
        /['"](\/internal-env|\/env\/internal|\/admin-env|\/internal-env\/[^'"]*)['"]/gi,
      internal_dump_endpoints:
        /['"](\/internal-dump|\/dump\/internal|\/admin-dump|\/internal-dump\/[^'"]*)['"]/gi,
      internal_debug_endpoints:
        /['"](\/internal-debug|\/debug\/internal|\/admin-debug|\/internal-debug\/[^'"]*)['"]/gi,
      internal_manage_endpoints:
        /['"](\/internal-manage|\/manage\/internal|\/admin-manage|\/internal-manage\/[^'"]*)['"]/gi,
      internal_control_endpoints:
        /['"](\/internal-control|\/control\/internal|\/admin-control|\/internal-control\/[^'"]*)['"]/gi,
      internal_settings_endpoints:
        /['"](\/internal-settings|\/settings\/internal|\/admin-settings|\/internal-settings\/[^'"]*)['"]/gi,
      internal_superuser_endpoints:
        /['"](\/internal-superuser|\/superuser\/internal|\/admin-superuser|\/internal-superuser\/[^'"]*)['"]/gi,
      internal_sudo_endpoints:
        /['"](\/internal-sudo|\/sudo\/internal|\/admin-sudo|\/internal-sudo\/[^'"]*)['"]/gi,
      internal_root_endpoints:
        /['"](\/internal-root|\/root\/internal|\/admin-root|\/internal-root\/[^'"]*)['"]/gi,
      internal_authz_endpoints:
        /['"](\/internal-authz|\/authz\/internal|\/admin-authz|\/internal-authz\/[^'"]*)['"]/gi,
      internal_authn_endpoints:
        /['"](\/internal-authn|\/authn\/internal|\/admin-authn|\/internal-authn\/[^'"]*)['"]/gi,
      internal_roles_endpoints:
        /['"](\/internal-roles|\/roles\/internal|\/admin-roles|\/internal-roles\/[^'"]*)['"]/gi,
      internal_permissions_endpoints:
        /['"](\/internal-permissions|\/permissions\/internal|\/admin-permissions|\/internal-permissions\/[^'"]*)['"]/gi,

      // Development endpoints
      dev_endpoints:
        /['"](\/dev|\/dev-api|\/dev-tools|\/dev-dashboard|\/dev\/[^'"]*)['"]/gi,
      test_endpoints:
        /['"](\/test|\/test-api|\/test-tools|\/test-dashboard|\/test\/[^'"]*)['"]/gi,
      staging_endpoints:
        /['"](staging\.|\/staging|\/staging-api|\/staging-tools|\/staging\/[^'"]*)['"]/gi,
      sandbox_endpoints:
        /['"](\/sandbox|\/sandbox-api|\/sandbox-tools|\/sandbox\/[^'"]*)['"]/gi,
      qa_endpoints: /['"](\/qa|\/qa-api|\/qa-tools|\/qa\/[^'"]*)['"]/gi,
      preview_endpoints:
        /['"](\/preview|\/preview-api|\/preview-tools|\/preview\/[^'"]*)['"]/gi,
      mock_endpoints:
        /['"](\/mock|\/mock-api|\/mock-tools|\/mock\/[^'"]*)['"]/gi,
      simulate_endpoints:
        /['"](\/simulate|\/simulator|\/simulate-api|\/simulate\/[^'"]*)['"]/gi,
      experiment_endpoints:
        /['"](\/experiment|\/experiments|\/experiment-api|\/experiment\/[^'"]*)['"]/gi,
      feature_flag_endpoints:
        /['"](\/feature-flag|\/flags|\/feature-flags|\/feature-flag\/[^'"]*)['"]/gi,
      alpha_endpoints:
        /['"](\/alpha|\/alpha-api|\/alpha-tools|\/alpha\/[^'"]*)['"]/gi,
      beta_endpoints:
        /['"](\/beta|\/beta-api|\/beta-tools|\/beta\/[^'"]*)['"]/gi,
      rc_endpoints:
        /['"](\/rc|\/release-candidate|\/rc-api|\/rc\/[^'"]*)['"]/gi,
      build_endpoints:
        /['"](\/build|\/build-api|\/build-tools|\/build\/[^'"]*)['"]/gi,
      compile_endpoints:
        /['"](\/compile|\/compiler|\/compile-api|\/compile\/[^'"]*)['"]/gi,
      debug_dev_endpoints:
        /['"](\/debug-dev|\/dev-debug|\/debug\/dev|\/debug-dev\/[^'"]*)['"]/gi,
      test_data_endpoints:
        /['"](\/test-data|\/data\/test|\/testdata|\/test-data\/[^'"]*)['"]/gi,
      test_user_endpoints:
        /['"](\/test-user|\/user\/test|\/testuser|\/test-user\/[^'"]*)['"]/gi,
      test_auth_endpoints:
        /['"](\/test-auth|\/auth\/test|\/testauth|\/test-auth\/[^'"]*)['"]/gi,
      test_config_endpoints:
        /['"](\/test-config|\/config\/test|\/testconfig|\/test-config\/[^'"]*)['"]/gi,
      test_env_endpoints:
        /['"](\/test-env|\/env\/test|\/testenv|\/test-env\/[^'"]*)['"]/gi,
      test_logs_endpoints:
        /['"](\/test-logs|\/logs\/test|\/testlogs|\/test-logs\/[^'"]*)['"]/gi,
      test_metrics_endpoints:
        /['"](\/test-metrics|\/metrics\/test|\/testmetrics|\/test-metrics\/[^'"]*)['"]/gi,
      test_monitor_endpoints:
        /['"](\/test-monitor|\/monitor\/test|\/testmonitor|\/test-monitor\/[^'"]*)['"]/gi,
      test_tools_endpoints:
        /['"](\/test-tools|\/tools\/test|\/testtools|\/test-tools\/[^'"]*)['"]/gi,
      test_panel_endpoints:
        /['"](\/test-panel|\/panel\/test|\/testpanel|\/test-panel\/[^'"]*)['"]/gi,
      test_console_endpoints:
        /['"](\/test-console|\/console\/test|\/testconsole|\/test-console\/[^'"]*)['"]/gi,
      test_status_endpoints:
        /['"](\/test-status|\/status\/test|\/teststatus|\/test-status\/[^'"]*)['"]/gi,
      test_ping_endpoints:
        /['"](\/test-ping|\/ping\/test|\/testping|\/test-ping\/[^'"]*)['"]/gi,
      test_trace_endpoints:
        /['"](\/test-trace|\/trace\/test|\/testtrace|\/test-trace\/[^'"]*)['"]/gi,

      // File/Upload endpoints
      upload_endpoints:
        /['"](\/upload|\/file-upload|\/media-upload|\/upload\/[^'"]*)['"]/gi,
      file_endpoints:
        /['"](\/file|\/files|\/documents|\/attachments|\/images|\/media|\/file\/[^'"]*)['"]/gi,
      avatar_endpoints:
        /['"](\/avatar|\/profile-image|\/user-avatar|\/avatar\/[^'"]*)['"]/gi,
      photo_endpoints:
        /['"](\/photo|\/photos|\/user-photo|\/photo\/[^'"]*)['"]/gi,
      document_endpoints:
        /['"](\/document|\/documents|\/doc|\/docs|\/document\/[^'"]*)['"]/gi,
      attachment_endpoints:
        /['"](\/attachment|\/attachments|\/attach|\/attachment\/[^'"]*)['"]/gi,
      image_endpoints: /['"](\/image|\/images|\/img|\/image\/[^'"]*)['"]/gi,
      media_endpoints: /['"](\/media|\/media-files|\/media\/[^'"]*)['"]/gi,
      download_endpoints:
        /['"](\/download|\/file-download|\/media-download|\/download\/[^'"]*)['"]/gi,
      preview_endpoints:
        /['"](\/preview|\/file-preview|\/media-preview|\/preview\/[^'"]*)['"]/gi,
      import_endpoints:
        /['"](\/import|\/file-import|\/media-import|\/import\/[^'"]*)['"]/gi,
      export_endpoints:
        /['"](\/export|\/file-export|\/media-export|\/export\/[^'"]*)['"]/gi,
      sync_endpoints:
        /['"](\/sync|\/file-sync|\/media-sync|\/sync\/[^'"]*)['"]/gi,
      storage_endpoints:
        /['"](\/storage|\/file-storage|\/media-storage|\/storage\/[^'"]*)['"]/gi,
      bucket_endpoints:
        /['"](\/bucket|\/file-bucket|\/media-bucket|\/bucket\/[^'"]*)['"]/gi,
      archive_endpoints:
        /['"](\/archive|\/file-archive|\/media-archive|\/archive\/[^'"]*)['"]/gi,
      restore_endpoints:
        /['"](\/restore|\/file-restore|\/media-restore|\/restore\/[^'"]*)['"]/gi,
      delete_endpoints:
        /['"](\/delete|\/file-delete|\/media-delete|\/delete\/[^'"]*)['"]/gi,
      remove_endpoints:
        /['"](\/remove|\/file-remove|\/media-remove|\/remove\/[^'"]*)['"]/gi,
      tempfile_endpoints:
        /['"](\/tempfile|\/temp-file|\/temporary-file|\/tempfile\/[^'"]*)['"]/gi,
      signedurl_endpoints:
        /['"](\/signed-url|\/file-url|\/media-url|\/signedurl\/[^'"]*)['"]/gi,
      upload_token_endpoints:
        /['"](\/upload-token|\/file-token|\/media-token|\/upload-token\/[^'"]*)['"]/gi,
      upload_status_endpoints:
        /['"](\/upload-status|\/file-status|\/media-status|\/upload-status\/[^'"]*)['"]/gi,
      upload_config_endpoints:
        /['"](\/upload-config|\/file-config|\/media-config|\/upload-config\/[^'"]*)['"]/gi,
      upload_callback_endpoints:
        /['"](\/upload-callback|\/file-callback|\/media-callback|\/upload-callback\/[^'"]*)['"]/gi,
      upload_progress_endpoints:
        /['"](\/upload-progress|\/file-progress|\/media-progress|\/upload-progress\/[^'"]*)['"]/gi,
      upload_chunk_endpoints:
        /['"](\/upload-chunk|\/file-chunk|\/media-chunk|\/upload-chunk\/[^'"]*)['"]/gi,
      upload_complete_endpoints:
        /['"](\/upload-complete|\/file-complete|\/media-complete|\/upload-complete\/[^'"]*)['"]/gi,
      upload_verify_endpoints:
        /['"](\/upload-verify|\/file-verify|\/media-verify|\/upload-verify\/[^'"]*)['"]/gi,
      upload_error_endpoints:
        /['"](\/upload-error|\/file-error|\/media-error|\/upload-error\/[^'"]*)['"]/gi,

      // Authentication endpoints
      auth_endpoints:
        /['"](\/auth|\/authenticate|\/authorization|\/authn|\/authz|\/auth\/[^'"]*)['"]/gi,
      login_endpoints:
        /['"](\/login|\/signin|\/user\/login|\/account\/login|\/auth\/login[^'"]*)['"]/gi,
      logout_endpoints:
        /['"](\/logout|\/signout|\/user\/logout|\/account\/logout|\/auth\/logout[^'"]*)['"]/gi,
      oauth_endpoints:
        /['"](\/oauth|\/oauth2|\/auth\/oauth|\/connect\/oauth[^'"]*)['"]/gi,
      saml_endpoints:
        /['"](\/saml|\/sso\/saml|\/auth\/saml|\/saml2[^'"]*)['"]/gi,
      openid_endpoints:
        /['"](\/openid|\/auth\/openid|\/connect\/openid[^'"]*)['"]/gi,
      token_endpoints:
        /['"](\/token|\/access_token|\/refresh_token|\/auth\/token|\/oauth\/token[^'"]*)['"]/gi,
      session_endpoints:
        /['"](\/session|\/sessions|\/auth\/session|\/user\/session[^'"]*)['"]/gi,
      password_endpoints:
        /['"](\/password|\/reset-password|\/change-password|\/forgot-password|\/auth\/password[^'"]*)['"]/gi,
      mfa_endpoints:
        /['"](\/mfa|\/2fa|\/verify-code|\/auth\/mfa|\/auth\/2fa[^'"]*)['"]/gi,
      verify_endpoints:
        /['"](\/verify|\/validate|\/confirm|\/auth\/verify|\/email\/verify[^'"]*)['"]/gi,
      register_endpoints:
        /['"](\/register|\/signup|\/create-account|\/auth\/register[^'"]*)['"]/gi,
      user_auth_endpoints:
        /['"](\/user\/auth|\/account\/auth|\/auth\/user[^'"]*)['"]/gi,
      auth_callback_endpoints:
        /['"](\/callback|\/auth\/callback|\/oauth\/callback[^'"]*)['"]/gi,
      auth_redirect_endpoints:
        /['"](\/redirect|\/auth\/redirect|\/oauth\/redirect[^'"]*)['"]/gi,
      auth_config_endpoints:
        /['"](\/auth\/config|\/config\/auth|\/settings\/auth[^'"]*)['"]/gi,
      auth_status_endpoints:
        /['"](\/auth\/status|\/status\/auth|\/check-auth[^'"]*)['"]/gi,
      auth_test_endpoints:
        /['"](\/auth\/test|\/test-auth|\/debug\/auth[^'"]*)['"]/gi,
      auth_debug_endpoints:
        /['"](\/auth\/debug|\/debug-auth|\/auth\/logs[^'"]*)['"]/gi,
      auth_ping_endpoints:
        /['"](\/auth\/ping|\/ping-auth|\/health\/auth[^'"]*)['"]/gi,
      auth_token_info_endpoints:
        /['"](\/token\/info|\/auth\/token\/info|\/oauth\/token\/details[^'"]*)['"]/gi,
      auth_refresh_endpoints:
        /['"](\/refresh|\/auth\/refresh|\/token\/refresh[^'"]*)['"]/gi,
      auth_revoke_endpoints:
        /['"](\/revoke|\/auth\/revoke|\/token\/revoke[^'"]*)['"]/gi,
      auth_grant_endpoints:
        /['"](\/grant|\/auth\/grant|\/oauth\/grant[^'"]*)['"]/gi,
      auth_scope_endpoints:
        /['"](\/scope|\/auth\/scope|\/oauth\/scope[^'"]*)['"]/gi,
      auth_roles_endpoints:
        /['"](\/roles|\/auth\/roles|\/user\/roles[^'"]*)['"]/gi,
      auth_permissions_endpoints:
        /['"](\/permissions|\/auth\/permissions|\/user\/permissions[^'"]*)['"]/gi,
      auth_identity_endpoints:
        /['"](\/identity|\/auth\/identity|\/user\/identity[^'"]*)['"]/gi,
      auth_provider_endpoints:
        /['"](\/provider|\/auth\/provider|\/oauth\/provider[^'"]*)['"]/gi,
      auth_metadata_endpoints:
        /['"](\/metadata|\/auth\/metadata|\/token\/metadata[^'"]*)['"]/gi,

      // Database/Data endpoints
      db_endpoints:
        /['"](\/db|\/database|\/db-admin|\/db-config|\/db\/[^'"]*)['"]/gi,
      data_endpoints: /['"](\/data|\/dataset|\/data-api|\/data\/[^'"]*)['"]/gi,
      query_endpoints:
        /['"](\/query|\/db-query|\/data-query|\/sql-query|\/query\/[^'"]*)['"]/gi,
      schema_endpoints:
        /['"](\/schema|\/db-schema|\/data-schema|\/schema\/[^'"]*)['"]/gi,
      table_endpoints:
        /['"](\/table|\/tables|\/db-table|\/data-table|\/table\/[^'"]*)['"]/gi,
      record_endpoints:
        /['"](\/record|\/records|\/data-record|\/db-record|\/record\/[^'"]*)['"]/gi,
      row_endpoints:
        /['"](\/row|\/rows|\/db-row|\/data-row|\/row\/[^'"]*)['"]/gi,
      column_endpoints:
        /['"](\/column|\/columns|\/db-column|\/data-column|\/column\/[^'"]*)['"]/gi,
      dump_endpoints:
        /['"](\/dump|\/db-dump|\/data-dump|\/export-dump|\/dump\/[^'"]*)['"]/gi,
      export_endpoints:
        /['"](\/export|\/data-export|\/db-export|\/export\/[^'"]*)['"]/gi,
      import_endpoints:
        /['"](\/import|\/data-import|\/db-import|\/import\/[^'"]*)['"]/gi,
      backup_endpoints:
        /['"](\/backup|\/db-backup|\/data-backup|\/backup\/[^'"]*)['"]/gi,
      restore_endpoints:
        /['"](\/restore|\/db-restore|\/data-restore|\/restore\/[^'"]*)['"]/gi,
      migration_endpoints:
        /['"](\/migration|\/db-migration|\/data-migration|\/migrate\/[^'"]*)['"]/gi,
      seed_endpoints: /['"](\/seed|\/db-seed|\/data-seed|\/seed\/[^'"]*)['"]/gi,
      sync_endpoints: /['"](\/sync|\/db-sync|\/data-sync|\/sync\/[^'"]*)['"]/gi,
      replica_endpoints:
        /['"](\/replica|\/db-replica|\/data-replica|\/replica\/[^'"]*)['"]/gi,
      index_endpoints:
        /['"](\/index|\/db-index|\/data-index|\/index\/[^'"]*)['"]/gi,
      stats_endpoints:
        /['"](\/stats|\/db-stats|\/data-stats|\/stats\/[^'"]*)['"]/gi,
      analytics_endpoints:
        /['"](\/analytics|\/data-analytics|\/db-analytics|\/analytics\/[^'"]*)['"]/gi,
      report_endpoints:
        /['"](\/report|\/data-report|\/db-report|\/report\/[^'"]*)['"]/gi,
      cache_endpoints:
        /['"](\/cache|\/data-cache|\/db-cache|\/cache\/[^'"]*)['"]/gi,
      search_endpoints:
        /['"](\/search|\/data-search|\/db-search|\/search\/[^'"]*)['"]/gi,
      filter_endpoints:
        /['"](\/filter|\/data-filter|\/db-filter|\/filter\/[^'"]*)['"]/gi,
      aggregate_endpoints:
        /['"](\/aggregate|\/data-aggregate|\/db-aggregate|\/aggregate\/[^'"]*)['"]/gi,
      mapreduce_endpoints:
        /['"](\/mapreduce|\/data-mapreduce|\/db-mapreduce|\/mapreduce\/[^'"]*)['"]/gi,
      nosql_endpoints:
        /['"](\/nosql|\/mongo|\/couchdb|\/firebase|\/nosql\/[^'"]*)['"]/gi,
      sql_endpoints:
        /['"](\/sql|\/postgres|\/mysql|\/sqlite|\/sql\/[^'"]*)['"]/gi,
      graphdb_endpoints:
        /['"](\/graphdb|\/neo4j|\/graph|\/graphdb\/[^'"]*)['"]/gi,
      timeseries_endpoints:
        /['"](\/timeseries|\/influx|\/prometheus|\/timeseries\/[^'"]*)['"]/gi,

      // Configuration endpoints
      config_endpoints:
        /['"](\/config|\/configuration|\/app-config|\/system-config|\/config\/[^'"]*)['"]/gi,
      settings_endpoints:
        /['"](\/settings|\/user-settings|\/app-settings|\/system-settings|\/settings\/[^'"]*)['"]/gi,
      preferences_endpoints:
        /['"](\/preferences|\/user-preferences|\/config\/preferences[^'"]*)['"]/gi,
      options_endpoints:
        /['"](\/options|\/config-options|\/settings-options[^'"]*)['"]/gi,
      parameters_endpoints:
        /['"](\/parameters|\/config-params|\/settings-params[^'"]*)['"]/gi,
      env_config_endpoints:
        /['"](\/env-config|\/environment-config|\/config\/env[^'"]*)['"]/gi,
      feature_config_endpoints:
        /['"](\/feature-config|\/config\/features|\/settings\/features[^'"]*)['"]/gi,
      ui_config_endpoints:
        /['"](\/ui-config|\/config\/ui|\/settings\/ui[^'"]*)['"]/gi,
      api_config_endpoints:
        /['"](\/api-config|\/config\/api|\/settings\/api[^'"]*)['"]/gi,
      security_config_endpoints:
        /['"](\/security-config|\/config\/security|\/settings\/security[^'"]*)['"]/gi,
      auth_config_endpoints:
        /['"](\/auth-config|\/config\/auth|\/settings\/auth[^'"]*)['"]/gi,
      db_config_endpoints:
        /['"](\/db-config|\/config\/db|\/settings\/db[^'"]*)['"]/gi,
      cache_config_endpoints:
        /['"](\/cache-config|\/config\/cache|\/settings\/cache[^'"]*)['"]/gi,
      network_config_endpoints:
        /['"](\/network-config|\/config\/network|\/settings\/network[^'"]*)['"]/gi,
      email_config_endpoints:
        /['"](\/email-config|\/config\/email|\/settings\/email[^'"]*)['"]/gi,
      sms_config_endpoints:
        /['"](\/sms-config|\/config\/sms|\/settings\/sms[^'"]*)['"]/gi,
      notification_config_endpoints:
        /['"](\/notification-config|\/config\/notifications|\/settings\/notifications[^'"]*)['"]/gi,
      logging_config_endpoints:
        /['"](\/logging-config|\/config\/logging|\/settings\/logging[^'"]*)['"]/gi,
      monitoring_config_endpoints:
        /['"](\/monitoring-config|\/config\/monitoring|\/settings\/monitoring[^'"]*)['"]/gi,
      metrics_config_endpoints:
        /['"](\/metrics-config|\/config\/metrics|\/settings\/metrics[^'"]*)['"]/gi,
      backup_config_endpoints:
        /['"](\/backup-config|\/config\/backup|\/settings\/backup[^'"]*)['"]/gi,
      restore_config_endpoints:
        /['"](\/restore-config|\/config\/restore|\/settings\/restore[^'"]*)['"]/gi,
      import_config_endpoints:
        /['"](\/import-config|\/config\/import|\/settings\/import[^'"]*)['"]/gi,
      export_config_endpoints:
        /['"](\/export-config|\/config\/export|\/settings\/export[^'"]*)['"]/gi,
      integration_config_endpoints:
        /['"](\/integration-config|\/config\/integration|\/settings\/integration[^'"]*)['"]/gi,
      thirdparty_config_endpoints:
        /['"](\/thirdparty-config|\/config\/thirdparty|\/settings\/thirdparty[^'"]*)['"]/gi,
      admin_config_endpoints:
        /['"](\/admin-config|\/config\/admin|\/settings\/admin[^'"]*)['"]/gi,
      profile_config_endpoints:
        /['"](\/profile-config|\/config\/profile|\/settings\/profile[^'"]*)['"]/gi,
      theme_config_endpoints:
        /['"](\/theme-config|\/config\/theme|\/settings\/theme[^'"]*)['"]/gi,
      language_config_endpoints:
        /['"](\/language-config|\/config\/language|\/settings\/language[^'"]*)['"]/gi,

      // Full URLs
      full_urls: /https?:\/\/[^'"\s<>]+/gi,

      // Subdomain patterns
      subdomains: /['"](([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})['\"]/gi,
    };

    // Extract from scripts
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const scriptContent = script.textContent || script.innerHTML || "";
      const scriptSrc = script.src || "inline";

      Object.entries(endpointPatterns).forEach(([endpointType, pattern]) => {
        const matches = scriptContent.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            // Clean up the match
            const cleanMatch = match.replace(/['"]/g, "");

            if (
              cleanMatch.length > 5 &&
              !endpoints.find((e) => e.endpoint === cleanMatch)
            ) {
              endpoints.push({
                type: endpointType,
                endpoint: cleanMatch,
                location: `script[${index}]`,
                source: scriptSrc,
                context: getContext(scriptContent, match, 100),
                risk: getEndpointRiskLevel(endpointType, cleanMatch),
                method: guessHTTPMethod(scriptContent, match),
                timestamp: new Date().toISOString(),
              });
            }
          });
        }
      });
    });

    // Extract from AJAX/Fetch calls
    const ajaxEndpoints = extractAjaxEndpoints();
    endpoints.push(...ajaxEndpoints);

    // Sort by risk level
    endpoints.sort((a, b) => {
      const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
    });

    console.log(
      `%c🌐 Found ${endpoints.length} hidden endpoints`,
      endpoints.length > 0 ? styles.endpoint : styles.info
    );
    return endpoints;
  }

  // ===========================================
  // 🔐 CREDENTIALS & SECRETS EXTRACTOR
  // ===========================================

  function extractCredentials() {
    const credentials = [];
    const credentialPatterns = {
      // entropy helper: filters out very low-entropy values (reduces false positives)
      _entropy: (s) => {
        try {
          const str = String(s || "");
          if (!str) return 0;
          const freq = {};
          for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
          const N = str.length;
          let H = 0;
          Object.values(freq).forEach((c) => {
            const p = c / N;
            H += -p * Math.log2(p);
          });
          return H;
        } catch {
          return 0;
        }
      },
      // Database connections
      db_password: /['"](.*password.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      db_username: /['"](.*username.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      db_connection:
        /mongodb:\/\/[^'"\s]+|mysql:\/\/[^'"\s]+|postgres:\/\/[^'"\s]+/gi,

      // SMTP/Email
      smtp_password: /['"](.*smtp.*password.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      email_auth: /['"](.*email.*auth.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,

      // FTP credentials
      ftp_credentials: /ftp:\/\/[^'"\s]+:[^'"\s]+@[^'"\s]+/gi,

      // SSH keys
      ssh_private_key: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
      ssh_public_key: /ssh-rsa\s+[A-Za-z0-9+\/]+=*\s*/gi,

      // Generic secrets
      secret_key: /['"](.*secret.*)['"]\s*:\s*['"]([^'"]{8,})['"]/gi,
      private_key: /['"](.*private.*key.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,

      // Encryption keys
      encryption_key: /['"](.*encryption.*key.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      cipher_key: /['"](.*cipher.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,

      // Session secrets
      session_secret: /['"](.*session.*secret.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      cookie_secret: /['"](.*cookie.*secret.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,

      // Cloud credentials
      aws_credentials: /['"](.*aws.*secret.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      gcp_credentials: /['"](.*gcp.*key.*)['"]\s*:\s*['"]([^'"]+)['"]/gi,

      // Generic passwords
      password_generic: /['"](.*password.*)['"]\s*:\s*['"]([^'"]{4,})['"]/gi,

      // Hardcoded usernames
      admin_user:
        /['"](admin|administrator|root|user)['"]\s*:\s*['"]([^'"]+)['"]/gi,
    };

    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const scriptContent = script.textContent || script.innerHTML || "";
      const scriptSrc = script.src || "inline";

      Object.entries(credentialPatterns).forEach(([credType, pattern]) => {
        const matches = Array.from(scriptContent.matchAll(pattern));
        matches.forEach((match) => {
          const key = match[1] || "unknown";
          const value = match[2] || match[0];

          // entropy gate to reduce false positives; skip ultra-low entropy
          const H = credentialPatterns._entropy(value);
          if (value && value.length > 3 && H >= 2.5) {
            credentials.push({
              type: credType,
              key: key,
              value: value,
              location: `script[${index}]`,
              source: scriptSrc,
              context: getContext(scriptContent, match[0], 80),
              risk: getCredentialRiskLevel(credType, value),
              timestamp: new Date().toISOString(),
            });
          }
        });
      });
    });

    console.log(
      `%c🔐 Found ${credentials.length} potential credentials/secrets`,
      credentials.length > 0 ? styles.secret : styles.info
    );
    return credentials;
  }

  // ===========================================
  // ⚙️ CONFIGURATION DATA EXTRACTOR
  // ===========================================

  function extractConfigurations() {
    const configurations = {
      debug: [],
      environment: [],
      features: [],
      endpoints: [],
      thirdParty: [],
      security: [],
    };

    // Debug/Development configurations
    const debugPatterns = {
      debug_mode:
        /['"](debug|DEBUG|debugMode|enableDebug|isDebug)['"]\s*:\s*(true|1|"on")/gi,
      dev_mode:
        /['"](development|dev|DEV|devMode|isDev|env)['"]\s*:\s*(true|1|"on"|"development")/gi,
      verbose_logging:
        /['"](verbose|logging|log_level|trace|debugLogging|enableLogs|logMode)['"]\s*:\s*['"](debug|verbose|trace|all|true|1)["']/gi,
      source_maps:
        /['"](sourceMaps?|source_maps?|enableSourceMap|generateSourceMap)['"]\s*:\s*(true|1|"on")/gi,
      test_mode:
        /['"](test|testing|unitTest|e2e|qa|simulate)['"]\s*:\s*(true|1|"on")/gi,
      sandbox_mode:
        /['"](sandbox|mock|simulate|fake|dummy)['"]\s*:\s*(true|1|"on")/gi,
      staging_env:
        /['"](staging|preprod|preview|beta)['"]\s*:\s*(true|1|"on")/gi,
      profiling_enabled:
        /['"](profiling|performanceTracking|perfMonitor)['"]\s*:\s*(true|1|"on")/gi,
      hot_reload: /['"](hotReload|liveReload|hmr)['"]\s*:\s*(true|1|"on")/gi,
      build_info:
        /['"](buildInfo|buildMeta|buildVersion|buildHash)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_flags:
        /['"](NODE_ENV|ENV|environment)['"]\s*:\s*['"](development|dev|test|staging)['"]/gi,
      debug_port:
        /['"](debugPort|devPort|testPort)['"]\s*:\s*['"]?[0-9]{3,5}['"]?/gi,
      trace_enabled:
        /['"](enableTrace|traceMode|tracing)['"]\s*:\s*(true|1|"on")/gi,
      insecure_flag:
        /['"](allowInsecure|disableSecurity|skipAuth|noAuth)['"]\s*:\s*(true|1|"on")/gi,
      test_credentials:
        /['"](testUser|testPassword|dummyCreds|fakeLogin)['"]\s*:\s*['"][^'"]+['"]/gi,
      mock_data:
        /['"](useMockData|mockApi|mockResponse|fakeData)['"]\s*:\s*(true|1|"on")/gi,
      debug_headers:
        /['"](X-Debug|X-Dev-Mode|X-Test-Env)['"]\s*:\s*['"]?(true|1|on|enabled)['"]?/gi,
      verbose_flag:
        /['"](verboseFlag|debugFlag|logEverything)['"]\s*:\s*(true|1|"on")/gi,
      test_hooks:
        /['"](testHooks|devHooks|debugHooks)['"]\s*:\s*(true|1|"on")/gi,
      fake_services:
        /['"](useFakeServices|mockServices|simulateBackend)['"]\s*:\s*(true|1|"on")/gi,
      debug_token:
        /['"](debugToken|devToken|testToken)['"]\s*:\s*['"][^'"]+['"]/gi,
      debug_user: /['"](debugUser|devUser|testUser)['"]\s*:\s*['"][^'"]+['"]/gi,
      debug_api: /['"](debugApi|devApi|testApi)['"]\s*:\s*['"][^'"]+['"]/gi,
      debug_config:
        /['"](debugConfig|devConfig|testConfig)['"]\s*:\s*['"][^'"]+['"]/gi,
      debug_feature_flag:
        /['"](enableDebugFeature|debugFeatureFlag)['"]\s*:\s*(true|1|"on")/gi,
      debug_console:
        /['"](showDebugConsole|enableConsole)['"]\s*:\s*(true|1|"on")/gi,
      debug_ui: /['"](debugUI|devUI|testUI)['"]\s*:\s*(true|1|"on")/gi,
      debug_assets:
        /['"](loadDebugAssets|debugStatic|debugBundle)['"]\s*:\s*(true|1|"on")/gi,
      debug_mode_env:
        /process\.env\.(DEBUG|DEV|NODE_ENV)\s*===?\s*['"](true|1|on|development|debug)['"]/gi,
      debug_flag_env:
        /process\.env\.(ENABLE_DEBUG|VERBOSE_LOGGING|DEBUG_MODE)\s*===?\s*['"](true|1|on)['"]/gi,
    };

    // Environment configurations
    const envPatterns = {
      env_vars: /process\.env\.[A-Z0-9_]+/gi,
      node_env: /NODE_ENV/gi,
      environment:
        /['"](environment|env|runtimeEnv|executionEnv)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      stage:
        /['"](stage|staging|deploymentStage|releaseStage)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      prod_flag: /['"](isProd|production|prodMode)['"]\s*:\s*(true|1|"on")/gi,
      dev_flag: /['"](isDev|development|devMode)['"]\s*:\s*(true|1|"on")/gi,
      test_flag: /['"](isTest|testMode|testing)['"]\s*:\s*(true|1|"on")/gi,
      qa_flag: /['"](isQA|qaMode)['"]\s*:\s*(true|1|"on")/gi,
      sandbox_flag: /['"](isSandbox|sandboxMode)['"]\s*:\s*(true|1|"on")/gi,
      env_config:
        /['"](envConfig|configEnv|envSettings)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_file:
        /['"](envFile|dotenv|configFile)['"]\s*:\s*['"][^'"]+\.env['"]/gi,
      env_type: /['"](envType|buildEnv|targetEnv)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_name: /['"](envName|nameOfEnv)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_label: /['"](envLabel|label)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_id: /['"](envId|environmentId)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_token: /['"](envToken|environmentToken)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_secret:
        /['"](envSecret|environmentSecret)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_key: /['"](envKey|environmentKey)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_url: /['"](envUrl|environmentUrl)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_api: /['"](envApi|environmentApi)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_port:
        /['"](envPort|environmentPort)['"]\s*:\s*['"]?[0-9]{2,5}['"]?/gi,
      env_host: /['"](envHost|environmentHost)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_domain:
        /['"](envDomain|environmentDomain)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_region:
        /['"](envRegion|environmentRegion)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_zone: /['"](envZone|availabilityZone)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_cluster: /['"](envCluster|clusterName)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_instance: /['"](envInstance|instanceId)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_profile: /['"](envProfile|profileName)['"]\s*:\s*['"][^'"]+['"]/gi,
      env_version: /['"](envVersion|versionTag)['"]\s*:\s*['"][^'"]+['"]/gi,
    };

    // Feature flags
    const featurePatterns = {
      feature_flags:
        /['"](feature[s]?|flag[s]?|featureFlags|flagsConfig|enabledFeatures|featureToggles)['"]\s*:\s*\{[^}]+\}/gi,
      experiments:
        /['"](experiment[s]?|test[s]?|abTest|multivariateTest|experimentConfig|experimentsEnabled)['"]\s*:\s*\{[^}]+\}/gi,
      beta_features:
        /['"](beta|alpha|canary|preview|earlyAccess|experimental|unstable|nextGen|futureFeature)['"]\s*:\s*(true|1|"on")/gi,
      rollout_flags:
        /['"](rollout|rolloutFlag|gradualRollout|featureRollout)['"]\s*:\s*(true|1|"on")/gi,
      gated_features:
        /['"](gatedFeature|featureGate|accessGate|gatekeeper)['"]\s*:\s*(true|1|"on")/gi,
      toggle_flags:
        /['"](toggle|featureToggle|flagToggle|switch)['"]\s*:\s*(true|1|"on")/gi,
      staged_features:
        /['"](stagedFeature|featureStage|stageFlag)['"]\s*:\s*(true|1|"on")/gi,
      dev_features:
        /['"](devFeature|debugFeature|testFeature)['"]\s*:\s*(true|1|"on")/gi,
      ui_flags: /['"](uiFeature|uiFlag|uiToggle)['"]\s*:\s*(true|1|"on")/gi,
      api_flags: /['"](apiFeature|apiFlag|apiToggle)['"]\s*:\s*(true|1|"on")/gi,
      mobile_flags:
        /['"](mobileFeature|mobileFlag|mobileToggle)['"]\s*:\s*(true|1|"on")/gi,
      platform_flags:
        /['"](platformFeature|platformFlag|platformToggle)['"]\s*:\s*(true|1|"on")/gi,
      region_flags:
        /['"](regionFeature|regionFlag|regionToggle)['"]\s*:\s*(true|1|"on")/gi,
      language_flags:
        /['"](languageFeature|languageFlag|languageToggle)['"]\s*:\s*(true|1|"on")/gi,
      access_flags:
        /['"](accessFeature|accessFlag|accessToggle)['"]\s*:\s*(true|1|"on")/gi,
      entitlement_flags:
        /['"](entitlementFeature|entitlementFlag|entitlementToggle)['"]\s*:\s*(true|1|"on")/gi,
      config_flags:
        /['"](configFeature|configFlag|configToggle)['"]\s*:\s*(true|1|"on")/gi,
      release_flags:
        /['"](releaseFeature|releaseFlag|releaseToggle)['"]\s*:\s*(true|1|"on")/gi,
      hidden_flags:
        /['"](hiddenFeature|hiddenFlag|hiddenToggle)['"]\s*:\s*(true|1|"on")/gi,
      legacy_flags:
        /['"](legacyFeature|legacyFlag|legacyToggle)['"]\s*:\s*(true|1|"on")/gi,
      override_flags:
        /['"](overrideFeature|overrideFlag|overrideToggle)['"]\s*:\s*(true|1|"on")/gi,
      test_flags:
        /['"](testFlag|testToggle|testFeature)['"]\s*:\s*(true|1|"on")/gi,
      feature_env: /process\.env\.(FEATURE_|FLAG_)[A-Z0-9_]+/gi,
      feature_list:
        /['"](featuresList|availableFeatures|enabledFlags)['"]\s*:\s*\[[^\]]+\]/gi,
      feature_map: /['"](featureMap|flagMap|toggleMap)['"]\s*:\s*\{[^}]+\}/gi,
      feature_config:
        /['"](featureConfig|flagConfig|toggleConfig)['"]\s*:\s*\{[^}]+\}/gi,
      feature_enabled:
        /['"](isFeatureEnabled|hasFeature|featureIsOn)['"]\s*:\s*(true|1|"on")/gi,
      feature_disabled:
        /['"](isFeatureDisabled|featureIsOff)['"]\s*:\s*(true|1|"on")/gi,
      feature_flag_env: /process\.env\.(ENABLE_FEATURE_|USE_FLAG_)[A-Z0-9_]+/gi,
    };

    // Third-party configurations
    const thirdPartyPatterns = {
      analytics:
        /['"](analytics|ga|gtm|mixpanel|segment|amplitude|heap|clarity|snowplow|matomo|piwik)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      tracking:
        /['"](tracking|pixel|trackId|trackingId|beacon|tracker|utm|campaign)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      cdn_config:
        /['"](cdn|cloudfront|akamai|fastly|imgix|keycdn|jsdelivr|unpkg|netlify)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      social_auth:
        /['"](facebook|google|twitter|github|linkedin|apple|microsoft|discord|slack|twitch|reddit)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      payment_gateway:
        /['"](stripe|paypal|square|razorpay|adyen|braintree|checkout)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      chat_sdk:
        /['"](intercom|drift|zendesk|livechat|tawk|freshchat)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      error_monitoring:
        /['"](sentry|rollbar|bugsnag|raygun|logrocket)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      performance_monitoring:
        /['"](newrelic|datadog|appdynamics|dynatrace)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      video_embed:
        /['"](youtube|vimeo|wistia|jwplayer)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      maps_sdk:
        /['"](googlemaps|mapbox|leaflet|here)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      auth_sdk:
        /['"](auth0|firebase|okta|onelogin|keycloak)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      crm_sdk:
        /['"](salesforce|hubspot|zoho|pipedrive|freshsales)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      email_sdk:
        /['"](sendgrid|mailchimp|postmark|mailgun|sparkpost)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      sms_sdk:
        /['"](twilio|nexmo|plivo|textlocal)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      push_sdk:
        /['"](onesignal|firebasepush|airship|pusher)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      translation_sdk:
        /['"](googletranslate|deepl|lokalise|crowdin)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      captcha_sdk:
        /['"](recaptcha|hcaptcha|turnstile)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      ads_sdk:
        /['"](adsense|admob|facebookads|taboola|outbrain)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      storage_sdk:
        /['"](awsS3|gcs|azureblob|cloudinary)['"]\s*:\s*['"]([^'"]+)['"]/gi,
    };

    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const scriptContent = script.textContent || script.innerHTML || "";
      const scriptSrc = script.src || "inline";

      // Extract debug configurations
      Object.entries(debugPatterns).forEach(([configType, pattern]) => {
        const matches = Array.from(scriptContent.matchAll(pattern));
        matches.forEach((match) => {
          configurations.debug.push({
            type: configType,
            value: match[0],
            location: `script[${index}]`,
            source: scriptSrc,
            context: getContext(scriptContent, match[0], 60),
            risk: "HIGH",
          });
        });
      });

      // Extract environment configurations
      Object.entries(envPatterns).forEach(([configType, pattern]) => {
        const matches = Array.from(scriptContent.matchAll(pattern));
        matches.forEach((match) => {
          configurations.environment.push({
            type: configType,
            value: match[0],
            location: `script[${index}]`,
            source: scriptSrc,
            context: getContext(scriptContent, match[0], 60),
            risk: "MEDIUM",
          });
        });
      });

      // Extract feature flags
      Object.entries(featurePatterns).forEach(([configType, pattern]) => {
        const matches = Array.from(scriptContent.matchAll(pattern));
        matches.forEach((match) => {
          configurations.features.push({
            type: configType,
            value: match[0],
            location: `script[${index}]`,
            source: scriptSrc,
            context: getContext(scriptContent, match[0], 80),
            risk: "MEDIUM",
          });
        });
      });

      // Extract third-party configurations
      Object.entries(thirdPartyPatterns).forEach(([configType, pattern]) => {
        const matches = Array.from(scriptContent.matchAll(pattern));
        matches.forEach((match) => {
          configurations.thirdParty.push({
            type: configType,
            value: match[0],
            location: `script[${index}]`,
            source: scriptSrc,
            context: getContext(scriptContent, match[0], 60),
            risk: "LOW",
          });
        });
      });
    });

    const totalConfigs = Object.values(configurations).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    console.log(
      `%c⚙️ Found ${totalConfigs} configuration disclosures`,
      totalConfigs > 0 ? styles.config : styles.info
    );

    return configurations;
  }

  // ===========================================
  // 👂 EVENT LISTENERS MAPPER
  // ===========================================

  function mapEventListeners() {
    const listeners = [];

    // Override addEventListener to capture new listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const capturedListeners = [];

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      try {
        const listenerInfo = {
          element: this,
          eventType: String(type),
          listenerFunction:
            (listener && listener.toString
              ? listener.toString().substring(0, 280)
              : String(listener)
            ).replace(/\n+/g, " ") + "...",
          options: options,
          targetTag: this.tagName || "Window/Document",
          targetId: this.id || "no-id",
          targetClass: this.className || "no-class",
          stack: (new Error().stack || "").split("\n").slice(1, 5),
          timestamp: new Date().toISOString(),
          source: "addEventListener",
        };

        capturedListeners.push(listenerInfo);
      } catch (_) {}

      return originalAddEventListener.call(this, type, listener, options);
    };

    // Capture removeEventListener to know when listeners go away
    const originalRemoveEventListener =
      EventTarget.prototype.removeEventListener;
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options
    ) {
      try {
        capturedListeners.push({
          element: this,
          eventType: String(type),
          listenerFunction:
            (listener && listener.toString
              ? listener.toString().substring(0, 200)
              : String(listener)) + "...",
          options,
          targetTag: this.tagName || "Window/Document",
          targetId: this.id || "no-id",
          targetClass: this.className || "no-class",
          removed: true,
          timestamp: new Date().toISOString(),
          source: "removeEventListener",
        });
      } catch (_) {}
      return originalRemoveEventListener.call(this, type, listener, options);
    };

    // Scan existing inline event handlers
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element, index) => {
      const eventAttributes = [
        // Mouse Events
        "onclick",
        "ondblclick",
        "onmousedown",
        "onmouseup",
        "onmouseenter",
        "onmouseleave",
        "onmouseover",
        "onmouseout",
        "onmousemove",
        "onwheel",
        "oncontextmenu",

        // Keyboard Events
        "onkeydown",
        "onkeypress",
        "onkeyup",

        // Form Events
        "onchange",
        "oninput",
        "oninvalid",
        "onreset",
        "onsubmit",

        // Focus Events
        "onfocus",
        "onblur",
        "onfocusin",
        "onfocusout",

        // Clipboard Events
        "oncopy",
        "oncut",
        "onpaste",

        // Drag Events
        "ondrag",
        "ondragend",
        "ondragenter",
        "ondragleave",
        "ondragover",
        "ondragstart",
        "ondrop",

        // Touch Events
        "ontouchstart",
        "ontouchend",
        "ontouchmove",
        "ontouchcancel",

        // Pointer Events
        "onpointerdown",
        "onpointerup",
        "onpointermove",
        "onpointerover",
        "onpointerout",
        "onpointerenter",
        "onpointerleave",
        "onpointercancel",
        "ongotpointercapture",
        "onlostpointercapture",

        // Media Events
        "onabort",
        "oncanplay",
        "oncanplaythrough",
        "ondurationchange",
        "onemptied",
        "onended",
        "onloadeddata",
        "onloadedmetadata",
        "onloadstart",
        "onpause",
        "onplay",
        "onplaying",
        "onprogress",
        "onratechange",
        "onseeked",
        "onseeking",
        "onstalled",
        "onsuspend",
        "ontimeupdate",
        "onvolumechange",
        "onwaiting",

        // Animation & Transition Events
        "onanimationstart",
        "onanimationend",
        "onanimationiteration",
        "ontransitionstart",
        "ontransitionend",
        "ontransitionrun",
        "ontransitioncancel",

        // Window & Document Events
        "onload",
        "onunload",
        "onbeforeunload",
        "onresize",
        "onscroll",
        "onerror",
        "onhashchange",
        "onpopstate",
        "onstorage",
        "onvisibilitychange",
        "onreadystatechange",
      ];

      eventAttributes.forEach((eventAttr) => {
        if (element.hasAttribute(eventAttr)) {
          const handler = element.getAttribute(eventAttr);

          listeners.push({
            element: element,
            eventType: eventAttr.substring(2), // Remove 'on' prefix
            listenerFunction: handler,
            targetTag: element.tagName,
            targetId: element.id || "no-id",
            targetClass: element.className || "no-class",
            source: "inline_attribute",
            risk: analyzeListenerRisk(handler),
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    // Add captured listeners
    listeners.push(...capturedListeners);

    // Dedupe by element + eventType + handler signature
    const seen = new Set();
    const deduped = listeners.filter((l) => {
      try {
        const id = `${l.targetTag || "*"}|${l.targetId || "*"}|${
          l.targetClass || "*"
        }|${l.eventType}|${(l.listenerFunction || "").slice(0, 80)}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      } catch (_) {
        return true;
      }
    });

    console.log(
      `%c👂 Mapped ${deduped.length} event listeners`,
      deduped.length > 0 ? styles.gold : styles.info
    );

    return deduped;
  }

  // ===========================================
  // 🗺️ DISCLOSURE MAP CREATOR
  // ===========================================

  function createDisclosureMap() {
    const disclosureMap = {
      criticalFindings: [],
      highRiskFindings: [],
      mediumRiskFindings: [],
      interestingFindings: [],
      summary: {},
      recommendations: [],
    };

    // Analyze all findings and categorize by risk
    const allFindings = [
      ...(window.jsDisclosureHunter.apiKeys || []),
      ...(window.jsDisclosureHunter.endpoints || []),
      ...(window.jsDisclosureHunter.credentials || []),
    ];

    allFindings.forEach((finding) => {
      const riskCategory =
        {
          CRITICAL: "criticalFindings",
          HIGH: "highRiskFindings",
          MEDIUM: "mediumRiskFindings",
          LOW: "interestingFindings",
        }[finding.risk] || "interestingFindings";

      disclosureMap[riskCategory].push(finding);
    });

    // Generate summary
    disclosureMap.summary = {
      totalFindings: allFindings.length,
      critical: disclosureMap.criticalFindings.length,
      high: disclosureMap.highRiskFindings.length,
      medium: disclosureMap.mediumRiskFindings.length,
      low: disclosureMap.interestingFindings.length,
      p1Potential:
        disclosureMap.criticalFindings.length +
        disclosureMap.highRiskFindings.length,
    };

    // Generate recommendations
    if (disclosureMap.criticalFindings.length > 0) {
      disclosureMap.recommendations.push({
        priority: "CRITICAL",
        action:
          "Immediate investigation required - potential P1 vulnerabilities",
        findings: disclosureMap.criticalFindings.length,
      });
    }

    if (disclosureMap.highRiskFindings.length > 0) {
      disclosureMap.recommendations.push({
        priority: "HIGH",
        action: "High-priority testing recommended",
        findings: disclosureMap.highRiskFindings.length,
      });
    }

    console.log(
      `%c🗺️ Created disclosure map with ${disclosureMap.summary.totalFindings} findings`,
      styles.gold
    );
    return disclosureMap;
  }

  // ===========================================
  // 🛠️ UTILITY FUNCTIONS
  // ===========================================

  function getContext(content, match, contextLength) {
    const index = content.indexOf(match);
    if (index === -1) return String(match).substring(0, contextLength);

    const start = Math.max(0, index - contextLength);
    const end = Math.min(
      content.length,
      index + String(match).length + contextLength
    );

    return content.substring(start, end);
  }

  function getKeyRiskLevel(keyType) {
    const criticalKeys = [
      "aws_secret_key",
      "jwt_token",
      "github_token",
      "openai_api_key",
      "ssh_private_key",
      "pem_private_key",
      "pgp_private_key",
    ];
    const highRiskKeys = [
      "aws_access_key",
      "stripe_secret",
      "slack_webhook",
      "sendgrid_api_key",
    ];

    if (criticalKeys.includes(keyType)) return "CRITICAL";
    if (highRiskKeys.includes(keyType)) return "HIGH";
    return "MEDIUM";
  }

  function getEndpointRiskLevel(endpointType, endpoint) {
    const criticalEndpoints = [
      "admin_endpoints",
      "debug_endpoints",
      "internal_endpoints",
    ];
    const highRiskEndpoints = [
      "api_endpoints",
      "auth_endpoints",
      "upload_endpoints",
    ];

    const ep = String(endpoint || "").toLowerCase();
    if (criticalEndpoints.includes(endpointType)) return "CRITICAL";
    if (highRiskEndpoints.includes(endpointType)) return "HIGH";
    if (ep.includes("staging") || ep.includes("dev")) return "HIGH";
    if (window.location.protocol === "https:" && /^http:\/\//.test(endpoint))
      return "HIGH";
    return "MEDIUM";
  }

  function getCredentialRiskLevel(credType, value) {
    const criticalCreds = ["db_password", "ssh_private_key", "secret_key"];
    const highRiskCreds = ["smtp_password", "admin_user", "session_secret"];

    if (criticalCreds.includes(credType)) return "CRITICAL";
    if (highRiskCreds.includes(credType)) return "HIGH";
    if (value.length > 20) return "MEDIUM";
    return "LOW";
  }

  function guessHTTPMethod(content, endpoint) {
    const idx = content.indexOf(endpoint);
    const contextBefore = content.substring(Math.max(0, idx - 140), idx);

    if (/\b(post)\b/i.test(contextBefore)) return "POST";
    if (/\b(put)\b/i.test(contextBefore)) return "PUT";
    if (/\b(delete)\b/i.test(contextBefore)) return "DELETE";
    if (/\b(patch)\b/i.test(contextBefore)) return "PATCH";

    // axios.<method>(url)
    if (/axios\.(post)\s*\(/i.test(contextBefore)) return "POST";
    if (/axios\.(put)\s*\(/i.test(contextBefore)) return "PUT";
    if (/axios\.(delete)\s*\(/i.test(contextBefore)) return "DELETE";
    if (/axios\.(patch)\s*\(/i.test(contextBefore)) return "PATCH";

    return "GET";
  }

  function extractAjaxEndpoints() {
    const endpoints = [];
    const scripts = document.querySelectorAll("script");

    scripts.forEach((script, index) => {
      const content = script.textContent || "";

      // Look for AJAX/Fetch patterns
      const ajaxPatterns = [
        // jQuery
        /\.ajax\(\s*\{[^}]*url\s*:\s*['"]([^'"]+)['"]/gi,
        /\$\.get\(\s*['"]([^'"]+)['"]/gi,
        /\$\.post\(\s*['"]([^'"]+)['"]/gi,
        /\$\.put\(\s*['"]([^'"]+)['"]/gi,
        /\$\.delete\(\s*['"]([^'"]+)['"]/gi,

        // Fetch API
        /fetch\(\s*['"]([^'"]+)['"]/gi,
        /fetch\(\s*\{[^}]*method\s*:\s*['"](GET|POST|PUT|DELETE|PATCH)['"]/gi,

        // XMLHttpRequest
        /XMLHttpRequest.*open\(\s*['"](GET|POST|PUT|DELETE)['"],\s*['"]([^'"]+)['"]/gi,
        /xhr\.open\(\s*['"](GET|POST|PUT|DELETE)['"],\s*['"]([^'"]+)['"]/gi,

        // Axios
        /axios\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi,
        /axios\.request\(\s*\{[^}]*url\s*:\s*['"]([^'"]+)['"]/gi,

        // SuperAgent
        /request\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // Express (server-side)
        /app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,
        /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // Koa
        /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // Fastify
        /fastify\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // Node.js HTTP
        /http\.request\(\s*['"]([^'"]+)['"]/gi,
        /https\.request\(\s*['"]([^'"]+)['"]/gi,

        // WebSocket
        /new\s+WebSocket\(['"]([^'"]+)['"]/gi,

        // GraphQL
        /graphql\(\s*\{[^}]*query\s*:\s*['"`]([^'"`]+)['"`]/gi,
        /gql\(['"`]([^'"`]+)['"`]\)/gi,

        // RPC
        /jsonrpc\.(call|request)\(['"]([^'"]+)['"]/gi,

        // Django (Python)
        /requests\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // Flask (Python)
        /@app\.route\(['"]([^'"]+)['"],\s*methods=\[['"]?(GET|POST|PUT|DELETE)['"]?\]/gi,

        // Angular HttpClient
        /httpClient\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // Vue Resource
        /this\.\$http\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,

        // React (Fetch/Axios)
        /useEffect\(\(\)\s*=>\s*fetch\(['"]([^'"]+)['"]/gi,
        /useEffect\(\(\)\s*=>\s*axios\.(get|post|put|delete)\(['"]([^'"]+)['"]/gi,

        // Next.js API routes
        /fetch\(['"]\/api\/([^'"]+)['"]/gi,

        // Svelte
        /onMount\(\(\)\s*=>\s*fetch\(['"]([^'"]+)['"]/gi,

        // Redux Thunk
        /dispatch\(\s*fetch\(['"]([^'"]+)['"]/gi,

        // Redux Saga
        /yield\s*call\(fetch,\s*['"]([^'"]+)['"]/gi,

        // RESTful patterns
        /GET\s+\/[a-z0-9_\-\/]+/gi,
        /POST\s+\/[a-z0-9_\-\/]+/gi,
        /PUT\s+\/[a-z0-9_\-\/]+/gi,
        /DELETE\s+\/[a-z0-9_\-\/]+/gi,

        // Generic URL access
        /url\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
        /endpoint\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
        /apiUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
        /baseUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,

        // Curl command (shell)
        /curl\s+-X\s+(GET|POST|PUT|DELETE)\s+['"]https?:\/\/[^'"]+['"]/gi,

        // Python urllib
        /urllib\.request\.urlopen\(['"]([^'"]+)['"]/gi,

        // Java HttpURLConnection
        /HttpURLConnection\s+url\s*=\s*\(HttpURLConnection\)\s*new\s+URL\(['"]([^'"]+)['"]/gi,
      ];

      ajaxPatterns.forEach((pattern) => {
        const matches = Array.from(content.matchAll(pattern));
        matches.forEach((match) => {
          const endpoint = match[1] || match[2];
          if (endpoint && endpoint.length > 3) {
            endpoints.push({
              type: "ajax_endpoint",
              endpoint: endpoint,
              location: `script[${index}]`,
              source: script.src || "inline",
              method: match[0].includes("post") ? "POST" : "GET",
              context: getContext(content, match[0], 80),
              risk: "MEDIUM",
              timestamp: new Date().toISOString(),
            });
          }
        });
      });
    });

    return endpoints;
  }

  // ===========================================
  // 🛰️ RUNTIME INTERCEPTION + NORMALIZATION
  // ===========================================

  function setupRuntimeInterception() {
    // Monitor dynamically added scripts
    try {
      if (!window.__jsdh_script_observer) {
        const obs = new MutationObserver((mutations) => {
          mutations.forEach((m) => {
            m.addedNodes &&
              m.addedNodes.forEach((n) => {
                try {
                  if (n.tagName === "SCRIPT") {
                    pushNetworkLog({
                      type: "script_added",
                      src: n.src || "inline",
                    });
                  }
                } catch {}
              });
          });
        });
        obs.observe(document.documentElement || document.body, {
          childList: true,
          subtree: true,
        });
        window.__jsdh_script_observer = true;
      }
    } catch (e) {}

    // Monitor WebSocket usage
    try {
      if (!window.__jsdh_ws_patched && window.WebSocket) {
        const OriginalWS = window.WebSocket;
        window.WebSocket = function (url, protocols) {
          try {
            pushNetworkLog({ type: "ws_open", url: url });
          } catch (e) {}
          const ws = new OriginalWS(url, protocols);
          const _send = ws.send;
          ws.send = function (d) {
            try {
              pushNetworkLog({
                type: "ws_send",
                url: url,
                data: String(d).substring(0, 200),
              });
            } catch (e) {}
            return _send.apply(ws, arguments);
          };
          ws.addEventListener("message", (ev) => {
            try {
              pushNetworkLog({
                type: "ws_message",
                url: url,
                data: String(ev.data).substring(0, 200),
              });
            } catch (e) {}
          });
          ws.addEventListener("close", () => {
            try {
              pushNetworkLog({ type: "ws_close", url: url });
            } catch (e) {}
          });
          return ws;
        };
        window.__jsdh_ws_patched = true;
      }
    } catch (e) {}

    // Track dangerous eval-like usage
    try {
      if (!window.__jsdh_eval_patched) {
        const _eval = window.eval;
        window.eval = function (str) {
          try {
            pushNetworkLog({
              type: "eval",
              code: String(str).substring(0, 200),
            });
          } catch (e) {}
          return _eval.apply(this, arguments);
        };
        const _fn = window.Function;
        window.Function = function () {
          try {
            var argsArr = Array.prototype.slice.call(arguments);
            var body = argsArr.length
              ? String(argsArr[argsArr.length - 1])
              : "";
            pushNetworkLog({
              type: "function_ctor",
              args: body.substring(0, 200),
            });
          } catch (e) {}
          return _fn.apply(this, arguments);
        };
        window.__jsdh_eval_patched = true;
      }
    } catch (e) {}
    try {
      // Patch fetch
      if (!window.__jsdh_fetch_patched && window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = async function (input, init = {}) {
          const url = typeof input === "string" ? input : input && input.url;
          const method = (init && (init.method || init.type)) || "GET";
          const headers = (init && init.headers) || {};
          const credentials = init && init.credentials;
          const mode = init && init.mode;
          const body = init && init.body;
          const startTime = Date.now();
          try {
            const res = await originalFetch.apply(this, arguments);
            const duration = Date.now() - startTime;
            pushNetworkLog({
              type: "fetch",
              url,
              method,
              status: res.status,
              ok: res.ok,
              credentials,
              mode,
              requestHeaders: headers,
              requestBody:
                typeof body === "string" ? body.substring(0, 500) : undefined,
              durationMs: duration,
            });
            // Capture endpoints
            if (url) {
              const normalized = normalizeURL(url);
              if (normalized) {
                (window.jsDisclosureHunter.endpoints ||= []).push({
                  type: "runtime_endpoint",
                  endpoint: normalized,
                  location: "runtime",
                  source: "fetch",
                  context: `${method} ${normalized}`,
                  method: method,
                  risk: getEndpointRiskLevel("api_endpoints", normalized),
                  timestamp: new Date().toISOString(),
                });
              }
            }
            return res;
          } catch (err) {
            pushNetworkLog({
              type: "fetch",
              url,
              method,
              error: String(err),
            });
            throw err;
          }
        };
        window.__jsdh_fetch_patched = true;
      }

      // Patch navigator.sendBeacon
      try {
        if (!window.__jsdh_beacon_patched && navigator.sendBeacon) {
          const originalBeacon = navigator.sendBeacon.bind(navigator);
          navigator.sendBeacon = function (url, data) {
            try {
              const size =
                data &&
                (data.size || (typeof data === "string" ? data.length : 0));
              pushNetworkLog({ type: "beacon", url, size });
              const normalized = normalizeURL(url);
              if (normalized) {
                (window.jsDisclosureHunter.endpoints ||= []).push({
                  type: "runtime_endpoint",
                  endpoint: normalized,
                  location: "runtime",
                  source: "beacon",
                  context: `BEACON ${normalized}`,
                  method: "BEACON",
                  risk: getEndpointRiskLevel("api_endpoints", normalized),
                  timestamp: new Date().toISOString(),
                });
              }
            } catch (e) {}
            return originalBeacon.apply(navigator, arguments);
          };
          window.__jsdh_beacon_patched = true;
        }
      } catch (e) {}

      // Patch XMLHttpRequest
      if (!window.__jsdh_xhr_patched && window.XMLHttpRequest) {
        const OriginalXHR = window.XMLHttpRequest;
        function WrappedXHR() {
          const xhr = new OriginalXHR();
          let method = "GET";
          let url = "";
          let async = true;
          let startTime = 0;
          const requestHeaders = {};

          const originalOpen = xhr.open;
          xhr.open = function (m, u, a = true) {
            method = m || method;
            url = u || url;
            async = a;
            startTime = Date.now();
            try {
              pushNetworkLog({ type: "xhr_open", method, url, async });
            } catch (e) {}
            return originalOpen.apply(this, arguments);
          };

          const originalSend = xhr.send;
          xhr.send = function (body) {
            this.addEventListener("loadend", function () {
              try {
                const duration = Date.now() - startTime;
                pushNetworkLog({
                  type: "xhr",
                  url,
                  method,
                  status: xhr.status,
                  ok: xhr.status >= 200 && xhr.status < 300,
                  requestHeaders,
                  requestBody:
                    typeof body === "string"
                      ? body.substring(0, 500)
                      : undefined,
                  durationMs: duration,
                });
                const normalized = normalizeURL(url);
                if (normalized) {
                  (window.jsDisclosureHunter.endpoints ||= []).push({
                    type: "runtime_endpoint",
                    endpoint: normalized,
                    location: "runtime",
                    source: "xhr",
                    context: `${method} ${normalized}`,
                    method: method,
                    risk: getEndpointRiskLevel("api_endpoints", normalized),
                    timestamp: new Date().toISOString(),
                  });
                }
              } catch (e) {}
            });
            return originalSend.apply(this, arguments);
          };

          const originalSetRequestHeader = xhr.setRequestHeader;
          xhr.setRequestHeader = function (key, value) {
            requestHeaders[String(key).toLowerCase()] = value;
            try {
              pushNetworkLog({ type: "xhr_header", url, key, value });
            } catch (e) {}
            return originalSetRequestHeader.apply(this, arguments);
          };

          return xhr;
        }
        window.XMLHttpRequest = WrappedXHR;
        window.__jsdh_xhr_patched = true;
      }
    } catch (e) {}
  }

  function pushNetworkLog(entry) {
    try {
      (window.jsDisclosureHunter.networkLogs ||= []).push({
        ...entry,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {}
  }

  function normalizeURL(url) {
    try {
      if (!url) return "";
      // Trim quotes/spaces
      const trimmed = String(url)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      // Resolve relative URLs against location
      const u = new URL(trimmed, window.location.href);
      // Drop fragments
      u.hash = "";
      // Normalize pathname (no trailing slashes unless root)
      if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
        u.pathname = u.pathname.replace(/\/+$/, "");
      }
      return u.toString();
    } catch (e) {
      return String(url);
    }
  }

  function isThirdParty(url) {
    try {
      const u = new URL(url, window.location.href);
      return u.origin !== window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function normalizeAndDedupe(extraction) {
    try {
      // --- Helpers for validation & de-dup ---
      function isStaticAssetURL(url) {
        return /\.(?:png|jpe?g|gif|svg|webp|ico|css|js|map|mjs|cjs|json|woff2?|ttf|eot)(?:\?.*)?$/i.test(
          url || ""
        );
      }
      function isLikelyPlaceholder(str) {
        const s = String(str || "").toLowerCase();
        return /(test|dummy|example|sample|your[_-]?|replace[_-]?me|lorem|changeme|abcd1234|foo|bar)/.test(
          s
        );
      }
      function isLowEntropy(str) {
        try {
          const s = String(str || "");
          if (s.length < 16) return true;
          const unique = new Set(s.split("")).size;
          return unique < Math.min(6, Math.ceil(s.length * 0.2));
        } catch (_) {
          return false;
        }
      }
      function hasMixedCharset(str) {
        const s = String(str || "");
        const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[_\-\.\+=:]/];
        return classes.reduce((n, r) => n + (r.test(s) ? 1 : 0), 0) >= 2;
      }
      function validateAPIKeyEntry(entry) {
        try {
          const v = entry && String(entry.value || "");
          if (!v) return false;

          // Drop obvious placeholders and low-quality strings
          if (isLikelyPlaceholder(v)) return false;
          if (isLowEntropy(v)) return false;
          if (!hasMixedCharset(v)) return false;

          // Reject unicode-escape noise and static assets mistakenly matched
          if (/u00[0-9a-f]{2}/i.test(v)) return false;
          if (
            /\.(?:wasm|js|mjs|cjs|css|png|jpe?g|gif|svg|webp|map|mp4|mp3|woff2?|ttf|eot)(?:\?.*)?$/i.test(
              v
            )
          )
            return false;

          // Type-specific tightening to cut false positives
          const t = String(entry.type || "");
          if (t === "aws_secret_key") {
            // Real AWS secrets typically include lowercase or base64 symbols
            if (!/[a-z+/=]/.test(v)) return false;
          }
          if (t === "jwt_token") {
            // Ensure token has two dots and plausible base64url segments
            const parts = v.split(".");
            if (parts.length !== 3 || parts.some((p) => p.length < 10))
              return false;
          }

          // Context-based guards: avoid obvious docs/examples and CSS noise
          const ctx = (entry.context || "").toLowerCase();
          if (/\b(example|test|dummy|sample|lorem|placeholder)\b/.test(ctx))
            return false;
          if (/source(map| mapping)|webpack|bundle|chunk/i.test(ctx))
            return false;
          if (
            /getcomputedstyle|getpropertyvalue|classlist|css|style\./i.test(ctx)
          )
            return false;
          if (
            /pathTo[A-Z]|wasm|worker|engine|diagram|stockfish|komodo|torch/i.test(
              ctx
            )
          )
            return false;

          // Global variables are noisy; require strong vendor prefixes
          if (entry.source === "global_variable") {
            if (
              !/^(ghp_|gho_|ghr_|glpat-|shpat_|shpca_|PMAK-|SG\.|sk_live_|pk_live_|key-|xox[baprs]-|do_|sk-ant-|sk-)/.test(
                v
              )
            ) {
              return false;
            }
          }

          return true;
        } catch (_) {
          return false;
        }
      }
      function dedupeBySignature(list, signatureFn) {
        const seen = new Set();
        const out = [];
        (list || []).forEach((item) => {
          try {
            const sig = signatureFn(item);
            if (!sig) return;
            if (!seen.has(sig)) {
              seen.add(sig);
              out.push(item);
            }
          } catch (_) {}
        });
        return out;
      }

      // --- Endpoints: normalize, filter static assets, dedupe, enrich ---
      const normalizedEndpoints = (extraction.secrets.endpoints || [])
        .map((e) => ({
          ...e,
          endpoint: normalizeURL(e.endpoint),
          method: (e.method || "GET").toUpperCase(),
        }))
        .filter((e) => e && e.endpoint && !isStaticAssetURL(e.endpoint));

      const dedupedEndpoints = dedupeBySignature(
        normalizedEndpoints,
        (e) => `${e.method}|${e.endpoint}`
      )
        // Drop obvious asset and version URLs
        .filter(
          (e) =>
            !/\.(?:wasm|js|mjs|cjs|css|png|jpe?g|gif|svg|webp|map)(?:\?.*)?$/i.test(
              e.endpoint
            )
        )
        // Drop pure CDN library paths without API semantics
        .filter((e) => !/\/assets?\/|\/static\//i.test(e.endpoint))
        .map((e) => {
          try {
            if (
              window.location.protocol === "https:" &&
              String(e.endpoint).startsWith("http://")
            ) {
              e.risk = "HIGH";
            }
            if (isThirdParty(e.endpoint)) {
              e.thirdParty = true;
            }
          } catch (_) {}
          return e;
        });
      extraction.secrets.endpoints = dedupedEndpoints;

      // --- API Keys: validate and dedupe by type+value ---
      const validatedKeys = (extraction.secrets.apiKeys || []).filter((k) =>
        validateAPIKeyEntry(k)
      );
      extraction.secrets.apiKeys = dedupeBySignature(
        validatedKeys,
        (k) => `${k.type}|${k.value}`
      );

      // --- Credentials: drop placeholders, dedupe by type+value ---
      const filteredCreds = (extraction.secrets.credentials || []).filter(
        (c) => c && c.value && !isLikelyPlaceholder(c.value)
      );
      extraction.secrets.credentials = dedupeBySignature(
        filteredCreds,
        (c) => `${c.type}|${c.value}`
      );

      // --- Listeners: dedupe by event + target + handler signature ---
      extraction.secrets.listeners = dedupeBySignature(
        extraction.secrets.listeners || [],
        (l) =>
          `${l.event || l.type}|${
            l.targetId || l.targetClass || l.selector || "unknown"
          }|${(l.handler || "").toString().slice(0, 120)}`
      );

      // --- Advanced Flags: dedupe by type + (value|context) ---
      extraction.secrets.advancedFlags = dedupeBySignature(
        extraction.secrets.advancedFlags || [],
        (f) =>
          `${f.type || f.category || "flag"}|${
            f.value || f.context || f.source || ""
          }`
      );

      // Configurations / mapping left as-is (objects or pre-grouped)
    } catch (e) {}
  }

  // ===========================================
  // 🚩 ADVANCED FLAGS (7 CATEGORIES)
  // ===========================================
  function extractAdvancedFlags() {
    // Performance: respect optional category toggles
    const cfg =
      (window.jsDisclosureHunter && window.jsDisclosureHunter.config) || {};
    const cat = cfg.categories || {};
    const flags = [];
    const scripts = document.querySelectorAll("script");

    // 1) Source Map Exposure
    const sourceMapRegexes = [
      /\/[#@]\s*sourceMappingURL\s*=\s*([^\s]+)/gi, // JS comment reference
      /sourceMappingURL\s*=\s*["']?([^"'\s>]+\.map)["']?/gi, // HTML or inline
      /\/\/# sourceMappingURL=.*\.map/gi, // JS single-line comment
      /\/\*# sourceMappingURL=.*\.map \*\//gi, // JS block comment
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.js\.map/gi, // JS map file
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.min\.js\.map/gi, // Minified map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.css\.map/gi, // CSS map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.ts\.map/gi, // TypeScript map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.jsx?\.map/gi, // JSX/JS map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.vue\.map/gi, // Vue map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.svelte\.map/gi, // Svelte map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.mjs\.map/gi, // ES module map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.cjs\.map/gi, // CommonJS map
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\.bundle\.map/gi, // Webpack bundle
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/static\/.*\.map/gi, // Static assets
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/dist\/.*\.map/gi, // Dist folder
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/build\/.*\.map/gi, // Build folder
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/out\/.*\.map/gi, // Out folder
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/debug\/.*\.map/gi, // Debug folder
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/temp\/.*\.map/gi, // Temp folder
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/test\/.*\.map/gi, // Test folder
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/sandbox\/.*\.map/gi, // Sandbox
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/webpack\/.*\.map/gi, // Webpack
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/rollup\/.*\.map/gi, // Rollup
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/vite\/.*\.map/gi, // Vite
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/parcel\/.*\.map/gi, // Parcel
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/esbuild\/.*\.map/gi, // esbuild
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/react\/.*\.map/gi, // React
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/angular\/.*\.map/gi, // Angular
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/next\/.*\.map/gi, // Next.js
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/nuxt\/.*\.map/gi, // Nuxt.js
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/svelte\/.*\.map/gi, // SvelteKit
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/storybook\/.*\.map/gi, // Storybook
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/docs\/.*\.map/gi, // Docs
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/examples\/.*\.map/gi, // Examples
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/demo\/.*\.map/gi, // Demo
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/samples\/.*\.map/gi, // Samples
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/legacy\/.*\.map/gi, // Legacy
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/old\/.*\.map/gi, // Old builds
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/archive\/.*\.map/gi, // Archive
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/deprecated\/.*\.map/gi, // Deprecated
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/unused\/.*\.map/gi, // Unused
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/hidden\/.*\.map/gi, // Hidden
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/exposed\/.*\.map/gi, // Exposed
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/public\/.*\.map/gi, // Public
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/open\/.*\.map/gi, // Open
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/client\/.*\.map/gi, // Client
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/server\/.*\.map/gi, // Server
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/admin\/.*\.map/gi, // Admin
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/auth\/.*\.map/gi, // Auth
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/config\/.*\.map/gi, // Config
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/settings\/.*\.map/gi, // Settings
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/secrets\/.*\.map/gi, // Secrets
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/token\/.*\.map/gi, // Token
      /\/[#@]\s*sourceMappingURL\s*=\s*.*\/key\/.*\.map/gi, // Key
    ];
    scripts.forEach((script, index) => {
      const content = script.textContent || script.innerHTML || "";
      const src = script.src || "inline";
      // Iterate all source map regex variants
      sourceMapRegexes.forEach((re) => {
        try {
          const matches = Array.from(content.matchAll(re));
          matches.forEach((m) => {
            flags.push({
              type: "source_map_reference",
              value: m[0],
              url: m[1],
              location: `script[${index}]`,
              source: src,
              context: getContext(content, m[0], 80),
              risk: "HIGH",
              timestamp: new Date().toISOString(),
            });
          });
        } catch (_) {}
      });
    });

    // 2) Firebase/Amplify/Cognito Config Exposure
    if (cat.thirdParty === false && cat.analytics === false) {
      // allow early exit for noisy categories if user disabled
    }
    const cloudKeys = [
      "apiKey",
      "authDomain",
      "projectId",
      "storageBucket",
      "messagingSenderId",
      "appId",
      "region",
      "userPoolId",
      "userPoolWebClientId",
      "identityPoolId",
    ];
    const cloudRegex = new RegExp(
      `[\"'](?:${cloudKeys.join("|")})[\"']\\s*:\\s*[\"'][^\"']+[\"']`,
      "gi"
    );
    scripts.forEach((script, index) => {
      const content = script.textContent || "";
      const src = script.src || "inline";
      const matches = Array.from(content.matchAll(cloudRegex));
      matches.forEach((m) => {
        flags.push({
          type: "cloud_config",
          value: m[0],
          location: `script[${index}]`,
          source: src,
          context: getContext(content, m[0], 80),
          risk: "MEDIUM",
          timestamp: new Date().toISOString(),
        });
      });
    });

    // 3) Tokens and Sensitive Values in Storage + Cookies
    const tokenPatterns = {
      // JWT & Bearer
      jwt: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/,
      bearer: /bearer\s+[a-z0-9\-\._~\+\/]+=*/i,

      // Generic API Keys
      apiKey:
        /(?:api[_-]?key|token|auth|session)[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      accessToken: /access[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      refreshToken:
        /refresh[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      idToken: /id[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,

      // OAuth
      oauthToken: /oauth[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      clientSecret:
        /client[_-]?secret[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      clientId: /client[_-]?id[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,

      // SDK Keys
      firebaseApiKey: /AIza[0-9A-Za-z\-_]{35}/,
      stripeKey: /sk_live_[0-9a-zA-Z]{24}/,
      stripeTestKey: /sk_test_[0-9a-zA-Z]{24}/,
      sendgridKey: /SG\.[0-9A-Za-z\-_]{22}\.[0-9A-Za-z\-_]{22}/,
      twilioKey: /AC[a-z0-9]{32}/,
      mailchimpKey: /[0-9a-f]{32}-us[0-9]{1,2}/,
      githubToken: /ghp_[A-Za-z0-9]{36}/,
      gitlabToken: /glpat-[A-Za-z0-9]{20,}/,
      slackToken: /xox[baprs]-[A-Za-z0-9\-]{10,}/,

      // Cloud Providers
      awsAccessKey: /AKIA[0-9A-Z]{16}/,
      awsSecretKey: /[A-Za-z0-9\/+=]{40}/,
      azureKey: /[A-Za-z0-9]{88}/,
      gcpKey: /[A-Za-z0-9_\-]{20,}\.apps\.googleusercontent\.com/,
      digitalOceanToken: /do_[A-Za-z0-9]{64}/,

      // Database & Storage
      mongoUri: /mongodb:\/\/[^:]+:[^@]+@[^\/]+\/[^\"']+/,
      redisUri: /redis:\/\/[^:]+:[^@]+@[^\/]+/,
      firebaseSecret:
        /firebase[_-]?secret[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{32,})/i,

      // CSRF & Session
      csrfToken: /csrf[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      sessionId: /session[_-]?id[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      sessionToken:
        /session[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,

      // Miscellaneous
      secret: /secret[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      privateKey: /-----BEGIN PRIVATE KEY-----/,
      rsaKey: /-----BEGIN RSA PRIVATE KEY-----/,
      pgpKey: /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
      sshKey: /-----BEGIN OPENSSH PRIVATE KEY-----/,
      vaultToken: /vault[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      apiSecret: /api[_-]?secret[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      encryptionKey:
        /encryption[_-]?key[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,
      tokenValue: /token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,

      // Payment & Identity
      paypalToken: /access_token\$production\$[A-Za-z0-9\-_]+/,
      oktaToken: /00[a-z0-9]{20,}/,
      auth0Token: /auth0[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{16,})/i,

      // Tracking & Analytics
      segmentToken: /SEGMENT_WRITE_KEY\s*=\s*['"][A-Za-z0-9]{32}['"]/i,
      mixpanelToken: /MIXPANEL_TOKEN\s*=\s*['"][A-Za-z0-9]{32}['"]/i,
      amplitudeToken: /AMPLITUDE_API_KEY\s*=\s*['"][A-Za-z0-9]{32}['"]/i,

      // Misc
      tempToken: /temp[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      authToken: /auth[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      loginToken: /login[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
      cookieToken: /cookie[_-]?token[^a-z0-9]{0,5}[\"']?([A-Za-z0-9-_]{12,})/i,
    };
    function getStorageTokenRisk(v) {
      for (const [key, pattern] of Object.entries(tokenPatterns)) {
        if (pattern.test(v)) {
          if (/jwt|accessToken|idToken|bearer/i.test(key)) return "CRITICAL";
          if (
            /session|csrf|auth|refresh|clientSecret|privateKey|vault/i.test(key)
          )
            return "HIGH";
          return "MEDIUM";
        }
      }
      return "LOW";
    }

    try {
      const storages = [
        { ref: window.localStorage, name: "localStorage" },
        { ref: window.sessionStorage, name: "sessionStorage" },
      ];
      storages.forEach((s) => {
        if (!s.ref) return;
        for (let i = 0; i < s.ref.length; i++) {
          const key = s.ref.key(i);
          const value = String(s.ref.getItem(key) || "");
          if (!value) continue;
          if (
            tokenPatterns.jwt.test(value) ||
            tokenPatterns.bearer.test(value) ||
            tokenPatterns.apiKey.test(value) ||
            /accestoken|jwt|idToken|auth|bearer|session/i.test(key)
          ) {
            flags.push({
              type: "storage_token",
              key,
              value:
                value.substring(0, 120) + (value.length > 120 ? "..." : ""),
              storage: s.name,
              risk: getStorageTokenRisk(value),
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
    } catch (e) {}
    try {
      const cookies = String(document.cookie || "").split(/;\s*/);
      cookies.forEach((pair) => {
        const [name, val] = pair.split("=");
        if (!name) return;
        if (
          /accesstoken|jwt|idToken|auth|bearer|session|csrf/i.test(name) ||
          (val &&
            (tokenPatterns.jwt.test(val) || tokenPatterns.bearer.test(val)))
        ) {
          flags.push({
            type: "storage_token",
            key: name,
            value: (val || "").substring(0, 120),
            storage: "cookie",
            risk: getStorageTokenRisk(val || name),
            timestamp: new Date().toISOString(),
          });
        }
      });
    } catch (e) {}

    // 4) Error Monitoring DSNs and Keys
    const monitoringPatterns = {
      // Error Tracking
      sentry_dsn: /https?:\/\/[a-z0-9]+@[a-z0-9\.-]+\/[0-9]+/gi,
      rollbar_token: /accessToken\s*[:=]\s*[\"'][A-Za-z0-9_\-]{16,}[\"']/gi,
      bugsnag_key: /data-apikey\s*=\s*[\"'][A-Za-z0-9_\-]{10,}[\"']/gi,
      raygun_key: /RaygunClient\(['"]?[A-Za-z0-9_\-]{20,}['"]?\)/gi,
      airbrake_project_id: /projectId\s*[:=]\s*\d+/gi,
      airbrake_project_key: /projectKey\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi,

      // Analytics
      google_analytics: /UA-\d{4,9}-\d{1,4}/gi,
      ga4_measurement_id: /G-[A-Z0-9]{10}/gi,
      mixpanel_token: /mixpanel\.init\(['"][A-Za-z0-9]{32}['"]\)/gi,
      segment_write_key: /analytics\.load\(['"][A-Za-z0-9]{32,}['"]\)/gi,
      amplitude_api_key: /amplitude\.init\(['"][A-Za-z0-9]{32}['"]\)/gi,
      heap_app_id: /heap\.load\(['"][0-9]{6,}['"]\)/gi,
      hotjar_id: /hjid\s*[:=]\s*\d+/gi,
      facebook_pixel_id: /fbq\(['"]init['"],\s*['"]\d{15,}['"]\)/gi,
      twitter_pixel_id: /twq\(['"]init['"],\s*['"][a-z0-9]{10,}['"]\)/gi,
      linkedin_partner_id: /partnerId\s*[:=]\s*['"]\d{6,}['"]/gi,

      // Performance Monitoring
      new_relic_license_key: /NREUM\s*=\s*['"][A-Za-z0-9]{40}['"]/gi,
      datadog_client_token: /ddClientToken\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      datadog_app_id: /ddApplicationId\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      appdynamics_account: /AD\.account\s*[:=]\s*['"][A-Za-z0-9_\-]+['"]/gi,
      appdynamics_key: /AD\.key\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      dynatrace_env_id: /DT\.envId\s*[:=]\s*['"][A-Za-z0-9_\-]+['"]/gi,

      // Logging & Telemetry
      loggly_token: /logglyToken\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      splunk_token: /splunkToken\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      elk_endpoint: /elkEndpoint\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
      papertrail_url: /papertrailUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
      sumologic_collector:
        /sumoCollectorCode\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/gi,

      // Generic Secrets
      generic_api_key: /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
      generic_token: /token\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
      generic_secret: /secret\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
      bearer_token: /Bearer\s+[A-Za-z0-9\._\-]+/gi,
      jwt_token: /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/gi,

      // Other Monitoring Tools
      instana_key: /instana\.key\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      scout_apm_key: /scoutKey\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      honeycomb_api_key: /honeycombApiKey\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      pinpoint_app_id: /pinpointAppId\s*[:=]\s*['"][A-Za-z0-9_\-]{10,}['"]/gi,
      aws_cloudwatch_group: /logGroupName\s*[:=]\s*['"][A-Za-z0-9_\-\/]+['"]/gi,
      azure_monitor_key: /azureMonitorKey\s*[:=]\s*['"][A-Za-z0-9]{32}['"]/gi,
      firebase_measurement_id:
        /firebase\.measurementId\s*[:=]\s*['"]G-[A-Z0-9]{10}['"]/gi,
      firebase_api_key:
        /firebase\.apiKey\s*[:=]\s*['"][A-Za-z0-9_\-]{32}['"]/gi,
      firebase_project_id: /firebase\.projectId\s*[:=]\s*['"][a-z0-9\-]+['"]/gi,
      firebase_app_id:
        /firebase\.appId\s*[:=]\s*['"][1-9]:[a-z0-9\-]+:[a-z0-9]{32}['"]/gi,

      // Miscellaneous
      error_reporting_url:
        /errorReportingUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
      telemetry_endpoint:
        /telemetryEndpoint\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
      monitoring_url: /monitoringUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
      beacon_url: /beaconUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
      tracking_pixel_url:
        /trackingPixelUrl\s*[:=]\s*['"]https?:\/\/[^'"]+['"]/gi,
    };
    scripts.forEach((script, index) => {
      const content = script.textContent || "";
      const src = script.src || "inline";
      Object.entries(monitoringPatterns).forEach(([type, regex]) => {
        const matches = Array.from(content.matchAll(regex));
        matches.forEach((m) => {
          flags.push({
            type: "monitoring_dsn",
            key: type,
            value: m[0],
            location: `script[${index}]`,
            source: src,
            context: getContext(content, m[0], 80),
            risk: "MEDIUM",
            timestamp: new Date().toISOString(),
          });
        });
      });
    });

    // 5) Service Workers and Push Config
    const swRegex = /navigator\.serviceWorker\.register\s*\(([^\)]+)\)/gi;

    const vapidRegex =
      /applicationServerKey\s*:\s*(?:[\"']([A-Za-z0-9_-]{43,88})[\"']|new\s+Uint8Array\()/gi;
    scripts.forEach((script, index) => {
      const content = script.textContent || "";
      const src = script.src || "inline";
      const swMatches = Array.from(content.matchAll(swRegex));
      swMatches.forEach((m) => {
        flags.push({
          type: "service_worker",
          value: m[0],
          location: `script[${index}]`,
          source: src,
          context: getContext(content, m[0], 80),
          risk: "LOW",
          timestamp: new Date().toISOString(),
        });
      });
      const vapidMatches = Array.from(content.matchAll(vapidRegex));
      vapidMatches.forEach((m) => {
        flags.push({
          type: "service_worker",
          value: m[0],
          location: `script[${index}]`,
          source: src,
          context: getContext(content, m[0], 80),
          risk: "MEDIUM",
          timestamp: new Date().toISOString(),
        });
      });
    });

    // 6) Insecure HTTP endpoints on HTTPS pages
    try {
      if (window.location && window.location.protocol === "https:") {
        const allScriptsText = Array.from(scripts)
          .map((s) => s.textContent || "")
          .join("\n\n");
        const httpUrlRegex = /http:\/\/[^'"\s<>]+/gi;
        const matches = Array.from(allScriptsText.matchAll(httpUrlRegex));
        matches.forEach((m) => {
          const url = normalizeURL(m[0]);
          flags.push({
            type: "insecure_http_endpoint",
            value: url,
            location: "script",
            risk: "HIGH",
            timestamp: new Date().toISOString(),
          });
        });
      }
    } catch (e) {}

    const corsRegexes = [
      // Client-side: Fetch API
      /fetch\s*\([^\)]*,\s*\{[^}]*credentials\s*:\s*['"]include['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*mode\s*:\s*['"]no-cors['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*mode\s*:\s*['"]cors['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*mode\s*:\s*['"]same-origin['"][^}]*\}/gi,

      // Client-side: Axios
      /axios\.defaults\.withCredentials\s*=\s*true/gi,
      /axios\.create\s*\(\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,
      /axios\s*\(\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,

      // Client-side: XMLHttpRequest
      /xhr\.withCredentials\s*=\s*true/gi,
      /XMLHttpRequest.*\.withCredentials\s*=\s*true/gi,

      // Server-side: Express (Node.js)
      /res\.header\s*\(\s*['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\)/gi,
      /res\.setHeader\s*\(\s*['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\)/gi,
      /res\.header\s*\(\s*['"]Access-Control-Allow-Credentials['"],\s*['"]true['"]\)/gi,
      /res\.setHeader\s*\(\s*['"]Access-Control-Allow-Credentials['"],\s*['"]true['"]\)/gi,
      /cors\(\s*\{[^}]*credentials\s*:\s*true[^}]*\}\s*\)/gi,

      // Server-side: Flask (Python)
      /CORS\(app,\s*resources=.*?,\s*supports_credentials=True/gi,
      /response\.headers\['Access-Control-Allow-Origin'\]\s*=\s*['"]\*['"]/gi,
      /response\.headers\['Access-Control-Allow-Credentials'\]\s*=\s*['"]true['"]/gi,

      // Server-side: Django
      /CORS_ALLOW_CREDENTIALS\s*=\s*True/gi,
      /CORS_ORIGIN_ALLOW_ALL\s*=\s*True/gi,
      /CORS_ALLOWED_ORIGINS\s*=\s*\[.*?['"]\*['"].*?\]/gi,

      // Server-side: Spring Boot
      /@CrossOrigin\s*\(\s*origins\s*=\s*"\*"\s*,\s*allowCredentials\s*=\s*true\s*\)/gi,
      /response\.setHeader\s*\(\s*"Access-Control-Allow-Origin",\s*"\*"\s*\)/gi,

      // Server-side: .NET
      /options\.AllowAnyOrigin\(\)\.AllowCredentials\(\)/gi,
      /options\.AddPolicy\([^)]*builder\s*=>\s*builder\.AllowAnyOrigin\(\)\.AllowCredentials\(\)/gi,

      // Server-side: PHP
      /header\s*\(\s*"Access-Control-Allow-Origin:\s*\*"\s*\)/gi,
      /header\s*\(\s*"Access-Control-Allow-Credentials:\s*true"\s*\)/gi,

      // Misconfigured Headers
      /Access-Control-Allow-Origin\s*:\s*\*/gi,
      /Access-Control-Allow-Credentials\s*:\s*true/gi,
      /Access-Control-Allow-Headers\s*:\s*\*/gi,
      /Access-Control-Expose-Headers\s*:\s*\*/gi,
      /Access-Control-Allow-Methods\s*:\s*\*/gi,

      // Wildcard Origins
      /origin\s*:\s*['"]\*['"]/gi,
      /allowedOrigins\s*:\s*\[\s*['"]\*['"]\s*\]/gi,

      // Misuse in config files
      /"Access-Control-Allow-Origin"\s*:\s*"\*"/gi,
      /"Access-Control-Allow-Credentials"\s*:\s*"true"/gi,
      /"withCredentials"\s*:\s*true/gi,

      // Miscellaneous
      /credentials\s*:\s*['"]include['"]/gi,
      /credentials\s*:\s*['"]same-origin['"]/gi,
      /mode\s*:\s*['"]no-cors['"]/gi,
      /mode\s*:\s*['"]cors['"]/gi,
      /mode\s*:\s*['"]same-origin['"]/gi,

      // Fetch API
      /fetch\s*\([^\)]*,\s*\{[^}]*credentials\s*:\s*['"]include['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*credentials\s*:\s*['"]same-origin['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*mode\s*:\s*['"]no-cors['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*mode\s*:\s*['"]cors['"][^}]*\}/gi,
      /fetch\s*\([^\)]*,\s*\{[^}]*mode\s*:\s*['"]same-origin['"][^}]*\}/gi,

      // Axios
      /axios\.defaults\.withCredentials\s*=\s*true/gi,
      /axios\.create\s*\(\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,
      /axios\s*\(\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,
      /axios\.get\s*\([^\)]*,\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,
      /axios\.post\s*\([^\)]*,\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,

      // XMLHttpRequest
      /xhr\.withCredentials\s*=\s*true/gi,
      /XMLHttpRequest.*\.withCredentials\s*=\s*true/gi,
      /new\s+XMLHttpRequest\(\)/gi,

      // Express (Node.js)
      /res\.header\s*\(\s*['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\)/gi,
      /res\.setHeader\s*\(\s*['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\)/gi,
      /res\.header\s*\(\s*['"]Access-Control-Allow-Credentials['"],\s*['"]true['"]\)/gi,
      /res\.setHeader\s*\(\s*['"]Access-Control-Allow-Credentials['"],\s*['"]true['"]\)/gi,
      /cors\(\s*\{[^}]*credentials\s*:\s*true[^}]*\}\s*\)/gi,
      /app\.use\s*\(\s*cors\(\s*\{[^}]*origin\s*:\s*['"]\*['"][^}]*\}\s*\)\s*\)/gi,

      // Flask (Python)
      /CORS\(app,\s*resources=.*?,\s*supports_credentials=True/gi,
      /response\.headers\['Access-Control-Allow-Origin'\]\s*=\s*['"]\*['"]/gi,
      /response\.headers\['Access-Control-Allow-Credentials'\]\s*=\s*['"]true['"]/gi,

      // Django
      /CORS_ALLOW_CREDENTIALS\s*=\s*True/gi,
      /CORS_ORIGIN_ALLOW_ALL\s*=\s*True/gi,
      /CORS_ALLOWED_ORIGINS\s*=\s*\[.*?['"]\*['"].*?\]/gi,

      // Spring Boot
      /@CrossOrigin\s*\(\s*origins\s*=\s*"\*"\s*,\s*allowCredentials\s*=\s*true\s*\)/gi,
      /response\.setHeader\s*\(\s*"Access-Control-Allow-Origin",\s*"\*"\s*\)/gi,

      // .NET
      /options\.AllowAnyOrigin\(\)\.AllowCredentials\(\)/gi,
      /options\.AddPolicy\([^)]*builder\s*=>\s*builder\.AllowAnyOrigin\(\)\.AllowCredentials\(\)/gi,

      // PHP
      /header\s*\(\s*"Access-Control-Allow-Origin:\s*\*"\s*\)/gi,
      /header\s*\(\s*"Access-Control-Allow-Credentials:\s*true"\s*\)/gi,

      // Misconfigured Headers
      /Access-Control-Allow-Origin\s*:\s*\*/gi,
      /Access-Control-Allow-Credentials\s*:\s*true/gi,
      /Access-Control-Allow-Headers\s*:\s*\*/gi,
      /Access-Control-Expose-Headers\s*:\s*\*/gi,
      /Access-Control-Allow-Methods\s*:\s*\*/gi,

      // Wildcard Origins
      /origin\s*:\s*['"]\*['"]/gi,
      /allowedOrigins\s*:\s*\[\s*['"]\*['"]\s*\]/gi,

      // Config Files
      /"Access-Control-Allow-Origin"\s*:\s*"\*"/gi,
      /"Access-Control-Allow-Credentials"\s*:\s*"true"/gi,
      /"withCredentials"\s*:\s*true/gi,
      // Miscellaneous
      /credentials\s*:\s*['"]include['"]/gi,
      /credentials\s*:\s*['"]same-origin['"]/gi,
      /mode\s*:\s*['"]no-cors['"]/gi,
      /mode\s*:\s*['"]cors['"]/gi,
      /mode\s*:\s*['"]same-origin['"]/gi,

      // GraphQL
      /ApolloClient\s*\(\s*\{[^}]*credentials\s*:\s*['"]include['"][^}]*\}\s*\)/gi,
      /createHttpLink\s*\(\s*\{[^}]*credentials\s*:\s*['"]include['"][^}]*\}\s*\)/gi,

      // jQuery
      /\$\.ajax\s*\(\s*\{[^}]*xhrFields\s*:\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}[^}]*\}\s*\)/gi,

      // React Native
      /fetch\s*\([^\)]*,\s*\{[^}]*credentials\s*:\s*['"]include['"][^}]*\}/gi,

      // Angular
      /HttpClient\.get\s*\([^\)]*,\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,
      /HttpClient\.post\s*\([^\)]*,\s*\{[^}]*withCredentials\s*:\s*true[^}]*\}\s*\)/gi,
    ];
    scripts.forEach((script, index) => {
      const content = script.textContent || "";
      const src = script.src || "inline";
      corsRegexes.forEach((re) => {
        const matches = Array.from(content.matchAll(re));
        matches.forEach((m) => {
          flags.push({
            type: "cors_heuristic",
            value: m[0],
            location: `script[${index}]`,
            source: src,
            context: getContext(content, m[0], 80),
            risk: "MEDIUM",
            timestamp: new Date().toISOString(),
          });
        });
      });
    });

    console.log(
      `%c🚩 Found ${flags.length} advanced flags`,
      flags.length > 0 ? styles.gold : styles.info
    );
    return flags;
  }

  function strengthenRisks(extraction) {
    try {
      const writeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
      (extraction.secrets.endpoints || []).forEach((e) => {
        const path = (e.endpoint || "").toLowerCase();
        const method = (e.method || "GET").toUpperCase();
        const sensitive =
          /(\badmin\b|\binternal\b|\bdebug\b|\bprivate\b|\bsecret\b|\bconfig\b|\bsettings\b|\bcredentials\b|\bauth\b|\blogin\b|\bsession\b|\btoken\b|\bkey\b|\breset\b|\bchange-password\b|\bforgot-password\b|\bupdate-password\b|\bdelete-account\b|\buser-delete\b|\buser-update\b|\buser-create\b|\bcreate-user\b|\bregister\b|\bsignup\b|\bsignin\b|\bsudo\b|\bsuperuser\b|\broot\b|\bmanage\b|\bcontrol\b|\bpanel\b|\bconsole\b|\bexec\b|\bexecute\b|\bcommand\b|\bshell\b|\bterminal\b|\bupload\b|\bfile-upload\b|\bimport\b|\bexport\b|\bbackup\b|\brestore\b|\bclone\b|\bmirror\b|\bproxy\b|\bforward\b|\bwebhook\b|\bcallback\b|\bmonitor\b|\blog\b|\btrace\b|\bmetrics\b|\bstats\b|\bhealthcheck\b|\bping\b|\bstatus\b|\/admin\b|\/internal\b|\/debug\b|\/private\b|\/config\b|\/settings\b|\/auth\b|\/login\b|\/token\b|\/key\b)/i.test(
            path
          );
        if (sensitive && writeMethods.has(method)) {
          e.risk = "CRITICAL";
        } else if (sensitive) {
          e.risk = e.risk === "CRITICAL" ? e.risk : "HIGH";
        }
      });
    } catch (e) {}
  }

  function analyzeListenerRisk(handler) {
    const dangerousPatterns = [
      /eval\(/i,
      /Function\(/i,
      /setTimeout\(/i,
      /setInterval\(/i,
      /innerHTML/i,
      /outerHTML/i,
      /document\.write/i,
      /document\.writeln/i,
      /location\./i,
      /window\.open/i,
      /window\.location/i,
      /window\.name/i,
      /window\.frames/i,
      /window\.parent/i,
      /window\.top/i,
      /alert\(/i,
      /confirm\(/i,
      /prompt\(/i,
      /console\.log/i,
      /console\.debug/i,
      /console\.info/i,
      /console\.warn/i,
      /console\.error/i,
      /XMLHttpRequest/i,
      /fetch\(/i,
      /WebSocket/i,
      /postMessage/i,
      /localStorage/i,
      /sessionStorage/i,
      /indexedDB/i,
      /navigator\./i,
      /screen\./i,
      /history\./i,
      /performance\./i,
      /crypto\./i,
      /document\.cookie/i,
      /document\.domain/i,
      /document\.referrer/i,
      /document\.URL/i,
      /document\.location/i,
      /document\.getElementById/i,
      /document\.getElementsByClassName/i,
      /document\.getElementsByTagName/i,
      /document\.querySelector/i,
      /document\.querySelectorAll/i,
      /document\.createElement/i,
      /document\.createTextNode/i,
      /document\.createDocumentFragment/i,
      /addEventListener/i,
      /removeEventListener/i,
      /attachEvent/i,
      /detachEvent/i,
      /onerror/i,
      /onload/i,
      /onsubmit/i,
      /onmouseover/i,
      /onmouseout/i,
      /onkeydown/i,
      /onkeyup/i,
      /onkeypress/i,
      /Object\.prototype/i,
      /__proto__/i,
    ];

    const risk = dangerousPatterns.some((pattern) => pattern.test(handler))
      ? "HIGH"
      : "LOW";
    return risk;
  }

  // ===========================================
  // 📊 RESULTS DISPLAY
  // ===========================================

  function showEthicalReminderOnce() {
    try {
      if (window.__jsdh_ethics_shown) return;
      window.__jsdh_ethics_shown = true;
      console.warn(
        "%cEthical use reminder: Run this tool only on systems you are authorized to test. Respect policies and applicable laws.",
        "color:#f39c12;font-weight:bold;"
      );
    } catch (e) {}
  }

  // Minimal HTML overlay for quick triage (optional)
  function renderOverlaySummary(extraction) {
    try {
      if (document.getElementById("jsdh-overlay")) return;
      const overlay = document.createElement("div");
      overlay.id = "jsdh-overlay";
      overlay.style.cssText =
        "position:fixed;right:12px;bottom:12px;z-index:2147483647;background:#111;color:#fff;padding:10px 12px;border-radius:8px;font:12px/1.4 system-ui,Segoe UI,Arial;box-shadow:0 6px 16px rgba(0,0,0,.3);max-width:320px;";
      const btnCss =
        "margin-left:6px;background:#f39c12;color:#111;padding:2px 6px;border-radius:4px;font-weight:bold;cursor:pointer;border:none;";
      const advCount = (extraction.secrets.advancedFlags || []).length;
      const html = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="font-weight:700;">JSDH Summary</div>
          <button id="jsdh-close" style="${btnCss}">×</button>
        </div>
        <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div>Findings</div><div style="text-align:right;">${
            extraction.totalFindings
          }</div>
          <div>API Keys</div><div style="text-align:right;">${
            extraction.secrets.apiKeys.length
          }</div>
          <div>Endpoints</div><div style="text-align:right;">${
            extraction.secrets.endpoints.length
          }</div>
          <div>Creds</div><div style="text-align:right;">${
            extraction.secrets.credentials.length
          }</div>
          <div>Config</div><div style="text-align:right;">${Object.values(
            extraction.secrets.configurations
          ).reduce((s, a) => s + a.length, 0)}</div>
          <div>Adv Flags</div><div style="text-align:right;">${advCount}</div>
        </div>
        <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end;">
          <button id="jsdh-export" style="${btnCss}">Export</button>
        </div>`;
      overlay.innerHTML = html;
      document.body.appendChild(overlay);
      overlay.querySelector("#jsdh-close").onclick = () => overlay.remove();
      overlay.querySelector("#jsdh-export").onclick = () => {
        try {
          const json = window.jsDisclosureHunter.export();
          console.log("%cOverlay export completed", "color:#2ecc71");
        } catch (e) {}
      };
    } catch (e) {}
  }

  function displayExtractionResults(extraction) {
    try {
      // show small hint to copy/export payload quickly
      console.log(
        "%cTip: call window.jsDisclosureHunter.export() to copy JSON payload",
        styles.info
      );
    } catch (e) {}

    // Advanced flags display summary
    try {
      const adv = extraction.secrets.advancedFlags || [];
      if (adv.length > 0) {
        const byType = adv.reduce((acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1;
          return acc;
        }, {});
        console.log("%c🚩 Advanced Flags:", styles.info, byType);
      }
    } catch (e) {}

    // Network logs quick summary
    try {
      const logs = window.jsDisclosureHunter.networkLogs || [];
      if (logs.length > 0) {
        const byKind = logs.reduce((a, l) => {
          a[l.type] = (a[l.type] || 0) + 1;
          return a;
        }, {});
        const topHosts = logs
          .map((l) => {
            try {
              return new URL(l.url, window.location.href).host;
            } catch (_) {
              return null;
            }
          })
          .filter(Boolean)
          .reduce((acc, h) => {
            acc[h] = (acc[h] || 0) + 1;
            return acc;
          }, {});
        console.log("%c🌐 Runtime Network Logs:", styles.info, byKind, {
          hosts: topHosts,
        });
      }
    } catch (e) {}

    console.log("\n%c💎 JAVASCRIPT DISCLOSURE EXTRACTION RESULTS", styles.p1);
    console.log(
      "%c════════════════════════════════════════════════════════",
      "color: #ff6b6b; font-weight: bold;"
    );

    // Overview
    console.log("\n%c📊 EXTRACTION OVERVIEW:", styles.gold);
    console.table({
      "Total Findings": extraction.totalFindings,
      "API Keys Found": extraction.secrets.apiKeys.length,
      "Hidden Endpoints": extraction.secrets.endpoints.length,
      "Credentials/Secrets": extraction.secrets.credentials.length,
      "Config Disclosures": Object.values(
        extraction.secrets.configurations
      ).reduce((sum, arr) => sum + arr.length, 0),
      "Event Listeners": extraction.secrets.listeners.length,
      "Advanced Flags": (extraction.secrets.advancedFlags || []).length,
      "Network Logs": (window.jsDisclosureHunter.networkLogs || []).length,
    });

    // Critical findings first
    const criticalApiKeys = extraction.secrets.apiKeys.filter(
      (key) => key.risk === "CRITICAL"
    );
    const criticalEndpoints = extraction.secrets.endpoints.filter(
      (ep) => ep.risk === "CRITICAL"
    );
    const criticalCreds = extraction.secrets.credentials.filter(
      (cred) => cred.risk === "CRITICAL"
    );

    if (criticalApiKeys.length > 0) {
      console.log("\n%c🚨 CRITICAL API KEYS/TOKENS:", styles.secret);
      criticalApiKeys.forEach((key) => {
        console.log(`%c🔑 ${key.type.toUpperCase()}`, styles.key);
        console.log(`   Value: ${key.value.substring(0, 20)}...`);
        console.log(`   Location: ${key.location}`);
        console.log(`   Source: ${key.source}`);
      });
    }

    if (criticalEndpoints.length > 0) {
      console.log("\n%c🚨 CRITICAL HIDDEN ENDPOINTS:", styles.secret);
      criticalEndpoints.forEach((endpoint) => {
        console.log(`%c🌐 ${endpoint.type.toUpperCase()}`, styles.endpoint);
        console.log(`   Endpoint: ${endpoint.endpoint}`);
        console.log(`   Method: ${endpoint.method || "Unknown"}`);
        console.log(`   Location: ${endpoint.location}`);
      });
    }

    if (criticalCreds.length > 0) {
      console.log("\n%c🚨 CRITICAL CREDENTIALS:", styles.secret);
      criticalCreds.forEach((cred) => {
        console.log(`%c🔐 ${cred.type.toUpperCase()}`, styles.secret);
        console.log(`   Key: ${cred.key}`);
        console.log(`   Value: ${cred.value.substring(0, 15)}...`);
        console.log(`   Location: ${cred.location}`);
      });
    }

    // High-risk findings
    const highRiskFindings = [
      ...extraction.secrets.apiKeys.filter((key) => key.risk === "HIGH"),
      ...extraction.secrets.endpoints.filter((ep) => ep.risk === "HIGH"),
      ...extraction.secrets.credentials.filter((cred) => cred.risk === "HIGH"),
    ];

    if (highRiskFindings.length > 0) {
      console.log("\n%c⚠️ HIGH-RISK FINDINGS:", styles.warning);
      console.table(
        highRiskFindings.map((finding) => ({
          Type: finding.type,
          Value:
            (finding.value || finding.endpoint || "N/A").substring(0, 30) +
            "...",
          Location: finding.location,
          Risk: finding.risk,
        }))
      );
    }

    // Configuration disclosures
    const configCount = Object.values(extraction.secrets.configurations).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    if (configCount > 0) {
      console.log("\n%c⚙️ CONFIGURATION DISCLOSURES:", styles.config);

      Object.entries(extraction.secrets.configurations).forEach(
        ([category, configs]) => {
          if (configs.length > 0) {
            console.log(
              `%c📋 ${category.toUpperCase()} (${configs.length}):`,
              styles.info
            );
            configs.slice(0, 3).forEach((config) => {
              console.log(
                `   • ${config.type}: ${config.value.substring(0, 50)}...`
              );
            });
            if (configs.length > 3) {
              console.log(`   ... and ${configs.length - 3} more`);
            }
          }
        }
      );
    }

    // Event listeners summary
    if (extraction.secrets.listeners.length > 0) {
      console.log("\n%c👂 EVENT LISTENERS MAPPED:", styles.info);
      const listenerTypes = {};
      extraction.secrets.listeners.forEach((listener) => {
        listenerTypes[listener.eventType] =
          (listenerTypes[listener.eventType] || 0) + 1;
      });
      console.table(listenerTypes);

      const riskyListeners = extraction.secrets.listeners.filter(
        (l) => l.risk === "HIGH"
      );
      if (riskyListeners.length > 0) {
        console.log(
          `%c⚠️ ${riskyListeners.length} high-risk event handlers detected`,
          styles.warning
        );
      }
    }

    // P1 Potential Assessment
    const p1Potential =
      criticalApiKeys.length + criticalEndpoints.length + criticalCreds.length;
    console.log("\n%c🎯 P1 POTENTIAL ASSESSMENT:", styles.p1);

    if (p1Potential > 0) {
      console.log(
        `%c🚨 HIGH P1 POTENTIAL: ${p1Potential} critical findings!`,
        styles.secret
      );
      console.log(
        "%c💰 Recommended immediate testing and reporting",
        styles.gold
      );
    } else if (highRiskFindings.length > 0) {
      console.log(
        `%c⚠️ MEDIUM P1 POTENTIAL: ${highRiskFindings.length} high-risk findings`,
        styles.warning
      );
      console.log("%c🎯 Recommended further investigation", styles.info);
    } else {
      console.log(
        "%c✅ LOW P1 POTENTIAL: No critical disclosures detected",
        styles.info
      );
    }

    console.log(
      "\n%c════════════════════════════════════════════════════════",
      "color: #ff6b6b; font-weight: bold;"
    );
    console.log(
      "%c💾 Full extraction data stored in window.jsDisclosureHunter",
      styles.info
    );
  }

  // ===========================================
  // 🎯 FOCUSED EXTRACTORS
  // ===========================================

  function extractP1Secrets() {
    console.log("%c🎯 P1-FOCUSED SECRET EXTRACTION", styles.p1);
    console.log(
      "%c🔍 Hunting specifically for P1-level disclosures...",
      styles.gold
    );

    const p1Secrets = {
      awsKeys: [],
      jwtTokens: [],
      adminEndpoints: [],
      databaseCreds: [],
      internalAPIs: [],
    };

    // AWS Keys (High P1 potential)
    const awsKeyPatterns = {
      access_key: /AKIA[0-9A-Z]{16}/gi,
      secret_key: /[A-Za-z0-9\/+=]{40}/gi,
    };

    // JWT Tokens (Authentication bypass potential)
    const jwtPattern = /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/gi;

    // Admin/Internal endpoints (Privilege escalation)
    const adminPatterns = {
      admin: /['"](\/admin[^'"]*|.*\/admin[^'"]*)['"]/gi,
      internal: /['"](\/internal[^'"]*|.*\/internal[^'"]*)['"]/gi,
      debug: /['"](\/debug[^'"]*|.*\/debug[^'"]*)['"]/gi,
    };

    // Database credentials (Data access)
    const dbPatterns = {
      mongodb: /mongodb:\/\/[^'"\s]+/gi,
      mysql: /mysql:\/\/[^'"\s]+/gi,
      postgres: /postgres:\/\/[^'"\s]+/gi,
    };

    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const content = script.textContent || "";

      // Extract AWS keys
      Object.entries(awsKeyPatterns).forEach(([keyType, pattern]) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            p1Secrets.awsKeys.push({
              type: keyType,
              value: match,
              location: `script[${index}]`,
              p1Risk: "HIGH",
            });
          });
        }
      });

      // Extract JWT tokens
      const jwtMatches = content.match(jwtPattern);
      if (jwtMatches) {
        jwtMatches.forEach((match) => {
          p1Secrets.jwtTokens.push({
            value: match,
            location: `script[${index}]`,
            p1Risk: "HIGH",
          });
        });
      }

      // Extract admin endpoints
      Object.entries(adminPatterns).forEach(([endpointType, pattern]) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            p1Secrets.adminEndpoints.push({
              type: endpointType,
              endpoint: match.replace(/['"]/g, ""),
              location: `script[${index}]`,
              p1Risk: "CRITICAL",
            });
          });
        }
      });

      // Extract database credentials
      Object.entries(dbPatterns).forEach(([dbType, pattern]) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            p1Secrets.databaseCreds.push({
              type: dbType,
              connectionString: match,
              location: `script[${index}]`,
              p1Risk: "CRITICAL",
            });
          });
        }
      });
    });

    // Display P1-focused results
    const totalP1Findings = Object.values(p1Secrets).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    console.log(
      `%c💎 Found ${totalP1Findings} P1-potential secrets`,
      totalP1Findings > 0 ? styles.secret : styles.info
    );

    if (totalP1Findings > 0) {
      console.log("\n%c🚨 P1-LEVEL FINDINGS:", styles.secret);

      Object.entries(p1Secrets).forEach(([category, findings]) => {
        if (findings.length > 0) {
          console.log(
            `%c${category.toUpperCase()}: ${findings.length} found`,
            styles.gold
          );
          findings.forEach((finding) => {
            console.log(
              `  • ${finding.type || "Token"}: ${(
                finding.value ||
                finding.endpoint ||
                finding.connectionString
              ).substring(0, 30)}...`
            );
          });
        }
      });
    }

    return p1Secrets;
  }

  function extractSensitiveEndpoints() {
    console.log("%c🌐 SENSITIVE ENDPOINT EXTRACTION", styles.endpoint);

    const sensitiveEndpoints = {
      authentication: [],
      fileUpload: [],
      adminPanel: [],
      apiInternal: [],
      development: [],
    };

    const endpointPatterns = {
      auth: {
        pattern:
          /['"](.*\/(auth|login|logout|signin|signup|register|sso|saml|oauth|token|session|password|forgot-password|reset-password|change-password)[^'"]*)['"]/gi,
        category: "authentication",
      },
      upload: {
        pattern:
          /['"](.*\/(upload|file|attachment|media|image|avatar|document|photo|import|ingest)[^'"]*)['"]/gi,
        category: "fileUpload",
      },
      admin: {
        pattern:
          /['"](.*\/(admin|manage|dashboard|control|panel|superuser|root|config|settings|console)[^'"]*)['"]/gi,
        category: "adminPanel",
      },
      internal: {
        pattern:
          /['"](.*\/(internal|private|restricted|hidden|api\/v[0-9]+|core|secure|backend|infra)[^'"]*)['"]/gi,
        category: "apiInternal",
      },
      dev: {
        pattern:
          /['"](.*\/(dev|test|testing|staging|debug|qa|sandbox|preview|mock|simulate)[^'"]*)['"]/gi,
        category: "development",
      },
      user: {
        pattern:
          /['"](.*\/(user|users|profile|account|me|myaccount|settings)[^'"]*)['"]/gi,
        category: "userManagement",
      },
      payment: {
        pattern:
          /['"](.*\/(payment|pay|checkout|billing|invoice|transaction|wallet|card|charge|refund)[^'"]*)['"]/gi,
        category: "payment",
      },
      analytics: {
        pattern:
          /['"](.*\/(analytics|metrics|stats|report|dashboard|insights|tracking|events)[^'"]*)['"]/gi,
        category: "analytics",
      },
      webhook: {
        pattern:
          /['"](.*\/(webhook|callback|notify|listener|event)[^'"]*)['"]/gi,
        category: "webhook",
      },
      config: {
        pattern:
          /['"](.*\/(config|configuration|setup|init|bootstrap|preferences)[^'"]*)['"]/gi,
        category: "configuration",
      },
      backup: {
        pattern:
          /['"](.*\/(backup|restore|snapshot|archive|export|dump)[^'"]*)['"]/gi,
        category: "backupRestore",
      },
      exec: {
        pattern:
          /['"](.*\/(exec|execute|command|run|trigger|action|invoke)[^'"]*)['"]/gi,
        category: "execution",
      },
    };

    const scripts = document.querySelectorAll("script");
    scripts.forEach((script, index) => {
      const content = script.textContent || "";

      Object.entries(endpointPatterns).forEach(([patternName, config]) => {
        const matches = content.match(config.pattern);
        if (matches) {
          matches.forEach((match) => {
            const cleanEndpoint = match.replace(/['"]/g, "");
            sensitiveEndpoints[config.category].push({
              endpoint: cleanEndpoint,
              location: `script[${index}]`,
              source: script.src || "inline",
              sensitivity: getSensitivityLevel(cleanEndpoint),
            });
          });
        }
      });
    });

    const totalSensitive = Object.values(sensitiveEndpoints).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    console.log(
      `%c🎯 Found ${totalSensitive} sensitive endpoints`,
      totalSensitive > 0 ? styles.endpoint : styles.info
    );

    return sensitiveEndpoints;
  }

  function getSensitivityLevel(endpoint) {
    if (endpoint.includes("admin") || endpoint.includes("internal"))
      return "CRITICAL";
    if (endpoint.includes("auth") || endpoint.includes("upload")) return "HIGH";
    if (endpoint.includes("api") || endpoint.includes("dev")) return "MEDIUM";
    return "LOW";
  }

  // ===========================================
  // 💾 EXPORT FUNCTIONS
  // ===========================================

  function exportFindings(format = "json") {
    const findings = window.jsDisclosureHunter;

    if (!findings || Object.keys(findings).length === 0) {
      console.log("%c❌ No findings to export!", styles.secret);
      return;
    }

    const exportData = {
      metadata: {
        tool: "JavaScript Disclosure & Secret Extractor",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100),
      },
      findings: findings,
      summary: {
        totalFindings: Object.values(findings).reduce((sum, arr) => {
          return (
            sum +
            (Array.isArray(arr)
              ? arr.length
              : typeof arr === "object"
              ? Object.keys(arr).length
              : 0)
          );
        }, 0),
        criticalCount: [
          ...(findings.apiKeys || []).filter((k) => k.risk === "CRITICAL"),
          ...(findings.endpoints || []).filter((e) => e.risk === "CRITICAL"),
          ...(findings.credentials || []).filter((c) => c.risk === "CRITICAL"),
        ].length,
        p1Potential: "HIGH", // Based on findings
      },
    };

    if (format === "json") {
      const jsonString = JSON.stringify(exportData, null, 2);
      downloadFile(
        jsonString,
        `js-disclosure-extraction-${Date.now()}.json`,
        "application/json"
      );
      console.log("%c💾 Findings exported as JSON!", styles.gold);
    } else if (format === "csv") {
      const csvData = convertFindingsToCSV(findings);
      downloadFile(
        csvData,
        `js-disclosure-extraction-${Date.now()}.csv`,
        "text/csv"
      );
      console.log("%c💾 Findings exported as CSV!", styles.gold);
    } else if (format === "console") {
      console.log("\n%c📊 FINDINGS EXPORT", styles.p1);
      console.log(exportData);
    }

    return exportData;
  }

  function convertFindingsToCSV(findings) {
    const headers = [
      "Type",
      "Category",
      "Value",
      "Risk",
      "Location",
      "Source",
      "Timestamp",
    ];
    const rows = [];

    // Process API keys
    (findings.apiKeys || []).forEach((key) => {
      rows.push([
        "API_KEY",
        key.type,
        key.value.substring(0, 30) + "...",
        key.risk,
        key.location,
        key.source,
        key.timestamp,
      ]);
    });

    // Process endpoints
    (findings.endpoints || []).forEach((endpoint) => {
      rows.push([
        "ENDPOINT",
        endpoint.type,
        endpoint.endpoint,
        endpoint.risk,
        endpoint.location,
        endpoint.source,
        endpoint.timestamp,
      ]);
    });

    // Process credentials
    (findings.credentials || []).forEach((cred) => {
      rows.push([
        "CREDENTIAL",
        cred.type,
        cred.key + ": " + cred.value.substring(0, 20) + "...",
        cred.risk,
        cred.location,
        cred.source,
        cred.timestamp,
      ]);
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ===========================================
  // 🆘 HELP & DOCUMENTATION
  // ===========================================

  function showExtractionHelp() {
    console.log("\n%c🆘 JAVASCRIPT DISCLOSURE EXTRACTOR - HELP", styles.p1);
    console.log(
      "%c┌─────────────────────────────────────────────────────────┐",
      "color: #ff6b6b;"
    );
    console.log(
      "%c│  P1 BUG BOUNTY HUNTING FUNCTIONS:                      │",
      "color: #ff6b6b;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #ff6b6b;"
    );
    console.log(
      "%c│  extractJSSecrets()          - Full extraction         │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  extractP1Secrets()          - P1-focused extraction   │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  extractSensitiveEndpoints() - Endpoint-focused scan   │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  exportFindings()            - Export results          │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  showExtractionHelp()        - This help menu          │",
      "color: #27ae60;"
    );
    console.log(
      "%c└─────────────────────────────────────────────────────────┘",
      "color: #ff6b6b;"
    );

    console.log("\n%c💎 P1 HUNTING WORKFLOW:", styles.gold);
    console.log("%c  1. extractJSSecrets()        - Comprehensive scan");
    console.log(
      "%c  2. extractP1Secrets()        - Focus on critical findings"
    );
    console.log("%c  3. extractSensitiveEndpoints() - Map attack surface");
    console.log('%c  4. exportFindings("json")    - Document for reporting');

    console.log("\n%c🎯 WHAT WE HUNT FOR:", styles.secret);
    console.log("%c  🔑 API Keys & Tokens (AWS, Google, GitHub, Stripe, JWT)");
    console.log("%c  🌐 Hidden Endpoints (Admin, Internal, Debug, API)");
    console.log("%c  🔐 Credentials & Secrets (DB, SMTP, SSH, Encryption)");
    console.log("%c  ⚙️ Configuration Data (Debug flags, Environment vars)");
    console.log(
      "%c  👂 Event Listeners (Dangerous handlers, Injection points)"
    );

    console.log("\n%c💰 P1 POTENTIAL INDICATORS:", styles.warning);
    console.log(
      "%c  🚨 CRITICAL: AWS secret keys, Admin endpoints, DB credentials"
    );
    console.log("%c  ⚠️ HIGH: JWT tokens, API keys, Internal endpoints");
    console.log("%c  📊 MEDIUM: Debug configs, Upload endpoints, Dev URLs");

    console.log("\n%c💡 Pro Tips:", styles.info);
    console.log("%c  • Run on different pages (login, dashboard, admin)");
    console.log("%c  • Check both inline and external scripts");
    console.log("%c  • Look for staging/dev environments in findings");
    console.log("%c  • Cross-reference findings with actual functionality");
  }

  // ===========================================
  // 🚀 GLOBAL FUNCTION EXPOSURE
  // ===========================================

  // Main extraction functions
  window.extractJSSecrets = extractJSSecrets;
  window.extractP1Secrets = extractP1Secrets;
  window.extractSensitiveEndpoints = extractSensitiveEndpoints;
  window.exportFindings = exportFindings;
  window.showExtractionHelp = showExtractionHelp;

  // ===========================================
  // 🎉 TOOL INITIALIZATION
  // ===========================================

  console.log(
    "%c💎 JAVASCRIPT DISCLOSURE & SECRET EXTRACTOR LOADED",
    styles.p1
  );

  console.log("%c🎯Autor: ArkhAngelLifeJiggy", styles.gold);

  console.log("%c🔍 Ready to hunt for P1 disclosures!", styles.gold);

  console.log("\n%c🎯 QUICK START:", styles.warning);
  console.log(
    "%cextractJSSecrets();              %c- Full comprehensive extraction",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cextractP1Secrets();              %c- P1-focused critical findings",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cextractSensitiveEndpoints();     %c- Focus on endpoint discovery",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cexportFindings();                %c- Export results as JSON",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );

  console.log("\n%c💎 P1 HUNTING FEATURES:", styles.p1);
  console.log("%c  🔑 API Key & Token Discovery (AWS, JWT, GitHub, Stripe...)");
  console.log("%c  🌐 Hidden Endpoint Mapping (Admin, Internal, Debug...)");
  console.log("%c  🔐 Credential Extraction (DB, SMTP, SSH, Secrets...)");
  console.log(
    "%c  ⚙️ Configuration Disclosure (Debug, Environment, Features...)"
  );
  console.log("%c  👂 Event Listener Analysis (Dangerous handlers...)");
  console.log("%c  🗺️ P1 Potential Assessment & Risk Scoring");

  console.log("\n%c🎯 Ready to extract some JavaScript gold!", styles.gold);
})();

// ===========================================
// 💎 P1 DISCLOSURE HUNTER ACTIVATED!
// ===========================================
