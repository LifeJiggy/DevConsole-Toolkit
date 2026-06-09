/**
 * --- ENHANCED ERROR HANDLING & DEBUG INFO EXTRACTOR ---
 * Comprehensive tool for finding error messages, stack traces, debug info, and security vulnerabilities
 * that might leak internal details. Designed for bug bounty hunting and security research.
 *
 * CLIENT-SIDE USAGE:
 * Run this in the browser console to start searching.
 *
 * SERVER-SIDE ADAPTATION (Node.js):
 * For Node.js applications, adapt this code by:
 * 1. Replace window/document with global/process equivalents
 * 2. Use fs module instead of DOM queries
 * 3. Monitor require/module loading instead of script tags
 * 4. Use http/https modules for network monitoring
 * 5. Check environment variables and config files
 * 6. Monitor file system access for sensitive paths
 *
 * Example Node.js adaptation:
 * - Replace window.addEventListener with process.on
 * - Use process.env instead of localStorage
 * - Monitor fs.readFile/fs.writeFile for sensitive data access
 * - Check package.json and .env files for exposed secrets
 */
(function extractErrorAndDebugInfo() {
  console.group("🐛 Enhanced Error Handling & Debug Info Extractor");
  console.log(
    "Searching for revealing error messages, stack traces, debug info, and security vulnerabilities..."
  );

  // --- CONFIGURATION ---
  const config = {
    scanInterval: 30000, // Default periodic scan interval
    maxStringLength: 100, // Max length for displayed strings
    sensitiveKeywords: [
      "token", "key", "secret", "password", "auth", "session", "jwt", "api_key",
      "access_token", "refresh_token", "bearer", "credential", "private", "internal"
    ],
    debugIndicators: [
      "todo", "fixme", "hack", "xxx", "debug:", "dbg:", "temp", "test"
    ],
    enableNetworkMonitoring: true,
    enableStorageScanning: true,
    enableDOMScanning: true,
    enableVulnerabilityScanning: true,
    // Granular scanning options
    enableErrorScanning: true,
    enableConsoleScanning: true,
    enableGlobalVarScanning: true,
    enableScriptCommentScanning: true,
    enableSourceMapScanning: true,
    enableInputFieldScanning: true,
    enableMetaTagScanning: true,
    enableDataAttrScanning: true,
    enableScriptContentScanning: true,
    enableUrlParamScanning: true,
    enableHashScanning: true,
    enableFormDataScanning: true,
    enableCommentScanning: true,
    enableEventHandlerScanning: true,
    enableDataUrlScanning: true,
    enableTextContentScanning: true,
    enableGlobalVarCrossRef: true,
    enableStyleScanning: true,
    enableIframeScanning: true,
    enableCustomElementScanning: true,
    enableAdvancedVulnScanning: true,
    enableFrameworkDetection: true,
    // New validation settings
    minTokenLength: 20, // Minimum length for suspicious tokens
    excludeBrowserNatives: true, // Exclude browser native properties
    enableDeduplication: true // Prevent duplicate findings
  };

  // --- CUSTOM RULE ENGINE ---
  const customRules = {
    rules: new Map(),
    ruleStats: new Map(),

    // Add a custom rule
    addRule: function(name, rule) {
      if (!rule.pattern || !rule.category || !rule.severity) {
        console.error(`Invalid rule format for ${name}. Required: pattern, category, severity`);
        return false;
      }

      this.rules.set(name, {
        ...rule,
        enabled: rule.enabled !== false,
        created: new Date(),
        matches: 0
      });

      this.ruleStats.set(name, {
        totalMatches: 0,
        lastMatch: null,
        firstMatch: null
      });

      console.log(`✅ Custom rule '${name}' added to ${rule.category} category`);
      return true;
    },

    // Remove a custom rule
    removeRule: function(name) {
      const removed = this.rules.delete(name);
      if (removed) {
        this.ruleStats.delete(name);
        console.log(`🗑️ Custom rule '${name}' removed`);
      }
      return removed;
    },

    // Enable/disable rule
    toggleRule: function(name, enabled) {
      const rule = this.rules.get(name);
      if (rule) {
        rule.enabled = enabled;
        console.log(`🔄 Rule '${name}' ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      }
      return false;
    },

    // Execute custom rules against content
    executeRules: function(content, source = 'unknown') {
      if (!content || typeof content !== 'string') return;

      this.rules.forEach((rule, ruleName) => {
        if (!rule.enabled) return;

        try {
          let matches = [];

          if (rule.pattern instanceof RegExp) {
            matches = content.match(rule.pattern) || [];
          } else if (typeof rule.pattern === 'string') {
            // Simple string matching
            const index = content.toLowerCase().indexOf(rule.pattern.toLowerCase());
            if (index !== -1) {
              matches = [rule.pattern];
            }
          } else if (typeof rule.pattern === 'function') {
            // Custom function-based pattern
            matches = rule.pattern(content) || [];
          }

          if (matches.length > 0) {
            const finding = `[CUSTOM_RULE_${rule.severity.toUpperCase()}] ${ruleName}: ${matches[0].substring(0, config.maxStringLength)}${matches[0].length > config.maxStringLength ? '...' : ''} (Source: ${source})`;

            helpers.addFinding(rule.category, finding);

            // Update rule statistics
            const stats = this.ruleStats.get(ruleName);
            stats.totalMatches++;
            stats.lastMatch = new Date();
            if (!stats.firstMatch) {
              stats.firstMatch = new Date();
            }

            rule.matches++;
          }
        } catch (e) {
          console.warn(`Error executing custom rule ${ruleName}:`, e.message);
        }
      });
    },

    // Get rule statistics
    getRuleStats: function() {
      const stats = {};
      this.ruleStats.forEach((stat, ruleName) => {
        const rule = this.rules.get(ruleName);
        stats[ruleName] = {
          ...stat,
          category: rule.category,
          severity: rule.severity,
          enabled: rule.enabled,
          totalMatches: stat.totalMatches
        };
      });
      return stats;
    },

    // Export rules
    exportRules: function() {
      const exported = {};
      this.rules.forEach((rule, name) => {
        exported[name] = {
          pattern: rule.pattern instanceof RegExp ? rule.pattern.source : rule.pattern,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          enabled: rule.enabled
        };
      });
      return exported;
    },

    // Import rules
    importRules: function(rulesObj) {
      let imported = 0;
      Object.entries(rulesObj).forEach(([name, rule]) => {
        if (this.addRule(name, rule)) {
          imported++;
        }
      });
      console.log(`📥 Imported ${imported} custom rules`);
      return imported;
    }
  };

  // --- PERFORMANCE MONITORING ---
  const performanceMonitor = {
    metrics: {
      startTime: Date.now(),
      scansPerformed: 0,
      totalScanTime: 0,
      averageScanTime: 0,
      peakMemoryUsage: 0,
      findingsGenerated: 0,
      errorsEncountered: 0,
      lastScanTime: null,
      scanHistory: []
    },

    // Record scan performance
    recordScan: function(scanTime, findingsCount, errors = 0) {
      this.metrics.scansPerformed++;
      this.metrics.totalScanTime += scanTime;
      this.metrics.averageScanTime = this.metrics.totalScanTime / this.metrics.scansPerformed;
      this.metrics.findingsGenerated += findingsCount;
      this.metrics.errorsEncountered += errors;
      this.metrics.lastScanTime = Date.now();

      // Keep last 100 scans in history
      this.metrics.scanHistory.push({
        timestamp: Date.now(),
        duration: scanTime,
        findings: findingsCount,
        errors: errors
      });

      if (this.metrics.scanHistory.length > 100) {
        this.metrics.scanHistory.shift();
      }

      // Update peak memory usage (estimated)
      if (typeof performance !== 'undefined' && performance.memory) {
        this.metrics.peakMemoryUsage = Math.max(
          this.metrics.peakMemoryUsage,
          performance.memory.usedJSHeapSize
        );
      }
    },

    // Get performance report
    getReport: function() {
      const uptime = Date.now() - this.metrics.startTime;
      const findingsPerMinute = (this.metrics.findingsGenerated / uptime) * 60000;
      const scansPerMinute = (this.metrics.scansPerformed / uptime) * 60000;

      return {
        uptime: uptime,
        totalScans: this.metrics.scansPerformed,
        averageScanTime: Math.round(this.metrics.averageScanTime),
        totalFindings: this.metrics.findingsGenerated,
        findingsPerMinute: Math.round(findingsPerMinute * 100) / 100,
        scansPerMinute: Math.round(scansPerMinute * 100) / 100,
        errorRate: this.metrics.scansPerformed > 0 ?
          Math.round((this.metrics.errorsEncountered / this.metrics.scansPerformed) * 100) : 0,
        peakMemoryUsage: this.metrics.peakMemoryUsage,
        lastScanTime: this.metrics.lastScanTime,
        scanHistory: this.metrics.scanHistory.slice(-10) // Last 10 scans
      };
    },

    // Reset metrics
    reset: function() {
      this.metrics = {
        startTime: Date.now(),
        scansPerformed: 0,
        totalScanTime: 0,
        averageScanTime: 0,
        peakMemoryUsage: 0,
        findingsGenerated: 0,
        errorsEncountered: 0,
        lastScanTime: null,
        scanHistory: []
      };
      console.log("🔄 Performance metrics reset");
    }
  };

  // --- REMEDIATION ENGINE ---
  const remediationEngine = {
    suggestions: {
      // Storage leaks
      storageLeaks: [
        "Use secure storage mechanisms like HttpOnly cookies for sensitive session data",
        "Implement proper token rotation and expiration policies",
        "Avoid storing sensitive data in localStorage/sessionStorage",
        "Use encryption for any sensitive data that must be stored client-side"
      ],

      // DOM leaks
      domLeaks: [
        "Remove sensitive data from DOM elements before rendering",
        "Use data attributes sparingly and sanitize content",
        "Implement Content Security Policy (CSP) headers",
        "Avoid inline event handlers with sensitive data",
        "Sanitize user input before inserting into DOM"
      ],

      // Vulnerability patterns
      vulnerabilityPatterns: {
        'VULN_EVAL_USAGE': [
          "Replace eval() with JSON.parse() for data deserialization",
          "Use Function constructor sparingly and only with trusted input",
          "Implement CSP to restrict eval usage",
          "Use static code analysis to detect and remove eval patterns"
        ],
        'VULN_MISSING_CSP': [
          "Implement Content Security Policy headers",
          "Configure CSP to restrict script sources and eval usage",
          "Use CSP reporting to monitor violations",
          "Test CSP in report-only mode before enforcement"
        ],
        'VULN_INSECURE_COOKIE': [
          "Set HttpOnly flag on sensitive cookies",
          "Set Secure flag for HTTPS-only cookies",
          "Implement SameSite cookie attribute",
          "Use short expiration times for session cookies"
        ]
      },

      // Debug information
      debugVariables: [
        "Remove debug variables from production builds",
        "Use environment-specific configuration",
        "Implement proper logging levels (ERROR, WARN, INFO, DEBUG)",
        "Use build tools to strip debug code in production"
      ]
    },

    // Generate remediation suggestions for findings
    getSuggestions: function(finding) {
      const suggestions = [];

      // Check for specific vulnerability patterns
      Object.keys(this.suggestions.vulnerabilityPatterns).forEach(pattern => {
        if (finding.includes(pattern)) {
          suggestions.push(...this.suggestions.vulnerabilityPatterns[pattern]);
        }
      });

      // Check for general categories
      Object.keys(this.suggestions).forEach(category => {
        if (category !== 'vulnerabilityPatterns' && finding.toLowerCase().includes(category.toLowerCase())) {
          suggestions.push(...this.suggestions[category]);
        }
      });

      // Generic suggestions if no specific matches
      if (suggestions.length === 0) {
        suggestions.push(
          "Review and sanitize sensitive data exposure",
          "Implement proper input validation and output encoding",
          "Use security headers (CSP, HSTS, X-Frame-Options)",
          "Regular security code reviews and testing"
        );
      }

      return [...new Set(suggestions)]; // Remove duplicates
    },

    // Add custom remediation suggestion
    addSuggestion: function(category, suggestion) {
      if (!this.suggestions[category]) {
        this.suggestions[category] = [];
      }
      this.suggestions[category].push(suggestion);
      console.log(`✅ Added remediation suggestion for ${category}`);
    }
  };

  // --- HELPER FUNCTIONS ---
  const helpers = {
    // Deduplication set to track added findings
    addedFindings: new Set(),

    // Check if finding is already added
    isDuplicate: function(finding) {
      if (!config.enableDeduplication) return false;
      const key = typeof finding === 'string' ? finding.substring(0, 200) : String(finding).substring(0, 200);
      if (this.addedFindings.has(key)) return true;
      this.addedFindings.add(key);
      return false;
    },

    // Check if property is a browser native
    isBrowserNative: function(prop) {
      if (!config.excludeBrowserNatives) return false;
      const browserNatives = [
        'Event', 'Element', 'HTMLElement', 'Node', 'Document', 'Window',
        'HTMLDocument', 'DocumentFragment', 'Text', 'Comment', 'Attr',
        'NamedNodeMap', 'NodeList', 'HTMLCollection', 'DOMTokenList',
        'CSSStyleDeclaration', 'CSSRule', 'CSSStyleSheet', 'MediaList',
        'StyleSheetList', 'DOMImplementation', 'XMLHttpRequest', 'Fetch',
        'WebSocket', 'EventTarget', 'AbortController', 'AbortSignal',
        'Blob', 'File', 'FileReader', 'FormData', 'URL', 'URLSearchParams',
        'Headers', 'Request', 'Response', 'ReadableStream', 'WritableStream',
        'TransformStream', 'MessageChannel', 'MessagePort', 'BroadcastChannel',
        'SharedWorker', 'Worker', 'ServiceWorker', 'Cache', 'CacheStorage',
        'IndexedDB', 'IDBFactory', 'IDBDatabase', 'IDBObjectStore', 'IDBIndex',
        'IDBKeyRange', 'IDBCursor', 'IDBTransaction', 'IDBRequest', 'IDBOpenDBRequest',
        'Storage', 'localStorage', 'sessionStorage', 'Navigator', 'Location',
        'History', 'Screen', 'Performance', 'PerformanceEntry', 'PerformanceMark',
        'PerformanceMeasure', 'PerformanceNavigation', 'PerformanceTiming',
        'PerformanceObserver', 'PerformanceObserverEntryList', 'Console',
        'console', 'Math', 'Date', 'RegExp', 'Error', 'EvalError', 'RangeError',
        'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'JSON',
        'Array', 'Object', 'Function', 'Boolean', 'Number', 'String', 'Symbol',
        'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Proxy', 'Reflect',
        'Intl', 'WebAssembly', 'Atomics', 'SharedArrayBuffer', 'ArrayBuffer',
        'DataView', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Int8Array',
        'Int16Array', 'Int32Array', 'Float32Array', 'Float64Array', 'BigInt64Array',
        'BigUint64Array', 'Generator', 'GeneratorFunction', 'AsyncFunction',
        'Iterator', 'AsyncIterator', 'MediaQueryList', 'ResizeObserver',
        'IntersectionObserver', 'MutationObserver', 'PerformanceObserver',
        'ReportingObserver', 'VisualViewport', 'DeviceOrientationEvent',
        'DeviceMotionEvent', 'Geolocation', 'GeolocationPosition',
        'GeolocationPositionError', 'Notification', 'PushManager', 'PushSubscription',
        'ServiceWorkerRegistration', 'ServiceWorkerContainer', 'PeriodicSyncManager',
        'BackgroundFetchManager', 'ContentIndex', 'Bluetooth', 'USB', 'HID',
        'Serial', 'WebOTP', 'Credential', 'CredentialsContainer', 'PasswordCredential',
        'FederatedCredential', 'PublicKeyCredential', 'AuthenticatorAssertionResponse',
        'AuthenticatorAttestationResponse', 'PaymentRequest', 'PaymentResponse',
        'PaymentAddress', 'PaymentMethodChangeEvent', 'MerchantValidationEvent',
        'CanMakePaymentEvent', 'WebAuthn', 'Crypto', 'SubtleCrypto', 'CryptoKey',
        'RandomSource', 'MediaDevices', 'MediaStream', 'MediaStreamTrack',
        'MediaStreamTrackEvent', 'RTCConfiguration', 'RTCPeerConnection',
        'RTCSessionDescription', 'RTCIceCandidate', 'RTCDataChannel',
        'RTCDataChannelEvent', 'RTCDTMFSender', 'RTCDTMFToneChangeEvent',
        'RTCStatsReport', 'RTCIceCandidatePair', 'RTCIceCandidateStats',
        'RTCInboundRTPStreamStats', 'RTCOutboundRTPStreamStats', 'RTCRemoteInboundRtpStreamStats',
        'RTCRemoteOutboundRtpStreamStats', 'RTCTransportStats', 'RTCIceServerStats',
        'RTCMediaHandlerStats', 'RTCMediaStreamStats', 'RTCMediaStreamTrackStats',
        'RTCCodecStats', 'RTCDataChannelStats', 'WebRTC', 'Canvas', 'CanvasRenderingContext2D',
        'ImageBitmap', 'ImageData', 'Path2D', 'TextMetrics', 'OffscreenCanvas',
        'WebGLRenderingContext', 'WebGL2RenderingContext', 'WebGLContextEvent',
        'WebGLShader', 'WebGLProgram', 'WebGLBuffer', 'WebGLFramebuffer',
        'WebGLRenderbuffer', 'WebGLTexture', 'WebGLUniformLocation', 'WebGLVertexArrayObject',
        'WebGLSampler', 'WebGLSync', 'WebGLQuery', 'WebGLTransformFeedback',
        'EXT_texture_filter_anisotropic', 'OES_vertex_array_object', 'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders', 'WEBGL_lose_context', 'ANGLE_instanced_arrays',
        'OES_element_index_uint', 'OES_texture_float', 'OES_texture_half_float',
        'OES_standard_derivatives', 'EXT_frag_depth', 'EXT_shader_texture_lod',
        'EXT_sRGB', 'WEBGL_color_buffer_float', 'WEBGL_compressed_texture_s3tc',
        'WEBGL_compressed_texture_etc1', 'WEBGL_compressed_texture_pvrtc',
        'WEBGL_compressed_texture_astc', 'EXT_color_buffer_half_float',
        'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_depth_texture',
        'OES_texture_float_linear', 'OES_texture_half_float_linear',
        'EXT_blend_minmax', 'EXT_float_blend', 'WEBGL_compressed_texture_etc',
        'WEBGL_compressed_texture_astc', 'KHR_parallel_shader_compile',
        'EXT_disjoint_timer_query_webgl2', 'EXT_disjoint_timer_query',
        'EXT_texture_norm16', 'WEBGL_multi_draw', 'OES_draw_buffers_indexed',
        'EXT_clip_control', 'OES_texture_float', 'OES_texture_half_float',
        'WEBGL_lose_context', 'EXT_texture_filter_anisotropic', 'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders', 'OES_standard_derivatives', 'OES_element_index_uint',
        'OES_fbo_render_mipmap', 'ANGLE_instanced_arrays', 'OES_vertex_array_object',
        'EXT_blend_minmax', 'EXT_float_blend', 'EXT_texture_compression_bptc',
        'EXT_texture_compression_rgtc', 'WEBGL_compressed_texture_s3tc',
        'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_compressed_texture_etc',
        'WEBGL_compressed_texture_etc1', 'WEBGL_compressed_texture_pvrtc',
        'WEBGL_compressed_texture_astc', 'EXT_color_buffer_half_float',
        'WEBGL_color_buffer_float', 'EXT_disjoint_timer_query',
        'EXT_disjoint_timer_query_webgl2', 'EXT_texture_norm16', 'WEBGL_multi_draw',
        'OES_draw_buffers_indexed', 'EXT_clip_control', 'KHR_parallel_shader_compile',
        'EXT_texture_compression_bptc', 'EXT_texture_compression_rgtc',
        'EXT_texture_filter_anisotropic', 'WEBGL_lose_context', 'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders', 'OES_standard_derivatives', 'OES_element_index_uint',
        'OES_fbo_render_mipmap', 'ANGLE_instanced_arrays', 'OES_vertex_array_object',
        'EXT_blend_minmax', 'EXT_float_blend', 'WEBGL_compressed_texture_s3tc',
        'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_compressed_texture_etc',
        'WEBGL_compressed_texture_etc1', 'WEBGL_compressed_texture_pvrtc',
        'WEBGL_compressed_texture_astc', 'EXT_color_buffer_half_float',
        'WEBGL_color_buffer_float', 'EXT_disjoint_timer_query',
        'EXT_disjoint_timer_query_webgl2', 'EXT_texture_norm16', 'WEBGL_multi_draw',
        'OES_draw_buffers_indexed', 'EXT_clip_control', 'KHR_parallel_shader_compile',
        'EXT_texture_compression_bptc', 'EXT_texture_compression_rgtc',

        // Modern Web APIs (2024+)
        'Clipboard', 'ClipboardItem', 'Permissions', 'PermissionStatus',
        'WakeLock', 'WakeLockSentinel', 'ScreenWakeLock', 'FileSystemHandle',
        'FileSystemFileHandle', 'FileSystemDirectoryHandle', 'FileSystemWritableFileStream',
        'OriginPrivateFileSystem', 'StorageManager', 'NavigatorUAData',
        'UserActivation', 'Scheduler', 'TaskController', 'TaskSignal',
        'TaskPriorityChangeEvent', 'CompressionStream', 'DecompressionStream',
        'TextEncoderStream', 'TextDecoderStream', 'WebTransport', 'WebTransportBidirectionalStream',
        'WebTransportDatagramDuplexStream', 'WebTransportReceiveStream', 'WebTransportSendStream',
        'EyeDropper', 'FontFace', 'FontFaceSet', 'FontFaceSetLoadEvent',
        'CSSFontFaceRule', 'CSSCounterStyleRule', 'CSSKeyframesRule', 'CSSKeyframeRule',
        'CSSPageRule', 'CSSMarginRule', 'CSSNamespaceRule', 'CSSImportRule',
        'CSSGroupingRule', 'CSSConditionRule', 'CSSMediaRule', 'CSSSupportsRule',
        'CSSContainerRule', 'CSSStartingStyleRule', 'CSSNestedDeclarations',
        'CSSPropertyRule', 'CSSLayerBlockRule', 'CSSLayerStatementRule',
        'CSSScopeRule', 'CSSFontFeatureValuesRule', 'CSSFontPaletteValuesRule',
        'Animation', 'AnimationEvent', 'AnimationPlaybackEvent', 'KeyframeEffect',
        'ScrollTimeline', 'ViewTimeline', 'CSSAnimation', 'CSSTransition',
        'TransitionEvent', 'CustomElementRegistry', 'ShadowRoot', 'HTMLSlotElement',
        'HTMLTemplateElement', 'HTMLDialogElement', 'HTMLDetailsElement', 'HTMLSummaryElement',
        'PopoverInvokerElement', 'ToggleEvent', 'BeforeToggleEvent',
        'TrustedHTML', 'TrustedScript', 'TrustedScriptURL',
        'TrustedTypePolicy', 'TrustedTypePolicyFactory', 'Sanitizer', 'Worklet',
        'PaintWorklet', 'LayoutWorklet', 'AnimationWorklet', 'AudioWorklet',
        'AudioWorkletNode', 'AudioWorkletProcessor', 'CookieStore', 'CookieStoreManager',
        'CookieChangeEvent', 'BackgroundFetchRegistration', 'BackgroundFetchManager',
        'PeriodicSyncManager', 'ContentIndex', 'ContentIndexEvent'
      ];
      return browserNatives.includes(prop) || prop.startsWith('webkit') ||
             prop.startsWith('moz') || prop.startsWith('ms') || prop.startsWith('o');
    },

    // Validate if a string looks like a real token/key with enhanced patterns and entropy
    isValidToken: function(str) {
      if (str.length < config.minTokenLength) return false;

      // Enhanced pattern checks
      const tokenPatterns = [
        /^[A-Za-z0-9+/=]{20,}$/, // Base64-like
        /^[A-Za-z0-9_-]{20,}$/, // JWT-like
        /^[0-9a-f]{32,}$/, // Hex hash
        /^[A-Za-z0-9]{32,}$/, // Alphanumeric
        /^sk_live_[0-9a-zA-Z_-]{20,}$/, // Stripe live secret
        /^sk_test_[0-9a-zA-Z_-]{20,}$/, // Stripe test secret
        /^pk_live_[0-9a-zA-Z_-]{20,}$/, // Stripe live publishable
        /^pk_test_[0-9a-zA-Z_-]{20,}$/, // Stripe test publishable
        /^AKIA[0-9A-Z]{16}$/, // AWS Access Key ID
        /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=_-]{20,}$/, // JWT
        /^AIza[0-9A-Za-z-_]{35}$/, // Google API Key
        /^xoxb-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}$/, // Slack Bot Token
        /^gho_[0-9a-zA-Z]{36}$/, // GitHub OAuth Token
        /^ghp_[0-9a-zA-Z]{36}$/, // GitHub Personal Access Token
        /^glpat-[0-9a-zA-Z_-]{20,}$/, // GitLab Personal Access Token
        /^mongodb:\/\/[^:]+:[^@]+@[^/]+/, // MongoDB Connection String
        /^mysql:\/\/[^:]+:[^@]+@[^/]+/, // MySQL Connection String
        /^postgresql:\/\/[^:]+:[^@]+@[^/]+/, // PostgreSQL Connection String
        /^redis:\/\/[^:]+:[^@]+@[^/]+/, // Redis Connection String
        /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/, // Private Key
        /-----BEGIN\s+CERTIFICATE-----[\s\S]*?-----END\s+CERTIFICATE-----/ // Certificate
      ];

      const matchesPattern = tokenPatterns.some(pattern => pattern.test(str));
      if (!matchesPattern) return false;

      // Additional entropy check to avoid false positives
      return this.calculateEntropy(str) > 3.5; // High entropy threshold
    },

    // Calculate Shannon entropy for string validation
    calculateEntropy: function(str) {
      const charCounts = {};
      for (let char of str) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      let entropy = 0;
      const len = str.length;
      for (let count of Object.values(charCounts)) {
        const p = count / len;
        entropy -= p * Math.log2(p);
      }
      return entropy;
    },

    // Performance optimization: throttle function calls
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    },

    // Performance optimization: debounce function calls
    debounce: function(func, delay) {
      let timeoutId;
      return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
      }
    },

    // Check if we should skip scanning due to performance constraints
    shouldThrottleScan: function() {
      // Skip if page is not visible to reduce performance impact
      if (document.hidden) return true;

      // Skip if there are too many DOM elements (performance safeguard)
      if (document.querySelectorAll('*').length > 10000) {
        console.warn('DOM too large, throttling scans for performance');
        return true;
      }

      return false;
    },

    // Enhanced finding adder with validation
    addFinding: function(category, finding) {
      if (this.isDuplicate(finding)) return false;
      if (findings[category]) {
        findings[category].add(finding);
        return true;
      }
      return false;
    }
  };

  // --- HISTORICAL ANALYSIS ---
  const historicalAnalysis = {
    history: [],
    trends: new Map(),
    maxHistorySize: 1000,

    // Record findings snapshot
    recordSnapshot: function() {
      const snapshot = {
        timestamp: Date.now(),
        totalFindings: Object.values(findings).reduce((sum, set) => sum + set.size, 0),
        categories: {}
      };

      Object.keys(findings).forEach(category => {
        snapshot.categories[category] = findings[category].size;
      });

      this.history.push(snapshot);

      // Maintain history size limit
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }

      // Update trends
      this.updateTrends();
    },

    // Update trend analysis
    updateTrends: function() {
      if (this.history.length < 2) return;

      const recent = this.history.slice(-10); // Last 10 snapshots
      const trends = {};

      Object.keys(findings).forEach(category => {
        const values = recent.map(s => s.categories[category] || 0);
        const trend = this.calculateTrend(values);
        trends[category] = {
          direction: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
          rate: Math.abs(trend),
          current: values[values.length - 1],
          average: values.reduce((a, b) => a + b, 0) / values.length
        };
      });

      this.trends = new Map(Object.entries(trends));
    },

    // Calculate trend (simple linear regression slope)
    calculateTrend: function(values) {
      if (values.length < 2) return 0;

      const n = values.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
      const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      return slope;
    },

    // Get trend analysis
    getTrends: function() {
      const trends = {};
      this.trends.forEach((trend, category) => {
        trends[category] = trend;
      });
      return trends;
    },

    // Get historical data for charting
    getHistoricalData: function(hours = 24) {
      const cutoff = Date.now() - (hours * 60 * 60 * 1000);
      return this.history.filter(snapshot => snapshot.timestamp >= cutoff);
    },

    // Predict future trends
    predictTrends: function(hours = 1) {
      if (this.history.length < 5) return null;

      const predictions = {};
      this.trends.forEach((trend, category) => {
        const current = trend.current;
        const rate = trend.rate;
        const prediction = current + (rate * hours);

        predictions[category] = {
          predicted: Math.max(0, Math.round(prediction)),
          confidence: this.history.length > 10 ? 'high' : 'medium',
          timeframe: `${hours} hour(s)`
        };
      });

      return predictions;
    }
  };

  // --- REAL-TIME DASHBOARD ---
  const dashboard = {
    container: null,
    isVisible: false,
    updateInterval: null,
    charts: {},

    // Create and show dashboard
    show: function() {
      if (this.container) {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.startUpdates();
        return;
      }

      this.createDashboard();
      this.isVisible = true;
      this.startUpdates();
    },

    // Hide dashboard
    hide: function() {
      if (this.container) {
        this.container.style.display = 'none';
        this.isVisible = false;
        this.stopUpdates();
      }
    },

    // Create dashboard HTML and CSS
    createDashboard: function() {
      // Create container
      this.container = document.createElement('div');
      this.container.id = 'qwen-dashboard';
      this.container.innerHTML = `
        <div class="dashboard-header">
          <h3>🐛 Qwen Security Dashboard</h3>
          <div class="dashboard-controls">
            <button id="dashboard-refresh">🔄 Refresh</button>
            <button id="dashboard-minimize">_</button>
            <button id="dashboard-close">✕</button>
          </div>
        </div>
        <div class="dashboard-content">
          <div class="metrics-grid">
            <div class="metric-card">
              <h4>Total Findings</h4>
              <div class="metric-value" id="total-findings">0</div>
              <div class="metric-trend" id="total-trend">↗️ +0</div>
            </div>
            <div class="metric-card">
              <h4>High Priority</h4>
              <div class="metric-value" id="high-priority">0</div>
              <div class="metric-trend" id="high-trend">↗️ +0</div>
            </div>
            <div class="metric-card">
              <h4>Scan Performance</h4>
              <div class="metric-value" id="scan-time">0ms</div>
              <div class="metric-trend" id="perf-trend">⚡ Good</div>
            </div>
            <div class="metric-card">
              <h4>Active Rules</h4>
              <div class="metric-value" id="active-rules">0</div>
              <div class="metric-trend" id="rules-trend">🔧 Custom</div>
            </div>
          </div>
          <div class="charts-container">
            <div class="chart-section">
              <h4>Findings by Category</h4>
              <canvas id="category-chart" width="400" height="200"></canvas>
            </div>
            <div class="chart-section">
              <h4>Trend Analysis (24h)</h4>
              <canvas id="trend-chart" width="400" height="200"></canvas>
            </div>
          </div>
          <div class="recent-findings">
            <h4>Recent Critical Findings</h4>
            <div id="recent-list" class="findings-list"></div>
          </div>
          <div class="remediation-suggestions">
            <h4>💡 Remediation Suggestions</h4>
            <div id="suggestions-list" class="suggestions-list"></div>
          </div>
        </div>
      `;

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        #qwen-dashboard {
          position: fixed;
          top: 10px;
          right: 10px;
          width: 600px;
          max-height: 80vh;
          background: #1a1a1a;
          color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
          display: none;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: #2d2d2d;
          border-bottom: 1px solid #444;
        }
        .dashboard-controls button {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
          padding: 5px;
        }
        .dashboard-content {
          padding: 20px;
          max-height: calc(80vh - 70px);
          overflow-y: auto;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .metric-card {
          background: #2d2d2d;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
        }
        .metric-trend {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
        }
        .charts-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .chart-section h4 {
          margin-bottom: 10px;
          color: #ffffff;
        }
        .findings-list, .suggestions-list {
          max-height: 150px;
          overflow-y: auto;
          background: #2d2d2d;
          border-radius: 4px;
          padding: 10px;
        }
        .finding-item, .suggestion-item {
          padding: 8px;
          border-bottom: 1px solid #444;
          font-size: 12px;
        }
        .finding-item:last-child, .suggestion-item:last-child {
          border-bottom: none;
        }
        .finding-high {
          color: #ff6b6b;
        }
        .finding-medium {
          color: #ffd93d;
        }
        .finding-low {
          color: #6bcf7f;
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(this.container);

      // Add event listeners
      this.setupEventListeners();

      // Initialize charts if Chart.js is available
      this.initializeCharts();
    },

    // Setup event listeners
    setupEventListeners: function() {
      const refreshBtn = this.container.querySelector('#dashboard-refresh');
      const minimizeBtn = this.container.querySelector('#dashboard-minimize');
      const closeBtn = this.container.querySelector('#dashboard-close');

      refreshBtn.addEventListener('click', () => this.update());
      minimizeBtn.addEventListener('click', () => this.hide());
      closeBtn.addEventListener('click', () => {
        this.hide();
        this.container.remove();
        this.container = null;
      });

      // Make dashboard draggable
      this.makeDraggable();
    },

    // Make dashboard draggable
    makeDraggable: function() {
      const header = this.container.querySelector('.dashboard-header');
      let isDragging = false;
      let startX, startY, startLeft, startTop;

      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = this.container.offsetLeft;
        startTop = this.container.offsetTop;
        this.container.style.cursor = 'move';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        this.container.style.left = (startLeft + dx) + 'px';
        this.container.style.top = (startTop + dy) + 'px';
        this.container.style.right = 'auto';
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        this.container.style.cursor = 'default';
      });
    },

    // Initialize charts (requires Chart.js)
    initializeCharts: function() {
      // Check if Chart.js is available
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js not found. Install Chart.js for visual charts: https://cdn.jsdelivr.net/npm/chart.js');
        return;
      }

      // Category chart
      const categoryCtx = this.container.querySelector('#category-chart');
      this.charts.category = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [
              '#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#45b7d1',
              '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ffffff' }
            }
          }
        }
      });

      // Trend chart
      const trendCtx = this.container.querySelector('#trend-chart');
      this.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Total Findings',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: '#ffffff' } },
            y: { ticks: { color: '#ffffff' } }
          },
          plugins: {
            legend: { labels: { color: '#ffffff' } }
          }
        }
      });
    },

    // Start real-time updates
    startUpdates: function() {
      this.update();
      this.updateInterval = setInterval(() => this.update(), 5000); // Update every 5 seconds
    },

    // Stop updates
    stopUpdates: function() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },

    // Update dashboard data
    update: function() {
      if (!this.container || !this.isVisible) return;

      // Update metrics
      const summary = window.ErrorDebugExtractor.viewFindings();
      const perfReport = performanceMonitor.getReport();
      const trends = historicalAnalysis.getTrends();

      // Update metric cards
      this.updateMetric('total-findings', summary.totalFindings);
      this.updateMetric('high-priority', summary.highPriority || 0);
      this.updateMetric('scan-time', `${perfReport.averageScanTime}ms`);
      this.updateMetric('active-rules', customRules.rules.size);

      // Update trends
      const totalTrend = trends.globalErrors?.direction || 'stable';
      const trendSymbol = totalTrend === 'increasing' ? '↗️' : totalTrend === 'decreasing' ? '↘️' : '➡️';
      this.updateTrend('total-trend', `${trendSymbol} ${totalTrend}`);

      // Update charts
      this.updateCharts(summary);

      // Update recent findings
      this.updateRecentFindings(summary);

      // Update remediation suggestions
      this.updateRemediationSuggestions(summary);
    },

    // Update metric value
    updateMetric: function(id, value) {
      const element = this.container.querySelector(`#${id}`);
      if (element) {
        element.textContent = value;
      }
    },

    // Update trend indicator
    updateTrend: function(id, value) {
      const element = this.container.querySelector(`#${id}`);
      if (element) {
        element.textContent = value;
      }
    },

    // Update charts with current data
    updateCharts: function(summary) {
      if (!this.charts.category) return;

      // Update category chart
      const categories = Object.keys(summary.counts || {});
      const values = Object.values(summary.counts || {});

      this.charts.category.data.labels = categories;
      this.charts.category.data.datasets[0].data = values;
      this.charts.category.update();

      // Update trend chart
      const historicalData = historicalAnalysis.getHistoricalData(24);
      const timestamps = historicalData.map(s => new Date(s.timestamp).toLocaleTimeString());
      const totals = historicalData.map(s => s.totalFindings);

      this.charts.trend.data.labels = timestamps;
      this.charts.trend.data.datasets[0].data = totals;
      this.charts.trend.update();
    },

    // Update recent findings list
    updateRecentFindings: function(summary) {
      const listElement = this.container.querySelector('#recent-list');
      if (!listElement) return;

      const recentFindings = [];
      Object.keys(findings).forEach(category => {
        const categoryFindings = Array.from(findings[category]).slice(-3); // Last 3 from each category
        recentFindings.push(...categoryFindings.map(f => ({ category, finding: f })));
      });

      recentFindings.sort((a, b) => {
        // Sort by severity (high priority first)
        const aPriority = a.finding.includes('VULN_P1') || a.finding.includes('HIGH') ? 3 :
                         a.finding.includes('MEDIUM') ? 2 : 1;
        const bPriority = b.finding.includes('VULN_P1') || b.finding.includes('HIGH') ? 3 :
                         b.finding.includes('MEDIUM') ? 2 : 1;
        return bPriority - aPriority;
      });

      listElement.innerHTML = recentFindings.slice(0, 10).map(item => {
        const severityClass = item.finding.includes('VULN_P1') || item.finding.includes('HIGH') ? 'finding-high' :
                             item.finding.includes('MEDIUM') ? 'finding-medium' : 'finding-low';
        return `<div class="finding-item ${severityClass}">${item.finding.substring(0, 100)}${item.finding.length > 100 ? '...' : ''}</div>`;
      }).join('');
    },

    // Update remediation suggestions
    updateRemediationSuggestions: function(summary) {
      const listElement = this.container.querySelector('#suggestions-list');
      if (!listElement) return;

      const suggestions = new Set();

      // Get suggestions for high-priority findings
      Object.keys(findings).forEach(category => {
        Array.from(findings[category]).slice(-2).forEach(finding => {
          if (finding.includes('VULN_') || finding.includes('HIGH') || finding.includes('LEAK')) {
            const suggestionList = remediationEngine.getSuggestions(finding);
            suggestionList.slice(0, 1).forEach(s => suggestions.add(s)); // One suggestion per finding
          }
        });
      });

      listElement.innerHTML = Array.from(suggestions).slice(0, 5).map(suggestion =>
        `<div class="suggestion-item">• ${suggestion}</div>`
      ).join('');
    }
  };

  // --- FINDINGS CONTAINER ---
  const findings = {
    globalErrors: new Set(), // Errors caught via window.onerror
    promiseRejections: new Set(), // Unhandled promise rejections
    consoleErrors: new Set(), // Errors/messages logged to console
    debugVariables: new Set(), // Potentially revealing global variables
    debugComments: new Set(), // Debug/todo comments in code
    sourcemaps: new Set(), // Found sourcemap references
    verboseOutputs: new Set(), // Verbose logging/info outputs
    storageLeaks: new Set(), // Sensitive data in browser storage
    domLeaks: new Set(), // Sensitive data exposed in DOM
    vulnerabilityPatterns: new Set(), // Common vulnerability patterns
  };

  // --- 1. GLOBAL ERROR LISTENER ---
  console.log("👂 Setting up global error listener...");
  const handleError = (message, source, lineno, colno, error) => {
    // Filter out very generic or network errors
    if (
      message &&
      !message.includes("Script error") &&
      !message.includes("NetworkError")
    ) {
      const entry = `[WINDOW_ERROR] ${message} (Source: ${source}, Line: ${lineno}, Col: ${colno})`;
      if (error && error.stack) {
        findings.globalErrors.add(
          `${entry}\n  Stack: ${error.stack
            .split("\n")
            .slice(0, 5)
            .join("\n  ")}`
        );
      } else {
        findings.globalErrors.add(entry);
      }
    }
  };
  window.addEventListener("error", handleError);

  // --- 2. UNHANDLED PROMISE REJECTION LISTENER ---
  console.log("👂 Setting up unhandled promise rejection listener...");
  const handleRejection = (event) => {
    let message = "Unhandled Promise Rejection";
    let stack = "";
    if (event.reason) {
      if (event.reason.message) {
        message = event.reason.message;
        stack = event.reason.stack || "";
      } else if (typeof event.reason === "string") {
        message = event.reason;
      }
    }
    const entry = `[PROMISE_REJECTION] ${message}`;
    if (stack) {
      findings.promiseRejections.add(
        `${entry}\n  Stack: ${stack.split("\n").slice(0, 5).join("\n  ")}`
      );
    } else {
      findings.promiseRejections.add(entry);
    }
    // Prevent browser's default logging for cleaner output
    // event.preventDefault();
  };
  window.addEventListener("unhandledrejection", handleRejection);

  // --- 3. OVERRIDE CONSOLE.ERROR/WARN/INFO FOR CAPTURE ---
  console.log("👂 Overriding console methods to capture messages...");
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  const originalConsoleLog = console.log;
  const originalConsoleDebug = console.debug;

  // Generic handler for console methods
  function createConsoleHandler(originalFn, methodName) {
    return function (...args) {
      try {
        // Convert arguments to a string representation
        const message = args
          .map((arg) => {
            if (typeof arg === "object") {
              try {
                // Limit size for complex objects
                return JSON.stringify(arg, null, 2).substring(0, 500);
              } catch (e) {
                return `[Object Circular/Unserializable]`;
              }
            }
            return String(arg);
          })
          .join(" ");

        // Heuristic checks for interesting content
        const lowerMsg = message.toLowerCase();
        const isVerbose =
          methodName === "info" ||
          methodName === "log" ||
          methodName === "debug";

        if (methodName === "error") {
          helpers.addFinding('consoleErrors', `${message}`);
        } else if (
          methodName === "warn" &&
          (lowerMsg.includes("deprecat") ||
            lowerMsg.includes("warn") ||
            lowerMsg.includes("invalid"))
        ) {
          helpers.addFinding('consoleErrors', `${message}`);
        } else if (
          !isVerbose &&
          (lowerMsg.includes("error") ||
            lowerMsg.includes("fail") ||
            lowerMsg.includes("exception"))
        ) {
          helpers.addFinding('consoleErrors', `${message}`);
        }

        if (isVerbose) {
          // Check verbose logs for revealing info
          if (
            lowerMsg.includes("debug") ||
            lowerMsg.includes("trace") ||
            lowerMsg.includes("dump") ||
            lowerMsg.includes("config") ||
            lowerMsg.includes("env") ||
            lowerMsg.includes("secret") ||
            /[\d\w]{20,}/.test(message) // Long strings might be tokens/IDs
          ) {
            helpers.addFinding('verboseOutputs', `[VERBOSE_${methodName.toUpperCase()}] ${message}`);
          }
        }

        // Check all non-log messages for debug comments/context
        if (methodName !== "log") {
          for (const indicator of config.debugIndicators) {
            if (lowerMsg.includes(indicator)) {
              helpers.addFinding('debugComments', `[${indicator.toUpperCase()}_INDICATOR] ${message}`);
              break; // Avoid duplicate adds for the same message
            }
          }
        }
      } catch (e) {
        // Ignore errors in our logging interceptor
      }
      // Call the original function to maintain normal console behavior
      originalFn.apply(console, args);
    };
  }

  console.error = createConsoleHandler(originalConsoleError, "error");
  console.warn = createConsoleHandler(originalConsoleWarn, "warn");
  console.info = createConsoleHandler(originalConsoleInfo, "info");
  console.log = createConsoleHandler(originalConsoleLog, "log");
  console.debug = createConsoleHandler(originalConsoleDebug, "debug");

  // --- 4. SEARCH FOR DEBUG VARIABLES IN GLOBAL SCOPE ---
  console.log("🔍 Searching global scope for debug variables...");
  try {
    const commonDebugVarNames = [
      "debug",
      "DEBUG",
      "isDebug",
      "dev",
      "DEV",
      "development",
      "DEVELOPMENT",
      "verbose",
      "VERBOSE",
      "showDebug",
      "config",
      "CONFIG",
      "settings",
      "ENV",
      "env",
      "environment",
      "ENVIRONMENT",
      "appConfig",
      "version",
      "VERSION",
      "buildInfo",
      "BUILD_INFO",

      // Debugging flags
      "trace",
      "TRACE",
      "logLevel",
      "LOG_LEVEL",
      "logging",
      "LOGGING",
      "debugMode",
      "DEBUG_MODE",
      "enableDebug",
      "ENABLE_DEBUG",
      "debugFlag",
      "DEBUG_FLAG",

      // Environment/config indicators
      "stage",
      "STAGE",
      "staging",
      "STAGING",
      "test",
      "TEST",
      "testing",
      "TESTING",
      "sandbox",
      "SANDBOX",
      "qa",
      "QA",

      // Build & release info
      "release",
      "RELEASE",
      "commitHash",
      "COMMIT_HASH",
      "gitRevision",
      "GIT_REVISION",
      "buildNumber",
      "BUILD_NUMBER",
      "buildVersion",
      "BUILD_VERSION"



    ];
    Object.getOwnPropertyNames(window).forEach((prop) => {
      // Skip browser native properties to reduce false positives
      if (helpers.isBrowserNative(prop)) return;

      for (const debugName of commonDebugVarNames) {
        if (prop.toLowerCase().includes(debugName.toLowerCase())) {
          try {
            let value = window[prop];
            let valueStr = "";
            if (typeof value === "function") {
              valueStr = `[Function: ${value.name || "anonymous"}]`;
            } else if (typeof value === "object" && value !== null) {
              valueStr = JSON.stringify(value, null, 2).substring(0, 300);
            } else {
              valueStr = String(value);
            }

            const finding = `${prop}: ${valueStr}`;
            helpers.addFinding('debugVariables', finding);
          } catch (e) {
            const finding = `${prop}: [Inaccessible - ${e.message}]`;
            helpers.addFinding('debugVariables', finding);
          }
          break; // Found a match, no need to check other names
        }
      }
    });
  } catch (e) {
    console.warn("Could not scan global scope for debug variables:", e);
  }

  // --- 4.5. SCAN BROWSER STORAGE FOR SENSITIVE DATA ---
  if (config.enableStorageScanning) {
    console.log("🔍 Scanning browser storage for sensitive data...");
    try {

    // Scan localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      checkStorageItem(key, value, "localStorage", config.sensitiveKeywords);
    }

    // Scan sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      checkStorageItem(key, value, "sessionStorage", config.sensitiveKeywords);
    }

    // Scan cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [key, ...valueParts] = cookie.trim().split('=');
      const value = valueParts.join('=');
      checkStorageItem(key, value, "cookie", config.sensitiveKeywords);
    });

    function checkStorageItem(key, value, storageType, keywords) {
      const keyLower = key.toLowerCase();
      const valueLower = value.toLowerCase();

      for (const keyword of keywords) {
        if (keyLower.includes(keyword) || valueLower.includes(keyword)) {
          // Additional validation for tokens
          if (keyword === 'token' || keyword === 'key' || keyword === 'secret') {
            if (!helpers.isValidToken(value)) continue; // Skip if doesn't look like a real token
          }

          // Skip generic or placeholder values
          const valueLower = value.toLowerCase();
          const isGeneric = valueLower.length < 5 ||
                          valueLower.includes('placeholder') ||
                          valueLower.includes('example') ||
                          valueLower.includes('test') ||
                          valueLower.includes('sample') ||
                          valueLower.includes('default') ||
                          valueLower === 'null' ||
                          valueLower === 'undefined' ||
                          valueLower === 'true' ||
                          valueLower === 'false';

          if (!isGeneric) {
            const finding = `[${storageType.toUpperCase()}_LEAK] Key: ${key}, Value: ${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
            helpers.addFinding('storageLeaks', finding);
          }
          break;
        }
      }

      // Check for long strings that might be tokens with better validation
      if (value.length >= config.minTokenLength && helpers.isValidToken(value)) {
        const finding = `[${storageType.toUpperCase()}_LONG_STRING] Key: ${key}, Value: ${value.substring(0, 50)}...`;
        helpers.addFinding('storageLeaks', finding);
      }
    }
  } catch (e) {
    console.warn("Could not scan browser storage:", e);
  }
 }

  // --- 4.6. COMPREHENSIVE DOM SCANNING FOR SENSITIVE INFORMATION ---
  if (config.enableDOMScanning) {
    console.log("🔍 Performing comprehensive DOM scanning for sensitive information...");
    try {
      // Performance optimization: throttle DOM scanning
      if (helpers.shouldThrottleScan()) {
        console.log("⏸️ Skipping DOM scan due to performance constraints");
        return;
      }
    // 1. Enhanced Input/Form Element Scanning
    if (!config.enableInputFieldScanning) {
      console.log("⏭️ Skipping input field scanning (disabled in config)");
    } else {
    const sensitiveSelectors = [
      'input[name*="password"]', 'input[name*="token"]', 'input[name*="key"]',
      'input[name*="secret"]', 'input[name*="auth"]', 'input[type="password"]',
      'input[type="hidden"]', 'input[name*="api"]', 'input[name*="session"]',
      'input[name*="jwt"]', 'input[name*="bearer"]', 'input[name*="credential"]',
      'textarea[name*="config"]', 'textarea[name*="settings"]', 'textarea[name*="json"]',
      'select[name*="env"]', 'select[name*="environment"]',
      'input[name*="access"]',
      'input[name*="refresh"]',
      'input[name*="security"]',
      'input[name*="pin"]',
      'input[name*="passcode"]',
      'input[name*="private"]',
      'input[name*="settings"]',
      'input[name*="user"]',
      'input[name*="email"]',
      'input[name*="login"]',
      'textarea[name*="config"]',
      'textarea[name*="settings"]',
      'textarea[name*="json"]',
      'select[name*="env"]',
      'select[name*="environment"]',
      // Financial data
      'input[name*="card"]',
      'input[name*="ccnum"]',
      'input[name*="credit"]',
      'input[name*="debit"]',
      'input[name*="cvc"]',
      'input[name*="cvv"]',
      'input[name*="iban"]',
      'input[name*="swift"]',
      'input[name*="routing"]',
      'input[name*="account"]',

      // Personal identifiers
      'input[name*="ssn"]',
      'input[name*="social"]',
      'input[name*="nationalid"]',
      'input[name*="passport"]',
      'input[name*="driver"]',
      'input[name*="license"]',
      'input[name*="taxid"]',
      'input[name*="nin"]', // Nigeria National Identification Number

      // Security & recovery
      'input[name*="otp"]',
      'input[name*="2fa"]',
      'input[name*="mfa"]',
      'input[name*="recovery"]',
      'input[name*="challenge"]',
      'input[name*="securityanswer"]',

      // File uploads (potential sensitive docs)
      'input[type="file"][name*="id"]',
      'input[type="file"][name*="document"]',
      'input[type="file"][name*="upload"]',

    // Textareas for secrets or code
      'textarea[name*="private"]',
      'textarea[name*="pem"]',
      'textarea[name*="certificate"]',

      // Environment and configuration
      'input[name*="env"]',
      'input[name*="config"]',
      'input[name*="setting"]',
      'input[name*="option"]',
      'input[name*="preference"]',
      'input[name*="profile"]',

      // Database and backend
      'input[name*="db"]',
      'input[name*="database"]',
      'input[name*="connection"]',
      'input[name*="host"]',
      'input[name*="port"]',
      'input[name*="server"]',
      'input[name*="endpoint"]',

      // Communication and messaging
      'input[name*="email"]',
      'input[name*="mail"]',
      'input[name*="message"]',
      'input[name*="chat"]',
      'input[name*="notification"]',
      'input[name*="alert"]',

      // User identification
      'input[name*="userid"]',
      'input[name*="user_id"]',
      'input[name*="customer"]',
      'input[name*="client"]',
      'input[name*="member"]',
      'input[name*="subscriber"]',

      // Content and media
      'input[name*="file"]',
      'input[name*="upload"]',
      'input[name*="media"]',
      'input[name*="image"]',
      'input[name*="video"]',
      'input[name*="audio"]',

      // Location and geographic
      'input[name*="location"]',
      'input[name*="address"]',
      'input[name*="geo"]',
      'input[name*="latitude"]',
      'input[name*="longitude"]',
      'input[name*="zip"]',
      'input[name*="postal"]',

      // Time and scheduling
      'input[name*="time"]',
      'input[name*="date"]',
      'input[name*="schedule"]',
      'input[name*="event"]',
      'input[name*="calendar"]',

      // Commerce and transactions
      'input[name*="order"]',
      'input[name*="transaction"]',
      'input[name*="payment"]',
      'input[name*="invoice"]',
      'input[name*="billing"]',
      'input[name*="subscription"]',

      // Analytics and tracking
      'input[name*="analytics"]',
      'input[name*="tracking"]',
      'input[name*="metric"]',
      'input[name*="statistic"]',
      'input[name*="report"]',

      // Security and compliance
      'input[name*="security"]',
      'input[name*="audit"]',
      'input[name*="log"]',
      'input[name*="trace"]',
      'input[name*="monitor"]',
      'input[name*="compliance"]',

      // Development and testing
      'input[name*="dev"]',
      'input[name*="test"]',
      'input[name*="staging"]',
      'input[name*="qa"]',
      'input[name*="demo"]',
      'input[name*="sandbox"]',

      // International and localization
      'input[name*="lang"]',
      'input[name*="locale"]',
      'input[name*="country"]',
      'input[name*="region"]',
      'input[name*="language"]',

      // Performance and optimization
      'input[name*="cache"]',
      'input[name*="performance"]',
      'input[name*="optimization"]',
      'input[name*="speed"]',
      'input[name*="latency"]',

      // Integration and third-party
      'input[name*="integration"]',
      'input[name*="webhook"]',
      'input[name*="callback"]',
      'input[name*="oauth"]',
      'input[name*="sso"]',
      'input[name*="federation"]',

      // Content management
      'input[name*="content"]',
      'input[name*="article"]',
      'input[name*="post"]',
      'input[name*="page"]',
      'input[name*="blog"]',
      'input[name*="news"]',

      // Search and discovery
      'input[name*="search"]',
      'input[name*="query"]',
      'input[name*="filter"]',
      'input[name*="sort"]',
      'input[name*="tag"]',
      'input[name*="category"]',

      // Social and community
      'input[name*="social"]',
      'input[name*="community"]',
      'input[name*="group"]',
      'input[name*="team"]',
      'input[name*="friend"]',
      'input[name*="follower"]',

      // Mobile and device
      'input[name*="mobile"]',
      'input[name*="device"]',
      'input[name*="app"]',
      'input[name*="platform"]',
      'input[name*="os"]',
      'input[name*="browser"]',

      // Advanced selectors for complex patterns
      'input[placeholder*="token"]',
      'input[placeholder*="key"]',
      'input[placeholder*="secret"]',
      'input[placeholder*="password"]',
      'input[data-testid*="auth"]',
      'input[data-cy*="login"]',
      'input[aria-label*="password"]',
      'input[aria-label*="token"]',

      // Form-specific patterns
      'form[action*="auth"] input',
      'form[action*="login"] input',
      'form[method="post"] input[name*="credential"]',
      'form[action*="api"] input',

      // Dynamic content patterns
      'input[ng-model*="token"]',
      'input[v-model*="key"]',
      'input[react-data*="secret"]',

      // Legacy and uncommon patterns
      'input[name*="legacy"]',
      'input[name*="deprecated"]',
      'input[name*="old"]',
      'input[name*="backup"]',
      'input[name*="temp"]',
      'input[name*="tmp"]'

    ];

    sensitiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        const value = el.value || el.textContent || el.getAttribute('value') || '';
        if (value && value.length > 0) {
          const valueLower = value.toLowerCase();

          // Skip if value is too generic or appears to be placeholder/default content
          if (valueLower.length < 3 ||
              valueLower.includes('placeholder') ||
              valueLower.includes('example') ||
              valueLower.includes('test') ||
              valueLower.includes('sample') ||
              valueLower.includes('default')) {
            return;
          }

          const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
            valueLower.includes(keyword)
          );

          // Additional validation for sensitive content
          if (hasSensitiveContent || helpers.isValidToken(value)) {
            // Double-check that this isn't a false positive by ensuring the value
            // contains actual sensitive-looking patterns
            const hasActualSensitivePattern =
              value.includes('sk_live_') ||
              value.includes('sk-') ||
              value.includes('AKIA') ||
              value.includes('eyJ') ||
              value.includes('AIza') ||
              value.includes('xoxb-') ||
              value.includes('gho_') ||
              value.includes('ghp_') ||
              value.includes('glpat-') ||
              value.includes('mongodb://') ||
              value.includes('mysql://') ||
              value.includes('postgresql://') ||
              value.includes('redis://') ||
              value.includes('-----BEGIN') ||
              (value.length >= 32 && helpers.isValidToken(value));

            if (hasActualSensitivePattern) {
              const finding = `[DOM_INPUT_LEAK] Selector: ${selector}, Index: ${index}, Value: ${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
              helpers.addFinding('domLeaks', finding);
            }
          }
        }
      });
    });

    // 2. Meta Tag Content Scanning
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach((meta, index) => {
      const content = meta.getAttribute('content') || '';
      const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
      if (content && content.length > 0) {
        const contentLower = content.toLowerCase();
        const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
          contentLower.includes(keyword) || name.toLowerCase().includes(keyword)
        );

        if (hasSensitiveContent || helpers.isValidToken(content)) {
          const finding = `[DOM_META_LEAK] Meta tag #${index} (name: ${name}), Content: ${content.substring(0, config.maxStringLength)}${content.length > config.maxStringLength ? '...' : ''}`;
          helpers.addFinding('domLeaks', finding);
        }
      }
    });

    // 3. Enhanced Data Attribute Scanning
    const allElements = document.querySelectorAll('*');
    const sensitiveDataAttrs = [
      'data-token', 'data-key', 'data-secret', 'data-password', 'data-auth',
      'data-api', 'data-session', 'data-jwt', 'data-bearer', 'data-credential',
      'data-user', 'data-email', 'data-private', 'data-internal', 'data-config',
      'data-setting', 'data-env', 'data-environment', 'data-db', 'data-database',
      'data-connection', 'data-host', 'data-server', 'data-endpoint', 'data-webhook',
      'data-callback', 'data-oauth', 'data-sso', 'data-federation', 'data-cache',
      'data-performance', 'data-metric', 'data-analytic', 'data-tracking',
      'data-report', 'data-log', 'data-trace', 'data-monitor', 'data-audit',
      'data-compliance', 'data-security', 'data-dev', 'data-test', 'data-staging',
      'data-qa', 'data-demo', 'data-sandbox', 'data-lang', 'data-locale',
      'data-country', 'data-region', 'data-mobile', 'data-device', 'data-app',
      'data-platform', 'data-os', 'data-browser', 'data-file', 'data-upload',
      'data-media', 'data-image', 'data-video', 'data-audio', 'data-location',
      'data-address', 'data-geo', 'data-latitude', 'data-longitude', 'data-zip',
      'data-postal', 'data-time', 'data-date', 'data-schedule', 'data-event',
      'data-calendar', 'data-order', 'data-transaction', 'data-payment',
      'data-invoice', 'data-billing', 'data-subscription', 'data-content',
      'data-article', 'data-post', 'data-page', 'data-blog', 'data-news',
      'data-search', 'data-query', 'data-filter', 'data-sort', 'data-tag',
      'data-category', 'data-social', 'data-community', 'data-group', 'data-team',
      'data-friend', 'data-follower', 'data-legacy', 'data-deprecated', 'data-old',
      'data-backup', 'data-temp', 'data-tmp', 'data-card', 'data-ccnum', 'data-cvc',
      'data-cvv', 'data-iban', 'data-swift', 'data-routing', 'data-account',
      'data-ssn', 'data-social-security', 'data-national-id', 'data-passport',
      'data-driver-license', 'data-tax-id', 'data-nin', 'data-otp', 'data-2fa',
      'data-mfa', 'data-recovery', 'data-challenge', 'data-security-answer',
      'data-id', 'data-document', 'data-certificate', 'data-pem', 'data-private-key',
      'data-public-key', 'data-signature', 'data-hash', 'data-checksum', 'data-fingerprint',
      'data-thumbprint', 'data-digest', 'data-mac', 'data-hmac', 'data-encryption',
      'data-decryption', 'data-cipher', 'data-keypair', 'data-certificate-chain',
      'data-truststore', 'data-keystore', 'data-wallet', 'data-seed', 'data-mnemonic',
      'data-passphrase', 'data-pin', 'data-code', 'data-verification', 'data-confirmation',
      'data-reset', 'data-activation', 'data-registration', 'data-signup', 'data-onboarding',
      'data-verification-token', 'data-reset-token', 'data-access-token', 'data-refresh-token',
      'data-bearer-token', 'data-auth-token', 'data-session-token', 'data-csrf-token',
      'data-xsrf-token', 'data-nonce', 'data-state', 'data-code-challenge', 'data-code-verifier',
      'data-client-id', 'data-client-secret', 'data-app-id', 'data-app-secret', 'data-consumer-key',
      'data-consumer-secret', 'data-access-key', 'data-secret-key', 'data-api-key', 'data-api-secret',
      'data-webhook-secret', 'data-signing-key', 'data-verification-key', 'data-encryption-key',
      'data-decryption-key', 'data-master-key', 'data-root-key', 'data-private-key-pem',
      'data-public-key-pem', 'data-certificate-pem', 'data-ca-certificate', 'data-intermediate-certificate',
      'data-leaf-certificate', 'data-ssl-certificate', 'data-tls-certificate', 'data-ssh-key',
      'data-ssh-public-key', 'data-ssh-private-key', 'data-gpg-key', 'data-gpg-public-key',
      'data-gpg-private-key', 'data-pgp-key', 'data-pgp-public-key', 'data-pgp-private-key'
    ];

    allElements.forEach((el, index) => {
      const attributes = el.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith('data-')) {
          const value = attr.value;
          if (value && value.length > 0) {
            const valueLower = value.toLowerCase();
            const attrNameLower = attr.name.toLowerCase();

            // Check against sensitive data attributes
            const isSensitiveAttr = sensitiveDataAttrs.some(sensitiveAttr =>
              attrNameLower === sensitiveAttr || attrNameLower.includes(sensitiveAttr.replace('data-', ''))
            );

            const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
              valueLower.includes(keyword)
            );

            if (isSensitiveAttr || hasSensitiveContent || helpers.isValidToken(value)) {
              // Additional validation to avoid false positives
              const hasActualSensitivePattern =
                value.includes('sk_live_') ||
                value.includes('sk-') ||
                value.includes('AKIA') ||
                value.includes('eyJ') ||
                value.includes('AIza') ||
                value.includes('xoxb-') ||
                value.includes('gho_') ||
                value.includes('ghp_') ||
                value.includes('glpat-') ||
                value.includes('mongodb://') ||
                value.includes('mysql://') ||
                value.includes('postgresql://') ||
                value.includes('redis://') ||
                value.includes('-----BEGIN') ||
                (value.length >= 32 && helpers.isValidToken(value));

              // Skip generic or placeholder values
              const isGeneric = valueLower.length < 5 ||
                              valueLower.includes('placeholder') ||
                              valueLower.includes('example') ||
                              valueLower.includes('test') ||
                              valueLower.includes('sample') ||
                              valueLower.includes('default') ||
                              valueLower === 'null' ||
                              valueLower === 'undefined' ||
                              valueLower === 'true' ||
                              valueLower === 'false';

              if (hasActualSensitivePattern && !isGeneric) {
                const finding = `[DOM_DATA_ATTR_LEAK] Element: ${el.tagName}[${index}], Attr: ${attr.name}, Value: ${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
                helpers.addFinding('domLeaks', finding);
              }
            }
          }
        }
      }
    });

    // 4. Script Tag Content Analysis (JSON data, inline configs)
    const scriptTags = document.querySelectorAll('script:not([src])');
    scriptTags.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.length > 50) { // Only scan substantial script content
        const contentLower = content.toLowerCase();

        // Check for JSON-like structures with sensitive data
        const jsonMatches = content.match(/\{[^}]*\}/g);
        if (jsonMatches) {
          jsonMatches.forEach(jsonStr => {
            try {
              const parsed = JSON.parse(jsonStr);
              const stringified = JSON.stringify(parsed);
              const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
                stringified.toLowerCase().includes(keyword)
              );

              if (hasSensitiveContent || helpers.isValidToken(stringified)) {
                const finding = `[DOM_SCRIPT_JSON_LEAK] Script #${index} contains sensitive JSON: ${stringified.substring(0, config.maxStringLength)}${stringified.length > config.maxStringLength ? '...' : ''}`;
                helpers.addFinding('domLeaks', finding);
              }
            } catch (e) {
              // Not valid JSON, continue
            }
          });
        }

        // Check for Base64 encoded data
        const base64Matches = content.match(/[A-Za-z0-9+/=]{50,}/g);
        if (base64Matches) {
          base64Matches.forEach(match => {
            try {
              const decoded = atob(match);
              if (decoded.length > 10) {
                const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
                  decoded.toLowerCase().includes(keyword)
                );

                if (hasSensitiveContent || helpers.isValidToken(decoded)) {
                  const finding = `[DOM_SCRIPT_BASE64_LEAK] Script #${index} contains encoded sensitive data: ${decoded.substring(0, config.maxStringLength)}${decoded.length > config.maxStringLength ? '...' : ''}`;
                  helpers.addFinding('domLeaks', finding);
                }
              }
            } catch (e) {
              // Not valid Base64, continue
            }
          });
        }
      }
    });

    // 5. URL Parameter Scanning
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
      const keyLower = key.toLowerCase();
      const valueLower = value.toLowerCase();
      const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
        keyLower.includes(keyword) || valueLower.includes(keyword)
      );

      if (hasSensitiveContent || helpers.isValidToken(value)) {
        const finding = `[DOM_URL_PARAM_LEAK] URL Parameter: ${key}=${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
        helpers.addFinding('domLeaks', finding);
      }
    }

    // 6. Hash Fragment Scanning
    if (window.location.hash && window.location.hash.length > 1) {
      const hash = window.location.hash.substring(1);
      const hashLower = hash.toLowerCase();
      const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
        hashLower.includes(keyword)
      );

      if (hasSensitiveContent || helpers.isValidToken(hash)) {
        const finding = `[DOM_HASH_LEAK] URL Hash contains sensitive data: ${hash.substring(0, config.maxStringLength)}${hash.length > config.maxStringLength ? '...' : ''}`;
        helpers.addFinding('domLeaks', finding);
      }
    }

    // 7. Form Data Scanning
    const forms = document.querySelectorAll('form');
    forms.forEach((form, formIndex) => {
      const formData = new FormData(form);
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && value.length > 0) {
          const keyLower = key.toLowerCase();
          const valueLower = value.toLowerCase();
          const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
            keyLower.includes(keyword) || valueLower.includes(keyword)
          );

          if (hasSensitiveContent || helpers.isValidToken(value)) {
            const finding = `[DOM_FORM_LEAK] Form #${formIndex}, Field: ${key}, Value: ${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
            helpers.addFinding('domLeaks', finding);
          }
        }
      }
    });

    // 8. HTML Comment Scanning
    const commentIterator = document.createNodeIterator(
      document.documentElement,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    let comment;
    while ((comment = commentIterator.nextNode())) {
      const commentText = comment.textContent.trim();
      if (commentText.length > 10) {
        const commentLower = commentText.toLowerCase();
        const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
          commentLower.includes(keyword)
        );

        if (hasSensitiveContent || helpers.isValidToken(commentText)) {
          const finding = `[DOM_COMMENT_LEAK] HTML Comment contains sensitive data: ${commentText.substring(0, config.maxStringLength)}${commentText.length > config.maxStringLength ? '...' : ''}`;
          helpers.addFinding('domLeaks', finding);
        }
      }
    }

    // 9. Inline Event Handler Scanning
    const elementsWithEvents = document.querySelectorAll('*[onclick], *[onload], *[onerror], *[onsubmit]');
    elementsWithEvents.forEach((el, index) => {
      ['onclick', 'onload', 'onerror', 'onsubmit', 'onchange', 'onmouseover'].forEach(attr => {
        const handler = el.getAttribute(attr);
        if (handler && handler.length > 10) {
          const handlerLower = handler.toLowerCase();
          const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
            handlerLower.includes(keyword)
          );

          if (hasSensitiveContent || handler.includes('token') || handler.includes('key')) {
            const finding = `[DOM_EVENT_LEAK] Element #${index} has sensitive event handler (${attr}): ${handler.substring(0, config.maxStringLength)}${handler.length > config.maxStringLength ? '...' : ''}`;
            helpers.addFinding('domLeaks', finding);
          }
        }
      });
    });
    } // End of input field scanning config check

    // 10. Data URL Scanning
    const dataUrlElements = document.querySelectorAll('*[src], *[href]');
    dataUrlElements.forEach((el, index) => {
      const url = el.src || el.href;
      if (url && url.startsWith('data:')) {
        const dataContent = url.split(',')[1];
        if (dataContent && dataContent.length > 20) {
          try {
            const decoded = atob(dataContent);
            const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
              decoded.toLowerCase().includes(keyword)
            );

            if (hasSensitiveContent || helpers.isValidToken(decoded)) {
              const finding = `[DOM_DATA_URL_LEAK] Element #${index} has sensitive data URL: ${decoded.substring(0, config.maxStringLength)}${decoded.length > config.maxStringLength ? '...' : ''}`;
              helpers.addFinding('domLeaks', finding);
            }
          } catch (e) {
            // Not valid Base64 data URL
          }
        }
      }
    });

    // 11. Enhanced Text Content Scanning with Context
    const allTextNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    while ((textNode = allTextNodes.nextNode())) {
      const text = textNode.textContent.trim();
      if (text.length > 10) {
        const textLower = text.toLowerCase();
        const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
          textLower.includes(keyword)
        );

        // Additional context-aware checks
        const parentElement = textNode.parentElement;
        const isInSensitiveContext = parentElement &&
          (parentElement.tagName === 'SCRIPT' ||
           parentElement.tagName === 'TEXTAREA' ||
           parentElement.getAttribute('type') === 'hidden' ||
           parentElement.className.toLowerCase().includes('config'));

        if (hasSensitiveContent || helpers.isValidToken(text) || isInSensitiveContext) {
          const context = parentElement ? ` in ${parentElement.tagName}${parentElement.className ? '.' + parentElement.className : ''}` : '';
          const finding = `[DOM_TEXT_LEAK${context}] Text: ${text.substring(0, config.maxStringLength)}${text.length > config.maxStringLength ? '...' : ''}`;
          helpers.addFinding('domLeaks', finding);
        }
      }
    }

    // 12. Local/Global Variable Cross-Reference
    try {
      const globalVars = Object.keys(window);
      globalVars.forEach(varName => {
        if (!helpers.isBrowserNative(varName)) {
          const value = window[varName];
          if (typeof value === 'string' && value.length > 10) {
            const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
              value.toLowerCase().includes(keyword)
            );

            if (hasSensitiveContent || helpers.isValidToken(value)) {
              const finding = `[DOM_GLOBAL_VAR_LEAK] Global variable ${varName}: ${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
              helpers.addFinding('domLeaks', finding);
            }
          }
        }
      });
    } catch (e) {
      // Ignore errors when accessing global variables
    }

    // 13. Style Content Scanning
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach((style, index) => {
      const cssContent = style.textContent || '';
      if (cssContent.length > 50) {
        const cssLower = cssContent.toLowerCase();
        const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
          cssLower.includes(keyword)
        );

        if (hasSensitiveContent) {
          const finding = `[DOM_CSS_LEAK] Style #${index} contains sensitive data: ${cssContent.substring(0, config.maxStringLength)}${cssContent.length > config.maxStringLength ? '...' : ''}`;
          helpers.addFinding('domLeaks', finding);
        }
      }
    });

    // 14. Iframe Content Scanning
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const iframeText = iframeDoc.body ? iframeDoc.body.textContent : '';
          if (iframeText && iframeText.length > 20) {
            const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
              iframeText.toLowerCase().includes(keyword)
            );

            if (hasSensitiveContent || helpers.isValidToken(iframeText)) {
              const finding = `[DOM_IFRAME_LEAK] Iframe #${index} contains sensitive content: ${iframeText.substring(0, config.maxStringLength)}${iframeText.length > config.maxStringLength ? '...' : ''}`;
              helpers.addFinding('domLeaks', finding);
            }
          }
        }
      } catch (e) {
        // Cross-origin iframe, can't access content
      }
    });

    // 15. Custom Element Property Scanning
    const customElements = document.querySelectorAll('*');
    customElements.forEach((el, index) => {
      if (el.tagName.includes('-')) { // Custom elements
        const properties = Object.getOwnPropertyNames(el);
        properties.forEach(prop => {
          if (!prop.startsWith('_') && typeof el[prop] === 'string' && el[prop].length > 10) {
            const value = el[prop];
            const hasSensitiveContent = config.sensitiveKeywords.some(keyword =>
              value.toLowerCase().includes(keyword)
            );

            if (hasSensitiveContent || helpers.isValidToken(value)) {
              const finding = `[DOM_CUSTOM_ELEMENT_LEAK] Custom element ${el.tagName}[${index}], Property: ${prop}, Value: ${value.substring(0, config.maxStringLength)}${value.length > config.maxStringLength ? '...' : ''}`;
              helpers.addFinding('domLeaks', finding);
            }
          }
        });
      }
    });

  } catch (e) {
    console.warn("Could not perform comprehensive DOM scanning:", e);
    helpers.addFinding('globalErrors', `[DOM_SCAN_ERROR] ${e.message}`);
  }
}

  // --- 4.7. SCAN FOR COMMON VULNERABILITY PATTERNS ---
  if (config.enableVulnerabilityScanning) {
    console.log("🔍 Scanning for common vulnerability patterns...");
    try {
    // Check for eval usage in scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('eval(') || content.includes('Function(')) {
        helpers.addFinding('vulnerabilityPatterns', `[VULN_EVAL_USAGE] Found eval/Function in script #${index}: ${content.substring(content.indexOf('eval') - 20, content.indexOf('eval') + 50)}`);
      }
    });

    // Check for innerHTML with potential user input
    const elementsWithInnerHTML = document.querySelectorAll('[innerHTML]');
    elementsWithInnerHTML.forEach((el, index) => {
      if (el.innerHTML.includes('location') || el.innerHTML.includes('document.cookie') ||
          el.innerHTML.includes('window.')) {
        helpers.addFinding('vulnerabilityPatterns', `[VULN_INNERHTML_INJECTION] Element #${index} with innerHTML: ${el.innerHTML.substring(0, config.maxStringLength)}`);
      }
    });

    // Check for exposed API endpoints in scripts
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      const apiMatches = content.match(/https?:\/\/[^\s'"]+/g);
      if (apiMatches) {
        apiMatches.forEach(match => {
          if (match.includes('/api/') || match.includes('/internal/') || match.includes('/admin/')) {
            helpers.addFinding('vulnerabilityPatterns', `[VULN_EXPOSED_API] Script #${index}: ${match}`);
          }
        });
      }
    });

    // Check for missing CSP or security headers (basic check)
    const metaTags = document.querySelectorAll('meta');
    let hasCSP = false;
    metaTags.forEach(tag => {
      if (tag.getAttribute('http-equiv') === 'Content-Security-Policy') {
        hasCSP = true;
      }
    });
    if (!hasCSP) {
      helpers.addFinding('vulnerabilityPatterns', `[VULN_MISSING_CSP] No Content-Security-Policy meta tag found`);
    }

    // --- ADVANCED P1 VULNERABILITY DETECTION ---

    // 1. Prototype Pollution Detection
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('__proto__') || content.includes('prototype') ||
          content.includes('constructor')) {
        const finding = `[VULN_P1_PROTOTYPE_POLLUTION] Potential prototype pollution in script #${index}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 2. Subdomain Takeover Detection
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.href;
      if (href.includes('github.io') || href.includes('herokuapp.com') ||
          href.includes('azurewebsites.net') || href.includes('appspot.com')) {
        const finding = `[VULN_P1_SUBDOMAIN_TAKEOVER] Potential subdomain takeover target: ${href}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 3. CORS Misconfiguration Detection
    const corsHeaders = ['access-control-allow-origin', 'access-control-allow-methods'];
    // This would need to be checked via network requests, but we can check for CORS-related code
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('Access-Control-Allow') || content.includes('CORS')) {
        const finding = `[VULN_P1_CORS_CHECK] CORS-related code found in script #${index}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 4. Clickjacking Detection
    const metaTagsFrame = document.querySelectorAll('meta');
    let hasFrameOptions = false;
    let hasCSPFrame = false;
    metaTagsFrame.forEach(tag => {
      if (tag.getAttribute('http-equiv') === 'X-Frame-Options') {
        hasFrameOptions = true;
      }
      if (tag.getAttribute('http-equiv') === 'Content-Security-Policy' &&
          tag.content.includes('frame-ancestors')) {
        hasCSPFrame = true;
      }
    });
    if (!hasFrameOptions && !hasCSPFrame) {
      helpers.addFinding('vulnerabilityPatterns', `[VULN_P1_CLICKJACKING] No X-Frame-Options or CSP frame-ancestors protection found`);
    }

    // 5. Mixed Content Detection
    const allLinks = document.querySelectorAll('link[href], script[src], img[src]');
    allLinks.forEach(el => {
      const url = el.href || el.src;
      if (url && url.startsWith('http://') && window.location.protocol === 'https:') {
        const finding = `[VULN_P1_MIXED_CONTENT] Mixed content: ${url}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 6. Insecure Deserialization Patterns
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('JSON.parse(') && content.includes('eval(')) {
        const finding = `[VULN_P1_INSECURE_DESERIALIZATION] Potential insecure deserialization in script #${index}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 7. Race Condition Indicators
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('setTimeout') && content.includes('async') &&
          (content.includes('balance') || content.includes('money') || content.includes('transfer'))) {
        const finding = `[VULN_P1_RACE_CONDITION] Potential race condition in financial logic, script #${index}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 8. IDOR Patterns
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      const idorPatterns = [
        /\/user\/\d+/,
        /\/account\/\d+/,
        /\/profile\/\d+/,
        /id=\d+/,
        /user_id=\d+/
      ];
      idorPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          const finding = `[VULN_P1_IDOR] Potential IDOR pattern in script #${index}: ${pattern.source}`;
          helpers.addFinding('vulnerabilityPatterns', finding);
        }
      });
    });

    // 9. SSRF Potential
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('fetch(') && content.includes('localhost')) {
        const finding = `[VULN_P1_SSRF] Potential SSRF in script #${index} - localhost access`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 10. XXE Potential
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('XMLHttpRequest') && content.includes('ENTITY')) {
        const finding = `[VULN_P1_XXE] Potential XXE vulnerability in script #${index}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 11. Insecure Direct Object References in URLs
    const currentUrl = window.location.href;
    if (currentUrl.includes('/user/') || currentUrl.includes('/account/') ||
        currentUrl.includes('/file/') || currentUrl.includes('id=')) {
      const finding = `[VULN_P1_IDOR_URL] Current URL contains potential IDOR pattern: ${currentUrl}`;
      helpers.addFinding('vulnerabilityPatterns', finding);
    }

    // 12. Weak Password Policy Detection
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input, index) => {
      const minLength = input.getAttribute('minlength') || input.getAttribute('data-minlength');
      if (!minLength || parseInt(minLength) < 8) {
        const finding = `[VULN_P1_WEAK_PASSWORD] Password input #${index} has weak or no minimum length requirement`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 13. Exposed Debug Endpoints
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      const debugEndpoints = ['/debug', '/console', '/admin', '/phpinfo', '/server-status'];
      debugEndpoints.forEach(endpoint => {
        if (content.includes(endpoint)) {
          const finding = `[VULN_P1_DEBUG_ENDPOINT] Debug/admin endpoint exposed in script #${index}: ${endpoint}`;
          helpers.addFinding('vulnerabilityPatterns', finding);
        }
      });
    });

    // 14. Insecure Cookie Settings
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name && !cookie.includes('Secure') && !cookie.includes('HttpOnly')) {
        const finding = `[VULN_P1_INSECURE_COOKIE] Cookie "${name}" missing Secure or HttpOnly flags`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });

    // 15. Local File Inclusion Potential
    scripts.forEach((script, index) => {
      const content = script.textContent || '';
      if (content.includes('file://') || content.includes('/etc/') ||
          content.includes('/proc/') || content.includes('..')) {
        const finding = `[VULN_P1_LFI] Potential Local File Inclusion in script #${index}`;
        helpers.addFinding('vulnerabilityPatterns', finding);
      }
    });
  } catch (e) {
    console.warn("Could not scan for vulnerability patterns:", e);
  }
 }

  // --- 4.8. FRAMEWORK-SPECIFIC DEBUG DETECTION ---
  console.log("🔍 Checking for framework-specific debug information...");
  try {
    // React dev mode detection
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      helpers.addFinding('debugVariables', "[FRAMEWORK_REACT_DEV] React development mode detected");
    }

    // Vue dev tools detection
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      helpers.addFinding('debugVariables', "[FRAMEWORK_VUE_DEV] Vue dev tools detected");
    }

    // Angular debug info
    if (window.ng && window.ng.coreTokens) {
      helpers.addFinding('debugVariables', "[FRAMEWORK_ANGULAR_DEBUG] Angular debug information exposed");
    }

    // Check for framework-specific global objects
    const frameworkGlobals = [
      'React', 'Vue', 'angular', 'Ember', 'Backbone', 'jQuery',
      '__REDUX_DEVTOOLS_EXTENSION__', '__REACT_DEVTOOLS_GLOBAL_HOOK__'
    ];

    frameworkGlobals.forEach(global => {
      if (window[global]) {
        helpers.addFinding('debugVariables', `[FRAMEWORK_GLOBAL] ${global} detected in window`);
      }
    });

    // Check scripts for framework indicators
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.src;
      if (src.includes('react.development') || src.includes('vue.runtime')) {
        helpers.addFinding('debugVariables', `[FRAMEWORK_DEV_SCRIPT] Development script detected: ${src}`);
      }
    });
  } catch (e) {
    console.warn("Could not check for framework-specific debug info:", e);
  }

  // --- 5. SEARCH INLINE SCRIPTS/STYLES FOR COMMENTS & SOURCEMAPS ---
  console.log(
    "📜 Scanning inline scripts/styles for comments and sourcemaps..."
  );
  try {
    // Check inline scripts
    const inlineScripts = document.querySelectorAll("script:not([src])");
    inlineScripts.forEach((script, index) => {
      const content = script.textContent;
      if (content) {
        findCommentsAndSourcemaps(content, `Inline Script #${index}`);
      }
    });

    // Check inline styles (less common, but possible)
    const styles = document.querySelectorAll("style");
    styles.forEach((style, index) => {
      const content = style.textContent;
      if (content) {
        findCommentsAndSourcemaps(content, `Inline Style #${index}`);
      }
    });

    // Check external script tags for sourcemaps
    const externalScripts = document.querySelectorAll("script[src]");
    externalScripts.forEach((script) => {
      const src = script.src;
      // A basic check: if the src URL itself contains .map or ends with it
      // A more thorough check would involve fetching the file
      if (src.includes(".map") || src.endsWith(".map")) {
        findings.sourcemaps.add(`Potential Sourcemap in Script Tag: ${src}`);
      }
    });
  } catch (e) {
    console.warn("Could not scan scripts/styles for comments/sourcemaps:", e);
  }

  function findCommentsAndSourcemaps(text, source) {
    // Find comments
    const comments = text.match(/(?:\/\/.*$|\/\*[\s\S]*?\*\/)/gm);
    if (comments) {
      comments.forEach((comment) => {
        const trimmedComment = comment.trim();
        const lowerComment = trimmedComment.toLowerCase();
        if (
          lowerComment.includes("todo") ||
          lowerComment.includes("fixme") ||
          lowerComment.includes("hack") ||
          lowerComment.includes("xxx") ||
          lowerComment.includes("debug") ||
          lowerComment.includes("temp") ||
          lowerComment.includes("secret") ||
          lowerComment.includes("key") ||
          lowerComment.includes("password")
        ) {
          helpers.addFinding('debugComments', `[COMMENT] ${trimmedComment} (Source: ${source})`);
        }
      });
    }

    // Enhanced sourcemap detection with multiple patterns
    const sourcemapPatterns = [
      /\/\/[#@]\s*sourceMappingURL\s*=\s*(\S+)/i,
      /\/\*#\s*sourceMappingURL\s*=\s*(\S+)\s*\*\//i,
      /sourceMappingURL\s*=\s*data:application\/json;base64,[A-Za-z0-9+/=]+/i,
      /\/\/#\s*sourceMappingURL=data:application\/json;base64,[A-Za-z0-9+/=]+/i,
      /\/\/\s*sourceMappingURL\s*=\s*(\S+)/i,
      /\/\*\s*sourceMappingURL\s*=\s*(\S+)\s*\*\//i,
      /"sourceMappingURL"\s*:\s*"([^"]+)"/i,
      /sourceMappingURL\s*:\s*"([^"]+)"/i,
      /sourceMappingURL\s*:\s*['"]([^'"]+)['"]/i
    ];

    let sourceMapMatch = null;
    for (const pattern of sourcemapPatterns) {
      sourceMapMatch = text.match(pattern);
      if (sourceMapMatch) break;
    }
    if (sourceMapMatch) {
      const sourcemapUrl = sourceMapMatch[1];
      helpers.addFinding('sourcemaps', `Sourcemap Ref: ${sourcemapUrl} (Source: ${source})`);

      // Try to fetch and analyze sourcemap (if accessible)
      try {
        fetch(sourcemapUrl)
          .then(response => {
            if (response.ok) {
              return response.text();
            }
          })
          .then(sourcemapContent => {
            if (sourcemapContent) {
              helpers.addFinding('sourcemaps', `[SOURCEMAP_ACCESSIBLE] ${sourcemapUrl} - Contains ${sourcemapContent.length} chars of source mapping data`);

              // Check for sensitive paths in sourcemap
              if (sourcemapContent.includes('/secret/') || sourcemapContent.includes('/private/') ||
                  sourcemapContent.includes('/internal/')) {
                helpers.addFinding('vulnerabilityPatterns', `[VULN_SOURCEMAP_PATHS] ${sourcemapUrl} contains sensitive path information`);
              }
            }
          })
          .catch(() => {
            helpers.addFinding('sourcemaps', `[SOURCEMAP_INACCESSIBLE] ${sourcemapUrl} - Could not fetch (may be protected)`);
          });
      } catch (e) {
        // Ignore fetch errors in sourcemap checking
      }
    }

    // Check for other source code leaks with improved validation
    const sensitivePatterns = [
      // Authentication patterns (more specific)
      /Authorization\s*:\s*Bearer\s+[A-Za-z0-9+/=.-]{20,}/i,
      /Authorization\s*:\s*Basic\s+[A-Za-z0-9+/=]{20,}/i,
      /X-API-Key\s*:\s*[A-Za-z0-9+/=.-]{20,}/i,
      /X-Auth-Token\s*:\s*[A-Za-z0-9+/=.-]{20,}/i,
      /X-CSRF-Token\s*:\s*[A-Za-z0-9+/=.-]{20,}/i,

      // Database connection strings (specific patterns)
      /mongodb:\/\/[^:]+:[^@]+@[^/]+/i,
      /mysql:\/\/[^:]+:[^@]+@[^/]+/i,
      /postgresql:\/\/[^:]+:[^@]+@[^/]+/i,
      /redis:\/\/[^:]+:[^@]+@[^/]+/i,
      /DATABASE_URL\s*=\s*(?:mysql|postgresql|mongodb|redis):\/\/[^'"\s]+/i,

      // Cloud service credentials (specific patterns)
      /AWS_ACCESS_KEY_ID\s*=\s*AKIA[A-Z0-9]{16}/i,
      /AWS_SECRET_ACCESS_KEY\s*=\s*[A-Za-z0-9+/=]{30,}/i,
      /GOOGLE_APPLICATION_CREDENTIALS\s*=\s*[^'"\s]*\.json/i,
      /AZURE_CLIENT_SECRET\s*=\s*[A-Za-z0-9+/=.-]{20,}/i,

      // Payment service keys (specific patterns)
      /sk_live_[0-9a-zA-Z_-]{20,}/i,  // Stripe live secret key
      /pk_live_[0-9a-zA-Z_-]{20,}/i,  // Stripe live publishable key
      /sk_test_[0-9a-zA-Z_-]{20,}/i,  // Stripe test secret key

      // JWT tokens (specific format)
      /eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=_-]{20,}/i,

      // API keys (specific patterns)
      /AIza[0-9A-Za-z-_]{35}/i,  // Google API key
      /sk-[0-9a-zA-Z]{48}/i,     // OpenAI API key
      /xoxb-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}/i,  // Slack bot token

      // OAuth tokens (specific patterns)
      /gho_[0-9a-zA-Z]{36}/i,    // GitHub OAuth token
      /ghp_[0-9a-zA-Z]{36}/i,    // GitHub personal access token
      /glpat-[0-9a-zA-Z_-]{20,}/i,  // GitLab personal access token

      // Environment variables with sensitive values
      /process\.env\.(?:API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|PRIVATE_KEY)\s*=\s*['"][^'"]{20,}['"]/i,
      /window\.(?:API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN)\s*=\s*['"][^'"]{20,}['"]/i,

      // Template injection with actual values
      /\$\{\s*(?:process\.env|window)\.(?:API_KEY|SECRET_KEY|TOKEN)[^}]*\}/i,
      /<%=\s*(?:process\.env|window)\.(?:API_KEY|SECRET_KEY|TOKEN)[^%]*%>/i,

      // URL parameters with sensitive data
      /[?&](?:api_key|apikey|token|secret|password)=[A-Za-z0-9+/=]{20,}/i,
      /#[^#]*(?:token|key|secret|password)=[A-Za-z0-9+/=]{20,}/i,

      // Base64 encoded sensitive data (long strings)
      /['"][A-Za-z0-9+/=]{50,}['"]/i,

      // Cryptographic keys (specific patterns)
      /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/i,
      /-----BEGIN\s+(?:RSA\s+)?PUBLIC\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PUBLIC\s+KEY-----/i,
      /-----BEGIN\s+CERTIFICATE-----[\s\S]*?-----END\s+CERTIFICATE-----/i,

      // Email service credentials
      /(?:smtp|imap|pop3)\.(?:gmail|outlook|yahoo)\.com.*password.*['"][^'"]{8,}['"]/i,
      /sendgrid.*apikey.*['"][A-Za-z0-9+/=]{20,}['"]/i,
      /mailgun.*apikey.*['"][A-Za-z0-9+/=]{20,}['"]/i,

      // File system access with sensitive paths
      /fs\.readFile.*(?:secret|key|token|password|credential).*['"][^'"]*secret[^'"]*['"]/i,
      /fs\.writeFile.*(?:secret|key|token|password|credential).*['"][^'"]*secret[^'"]*['"]/i,

      // Error messages that might leak sensitive data
      /throw\s+new\s+Error\(.*(?:token|key|secret|password|api_key).*['"][A-Za-z0-9+/=]{20,}['"]/i,

      // WebSocket connections with auth
      /new\s+WebSocket\(.*(?:token|key|secret|password|api_key).*['"][A-Za-z0-9+/=]{20,}['"]/i,

      // Service worker with sensitive data
      /caches\.open\(.*(?:token|key|secret|password|api_key)/i
    ];

    // Exclusion patterns to avoid false positives
    const exclusionPatterns = [
      // Exclude our own tool's patterns
      /ErrorDebugExtractor/i,
      /extractErrorAndDebugInfo/i,
      /helpers\.addFinding/i,
      /VULN_SOURCE_LEAK/i,
      /Pattern detected/i,

      // Exclude common legitimate patterns
      /google.*analytics/i,
      /google.*fonts/i,
      /google.*apis/i,
      /facebook.*sdk/i,
      /twitter.*widgets/i,
      /linkedin.*share/i,

      // Exclude development tools
      /webpack/i,
      /babel/i,
      /eslint/i,
      /prettier/i,
      /typescript/i,

      // Exclude common libraries
      /jquery/i,
      /lodash/i,
      /underscore/i,
      /moment/i,
      /axios/i,

      // Exclude test patterns
      /test.*token/i,
      /example.*key/i,
      /sample.*secret/i,
      /demo.*password/i,

      // Exclude documentation patterns
      /TODO/i,
      /FIXME/i,
      /NOTE/i,
      /HACK/i,
      /XXX/i,

      // Exclude regex patterns themselves
      /\\[.*\\]/i,
      /\\(.*\\)/i,
      /\\w+/i,
      /\\d+/i,
      /\\s+/i
    ];

    sensitivePatterns.forEach(pattern => {
      if (pattern.test(text)) {
        // Check against exclusion patterns to avoid false positives
        const isExcluded = exclusionPatterns.some(exclusion => exclusion.test(text));
        if (!isExcluded) {
          // Additional validation: ensure the match contains actual sensitive data, not just keywords
          const match = text.match(pattern);
          if (match && match[0]) {
            const matchedText = match[0];
            // Check if it contains actual sensitive-looking values (not just keywords)
            const hasActualValue = helpers.isValidToken(matchedText) ||
                                 matchedText.includes('sk_live_') ||
                                 matchedText.includes('sk-') ||
                                 matchedText.includes('AKIA') ||
                                 matchedText.includes('eyJ') ||
                                 matchedText.includes('AIza') ||
                                 matchedText.includes('-----BEGIN');

            if (hasActualValue) {
              helpers.addFinding('vulnerabilityPatterns', `[VULN_SOURCE_LEAK] Pattern detected in ${source}: ${matchedText.substring(0, config.maxStringLength)}${matchedText.length > config.maxStringLength ? '...' : ''}`);
            }
          }
        }
      }
    });
  }

  // --- 6. ENHANCED NETWORK MONITORING ---
  if (config.enableNetworkMonitoring) {
    console.log("🌐 Setting up enhanced network monitoring...");
    const originalFetch = window.fetch;
    const originalXMLHttpRequest = window.XMLHttpRequest;

  // Enhanced fetch monitoring
  window.fetch = function (...args) {
    const url = args[0];
    const method = (args[1] && args[1].method) || 'GET';

    const fetchPromise = originalFetch.apply(this, args);
    return fetchPromise
      .catch((error) => {
        helpers.addFinding('globalErrors', `[FETCH_NETWORK_ERROR] ${method} ${url} - ${error.message}`);
        throw error;
      })
      .then((response) => {
        // Check for various HTTP status codes that might indicate vulnerabilities
        if (response.status >= 400) {
          let severity = 'INFO';
          if (response.status >= 500) severity = 'HIGH';
          else if (response.status === 403 || response.status === 401) severity = 'MEDIUM';

          helpers.addFinding('globalErrors', `[FETCH_HTTP_${severity}] ${method} ${url} - ${response.status} ${response.statusText}`);
        }

        // Check for sensitive data in response headers
        const sensitiveHeaders = ['authorization', 'x-api-key', 'x-auth-token', 'set-cookie'];
        sensitiveHeaders.forEach(header => {
          if (response.headers.get(header)) {
            helpers.addFinding('vulnerabilityPatterns', `[VULN_SENSITIVE_HEADER] ${method} ${url} - Header: ${header}`);
          }
        });

        return response;
      });
  };

  // XMLHttpRequest monitoring
  window.XMLHttpRequest = function() {
    const xhr = new originalXMLHttpRequest();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;

    xhr.open = function(method, url, ...args) {
      this._method = method;
      this._url = url;
      return originalOpen.apply(this, [method, url, ...args]);
    };

    xhr.send = function(body) {
      this.addEventListener('load', function() {
        if (this.status >= 400) {
          let severity = 'INFO';
          if (this.status >= 500) severity = 'HIGH';
          else if (this.status === 403 || this.status === 401) severity = 'MEDIUM';

          helpers.addFinding('globalErrors', `[XHR_HTTP_${severity}] ${this._method} ${this._url} - ${this.status} ${this.statusText}`);
        }
      });

      this.addEventListener('error', function() {
        helpers.addFinding('globalErrors', `[XHR_NETWORK_ERROR] ${this._method} ${this._url} - Network Error`);
      });

      return originalSend.apply(this, arguments);
    };

    return xhr;
  };

  // Monitor WebSocket connections
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, ...args) {
    helpers.addFinding('verboseOutputs', `[WEBSOCKET_CONNECTION] ${url}`);
    return new originalWebSocket(url, ...args);
  };
  }

  // --- ALERTING SYSTEM ---
  const alertingSystem = {
    alerts: [],
    thresholds: {
      maxFindings: 100,
      highPriorityThreshold: 10,
      performanceThreshold: 1000, // ms
      errorRateThreshold: 20 // percentage
    },

    // Check for alert conditions
    checkAlerts: function() {
      // Get summary without triggering recursive calls
      const summary = window.ErrorDebugExtractor._originalViewFindings();
      const perfReport = performanceMonitor.getReport();

      // Check total findings threshold
      if (summary.totalFindings > this.thresholds.maxFindings) {
        this.createAlert('WARNING', `High number of findings detected: ${summary.totalFindings}`, 'findings');
      }

      // Check high priority findings
      if (summary.highPriority > this.thresholds.highPriorityThreshold) {
        this.createAlert('CRITICAL', `High priority vulnerabilities: ${summary.highPriority}`, 'security');
      }

      // Check performance
      if (perfReport.averageScanTime > this.thresholds.performanceThreshold) {
        this.createAlert('WARNING', `Slow scan performance: ${perfReport.averageScanTime}ms average`, 'performance');
      }

      // Check error rate
      if (perfReport.errorRate > this.thresholds.errorRateThreshold) {
        this.createAlert('ERROR', `High error rate: ${perfReport.errorRate}%`, 'errors');
      }
    },

    // Create an alert
    createAlert: function(severity, message, category) {
      const alert = {
        id: Date.now(),
        timestamp: new Date(),
        severity,
        message,
        category,
        acknowledged: false
      };

      this.alerts.push(alert);

      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts.shift();
      }

      // Log alert
      const logMethod = severity === 'CRITICAL' ? console.error :
                       severity === 'ERROR' ? console.error :
                       severity === 'WARNING' ? console.warn : console.info;

      logMethod(`🚨 ALERT [${severity}]: ${message}`);

      // Trigger visual notification if dashboard is visible
      if (dashboard.isVisible) {
        this.showVisualAlert(alert);
      }

      return alert;
    },

    // Show visual alert in dashboard
    showVisualAlert: function(alert) {
      if (!dashboard.container) return;

      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${alert.severity.toLowerCase()}`;
      alertDiv.innerHTML = `
        <div class="alert-icon">${alert.severity === 'CRITICAL' ? '🚨' : alert.severity === 'ERROR' ? '❌' : '⚠️'}</div>
        <div class="alert-content">
          <div class="alert-message">${alert.message}</div>
          <div class="alert-time">${alert.timestamp.toLocaleTimeString()}</div>
        </div>
        <button class="alert-dismiss">✕</button>
      `;

      // Add alert styles
      const style = document.createElement('style');
      style.textContent = `
        .alert {
          display: flex;
          align-items: center;
          padding: 10px;
          margin: 5px 0;
          border-radius: 4px;
          animation: slideIn 0.3s ease-out;
        }
        .alert-critical { background: #ff4757; color: white; }
        .alert-error { background: #ff3838; color: white; }
        .alert-warning { background: #ffa726; color: white; }
        .alert-info { background: #4CAF50; color: white; }
        .alert-icon { font-size: 18px; margin-right: 10px; }
        .alert-content { flex: 1; }
        .alert-message { font-weight: bold; }
        .alert-time { font-size: 12px; opacity: 0.8; }
        .alert-dismiss { background: none; border: none; color: white; cursor: pointer; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;

      document.head.appendChild(style);

      // Add to dashboard
      const alertsContainer = dashboard.container.querySelector('.dashboard-content') ||
                            dashboard.container;
      alertsContainer.insertBefore(alertDiv, alertsContainer.firstChild);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 10000);

      // Dismiss on click
      alertDiv.querySelector('.alert-dismiss').addEventListener('click', () => {
        alertDiv.remove();
      });
    },

    // Get active alerts
    getActiveAlerts: function() {
      return this.alerts.filter(alert => !alert.acknowledged);
    },

    // Acknowledge alert
    acknowledgeAlert: function(alertId) {
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
      }
    },

    // Configure thresholds
    setThreshold: function(key, value) {
      if (this.thresholds.hasOwnProperty(key)) {
        this.thresholds[key] = value;
        console.log(`✅ Alert threshold updated: ${key} = ${value}`);
      }
    }
  };

  // --- COLLABORATIVE FEATURES ---
  const collaboration = {
    teamMembers: new Set(),
    sharedFindings: new Map(),
    sessionId: null,

    // Initialize collaboration session
    initSession: function(sessionName = 'qwen-session') {
      this.sessionId = sessionName + '-' + Date.now();
      console.log(`🤝 Collaboration session started: ${this.sessionId}`);

      // Store session data in localStorage for persistence
      localStorage.setItem('qwen-collaboration-session', this.sessionId);
      localStorage.setItem('qwen-team-members', JSON.stringify(Array.from(this.teamMembers)));

      return this.sessionId;
    },

    // Add team member
    addTeamMember: function(memberId, memberInfo = {}) {
      this.teamMembers.add(memberId);
      localStorage.setItem('qwen-team-members', JSON.stringify(Array.from(this.teamMembers)));

      console.log(`👤 Team member added: ${memberId}`);
      this.broadcastUpdate('member-joined', { memberId, memberInfo });
    },

    // Remove team member
    removeTeamMember: function(memberId) {
      this.teamMembers.delete(memberId);
      localStorage.setItem('qwen-team-members', JSON.stringify(Array.from(this.teamMembers)));

      console.log(`👤 Team member removed: ${memberId}`);
      this.broadcastUpdate('member-left', { memberId });
    },

    // Share finding with team
    shareFinding: function(findingId, finding, priority = 'medium') {
      const sharedFinding = {
        id: findingId,
        finding,
        priority,
        sharedBy: 'current-user',
        timestamp: Date.now(),
        comments: [],
        status: 'open'
      };

      this.sharedFindings.set(findingId, sharedFinding);
      this.saveSharedFindings();

      console.log(`📤 Finding shared: ${finding.substring(0, 50)}...`);
      this.broadcastUpdate('finding-shared', sharedFinding);

      return sharedFinding;
    },

    // Add comment to shared finding
    addComment: function(findingId, comment, author = 'Anonymous') {
      const finding = this.sharedFindings.get(findingId);
      if (finding) {
        finding.comments.push({
          id: Date.now(),
          author,
          comment,
          timestamp: Date.now()
        });

        this.saveSharedFindings();
        this.broadcastUpdate('comment-added', {
          findingId,
          comment: finding.comments[finding.comments.length - 1]
        });

        console.log(`💬 Comment added to finding ${findingId}`);
      }
    },

    // Update finding status
    updateFindingStatus: function(findingId, status) {
      const finding = this.sharedFindings.get(findingId);
      if (finding) {
        finding.status = status;
        finding.lastUpdated = Date.now();

        this.saveSharedFindings();
        this.broadcastUpdate('status-updated', { findingId, status });

        console.log(`📝 Finding ${findingId} status updated to: ${status}`);
      }
    },

    // Broadcast updates to team members (using localStorage for demo)
    broadcastUpdate: function(type, data) {
      const message = {
        type,
        data,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        from: 'current-user'
      };

      // In a real implementation, this would use WebSockets or similar
      // For demo purposes, we'll use localStorage events
      localStorage.setItem('qwen-collaboration-message', JSON.stringify(message));

      // Trigger storage event for same-window updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'qwen-collaboration-message',
        newValue: JSON.stringify(message)
      }));
    },

    // Listen for collaboration updates
    listenForUpdates: function() {
      window.addEventListener('storage', (e) => {
        if (e.key === 'qwen-collaboration-message') {
          try {
            const message = JSON.parse(e.newValue);
            if (message.sessionId === this.sessionId) {
              this.handleIncomingMessage(message);
            }
          } catch (err) {
            console.warn('Failed to parse collaboration message:', err);
          }
        }
      });
    },

    // Handle incoming collaboration messages
    handleIncomingMessage: function(message) {
      switch (message.type) {
        case 'member-joined':
          console.log(`👋 ${message.data.memberId} joined the session`);
          break;
        case 'member-left':
          console.log(`👋 ${message.data.memberId} left the session`);
          break;
        case 'finding-shared':
          console.log(`📨 New shared finding: ${message.data.finding.substring(0, 50)}...`);
          break;
        case 'comment-added':
          console.log(`💬 New comment on finding ${message.data.findingId}`);
          break;
        case 'status-updated':
          console.log(`📝 Finding ${message.data.findingId} status: ${message.data.status}`);
          break;
      }
    },

    // Save shared findings to localStorage
    saveSharedFindings: function() {
      const findingsData = {};
      this.sharedFindings.forEach((finding, id) => {
        findingsData[id] = finding;
      });
      localStorage.setItem('qwen-shared-findings', JSON.stringify(findingsData));
    },

    // Load shared findings from localStorage
    loadSharedFindings: function() {
      try {
        const data = localStorage.getItem('qwen-shared-findings');
        if (data) {
          const findingsData = JSON.parse(data);
          Object.entries(findingsData).forEach(([id, finding]) => {
            this.sharedFindings.set(id, finding);
          });
          console.log(`📥 Loaded ${this.sharedFindings.size} shared findings`);
        }
      } catch (e) {
        console.warn('Failed to load shared findings:', e);
      }
    },

    // Get collaboration summary
    getSummary: function() {
      return {
        sessionId: this.sessionId,
        teamMembers: Array.from(this.teamMembers),
        sharedFindingsCount: this.sharedFindings.size,
        activeFindings: Array.from(this.sharedFindings.values()).filter(f => f.status === 'open').length
      };
    }
  };

  // --- 7. UTILITY FOR REPORTING ---
  window.ErrorDebugExtractor = {
    // Periodic scanning
    scanInterval: null,
    startPeriodicScan: function(intervalMs = config.scanInterval) {
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
      }
      this.scanInterval = setInterval(() => {
        console.log("🔄 Performing periodic scan...");
        this.viewFindings();
      }, intervalMs);
      console.log(`⏰ Periodic scanning started (every ${intervalMs}ms)`);
    },
    stopPeriodicScan: function() {
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
        console.log("⏹️ Periodic scanning stopped");
      }
    },
    // Export findings to JSON
    exportFindings: function(format = 'json') {
      const summary = this.viewFindings();

      if (format === 'csv') {
        this.exportToCSV(summary);
      } else if (format === 'xml') {
        this.exportToXML(summary);
      } else {
        // Default JSON export
        const dataStr = JSON.stringify(summary, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `error-debug-findings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("📥 Findings exported to JSON file");
      }
    },

    // Export findings to CSV
    exportToCSV: function(summary) {
      let csv = 'Category,Finding\n';
      Object.keys(findings).forEach(category => {
        findings[category].forEach(finding => {
          csv += `"${category}","${finding.replace(/"/g, '""')}"\n`;
        });
      });

      const dataBlob = new Blob([csv], {type: 'text/csv'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `error-debug-findings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("📥 Findings exported to CSV file");
    },

    // Export findings to XML
    exportToXML: function(summary) {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<findings>\n';
      Object.keys(findings).forEach(category => {
        xml += `  <category name="${category}">\n`;
        findings[category].forEach(finding => {
          xml += `    <finding><![CDATA[${finding}]]></finding>\n`;
        });
        xml += '  </category>\n';
      });
      xml += '</findings>';

      const dataBlob = new Blob([xml], {type: 'application/xml'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `error-debug-findings-${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("📥 Findings exported to XML file");
    },

    // Show only high-priority findings for bug bounty
    showHighPriority: function() {
      console.group("🚨 BUG BOUNTY HIGH PRIORITY FINDINGS");

      const highPriorityPatterns = [
        'VULN_P1_', 'VULN_EVAL_USAGE', 'VULN_MISSING_CSP', 'VULN_CLICKJACKING',
        'VULN_SSRF', 'VULN_XXE', 'VULN_IDOR', 'VULN_DEBUG_ENDPOINT',
        'VULN_INSECURE_COOKIE', 'VULN_LFI', 'VULN_SOURCE_LEAK'
      ];

      const criticalFindings = [
        ...findings.vulnerabilityPatterns,
        ...findings.consoleErrors
      ].filter(finding =>
        highPriorityPatterns.some(pattern => finding.includes(pattern))
      );

      const sensitiveStorage = [...findings.storageLeaks].filter(finding =>
        finding.includes('LEAK') && (
          finding.includes('token') ||
          finding.includes('key') ||
          finding.includes('secret') ||
          finding.includes('password')
        )
      );

      const sensitiveDOM = [...findings.domLeaks].filter(finding =>
        finding.includes('token') ||
        finding.includes('key') ||
        finding.includes('secret') ||
        finding.includes('password') ||
        finding.includes('api_key')
      );

      console.log(`🚨 Critical Vulnerabilities: ${criticalFindings.length}`);
      console.log(`🔐 Sensitive Storage Leaks: ${sensitiveStorage.length}`);
      console.log(`🌐 Sensitive DOM Exposure: ${sensitiveDOM.length}`);

      if (criticalFindings.length > 0) {
        console.group("🚨 CRITICAL VULNERABILITIES:");
        criticalFindings.forEach((f, i) => console.error(`${i + 1}. ${f}`));
        console.groupEnd();
      }

      if (sensitiveStorage.length > 0) {
        console.group("🔐 SENSITIVE STORAGE LEAKS:");
        sensitiveStorage.forEach((f, i) => console.warn(`${i + 1}. ${f}`));
        console.groupEnd();
      }

      if (sensitiveDOM.length > 0) {
        console.group("🌐 SENSITIVE DOM EXPOSURE:");
        sensitiveDOM.forEach((f, i) => console.warn(`${i + 1}. ${f}`));
        console.groupEnd();
      }

      console.groupEnd();

      return {
        criticalVulnerabilities: criticalFindings.length,
        sensitiveStorage: sensitiveStorage.length,
        sensitiveDOM: sensitiveDOM.length,
        totalHighPriority: criticalFindings.length + sensitiveStorage.length + sensitiveDOM.length
      };
    },
    // View current findings with enhanced display
    viewFindings: function (showAll = false) {
      console.group("🐛 Enhanced Error & Debug Info Extractor - Findings Summary");
      console.log(`🔢 Total Findings: ${Object.values(findings).reduce((sum, set) => sum + set.size, 0)}`);

      // Summary counts
      const counts = {};
      Object.keys(findings).forEach(key => {
        counts[key] = findings[key].size;
      });
      console.table(counts);

      if (findings.globalErrors.size > 0) {
        console.group(`💥 Global Errors Caught (${findings.globalErrors.size}):`);
        [...findings.globalErrors].forEach((f, i) => {
          if (showAll || i < 10) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.globalErrors.size > 10 && !showAll) {
          console.log(`... and ${findings.globalErrors.size - 10} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No global errors caught during monitoring.");
      }

      if (findings.promiseRejections.size > 0) {
        console.group(`💥 Unhandled Promise Rejections (${findings.promiseRejections.size}):`);
        [...findings.promiseRejections].forEach((f, i) => {
          if (showAll || i < 5) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.promiseRejections.size > 5 && !showAll) {
          console.log(`... and ${findings.promiseRejections.size - 5} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No unhandled promise rejections caught.");
      }

      if (findings.consoleErrors.size > 0) {
        console.group(`💥 Console Errors & Vulnerabilities (${findings.consoleErrors.size}):`);
        [...findings.consoleErrors].forEach((f, i) => {
          if (showAll || i < 15) {
            if (f.includes('VULN_')) {
              console.error(`${i + 1}. [CONSOLE_ERROR] ${f}`);
            } else {
              console.warn(`${i + 1}. [CONSOLE_ERROR] ${f}`);
            }
          }
        });
        if (findings.consoleErrors.size > 15 && !showAll) {
          console.log(`... and ${findings.consoleErrors.size - 15} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No error/warning messages found in console output.");
      }

      // Show vulnerability patterns separately for better organization

      if (findings.storageLeaks.size > 0) {
        console.group(`🔐 Sensitive Data in Browser Storage (${findings.storageLeaks.size}):`);
        [...findings.storageLeaks].forEach((f, i) => {
          if (showAll || i < 10) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.storageLeaks.size > 10 && !showAll) {
          console.log(`... and ${findings.storageLeaks.size - 10} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No sensitive data found in browser storage.");
      }

      if (findings.domLeaks.size > 0) {
        console.group(`🌐 Sensitive Data Exposed in DOM (${findings.domLeaks.size}):`);
        [...findings.domLeaks].forEach((f, i) => {
          if (showAll || i < 10) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.domLeaks.size > 10 && !showAll) {
          console.log(`... and ${findings.domLeaks.size - 10} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No sensitive data found exposed in DOM.");
      }

      if (findings.vulnerabilityPatterns.size > 0) {
        console.group(`🚨 Additional Critical Vulnerabilities & Security Issues (${findings.vulnerabilityPatterns.size}):`);
        [...findings.vulnerabilityPatterns].forEach((f, i) => {
          if (showAll || i < 20) console.error(`${i + 1}. ${f}`);
        });
        if (findings.vulnerabilityPatterns.size > 20 && !showAll) {
          console.log(`... and ${findings.vulnerabilityPatterns.size - 20} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      }

      if (findings.debugComments.size > 0) {
        console.group(`📌 Debug/TODO Comments (${findings.debugComments.size}):`);
        [...findings.debugComments].forEach((f, i) => {
          if (showAll || i < 5) console.info(`${i + 1}. ${f}`);
        });
        if (findings.debugComments.size > 5 && !showAll) {
          console.log(`... and ${findings.debugComments.size - 5} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No debug/todo comments found in code.");
      }

      if (findings.debugVariables.size > 0) {
        console.group(`⚙️ Potentially Revealing Global Variables (${findings.debugVariables.size}):`);
        [...findings.debugVariables].forEach((f, i) => {
          if (showAll || i < 5) console.info(`${i + 1}. ${f}`);
        });
        if (findings.debugVariables.size > 5 && !showAll) {
          console.log(`... and ${findings.debugVariables.size - 5} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No obviously revealing global debug variables found by name.");
      }

      if (findings.verboseOutputs.size > 0) {
        console.group(`🔍 Verbose Debug Outputs (${findings.verboseOutputs.size}):`);
        [...findings.verboseOutputs].forEach((f, i) => {
          if (showAll || i < 3) console.info(`${i + 1}. ${f}`);
        });
        if (findings.verboseOutputs.size > 3 && !showAll) {
          console.log(`... and ${findings.verboseOutputs.size - 3} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No obviously revealing verbose outputs found.");
      }

      if (findings.sourcemaps.size > 0) {
        console.group(`🗺️ Sourcemap References (${findings.sourcemaps.size}):`);
        [...findings.sourcemaps].forEach((f, i) => {
          if (showAll || i < 3) console.info(`${i + 1}. ${f}`);
        });
        if (findings.sourcemaps.size > 3 && !showAll) {
          console.log(`... and ${findings.sourcemaps.size - 3} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();

        console.warn("⚠️ Sourcemaps can reveal original source code, variable names, and internal structure. This is a significant information leak if accessible.");
      } else {
        console.log("✅ No sourcemap references found in scanned code.");
      }

      console.groupEnd(); // End main findings group

      // Priority summary for bug bounty hunters
      console.group("🎯 BUG BOUNTY PRIORITY SUMMARY");
      const highPriority = [
        ...findings.vulnerabilityPatterns
      ].filter(f => f.includes('P1') || f.includes('HIGH') || f.includes('CRITICAL'));

      const mediumPriority = [
        ...findings.vulnerabilityPatterns
      ].filter(f => f.includes('MEDIUM') || f.includes('INSECURE'));

      const infoFindings = [
        ...findings.storageLeaks,
        ...findings.domLeaks
      ];

      console.log(`🚨 HIGH PRIORITY: ${highPriority.length} critical vulnerabilities`);
      console.log(`⚠️ MEDIUM PRIORITY: ${mediumPriority.length} security issues`);
      console.log(`ℹ️ INFO FINDINGS: ${infoFindings.length} data exposure issues`);

      if (highPriority.length > 0) {
        console.group("🚨 TOP CRITICAL ISSUES:");
        highPriority.slice(0, 5).forEach((f, i) => console.error(`${i + 1}. ${f}`));
        console.groupEnd();
      }

      console.groupEnd();

      const summary = {
        totalFindings: Object.values(findings).reduce((sum, set) => sum + set.size, 0),
        counts: counts,
        highPriority: highPriority.length,
        mediumPriority: mediumPriority.length,
        infoFindings: infoFindings.length,
        globalErrors: [...findings.globalErrors],
        promiseRejections: [...findings.promiseRejections],
        consoleErrors: [...findings.consoleErrors],
        verboseOutputs: [...findings.verboseOutputs],
        debugComments: [...findings.debugComments],
        debugVariables: [...findings.debugVariables],
        sourcemaps: [...findings.sourcemaps],
        storageLeaks: [...findings.storageLeaks],
        domLeaks: [...findings.domLeaks],
        vulnerabilityPatterns: [...findings.vulnerabilityPatterns],
      };

      console.log("📊 Use viewFindings(true) to see all findings without truncation");
      console.log("📄 Full findings object:", summary);
      return summary;
    },
    // Stop monitoring and clean up
    stop: function () {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      console.log = originalConsoleLog;
      console.debug = originalConsoleDebug;
      window.fetch = originalFetch;
      window.XMLHttpRequest = originalXMLHttpRequest;
      window.WebSocket = originalWebSocket;
      this.stopPeriodicScan();
      dashboard.stopUpdates();
      console.log("🔄 Enhanced Error & Debug Info Extractor stopped.");
    },

    // === NEW ENHANCED FEATURES ===

    // Custom Rules Management
    addCustomRule: function(name, pattern, category, severity = 'medium', description = '') {
      return customRules.addRule(name, { pattern, category, severity, description });
    },

    removeCustomRule: function(name) {
      return customRules.removeRule(name);
    },

    toggleCustomRule: function(name, enabled) {
      return customRules.toggleRule(name, enabled);
    },

    getCustomRules: function() {
      return customRules.getRuleStats();
    },

    exportCustomRules: function() {
      return customRules.exportRules();
    },

    importCustomRules: function(rulesObj) {
      return customRules.importRules(rulesObj);
    },

    // Performance Monitoring
    getPerformanceReport: function() {
      return performanceMonitor.getReport();
    },

    resetPerformanceMetrics: function() {
      performanceMonitor.reset();
    },

    // Historical Analysis
    getHistoricalTrends: function() {
      return historicalAnalysis.getTrends();
    },

    getHistoricalData: function(hours = 24) {
      return historicalAnalysis.getHistoricalData(hours);
    },

    predictTrends: function(hours = 1) {
      return historicalAnalysis.predictTrends(hours);
    },

    // Real-time Dashboard
    showDashboard: function() {
      dashboard.show();
    },

    hideDashboard: function() {
      dashboard.hide();
    },

    // Remediation Engine
    getRemediationSuggestions: function(finding) {
      return remediationEngine.getSuggestions(finding);
    },

    addRemediationSuggestion: function(category, suggestion) {
      remediationEngine.addSuggestion(category, suggestion);
    },

    // Alerting System
    getActiveAlerts: function() {
      return alertingSystem.getActiveAlerts();
    },

    acknowledgeAlert: function(alertId) {
      alertingSystem.acknowledgeAlert(alertId);
    },

    setAlertThreshold: function(key, value) {
      alertingSystem.setThreshold(key, value);
    },

    // Collaboration Features
    initCollaborationSession: function(sessionName) {
      return collaboration.initSession(sessionName);
    },

    addTeamMember: function(memberId, memberInfo) {
      collaboration.addTeamMember(memberId, memberInfo);
    },

    shareFinding: function(findingId, finding, priority) {
      return collaboration.shareFinding(findingId, finding, priority);
    },

    addFindingComment: function(findingId, comment, author) {
      collaboration.addComment(findingId, comment, author);
    },

    updateFindingStatus: function(findingId, status) {
      collaboration.updateFindingStatus(findingId, status);
    },

    getCollaborationSummary: function() {
      return collaboration.getSummary();
    },

    // Enhanced viewFindings with historical recording
    viewFindings: function (showAll = false) {
      // Record snapshot for historical analysis (only if not already recording)
      if (!this._isRecording) {
        this._isRecording = true;
        historicalAnalysis.recordSnapshot();
        this._isRecording = false;
      }

      // Check for alerts (only if not already checking)
      if (!this._isCheckingAlerts) {
        this._isCheckingAlerts = true;
        alertingSystem.checkAlerts();
        this._isCheckingAlerts = false;
      }

      // Execute custom rules on current findings
      Object.keys(findings).forEach(category => {
        Array.from(findings[category]).forEach(finding => {
          customRules.executeRules(finding, `system-${category}`);
        });
      });

      // Record performance metrics
      performanceMonitor.recordScan(
        0, // scan time (would need to be measured)
        Object.values(findings).reduce((sum, set) => sum + set.size, 0),
        0 // errors
      );

      // Call original viewFindings logic
      return this._originalViewFindings(showAll);
    },

    // Store original viewFindings for internal use
    _originalViewFindings: function (showAll = false) {
      console.group("🐛 Enhanced Error & Debug Info Extractor - Findings Summary");
      console.log(`🔢 Total Findings: ${Object.values(findings).reduce((sum, set) => sum + set.size, 0)}`);

      // Summary counts
      const counts = {};
      Object.keys(findings).forEach(key => {
        counts[key] = findings[key].size;
      });
      console.table(counts);

      if (findings.globalErrors.size > 0) {
        console.group(`💥 Global Errors Caught (${findings.globalErrors.size}):`);
        [...findings.globalErrors].forEach((f, i) => {
          if (showAll || i < 10) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.globalErrors.size > 10 && !showAll) {
          console.log(`... and ${findings.globalErrors.size - 10} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No global errors caught during monitoring.");
      }

      if (findings.promiseRejections.size > 0) {
        console.group(`💥 Unhandled Promise Rejections (${findings.promiseRejections.size}):`);
        [...findings.promiseRejections].forEach((f, i) => {
          if (showAll || i < 5) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.promiseRejections.size > 5 && !showAll) {
          console.log(`... and ${findings.promiseRejections.size - 5} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No unhandled promise rejections caught.");
      }

      if (findings.consoleErrors.size > 0) {
        console.group(`💥 Console Errors & Vulnerabilities (${findings.consoleErrors.size}):`);
        [...findings.consoleErrors].forEach((f, i) => {
          if (showAll || i < 15) {
            if (f.includes('VULN_')) {
              console.error(`${i + 1}. [CONSOLE_ERROR] ${f}`);
            } else {
              console.warn(`${i + 1}. [CONSOLE_ERROR] ${f}`);
            }
          }
        });
        if (findings.consoleErrors.size > 15 && !showAll) {
          console.log(`... and ${findings.consoleErrors.size - 15} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No error/warning messages found in console output.");
      }

      if (findings.storageLeaks.size > 0) {
        console.group(`🔐 Sensitive Data in Browser Storage (${findings.storageLeaks.size}):`);
        [...findings.storageLeaks].forEach((f, i) => {
          if (showAll || i < 10) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.storageLeaks.size > 10 && !showAll) {
          console.log(`... and ${findings.storageLeaks.size - 10} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No sensitive data found in browser storage.");
      }

      if (findings.domLeaks.size > 0) {
        console.group(`🌐 Sensitive Data Exposed in DOM (${findings.domLeaks.size}):`);
        [...findings.domLeaks].forEach((f, i) => {
          if (showAll || i < 10) console.warn(`${i + 1}. ${f}`);
        });
        if (findings.domLeaks.size > 10 && !showAll) {
          console.log(`... and ${findings.domLeaks.size - 10} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No sensitive data found exposed in DOM.");
      }

      if (findings.vulnerabilityPatterns.size > 0) {
        console.group(`🚨 Additional Critical Vulnerabilities & Security Issues (${findings.vulnerabilityPatterns.size}):`);
        [...findings.vulnerabilityPatterns].forEach((f, i) => {
          if (showAll || i < 20) console.error(`${i + 1}. ${f}`);
        });
        if (findings.vulnerabilityPatterns.size > 20 && !showAll) {
          console.log(`... and ${findings.vulnerabilityPatterns.size - 20} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      }

      if (findings.debugComments.size > 0) {
        console.group(`📌 Debug/TODO Comments (${findings.debugComments.size}):`);
        [...findings.debugComments].forEach((f, i) => {
          if (showAll || i < 5) console.info(`${i + 1}. ${f}`);
        });
        if (findings.debugComments.size > 5 && !showAll) {
          console.log(`... and ${findings.debugComments.size - 5} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No debug/todo comments found in code.");
      }

      if (findings.debugVariables.size > 0) {
        console.group(`⚙️ Potentially Revealing Global Variables (${findings.debugVariables.size}):`);
        [...findings.debugVariables].forEach((f, i) => {
          if (showAll || i < 5) console.info(`${i + 1}. ${f}`);
        });
        if (findings.debugVariables.size > 5 && !showAll) {
          console.log(`... and ${findings.debugVariables.size - 5} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No obviously revealing global debug variables found by name.");
      }

      if (findings.verboseOutputs.size > 0) {
        console.group(`🔍 Verbose Debug Outputs (${findings.verboseOutputs.size}):`);
        [...findings.verboseOutputs].forEach((f, i) => {
          if (showAll || i < 3) console.info(`${i + 1}. ${f}`);
        });
        if (findings.verboseOutputs.size > 3 && !showAll) {
          console.log(`... and ${findings.verboseOutputs.size - 3} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();
      } else {
        console.log("✅ No obviously revealing verbose outputs found.");
      }

      if (findings.sourcemaps.size > 0) {
        console.group(`🗺️ Sourcemap References (${findings.sourcemaps.size}):`);
        [...findings.sourcemaps].forEach((f, i) => {
          if (showAll || i < 3) console.info(`${i + 1}. ${f}`);
        });
        if (findings.sourcemaps.size > 3 && !showAll) {
          console.log(`... and ${findings.sourcemaps.size - 3} more. Use viewFindings(true) to see all.`);
        }
        console.groupEnd();

        console.warn("⚠️ Sourcemaps can reveal original source code, variable names, and internal structure. This is a significant information leak if accessible.");
      } else {
        console.log("✅ No sourcemap references found in scanned code.");
      }

      console.groupEnd(); // End main findings group

      // Priority summary for bug bounty hunters
      console.group("🎯 BUG BOUNTY PRIORITY SUMMARY");
      const highPriority = [
        ...findings.vulnerabilityPatterns
      ].filter(f => f.includes('P1') || f.includes('HIGH') || f.includes('CRITICAL'));

      const mediumPriority = [
        ...findings.vulnerabilityPatterns
      ].filter(f => f.includes('MEDIUM') || f.includes('INSECURE'));

      const infoFindings = [
        ...findings.storageLeaks,
        ...findings.domLeaks
      ];

      console.log(`🚨 HIGH PRIORITY: ${highPriority.length} critical vulnerabilities`);
      console.log(`⚠️ MEDIUM PRIORITY: ${mediumPriority.length} security issues`);
      console.log(`ℹ️ INFO FINDINGS: ${infoFindings.length} data exposure issues`);

      if (highPriority.length > 0) {
        console.group("🚨 TOP CRITICAL ISSUES:");
        highPriority.slice(0, 5).forEach((f, i) => console.error(`${i + 1}. ${f}`));
        console.groupEnd();
      }

      console.groupEnd();

      const summary = {
        totalFindings: Object.values(findings).reduce((sum, set) => sum + set.size, 0),
        counts: counts,
        highPriority: highPriority.length,
        mediumPriority: mediumPriority.length,
        infoFindings: infoFindings.length,
        globalErrors: [...findings.globalErrors],
        promiseRejections: [...findings.promiseRejections],
        consoleErrors: [...findings.consoleErrors],
        verboseOutputs: [...findings.verboseOutputs],
        debugComments: [...findings.debugComments],
        debugVariables: [...findings.debugVariables],
        sourcemaps: [...findings.sourcemaps],
        storageLeaks: [...findings.storageLeaks],
        domLeaks: [...findings.domLeaks],
        vulnerabilityPatterns: [...findings.vulnerabilityPatterns],
      };

      console.log("📊 Use viewFindings(true) to see all findings without truncation");
      console.log("📄 Full findings object:", summary);
      return summary;
    },
  };

  console.log("✅ Enhanced monitoring initialized with comprehensive bug bounty features.");
  console.log("🚀 Available commands:");
  console.group("Core Features:");
  console.log("• `window.ErrorDebugExtractor.viewFindings()` - View all collected data");
  console.log("• `window.ErrorDebugExtractor.viewFindings(true)` - View ALL findings (no truncation)");
  console.log("• `window.ErrorDebugExtractor.showHighPriority()` - Show only critical vulnerabilities");
  console.log("• `window.ErrorDebugExtractor.startPeriodicScan(30000)` - Start periodic scanning (30s intervals)");
  console.log("• `window.ErrorDebugExtractor.stopPeriodicScan()` - Stop periodic scanning");
  console.log("• `window.ErrorDebugExtractor.exportFindings()` - Export findings to JSON file");
  console.log("• `window.ErrorDebugExtractor.exportFindings('csv')` - Export to CSV");
  console.log("• `window.ErrorDebugExtractor.exportFindings('xml')` - Export to XML");
  console.log("• `window.ErrorDebugExtractor.stop()` - Stop all monitoring");
  console.groupEnd();

  console.group("🎯 Custom Rules Engine:");
  console.log("• `window.ErrorDebugExtractor.addCustomRule(name, pattern, category, severity)` - Add custom detection rule");
  console.log("• `window.ErrorDebugExtractor.removeCustomRule(name)` - Remove custom rule");
  console.log("• `window.ErrorDebugExtractor.toggleCustomRule(name, enabled)` - Enable/disable rule");
  console.log("• `window.ErrorDebugExtractor.getCustomRules()` - Get rule statistics");
  console.log("• `window.ErrorDebugExtractor.exportCustomRules()` - Export rules configuration");
  console.log("• `window.ErrorDebugExtractor.importCustomRules(rulesObj)` - Import rules configuration");
  console.groupEnd();

  console.group("📊 Performance & Analytics:");
  console.log("• `window.ErrorDebugExtractor.getPerformanceReport()` - Get performance metrics");
  console.log("• `window.ErrorDebugExtractor.resetPerformanceMetrics()` - Reset performance data");
  console.log("• `window.ErrorDebugExtractor.getHistoricalTrends()` - Get trend analysis");
  console.log("• `window.ErrorDebugExtractor.getHistoricalData(hours)` - Get historical data");
  console.log("• `window.ErrorDebugExtractor.predictTrends(hours)` - Predict future trends");
  console.groupEnd();

  console.group("🖥️ Visual Dashboard:");
  console.log("• `window.ErrorDebugExtractor.showDashboard()` - Show real-time monitoring dashboard");
  console.log("• `window.ErrorDebugExtractor.hideDashboard()` - Hide dashboard");
  console.groupEnd();

  console.group("💡 Remediation Engine:");
  console.log("• `window.ErrorDebugExtractor.getRemediationSuggestions(finding)` - Get fix suggestions");
  console.log("• `window.ErrorDebugExtractor.addRemediationSuggestion(category, suggestion)` - Add custom suggestion");
  console.groupEnd();

  console.group("🚨 Alerting System:");
  console.log("• `window.ErrorDebugExtractor.getActiveAlerts()` - Get active alerts");
  console.log("• `window.ErrorDebugExtractor.acknowledgeAlert(alertId)` - Acknowledge alert");
  console.log("• `window.ErrorDebugExtractor.setAlertThreshold(key, value)` - Configure alert thresholds");
  console.groupEnd();

  console.group("🤝 Collaboration Features:");
  console.log("• `window.ErrorDebugExtractor.initCollaborationSession(name)` - Start team session");
  console.log("• `window.ErrorDebugExtractor.addTeamMember(id, info)` - Add team member");
  console.log("• `window.ErrorDebugExtractor.shareFinding(id, finding, priority)` - Share finding with team");
  console.log("• `window.ErrorDebugExtractor.addFindingComment(id, comment, author)` - Add comment to finding");
  console.log("• `window.ErrorDebugExtractor.updateFindingStatus(id, status)` - Update finding status");
  console.log("• `window.ErrorDebugExtractor.getCollaborationSummary()` - Get collaboration summary");
  console.groupEnd();

  console.log("💡 Tip: Use `window.ErrorDebugExtractor.showDashboard()` for a visual monitoring experience!");
  console.log("🔧 For Chart.js integration, include: https://cdn.jsdelivr.net/npm/chart.js");
  console.groupEnd();

  // Initialize collaboration listener
  collaboration.listenForUpdates();
  collaboration.loadSharedFindings();

  // --- SERVER-SIDE ADAPTATION EXAMPLES ---

  /*
  // ============================================
  // NODE.JS SERVER-SIDE ADAPTATION
  // ============================================

  // Example Node.js module for server-side scanning
  // Save this as 'server-scanner.js'

  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');

  class ServerErrorDebugExtractor {
    constructor(config = {}) {
      this.config = {
        scanInterval: 30000,
        maxStringLength: 100,
        sensitiveKeywords: [
          "token", "key", "secret", "password", "auth", "session", "jwt", "api_key",
          "access_token", "refresh_token", "bearer", "credential", "private", "internal"
        ],
        debugIndicators: [
          "todo", "fixme", "hack", "xxx", "debug:", "dbg:", "temp", "test"
        ],
        enableFileSystemScanning: true,
        enableEnvironmentScanning: true,
        enableLogScanning: true,
        enableConfigFileScanning: true,
        ...config
      };

      this.findings = {
        fileSystemLeaks: new Set(),
        environmentLeaks: new Set(),
        logLeaks: new Set(),
        configLeaks: new Set(),
        vulnerabilityPatterns: new Set()
      };
    }

    // Scan file system for sensitive data
    scanFileSystem(directory = process.cwd()) {
      if (!this.config.enableFileSystemScanning) return;

      console.log(`🔍 Scanning file system: ${directory}`);

      const scanDirectory = (dir) => {
        try {
          const files = fs.readdirSync(dir);

          files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && !this.isIgnoredDirectory(file)) {
              scanDirectory(filePath);
            } else if (stat.isFile() && this.shouldScanFile(file)) {
              this.scanFile(filePath);
            }
          });
        } catch (e) {
          console.warn(`Could not scan directory ${dir}:`, e.message);
        }
      };

      scanDirectory(directory);
    }

    // Check if directory should be ignored
    isIgnoredDirectory(dirName) {
      const ignored = ['node_modules', '.git', 'dist', 'build', 'coverage', '.nyc_output'];
      return ignored.includes(dirName);
    }

    // Check if file should be scanned
    shouldScanFile(fileName) {
      const scanExtensions = ['.js', '.ts', '.json', '.env', '.config', '.log', '.txt', '.md'];
      const ext = path.extname(fileName);
      return scanExtensions.includes(ext) || fileName.includes('.env') || fileName.includes('config');
    }

    // Scan individual file
    scanFile(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        // Check for sensitive keywords
        this.config.sensitiveKeywords.forEach(keyword => {
          if (content.toLowerCase().includes(keyword)) {
            // Additional validation for tokens
            if (keyword === 'token' || keyword === 'key' || keyword === 'secret') {
              if (!this.isValidToken(content)) return;
            }

            this.findings.fileSystemLeaks.add(`[FILE_LEAK] ${fileName}: contains '${keyword}'`);
          }
        });

        // Check for debug indicators
        this.config.debugIndicators.forEach(indicator => {
          if (content.toLowerCase().includes(indicator)) {
            this.findings.fileSystemLeaks.add(`[DEBUG_INDICATOR] ${fileName}: contains '${indicator}'`);
          }
        });

        // Check for hardcoded secrets
        this.checkForHardcodedSecrets(content, fileName);

      } catch (e) {
        console.warn(`Could not scan file ${filePath}:`, e.message);
      }
    }

    // Check for hardcoded secrets
    checkForHardcodedSecrets(content, fileName) {
      const secretPatterns = [
        /sk_live_[0-9a-zA-Z_-]{20,}/g,
        /sk_test_[0-9a-zA-Z_-]{20,}/g,
        /AKIA[0-9A-Z]{16}/g,
        /eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=_-]{20,}/g,
        /AIza[0-9A-Za-z-_]{35}/g,
        /mongodb:\/\/[^:]+:[^@]+@[^/]+/g,
        /mysql:\/\/[^:]+:[^@]+@[^/]+/g,
        /postgresql:\/\/[^:]+:[^@]+@[^/]+/g
      ];

      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            this.findings.vulnerabilityPatterns.add(`[HARDCODED_SECRET] ${fileName}: ${match.substring(0, 50)}...`);
          });
        }
      });
    }

    // Scan environment variables
    scanEnvironment() {
      if (!this.config.enableEnvironmentScanning) return;

      console.log("🔍 Scanning environment variables");

      Object.keys(process.env).forEach(key => {
        const value = process.env[key];

        this.config.sensitiveKeywords.forEach(keyword => {
          if (key.toLowerCase().includes(keyword) || (value && value.toLowerCase().includes(keyword))) {
            if (this.isValidToken(value)) {
              this.findings.environmentLeaks.add(`[ENV_LEAK] ${key}: ${value.substring(0, 50)}...`);
            }
          }
        });
      });
    }

    // Scan log files
    scanLogs(logDirectory = './logs') {
      if (!this.config.enableLogScanning) return;

      console.log(`🔍 Scanning log files in: ${logDirectory}`);

      try {
        if (fs.existsSync(logDirectory)) {
          const files = fs.readdirSync(logDirectory);

          files.forEach(file => {
            if (file.endsWith('.log')) {
              const logPath = path.join(logDirectory, file);
              this.scanLogFile(logPath);
            }
          });
        }
      } catch (e) {
        console.warn(`Could not scan logs:`, e.message);
      }
    }

    // Scan individual log file
    scanLogFile(logPath) {
      try {
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for error patterns
          if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')) {
            this.findings.logLeaks.add(`[LOG_ERROR] ${path.basename(logPath)}:${index + 1}: ${line.substring(0, 100)}`);
          }

          // Check for sensitive data in logs
          this.config.sensitiveKeywords.forEach(keyword => {
            if (line.toLowerCase().includes(keyword)) {
              this.findings.logLeaks.add(`[LOG_LEAK] ${path.basename(logPath)}:${index + 1}: contains '${keyword}'`);
            }
          });
        });
      } catch (e) {
        console.warn(`Could not scan log file ${logPath}:`, e.message);
      }
    }

    // Scan configuration files
    scanConfigFiles() {
      if (!this.config.enableConfigFileScanning) return;

      console.log("🔍 Scanning configuration files");

      const configFiles = [
        'package.json', 'config.json', 'settings.json', '.env', '.env.local',
        'config.js', 'settings.js', 'app.config.js', 'database.config.js'
      ];

      configFiles.forEach(file => {
        if (fs.existsSync(file)) {
          this.scanFile(file);
        }
      });
    }

    // Token validation (similar to client-side)
    isValidToken(str) {
      if (!str || str.length < this.config.minTokenLength) return false;

      const tokenPatterns = [
        /^[A-Za-z0-9+/=]{20,}$/,
        /^[A-Za-z0-9_-]{20,}$/,
        /^[0-9a-f]{32,}$/,
        /^[A-Za-z0-9]{32,}$/
      ];

      const matchesPattern = tokenPatterns.some(pattern => pattern.test(str));
      if (!matchesPattern) return false;

      // Entropy check
      return this.calculateEntropy(str) > 3.5;
    }

    // Calculate entropy
    calculateEntropy(str) {
      const charCounts = {};
      for (let char of str) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      let entropy = 0;
      const len = str.length;
      for (let count of Object.values(charCounts)) {
        const p = count / len;
        entropy -= p * Math.log2(p);
      }
      return entropy;
    }

    // Run comprehensive scan
    runScan() {
      console.group("🐛 Server-Side Error & Debug Info Extractor");

      this.scanEnvironment();
      this.scanFileSystem();
      this.scanLogs();
      this.scanConfigFiles();

      this.viewFindings();

      console.groupEnd();
    }

    // View findings
    viewFindings() {
      console.group("📊 Server Scan Findings Summary");

      Object.keys(this.findings).forEach(category => {
        const count = this.findings[category].size;
        if (count > 0) {
          console.group(`${category} (${count}):`);
          this.findings[category].forEach(finding => console.log(finding));
          console.groupEnd();
        }
      });

      console.groupEnd();
    }

    // Export findings
    exportFindings(format = 'json') {
      const summary = {
        timestamp: new Date().toISOString(),
        findings: Object.fromEntries(
          Object.entries(this.findings).map(([k, v]) => [k, Array.from(v)])
        )
      };

      if (format === 'json') {
        fs.writeFileSync('server-scan-findings.json', JSON.stringify(summary, null, 2));
        console.log("📥 Findings exported to server-scan-findings.json");
      }
    }
  }

  // Usage example:
  // const scanner = new ServerErrorDebugExtractor();
  // scanner.runScan();
  // scanner.exportFindings();

  module.exports = ServerErrorDebugExtractor;

  */

  // Run an initial comprehensive scan
  console.log("🔍 Performing initial comprehensive scan...");
  window.ErrorDebugExtractor.viewFindings();
})();
