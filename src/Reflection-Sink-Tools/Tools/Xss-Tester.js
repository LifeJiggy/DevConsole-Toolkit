// ===========================================
// 🔍 XSS REFLECTION VULNERABILITY TESTER
// ===========================================
// Expert Security Testing Tool
// Tests interactive elements for DOM-based XSS sinks
// ===========================================

(function () {
  "use strict";

  // Global storage for reflection test results
  window.xssReflectionTester = {
    results: {},
    testPayloads: [],
    sinkElements: [],
    vulnerableElements: [],
  };

  // Console styling
  const styles = {
    banner:
      "background: linear-gradient(45deg, #e74c3c, #f39c12); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 8px;",
    title: "color: #e74c3c; font-size: 18px; font-weight: bold;",
    success:
      "color: #27ae60; font-weight: bold; background: rgba(39, 174, 96, 0.1); padding: 5px; border-radius: 4px;",
    warning:
      "color: #f39c12; font-weight: bold; background: rgba(243, 156, 18, 0.1); padding: 5px; border-radius: 4px;",
    error:
      "color: #e74c3c; font-weight: bold; background: rgba(231, 76, 60, 0.1); padding: 5px; border-radius: 4px;",
    info: "color: #3498db; font-weight: bold; background: rgba(52, 152, 219, 0.1); padding: 5px; border-radius: 4px;",
    vulnerable:
      "color: #fff; background: #e74c3c; padding: 8px 12px; border-radius: 4px; font-weight: bold;",
    safe: "color: #fff; background: #27ae60; padding: 8px 12px; border-radius: 4px; font-weight: bold;",
  };

  // ===========================================
  // 🎯 XSS TEST PAYLOADS
  // ===========================================

  const xssTestPayloads = {
    // DOM-based XSS payloads
    basic: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<iframe src="javascript:alert(`XSS`)"></iframe>',
      '<body onload=alert("XSS")>',
      '<div onmouseover="alert(`XSS`)">test</div>',
      '<input onfocus=alert("XSS") autofocus>',
    ],

    // Event handler payloads
    eventBased: [
      'onload="alert(`XSS`)"',
      'onerror="alert(`XSS`)"',
      'onclick="alert(`XSS`)"',
      'onmouseover="alert(`XSS`)"',
      'onfocus="alert(`XSS`)"',
      'onblur="alert(`XSS`)"',
      'onchange="alert(`XSS`)"',
      'onsubmit="alert(`XSS`)"',
    ],

    // Advanced payloads
    advanced: [
      '<script>document.body.innerHTML="<h1>XSS</h1>"</script>',
      '<img src="x" onerror="document.location=`javascript:alert(document.domain)`">',
      "<svg><script>alert(document.cookie)</script></svg>",
      '<iframe srcdoc="<script>alert(`XSS`)</script>"></iframe>',
      '<object data="javascript:alert(`XSS`)">',
      '<embed src="javascript:alert(`XSS`)">',
      '<form><math><mtext></form><form><mglyph><svg><mtext><textarea><path id="</textarea><img onerror=alert(`XSS`) src=x>">',
      '<details open ontoggle="alert(`XSS`)">',
      '<marquee onstart="alert(`XSS`)">XSS</marquee>',
      '<video><source onerror="alert(`XSS`)">',
    ],

    // Filter bypass payloads
    bypass: [
      "<ScRiPt>alert(`XSS`)</ScRiPt>",
      "<IMG SRC=javascript:alert(`XSS`)>",
      "<svg/onload=alert(`XSS`)>",
      "<iframe src=j&Tab;avascript:alert(`XSS`)>",
      '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">',
      '<img src="x" onerror="eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))">',
      '<img src="x" onerror="window[`al`+`ert`](`XSS`)">',
      "<svg><animate onbegin=alert(`XSS`)>",
      '<input type="image" src="x" onerror="alert(`XSS`)">',
      "<isindex formaction=javascript:alert(`XSS`) type=submit>",
    ],
  };

  // ===========================================
  // 🎯 DOM SINK DETECTION
  // ===========================================

  const domSinks = {
    // High-risk sinks
    highRisk: [
      "innerHTML",
      "outerHTML",
      "insertAdjacentHTML",
      "document.write",
      "document.writeln",
      "eval",
      "setTimeout",
      "setInterval",
      "Function",
      "location.href",
      "location.assign",
      "location.replace",
    ],

    // Medium-risk sinks
    mediumRisk: [
      "textContent",
      "innerText",
      "value",
      "src",
      "href",
      "action",
      "formaction",
      "background",
      "cite",
      "codebase",
      "data",
      "poster",
    ],

    // Attribute sinks
    attributes: [
      "onclick",
      "onload",
      "onerror",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
      "onkeyup",
      "onkeydown",
      "ondblclick",
      "onmousedown",
      "onmouseup",
    ],

    // URL-based sinks
    urlSinks: [
      "location.search",
      "location.hash",
      "document.referrer",
      "document.URL",
      "document.documentURI",
      "window.name",
    ],
  };

  // ===========================================
  // 🔍 ELEMENT REFLECTION CHECKER
  // ===========================================

  function checkElementReflection(elements, testType = "comprehensive") {
    console.log("%c🔍 XSS REFLECTION VULNERABILITY TESTER", styles.banner);
    console.log(
      "%c🎯 Testing interactive elements for DOM-based XSS vulnerabilities...",
      styles.info
    );

    if (!elements || elements.length === 0) {
      console.log("%c❌ No elements provided for testing!", styles.error);
      return { error: "No elements provided" };
    }

    const testResults = {
      totalElements: elements.length,
      vulnerableElements: [],
      safeElements: [],
      potentialSinks: [],
      testPayloads: [],
      summary: {},
    };

    console.log(`%c📊 Testing ${elements.length} elements...`, styles.info);

    elements.forEach((element, index) => {
      try {
        console.log(
          `%c🔍 Testing element ${index + 1}/${elements.length}...`,
          styles.info
        );

        const elementTest = testSingleElement(element, testType);

        if (elementTest.isVulnerable) {
          testResults.vulnerableElements.push(elementTest);
          console.log(
            `%c⚠️ VULNERABLE: ${elementTest.elementInfo.tag}#${elementTest.elementInfo.id}`,
            styles.vulnerable
          );
        } else {
          testResults.safeElements.push(elementTest);
          console.log(
            `%c✅ SAFE: ${elementTest.elementInfo.tag}#${elementTest.elementInfo.id}`,
            styles.safe
          );
        }
      } catch (error) {
        console.log(
          `%c❌ Error testing element ${index + 1}:`,
          styles.error,
          error
        );
        testResults.safeElements.push({
          elementInfo: { tag: "unknown", id: "unknown" },
          error: error.message,
          isVulnerable: false,
        });
      }
    });

    // Generate summary
    testResults.summary = {
      vulnerableCount: testResults.vulnerableElements.length,
      safeCount: testResults.safeElements.length,
      riskLevel: testResults.vulnerableElements.length > 0 ? "HIGH" : "LOW",
      completionTime: new Date().toISOString(),
    };

    // Display results
    displayResults(testResults);

    // Store results globally
    window.xssReflectionTester.results = testResults;

    return testResults;
  }

  // ===========================================
  // 🎯 SINGLE ELEMENT TESTER
  // ===========================================

  function testSingleElement(element, testType) {
    const elementInfo = extractElementInfo(element);
    const testResult = {
      elementInfo: elementInfo,
      vulnerabilities: [],
      sinkTests: [],
      payloadTests: [],
      isVulnerable: false,
      riskLevel: "LOW",
    };

    // Test for DOM sinks
    const sinkResults = checkDOMSinks(element);
    testResult.sinkTests = sinkResults;

    // Test reflection with payloads
    const payloadResults = testReflectionPayloads(element, testType);
    testResult.payloadTests = payloadResults;

    // Check for existing vulnerabilities
    const vulnerabilityCheck = checkExistingVulnerabilities(element);
    testResult.vulnerabilities = vulnerabilityCheck;

    // Determine if element is vulnerable
    testResult.isVulnerable =
      sinkResults.some((sink) => sink.isHighRisk) ||
      payloadResults.some((payload) => payload.reflected) ||
      vulnerabilityCheck.length > 0;

    if (testResult.isVulnerable) {
      testResult.riskLevel = sinkResults.some((sink) => sink.isHighRisk)
        ? "HIGH"
        : "MEDIUM";
    }

    return testResult;
  }

  // ===========================================
  // 🔍 DOM SINK CHECKER
  // ===========================================

  function checkDOMSinks(element) {
    const sinkResults = [];

    try {
      // Check element properties for sinks
      const allSinks = [
        ...domSinks.highRisk,
        ...domSinks.mediumRisk,
        ...domSinks.attributes,
      ];

      allSinks.forEach((sinkName) => {
        try {
          // Check if element has this property/method
          if (
            element.hasOwnProperty(sinkName) ||
            typeof element[sinkName] !== "undefined"
          ) {
            sinkResults.push({
              sink: sinkName,
              present: true,
              isHighRisk: domSinks.highRisk.includes(sinkName),
              isMediumRisk: domSinks.mediumRisk.includes(sinkName),
              isAttribute: domSinks.attributes.includes(sinkName),
              currentValue:
                typeof element[sinkName] === "function"
                  ? "[Function]"
                  : String(element[sinkName]).substring(0, 100),
            });
          }
        } catch (e) {
          // Property not accessible
        }
      });

      // Check for dangerous attributes
      if (element.attributes) {
        Array.from(element.attributes).forEach((attr) => {
          if (domSinks.attributes.includes(attr.name) && attr.value) {
            sinkResults.push({
              sink: attr.name,
              present: true,
              isHighRisk: false,
              isMediumRisk: false,
              isAttribute: true,
              currentValue: attr.value.substring(0, 100),
              attributeValue: attr.value,
            });
          }
        });
      }
    } catch (error) {
      console.log("%cError checking sinks:", styles.warning, error);
    }

    return sinkResults;
  }

  // ===========================================
  // 💉 PAYLOAD REFLECTION TESTER
  // ===========================================

  function testReflectionPayloads(element, testType) {
    const payloadResults = [];
    let payloadsToTest = [];

    // Select payloads based on test type
    switch (testType) {
      case "basic":
        payloadsToTest = xssTestPayloads.basic;
        break;
      case "advanced":
        payloadsToTest = [
          ...xssTestPayloads.basic,
          ...xssTestPayloads.advanced,
        ];
        break;
      case "comprehensive":
        payloadsToTest = [
          ...xssTestPayloads.basic,
          ...xssTestPayloads.eventBased,
          ...xssTestPayloads.advanced,
          ...xssTestPayloads.bypass.slice(0, 5), // Limit bypass payloads
        ];
        break;
      default:
        payloadsToTest = xssTestPayloads.basic;
    }

    payloadsToTest.forEach((payload) => {
      try {
        const testResult = testPayloadReflection(element, payload);
        payloadResults.push(testResult);

        if (testResult.reflected) {
          console.log(`%c🚨 REFLECTION DETECTED:`, styles.warning, {
            element: element.tagName,
            payload: payload.substring(0, 50),
            location: testResult.reflectionLocation,
          });
        }
      } catch (error) {
        payloadResults.push({
          payload: payload,
          reflected: false,
          error: error.message,
          testMethod: "error",
        });
      }
    });

    return payloadResults;
  }

  // ===========================================
  // 🧪 SINGLE PAYLOAD TESTER
  // ===========================================

  function testPayloadReflection(element, payload) {
    const testResult = {
      payload: payload,
      reflected: false,
      reflectionLocation: [],
      testMethods: [],
      sanitized: false,
      bypassAttempt: false,
    };

    // Test different injection points
    const testMethods = [
      () => testValueReflection(element, payload),
      () => testInnerHTMLReflection(element, payload),
      () => testAttributeReflection(element, payload),
      () => testTextContentReflection(element, payload),
    ];

    testMethods.forEach((testMethod, index) => {
      try {
        const result = testMethod();
        testResult.testMethods.push(result);

        if (result.reflected) {
          testResult.reflected = true;
          testResult.reflectionLocation.push(result.location);
        }
      } catch (error) {
        testResult.testMethods.push({
          method: `test_${index}`,
          reflected: false,
          error: error.message,
        });
      }
    });

    return testResult;
  }

  // ===========================================
  // 🔍 REFLECTION TEST METHODS
  // ===========================================

  function testValueReflection(element, payload) {
    const originalValue = element.value || "";
    const testResult = { method: "value", reflected: false, location: "value" };

    try {
      // Temporarily set value to test payload
      if (element.value !== undefined) {
        element.value = payload;

        // Check if payload appears in DOM
        if (element.value === payload) {
          testResult.reflected = true;
          testResult.details = "Payload reflected in element.value";
        }

        // Restore original value
        element.value = originalValue;
      }
    } catch (error) {
      testResult.error = error.message;
    }

    return testResult;
  }

  function testInnerHTMLReflection(element, payload) {
    const testResult = {
      method: "innerHTML",
      reflected: false,
      location: "innerHTML",
    };

    try {
      // Create a test container to safely test innerHTML
      const testContainer = document.createElement("div");
      testContainer.innerHTML = payload;

      // Check if payload creates executable content
      const scripts = testContainer.querySelectorAll("script");
      const eventHandlers = testContainer.querySelectorAll(
        "[onclick],[onload],[onerror]"
      );

      if (scripts.length > 0 || eventHandlers.length > 0) {
        testResult.reflected = true;
        testResult.details = `Payload creates ${scripts.length} scripts and ${eventHandlers.length} event handlers`;
      }

      // Clean up
      testContainer.remove();
    } catch (error) {
      testResult.error = error.message;
    }

    return testResult;
  }

  function testAttributeReflection(element, payload) {
    const testResult = {
      method: "attributes",
      reflected: false,
      location: "attributes",
    };

    try {
      // Test common vulnerable attributes
      const vulnerableAttrs = ["onclick", "onload", "onerror", "src", "href"];

      vulnerableAttrs.forEach((attr) => {
        if (element.hasAttribute(attr)) {
          const originalValue = element.getAttribute(attr);

          // Test if we can inject payload
          const testValue = originalValue + payload;

          // Check for dangerous patterns
          if (
            testValue.includes("javascript:") ||
            testValue.includes("alert(") ||
            testValue.includes("eval(")
          ) {
            testResult.reflected = true;
            testResult.details = `Vulnerable attribute: ${attr}`;
            testResult.location = attr;
          }
        }
      });
    } catch (error) {
      testResult.error = error.message;
    }

    return testResult;
  }

  function testTextContentReflection(element, payload) {
    const originalText = element.textContent || "";
    const testResult = {
      method: "textContent",
      reflected: false,
      location: "textContent",
    };

    try {
      // Check if element reflects user input in textContent
      if (element.textContent !== undefined) {
        // Look for patterns that suggest user input reflection
        const userInputPatterns = [
          /\{\{.*\}\}/, // Template patterns
          /\$\{.*\}/, // Template literals
          /%[A-Za-z]/, // URL encoding
          /&[a-z]+;/, // HTML entities
        ];

        const hasUserInput = userInputPatterns.some((pattern) =>
          pattern.test(originalText)
        );

        if (hasUserInput) {
          testResult.reflected = true;
          testResult.details = "Element appears to reflect user input";
        }
      }
    } catch (error) {
      testResult.error = error.message;
    }

    return testResult;
  }

  // ===========================================
  // 🚨 EXISTING VULNERABILITY CHECKER
  // ===========================================

  function checkExistingVulnerabilities(element) {
    const vulnerabilities = [];

    try {
      // Check for dangerous inline event handlers
      const dangerousPatterns = [
        /javascript:/i,
        /eval\(/i,
        /alert\(/i,
        /confirm\(/i,
        /prompt\(/i,
        /document\.write/i,
        /innerHTML/i,
        /location\./i,
        /window\./i,
      ];

      // Check attributes
      if (element.attributes) {
        Array.from(element.attributes).forEach((attr) => {
          dangerousPatterns.forEach((pattern) => {
            if (pattern.test(attr.value)) {
              vulnerabilities.push({
                type: "dangerous_attribute",
                attribute: attr.name,
                value: attr.value.substring(0, 100),
                pattern: pattern.source,
                riskLevel: "HIGH",
              });
            }
          });
        });
      }

      // Check for dangerous URLs
      if (element.src || element.href || element.action) {
        const url = element.src || element.href || element.action;

        if (url.startsWith("javascript:")) {
          vulnerabilities.push({
            type: "javascript_url",
            property: element.src ? "src" : element.href ? "href" : "action",
            value: url.substring(0, 100),
            riskLevel: "HIGH",
          });
        }
      }

      // Check for data attributes with dangerous content
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-") && attr.value) {
          dangerousPatterns.forEach((pattern) => {
            if (pattern.test(attr.value)) {
              vulnerabilities.push({
                type: "dangerous_data_attribute",
                attribute: attr.name,
                value: attr.value.substring(0, 100),
                pattern: pattern.source,
                riskLevel: "MEDIUM",
              });
            }
          });
        }
      });
    } catch (error) {
      console.log(
        "%cError checking existing vulnerabilities:",
        styles.warning,
        error
      );
    }

    return vulnerabilities;
  }

  // ===========================================
  // 📊 RESULTS DISPLAY
  // ===========================================

  function displayResults(testResults) {
    console.log("\n%c📊 XSS REFLECTION TEST RESULTS", styles.banner);
    console.log(
      "%c════════════════════════════════════════",
      "color: #3498db; font-weight: bold;"
    );

    // Summary
    console.log("\n%c📋 SUMMARY:", styles.info);
    console.table(testResults.summary);

    if (testResults.vulnerableElements.length > 0) {
      console.log(
        `\n%c⚠️ VULNERABLE ELEMENTS (${testResults.vulnerableElements.length}):`,
        styles.error
      );

      testResults.vulnerableElements.forEach((vulnElement, index) => {
        console.log(
          `\n%c🚨 Vulnerable Element #${index + 1}:`,
          styles.vulnerable
        );
        console.log(`%cTag: ${vulnElement.elementInfo.tag}`, styles.warning);
        console.log(`%cID: ${vulnElement.elementInfo.id}`, styles.warning);
        console.log(`%cRisk Level: ${vulnElement.riskLevel}`, styles.warning);

        if (vulnElement.vulnerabilities.length > 0) {
          console.log("%cExisting Vulnerabilities:", styles.error);
          console.table(vulnElement.vulnerabilities);
        }

        if (vulnElement.sinkTests.some((sink) => sink.isHighRisk)) {
          console.log("%cHigh-Risk DOM Sinks Found:", styles.error);
          console.table(
            vulnElement.sinkTests.filter((sink) => sink.isHighRisk)
          );
        }

        const reflectedPayloads = vulnElement.payloadTests.filter(
          (test) => test.reflected
        );
        if (reflectedPayloads.length > 0) {
          console.log(
            `%cReflected Payloads (${reflectedPayloads.length}):`,
            styles.warning
          );
          reflectedPayloads.forEach((payload) => {
            console.log(
              `  %c• ${payload.payload.substring(0, 50)}...`,
              "color: #e67e22;"
            );
          });
        }
      });
    } else {
      console.log(`\n%c✅ NO VULNERABILITIES DETECTED`, styles.success);
      console.log(
        `%c🛡️ All ${testResults.totalElements} elements appear safe`,
        styles.success
      );
    }

    console.log(
      "\n%c════════════════════════════════════════",
      "color: #3498db; font-weight: bold;"
    );
    console.log(
      "%c💾 Results stored in window.xssReflectionTester.results",
      styles.info
    );
  }

  // ===========================================
  // 🛠️ UTILITY FUNCTIONS
  // ===========================================

  function extractElementInfo(element) {
    return {
      tag: element.tagName || "Unknown",
      id: element.id || "no-id",
      className: element.className || "no-class",
      type: element.type || "N/A",
      name: element.name || "N/A",
      value: element.value ? element.value.substring(0, 50) + "..." : "N/A",
      src: element.src || "N/A",
      href: element.href || "N/A",
      action: element.action || "N/A",
      xpath: getXPath(element),
    };
  }

  function getXPath(element) {
    if (element.id !== "") {
      return 'id("' + element.id + '")';
    }
    if (element === document.body) {
      return element.tagName;
    }
    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element) {
        return (
          getXPath(element.parentNode) +
          "/" +
          element.tagName +
          "[" +
          (ix + 1) +
          "]"
        );
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }

  // ===========================================
  // 🚀 INTEGRATION WITH WEB ANALYSIS TOOLKIT
  // ===========================================

  function testInteractiveElements(testType = "comprehensive") {
    console.log("%c🔗 Integrating with Web Analysis Toolkit...", styles.info);

    // Get interactive elements from the main toolkit
    if (
      window.webAnalysisToolkit &&
      window.webAnalysisToolkit.results &&
      window.webAnalysisToolkit.results.interactiveHighlighting
    ) {
      const interactiveElements =
        window.webAnalysisToolkit.results.interactiveHighlighting.elements;
      console.log(
        `%c✅ Found ${interactiveElements.length} interactive elements from toolkit`,
        styles.success
      );

      // Extract actual DOM elements
      const domElements = interactiveElements
        .map((item) => item.element)
        .filter((el) => el);

      return checkElementReflection(domElements, testType);
    } else {
      console.log(
        "%c⚠️ Web Analysis Toolkit results not found. Scanning page manually...",
        styles.warning
      );

      // Fallback: scan page for interactive elements
      const interactiveSelectors = [
        "input",
        "button",
        "select",
        "textarea",
        "a[href]",
        "form",
        "[onclick]",
        "[onchange]",
        "[onsubmit]",
        "[contenteditable]",
      ];

      const elements = [];
      interactiveSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (!elements.includes(el)) {
            elements.push(el);
          }
        });
      });

      console.log(
        `%c✅ Found ${elements.length} interactive elements via manual scan`,
        styles.success
      );
      return checkElementReflection(elements, testType);
    }
  }

  // ===========================================
  // 🎯 EXPORT FUNCTIONS
  // ===========================================

  function exportReflectionResults(format = "json") {
    const results = window.xssReflectionTester.results;

    if (!results || Object.keys(results).length === 0) {
      console.log("%c❌ No reflection test results to export!", styles.error);
      return;
    }

    const exportData = {
      metadata: {
        tool: "XSS Reflection Tester",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        url: window.location.href,
        testType: "DOM-based XSS Reflection",
      },
      results: results,
      recommendations: generateSecurityRecommendations(results),
    };

    if (format === "json") {
      const jsonString = JSON.stringify(exportData, null, 2);
      downloadFile(
        jsonString,
        `xss-reflection-test-${Date.now()}.json`,
        "application/json"
      );
    } else if (format === "console") {
      console.log("\n%c📊 XSS REFLECTION TEST EXPORT", styles.banner);
      console.log(exportData);
    }
  }

  function generateSecurityRecommendations(results) {
    const recommendations = [];

    if (results.vulnerableElements && results.vulnerableElements.length > 0) {
      recommendations.push({
        priority: "HIGH",
        issue: "XSS Vulnerabilities Detected",
        description: `${results.vulnerableElements.length} elements show potential XSS vulnerabilities`,
        recommendations: [
          "Implement proper input sanitization",
          "Use Content Security Policy (CSP)",
          "Validate and encode all user inputs",
          "Use safe DOM manipulation methods",
          "Implement XSS protection headers",
        ],
      });
    }

    return recommendations;
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

    console.log(`%c✅ File downloaded: ${filename}`, styles.success);
  }

  // ===========================================
  // 🎯 ADVANCED TESTING FUNCTIONS
  // ===========================================

  function performDeepReflectionScan() {
    console.log("%c🔍 DEEP REFLECTION SCAN INITIATED", styles.banner);
    console.log(
      "%c🎯 Performing comprehensive DOM-based XSS analysis...",
      styles.info
    );

    const scanResults = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      interactiveElements: [],
      urlParameters: [],
      cookieAnalysis: {},
      storageAnalysis: {},
      runtimeAnalysis: {},
    };

    // 1. Test all interactive elements
    console.log("%c1/5 - Testing interactive elements...", styles.info);
    scanResults.interactiveElements = testInteractiveElements("comprehensive");

    // 2. Test URL parameters
    console.log("%c2/5 - Testing URL parameters...", styles.info);
    scanResults.urlParameters = testURLParameters();

    // 3. Test cookies
    console.log("%c3/5 - Testing cookie reflection...", styles.info);
    scanResults.cookieAnalysis = testCookieReflection();

    // 4. Test storage mechanisms
    console.log("%c4/5 - Testing storage reflection...", styles.info);
    scanResults.storageAnalysis = testStorageReflection();

    // 5. Runtime behavior analysis
    console.log("%c5/5 - Analyzing runtime behavior...", styles.info);
    scanResults.runtimeAnalysis = analyzeRuntimeBehavior();

    console.log("%c✅ Deep reflection scan completed!", styles.success);

    // Store comprehensive results
    window.xssReflectionTester.deepScanResults = scanResults;

    return scanResults;
  }

  function testURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramTests = [];

    console.log("%c🌐 Testing URL parameters for reflection...", styles.info);

    // Test each URL parameter
    urlParams.forEach((value, key) => {
      const testResult = {
        parameter: key,
        value: value.substring(0, 100),
        reflected: false,
        reflectionLocations: [],
        testPayloads: [],
      };

      // Check if parameter value appears in DOM
      const bodyHTML = document.body.innerHTML;
      const documentText = document.body.textContent || document.body.innerText;

      if (bodyHTML.includes(value) || documentText.includes(value)) {
        testResult.reflected = true;
        testResult.reflectionLocations.push("DOM");

        // Test with XSS payloads
        const testPayloads = [
          '<script>alert("XSS")</script>',
          '<img src=x onerror=alert("XSS")>',
        ];

        testPayloads.forEach((payload) => {
          const testURL = new URL(window.location);
          testURL.searchParams.set(key, payload);

          testResult.testPayloads.push({
            payload: payload,
            testURL: testURL.href,
            potentiallyVulnerable: true,
          });
        });
      }

      paramTests.push(testResult);
    });

    // Test common XSS parameter names
    const commonXSSParams = [
      "q",
      "search",
      "query",
      "keyword",
      "term",
      "name",
      "message",
      "comment",
    ];
    commonXSSParams.forEach((param) => {
      if (!urlParams.has(param)) {
        const testURL = new URL(window.location);
        testURL.searchParams.set(param, '<script>alert("XSS")</script>');

        paramTests.push({
          parameter: param,
          value: "test-payload",
          reflected: false,
          isTestParam: true,
          testURL: testURL.href,
        });
      }
    });

    console.log(`%c📊 Tested ${paramTests.length} URL parameters`, styles.info);
    return {
      parameters: paramTests,
      vulnerableCount: paramTests.filter((p) => p.reflected).length,
    };
  }

  function testCookieReflection() {
    console.log("%c🍪 Testing cookie reflection...", styles.info);

    const cookieAnalysis = {
      cookies: [],
      reflectedCookies: [],
      testResults: [],
    };

    // Parse existing cookies
    if (document.cookie) {
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const [name, value] = cookie.split("=").map((c) => c.trim());
        if (name && value) {
          const cookieData = {
            name: name,
            value: value.substring(0, 100),
            reflected: false,
            reflectionLocations: [],
          };

          // Check if cookie value appears in DOM
          const bodyHTML = document.body.innerHTML;
          const documentText =
            document.body.textContent || document.body.innerText;

          if (bodyHTML.includes(value) || documentText.includes(value)) {
            cookieData.reflected = true;
            cookieData.reflectionLocations.push("DOM");
            cookieAnalysis.reflectedCookies.push(cookieData);
          }

          cookieAnalysis.cookies.push(cookieData);
        }
      });
    }

    console.log(
      `%c📊 Analyzed ${cookieAnalysis.cookies.length} cookies, ${cookieAnalysis.reflectedCookies.length} reflected`,
      styles.info
    );
    return cookieAnalysis;
  }

  function testStorageReflection() {
    console.log("%c💾 Testing storage reflection...", styles.info);

    const storageAnalysis = {
      localStorage: [],
      sessionStorage: [],
      reflectedItems: [],
    };

    // Test localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (value) {
          const storageItem = {
            type: "localStorage",
            key: key,
            value: value.substring(0, 100),
            reflected: false,
          };

          // Check if value appears in DOM
          const bodyHTML = document.body.innerHTML;
          if (bodyHTML.includes(value)) {
            storageItem.reflected = true;
            storageAnalysis.reflectedItems.push(storageItem);
          }

          storageAnalysis.localStorage.push(storageItem);
        }
      }
    } catch (e) {
      console.log("%c⚠️ localStorage access denied", styles.warning);
    }

    // Test sessionStorage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);

        if (value) {
          const storageItem = {
            type: "sessionStorage",
            key: key,
            value: value.substring(0, 100),
            reflected: false,
          };

          // Check if value appears in DOM
          const bodyHTML = document.body.innerHTML;
          if (bodyHTML.includes(value)) {
            storageItem.reflected = true;
            storageAnalysis.reflectedItems.push(storageItem);
          }

          storageAnalysis.sessionStorage.push(storageItem);
        }
      }
    } catch (e) {
      console.log("%c⚠️ sessionStorage access denied", styles.warning);
    }

    console.log(
      `%c📊 Analyzed storage items, ${storageAnalysis.reflectedItems.length} reflected`,
      styles.info
    );
    return storageAnalysis;
  }

  function analyzeRuntimeBehavior() {
    console.log("%c⚡ Analyzing runtime behavior...", styles.info);

    const runtimeAnalysis = {
      dynamicContent: [],
      ajaxEndpoints: [],
      eventHandlers: [],
      potentialSinks: [],
    };

    // Monitor dynamic content changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              runtimeAnalysis.dynamicContent.push({
                tagName: node.tagName,
                innerHTML: node.innerHTML
                  ? node.innerHTML.substring(0, 200)
                  : "",
                timestamp: new Date().toISOString(),
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Stop observing after 5 seconds
    setTimeout(() => {
      observer.disconnect();
      console.log(
        `%c📊 Recorded ${runtimeAnalysis.dynamicContent.length} dynamic content changes`,
        styles.info
      );
    }, 5000);

    // Find potential AJAX endpoints
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script) => {
      if (script.textContent) {
        const ajaxPatterns = [
          /\.ajax\([^)]+\)/g,
          /fetch\([^)]+\)/g,
          /XMLHttpRequest/g,
          /\.get\([^)]+\)/g,
          /\.post\([^)]+\)/g,
        ];

        ajaxPatterns.forEach((pattern) => {
          const matches = script.textContent.match(pattern);
          if (matches) {
            matches.forEach((match) => {
              runtimeAnalysis.ajaxEndpoints.push({
                pattern: match.substring(0, 100),
                scriptSrc: script.src || "inline",
              });
            });
          }
        });
      }
    });

    return runtimeAnalysis;
  }

  // ===========================================
  // 🎯 QUICK TEST FUNCTIONS
  // ===========================================

  function quickXSSTest() {
    console.log("%c⚡ QUICK XSS VULNERABILITY TEST", styles.banner);

    // Get basic interactive elements
    const basicElements = [
      ...document.querySelectorAll("input"),
      ...document.querySelectorAll("textarea"),
      ...document.querySelectorAll("[contenteditable]"),
      ...document.querySelectorAll("form"),
    ];

    if (basicElements.length === 0) {
      console.log(
        "%c⚠️ No testable elements found on this page",
        styles.warning
      );
      return { message: "No testable elements found" };
    }

    return checkElementReflection(basicElements, "basic");
  }

  function testSpecificElement(selector) {
    console.log(`%c🎯 Testing specific element: ${selector}`, styles.info);

    const element = document.querySelector(selector);
    if (!element) {
      console.log(`%c❌ Element not found: ${selector}`, styles.error);
      return { error: "Element not found" };
    }

    return checkElementReflection([element], "comprehensive");
  }

  // ===========================================
  // 📋 HELP & DOCUMENTATION
  // ===========================================

  function showXSSTestHelp() {
    console.log("\n%c🆘 XSS REFLECTION TESTER - HELP", styles.banner);
    console.log(
      "%c┌─────────────────────────────────────────────────────────┐",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  MAIN FUNCTIONS:                                        │",
      "color: #e74c3c;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  testInteractiveElements()    - Test from toolkit       │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  quickXSSTest()              - Quick basic test         │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  performDeepReflectionScan() - Comprehensive analysis  │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  testSpecificElement(sel)    - Test single element      │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  exportReflectionResults()   - Export test results      │",
      "color: #27ae60;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #e74c3c;"
    );
    console.log(
      "%c│  TEST TYPES:                                            │",
      "color: #e74c3c;"
    );
    console.log(
      '%c│  "basic"        - Basic XSS payloads only              │',
      "color: #f39c12;"
    );
    console.log(
      '%c│  "advanced"     - Advanced + filter bypass             │',
      "color: #f39c12;"
    );
    console.log(
      '%c│  "comprehensive" - All payloads + deep analysis        │',
      "color: #f39c12;"
    );
    console.log(
      "%c└─────────────────────────────────────────────────────────┘",
      "color: #e74c3c;"
    );
    console.log("\n%c💡 Examples:", styles.warning);
    console.log(
      '%c  testInteractiveElements("basic")     %c- Quick test',
      "font-family: monospace; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      '%c  testSpecificElement("input#search") %c- Test one element',
      "font-family: monospace; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log(
      "%c  performDeepReflectionScan()         %c- Full analysis",
      "font-family: monospace; color: #e74c3c;",
      "color: #7f8c8d;"
    );
    console.log("\n%c⚠️ IMPORTANT:", styles.warning);
    console.log(
      "%c  • This tool is for authorized security testing only",
      "color: #e67e22;"
    );
    console.log(
      "%c  • Always get permission before testing",
      "color: #e67e22;"
    );
    console.log("%c  • Results may include false positives", "color: #e67e22;");
  }

  // ===========================================
  // 🚀 GLOBAL FUNCTION EXPOSURE
  // ===========================================

  // Expose functions globally for easy access
  window.checkElementReflection = checkElementReflection;
  window.testInteractiveElements = testInteractiveElements;
  window.quickXSSTest = quickXSSTest;
  window.testSpecificElement = testSpecificElement;
  window.performDeepReflectionScan = performDeepReflectionScan;
  window.exportReflectionResults = exportReflectionResults;
  window.showXSSTestHelp = showXSSTestHelp;

  // ===========================================
  // 🎉 INITIALIZATION
  // ===========================================

  console.log("%c🔍 XSS REFLECTION TESTER LOADED", styles.banner);
  console.log(
    "%c⚡ Ready to test DOM-based XSS vulnerabilities!",
    styles.success
  );
  console.log("\n%c🎯 QUICK START:", styles.warning);
  console.log(
    "%ctestInteractiveElements()    %c- Test elements from analysis toolkit",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cquickXSSTest()              %c- Quick test of basic elements",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cperformDeepReflectionScan() %c- Comprehensive vulnerability scan",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cshowXSSTestHelp()           %c- Detailed help and examples",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );

  console.log("\n%c🔗 INTEGRATION:", styles.info);
  console.log(
    "%c  • Automatically integrates with Web Analysis Toolkit",
    "color: #3498db;"
  );
  console.log(
    "%c  • Tests elements found by interactive highlighting",
    "color: #3498db;"
  );
  console.log(
    "%c  • Provides comprehensive DOM-based XSS analysis",
    "color: #3498db;"
  );

  console.log("\n%c⚠️ SECURITY NOTICE:", styles.warning);
  console.log(
    "%c  This tool is for authorized security testing only!",
    "color: #e67e22; font-weight: bold;"
  );
})();

// ===========================================
// 🔥 XSS REFLECTION TESTER - READY TO ROCK!
// ===========================================
