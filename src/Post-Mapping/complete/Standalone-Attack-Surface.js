/**
 * --- STANDALONE ATTACK SURFACE PRIORITIZER ---
 * Analyzes the current page to prioritize high-risk areas for bug bounty hunting.
 * Run this directly in the browser console of any target URL.
 */
(function standalonePrioritizeAttackSurface() {
  console.group("🚩 Standalone Attack Surface Prioritizer");
  console.log("Analyzing current page for high-risk areas...");

  // --- FINDINGS CONTAINER ---
  const priorities = {
    authentication: new Set(),
    accessControl: new Set(),
    dataInput: new Set(),
    businessTransactions: new Set(),
    stateChanging: new Set(),
    potentialGatekeepers: new Set(),
    criticalVulnerabilities: new Set(), // P1 - Critical
    highRiskAreas: new Set(), // P2 - High
  };

  // --- 1. DEFINE HIGH-RISK PATTERNS ---
  console.log("🔍 Defining high-risk patterns...");
  const riskPatterns = {
    authentication: [
      /login|logon|log-in|signon|sign-on|signin|sign-in|auth|authenticate|2fa|otp|mfa|totp|password|reset|forgot|recovery|token|jwt|sso|oauth|session/i,
      /issue|generate|create.*token|validate|verify/i,
      /biometric|facial.*recognition|fingerprint|touchid/i,
      /social.*login|google.*auth|facebook.*auth/i,
    ],
    accessControl: [
      /profile|account|settings|admin|manage|edit|delete|remove|view.*user|user.*data|permission|role|acl|rbac|tenant/i,
      /update.*profile|change.*password|delete.*account|impersonate/i,
      /user.*management|role.*assignment|permission.*matrix/i,
      /horizontal.*escalation|vertical.*escalation/i,
    ],
    dataInput: [
      /search|query|filter|upload|submit|post|comment|message|feedback|contact|form|field|input|text|file|image|document/i,
      /process.*upload|save.*comment|send.*message/i,
      /wysiwyg|rich.*text|editor|markdown/i,
      /file.*picker|drag.*drop.*upload/i,
    ],
    businessTransactions: [
      /cart|checkout|purchase|buy|order|payment|credit|debit|refund|subscription|billing|invoice|transfer|wallet|balance/i,
      /process.*payment|complete.*order|apply.*credit|initiate.*transfer/i,
      /crypto.*payment|blockchain|wallet.*address/i,
      /subscription.*management|billing.*cycle/i,
    ],
    criticalVulnerabilities: [
      /rce|remote.*code.*execution|command.*injection|deserialization|lfi|rfi|xxe|ssrf|idor.*admin|privilege.*escalation.*admin/i,
      /eval|exec|system|shell|cmd|powershell|bash/i,
      /admin.*bypass|root.*access|superuser/i,
      /prototype.*pollution|__proto__|constructor.*prototype/i,
      /csp.*bypass|content.*security.*policy.*violation/i,
      /postmessage.*vulnerable|window\.postmessage/i,
      /websocket.*injection|ws:\/\//i,
    ],
    highRiskAreas: [
      /idor|insecure.*direct.*object.*reference|xss|cross.*site.*scripting|csrf|cross.*site.*request.*forgery/i,
      /sqli|sql.*injection|nosql.*injection|injection/i,
      /file.*upload.*vulnerable|path.*traversal|directory.*traversal/i,
      /weak.*crypto|broken.*encryption|insecure.*random/i,
      /localstorage|sessionstorage|cookie.*vulnerable/i,
      /webrtc.*vulnerable|getusermedia|mediastream/i,
      /service.*worker.*vulnerable|sw\.js|serviceworker/i,
      /webgl.*vulnerable|canvas.*fingerprint|device.*fingerprint/i,
      /cors.*misconfiguration|access.*control.*allow.*origin/i,
      /jsonp.*vulnerable|callback.*parameter/i,
    ],
  };

  const stateChangingIndicators = {
    methods: ["POST", "PUT", "PATCH", "DELETE"],
    urlKeywords: [
      /\/(create|add|submit|update|modify|edit|delete|remove|destroy|cancel|process|confirm|activate|deactivate)\/?/i,
      /\/api\/v?\d*\/(user|account|profile|admin|config|setting|payment|order|cart|subscription)/i,
    ],
  };

  const gatekeeperIndicators = [
    /captcha|recaptcha|hcaptcha|turnstile|challenge|verify|confirm|2fa|otp|mfa|auth|login|signin|password/i,
    /validate|check|verify|confirm/i,
  ];

  // --- 2. DEEP SCRIPT ANALYSIS FOR OBFUSCATION AND VULNERABILITIES ---
  console.log("🔍 Performing deep script analysis for obfuscation and vulnerabilities...");
  const scripts = document.querySelectorAll("script");

  scripts.forEach((script, index) => {
    let scriptContent = "";
    let scriptSource = script.src || `[Inline script ${index + 1}]`;

    if (script.src) {
      // External script - try to fetch content aggressively
      try {
        const scriptOrigin = new URL(script.src).origin;
        const currentOrigin = window.location.origin;

        // Always attempt to fetch - let CORS errors be handled gracefully
        const xhr = new XMLHttpRequest();
        xhr.open("GET", script.src, false); // Synchronous for analysis
        xhr.timeout = 5000; // 5 second timeout for external scripts

        // Add error handling
        xhr.onerror = function() {
          scriptContent = `[CORS/Network Error: ${script.src} - Could not fetch external script. This may be due to CORS policy, network issues, or the script being unavailable.]`;
        };

        xhr.ontimeout = function() {
          scriptContent = `[Timeout: ${script.src} - Request timed out after 5 seconds]`;
        };

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              scriptContent = xhr.responseText;
            } else if (xhr.status === 0) {
              // Status 0 often indicates CORS or network error
              scriptContent = `[CORS/Network Error: ${script.src} - HTTP ${xhr.status} (likely CORS blocked)]`;
            } else {
              scriptContent = `[HTTP Error: ${script.src} - HTTP ${xhr.status}]`;
            }
          }
        };

        xhr.send();

        // If we still don't have content, it means an error occurred
        if (!scriptContent || scriptContent.startsWith('[')) {
          // Try one more time with different approach for stubborn scripts
          if (scriptOrigin !== currentOrigin) {
            // For cross-origin scripts, still mark them for analysis but note the limitation
            scriptContent = `[EXTERNAL_SCRIPT_ANALYZED: ${script.src} - Cross-origin script. Limited analysis possible. Full analysis requires running tool on ${scriptOrigin}]`;

            // Add to critical vulnerabilities as external scripts are potential attack vectors
            priorities.criticalVulnerabilities.add(
              `[EXTERNAL_SCRIPT_VECTOR] ${script.src} - External script from ${scriptOrigin} detected. Potential supply chain attack vector.`
            );
          }
        }

        // Even if we couldn't get the content, we can still analyze the script tag itself
        if (scriptContent.startsWith('[') && script.src) {
          // Extract any useful information from the script tag attributes
          const scriptInfo = {
            src: script.src,
            async: script.async,
            defer: script.defer,
            type: script.type,
            integrity: script.integrity,
            crossorigin: script.crossOrigin
          };

          // Add script metadata analysis
          priorities.businessTransactions.add(
            `[SCRIPT_METADATA] ${script.src} - ${JSON.stringify(scriptInfo)}`
          );
        }

      } catch (e) {
        if (e.message.includes('CORS') || e.message.includes('Access-Control') || e.message.includes('cross-origin') || e.message.includes('blocked')) {
          scriptContent = `[CORS_BLOCKED: ${script.src} - Cross-origin request blocked. This is expected for third-party scripts, but the tool attempted to analyze it anyway.]`;
        } else if (e.message.includes('Failed to construct') || e.message.includes('Invalid URL')) {
          scriptContent = `[INVALID_URL: ${script.src} - Script URL is malformed or unreachable]`;
        } else if (e.message.includes('NetworkError') || e.message.includes('Failed to fetch')) {
          scriptContent = `[NETWORK_ERROR: ${script.src} - Network request failed. Script may be temporarily unavailable.]`;
        } else {
          scriptContent = `[FETCH_ERROR: ${script.src} - ${e.message}]`;
        }
      }
    } else {
      // Inline script
      scriptContent = script.textContent || script.innerText || "";
    }

    // Don't skip scripts entirely - even if content couldn't be fetched,
    // we can still analyze based on URL patterns and attributes
    const contentAvailable = scriptContent && !scriptContent.startsWith('[');

    console.log(`🔎 Analyzing script ${index + 1}: ${scriptSource}`);

    // === OBFUSCATION ANALYSIS ===
    let obfuscationScore = 0;
    let obfuscationDetails = [];

    if (contentAvailable) {
      const obfuscationAnalysis = analyzeObfuscation(scriptContent);
      obfuscationScore = obfuscationAnalysis.score;
      obfuscationDetails = obfuscationAnalysis.details;
    } else {
      // For external scripts without content, analyze URL for potential risks
      obfuscationScore = analyzeExternalScriptRisk(script.src);
      obfuscationDetails = [`External script analysis: ${script.src}`];
    }

    // === VULNERABILITY PATTERN ANALYSIS ===
    let vulnFindings = [];
    if (contentAvailable) {
      const vulnAnalysis = analyzeVulnerabilities(scriptContent, index + 1);
      vulnFindings = vulnAnalysis.findings;
    } else {
      // Analyze based on URL patterns and script attributes
      vulnFindings = analyzeExternalScriptVulns(script, index + 1);
    }

    // === API ENDPOINT EXTRACTION ===
    let apiFindings = [];
    if (contentAvailable) {
      const apiAnalysis = extractAPIEndpoints(scriptContent, index + 1);
      apiFindings = apiAnalysis.findings;
    } else {
      // Extract potential API patterns from URL
      apiFindings = extractAPIFromURL(script.src, index + 1);
    }

    // === SENSITIVE DATA PATTERN ANALYSIS ===
    let sensitiveFindings = [];
    if (contentAvailable) {
      const sensitiveAnalysis = analyzeSensitiveData(scriptContent, index + 1);
      sensitiveFindings = sensitiveAnalysis.findings;
    }

    // === CODE STRUCTURE ANALYSIS ===
    let structureFindings = [];
    if (contentAvailable) {
      const structureAnalysis = analyzeCodeStructure(scriptContent, index + 1);
      structureFindings = structureAnalysis.findings;
    } else {
      // Analyze script attributes for potential security insights
      structureFindings = analyzeScriptAttributes(script, index + 1);
    }

    // === ENHANCED REPORTING ===
    // Add findings to appropriate categories with detailed information
    vulnFindings.forEach(finding => {
      let categoryMessage = finding.message;

      // Add detailed vulnerability information
      if (finding.details && finding.details.length > 0) {
        const firstDetail = finding.details[0];
        categoryMessage += `\n    📍 Location: Line ${firstDetail.lineNumber} in ${firstDetail.context.function}`;
        categoryMessage += `\n    💥 Exploitability: ${finding.exploitability}/10 | Impact: ${finding.impact}/10 | Score: ${finding.vulnScore}/10`;
        categoryMessage += `\n    🔧 Remediation: ${finding.remediation}`;

        if (finding.details.length > 1) {
          categoryMessage += `\n    📊 Additional occurrences: ${finding.occurrences - 1} more instances found`;
        }

        // Add code snippet for first occurrence
        const snippet = firstDetail.codeSnippet.substring(0, 150);
        categoryMessage += `\n    📝 Code: ${snippet}${snippet.length < firstDetail.codeSnippet.length ? '...' : ''}`;
      }

      if (finding.severity === 'critical') {
        priorities.criticalVulnerabilities.add(categoryMessage);
      } else if (finding.severity === 'high') {
        priorities.highRiskAreas.add(categoryMessage);
      } else {
        priorities.dataInput.add(categoryMessage);
      }
    });

    if (apiFindings && apiFindings.findings) {
      apiFindings.findings.forEach(finding => {
        priorities.businessTransactions.add(finding.message);
      });
    }

    if (sensitiveFindings && sensitiveFindings.findings) {
      sensitiveFindings.findings.forEach(finding => {
        priorities.criticalVulnerabilities.add(finding.message);
      });
    }

    if (structureFindings && Array.isArray(structureFindings)) {
      structureFindings.forEach(finding => {
        if (finding.type === 'auth') {
          priorities.authentication.add(finding.message);
        } else if (finding.type === 'admin') {
          priorities.accessControl.add(finding.message);
        } else {
          priorities.highRiskAreas.add(finding.message);
        }
      });
    }

    // Overall script assessment
    if (obfuscationScore > 20 || vulnFindings.some(f => f.severity === 'critical')) {
      priorities.criticalVulnerabilities.add(
        `[SCRIPT_ANALYSIS] Script ${index + 1} (${scriptSource}): Obfuscation=${obfuscationScore}, ` +
        `Vulns=${vulnFindings.length}, APIs=${apiFindings.length}, Sensitive=${sensitiveFindings.length}`
      );
    } else if (obfuscationScore > 10 || vulnFindings.length > 0) {
      priorities.highRiskAreas.add(
        `[SCRIPT_ANALYSIS] Script ${index + 1} (${scriptSource}): Obfuscation=${obfuscationScore}, ` +
        `Vulns=${vulnFindings.length}, APIs=${apiFindings.length}, Sensitive=${sensitiveFindings.length}`
      );
    }

    // Store script analysis for dependency and chaining analysis
    if (!window.StandaloneAttackSurfacePrioritizer) {
      window.StandaloneAttackSurfacePrioritizer = {};
    }
    if (!window.StandaloneAttackSurfacePrioritizer.scriptAnalysis) {
      window.StandaloneAttackSurfacePrioritizer.scriptAnalysis = [];
    }

    // Store analysis results even for scripts without content
    const scriptAnalysisData = {
      index: index + 1,
      source: scriptSource,
      obfuscationScore,
      vulnCount: vulnFindings.length,
      apiCount: apiFindings.length,
      sensitiveCount: sensitiveFindings.length,
      vulnFindings: vulnFindings,
      apiFindings: apiFindings,
      sensitiveFindings: sensitiveFindings,
      contentAvailable: contentAvailable,
      externalScript: script.src ? true : false,
      corsBlocked: scriptContent.startsWith('[CORS') || scriptContent.startsWith('[EXTERNAL_SCRIPT'),
      attributes: {
        defer: script.defer,
        async: script.async,
        type: script.type,
        integrity: script.integrity,
        crossorigin: script.crossOrigin
      }
    };

    // Store content if available, otherwise store analysis metadata
    if (contentAvailable) {
      scriptAnalysisData.content = scriptContent.substring(0, 1000);
    } else {
      scriptAnalysisData.content = `[Content not available: ${scriptContent}]`;
      scriptAnalysisData.analysisType = 'external-url-patterns';
    }

    window.StandaloneAttackSurfacePrioritizer.scriptAnalysis.push(scriptAnalysisData);
  });

  // === SCRIPT DEPENDENCY ANALYSIS ===
  console.log("🔗 Analyzing script dependencies and interactions...");
  if (window.StandaloneAttackSurfacePrioritizer && window.StandaloneAttackSurfacePrioritizer.scriptAnalysis) {
    const scriptAnalysis = window.StandaloneAttackSurfacePrioritizer.scriptAnalysis;

    // Analyze cross-script dependencies
    scriptAnalysis.forEach((script, index) => {
      const otherScripts = scriptAnalysis.filter((_, i) => i !== index);

      // Look for global variable dependencies
      const globalVars = extractGlobalVariables(script.content);
      const dependentScripts = [];

      otherScripts.forEach(otherScript => {
        const otherVars = extractGlobalVariables(otherScript.content);
        const sharedVars = globalVars.filter(v => otherVars.includes(v));

        if (sharedVars.length > 0) {
          dependentScripts.push({
            scriptIndex: otherScript.index,
            sharedVars: sharedVars
          });
        }
      });

      if (dependentScripts.length > 0) {
        priorities.highRiskAreas.add(
          `[SCRIPT_DEPENDENCY] Script ${script.index} shares global variables with: ` +
          dependentScripts.map(d => `Script ${d.scriptIndex} (${d.sharedVars.join(', ')})`).join('; ')
        );
      }

      // Look for potential DOM manipulation conflicts
      const domManipulations = extractDOMManipulations(script.content);
      if (domManipulations.length > 0) {
        priorities.dataInput.add(
          `[SCRIPT_DOM] Script ${script.index} performs DOM manipulations: ${domManipulations.join(', ')}`
        );
      }

      // Check for event listener attachments
      const eventListeners = extractEventListeners(script.content);
      if (eventListeners.length > 0) {
        priorities.businessTransactions.add(
          `[SCRIPT_EVENTS] Script ${script.index} attaches event listeners: ${eventListeners.join(', ')}`
        );
      }
    });

    // Analyze script loading order risks
    const externalScripts = scriptAnalysis.filter(s => s.source.includes('http'));
    if (externalScripts.length > 0) {
      priorities.criticalVulnerabilities.add(
        `[SCRIPT_LOADING] ${externalScripts.length} external scripts detected - potential supply chain attack vector`
      );
    }

    // === VULNERABILITY CHAINING ANALYSIS ===
    console.log("🔗 Analyzing vulnerability chaining opportunities...");
    const vulnChains = analyzeVulnChains(scriptAnalysis);

    vulnChains.forEach(chain => {
      if (chain.severity === 'critical') {
        priorities.criticalVulnerabilities.add(
          `[VULN_CHAIN] ${chain.description} (Chain Score: ${chain.chainScore}/10)`
        );
      } else {
        priorities.highRiskAreas.add(
          `[VULN_CHAIN] ${chain.description} (Chain Score: ${chain.chainScore}/10)`
        );
      }
    });

    // === ATTACK VECTOR MAPPING ===
    console.log("🎯 Mapping attack vectors...");
    const attackVectors = mapAttackVectors(scriptAnalysis);

    attackVectors.forEach(vector => {
      priorities.criticalVulnerabilities.add(
        `[ATTACK_VECTOR] ${vector.description} (Difficulty: ${vector.difficulty}/10, Impact: ${vector.impact}/10)`
      );
    });

    // === CODE FLOW ANALYSIS ===
    console.log("🔄 Analyzing code flow and data propagation...");
    const codeFlows = analyzeCodeFlow(scriptAnalysis);

    codeFlows.forEach(flow => {
      if (flow.risk === 'high') {
        priorities.criticalVulnerabilities.add(
          `[CODE_FLOW] ${flow.description} (Risk Level: ${flow.risk.toUpperCase()})`
        );
      } else {
        priorities.highRiskAreas.add(
          `[CODE_FLOW] ${flow.description} (Risk Level: ${flow.risk.toUpperCase()})`
        );
      }
    });

    // === VULNERABILITY PRIORITIZATION SCORING ===
    console.log("📊 Calculating vulnerability prioritization scores...");
    const prioritizedVulns = prioritizeVulnerabilities(scriptAnalysis);

    // Add top priority vulnerabilities to findings
    prioritizedVulns.slice(0, 10).forEach((vuln, index) => {
      const priority = index < 3 ? 'TOP' : index < 6 ? 'HIGH' : 'MEDIUM';
      priorities.criticalVulnerabilities.add(
        `[PRIORITY_${priority}] Script ${vuln.scriptIndex}: ${vuln.type} (${vuln.score}/10 priority score)`
      );
    });
  }

  // === HELPER FUNCTIONS FOR DEPENDENCY ANALYSIS ===

  function extractGlobalVariables(content) {
    const globals = [];
    // Look for window object assignments
    const windowAssignments = content.match(/window\.[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
    windowAssignments.forEach(assignment => {
      const varName = assignment.replace('window.', '');
      if (!globals.includes(varName)) {
        globals.push(varName);
      }
    });

    // Look for global variable declarations (heuristic)
    const globalDeclarations = content.match(/(?:^|\s)(?:var|let|const)\s+[a-zA-Z_$][a-zA-Z0-9_$]*/gm) || [];
    globalDeclarations.forEach(declaration => {
      const varName = declaration.replace(/^(?:var|let|const)\s+/, '').trim();
      if (!globals.includes(varName) && !['window', 'document', 'console'].includes(varName)) {
        globals.push(varName);
      }
    });

    return globals;
  }

  function extractDOMManipulations(content) {
    const manipulations = [];
    const domPatterns = [
      /document\.getElementById/g,
      /document\.querySelector/g,
      /document\.querySelectorAll/g,
      /document\.createElement/g,
      /innerHTML\s*=/g,
      /outerHTML\s*=/g,
      /textContent\s*=/g,
      /appendChild/g,
      /removeChild/g,
      /setAttribute/g,
    ];

    domPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        manipulations.push(pattern.source.replace(/\\s\*=/g, '=').replace(/\\/g, ''));
      }
    });

    return [...new Set(manipulations)]; // Remove duplicates
  }

  function extractEventListeners(content) {
    const listeners = [];
    const eventPatterns = [
      /addEventListener\s*\(/g,
      /onclick\s*=/g,
      /onload\s*=/g,
      /onsubmit\s*=/g,
      /onchange\s*=/g,
      /onmouseover\s*=/g,
      /onmouseout\s*=/g,
    ];

    eventPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        listeners.push(pattern.source.replace(/\\s\*=/g, '=').replace(/\\/g, '').replace('addEventListener', 'addEventListener()'));
      }
    });

    return [...new Set(listeners)]; // Remove duplicates
  }

  // === HELPER FUNCTIONS FOR EXTERNAL SCRIPT ANALYSIS ===

  function analyzeExternalScriptRisk(scriptSrc) {
    let riskScore = 0;

    // Analyze URL for potential risks
    const url = scriptSrc.toLowerCase();

    // Known risky domains or patterns
    if (url.includes('cdn.') || url.includes('static.')) {
      riskScore += 2; // CDN scripts can be supply chain attack vectors
    }

    if (url.includes('analytics') || url.includes('tracking') || url.includes('pixel')) {
      riskScore += 1; // Analytics scripts often have access to sensitive data
    }

    if (url.includes('jquery') || url.includes('bootstrap') || url.includes('angular') || url.includes('react')) {
      riskScore += 1; // Popular libraries can have known vulnerabilities
    }

    if (url.includes('min.js') || url.includes('minified')) {
      riskScore += 3; // Minified scripts are harder to analyze
    }

    return riskScore;
  }

  function analyzeExternalScriptVulns(script, scriptIndex) {
    const findings = [];
    const src = script.src.toLowerCase();

    // Check for potentially vulnerable URL patterns
    if (src.includes('eval') || src.includes('exec') || src.includes('function')) {
      findings.push({
        severity: 'high',
        type: 'Suspicious URL Pattern',
        exploitability: 6,
        impact: 7,
        vulnScore: 7,
        occurrences: 1,
        message: `[EXTERNAL_SCRIPT_VULN] Suspicious URL pattern in script ${scriptIndex}: ${script.src}`,
        details: [],
        remediation: 'Review the script source and ensure it comes from a trusted domain'
      });
    }

    // Check for missing integrity attributes (supply chain risk)
    if (!script.integrity) {
      findings.push({
        severity: 'medium',
        type: 'Missing Integrity Check',
        exploitability: 4,
        impact: 6,
        vulnScore: 5,
        occurrences: 1,
        message: `[EXTERNAL_SCRIPT_VULN] Missing integrity attribute in script ${scriptIndex}: ${script.src}`,
        details: [],
        remediation: 'Add integrity and crossorigin attributes to prevent supply chain attacks'
      });
    }

    // Check for HTTP (not HTTPS)
    if (src.startsWith('http://')) {
      findings.push({
        severity: 'medium',
        type: 'Insecure Transport',
        exploitability: 5,
        impact: 4,
        vulnScore: 4,
        occurrences: 1,
        message: `[EXTERNAL_SCRIPT_VULN] HTTP (not HTTPS) script in ${scriptIndex}: ${script.src}`,
        details: [],
        remediation: 'Use HTTPS for all external scripts to prevent MITM attacks'
      });
    }

    return findings;
  }

  function extractAPIFromURL(scriptSrc, scriptIndex) {
    const findings = [];
    const url = scriptSrc.toLowerCase();

    // Look for API-related patterns in URL
    if (url.includes('/api/') || url.includes('/v1/') || url.includes('/v2/') || url.includes('/v3/')) {
      findings.push({
        message: `[EXTERNAL_SCRIPT_API] API-related URL pattern in script ${scriptIndex}: ${scriptSrc}`
      });
    }

    if (url.includes('auth') || url.includes('login') || url.includes('token')) {
      findings.push({
        message: `[EXTERNAL_SCRIPT_API] Authentication-related URL pattern in script ${scriptIndex}: ${scriptSrc}`
      });
    }

    return { findings };
  }

  function analyzeScriptAttributes(script, scriptIndex) {
    const findings = [];

    // Analyze script attributes for security insights
    if (script.defer) {
      findings.push({
        type: 'script-behavior',
        message: `[SCRIPT_ATTRIBUTE] Deferred loading in script ${scriptIndex} - may affect execution timing`
      });
    }

    if (script.async) {
      findings.push({
        type: 'script-behavior',
        message: `[SCRIPT_ATTRIBUTE] Asynchronous loading in script ${scriptIndex} - may affect execution order`
      });
    }

    if (script.type && script.type !== 'text/javascript') {
      findings.push({
        type: 'script-behavior',
        message: `[SCRIPT_ATTRIBUTE] Non-standard script type in script ${scriptIndex}: ${script.type}`
      });
    }

    if (script.crossOrigin) {
      findings.push({
        type: 'security',
        message: `[SCRIPT_ATTRIBUTE] Cross-origin enabled in script ${scriptIndex} - ${script.crossOrigin}`
      });
    }

    return findings;
  }

  // === HELPER FUNCTIONS FOR DEEP ANALYSIS ===

  function analyzeObfuscation(content) {
    const details = [];
    let score = 0;

    // Minification indicators
    const minificationPatterns = [
      { pattern: /function\([a-zA-Z]\){[^}]*}/g, name: 'Single-letter function params', weight: 2 },
      { pattern: /var [a-zA-Z]=/g, name: 'Short variable names', weight: 1 },
      { pattern: /;[a-zA-Z]=/g, name: 'Minified assignments', weight: 1 },
      { pattern: /\\x[0-9a-fA-F]{2}/g, name: 'Hex encoding', weight: 3 },
      { pattern: /\\u[0-9a-fA-F]{4}/g, name: 'Unicode encoding', weight: 3 },
      { pattern: /eval\s*\(/g, name: 'Eval usage', weight: 5 },
      { pattern: /atob\s*\(|btoa\s*\(/g, name: 'Base64 encoding/decoding', weight: 4 },
      { pattern: /unescape\s*\(|escape\s*\(/g, name: 'String encoding', weight: 3 },
      { pattern: /String\.fromCharCode/g, name: 'Char code conversion', weight: 4 },
      { pattern: /\$\$\$|___|@@@/g, name: 'Unusual variable names', weight: 2 },
    ];

    minificationPatterns.forEach(({ pattern, name, weight }) => {
      const matches = content.match(pattern);
      if (matches) {
        score += matches.length * weight;
        details.push(`${name}: ${matches.length} occurrences`);
      }
    });

    // Entropy analysis for potential encrypted content
    const entropy = calculateEntropy(content);
    if (entropy > 5.0) {
      score += 10;
      details.push(`High entropy (${entropy.toFixed(2)}) - possible encrypted content`);
    }

    // Packed/minified code detection
    if (content.length > 1000 && content.split('\n').length < 5) {
      score += 15;
      details.push('Highly compressed/minified code detected');
    }

    return { score, details };
  }

  function analyzeVulnerabilities(content, scriptIndex) {
    const findings = [];

    const vulnPatterns = [
      // Critical vulnerabilities
      { pattern: /eval\s*\(/gi, severity: 'critical', type: 'RCE', description: 'Code injection via eval()', exploitability: 9, impact: 10 },
      { pattern: /Function\s*\(/gi, severity: 'critical', type: 'RCE', description: 'Dynamic function creation', exploitability: 8, impact: 9 },
      { pattern: /setTimeout\s*\(\s*['"`][^'"`]*\+/gi, severity: 'critical', type: 'Injection', description: 'String concatenation in setTimeout', exploitability: 7, impact: 8 },
      { pattern: /setInterval\s*\(\s*['"`][^'"`]*\+/gi, severity: 'critical', type: 'Injection', description: 'String concatenation in setInterval', exploitability: 7, impact: 8 },
      { pattern: /document\.write\s*\(/gi, severity: 'high', type: 'XSS', description: 'document.write usage', exploitability: 8, impact: 7 },
      { pattern: /innerHTML\s*\+?=\s*[^;]*\+/gi, severity: 'high', type: 'XSS', description: 'Unsafe innerHTML assignment', exploitability: 6, impact: 8 },
      { pattern: /outerHTML\s*\+?=\s*[^;]*\+/gi, severity: 'high', type: 'XSS', description: 'Unsafe outerHTML assignment', exploitability: 6, impact: 8 },
      { pattern: /location\.href\s*=\s*[^;]*\+/gi, severity: 'high', type: 'Open Redirect', description: 'Unsafe location.href assignment', exploitability: 7, impact: 6 },
      { pattern: /window\.open\s*\([^)]*\+/gi, severity: 'high', type: 'Open Redirect', description: 'Unsafe window.open with concatenation', exploitability: 6, impact: 5 },
      { pattern: /localStorage\.setItem\s*\([^,]+,\s*[^)]*\+/gi, severity: 'medium', type: 'Storage Injection', description: 'Unsafe localStorage usage', exploitability: 5, impact: 4 },
      { pattern: /sessionStorage\.setItem\s*\([^,]+,\s*[^)]*\+/gi, severity: 'medium', type: 'Storage Injection', description: 'Unsafe sessionStorage usage', exploitability: 5, impact: 4 },
      { pattern: /postMessage\s*\([^,]+,\s*['"`]\*['"`]/gi, severity: 'high', type: 'PostMessage', description: 'Unsafe postMessage target origin', exploitability: 6, impact: 7 },
      { pattern: /XMLHttpRequest|fetch\s*\([^)]*\+/gi, severity: 'medium', type: 'Request Injection', description: 'Dynamic URL in HTTP requests', exploitability: 7, impact: 6 },
    ];

    vulnPatterns.forEach(({ pattern, severity, type, description, exploitability, impact }) => {
      let match;
      const matches = [];
      while ((match = pattern.exec(content)) !== null) {
        const matchIndex = match.index;
        const matchLength = match[0].length;

        // Extract code snippet around the vulnerability (100 chars before and after)
        const start = Math.max(0, matchIndex - 100);
        const end = Math.min(content.length, matchIndex + matchLength + 100);
        const codeSnippet = content.substring(start, end);

        // Get line number
        const linesBefore = content.substring(0, matchIndex).split('\n');
        const lineNumber = linesBefore.length;

        matches.push({
          match: match[0],
          lineNumber,
          codeSnippet: codeSnippet.replace(/\s+/g, ' ').trim(),
          context: extractVulnContext(content, matchIndex, type)
        });
      }

      if (matches.length > 0) {
        const vulnScore = calculateVulnScore(exploitability, impact, matches.length);
        const remediation = getRemediationAdvice(type, matches[0].context);

        findings.push({
          severity,
          type,
          exploitability,
          impact,
          vulnScore,
          occurrences: matches.length,
          message: `[SCRIPT_VULN] ${type} in script ${scriptIndex}: ${description} (${matches.length} occurrences, Score: ${vulnScore}/10)`,
          details: matches.slice(0, 3), // Show first 3 occurrences
          remediation
        });
      }
    });

    return { findings };
  }

  function extractVulnContext(content, matchIndex, vulnType) {
    // Extract function context for the vulnerability
    const lines = content.split('\n');
    const matchLine = content.substring(0, matchIndex).split('\n').length - 1;

    // Look for function declaration above the vulnerability
    let functionContext = 'Global scope';
    for (let i = matchLine; i >= 0 && i >= matchLine - 10; i--) {
      const line = lines[i].trim();
      if (line.match(/function\s+[a-zA-Z_$][a-zA-Z0-9_$]*/)) {
        functionContext = line;
        break;
      } else if (line.match(/(?:var|let|const)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*(?:function|=>)/)) {
        functionContext = line;
        break;
      }
    }

    return {
      function: functionContext,
      line: matchLine + 1,
      vulnType: vulnType
    };
  }

  function calculateVulnScore(exploitability, impact, occurrences) {
    // Calculate vulnerability score based on CVSS-like system
    const baseScore = (exploitability + impact) / 2;
    const frequencyMultiplier = Math.min(occurrences / 5, 2); // Cap at 2x for frequency
    return Math.min(Math.round(baseScore * (1 + frequencyMultiplier * 0.2)), 10);
  }

  function getRemediationAdvice(vulnType, context) {
    const advice = {
      'RCE': 'Replace eval() with safe alternatives. Use JSON.parse() for data, avoid dynamic code execution.',
      'XSS': 'Use textContent instead of innerHTML/outerHTML. Sanitize user input with DOMPurify.',
      'Injection': 'Use parameterized queries or prepared statements. Avoid string concatenation in dynamic code.',
      'Open Redirect': 'Validate redirect URLs against whitelist. Use relative URLs when possible.',
      'Storage Injection': 'Validate and sanitize data before storing. Use JSON.stringify/parse for complex objects.',
      'PostMessage': 'Always specify explicit origin in postMessage calls. Validate sender origin.',
      'Request Injection': 'Validate and sanitize URLs. Use allowlists for dynamic endpoints.'
    };

    return advice[vulnType] || 'Implement input validation and sanitization.';
  }

  function extractAPIEndpoints(content, scriptIndex) {
    const findings = [];

    // API endpoint patterns
    const apiPatterns = [
      /https?:\/\/[^\s"'`]*\/api\/[^\s"'`]*/gi,
      /https?:\/\/[^\s"'`]*\/v\d+\/[^\s"'`]*/gi,
      /['"`]\/api\/[^'"`]*['"`]/gi,
      /['"`]\/v\d+\/[^'"`]*['"`]/gi,
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]/gi,
      /XMLHttpRequest.*open\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    ];

    apiPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const endpoint = match.replace(/['"`]/g, '').replace(/fetch\s*\(\s*/, '').replace(/XMLHttpRequest.*open\s*\(\s*/, '');
          findings.push({
            message: `[SCRIPT_API] API endpoint in script ${scriptIndex}: ${endpoint}`
          });
        });
      }
    });

    return { findings };
  }

  function analyzeSensitiveData(content, scriptIndex) {
    const findings = [];

    const sensitivePatterns = [
      { pattern: /['"`][a-zA-Z0-9+/=]{20,}['"`]/gi, type: 'Base64 blob', description: 'Large base64 encoded data' },
      { pattern: /password|passwd|pwd/gi, type: 'Password reference', description: 'Password-related code' },
      { pattern: /token|jwt|bearer/gi, type: 'Token handling', description: 'Authentication token handling' },
      { pattern: /secret|key|private/gi, type: 'Secret data', description: 'Potential secret/key handling' },
      { pattern: /credit.*card|card.*number/gi, type: 'Payment data', description: 'Credit card handling' },
      { pattern: /social.*security|ssn/gi, type: 'PII', description: 'Personally identifiable information' },
    ];

    sensitivePatterns.forEach(({ pattern, type, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          message: `[SCRIPT_SENSITIVE] ${type} in script ${scriptIndex}: ${description} (${matches.length} occurrences)`
        });
      }
    });

    return { findings };
  }

  function analyzeCodeStructure(content, scriptIndex) {
    const findings = [];

    // Function and variable analysis
    const functionMatches = content.match(/function\s+[a-zA-Z_$][a-zA-Z0-9_$]*/gi) || [];
    const varMatches = content.match(/var\s+[a-zA-Z_$][a-zA-Z0-9_$]*/gi) || [];
    const constMatches = content.match(/const\s+[a-zA-Z_$][a-zA-Z0-9_$]*/gi) || [];
    const letMatches = content.match(/let\s+[a-zA-Z_$][a-zA-Z0-9_$]*/gi) || [];

    // Look for suspicious function names
    const suspiciousFunctions = ['eval', 'exec', 'system', 'shell', 'cmd', 'powershell', 'bash'];
    functionMatches.forEach(func => {
      const funcName = func.replace('function ', '');
      if (suspiciousFunctions.some(suspicious => funcName.toLowerCase().includes(suspicious))) {
        findings.push({
          type: 'security',
          message: `[SCRIPT_FUNCTION] Suspicious function name in script ${scriptIndex}: ${funcName}`
        });
      }
    });

    // Look for admin/auth related functions
    const adminPatterns = /admin|root|superuser|moderator/gi;
    const authPatterns = /auth|login|logout|session/gi;

    [...functionMatches, ...varMatches, ...constMatches, ...letMatches].forEach(identifier => {
      const name = identifier.replace(/^(function|var|const|let)\s+/, '');
      if (adminPatterns.test(name)) {
        findings.push({
          type: 'admin',
          message: `[SCRIPT_IDENTIFIER] Admin-related identifier in script ${scriptIndex}: ${name}`
        });
      } else if (authPatterns.test(name)) {
        findings.push({
          type: 'auth',
          message: `[SCRIPT_IDENTIFIER] Auth-related identifier in script ${scriptIndex}: ${name}`
        });
      }
    });

    return { findings };
  }

  function calculateEntropy(str) {
    const len = str.length;
    const freq = {};

    for (let i = 0; i < len; i++) {
      const char = str[i];
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    for (const char in freq) {
      const p = freq[char] / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  function analyzeVulnChains(scriptAnalysis) {
    const chains = [];

    // XSS + API Call Chain
    const xssScripts = scriptAnalysis.filter(s =>
      s.vulnFindings.some(v => v.type === 'XSS')
    );
    const apiScripts = scriptAnalysis.filter(s =>
      s.apiFindings.length > 0
    );

    if (xssScripts.length > 0 && apiScripts.length > 0) {
      chains.push({
        severity: 'critical',
        description: `XSS-to-API Chain: XSS vulnerability in ${xssScripts.length} script(s) + API calls in ${apiScripts.length} script(s) = Potential for API abuse via XSS`,
        chainScore: 9,
        involvedScripts: [...xssScripts.map(s => s.index), ...apiScripts.map(s => s.index)]
      });
    }

    // Storage Injection + Sensitive Data Chain
    const storageScripts = scriptAnalysis.filter(s =>
      s.vulnFindings.some(v => v.type === 'Storage Injection')
    );
    const sensitiveScripts = scriptAnalysis.filter(s =>
      s.sensitiveFindings.length > 0
    );

    if (storageScripts.length > 0 && sensitiveScripts.length > 0) {
      chains.push({
        severity: 'high',
        description: `Storage-to-Sensitive Chain: Storage injection in ${storageScripts.length} script(s) + Sensitive data in ${sensitiveScripts.length} script(s) = Potential for data theft`,
        chainScore: 7,
        involvedScripts: [...storageScripts.map(s => s.index), ...sensitiveScripts.map(s => s.index)]
      });
    }

    // RCE + Admin Functions Chain
    const rceScripts = scriptAnalysis.filter(s =>
      s.vulnFindings.some(v => v.type === 'RCE')
    );
    const adminScripts = scriptAnalysis.filter(s =>
      s.content.includes('admin') || s.content.includes('root') || s.content.includes('superuser')
    );

    if (rceScripts.length > 0 && adminScripts.length > 0) {
      chains.push({
        severity: 'critical',
        description: `RCE-to-Admin Chain: Code execution in ${rceScripts.length} script(s) + Admin functions in ${adminScripts.length} script(s) = Potential for privilege escalation`,
        chainScore: 10,
        involvedScripts: [...rceScripts.map(s => s.index), ...adminScripts.map(s => s.index)]
      });
    }

    // PostMessage + Origin Validation Chain
    const postMessageScripts = scriptAnalysis.filter(s =>
      s.vulnFindings.some(v => v.type === 'PostMessage')
    );
    const originScripts = scriptAnalysis.filter(s =>
      s.content.includes('window.postMessage') || s.content.includes('message')
    );

    if (postMessageScripts.length > 0 && originScripts.length > 0) {
      chains.push({
        severity: 'high',
        description: `PostMessage Chain: Unsafe postMessage in ${postMessageScripts.length} script(s) + Message handling in ${originScripts.length} script(s) = Potential for cross-origin attacks`,
        chainScore: 8,
        involvedScripts: [...postMessageScripts.map(s => s.index), ...originScripts.map(s => s.index)]
      });
    }

    return chains;
  }

  function mapAttackVectors(scriptAnalysis) {
    const vectors = [];

    // Check for common attack vectors
    const hasXSS = scriptAnalysis.some(s => s.vulnFindings.some(v => v.type === 'XSS'));
    const hasAPI = scriptAnalysis.some(s => s.apiFindings.length > 0);
    const hasAuth = scriptAnalysis.some(s => s.content.includes('token') || s.content.includes('auth'));
    const hasStorage = scriptAnalysis.some(s => s.content.includes('localStorage') || s.content.includes('sessionStorage'));
    const hasExternalScripts = scriptAnalysis.some(s => s.source.includes('http'));

    if (hasXSS && hasAPI) {
      vectors.push({
        description: 'Stored XSS via API injection - Inject malicious scripts through API endpoints that render user content',
        difficulty: 6,
        impact: 8
      });
    }

    if (hasAuth && hasXSS) {
      vectors.push({
        description: 'Session hijacking via XSS - Steal authentication tokens/cookies through XSS',
        difficulty: 5,
        impact: 9
      });
    }

    if (hasStorage && hasXSS) {
      vectors.push({
        description: 'DOM-based XSS via storage - Manipulate stored data to trigger XSS in other contexts',
        difficulty: 7,
        impact: 7
      });
    }

    if (hasExternalScripts) {
      vectors.push({
        description: 'Supply chain attack - Compromise external script dependencies',
        difficulty: 8,
        impact: 9
      });
    }

    // Check for obfuscated script attack vectors
    const highlyObfuscated = scriptAnalysis.filter(s => s.obfuscationScore > 50);
    if (highlyObfuscated.length > 0) {
      vectors.push({
        description: `Obfuscated code analysis required - ${highlyObfuscated.length} scripts with high obfuscation may hide advanced attack vectors`,
        difficulty: 9,
        impact: 8
      });
    }

    return vectors;
  }

  function analyzeCodeFlow(scriptAnalysis) {
    const flows = [];

    // Analyze data flow between user input and sensitive operations
    scriptAnalysis.forEach(script => {
      const content = script.content;

      // Check for user input sources
      const userInputs = [
        /document\.getElementById\([^)]+\)\.value/g,
        /document\.querySelector\([^)]+\)\.value/g,
        /\$\([^)]+\)\.val\(\)/g,
        /location\.(?:search|hash|pathname)/g,
        /window\.location\./g,
        /localStorage\.getItem/g,
        /sessionStorage\.getItem/g,
      ];

      // Check for dangerous sinks
      const dangerousSinks = [
        /eval\s*\(/g,
        /innerHTML\s*\+?=/g,
        /outerHTML\s*\+?=/g,
        /document\.write/g,
        /setTimeout\s*\([^,)]*\+/g,
        /setInterval\s*\([^,)]*\+/g,
        /XMLHttpRequest.*open/g,
        /fetch\s*\(/g,
      ];

      let inputCount = 0;
      let sinkCount = 0;

      userInputs.forEach(pattern => {
        if (pattern.test(content)) inputCount++;
      });

      dangerousSinks.forEach(pattern => {
        if (pattern.test(content)) sinkCount++;
      });

      if (inputCount > 0 && sinkCount > 0) {
        const risk = (inputCount + sinkCount) > 4 ? 'high' : 'medium';
        flows.push({
          description: `Data flow risk in script ${script.index}: ${inputCount} input sources → ${sinkCount} dangerous sinks`,
          risk: risk
        });
      }

      // Check for authentication bypass patterns
      if (content.includes('token') || content.includes('auth')) {
        const authPatterns = [
          /if\s*\([^)]*token[^)]*\)/g,
          /if\s*\([^)]*auth[^)]*\)/g,
          /localStorage\.getItem\s*\(\s*['"`]token['"`]\s*\)/g,
        ];

        let authChecks = 0;
        authPatterns.forEach(pattern => {
          authChecks += (content.match(pattern) || []).length;
        });

        if (authChecks === 0 && (content.includes('admin') || content.includes('dashboard'))) {
          flows.push({
            description: `Potential authentication bypass in script ${script.index}: Admin functionality without auth checks`,
            risk: 'high'
          });
        }
      }
    });

    return flows;
  }

  function prioritizeVulnerabilities(scriptAnalysis) {
    const allVulns = [];

    scriptAnalysis.forEach(script => {
      script.vulnFindings.forEach(vuln => {
        // Calculate priority score based on multiple factors
        const baseScore = vuln.vulnScore || 5;
        const obfuscationMultiplier = script.obfuscationScore > 20 ? 1.5 : 1.0;
        const frequencyMultiplier = Math.min(vuln.occurrences / 3, 2.0);
        const typeMultiplier = {
          'RCE': 2.0,
          'XSS': 1.8,
          'Injection': 1.6,
          'Open Redirect': 1.4,
          'Storage Injection': 1.2,
          'PostMessage': 1.3,
          'Request Injection': 1.1
        }[vuln.type] || 1.0;

        const priorityScore = Math.min(baseScore * obfuscationMultiplier * frequencyMultiplier * typeMultiplier, 10);

        allVulns.push({
          scriptIndex: script.index,
          type: vuln.type,
          score: Math.round(priorityScore * 10) / 10,
          occurrences: vuln.occurrences,
          severity: vuln.severity,
          obfuscationLevel: script.obfuscationScore
        });
      });
    });

    // Sort by priority score (highest first)
    return allVulns.sort((a, b) => b.score - a.score);
  }

  // --- 3. ANALYZE ELEMENTS IN THE DOM ---
  console.log("🧮 Analyzing DOM elements...");
  const allElements = document.querySelectorAll("*");

  allElements.forEach((element) => {
    const identifier = getElementIdentifier(element);
    const propertiesToCheck = [
      element.id,
      element.name,
      element.className,
      element.type,
      element.tagName,
      element.value,
      // For forms, check action/method
      element.action,
      element.method,
    ].filter((p) => typeof p === "string");

    const combinedProps = propertiesToCheck.join(" ").toLowerCase();

    // Categorize based on properties with validation
    for (const [category, patterns] of Object.entries(riskPatterns)) {
      let matchCount = 0;
      let matchedPattern = null;
      for (const pattern of patterns) {
        if (pattern.test(combinedProps)) {
          matchCount++;
          matchedPattern = pattern;
        }
      }
      // For critical and high risk, require at least 2 matches or specific context
      if (category === 'criticalVulnerabilities' || category === 'highRiskAreas') {
        if (matchCount >= 2 || (matchCount === 1 && combinedProps.includes('admin') || combinedProps.includes('root'))) {
          priorities[category].add(
            `[ELEMENT] ${identifier} (${combinedProps.substring(0, 50)}...)`
          );
        }
      } else if (matchCount > 0) {
        priorities[category].add(
          `[ELEMENT] ${identifier} (${combinedProps.substring(0, 50)}...)`
        );
      }
    }

    // Check for Gatekeepers
    for (const pattern of gatekeeperIndicators) {
      if (pattern.test(combinedProps)) {
        priorities.potentialGatekeepers.add(
          `[ELEMENT] ${identifier} (${combinedProps.substring(0, 50)}...)`
        );
        break;
      }
    }

    // Check Forms for State-Changing Indicators
    if (element.tagName === "FORM" && element.method && element.action) {
      const method = element.method.toUpperCase();
      const action = element.action.toLowerCase();

      if (stateChangingIndicators.methods.includes(method)) {
        priorities.stateChanging.add(
          `[FORM_STATE_CHANGE] ${method} ${action} (via form ${identifier})`
        );
      } else {
        for (const keywordPattern of stateChangingIndicators.urlKeywords) {
          if (keywordPattern.test(action)) {
            priorities.stateChanging.add(
              `[FORM_STATE_CHANGE] ${method} ${action} (inferred from URL, via form ${identifier})`
            );
            break;
          }
        }
      }
    }
  });

  // --- 4. ANALYZE GLOBAL JAVASCRIPT PROPERTIES FOR ENDPOINTS/LOGIC ---
  console.log(
    "🌐 Scanning global JavaScript properties for endpoints/logic..."
  );
  try {
    const globalProps = {};
    const propsToSkip = new Set(['window', 'self', 'top', 'parent', 'frames', 'opener']);

    // Get all property names but filter out problematic ones
    const allProps = Object.getOwnPropertyNames(window).filter(prop => {
      // Skip known problematic properties
      if (propsToSkip.has(prop)) return false;
      // Skip properties that start with underscore (often internal)
      if (prop.startsWith('_')) return false;
      // Skip very long property names (likely generated)
      if (prop.length > 50) return false;
      return true;
    });

    allProps.forEach((prop) => {
      try {
        const value = window[prop];

        // Skip functions and the window object itself
        if (typeof value === "function" || value === window) {
          return;
        }

        // Skip DOM elements and complex objects that might cause issues
        if (value instanceof Element || value instanceof Node) {
          globalProps[prop] = `[DOM Element: ${value.tagName || 'Node'}]`;
          return;
        }

        // For primitive values, store directly
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          globalProps[prop] = value;
        } else if (value === null) {
          globalProps[prop] = null;
        } else if (Array.isArray(value)) {
          // For arrays, store length and first few elements
          globalProps[prop] = `[Array with ${value.length} elements: ${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}]`;
        } else if (typeof value === 'object') {
          // For objects, try to get basic info
          try {
            const keys = Object.keys(value);
            globalProps[prop] = `[Object with ${keys.length} properties: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}]`;
          } catch (e) {
            globalProps[prop] = `[Object: ${e.message}]`;
          }
        } else {
          globalProps[prop] = `[${typeof value}: ${String(value).substring(0, 50)}]`;
        }

      } catch (e) {
        // Handle cross-origin and other access errors gracefully
        if (e.message.includes('cross-origin') || e.message.includes('Blocked a frame') || e.message.includes('Permission denied')) {
          globalProps[prop] = `[Cross-origin blocked: ${prop}]`;
        } else if (e.message.includes('SecurityError') || e.message.includes('access')) {
          globalProps[prop] = `[Security restricted: ${prop}]`;
        } else {
          globalProps[prop] = `[Inaccessible: ${e.message}]`;
        }
      }
    });

    // Safe stringify to handle any remaining circular references
    function safeStringify(obj, indent = 2) {
      const seen = new WeakSet();
      const processed = new Set();

      return JSON.stringify(obj, (key, value) => {
        // Skip already processed keys to avoid infinite recursion
        if (processed.has(key)) {
          return "[Already processed]";
        }

        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular Reference]";
          }
          seen.add(value);
        }

        // For problematic values, return a safe representation
        if (typeof value === 'function') {
          return "[Function]";
        }

        if (value instanceof Error) {
          return `[Error: ${value.message}]`;
        }

        processed.add(key);
        return value;
      }, indent);
    }

    const globalPropsStr = safeStringify(globalProps, 2);

    // Check global properties string for URLs or risk keywords with validation
    for (const [category, patterns] of Object.entries(riskPatterns)) {
      let matchCount = 0;
      let matchedPatterns = [];
      // For auth, be specific to reduce noise
      if (category === "authentication") {
        const authUrls = globalPropsStr.match(
          /https?:\/\/[^\s"']*(auth|login|token|oauth)[^\s"']*/gi
        );
        if (authUrls) {
          authUrls.forEach((url) =>
            priorities[category].add(`[GLOBAL_PROP_URL] ${url}`)
          );
        }
      } else {
        for (const pattern of patterns) {
          if (pattern.test(globalPropsStr)) {
            matchCount++;
            matchedPatterns.push(pattern);
          }
        }
        // For critical and high risk, require multiple matches
        if (category === 'criticalVulnerabilities' || category === 'highRiskAreas') {
          if (matchCount >= 2) {
            priorities[category].add(
              `[GLOBAL_PROP_PATTERN] Multiple matches (${matchCount}) in global properties: ${matchedPatterns.map(p => p.toString()).join(', ')}`
            );
          }
        } else if (matchCount > 0) {
          priorities[category].add(
            `[GLOBAL_PROP_PATTERN] Matched pattern '${matchedPatterns[0]}' in global properties`
          );
        }
      }
    }

    // Check for state-changing keywords in global props
    stateChangingIndicators.urlKeywords.forEach((pattern) => {
      if (pattern.test(globalPropsStr)) {
        priorities.stateChanging.add(
          `[GLOBAL_PROP_STATE_URL] Found potential state-change URL pattern: ${pattern}`
        );
      }
    });
  } catch (e) {
    console.warn("Could not scan global properties:", e);
  }

  // --- 5. MONKEY-PATCH NETWORK REQUESTS TO ANALYZE THEM ---
  console.log("📡 Monkey-patching network requests for analysis...");
  const originalXHR = window.XMLHttpRequest;
  const originalFetch = window.fetch;

  // Patch XHR
  window.XMLHttpRequest = function () {
    const xhr = new originalXHR();
    const requestDetails = {
      method: null,
      url: null,
    };

    const originalOpen = xhr.open;
    xhr.open = function (method, url) {
      requestDetails.method = method;
      requestDetails.url = url ? url.toString() : "";
      return originalOpen.apply(this, arguments);
    };

    const originalSend = xhr.send;
    xhr.send = function () {
      analyzeRequest(requestDetails.method, requestDetails.url);
      return originalSend.apply(this, arguments);
    };

    return xhr;
  };

  // Patch Fetch
  window.fetch = function (input, init = {}) {
    const method = init.method || "GET";
    const url =
      typeof input === "string"
        ? input
        : input && input.url
        ? input.url.toString()
        : "[Unknown URL]";

    analyzeRequest(method, url);

    return originalFetch.apply(this, arguments);
  };

  function analyzeRequest(method, url) {
    const methodUpper = method.toUpperCase();
    const urlLower = url.toLowerCase();

    // --- Analyze Request for State Changes ---
    if (stateChangingIndicators.methods.includes(methodUpper)) {
      priorities.stateChanging.add(
        `[XHR/FETCH_STATE_CHANGE] ${methodUpper} ${urlLower}`
      );
    } else {
      for (const keywordPattern of stateChangingIndicators.urlKeywords) {
        if (keywordPattern.test(urlLower)) {
          priorities.stateChanging.add(
            `[XHR/FETCH_STATE_CHANGE] ${methodUpper} ${urlLower} (inferred from URL)`
          );
          break;
        }
      }
    }

    // --- Analyze Request URL against Risk Categories with validation ---
    for (const [category, patterns] of Object.entries(riskPatterns)) {
      let matchCount = 0;
      let matchedPatterns = [];
      if (category === "authentication") {
        if (
          urlLower.includes("/auth") ||
          urlLower.includes("/login") ||
          urlLower.includes("/token") ||
          urlLower.includes("/oauth")
        ) {
          for (const pattern of patterns) {
            if (pattern.test(urlLower)) {
              matchCount++;
              matchedPatterns.push(pattern);
            }
          }
          if (matchCount > 0) {
            priorities[category].add(
              `[REQUEST_URL] ${methodUpper} ${urlLower}`
            );
          }
        }
      } else {
        for (const pattern of patterns) {
          if (pattern.test(urlLower)) {
            matchCount++;
            matchedPatterns.push(pattern);
          }
        }
        // For critical and high risk, require multiple matches or specific context
        if (category === 'criticalVulnerabilities' || category === 'highRiskAreas') {
          if (matchCount >= 2 || (matchCount === 1 && (urlLower.includes('admin') || urlLower.includes('root')))) {
            priorities[category].add(
              `[REQUEST_URL] ${methodUpper} ${urlLower} (multiple indicators)`
            );
          }
        } else if (matchCount > 0) {
          priorities[category].add(
            `[REQUEST_URL] ${methodUpper} ${urlLower}`
          );
        }
      }
    }
  }

  // --- 6. UTILITY FOR IDENTIFYING ELEMENTS ---
  function getElementIdentifier(element) {
    if (element.id) return `#${element.id}`;
    let path = "";
    let current = element;
    while (current !== document.body && current.parentNode) {
      let tagName = current.tagName.toLowerCase();
      let siblings = Array.from(current.parentNode.children).filter(
        (sib) => sib.tagName === current.tagName
      );
      let index = siblings.indexOf(current) + 1;
      path = `${tagName}${
        siblings.length > 1 ? `:nth-of-type(${index})` : ""
      } > ${path}`;
      current = current.parentNode;
    }
    return `body > ${path.slice(0, -3)}`;
  }

  // --- 7. DYNAMIC ANALYSIS WITH MUTATION OBSERVER ---
  console.log("🔄 Setting up dynamic analysis for DOM changes...");
  let mutationObserver = null;

  function analyzeNewElements(mutations) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Analyze the new element and its children
          const elementsToAnalyze = [node, ...node.querySelectorAll("*")];
          elementsToAnalyze.forEach((element) => {
            const identifier = getElementIdentifier(element);
            const propertiesToCheck = [
              element.id,
              element.name,
              element.className,
              element.type,
              element.tagName,
              element.value,
              element.action,
              element.method,
            ].filter((p) => typeof p === "string");

            const combinedProps = propertiesToCheck.join(" ").toLowerCase();

            // Categorize new element
            for (const [category, patterns] of Object.entries(riskPatterns)) {
              let matchCount = 0;
              for (const pattern of patterns) {
                if (pattern.test(combinedProps)) {
                  matchCount++;
                }
              }
              if (category === 'criticalVulnerabilities' || category === 'highRiskAreas') {
                if (matchCount >= 2 || (matchCount === 1 && combinedProps.includes('admin'))) {
                  priorities[category].add(
                    `[DYNAMIC_ELEMENT] ${identifier} (${combinedProps.substring(0, 50)}...)`
                  );
                }
              } else if (matchCount > 0) {
                priorities[category].add(
                  `[DYNAMIC_ELEMENT] ${identifier} (${combinedProps.substring(0, 50)}...)`
                );
              }
            }

            // Check for Gatekeepers
            for (const pattern of gatekeeperIndicators) {
              if (pattern.test(combinedProps)) {
                priorities.potentialGatekeepers.add(
                  `[DYNAMIC_ELEMENT] ${identifier} (${combinedProps.substring(0, 50)}...)`
                );
                break;
              }
            }

            // Check Forms for State-Changing
            if (element.tagName === "FORM" && element.method && element.action) {
              const method = element.method.toUpperCase();
              const action = element.action.toLowerCase();
              if (stateChangingIndicators.methods.includes(method)) {
                priorities.stateChanging.add(
                  `[DYNAMIC_FORM_STATE_CHANGE] ${method} ${action} (via form ${identifier})`
                );
              }
            }
          });
        }
      });
    });
  }

  function startDynamicAnalysis() {
    if (mutationObserver) {
      mutationObserver.disconnect();
    }
    mutationObserver = new MutationObserver(analyzeNewElements);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'name', 'class', 'type', 'action', 'method']
    });
    console.log("✅ Dynamic analysis started. Monitoring DOM changes...");
  }

  function stopDynamicAnalysis() {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
      console.log("🛑 Dynamic analysis stopped.");
    }
  }

  // Start dynamic analysis by default
  startDynamicAnalysis();

  // --- 8. OUTPUT PRIORITIZED FINDINGS ---
  console.log("✅ Prioritization complete. Review high-risk areas below:");

  function displayCategory(categoryName, displayName, description) {
    const items = [...priorities[categoryName]];
    if (items.length > 0) {
      console.group(`🚩 ${displayName.toUpperCase()} (${items.length})`);
      console.log(description);
      items.forEach((item) => console.warn(`- ${item}`));
      console.groupEnd();
    } else {
      console.log(`✅ No ${displayName} points explicitly identified.`);
    }
  }

  displayCategory(
    "authentication",
    "Authentication/Session",
    "High impact if bypassed. Look for flaws in login, 2FA, token handling."
  );
  displayCategory(
    "accessControl",
    "Access Control",
    "Critical for protecting user data. Test for IDOR, privilege escalation."
  );
  displayCategory(
    "dataInput",
    "Data Input & Rendering",
    "Primary targets for XSS, injection, file upload vulnerabilities."
  );
  displayCategory(
    "businessTransactions",
    "Business Transactions",
    "High business impact. Check for payment logic flaws, race conditions."
  );
  displayCategory(
    "stateChanging",
    "State-Changing Functions",
    "Functions that modify server data. Prime targets for CSRF, parameter tampering."
  );
  displayCategory(
    "potentialGatekeepers",
    "Potential Gatekeepers",
    "Elements that protect other functionality. Bypassing these is key."
  );
  displayCategory(
    "criticalVulnerabilities",
    "Critical Vulnerabilities (P1)",
    "Highest priority: RCE, admin bypass, deserialization. Immediate attention required."
  );
  displayCategory(
    "highRiskAreas",
    "High Risk Areas (P2)",
    "High priority: IDOR, XSS, injection flaws. Significant security impact."
  );

  // Display additional analysis results
  console.log("\n🔗 === ADVANCED ANALYSIS RESULTS ===");

  // Display vulnerability chains
  const vulnChains = analyzeVulnChains(window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis || []);
  if (vulnChains.length > 0) {
    console.group("🔗 VULNERABILITY CHAINS");
    vulnChains.forEach(chain => {
      console.warn(`⚠️  ${chain.description} (Score: ${chain.chainScore}/10)`);
    });
    console.groupEnd();
  }

  // Display attack vectors
  const attackVectors = mapAttackVectors(window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis || []);
  if (attackVectors.length > 0) {
    console.group("🎯 ATTACK VECTORS");
    attackVectors.forEach(vector => {
      console.warn(`🎯 ${vector.description} (Difficulty: ${vector.difficulty}/10, Impact: ${vector.impact}/10)`);
    });
    console.groupEnd();
  }

  // Display code flow analysis
  const codeFlows = analyzeCodeFlow(window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis || []);
  if (codeFlows.length > 0) {
    console.group("🔄 CODE FLOW ANALYSIS");
    codeFlows.forEach(flow => {
      console.warn(`🔄 ${flow.description} (Risk: ${flow.risk.toUpperCase()})`);
    });
    console.groupEnd();
  }

  // Display prioritization results
  const prioritizedVulns = prioritizeVulnerabilities(window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis || []);
  if (prioritizedVulns.length > 0) {
    console.group("📊 TOP PRIORITY VULNERABILITIES");
    prioritizedVulns.slice(0, 10).forEach((vuln, index) => {
      const priority = index < 3 ? 'TOP' : index < 6 ? 'HIGH' : 'MEDIUM';
      console.warn(`🔥 ${priority}: Script ${vuln.scriptIndex} - ${vuln.type} (${vuln.score}/10)`);
    });
    console.groupEnd();
  }

  // Display CORS and external script information
  const externalScripts = window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis?.filter(s => s.source.includes('http')) || [];
  const corsBlockedScripts = window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis?.filter(s =>
    s.source.includes('CORS') || s.source.includes('cross-origin') || s.source.includes('blocked')
  ) || [];

  if (externalScripts.length > 0) {
    console.log("\n🔒 === EXTERNAL SCRIPTS ANALYSIS ===");
    console.log(`🌐 Total external scripts: ${externalScripts.length}`);
    console.log(`✅ Successfully analyzed: ${externalScripts.length - corsBlockedScripts.length}`);
    console.log(`❌ CORS blocked: ${corsBlockedScripts.length}`);

    if (corsBlockedScripts.length > 0) {
      console.log("\n🚨 CORS-BLOCKED SCRIPTS (Still valuable for analysis):");
      corsBlockedScripts.forEach(script => {
        const domain = script.source.match(/https?:\/\/([^\/]+)/)?.[1] || 'unknown';
        console.log(`  • ${domain} - Potential attack vector identified`);
      });

      console.log("\n💡 CORS WORKAROUNDS:");
      console.log("  1. Run this tool directly on the target domain for complete analysis");
      console.log("  2. Use browser dev tools to manually inspect external scripts");
      console.log("  3. Check script integrity attributes for supply chain attacks");
      console.log("  4. Monitor network tab for suspicious script loading patterns");
    }

    console.log("\n🔍 INLINE SCRIPTS ANALYZED:");
    const inlineScripts = window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis?.filter(s => s.source.includes('Inline')) || [];
    console.log(`  📝 ${inlineScripts.length} inline scripts fully analyzed`);
  }

  // Display export options
  console.log("\n💾 === EXPORT OPTIONS ===");
  console.log("📊 Display as table: StandaloneAttackSurfacePrioritizer.displayTable()");
  console.log("💾 Export as JSON: StandaloneAttackSurfacePrioritizer.exportAsJSON()");
  console.log("📄 Export as CSV: StandaloneAttackSurfacePrioritizer.exportAsCSV()");
  console.log("📋 Export as XML: StandaloneAttackSurfacePrioritizer.exportAsXML()");
  console.log("📈 Get statistics: StandaloneAttackSurfacePrioritizer.getStatistics()");

  console.groupEnd(); // End main group

  // Return findings object for programmatic access
  const findingsSummary = {
    authentication: [...priorities.authentication],
    accessControl: [...priorities.accessControl],
    dataInput: [...priorities.dataInput],
    businessTransactions: [...priorities.businessTransactions],
    stateChanging: [...priorities.stateChanging],
    potentialGatekeepers: [...priorities.potentialGatekeepers],
    criticalVulnerabilities: [...priorities.criticalVulnerabilities],
    highRiskAreas: [...priorities.highRiskAreas],
  };

  console.log("📄 Summary Object:", findingsSummary);

  // === EXPORT AND DISPLAY FUNCTIONS ===

  // Function to display findings in a table format
  function displayFindingsTable() {
    console.log("📊 Generating findings table...");

    // Create table data
    const tableData = [];
    Object.entries(findingsSummary).forEach(([category, findings]) => {
      findings.forEach(finding => {
        tableData.push({
          category: category,
          finding: finding,
          severity: getSeverityFromFinding(finding),
          timestamp: new Date().toISOString()
        });
      });
    });

    // Display as table
    console.table(tableData, ['category', 'severity', 'finding']);

    // Also show summary statistics
    const stats = {
      totalFindings: tableData.length,
      criticalCount: tableData.filter(f => f.severity === 'critical').length,
      highCount: tableData.filter(f => f.severity === 'high').length,
      mediumCount: tableData.filter(f => f.severity === 'medium').length,
      lowCount: tableData.filter(f => f.severity === 'low').length
    };

    console.log("📈 Findings Statistics:", stats);
    return tableData;
  }

  // Function to export findings as JSON
  function exportAsJSON() {
    const exportData = {
      scanMetadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        totalScripts: document.querySelectorAll('script').length
      },
      findings: findingsSummary,
      scriptAnalysis: window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis || [],
      statistics: generateStatistics()
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    downloadFile(jsonString, 'attack-surface-findings.json', 'application/json');
    console.log("💾 Findings exported as JSON");
    return jsonString;
  }

  // Function to export findings as CSV
  function exportAsCSV() {
    const csvData = [];

    // Add headers
    csvData.push(['Category', 'Severity', 'Finding', 'Timestamp']);

    // Add data
    Object.entries(findingsSummary).forEach(([category, findings]) => {
      findings.forEach(finding => {
        csvData.push([
          category,
          getSeverityFromFinding(finding),
          finding.replace(/[\n\r]/g, ' ').replace(/"/g, '""'), // Escape quotes and remove newlines
          new Date().toISOString()
        ]);
      });
    });

    const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    downloadFile(csvString, 'attack-surface-findings.csv', 'text/csv');
    console.log("💾 Findings exported as CSV");
    return csvString;
  }

  // Function to export findings as XML
  function exportAsXML() {
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlString += '<attackSurfaceScan>\n';
    xmlString += `  <metadata>\n`;
    xmlString += `    <timestamp>${new Date().toISOString()}</timestamp>\n`;
    xmlString += `    <url>${window.location.href}</url>\n`;
    xmlString += `    <userAgent>${navigator.userAgent}</userAgent>\n`;
    xmlString += `    <totalScripts>${document.querySelectorAll('script').length}</totalScripts>\n`;
    xmlString += `  </metadata>\n`;

    Object.entries(findingsSummary).forEach(([category, findings]) => {
      xmlString += `  <category name="${category}">\n`;
      findings.forEach((finding, index) => {
        const severity = getSeverityFromFinding(finding);
        const escapedFinding = finding.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
        xmlString += `    <finding index="${index}" severity="${severity}">\n`;
        xmlString += `      <content>${escapedFinding}</content>\n`;
        xmlString += `    </finding>\n`;
      });
      xmlString += `  </category>\n`;
    });

    xmlString += '</attackSurfaceScan>\n';
    downloadFile(xmlString, 'attack-surface-findings.xml', 'application/xml');
    console.log("💾 Findings exported as XML");
    return xmlString;
  }

  // Helper function to determine severity from finding text
  function getSeverityFromFinding(finding) {
    if (finding.includes('[SCRIPT_VULN]') && finding.includes('RCE')) return 'critical';
    if (finding.includes('[SCRIPT_VULN]') && finding.includes('XSS')) return 'high';
    if (finding.includes('[SCRIPT_VULN]') && finding.includes('Injection')) return 'high';
    if (finding.includes('[PRIORITY_TOP]')) return 'critical';
    if (finding.includes('[PRIORITY_HIGH]')) return 'high';
    if (finding.includes('[PRIORITY_MEDIUM]')) return 'medium';
    if (finding.includes('CRITICAL') || finding.includes('P1')) return 'critical';
    if (finding.includes('HIGH') || finding.includes('P2')) return 'high';
    return 'medium';
  }

  // Helper function to generate statistics
  function generateStatistics() {
    const stats = {
      totalFindings: 0,
      categoryBreakdown: {},
      severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
      scriptAnalysis: {
        totalScripts: window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis?.length || 0,
        scriptsWithVulns: 0,
        totalVulnCount: 0
      }
    };

    Object.entries(findingsSummary).forEach(([category, findings]) => {
      stats.categoryBreakdown[category] = findings.length;
      stats.totalFindings += findings.length;

      findings.forEach(finding => {
        const severity = getSeverityFromFinding(finding);
        stats.severityBreakdown[severity]++;
      });
    });

    // Script analysis stats
    if (window.StandaloneAttackSurfacePrioritizer?.scriptAnalysis) {
      window.StandaloneAttackSurfacePrioritizer.scriptAnalysis.forEach(script => {
        if (script.vulnCount > 0) {
          stats.scriptAnalysis.scriptsWithVulns++;
          stats.scriptAnalysis.totalVulnCount += script.vulnCount;
        }
      });
    }

    return stats;
  }

  // Helper function to download files
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  // Make it easily accessible globally
  window.StandaloneAttackSurfacePrioritizer = {
    findings: findingsSummary,
    // Function to re-analyze (rescans DOM and globals)
    reAnalyze: function () {
      console.log("🔄 Re-running standalone attack surface prioritization...");
      standalonePrioritizeAttackSurface();
    },
    // Function to restore original network functions if needed
    restoreNetwork: function () {
      if (window.XMLHttpRequest === this._patchedXHR) {
        window.XMLHttpRequest = originalXHR;
      }
      if (window.fetch === this._patchedFetch) {
        window.fetch = originalFetch;
      }
      console.log("🔄 Original network functions restored.");
    },
    // Dynamic analysis controls
    startDynamicAnalysis: startDynamicAnalysis,
    stopDynamicAnalysis: stopDynamicAnalysis,
    // Export functions
    exportAsJSON: exportAsJSON,
    exportAsCSV: exportAsCSV,
    exportAsXML: exportAsXML,
    // Display functions
    displayTable: displayFindingsTable,
    // Get statistics
    getStatistics: generateStatistics,
  };
  // Store references for potential restoration
  window.StandaloneAttackSurfacePrioritizer._patchedXHR = window.XMLHttpRequest;
  window.StandaloneAttackSurfacePrioritizer._patchedFetch = window.fetch;

  return findingsSummary;
})();
