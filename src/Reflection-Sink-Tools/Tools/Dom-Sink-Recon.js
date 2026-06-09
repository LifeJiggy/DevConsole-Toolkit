// ===========================================
// 🎯 DOM SINK & REFLECTION MAPPER
// ===========================================
// Bug Bounty Reconnaissance Tool
// Maps reflection patterns and DOM sinks
// NO TESTING - PURE RECONNAISSANCE
// ===========================================

(function () {
  "use strict";

  // Global storage for recon data
  window.domSinkMapper = {
    mappedElements: [],
    reflectionMap: {},
    sinkMap: {},
    reconnaissance: {},
  };

  // Console styling for recon operations
  const styles = {
    banner:
      "background: linear-gradient(45deg, #8e44ad, #3498db); color: white; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 8px;",
    recon:
      "color: #8e44ad; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);",
    element:
      "color: #2980b9; font-weight: bold; background: rgba(41, 128, 185, 0.1); padding: 4px 8px; border-radius: 4px;",
    sink: "color: #e67e22; font-weight: bold; background: rgba(230, 126, 34, 0.1); padding: 4px 8px; border-radius: 4px;",
    reflection:
      "color: #27ae60; font-weight: bold; background: rgba(39, 174, 96, 0.1); padding: 4px 8px; border-radius: 4px;",
    info: "color: #34495e; font-weight: bold;",
    warning: "color: #f39c12; font-weight: bold;",
    critical:
      "color: #e74c3c; font-weight: bold; background: rgba(231, 76, 60, 0.1); padding: 6px 10px; border-radius: 4px;",
  };

  // ===========================================
  // 🗺️ DOM SINK CATALOG
  // ===========================================

  const domSinkCatalog = {
    // Critical execution sinks
    critical: {
      innerHTML: {
        description: "Direct HTML injection sink",
        risk: "CRITICAL",
        attackVector: "Script injection, HTML manipulation",
      },
      outerHTML: {
        description: "Complete element replacement sink",
        risk: "CRITICAL",
        attackVector: "Full DOM manipulation",
      },
      insertAdjacentHTML: {
        description: "Adjacent HTML insertion sink",
        risk: "CRITICAL",
        attackVector: "Contextual HTML injection",
      },
      "document.write": {
        description: "Direct document writing sink",
        risk: "CRITICAL",
        attackVector: "Document stream manipulation",
      },
      "document.writeln": {
        description: "Document writing with newline sink",
        risk: "CRITICAL",
        attackVector: "Document stream manipulation",
      },
      eval: {
        description: "JavaScript evaluation sink",
        risk: "CRITICAL",
        attackVector: "Direct code execution",
      },
      Function: {
        description: "Function constructor sink",
        risk: "CRITICAL",
        attackVector: "Dynamic function creation",
      },
      setTimeout: {
        description: "Delayed execution sink (string param)",
        risk: "CRITICAL",
        attackVector: "Delayed code execution",
      },
      setInterval: {
        description: "Repeated execution sink (string param)",
        risk: "CRITICAL",
        attackVector: "Repeated code execution",
      },
    },

    // High-risk navigation sinks
    navigation: {
      "location.href": {
        description: "URL navigation sink",
        risk: "HIGH",
        attackVector: "JavaScript protocol, redirect attacks",
      },
      "location.assign": {
        description: "URL assignment sink",
        risk: "HIGH",
        attackVector: "JavaScript protocol execution",
      },
      "location.replace": {
        description: "URL replacement sink",
        risk: "HIGH",
        attackVector: "JavaScript protocol execution",
      },
      "window.open": {
        description: "Window opening sink",
        risk: "HIGH",
        attackVector: "JavaScript protocol, popup attacks",
      },
    },

    // Medium-risk attribute sinks
    attributes: {
      src: {
        description: "Source attribute sink",
        risk: "MEDIUM",
        attackVector: "JavaScript protocol, data URLs",
      },
      href: {
        description: "Hyperlink reference sink",
        risk: "MEDIUM",
        attackVector: "JavaScript protocol execution",
      },
      action: {
        description: "Form action sink",
        risk: "MEDIUM",
        attackVector: "JavaScript protocol, form hijacking",
      },
      formaction: {
        description: "Button form action sink",
        risk: "MEDIUM",
        attackVector: "Form action override",
      },
      data: {
        description: "Object data sink",
        risk: "MEDIUM",
        attackVector: "Data URL injection",
      },
      poster: {
        description: "Video poster sink",
        risk: "MEDIUM",
        attackVector: "Image-based attacks",
      },
    },

    // Event handler sinks
    events: {
      onclick: {
        description: "Click event sink",
        risk: "HIGH",
        attackVector: "Event handler injection",
      },
      onload: {
        description: "Load event sink",
        risk: "HIGH",
        attackVector: "Auto-execution on load",
      },
      onerror: {
        description: "Error event sink",
        risk: "HIGH",
        attackVector: "Error-triggered execution",
      },
      onmouseover: {
        description: "Mouse over event sink",
        risk: "MEDIUM",
        attackVector: "Hover-triggered execution",
      },
      onmouseout: {
        description: "Mouse out event sink",
        risk: "MEDIUM",
        attackVector: "Mouse event execution",
      },
      onfocus: {
        description: "Focus event sink",
        risk: "MEDIUM",
        attackVector: "Focus-triggered execution",
      },
      onblur: {
        description: "Blur event sink",
        risk: "MEDIUM",
        attackVector: "Focus loss execution",
      },
      onchange: {
        description: "Change event sink",
        risk: "MEDIUM",
        attackVector: "Value change execution",
      },
      onsubmit: {
        description: "Submit event sink",
        risk: "HIGH",
        attackVector: "Form submission hijacking",
      },
      onkeydown: {
        description: "Key down event sink",
        risk: "MEDIUM",
        attackVector: "Keystroke execution",
      },
      onkeyup: {
        description: "Key up event sink",
        risk: "MEDIUM",
        attackVector: "Keystroke execution",
      },
    },

    // Data sources (potential reflection points)
    sources: {
      "location.search": {
        description: "URL query parameters",
        risk: "INFO",
        attackVector: "User-controlled data source",
      },
      "location.hash": {
        description: "URL fragment identifier",
        risk: "INFO",
        attackVector: "User-controlled data source",
      },
      "document.referrer": {
        description: "Referring page URL",
        risk: "INFO",
        attackVector: "External data source",
      },
      "document.URL": {
        description: "Current page URL",
        risk: "INFO",
        attackVector: "User-controlled data source",
      },
      "document.documentURI": {
        description: "Document URI",
        risk: "INFO",
        attackVector: "User-controlled data source",
      },
      "window.name": {
        description: "Window name property",
        risk: "INFO",
        attackVector: "Cross-window data source",
      },
    },
  };

  // ===========================================
  // 🎯 ELEMENT REFLECTION MAPPER
  // ===========================================

  function mapElementReflection(elements) {
    console.log("%c🎯 DOM SINK & REFLECTION MAPPER", styles.banner);
    console.log("%c🗺️ Starting reconnaissance mapping...", styles.recon);

    if (!Array.isArray(elements)) {
      console.log(
        "%c❌ Please provide an array of elements to map",
        styles.critical
      );
      console.log(
        "%c💡 Usage: mapElementReflection([element1, element2, ...])"
      );
      return { error: "Invalid input: expected array of elements" };
    }

    const reconResults = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      totalElements: elements.length,
      elementMaps: [],
      sinkSummary: {},
      reflectionSummary: {},
      dataFlowMap: {},
    };

    console.log(
      `%c📊 Mapping ${elements.length} elements for reconnaissance...`,
      styles.info
    );

    elements.forEach((element, index) => {
      try {
        console.log(
          `%c🔍 Mapping element ${index + 1}/${elements.length}...`,
          styles.element
        );

        const elementMap = createElementMap(element, index);
        reconResults.elementMaps.push(elementMap);

        console.log(
          `%c✅ Mapped: ${elementMap.elementInfo.tag}#${elementMap.elementInfo.id}`,
          styles.reflection
        );
      } catch (error) {
        console.log(
          `%c❌ Error mapping element ${index + 1}:`,
          styles.critical,
          error.message
        );
        reconResults.elementMaps.push({
          index: index,
          error: error.message,
          elementInfo: { tag: "unknown", id: "unknown" },
        });
      }
    });

    // Generate summaries
    reconResults.sinkSummary = generateSinkSummary(reconResults.elementMaps);
    reconResults.reflectionSummary = generateReflectionSummary(
      reconResults.elementMaps
    );
    reconResults.dataFlowMap = generateDataFlowMap(reconResults.elementMaps);

    // Display reconnaissance results
    displayReconResults(reconResults);

    // Store globally
    window.domSinkMapper.reconnaissance = reconResults;

    return reconResults;
  }

  // ===========================================
  // 🗺️ ELEMENT MAPPING ENGINE
  // ===========================================

  function createElementMap(element, index) {
    const elementMap = {
      index: index,
      elementInfo: extractElementInfo(element),
      domSinks: mapElementSinks(element),
      reflectionPoints: mapReflectionPoints(element),
      dataFlow: analyzeDataFlow(element),
      securityProfile: generateSecurityProfile(element),
      xpath: getElementXPath(element),
    };

    return elementMap;
  }

  function extractElementInfo(element) {
    return {
      tag: element.tagName ? element.tagName.toLowerCase() : "unknown",
      id: element.id || "no-id",
      name: element.name || "no-name",
      className: element.className || "no-class",
      type: element.type || "N/A",
      value: element.value
        ? `"${element.value.substring(0, 50)}..."`
        : "no-value",
      placeholder: element.placeholder || "no-placeholder",
      src: element.src || "no-src",
      href: element.href || "no-href",
      action: element.action || "no-action",
      method: element.method || "no-method",
      target: element.target || "no-target",
    };
  }

  // ===========================================
  // 🎯 DOM SINK DETECTION ENGINE
  // ===========================================

  function mapElementSinks(element) {
    const sinks = {
      critical: [],
      navigation: [],
      attributes: [],
      events: [],
      sources: [],
    };

    // Map critical sinks
    Object.keys(domSinkCatalog.critical).forEach((sinkName) => {
      if (hasProperty(element, sinkName)) {
        sinks.critical.push({
          sink: sinkName,
          ...domSinkCatalog.critical[sinkName],
          present: true,
          currentValue: getSafePropertyValue(element, sinkName),
        });
      }
    });

    // Map navigation sinks
    Object.keys(domSinkCatalog.navigation).forEach((sinkName) => {
      if (hasProperty(element, sinkName.split(".")[0])) {
        sinks.navigation.push({
          sink: sinkName,
          ...domSinkCatalog.navigation[sinkName],
          present: true,
          currentValue: getSafePropertyValue(element, sinkName),
        });
      }
    });

    // Map attribute sinks
    Object.keys(domSinkCatalog.attributes).forEach((sinkName) => {
      if (element.hasAttribute && element.hasAttribute(sinkName)) {
        sinks.attributes.push({
          sink: sinkName,
          ...domSinkCatalog.attributes[sinkName],
          present: true,
          currentValue: element.getAttribute(sinkName),
        });
      }
    });

    // Map event handler sinks
    Object.keys(domSinkCatalog.events).forEach((sinkName) => {
      if (element.hasAttribute && element.hasAttribute(sinkName)) {
        sinks.events.push({
          sink: sinkName,
          ...domSinkCatalog.events[sinkName],
          present: true,
          currentValue: element.getAttribute(sinkName),
        });
      } else if (hasProperty(element, sinkName)) {
        sinks.events.push({
          sink: sinkName,
          ...domSinkCatalog.events[sinkName],
          present: true,
          currentValue: getSafePropertyValue(element, sinkName),
          isProperty: true,
        });
      }
    });

    return sinks;
  }

  // ===========================================
  // 🔍 REFLECTION POINT DETECTION
  // ===========================================

  function mapReflectionPoints(element) {
    const reflectionPoints = {
      bodyReflection: checkBodyReflection(element),
      domReflection: checkDOMReflection(element),
      attributeReflection: checkAttributeReflection(element),
      textReflection: checkTextReflection(element),
      valueReflection: checkValueReflection(element),
    };

    return reflectionPoints;
  }

  function checkBodyReflection(element) {
    const reflectionData = {
      hasReflection: false,
      reflectionType: [],
      reflectionCount: 0,
      reflectionContext: [],
    };

    try {
      const elementText =
        element.textContent || element.innerText || element.value || "";
      const bodyHTML = document.body.innerHTML;
      const bodyText = document.body.textContent || document.body.innerText;

      if (elementText && elementText.trim().length > 0) {
        // Check for exact matches in body HTML
        if (bodyHTML.includes(elementText)) {
          reflectionData.hasReflection = true;
          reflectionData.reflectionType.push("HTML");

          // Count occurrences
          const htmlMatches = bodyHTML.split(elementText).length - 1;
          reflectionData.reflectionCount += htmlMatches;
        }

        // Check for text content matches
        if (bodyText.includes(elementText)) {
          reflectionData.hasReflection = true;
          reflectionData.reflectionType.push("TEXT");

          const textMatches = bodyText.split(elementText).length - 1;
          reflectionData.reflectionCount += textMatches;
        }

        // Analyze reflection context
        if (reflectionData.hasReflection) {
          reflectionData.reflectionContext = analyzeReflectionContext(
            elementText,
            bodyHTML
          );
        }
      }
    } catch (error) {
      reflectionData.error = error.message;
    }

    return reflectionData;
  }

  function checkDOMReflection(element) {
    const reflectionData = {
      hasReflection: false,
      reflectedIn: [],
      reflectionDepth: 0,
      reflectionNodes: [],
    };

    try {
      const elementIdentifier = element.id || element.name || element.className;

      if (elementIdentifier) {
        // Find all elements that might contain this identifier
        const allElements = document.querySelectorAll("*");

        allElements.forEach((el) => {
          const elText = el.textContent || el.innerHTML || "";

          if (elText.includes(elementIdentifier)) {
            reflectionData.hasReflection = true;
            reflectionData.reflectedIn.push({
              tagName: el.tagName,
              id: el.id || "no-id",
              className: el.className || "no-class",
              reflectionType: (el.innerHTML && el.innerHTML.includes(elementIdentifier))
                ? "innerHTML"
                : "textContent",
            });
          }
        });

        reflectionData.reflectionDepth = reflectionData.reflectedIn.length;
      }
    } catch (error) {
      reflectionData.error = error.message;
    }

    return reflectionData;
  }

  function checkAttributeReflection(element) {
    const reflectionData = {
      hasReflection: false,
      reflectedAttributes: [],
      dynamicAttributes: [],
    };

    try {
      if (element.attributes) {
        Array.from(element.attributes).forEach((attr) => {
          // Check if attribute value appears elsewhere in DOM
          const attrValue = attr.value;

          if (attrValue && attrValue.trim().length > 2) {
            const bodyHTML = document.body.innerHTML;

            // Count how many times this attribute value appears
            const occurrences = bodyHTML.split(attrValue).length - 1;

            if (occurrences > 1) {
              // More than once means it's reflected
              reflectionData.hasReflection = true;
              reflectionData.reflectedAttributes.push({
                name: attr.name,
                value: attrValue,
                occurrences: occurrences,
              });
            }
          }

          // Check for dynamic attribute patterns
          if (
            attrValue &&
            (attrValue.includes("{{") ||
              attrValue.includes("${") ||
              attrValue.includes("%"))
          ) {
            reflectionData.dynamicAttributes.push({
              name: attr.name,
              value: attrValue,
              pattern: "template_syntax",
            });
          }
        });
      }
    } catch (error) {
      reflectionData.error = error.message;
    }

    return reflectionData;
  }

  function checkTextReflection(element) {
    const reflectionData = {
      hasReflection: false,
      textSources: [],
      reflectionPattern: "none",
    };

    try {
      const elementText = element.textContent || element.innerText || "";

      if (elementText && elementText.trim().length > 0) {
        // Check common reflection sources
        const sources = [
          { name: "URL_PARAMS", data: window.location.search },
          { name: "URL_HASH", data: window.location.hash },
          { name: "DOCUMENT_URL", data: document.URL },
          { name: "REFERRER", data: document.referrer },
          { name: "WINDOW_NAME", data: window.name },
        ];

        sources.forEach((source) => {
          if (source.data && source.data.includes(elementText)) {
            reflectionData.hasReflection = true;
            reflectionData.textSources.push(source.name);
          }
        });

        // Determine reflection pattern
        if (reflectionData.textSources.length > 0) {
          reflectionData.reflectionPattern =
            reflectionData.textSources.join("_");
        }
      }
    } catch (error) {
      reflectionData.error = error.message;
    }

    return reflectionData;
  }

  function checkValueReflection(element) {
    const reflectionData = {
      hasReflection: false,
      valueSource: "none",
      reflectionMethod: "none",
    };

    try {
      const elementValue = element.value || "";

      if (elementValue && elementValue.trim().length > 0) {
        // Check if value comes from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key) => {
          if (value === elementValue) {
            reflectionData.hasReflection = true;
            reflectionData.valueSource = "URL_PARAM";
            reflectionData.reflectionMethod = key;
          }
        });

        // Check if value comes from hash
        if (window.location.hash.includes(elementValue)) {
          reflectionData.hasReflection = true;
          reflectionData.valueSource = "URL_HASH";
        }

        // Check if value appears in other elements
        const allInputs = document.querySelectorAll("input, textarea, select");
        let matchCount = 0;

        allInputs.forEach((input) => {
          if (input !== element && input.value === elementValue) {
            matchCount++;
          }
        });

        if (matchCount > 0) {
          reflectionData.hasReflection = true;
          reflectionData.valueSource = "CROSS_ELEMENT";
          reflectionData.reflectionMethod = `${matchCount}_matches`;
        }
      }
    } catch (error) {
      reflectionData.error = error.message;
    }

    return reflectionData;
  }

  // ===========================================
  // 📊 DATA FLOW ANALYSIS
  // ===========================================

  function analyzeDataFlow(element) {
    const dataFlow = {
      inputSources: [],
      outputSinks: [],
      dataPath: [],
      riskLevel: "LOW",
    };

    try {
      // Identify input sources
      if (element.value !== undefined) {
        dataFlow.inputSources.push("USER_INPUT");
      }

      // Check for URL parameter connections
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => {
        if (element.name === key || element.id === key) {
          dataFlow.inputSources.push("URL_PARAMETER");
          dataFlow.dataPath.push(`URL[${key}] -> Element[${element.tagName}]`);
        }
      });

      // Identify output sinks
      const elementSinks = mapElementSinks(element);

      Object.values(elementSinks).forEach((sinkCategory) => {
        sinkCategory.forEach((sink) => {
          if (sink.present) {
            dataFlow.outputSinks.push(sink.sink);

            if (sink.risk === "CRITICAL") {
              dataFlow.riskLevel = "CRITICAL";
            } else if (
              sink.risk === "HIGH" &&
              dataFlow.riskLevel !== "CRITICAL"
            ) {
              dataFlow.riskLevel = "HIGH";
            } else if (sink.risk === "MEDIUM" && dataFlow.riskLevel === "LOW") {
              dataFlow.riskLevel = "MEDIUM";
            }
          }
        });
      });

      // Build data path
      if (dataFlow.inputSources.length > 0 && dataFlow.outputSinks.length > 0) {
        dataFlow.dataPath.push(
          `Sources[${dataFlow.inputSources.join(
            ","
          )}] -> Sinks[${dataFlow.outputSinks.join(",")}]`
        );
      }
    } catch (error) {
      dataFlow.error = error.message;
    }

    return dataFlow;
  }

  // ===========================================
  // 🛡️ SECURITY PROFILE GENERATOR
  // ===========================================

  function generateSecurityProfile(element) {
    const profile = {
      riskScore: 0,
      riskFactors: [],
      mitigations: [],
      recommendations: [],
    };

    try {
      const sinks = mapElementSinks(element);
      const reflections = mapReflectionPoints(element);

      // Calculate risk score based on sinks
      sinks.critical.forEach((sink) => {
        profile.riskScore += 10;
        profile.riskFactors.push(`Critical sink: ${sink.sink}`);
        profile.recommendations.push(
          `Sanitize input before using ${sink.sink}`
        );
      });

      sinks.navigation.forEach((sink) => {
        profile.riskScore += 7;
        profile.riskFactors.push(`Navigation sink: ${sink.sink}`);
        profile.recommendations.push(`Validate URLs before navigation`);
      });

      sinks.events.forEach((sink) => {
        profile.riskScore += 5;
        profile.riskFactors.push(`Event handler: ${sink.sink}`);
        profile.recommendations.push(
          `Use event listeners instead of inline handlers`
        );
      });

      // Add risk for reflections
      if (reflections.bodyReflection.hasReflection) {
        profile.riskScore += 3;
        profile.riskFactors.push("Body reflection detected");
        profile.recommendations.push("Implement output encoding");
      }

      if (reflections.domReflection.hasReflection) {
        profile.riskScore += 4;
        profile.riskFactors.push("DOM reflection detected");
        profile.recommendations.push("Use safe DOM manipulation methods");
      }

      // Generate mitigation suggestions
      if (profile.riskScore > 15) {
        profile.mitigations.push("Implement Content Security Policy (CSP)");
        profile.mitigations.push(
          "Use DOMPurify or similar sanitization library"
        );
        profile.mitigations.push("Validate all input server-side");
      } else if (profile.riskScore > 8) {
        profile.mitigations.push("Implement input validation");
        profile.mitigations.push("Use output encoding");
      } else if (profile.riskScore > 3) {
        profile.mitigations.push("Review input handling");
      }
    } catch (error) {
      profile.error = error.message;
    }

    return profile;
  }

  // ===========================================
  // 🔧 UTILITY FUNCTIONS
  // ===========================================

  function hasProperty(obj, propPath) {
    try {
      const props = propPath.split(".");
      let current = obj;

      for (let prop of props) {
        if (current[prop] === undefined) {
          return false;
        }
        current = current[prop];
      }
      return true;
    } catch {
      return false;
    }
  }

  function getSafePropertyValue(obj, propPath) {
    try {
      const props = propPath.split(".");
      let current = obj;

      for (let prop of props) {
        current = current[prop];
      }

      if (typeof current === "function") {
        return "[Function]";
      } else if (typeof current === "string") {
        return current.substring(0, 100) + (current.length > 100 ? "..." : "");
      } else {
        return String(current);
      }
    } catch {
      return "[Inaccessible]";
    }
  }

  function getElementXPath(element) {
    if (!element) return "";
    if (element.id !== "") {
      return 'id("' + element.id + '")';
    }
    if (element === document.body) {
      return element.tagName;
    }
    if (!element.parentNode) return element.tagName || "";
    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element) {
        return (
          getElementXPath(element.parentNode) +
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

  function analyzeReflectionContext(text, html) {
    const contexts = [];
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(.{0,50}${escapedText}.{0,50})`, "gi");
    const matches = html.match(regex);

    if (matches) {
      matches.slice(0, 5).forEach((match, index) => {
        contexts.push({
          context: match,
          position: index,
          inAttribute: match.includes('="') || match.includes("='"),
          inTag: match.includes("<") && match.includes(">"),
          inScript: match.toLowerCase().includes("<script"),
        });
      });
    }

    return contexts;
  }

  // ===========================================
  // 📊 SUMMARY GENERATORS
  // ===========================================

  function generateSinkSummary(elementMaps) {
    const summary = {
      totalElements: elementMaps.length,
      criticalSinks: 0,
      navigationSinks: 0,
      attributeSinks: 0,
      eventSinks: 0,
      riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      topSinks: [],
    };

    const sinkCounts = {};

    elementMaps.forEach((map) => {
      if (map.domSinks) {
        ["critical", "navigation", "attributes", "events"].forEach(
          (category) => {
            map.domSinks[category].forEach((sink) => {
              if (sink.present) {
                summary[`${category}Sinks`]++;

                // Count sink occurrences
                sinkCounts[sink.sink] = (sinkCounts[sink.sink] || 0) + 1;

                // Risk distribution
                summary.riskDistribution[sink.risk] =
                  (summary.riskDistribution[sink.risk] || 0) + 1;
              }
            });
          }
        );
      }
    });

    // Get top sinks
    summary.topSinks = Object.entries(sinkCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([sink, count]) => ({ sink, count }));

    return summary;
  }

  function generateReflectionSummary(elementMaps) {
    const summary = {
      totalElements: elementMaps.length,
      bodyReflections: 0,
      domReflections: 0,
      attributeReflections: 0,
      valueReflections: 0,
      reflectionTypes: {},
      reflectionSources: {},
    };

    elementMaps.forEach((map) => {
      if (map.reflectionPoints) {
        if (map.reflectionPoints.bodyReflection.hasReflection) {
          summary.bodyReflections++;

          map.reflectionPoints.bodyReflection.reflectionType.forEach((type) => {
            summary.reflectionTypes[type] =
              (summary.reflectionTypes[type] || 0) + 1;
          });
        }

        if (map.reflectionPoints.domReflection.hasReflection) {
          summary.domReflections++;
        }

        if (map.reflectionPoints.attributeReflection.hasReflection) {
          summary.attributeReflections++;
        }

        if (map.reflectionPoints.valueReflection.hasReflection) {
          summary.valueReflections++;

          const source = map.reflectionPoints.valueReflection.valueSource;
          summary.reflectionSources[source] =
            (summary.reflectionSources[source] || 0) + 1;
        }
      }
    });

    return summary;
  }

  function generateDataFlowMap(elementMaps) {
    const dataFlowMap = {
      totalFlows: 0,
      riskLevels: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      sourceTypes: {},
      sinkTypes: {},
      dataFlows: [],
    };

    elementMaps.forEach((map) => {
      if (
        map.dataFlow &&
        map.dataFlow.inputSources.length > 0 &&
        map.dataFlow.outputSinks.length > 0
      ) {
        dataFlowMap.totalFlows++;
        dataFlowMap.riskLevels[map.dataFlow.riskLevel]++;

        map.dataFlow.inputSources.forEach((source) => {
          dataFlowMap.sourceTypes[source] =
            (dataFlowMap.sourceTypes[source] || 0) + 1;
        });

        map.dataFlow.outputSinks.forEach((sink) => {
          dataFlowMap.sinkTypes[sink] = (dataFlowMap.sinkTypes[sink] || 0) + 1;
        });

        dataFlowMap.dataFlows.push({
          elementId: map.elementInfo.id,
          elementTag: map.elementInfo.tag,
          sources: map.dataFlow.inputSources,
          sinks: map.dataFlow.outputSinks,
          riskLevel: map.dataFlow.riskLevel,
          dataPath: map.dataFlow.dataPath,
        });
      }
    });

    return dataFlowMap;
  }

  // ===========================================
  // 📋 RESULTS DISPLAY
  // ===========================================

  function displayReconResults(reconResults) {
    console.log(
      "\n%c🗺️ DOM SINK & REFLECTION RECONNAISSANCE RESULTS",
      styles.banner
    );
    console.log(
      "%c════════════════════════════════════════════════════════",
      "color: #8e44ad; font-weight: bold;"
    );

    // Overview
    console.log("\n%c📊 RECONNAISSANCE OVERVIEW:", styles.recon);
    console.table({
      "Total Elements Mapped": reconResults.totalElements,
      "Elements with Critical Sinks": reconResults.sinkSummary.criticalSinks,
      "Elements with Body Reflections":
        reconResults.reflectionSummary.bodyReflections,
      "Data Flows Identified": reconResults.dataFlowMap.totalFlows,
      "High-Risk Elements":
        reconResults.dataFlowMap.riskLevels.HIGH +
        reconResults.dataFlowMap.riskLevels.CRITICAL,
    });

    // Sink Summary
    console.log("\n%c🎯 DOM SINK ANALYSIS:", styles.sink);
    if (reconResults.sinkSummary.topSinks.length > 0) {
      console.log("%cTop DOM Sinks Found:", styles.info);
      console.table(reconResults.sinkSummary.topSinks);

      console.log("%cRisk Distribution:", styles.info);
      console.table(reconResults.sinkSummary.riskDistribution);
    } else {
      console.log("%c✅ No high-risk DOM sinks detected", styles.reflection);
    }

    // Reflection Summary
    console.log("\n%c🔍 REFLECTION ANALYSIS:", styles.reflection);
    if (reconResults.reflectionSummary.bodyReflections > 0) {
      console.log(
        `%c⚠️ ${reconResults.reflectionSummary.bodyReflections} elements show body reflection`,
        styles.warning
      );

      if (
        Object.keys(reconResults.reflectionSummary.reflectionTypes).length > 0
      ) {
        console.log("%cReflection Types:", styles.info);
        console.table(reconResults.reflectionSummary.reflectionTypes);
      }

      if (
        Object.keys(reconResults.reflectionSummary.reflectionSources).length > 0
      ) {
        console.log("%cReflection Sources:", styles.info);
        console.table(reconResults.reflectionSummary.reflectionSources);
      }
    } else {
      console.log("%c✅ No obvious reflections detected", styles.reflection);
    }

    // Data Flow Analysis
    console.log("\n%c📊 DATA FLOW ANALYSIS:", styles.info);
    if (reconResults.dataFlowMap.totalFlows > 0) {
      console.log(
        `%c🔄 ${reconResults.dataFlowMap.totalFlows} data flows identified`,
        styles.warning
      );

      console.log("%cData Flow Risk Levels:", styles.info);
      console.table(reconResults.dataFlowMap.riskLevels);

      if (reconResults.dataFlowMap.dataFlows.length > 0) {
        console.log("%cCritical Data Flows:", styles.critical);
        const criticalFlows = reconResults.dataFlowMap.dataFlows.filter(
          (flow) => flow.riskLevel === "CRITICAL" || flow.riskLevel === "HIGH"
        );

        if (criticalFlows.length > 0) {
          console.table(
            criticalFlows.map((flow) => ({
              Element: `${flow.elementTag}#${flow.elementId}`,
              Sources: flow.sources.join(","),
              Sinks: flow.sinks.join(","),
              Risk: flow.riskLevel,
            }))
          );
        }
      }
    } else {
      console.log("%c✅ No concerning data flows detected", styles.reflection);
    }

    // Individual Element Details
    if (reconResults.elementMaps.length <= 10) {
      console.log("\n%c📋 INDIVIDUAL ELEMENT ANALYSIS:", styles.element);

      reconResults.elementMaps.forEach((elementMap, index) => {
        if (!elementMap.error) {
          console.log(
            `\n%c🔍 Element ${index + 1}: ${elementMap.elementInfo.tag}#${
              elementMap.elementInfo.id
            }`,
            styles.element
          );

          // Show critical findings
          const criticalSinks = elementMap.domSinks.critical.filter(
            (sink) => sink.present
          );
          if (criticalSinks.length > 0) {
            console.log(
              `%c⚠️ CRITICAL SINKS (${criticalSinks.length}):`,
              styles.critical
            );
            criticalSinks.forEach((sink) => {
              console.log(
                `  %c• ${sink.sink} - ${sink.description}`,
                "color: #e74c3c;"
              );
            });
          }

          // Show reflections
          if (elementMap.reflectionPoints.bodyReflection.hasReflection) {
            console.log(
              `%c🔄 BODY REFLECTION: ${elementMap.reflectionPoints.bodyReflection.reflectionType.join(
                ", "
              )}`,
              styles.warning
            );
          }

          // Show security profile
          if (elementMap.securityProfile.riskScore > 5) {
            console.log(
              `%c🛡️ RISK SCORE: ${elementMap.securityProfile.riskScore}/100`,
              styles.warning
            );
            if (elementMap.securityProfile.riskFactors.length > 0) {
              console.log(
                `%cRisk Factors: ${elementMap.securityProfile.riskFactors.join(
                  ", "
                )}`,
                "color: #e67e22;"
              );
            }
          }
        }
      });
    } else {
      console.log(
        `\n%c📋 ${reconResults.elementMaps.length} elements mapped (detailed view available in results object)`,
        styles.info
      );
    }

    console.log(
      "\n%c════════════════════════════════════════════════════════",
      "color: #8e44ad; font-weight: bold;"
    );
    console.log(
      "%c💾 Full reconnaissance data stored in window.domSinkMapper.reconnaissance",
      styles.info
    );
    console.log("%c🎯 Ready for bug bounty analysis phase!", styles.recon);
  }

  // ===========================================
  // 🔍 QUICK ELEMENT INSPECTOR
  // ===========================================

  function inspectElement(selector) {
    console.log(`%c🔍 INSPECTING ELEMENT: ${selector}`, styles.banner);

    const element = document.querySelector(selector);
    if (!element) {
      console.log(`%c❌ Element not found: ${selector}`, styles.critical);
      return { error: "Element not found" };
    }

    const inspection = createElementMap(element, 0);

    console.log("\n%c📋 ELEMENT INSPECTION RESULTS:", styles.element);
    console.log(
      "%c────────────────────────────────────────",
      "color: #3498db;"
    );

    // Basic info
    console.log("\n%c📊 Basic Information:", styles.info);
    console.table(inspection.elementInfo);

    // DOM Sinks
    console.log("\n%c🎯 DOM Sinks Analysis:", styles.sink);
    const allSinks = [
      ...inspection.domSinks.critical,
      ...inspection.domSinks.navigation,
      ...inspection.domSinks.events,
    ].filter((sink) => sink.present);

    if (allSinks.length > 0) {
      console.table(
        allSinks.map((sink) => ({
          Sink: sink.sink,
          Risk: sink.risk,
          Description: sink.description,
          "Attack Vector": sink.attackVector,
        }))
      );
    } else {
      console.log("%c✅ No concerning DOM sinks found", styles.reflection);
    }

    // Reflection Analysis
    console.log("\n%c🔄 Reflection Analysis:", styles.reflection);
    const reflectionSummary = {};

    Object.entries(inspection.reflectionPoints).forEach(([type, data]) => {
      reflectionSummary[type] = data.hasReflection ? "DETECTED" : "Not Found";
    });

    console.table(reflectionSummary);

    // Security Profile
    console.log("\n%c🛡️ Security Profile:", styles.info);
    console.table({
      "Risk Score": `${inspection.securityProfile.riskScore}/100`,
      "Risk Factors": inspection.securityProfile.riskFactors.length,
      Recommendations: inspection.securityProfile.recommendations.length,
    });

    if (inspection.securityProfile.riskScore > 5) {
      console.log("\n%c⚠️ Security Recommendations:", styles.warning);
      inspection.securityProfile.recommendations.forEach((rec, index) => {
        console.log(`%c${index + 1}. ${rec}`, "color: #e67e22;");
      });
    }

    // Store inspection
    window.domSinkMapper.lastInspection = inspection;

    return inspection;
  }

  // ===========================================
  // 💾 EXPORT & SAVE FUNCTIONS
  // ===========================================

  function exportReconResults(format = "json") {
    const results = window.domSinkMapper.reconnaissance;

    if (!results || Object.keys(results).length === 0) {
      console.log("%c❌ No reconnaissance data to export!", styles.critical);
      console.log("%c💡 Run mapElementReflection([elements]) first");
      return;
    }

    const exportData = {
      metadata: {
        tool: "DOM Sink & Reflection Mapper",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        url: window.location.href,
        purpose: "Bug Bounty Reconnaissance",
      },
      reconnaissance: results,
      analysis: {
        summary: `Mapped ${results.totalElements} elements`,
        criticalFindings: results.dataFlowMap.riskLevels.CRITICAL || 0,
        highRiskFindings: results.dataFlowMap.riskLevels.HIGH || 0,
        recommendedActions: generateReconRecommendations(results),
      },
    };

    if (format === "json") {
      const jsonString = JSON.stringify(exportData, null, 2);
      downloadReconFile(
        jsonString,
        `dom-recon-${Date.now()}.json`,
        "application/json"
      );
      console.log(
        "%c✅ Reconnaissance data exported as JSON!",
        styles.reflection
      );
    } else if (format === "console") {
      console.log("\n%c📊 RECONNAISSANCE EXPORT", styles.banner);
      console.log(exportData);
    } else if (format === "csv") {
      const csvData = convertToCsv(results.elementMaps);
      downloadReconFile(csvData, `dom-recon-${Date.now()}.csv`, "text/csv");
      console.log(
        "%c✅ Reconnaissance data exported as CSV!",
        styles.reflection
      );
    }

    return exportData;
  }

  function generateReconRecommendations(results) {
    const recommendations = [];

    if (results.sinkSummary.criticalSinks > 0) {
      recommendations.push({
        priority: "HIGH",
        finding: "Critical DOM sinks detected",
        action:
          "Review elements with innerHTML, eval, or similar dangerous sinks",
        count: results.sinkSummary.criticalSinks,
      });
    }

    if (results.reflectionSummary.bodyReflections > 0) {
      recommendations.push({
        priority: "MEDIUM",
        finding: "Body reflections detected",
        action: "Investigate elements that reflect user input in page body",
        count: results.reflectionSummary.bodyReflections,
      });
    }

    if (results.dataFlowMap.totalFlows > 0) {
      recommendations.push({
        priority: "MEDIUM",
        finding: "Data flows identified",
        action: "Map data flow paths for potential injection points",
        count: results.dataFlowMap.totalFlows,
      });
    }

    return recommendations;
  }

  function convertToCsv(elementMaps) {
    const headers = [
      "Index",
      "Tag",
      "ID",
      "Name",
      "Type",
      "Critical_Sinks",
      "Event_Handlers",
      "Body_Reflection",
      "DOM_Reflection",
      "Risk_Score",
      "XPath",
    ];

    const rows = elementMaps.map((map) => [
      map.index,
      map.elementInfo.tag,
      map.elementInfo.id,
      map.elementInfo.name,
      map.elementInfo.type,
      map.domSinks.critical.filter((s) => s.present).length,
      map.domSinks.events.filter((s) => s.present).length,
      map.reflectionPoints.bodyReflection.hasReflection ? "YES" : "NO",
      map.reflectionPoints.domReflection.hasReflection ? "YES" : "NO",
      map.securityProfile.riskScore,
      map.xpath,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  function downloadReconFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`%c📁 File saved: ${filename}`, styles.reflection);
  }

  // ===========================================
  // 🆘 HELP & DOCUMENTATION
  // ===========================================

  function showReconHelp() {
    console.log("\n%c🆘 DOM SINK & REFLECTION MAPPER - HELP", styles.banner);
    console.log(
      "%c┌─────────────────────────────────────────────────────────┐",
      "color: #8e44ad;"
    );
    console.log(
      "%c│  BUG BOUNTY RECONNAISSANCE FUNCTIONS:                   │",
      "color: #8e44ad;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #8e44ad;"
    );
    console.log(
      "%c│  mapElementReflection(elements) - Map provided elements │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  inspectElement(selector)      - Inspect single element │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  exportReconResults()          - Export reconnaissance  │",
      "color: #27ae60;"
    );
    console.log(
      "%c│  showReconHelp()               - Show this help         │",
      "color: #27ae60;"
    );
    console.log(
      "%c├─────────────────────────────────────────────────────────┤",
      "color: #8e44ad;"
    );
    console.log(
      "%c│  RECONNAISSANCE WORKFLOW:                               │",
      "color: #8e44ad;"
    );
    console.log(
      "%c│  1. Collect elements manually or from analysis         │",
      "color: #f39c12;"
    );
    console.log(
      "%c│  2. Map reflection patterns and DOM sinks              │",
      "color: #f39c12;"
    );
    console.log(
      "%c│  3. Export reconnaissance data                          │",
      "color: #f39c12;"
    );
    console.log(
      "%c│  4. Use data for targeted testing                      │",
      "color: #f39c12;"
    );
    console.log(
      "%c└─────────────────────────────────────────────────────────┘",
      "color: #8e44ad;"
    );

    console.log("\n%c💡 Examples:", styles.warning);
    console.log("%c  // Map specific elements", "color: #95a5a6;");
    console.log(
      '%c  const elements = [document.getElementById("search"), document.querySelector("input")];',
      "font-family: monospace; color: #2c3e50;"
    );
    console.log(
      "%c  mapElementReflection(elements);",
      "font-family: monospace; color: #e74c3c;"
    );
    console.log("\n%c  // Inspect single element", "color: #95a5a6;");
    console.log(
      '%c  inspectElement("input#search");',
      "font-family: monospace; color: #e74c3c;"
    );
    console.log("\n%c  // Export results", "color: #95a5a6;");
    console.log(
      '%c  exportReconResults("json");     // Save as JSON',
      "font-family: monospace; color: #e74c3c;"
    );
    console.log(
      '%c  exportReconResults("csv");      // Save as CSV',
      "font-family: monospace; color: #e74c3c;"
    );

    console.log("\n%c🎯 Bug Bounty Focus:", styles.recon);
    console.log(
      "%c  • Maps DOM sinks without testing (reconnaissance only)",
      "color: #8e44ad;"
    );
    console.log(
      "%c  • Identifies reflection patterns for manual analysis",
      "color: #8e44ad;"
    );
    console.log(
      "%c  • Provides risk scoring for prioritization",
      "color: #8e44ad;"
    );
    console.log(
      "%c  • Exports data for external tools and reporting",
      "color: #8e44ad;"
    );

    console.log("\n%c⚠️ Important Notes:", styles.warning);
    console.log(
      "%c  • This is RECONNAISSANCE ONLY - no payloads are injected",
      "color: #e67e22; font-weight: bold;"
    );
    console.log("%c  • You provide the elements to analyze", "color: #e67e22;");
    console.log(
      "%c  • Results show potential attack surface, not active vulns",
      "color: #e67e22;"
    );
  }

  // ===========================================
  // 🚀 GLOBAL FUNCTION EXPOSURE
  // ===========================================

  // Expose functions globally for console use
  window.mapElementReflection = mapElementReflection;
  window.inspectElement = inspectElement;
  window.exportReconResults = exportReconResults;
  window.showReconHelp = showReconHelp;

  // ===========================================
  // 🎉 TOOL INITIALIZATION
  // ===========================================

  console.log("%c🎯 DOM SINK & REFLECTION MAPPER LOADED", styles.banner);
  console.log("%c🗺️ Bug Bounty Reconnaissance Tool Ready!", styles.recon);

  console.log("\n%c🎯 QUICK START:", styles.warning);
  console.log("%c// 1. Collect your elements manually", "color: #95a5a6;");
  console.log(
    '%cconst myElements = [document.querySelector("input"), document.getElementById("search")];',
    "font-family: monospace; color: #2c3e50;"
  );
  console.log("%c// 2. Map them for reconnaissance", "color: #95a5a6;");
  console.log(
    "%cmapElementReflection(myElements);",
    "font-weight: bold; color: #e74c3c;"
  );

  console.log("\n%c🔍 SINGLE ELEMENT INSPECTION:", styles.warning);
  console.log(
    '%cinspectElement("input#search");     %c- Detailed element analysis',
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );

  console.log("\n%c📋 HELP & EXPORT:", styles.warning);
  console.log(
    "%cshowReconHelp();                   %c- Detailed help and examples",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%cexportReconResults();              %c- Export reconnaissance data",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );

  console.log("\n%c🎯 BUG BOUNTY FOCUS:", styles.recon);
  console.log(
    "%c  ✅ Pure reconnaissance - no testing or payloads",
    "color: #27ae60;"
  );
  console.log(
    "%c  ✅ Manual element input - you control what to analyze",
    "color: #27ae60;"
  );
  console.log(
    "%c  ✅ Professional data export for reporting",
    "color: #27ae60;"
  );

  // ===========================================
  // 🔬 ADVANCED SINK DETECTION ENGINE
  // ===========================================

  const advancedSinkCatalog = {
  // Modern framework-specific sinks
  framework: {
    dangerouslySetInnerHTML: {
      description: "React dangerous HTML injection sink",
      risk: "CRITICAL",
      framework: "React",
      attackVector: "Direct HTML injection via React props",
      mitigation: "Use DOMPurify before setting",
    },
    vHtml: {
      description: "Vue.js HTML binding sink",
      risk: "CRITICAL",
      framework: "Vue",
      attackVector: "v-html directive injection",
      mitigation: "Sanitize content before binding",
    },
    innerHTML_binding: {
      description: "Angular HTML binding sink",
      risk: "HIGH",
      framework: "Angular",
      attackVector: "[innerHTML] property binding",
      mitigation: "Use DomSanitizer.bypassSecurityTrustHtml",
    },
    bypassSecurityTrustHtml: {
      description: "Angular security bypass sink",
      risk: "CRITICAL",
      framework: "Angular",
      attackVector: "Security context bypass",
      mitigation: "Only use with trusted content",
    },
    sanitize_bypass: {
      description: "Angular sanitizer bypass",
      risk: "CRITICAL",
      framework: "Angular",
      attackVector: "SecurityContext bypass",
      mitigation: "Validate content before bypassing",
    },
  },

  // Template injection sinks
  template: {
    template_literal: {
      description: "Template literal injection sink",
      risk: "HIGH",
      pattern: "${userInput}",
      attackVector: "Expression injection in templates",
    },
    string_interpolation: {
      description: "String interpolation sink",
      risk: "HIGH",
      pattern: "{{userInput}}",
      attackVector: "Template expression injection",
    },
    dynamic_template: {
      description: "Dynamic template compilation",
      risk: "CRITICAL",
      pattern: "new Function(template)",
      attackVector: "Remote template injection",
    },
  },

  // Web API sinks
  webapi: {
    postMessage: {
      description: "Cross-window messaging sink",
      risk: "HIGH",
      attackVector: "Message event injection",
      mitigation: "Validate message origin",
    },
    addEventListener_message: {
      description: "Message event listener sink",
      risk: "HIGH",
      attackVector: "Cross-origin message handling",
      mitigation: "Check event.origin",
    },
    fetch: {
      description: "Fetch API sink",
      risk: "MEDIUM",
      attackVector: "URL injection, credential leakage",
      mitigation: "Validate URLs, use CORS properly",
    },
    XMLHttpRequest: {
      description: "XHR request sink",
      risk: "MEDIUM",
      attackVector: "URL injection, response handling",
      mitigation: "Validate URLs, sanitize responses",
    },
    WebSocket: {
      description: "WebSocket connection sink",
      risk: "HIGH",
      attackVector: "Protocol injection, data exfiltration",
      mitigation: "Validate WebSocket URLs",
    },
    importScripts: {
      description: "Service Worker import sink",
      risk: "CRITICAL",
      attackVector: "Remote script injection",
      mitigation: "Only import trusted scripts",
    },
    createObjectURL: {
      description: "Object URL creation sink",
      risk: "MEDIUM",
      attackVector: "Blob URL injection",
      mitigation: "Revoke URLs after use",
    },
  },

  // Storage sinks
  storage: {
    localStorage_setItem: {
      description: "Local storage write sink",
      risk: "MEDIUM",
      attackVector: "Stored XSS via localStorage",
      mitigation: "Sanitize before storing",
    },
    sessionStorage_setItem: {
      description: "Session storage write sink",
      risk: "MEDIUM",
      attackVector: "Session-based XSS",
      mitigation: "Sanitize before storing",
    },
    cookie_write: {
      description: "Cookie write sink",
      risk: "HIGH",
      attackVector: "Cookie manipulation, session fixation",
      mitigation: "Use HttpOnly, Secure flags",
    },
    indexedDB_add: {
      description: "IndexedDB write sink",
      risk: "MEDIUM",
      attackVector: "Stored data injection",
      mitigation: "Validate data before storage",
    },
  },

  // DOM manipulation methods
  domManipulation: {
    appendChild: {
      description: "DOM append child sink",
      risk: "MEDIUM",
      attackVector: "Dynamic element injection",
      mitigation: "Create elements safely",
    },
    prepend: {
      description: "DOM prepend sink",
      risk: "MEDIUM",
      attackVector: "Element injection at start",
      mitigation: "Validate content before prepending",
    },
    before: {
      description: "DOM before insertion sink",
      risk: "MEDIUM",
      attackVector: "Sibling element injection",
      mitigation: "Sanitize inserted content",
    },
    after: {
      description: "DOM after insertion sink",
      risk: "MEDIUM",
      attackVector: "Sibling element injection",
      mitigation: "Sanitize inserted content",
    },
    replaceWith: {
      description: "DOM replace with sink",
      risk: "HIGH",
      attackVector: "Element replacement attack",
      mitigation: "Validate replacement content",
    },
    insertAdjacentElement: {
      description: "Adjacent element insertion sink",
      risk: "MEDIUM",
      attackVector: "Positional element injection",
      mitigation: "Sanitize element before insertion",
    },
    replaceChild: {
      description: "DOM replace child sink",
      risk: "HIGH",
      attackVector: "Child element replacement",
      mitigation: "Validate new child element",
    },
    cloneNode: {
      description: "Node cloning sink",
      risk: "LOW",
      attackVector: "Cloning malicious attributes",
      mitigation: "Clean cloned nodes",
    },
  },

  // Attribute manipulation sinks
  attributeManipulation: {
    setAttribute: {
      description: "Attribute setting sink",
      risk: "MEDIUM",
      attackVector: "Dynamic attribute injection",
      mitigation: "Validate attribute names and values",
    },
    setAttributeNS: {
      description: "Namespaced attribute setting sink",
      risk: "MEDIUM",
      attackVector: "Namespace-based injection",
      mitigation: "Validate namespace and attributes",
    },
    removeAttribute: {
      description: "Attribute removal sink",
      risk: "LOW",
      attackVector: "Security attribute removal",
      mitigation: "Don't remove security attributes",
    },
  },

  // Style manipulation sinks
  style: {
    style_cssText: {
      description: "CSS text injection sink",
      risk: "MEDIUM",
      attackVector: "CSS injection, expression() abuse",
      mitigation: "Sanitize CSS values",
    },
    style_setProperty: {
      description: "CSS property setting sink",
      risk: "LOW",
      attackVector: "Style-based attacks",
      mitigation: "Validate CSS property values",
    },
    insertRule: {
      description: "CSS rule insertion sink",
      risk: "MEDIUM",
      attackVector: "Dynamic stylesheet injection",
      mitigation: "Sanitize CSS rules",
    },
    addRule: {
      description: "CSS rule addition sink (legacy)",
      risk: "MEDIUM",
      attackVector: "Legacy stylesheet injection",
      mitigation: "Use insertRule instead",
    },
  },

  // Document manipulation sinks
  document: {
    document_createElement: {
      description: "Dynamic element creation sink",
      risk: "MEDIUM",
      attackVector: "Script element injection",
      mitigation: "Avoid creating script elements",
    },
    document_createElementNS: {
      description: "Namespaced element creation sink",
      risk: "MEDIUM",
      attackVector: "SVG/MathML injection",
      mitigation: "Validate element types",
    },
    document_importNode: {
      description: "Node import sink",
      risk: "MEDIUM",
      attackVector: "Cross-document node injection",
      mitigation: "Sanitize imported nodes",
    },
    document_adoptNode: {
      description: "Node adoption sink",
      risk: "LOW",
      attackVector: "Cross-window node adoption",
      mitigation: "Validate adopted nodes",
    },
    document_fragment: {
      description: "Document fragment sink",
      risk: "LOW",
      attackVector: "Fragment-based injection",
      mitigation: "Sanitize fragment content",
    },
  },

  // Range and selection sinks
  range: {
    createContextualFragment: {
      description: "Contextual fragment creation sink",
      risk: "HIGH",
      attackVector: "HTML parsing with script execution",
      mitigation: "Sanitize HTML before parsing",
    },
    surroundContents: {
      description: "Range surround contents sink",
      risk: "MEDIUM",
      attackVector: "Content wrapping attacks",
      mitigation: "Validate wrapper elements",
    },
    insertNode: {
      description: "Range node insertion sink",
      risk: "MEDIUM",
      attackVector: "DOM node injection",
      mitigation: "Sanitize nodes before insertion",
    },
  },

  // Shadow DOM sinks
  shadowDOM: {
    attachShadow: {
      description: "Shadow DOM attachment sink",
      risk: "MEDIUM",
      attackVector: "Shadow DOM injection",
      mitigation: "Validate shadow root content",
    },
    shadowRoot_innerHTML: {
      description: "Shadow root HTML injection sink",
      risk: "CRITICAL",
      attackVector: "Shadow DOM XSS",
      mitigation: "Sanitize shadow content",
    },
  },

  // Custom element sinks
  customElements: {
    customElements_define: {
      description: "Custom element definition sink",
      risk: "HIGH",
      attackVector: "Custom element hijacking",
      mitigation: "Validate custom element definitions",
    },
    connectedCallback: {
      description: "Custom element connection sink",
      risk: "MEDIUM",
      attackVector: "Element lifecycle exploitation",
      mitigation: "Secure callback implementations",
    },
    attributeChangedCallback: {
      description: "Custom element attribute change sink",
      risk: "MEDIUM",
      attackVector: "Attribute manipulation attacks",
      mitigation: "Validate attribute changes",
    },
  },

  // Observer sinks
  observers: {
    MutationObserver: {
      description: "Mutation observer sink",
      risk: "LOW",
      attackVector: "DOM observation side channels",
      mitigation: "Limit observer scope",
    },
    IntersectionObserver: {
      description: "Intersection observer sink",
      risk: "LOW",
      attackVector: "Visibility observation",
      mitigation: "Use for legitimate purposes",
    },
    ResizeObserver: {
      description: "Resize observer sink",
      risk: "LOW",
      attackVector: "Size observation attacks",
      mitigation: "Limit observation scope",
    },
  },

  // History API sinks
  history: {
    history_pushState: {
      description: "History pushState sink",
      risk: "MEDIUM",
      attackVector: "URL manipulation, phishing",
      mitigation: "Validate state objects",
    },
    history_replaceState: {
      description: "History replaceState sink",
      risk: "MEDIUM",
      attackVector: "URL replacement attacks",
      mitigation: "Validate state objects",
    },
  },

  // Geolocation and device sinks
  device: {
    geolocation: {
      description: "Geolocation API sink",
      risk: "HIGH",
      attackVector: "Location data exfiltration",
      mitigation: "Require user consent",
    },
    DeviceOrientationEvent: {
      description: "Device orientation sink",
      risk: "MEDIUM",
      attackVector: "Motion data collection",
      mitigation: "Require permissions",
    },
    DeviceMotionEvent: {
      description: "Device motion sink",
      risk: "MEDIUM",
      attackVector: "Motion sensor abuse",
      mitigation: "Require permissions",
    },
  },

  // Media sinks
  media: {
    getUserMedia: {
      description: "Media capture sink",
      risk: "CRITICAL",
      attackVector: "Camera/microphone access",
      mitigation: "Require explicit consent",
    },
    MediaRecorder: {
      description: "Media recording sink",
      risk: "HIGH",
      attackVector: "Unauthorized recording",
      mitigation: "Require permissions",
    },
    AudioContext: {
      description: "Audio context sink",
      risk: "MEDIUM",
      attackVector: "Audio fingerprinting",
      mitigation: "Limit audio API access",
    },
  },

  // Canvas and WebGL sinks
  graphics: {
    canvas_toDataURL: {
      description: "Canvas data extraction sink",
      risk: "MEDIUM",
      attackVector: "Canvas fingerprinting",
      mitigation: "Restrict canvas access",
    },
    WebGLRenderingContext: {
      description: "WebGL context sink",
      risk: "MEDIUM",
      attackVector: "GPU fingerprinting",
      mitigation: "Limit WebGL capabilities",
    },
  },

  // Crypto and randomness sinks
  crypto: {
    crypto_getRandomValues: {
      description: "Random values sink",
      risk: "LOW",
      attackVector: "Entropy depletion",
      mitigation: "Use for legitimate randomness",
    },
    crypto_subtle: {
      description: "Subtle crypto sink",
      risk: "MEDIUM",
      attackVector: "Cryptographic operations",
      mitigation: "Use secure algorithms",
    },
  },

  // Performance and timing sinks
  performance: {
    performance_now: {
      description: "High-resolution timing sink",
      risk: "LOW",
      attackVector: "Timing attacks",
      mitigation: "Limit timing precision",
    },
    performance_mark: {
      description: "Performance marking sink",
      risk: "LOW",
      attackVector: "Performance observation",
      mitigation: "Use for legitimate profiling",
    },
  },

  // Notification sinks
  notifications: {
    Notification_requestPermission: {
      description: "Notification permission sink",
      risk: "MEDIUM",
      attackVector: "Notification spam",
      mitigation: "Request permission appropriately",
    },
    new_Notification: {
      description: "Notification creation sink",
      risk: "MEDIUM",
      attackVector: "Notification injection",
      mitigation: "Validate notification content",
    },
  },

  // Service Worker sinks
  serviceWorker: {
    navigator_serviceWorker_register: {
      description: "Service Worker registration sink",
      risk: "CRITICAL",
      attackVector: "Service Worker injection",
      mitigation: "Only register trusted workers",
    },
    serviceWorker_postMessage: {
      description: "Service Worker messaging sink",
      risk: "HIGH",
      attackVector: "Worker message injection",
      mitigation: "Validate message content",
    },
  },

  // Worker sinks
  workers: {
    Worker: {
      description: "Web Worker creation sink",
      risk: "HIGH",
      attackVector: "Worker script injection",
      mitigation: "Only load trusted workers",
    },
    SharedWorker: {
      description: "Shared Worker creation sink",
      risk: "HIGH",
      attackVector: "Shared worker injection",
      mitigation: "Validate worker scripts",
    },
  },

  // iframe sinks
  iframe: {
    iframe_srcdoc: {
      description: "iframe srcdoc injection sink",
      risk: "CRITICAL",
      attackVector: "Inline frame injection",
      mitigation: "Sanitize srcdoc content",
    },
    iframe_sandbox: {
      description: "iframe sandbox manipulation sink",
      risk: "HIGH",
      attackVector: "Sandbox bypass",
      mitigation: "Set appropriate sandbox flags",
    },
    iframe_contentWindow: {
      description: "iframe contentWindow access sink",
      risk: "HIGH",
      attackVector: "Cross-frame scripting",
      mitigation: "Validate frame origins",
    },
    iframe_contentDocument: {
      description: "iframe contentDocument access sink",
      risk: "HIGH",
      attackVector: "Cross-frame document access",
      mitigation: "Check frame origins",
    },
  },

  // Window manipulation sinks
  window: {
    window_resizeTo: {
      description: "Window resize sink",
      risk: "LOW",
      attackVector: "Window manipulation",
      mitigation: "Use sparingly",
    },
    window_moveTo: {
      description: "Window move sink",
      risk: "LOW",
      attackVector: "Window positioning attacks",
      mitigation: "Avoid window movement",
    },
    window_focus: {
      description: "Window focus sink",
      risk: "LOW",
      attackVector: "Focus stealing",
      mitigation: "Use appropriately",
    },
    window_blur: {
      description: "Window blur sink",
      risk: "LOW",
      attackVector: "Focus manipulation",
      mitigation: "Use appropriately",
    },
  },

  // Clipboard sinks
  clipboard: {
    clipboard_writeText: {
      description: "Clipboard write sink",
      risk: "MEDIUM",
      attackVector: "Clipboard poisoning",
      mitigation: "Validate clipboard content",
    },
    clipboard_readText: {
      description: "Clipboard read sink",
      risk: "HIGH",
      attackVector: "Clipboard data exfiltration",
      mitigation: "Require user consent",
    },
    document_execCommand_copy: {
      description: "Copy command sink",
      risk: "MEDIUM",
      attackVector: "Clipboard manipulation",
      mitigation: "Use for legitimate copy",
    },
    document_execCommand_paste: {
      description: "Paste command sink",
      risk: "HIGH",
      attackVector: "Clipboard content injection",
      mitigation: "Sanitize pasted content",
    },
  },

  // Drag and drop sinks
  dragdrop: {
    ondrop: {
      description: "Drop event sink",
      risk: "MEDIUM",
      attackVector: "File drop injection",
      mitigation: "Validate dropped files",
    },
    ondragover: {
      description: "Drag over event sink",
      risk: "LOW",
      attackVector: "Drag event handling",
      mitigation: "Handle drag events safely",
    },
    DataTransfer: {
      description: "Data transfer sink",
      risk: "MEDIUM",
      attackVector: "Transfer data manipulation",
      mitigation: "Validate transfer data",
    },
  },

  // File API sinks
  fileapi: {
    FileReader: {
      description: "File reading sink",
      risk: "HIGH",
      attackVector: "File content exfiltration",
      mitigation: "Validate file sources",
    },
    FileList: {
      description: "File list access sink",
      risk: "MEDIUM",
      attackVector: "File enumeration",
      mitigation: "Limit file access",
    },
    Blob: {
      description: "Blob creation sink",
      risk: "MEDIUM",
      attackVector: "Binary data injection",
      mitigation: "Validate Blob content",
    },
    File: {
      description: "File object creation sink",
      risk: "MEDIUM",
      attackVector: "File object manipulation",
      mitigation: "Validate file data",
    },
  },

  // URL API sinks
  urlapi: {
    URL_createObjectURL: {
      description: "Object URL creation sink",
      risk: "MEDIUM",
      attackVector: "Blob URL generation",
      mitigation: "Revoke URLs after use",
    },
    URL_revokeObjectURL: {
      description: "Object URL revocation sink",
      risk: "LOW",
      attackVector: "Resource cleanup",
      mitigation: "Always revoke URLs",
    },
    URLSearchParams: {
      description: "URL search params sink",
      risk: "LOW",
      attackVector: "Parameter parsing",
      mitigation: "Validate parameters",
    },
  },

  // Encoding sinks
  encoding: {
    atob: {
      description: "Base64 decoding sink",
      risk: "MEDIUM",
      attackVector: "Encoded payload execution",
      mitigation: "Validate decoded content",
    },
    btoa: {
      description: "Base64 encoding sink",
      risk: "LOW",
      attackVector: "Data encoding",
      mitigation: "Use for legitimate encoding",
    },
    TextEncoder: {
      description: "Text encoding sink",
      risk: "LOW",
      attackVector: "Character encoding",
      mitigation: "Use standard encodings",
    },
    TextDecoder: {
      description: "Text decoding sink",
      risk: "LOW",
      attackVector: "Character decoding",
      mitigation: "Validate encoding types",
    },
  },

  // Intl and localization sinks
  intl: {
    Intl_DateTimeFormat: {
      description: "Date formatting sink",
      risk: "LOW",
      attackVector: "Locale-based attacks",
      mitigation: "Use safe locales",
    },
    Intl_NumberFormat: {
      description: "Number formatting sink",
      risk: "LOW",
      attackVector: "Locale manipulation",
      mitigation: "Validate locales",
    },
  },

  // Proxy and reflection sinks
  proxy: {
    Proxy: {
      description: "Proxy creation sink",
      risk: "MEDIUM",
      attackVector: "Object interception",
      mitigation: "Use proxies carefully",
    },
    Reflect: {
      description: "Reflect API sink",
      risk: "MEDIUM",
      attackVector: "Reflection-based attacks",
      mitigation: "Validate reflect operations",
    },
  },

  // Weak reference sinks
  weakrefs: {
    WeakRef: {
      description: "Weak reference sink",
      risk: "LOW",
      attackVector: "Memory observation",
      mitigation: "Use for caching only",
    },
    FinalizationRegistry: {
      description: "Finalization registry sink",
      risk: "LOW",
      attackVector: "Garbage collection observation",
      mitigation: "Use appropriately",
    },
  },
};

// ===========================================
// 🔬 ADVANCED SINK DETECTION ENGINE
// ===========================================

function detectAdvancedSinks(element) {
  const detectedSinks = {
    framework: [],
    template: [],
    webapi: [],
    storage: [],
    domManipulation: [],
    attributeManipulation: [],
    style: [],
    document: [],
    range: [],
    shadowDOM: [],
    customElements: [],
    observers: [],
    history: [],
    device: [],
    media: [],
    graphics: [],
    crypto: [],
    performance: [],
    notifications: [],
    serviceWorker: [],
    workers: [],
    iframe: [],
    window: [],
    clipboard: [],
    dragdrop: [],
    fileapi: [],
    urlapi: [],
    encoding: [],
    intl: [],
    proxy: [],
    weakrefs: [],
  };

  // Check framework sinks
  Object.keys(advancedSinkCatalog.framework).forEach((sinkName) => {
    if (hasProperty(element, sinkName) || element.hasAttribute?.(sinkName)) {
      detectedSinks.framework.push({
        sink: sinkName,
        ...advancedSinkCatalog.framework[sinkName],
        detected: true,
      });
    }
  });

  // Check web API sinks
  Object.keys(advancedSinkCatalog.webapi).forEach((sinkName) => {
    const baseName = sinkName.split("_")[0];
    if (hasProperty(window, baseName) || hasProperty(element, sinkName)) {
      detectedSinks.webapi.push({
        sink: sinkName,
        ...advancedSinkCatalog.webapi[sinkName],
        detected: true,
      });
    }
  });

  // Check storage sinks
  if (element.hasAttribute?.("data-storage") || element.dataset?.storage) {
    detectedSinks.storage.push({
      sink: "data-storage",
      ...advancedSinkCatalog.storage.localStorage_setItem,
      detected: true,
    });
  }

  // Check DOM manipulation methods
  Object.keys(advancedSinkCatalog.domManipulation).forEach((sinkName) => {
    if (typeof element[sinkName] === "function") {
      detectedSinks.domManipulation.push({
        sink: sinkName,
        ...advancedSinkCatalog.domManipulation[sinkName],
        detected: true,
      });
    }
  });

  // Check attribute manipulation
  if (typeof element.setAttribute === "function") {
    detectedSinks.attributeManipulation.push({
      sink: "setAttribute",
      ...advancedSinkCatalog.attributeManipulation.setAttribute,
      detected: true,
    });
  }

  // Check style manipulation
  if (element.style) {
    detectedSinks.style.push({
      sink: "style",
      ...advancedSinkCatalog.style.style_cssText,
      detected: true,
    });
  }

  // Check shadow DOM
  if (typeof element.attachShadow === "function") {
    detectedSinks.shadowDOM.push({
      sink: "attachShadow",
      ...advancedSinkCatalog.shadowDOM.attachShadow,
      detected: true,
    });
  }

  // Check iframe specific sinks
  if (element.tagName === "IFRAME") {
    detectedSinks.iframe.push({
      sink: "iframe",
      ...advancedSinkCatalog.iframe.iframe_srcdoc,
      detected: true,
      hasSrcdoc: element.hasAttribute("srcdoc"),
      hasSandbox: element.hasAttribute("sandbox"),
    });
  }

  return detectedSinks;
}

// ===========================================
// 🕸️ MUTATION OBSERVER ENGINE
// ===========================================

class DOMMutationObserver {
  constructor(options = {}) {
    this.observer = null;
    this.mutations = [];
    this.options = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true,
      ...options,
    };
    this.callbacks = [];
    this.isObserving = false;
  }

  start(target = document.body) {
    if (this.isObserving) {
      console.log("%c⚠️ Observer already running", styles.warning);
      return;
    }

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(target, this.options);
    this.isObserving = true;

    console.log("%c🕸️ Mutation Observer started", styles.recon);
    console.log(`%c📍 Observing: ${target.tagName || "body"}`, styles.info);
  }

  stop() {
    if (this.observer && this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
      console.log("%c🕸️ Mutation Observer stopped", styles.warning);
    }
  }

  handleMutations(mutations) {
    mutations.forEach((mutation) => {
      const analyzedMutation = this.analyzeMutation(mutation);
      this.mutations.push(analyzedMutation);

      // Notify callbacks
      this.callbacks.forEach((callback) => callback(analyzedMutation));

      // Log suspicious mutations
      if (analyzedMutation.riskLevel !== "LOW") {
        this.logSuspiciousMutation(analyzedMutation);
      }
    });
  }

  analyzeMutation(mutation) {
    const analysis = {
      timestamp: new Date().toISOString(),
      type: mutation.type,
      riskLevel: "LOW",
      details: {},
      sinks: [],
      recommendations: [],
    };

    if (mutation.type === "childList") {
      this.analyzeChildListMutation(mutation, analysis);
    } else if (mutation.type === "attributes") {
      this.analyzeAttributeMutation(mutation, analysis);
    } else if (mutation.type === "characterData") {
      this.analyzeCharacterDataMutation(mutation, analysis);
    }

    return analysis;
  }

  analyzeChildListMutation(mutation, analysis) {
    const addedNodes = Array.from(mutation.addedNodes);
    const removedNodes = Array.from(mutation.removedNodes);

    addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName?.toLowerCase();

        // Check for script injection
        if (tagName === "script") {
          analysis.riskLevel = "CRITICAL";
          analysis.sinks.push("script_injection");
          analysis.recommendations.push(
            "Dynamic script injection detected - review source"
          );
        }

        // Check for iframe injection
        if (tagName === "iframe") {
          analysis.riskLevel = "HIGH";
          analysis.sinks.push("iframe_injection");
          analysis.recommendations.push("Validate iframe source and sandbox");
        }

        // Check for object/embed injection
        if (tagName === "object" || tagName === "embed") {
          analysis.riskLevel = "HIGH";
          analysis.sinks.push("object_injection");
          analysis.recommendations.push("Validate embedded content");
        }

        // Check for form injection
        if (tagName === "form") {
          analysis.riskLevel = "MEDIUM";
          analysis.sinks.push("form_injection");
          analysis.recommendations.push("Validate form action and method");
        }

        // Check for link injection
        if (tagName === "link") {
          analysis.riskLevel = "MEDIUM";
          analysis.sinks.push("link_injection");
          analysis.recommendations.push("Validate stylesheet source");
        }

        // Check for style injection
        if (tagName === "style") {
          analysis.riskLevel = "MEDIUM";
          analysis.sinks.push("style_injection");
          analysis.recommendations.push("Validate style content");
        }

        // Check for meta injection
        if (tagName === "meta") {
          analysis.riskLevel = "MEDIUM";
          analysis.sinks.push("meta_injection");
          analysis.recommendations.push("Validate meta tag content");
        }
      }
    });

    analysis.details = {
      addedNodes: addedNodes.length,
      removedNodes: removedNodes.length,
      addedTags: addedNodes
        .filter((n) => n.nodeType === Node.ELEMENT_NODE)
        .map((n) => n.tagName?.toLowerCase()),
      parentNode: mutation.target.tagName?.toLowerCase(),
    };
  }

  analyzeAttributeMutation(mutation, analysis) {
    const attributeName = mutation.attributeName;
    const element = mutation.target;
    const oldValue = mutation.oldValue;
    const newValue = element.getAttribute(attributeName);

    analysis.details = {
      attributeName,
      oldValue,
      newValue,
      element: element.tagName?.toLowerCase(),
      elementId: element.id,
    };

    // Check for dangerous attribute changes
    const dangerousAttributes = [
      "src",
      "href",
      "action",
      "formaction",
      "data",
      "poster",
      "innerHTML",
      "outerHTML",
    ];

    if (dangerousAttributes.includes(attributeName.toLowerCase())) {
      analysis.riskLevel = "HIGH";
      analysis.sinks.push(`attribute_change_${attributeName}`);
      analysis.recommendations.push(
        `Validate ${attributeName} value before applying`
      );
    }

    // Check for event handler changes
    if (attributeName.toLowerCase().startsWith("on")) {
      analysis.riskLevel = "CRITICAL";
      analysis.sinks.push(`event_handler_change_${attributeName}`);
      analysis.recommendations.push(
        "Event handler modification detected - review for XSS"
      );
    }

    // Check for style changes
    if (attributeName.toLowerCase() === "style") {
      analysis.riskLevel = "MEDIUM";
      analysis.sinks.push("style_change");
      analysis.recommendations.push("Validate style content for expressions");
    }

    // Check for class changes (potential CSS injection)
    if (attributeName.toLowerCase() === "class") {
      analysis.riskLevel = "LOW";
      analysis.sinks.push("class_change");
    }
  }

  analyzeCharacterDataMutation(mutation, analysis) {
    const oldValue = mutation.oldValue;
    const newValue = mutation.target.textContent;

    analysis.details = {
      oldValue: oldValue?.substring(0, 100),
      newValue: newValue?.substring(0, 100),
      nodeType: mutation.target.nodeType,
      parentNode: mutation.target.parentNode?.tagName?.toLowerCase(),
    };

    // Check for script content changes
    if (mutation.target.parentNode?.tagName?.toLowerCase() === "script") {
      analysis.riskLevel = "CRITICAL";
      analysis.sinks.push("script_content_change");
      analysis.recommendations.push(
        "Script content modification detected"
      );
    }

    // Check for style content changes
    if (mutation.target.parentNode?.tagName?.toLowerCase() === "style") {
      analysis.riskLevel = "MEDIUM";
      analysis.sinks.push("style_content_change");
      analysis.recommendations.push("Validate style content");
    }

    // Check for textarea/input value changes
    if (
      mutation.target.parentNode?.tagName?.toLowerCase() === "textarea" ||
      mutation.target.parentNode?.tagName?.toLowerCase() === "input"
    ) {
      analysis.riskLevel = "LOW";
      analysis.sinks.push("form_value_change");
    }
  }

  logSuspiciousMutation(analysis) {
    const styleMap = {
      CRITICAL: styles.critical,
      HIGH: styles.warning,
      MEDIUM: styles.info,
      LOW: styles.reflection,
    };

    console.log(
      `%c⚠️ ${analysis.riskLevel} RISK MUTATION DETECTED`,
      styleMap[analysis.riskLevel]
    );
    console.log(`%cType: ${analysis.type}`, styles.info);
    console.log(`%cSinks: ${analysis.sinks.join(", ")}`, styles.sink);

    if (analysis.recommendations.length > 0) {
      console.log("%cRecommendations:", styles.warning);
      analysis.recommendations.forEach((rec, i) =>
        console.log(`  ${i + 1}. ${rec}`)
      );
    }
  }

  onMutation(callback) {
    this.callbacks.push(callback);
  }

  getMutations() {
    return this.mutations;
  }

  getMutationSummary() {
    const summary = {
      totalMutations: this.mutations.length,
      riskDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      mutationTypes: {},
      topSinks: {},
    };

    this.mutations.forEach((m) => {
      summary.riskDistribution[m.riskLevel]++;
      summary.mutationTypes[m.type] = (summary.mutationTypes[m.type] || 0) + 1;

      m.sinks.forEach((sink) => {
        summary.topSinks[sink] = (summary.topSinks[sink] || 0) + 1;
      });
    });

    return summary;
  }
}

  // Create global mutation observer instance
  window.domMutationObserver = new DOMMutationObserver();

// ===========================================
// 🎯 GADGET CHAIN DETECTION ENGINE
// ===========================================

const gadgetChainCatalog = {
  // Prototype pollution chains
  prototypePollution: {
    name: "Prototype Pollution",
    description: "Object prototype manipulation chain",
    risk: "CRITICAL",
    patterns: [
      "__proto__",
      "constructor.prototype",
      "Object.prototype",
    ],
    sinks: ["Object.assign", "merge", "extend", "clone"],
    impact: "Global object pollution, potential RCE",
  },

  // DOM clobbering chains
  domClobbering: {
    name: "DOM Clobbering",
    description: "DOM element name/id exploitation",
    risk: "HIGH",
    patterns: ["named elements", "id attributes"],
    sinks: ["window[elementName]", "document.forms"],
    impact: "Variable overwrite, logic bypass",
  },

  // XSS via JSON
  xssViaJson: {
    name: "XSS via JSON",
    description: "JSON parsing and DOM injection chain",
    risk: "HIGH",
    patterns: ["JSON.parse", "eval", "innerHTML"],
    sinks: ["innerHTML", "document.write", "eval"],
    impact: "Cross-site scripting",
  },

  // PostMessage chains
  postMessageChain: {
    name: "PostMessage Exploitation",
    description: "Cross-window message exploitation",
    risk: "HIGH",
    patterns: ["postMessage", "message event listener"],
    sinks: ["event.data", "innerHTML", "eval"],
    impact: "Cross-origin attacks, data exfiltration",
  },

  // Angular sandbox bypass
  angularBypass: {
    name: "Angular Sandbox Bypass",
    description: "Angular template injection chain",
    risk: "CRITICAL",
    patterns: ["{{constructor.constructor", "ng-include"],
    sinks: ["$eval", "$parse", "innerHTML"],
    impact: "Template injection, XSS",
  },

  // jQuery chains
  jqueryChains: {
    name: "jQuery Exploitation",
    description: "jQuery method abuse chain",
    risk: "HIGH",
    patterns: ["$()", "jQuery()", ".html()", ".append()"],
    sinks: ["html", "append", "prepend", "after", "before"],
    impact: "DOM manipulation, XSS",
  },

  // React chains
  reactChains: {
    name: "React Exploitation",
    description: "React component injection chain",
    risk: "HIGH",
    patterns: ["dangerouslySetInnerHTML", "createElement"],
    sinks: ["innerHTML", "render", "hydrate"],
    impact: "Component injection, XSS",
  },

  // Vue chains
  vueChains: {
    name: "Vue.js Exploitation",
    description: "Vue directive injection chain",
    risk: "HIGH",
    patterns: ["v-html", "v-bind", "v-on"],
    sinks: ["innerHTML", "setAttribute"],
    impact: "Template injection, XSS",
  },

  // Service Worker chains
  serviceWorkerChain: {
    name: "Service Worker Exploitation",
    description: "Service Worker injection chain",
    risk: "CRITICAL",
    patterns: ["serviceWorker.register", "importScripts"],
    sinks: ["register", "importScripts", "postMessage"],
    impact: "Persistent XSS, MITM attacks",
  },

  // Web Storage chains
  webStorageChain: {
    name: "Web Storage Exploitation",
    description: "localStorage/sessionStorage abuse",
    risk: "MEDIUM",
    patterns: ["localStorage", "sessionStorage"],
    sinks: ["setItem", "getItem", "innerHTML"],
    impact: "Stored XSS, data persistence",
  },

  // URL-based chains
  urlBasedChain: {
    name: "URL-Based Exploitation",
    description: "URL parameter reflection chain",
    risk: "HIGH",
    patterns: ["location.search", "location.hash", "URLSearchParams"],
    sinks: ["innerHTML", "document.write", "eval"],
    impact: "Reflected XSS",
  },

  // Document fragment chains
  documentFragmentChain: {
    name: "Document Fragment Exploitation",
    description: "Fragment-based injection chain",
    risk: "MEDIUM",
    patterns: ["createDocumentFragment", "createContextualFragment"],
    sinks: ["appendChild", "innerHTML"],
    impact: "DOM injection, XSS",
  },

  // CSS injection chains
  cssInjectionChain: {
    name: "CSS Injection Chain",
    description: "Style-based attack chain",
    risk: "MEDIUM",
    patterns: ["style", "cssText", "insertRule"],
    sinks: ["setAttribute", "style.setProperty"],
    impact: "Data exfiltration via CSS",
  },

  // Web Worker chains
  webWorkerChain: {
    name: "Web Worker Exploitation",
    description: "Worker-based attack chain",
    risk: "HIGH",
    patterns: ["new Worker", "postMessage"],
    sinks: ["Worker", "importScripts"],
    impact: "Background execution, data exfiltration",
  },

  // WebSocket chains
  websocketChain: {
    name: "WebSocket Exploitation",
    description: "WebSocket communication abuse",
    risk: "HIGH",
    patterns: ["new WebSocket", "ws.send"],
    sinks: ["WebSocket", "send"],
    impact: "Real-time data exfiltration",
  },

  // Fetch API chains
  fetchChain: {
    name: "Fetch API Exploitation",
    description: "Fetch-based attack chain",
    risk: "MEDIUM",
    patterns: ["fetch(", "axios."],
    sinks: ["fetch", "XMLHttpRequest"],
    impact: "SSRF, data exfiltration",
  },

  // History API chains
  historyChain: {
    name: "History API Exploitation",
    description: "History manipulation chain",
    risk: "MEDIUM",
    patterns: ["history.pushState", "history.replaceState"],
    sinks: ["pushState", "replaceState"],
    impact: "URL spoofing, phishing",
  },

  // Clipboard chains
  clipboardChain: {
    name: "Clipboard Exploitation",
    description: "Clipboard manipulation chain",
    risk: "MEDIUM",
    patterns: ["clipboard.write", "document.execCommand('copy')"],
    sinks: ["writeText", "execCommand"],
    impact: "Clipboard poisoning",
  },

  // Drag and drop chains
  dragDropChain: {
    name: "Drag and Drop Exploitation",
    description: "Drag-drop based attack chain",
    risk: "MEDIUM",
    patterns: ["ondrop", "DataTransfer"],
    sinks: ["drop", "setData", "getData"],
    impact: "File injection, data theft",
  },

  // Intersection Observer chains
  intersectionObserverChain: {
    name: "Intersection Observer Exploitation",
    description: "Visibility-based attack chain",
    risk: "LOW",
    patterns: ["IntersectionObserver", "isIntersecting"],
    sinks: ["observe", "disconnect"],
    impact: "Timing attacks, tracking",
  },
};

function detectGadgetChains(element) {
  const detectedChains = [];

  // Check for prototype pollution patterns
  const hasUserProps = element && (
    element.constructor !== Object &&
    element.constructor !== Array &&
    typeof element.constructor === "function"
  );
  if (hasUserProps && element.constructor.prototype !== Object.prototype) {
    detectedChains.push({
      ...gadgetChainCatalog.prototypePollution,
      detected: true,
      evidence: "Prototype access detected",
    });
  }

  // Check for DOM clobbering patterns
  if (element.name || element.id) {
    const potentialClobbering = document.querySelectorAll(
      `[name="${element.name}"], [id="${element.id}"]`
    );
    if (potentialClobbering.length > 1) {
      detectedChains.push({
        ...gadgetChainCatalog.domClobbering,
        detected: true,
        evidence: `Multiple elements with name/id: ${element.name || element.id}`,
        count: potentialClobbering.length,
      });
    }
  }

  // Check for jQuery patterns
  if (window.jQuery || window.$) {
    const jqueryMethods = ["html", "append", "prepend", "after", "before"];
    jqueryMethods.forEach((method) => {
      if (typeof element[method] === "function") {
        detectedChains.push({
          ...gadgetChainCatalog.jqueryChains,
          detected: true,
          evidence: `jQuery method: ${method}`,
        });
      }
    });
  }

  // Check for Angular patterns
  if (element.hasAttribute?.("ng-app") || window.angular) {
    detectedChains.push({
      ...gadgetChainCatalog.angularBypass,
      detected: true,
      evidence: "Angular framework detected",
    });
  }

  // Check for React patterns
  if (element._reactRootContainer || element.__reactFiber$) {
    detectedChains.push({
      ...gadgetChainCatalog.reactChains,
      detected: true,
      evidence: "React internal properties detected",
    });
  }

  // Check for Vue patterns
  if (element.__vue__ || element._vue) {
    detectedChains.push({
      ...gadgetChainCatalog.vueChains,
      detected: true,
      evidence: "Vue.js instance detected",
    });
  }

  // Check for postMessage patterns
  if (typeof element.postMessage === "function") {
    detectedChains.push({
      ...gadgetChainCatalog.postMessageChain,
      detected: true,
      evidence: "postMessage method available",
    });
  }

  // Check for service worker patterns
  if (navigator.serviceWorker) {
    detectedChains.push({
      ...gadgetChainCatalog.serviceWorkerChain,
      detected: true,
      evidence: "Service Worker API available",
    });
  }

  // Check for WebSocket patterns
  if (typeof window.WebSocket === "function") {
    detectedChains.push({
      ...gadgetChainCatalog.websocketChain,
      detected: true,
      evidence: "WebSocket API available",
    });
  }

  // Check for fetch patterns
  if (typeof window.fetch === "function") {
    detectedChains.push({
      ...gadgetChainCatalog.fetchChain,
      detected: true,
      evidence: "Fetch API available",
    });
  }

  // Check for Worker patterns
  if (typeof window.Worker === "function") {
    detectedChains.push({
      ...gadgetChainCatalog.webWorkerChain,
      detected: true,
      evidence: "Worker API available",
    });
  }

  return detectedChains;
}

// ===========================================
// 🛡️ CSP ANALYSIS ENGINE
// ===========================================

function analyzeCSP() {
  const cspAnalysis = {
    hasCSP: false,
    policies: {},
    weaknesses: [],
    bypasses: [],
    recommendations: [],
    riskLevel: "UNKNOWN",
  };

  // Get CSP from meta tag or headers
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const cspHeader = cspMeta?.getAttribute("content");

  if (cspHeader) {
    cspAnalysis.hasCSP = true;
    cspAnalysis.policies = parseCSP(cspHeader);
    analyzeCSPPolicies(cspAnalysis);
  } else {
    cspAnalysis.hasCSP = false;
    cspAnalysis.weaknesses.push("No CSP policy detected");
    cspAnalysis.recommendations.push(
      "Implement a Content-Security-Policy header"
    );
  }

  return cspAnalysis;
}

function parseCSP(cspString) {
  const policies = {};
  const directives = cspString.split(";");

  directives.forEach((directive) => {
    const parts = directive.trim().split(/\s+/);
    if (parts.length >= 2) {
      const name = parts[0];
      const values = parts.slice(1);
      policies[name] = values;
    }
  });

  return policies;
}

function analyzeCSPPolicies(analysis) {
  const policies = analysis.policies;

  // Check script-src
  if (policies["script-src"]) {
    const scriptSrc = policies["script-src"];

    if (scriptSrc.includes("'unsafe-inline'")) {
      analysis.weaknesses.push("script-src allows unsafe-inline");
      analysis.bypasses.push("Inline script injection possible");
      analysis.recommendations.push(
        "Remove 'unsafe-inline' from script-src"
      );
    }

    if (scriptSrc.includes("'unsafe-eval'")) {
      analysis.weaknesses.push("script-src allows unsafe-eval");
      analysis.bypasses.push("eval() and similar functions allowed");
      analysis.recommendations.push(
        "Remove 'unsafe-eval' from script-src"
      );
    }

    if (scriptSrc.includes("*")) {
      analysis.weaknesses.push("script-src allows any source");
      analysis.bypasses.push("Scripts can be loaded from any domain");
      analysis.recommendations.push(
        "Restrict script-src to trusted domains"
      );
    }

    if (scriptSrc.includes("data:")) {
      analysis.weaknesses.push("script-src allows data: URLs");
      analysis.bypasses.push("Data URL script injection possible");
      analysis.recommendations.push("Remove 'data:' from script-src");
    }
  } else {
    analysis.weaknesses.push("No script-src directive");
    analysis.recommendations.push("Add script-src directive");
  }

  // Check style-src
  if (policies["style-src"]) {
    const styleSrc = policies["style-src"];

    if (styleSrc.includes("'unsafe-inline'")) {
      analysis.weaknesses.push("style-src allows unsafe-inline");
      analysis.bypasses.push("Inline style injection possible");
    }
  }

  // Check default-src
  if (!policies["default-src"] && !policies["script-src"]) {
    analysis.weaknesses.push("No default-src or script-src");
    analysis.recommendations.push("Add default-src directive");
  }

  // Check object-src
  if (policies["object-src"]?.includes("*")) {
    analysis.weaknesses.push("object-src allows any source");
    analysis.bypasses.push("Flash/object injection possible");
    analysis.recommendations.push("Restrict object-src");
  }

  // Check base-uri
  if (!policies["base-uri"]) {
    analysis.weaknesses.push("No base-uri restriction");
    analysis.bypasses.push("Base tag injection possible");
    analysis.recommendations.push("Add base-uri directive");
  }

  // Check frame-ancestors
  if (!policies["frame-ancestors"]) {
    analysis.weaknesses.push("No frame-ancestors restriction");
    analysis.bypasses.push("Clickjacking possible");
    analysis.recommendations.push("Add frame-ancestors directive");
  }

  // Check upgrade-insecure-requests
  if (!policies["upgrade-insecure-requests"]) {
    analysis.weaknesses.push("No upgrade-insecure-requests");
    analysis.recommendations.push(
      "Add upgrade-insecure-requests for HTTPS"
    );
  }

  // Determine risk level
  if (analysis.weaknesses.length === 0) {
    analysis.riskLevel = "LOW";
  } else if (analysis.weaknesses.length <= 3) {
    analysis.riskLevel = "MEDIUM";
  } else if (analysis.weaknesses.length <= 6) {
    analysis.riskLevel = "HIGH";
  } else {
    analysis.riskLevel = "CRITICAL";
  }
}

// ===========================================
// 🔗 SOURCE-TO-SINK ANALYSIS ENGINE
// ===========================================

const sourceCatalog = {
  // URL-based sources
  urlSources: {
    "location.search": { description: "URL query string", risk: "HIGH" },
    "location.hash": { description: "URL fragment", risk: "MEDIUM" },
    "location.pathname": { description: "URL path", risk: "MEDIUM" },
    "location.href": { description: "Full URL", risk: "HIGH" },
    "document.URL": { description: "Document URL", risk: "HIGH" },
    "document.documentURI": { description: "Document URI", risk: "HIGH" },
    "document.baseURI": { description: "Base URI", risk: "MEDIUM" },
  },

  // Referrer and navigation
  navigationSources: {
    "document.referrer": { description: "Referring page", risk: "MEDIUM" },
    "window.name": { description: "Window name", risk: "MEDIUM" },
    "history.state": { description: "History state", risk: "LOW" },
  },

  // Storage sources
  storageSources: {
    "localStorage": { description: "Local storage", risk: "MEDIUM" },
    "sessionStorage": { description: "Session storage", risk: "MEDIUM" },
    "document.cookie": { description: "Cookies", risk: "HIGH" },
    "indexedDB": { description: "IndexedDB", risk: "MEDIUM" },
  },

  // Message sources
  messageSources: {
    "postMessage.data": { description: "Message data", risk: "HIGH" },
    "MessageEvent.data": { description: "Message event data", risk: "HIGH" },
    "WebSocket.onmessage": { description: "WebSocket message", risk: "HIGH" },
  },

  // User input sources
  userInputSources: {
    "input.value": { description: "Input field value", risk: "HIGH" },
    "textarea.value": { description: "Textarea value", risk: "HIGH" },
    "select.value": { description: "Select value", risk: "MEDIUM" },
    "form.elements": { description: "Form elements", risk: "HIGH" },
  },

  // Environment sources
  environmentSources: {
    "navigator.userAgent": { description: "User agent", risk: "LOW" },
    "navigator.language": { description: "Browser language", risk: "LOW" },
    "screen.width": { description: "Screen width", risk: "LOW" },
    "screen.height": { description: "Screen height", risk: "LOW" },
    "Date.now()": { description: "Current timestamp", risk: "LOW" },
  },

  // API response sources
  apiSources: {
    "fetch().then()": { description: "Fetch response", risk: "HIGH" },
    "XMLHttpRequest.responseText": {
      description: "XHR response",
      risk: "HIGH",
    },
    "XMLHttpRequest.responseJSON": {
      description: "XHR JSON response",
      risk: "HIGH",
    },
  },
};

const sinkCatalog = {
  // Execution sinks
  executionSinks: {
    eval: { description: "Code evaluation", risk: "CRITICAL" },
    Function: { description: "Function constructor", risk: "CRITICAL" },
    "setTimeout(string)": { description: "String timeout", risk: "CRITICAL" },
    "setInterval(string)": { description: "String interval", risk: "CRITICAL" },
  },

  // DOM manipulation sinks
  domSinks: {
    innerHTML: { description: "HTML injection", risk: "CRITICAL" },
    outerHTML: { description: "Outer HTML injection", risk: "CRITICAL" },
    "document.write": { description: "Document write", risk: "CRITICAL" },
    "document.writeln": { description: "Document writeln", risk: "CRITICAL" },
    insertAdjacentHTML: { description: "Adjacent HTML", risk: "HIGH" },
    createContextualFragment: {
      description: "Contextual fragment",
      risk: "HIGH",
    },
  },

  // Navigation sinks
  navigationSinks: {
    "location.href": { description: "URL navigation", risk: "HIGH" },
    "location.assign": { description: "URL assignment", risk: "HIGH" },
    "location.replace": { description: "URL replacement", risk: "HIGH" },
    "window.open": { description: "Window open", risk: "HIGH" },
    "form.action": { description: "Form action", risk: "HIGH" },
  },

  // Attribute sinks
  attributeSinks: {
    "element.setAttribute": { description: "Attribute setting", risk: "MEDIUM" },
    "element.src": { description: "Source attribute", risk: "MEDIUM" },
    "element.href": { description: "Href attribute", risk: "MEDIUM" },
  },

  // Event handler sinks
  eventSinks: {
    "element.onclick": { description: "Click handler", risk: "HIGH" },
    "element.onload": { description: "Load handler", risk: "HIGH" },
    "element.onerror": { description: "Error handler", risk: "HIGH" },
    "element.onmessage": { description: "Message handler", risk: "HIGH" },
  },
};

function analyzeSourceToSink() {
  const analysis = {
    sources: [],
    sinks: [],
    flows: [],
    riskLevel: "LOW",
    recommendations: [],
  };

  // Detect active sources
  Object.entries(sourceCatalog).forEach(([category, sources]) => {
    Object.entries(sources).forEach(([name, info]) => {
      const detected = detectSource(name, category);
      if (detected) {
        analysis.sources.push({
          name,
          ...info,
          detected: true,
        });
      }
    });
  });

  // Detect active sinks
  Object.entries(sinkCatalog).forEach(([category, sinks]) => {
    Object.entries(sinks).forEach(([name, info]) => {
      const detected = detectSink(name, category);
      if (detected) {
        analysis.sinks.push({
          name,
          ...info,
          detected: true,
        });
      }
    });
  });

  // Analyze potential flows
  analysis.sources.forEach((source) => {
    analysis.sinks.forEach((sink) => {
      if (isFlowPossible(source, sink)) {
        analysis.flows.push({
          source: source.name,
          sink: sink.name,
          combinedRisk: calculateCombinedRisk(source, sink),
        });
      }
    });
  });

  // Determine overall risk
  if (analysis.flows.length > 0) {
    const hasCritical = analysis.flows.some(
      (f) => f.combinedRisk === "CRITICAL"
    );
    const hasHigh = analysis.flows.some((f) => f.combinedRisk === "HIGH");

    if (hasCritical) {
      analysis.riskLevel = "CRITICAL";
    } else if (hasHigh) {
      analysis.riskLevel = "HIGH";
    } else {
      analysis.riskLevel = "MEDIUM";
    }
  }

  // Generate recommendations
  if (analysis.flows.length > 0) {
    analysis.recommendations.push(
      `Review ${analysis.flows.length} potential source-to-sink flows`
    );
    analysis.recommendations.push("Implement input validation for all sources");
    analysis.recommendations.push("Use output encoding for all sinks");
    analysis.recommendations.push(
      "Consider implementing a CSP to mitigate risks"
    );
  }

  return analysis;
}

function detectSource(sourceName, category) {
  try {
    switch (category) {
      case "urlSources":
        const value = eval(sourceName);
        return value && value.length > 0;
      case "storageSources":
        if (sourceName === "localStorage" && window.localStorage) {
          return Object.keys(localStorage).length > 0;
        }
        if (sourceName === "sessionStorage" && window.sessionStorage) {
          return Object.keys(sessionStorage).length > 0;
        }
        return false;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

function detectSink(sinkName, category) {
  try {
    const parts = sinkName.split(".");
    let obj = window;

    for (const part of parts) {
      if (obj[part] !== undefined) {
        obj = obj[part];
      } else {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function isFlowPossible(source, sink) {
  // Simple heuristic: if source is user-controlled and sink is dangerous
  const highRiskSources = [
    "location.search",
    "location.hash",
    "document.referrer",
    "window.name",
    "postMessage.data",
    "input.value",
  ];

  const criticalSinks = [
    "eval",
    "innerHTML",
    "document.write",
    "Function",
  ];

  return (
    highRiskSources.includes(source.name) && criticalSinks.includes(sink.name)
  );
}

function calculateCombinedRisk(source, sink) {
  if (source.risk === "HIGH" && sink.risk === "CRITICAL") {
    return "CRITICAL";
  }
  if (source.risk === "HIGH" || sink.risk === "CRITICAL") {
    return "HIGH";
  }
  if (source.risk === "MEDIUM" || sink.risk === "HIGH") {
    return "MEDIUM";
  }
  return "LOW";
}

// ===========================================
// 📊 COMPREHENSIVE REPORT GENERATOR
// ===========================================

function generateComprehensiveReport(elements = []) {
  const report = {
    metadata: {
      tool: "Advanced DOM Sink & Reflection Mapper",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
    summary: {
      totalElements: elements.length,
      totalSinks: 0,
      totalReflections: 0,
      totalGadgetChains: 0,
      overallRisk: "UNKNOWN",
    },
    cspAnalysis: analyzeCSP(),
    sourceToSinkAnalysis: analyzeSourceToSink(),
    elements: [],
    gadgetChains: [],
    recommendations: [],
  };

  // Analyze each element
  elements.forEach((element, index) => {
    const elementAnalysis = {
      index,
      basicInfo: extractElementInfo(element),
      domSinks: mapElementSinks(element),
      advancedSinks: typeof detectAdvancedSinks === 'function' ? detectAdvancedSinks(element) : {},
      reflections: mapReflectionPoints(element),
      dataFlow: analyzeDataFlow(element),
      securityProfile: generateSecurityProfile(element),
      gadgetChains: typeof detectGadgetChains === 'function' ? detectGadgetChains(element) : [],
      xpath: getElementXPath(element),
    };

    report.elements.push(elementAnalysis);
    report.summary.totalSinks += countSinks(elementAnalysis);
    report.summary.totalReflections += countReflections(elementAnalysis);
    report.summary.totalGadgetChains += elementAnalysis.gadgetChains.length;
  });

  // Detect gadget chains at page level
  report.gadgetChains = typeof detectGadgetChains === 'function' ? detectGadgetChains(document.body) : [];

  // Calculate overall risk
  report.summary.overallRisk = calculateOverallRisk(report);

  // Generate recommendations
  report.recommendations = generateComprehensiveRecommendations(report);

  return report;
}

function countSinks(elementAnalysis) {
  let count = 0;

  // Count basic sinks
  Object.values(elementAnalysis.domSinks).forEach((category) => {
    count += category.filter((s) => s.present).length;
  });

  // Count advanced sinks
  Object.values(elementAnalysis.advancedSinks).forEach((category) => {
    count += category.filter((s) => s.detected).length;
  });

  return count;
}

function countReflections(elementAnalysis) {
  let count = 0;

  Object.values(elementAnalysis.reflections).forEach((reflection) => {
    if (reflection.hasReflection) {
      count++;
    }
  });

  return count;
}

function calculateOverallRisk(report) {
  let riskScore = 0;

  // CSP risk
  if (report.cspAnalysis.riskLevel === "CRITICAL") riskScore += 30;
  else if (report.cspAnalysis.riskLevel === "HIGH") riskScore += 20;
  else if (report.cspAnalysis.riskLevel === "MEDIUM") riskScore += 10;

  // Source-to-sink risk
  if (report.sourceToSinkAnalysis.riskLevel === "CRITICAL") riskScore += 30;
  else if (report.sourceToSinkAnalysis.riskLevel === "HIGH") riskScore += 20;
  else if (report.sourceToSinkAnalysis.riskLevel === "MEDIUM") riskScore += 10;

  // Element risks
  report.elements.forEach((elem) => {
    riskScore += elem.securityProfile.riskScore / 10;
  });

  // Gadget chain risks
  report.summary.totalGadgetChains * 5;

  // Determine risk level
  if (riskScore >= 50) return "CRITICAL";
  if (riskScore >= 30) return "HIGH";
  if (riskScore >= 15) return "MEDIUM";
  if (riskScore > 0) return "LOW";
  return "MINIMAL";
}

function generateComprehensiveRecommendations(report) {
  const recommendations = [];

  // CSP recommendations
  if (!report.cspAnalysis.hasCSP) {
    recommendations.push({
      priority: "HIGH",
      category: "CSP",
      recommendation: "Implement Content-Security-Policy header",
    });
  } else {
    report.cspAnalysis.recommendations.forEach((rec) => {
      recommendations.push({
        priority: "MEDIUM",
        category: "CSP",
        recommendation: rec,
      });
    });
  }

  // Source-to-sink recommendations
  report.sourceToSinkAnalysis.recommendations.forEach((rec) => {
    recommendations.push({
      priority: "HIGH",
      category: "Data Flow",
      recommendation: rec,
    });
  });

  // Element-specific recommendations
  report.elements.forEach((elem) => {
    if (elem.securityProfile.riskScore > 10) {
      recommendations.push({
        priority: "HIGH",
        category: "Element Security",
        recommendation: `Review ${elem.basicInfo.tag}#${elem.basicInfo.id} - risk score: ${elem.securityProfile.riskScore}`,
      });
    }
  });

  // Gadget chain recommendations
  if (report.summary.totalGadgetChains > 0) {
    recommendations.push({
      priority: "CRITICAL",
      category: "Gadget Chains",
      recommendation: `Investigate ${report.summary.totalGadgetChains} detected gadget chains`,
    });
  }

  return recommendations;
}

// ===========================================
// 📋 ENHANCED EXPORT FUNCTIONS
// ===========================================

function exportComprehensiveReport(format = "json") {
  const elements = Array.from(document.querySelectorAll("*"));
  const report = generateComprehensiveReport(elements.slice(0, 100)); // Limit to 100 elements

  if (format === "json") {
    const jsonString = JSON.stringify(report, null, 2);
    downloadReconFile(
      jsonString,
      `comprehensive-dom-report-${Date.now()}.json`,
      "application/json"
    );
    console.log("%c✅ Comprehensive report exported as JSON!", styles.reflection);
  } else if (format === "html") {
    const htmlReport = generateHTMLReport(report);
    downloadReconFile(
      htmlReport,
      `comprehensive-dom-report-${Date.now()}.html`,
      "text/html"
    );
    console.log("%c✅ Comprehensive report exported as HTML!", styles.reflection);
  }

  return report;
}

function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM Security Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .section { margin: 20px 0; padding: 15px; background: #ecf0f1; border-radius: 4px; }
        .critical { background: #ffebee; border-left: 4px solid #e74c3c; }
        .high { background: #fff3e0; border-left: 4px solid #f39c12; }
        .medium { background: #e3f2fd; border-left: 4px solid #3498db; }
        .low { background: #e8f5e9; border-left: 4px solid #27ae60; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border: 1px solid #bdc3c7; }
        th { background: #34495e; color: white; }
        tr:nth-child(even) { background: #ecf0f1; }
        .metadata { color: #7f8c8d; font-size: 0.9em; }
        .recommendation { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .risk-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
        .risk-critical { background: #e74c3c; }
        .risk-high { background: #f39c12; }
        .risk-medium { background: #3498db; }
        .risk-low { background: #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 DOM Security Analysis Report</h1>
        
        <div class="section metadata">
            <h2>Report Metadata</h2>
            <p><strong>Generated:</strong> ${report.metadata.timestamp}</p>
            <p><strong>URL:</strong> ${report.metadata.url}</p>
            <p><strong>User Agent:</strong> ${report.metadata.userAgent}</p>
            <p><strong>Overall Risk:</strong> <span class="risk-badge risk-${report.summary.overallRisk.toLowerCase()}">${report.summary.overallRisk}</span></p>
        </div>

        <div class="section">
            <h2>📊 Executive Summary</h2>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Elements Analyzed</td><td>${report.summary.totalElements}</td></tr>
                <tr><td>Total Sinks Found</td><td>${report.summary.totalSinks}</td></tr>
                <tr><td>Total Reflections</td><td>${report.summary.totalReflections}</td></tr>
                <tr><td>Gadget Chains Detected</td><td>${report.summary.totalGadgetChains}</td></tr>
            </table>
        </div>

        <div class="section ${report.cspAnalysis.hasCSP ? 'medium' : 'critical'}">
            <h2>🛡️ CSP Analysis</h2>
            <p><strong>CSP Present:</strong> ${report.cspAnalysis.hasCSP ? "Yes" : "No"}</p>
            <p><strong>Risk Level:</strong> <span class="risk-badge risk-${report.cspAnalysis.riskLevel.toLowerCase()}">${report.cspAnalysis.riskLevel}</span></p>
            ${report.cspAnalysis.weaknesses.length > 0 ? `
                <h3>Weaknesses:</h3>
                <ul>
                    ${report.cspAnalysis.weaknesses.map(w => `<li>${w}</li>`).join("")}
                </ul>
            ` : ""}
        </div>

        <div class="section">
            <h2>🔗 Source-to-Sink Analysis</h2>
            <p><strong>Sources Detected:</strong> ${report.sourceToSinkAnalysis.sources.length}</p>
            <p><strong>Sinks Detected:</strong> ${report.sourceToSinkAnalysis.sinks.length}</p>
            <p><strong>Potential Flows:</strong> ${report.sourceToSinkAnalysis.flows.length}</p>
            <p><strong>Risk Level:</strong> <span class="risk-badge risk-${report.sourceToSinkAnalysis.riskLevel.toLowerCase()}">${report.sourceToSinkAnalysis.riskLevel}</span></p>
        </div>

        <div class="section">
            <h2>📋 Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation ${rec.priority.toLowerCase()}">
                    <strong>[${rec.priority}]</strong> ${rec.recommendation}
                </div>
            `).join("")}
        </div>
    </div>
</body>
</html>`;
}

// ===========================================
// 🔄 REAL-TIME MONITORING DASHBOARD
// ===========================================

class SecurityDashboard {
  constructor() {
    this.mutationObserver = window.domMutationObserver;
    this.monitoringActive = false;
    this.events = [];
    this.alerts = [];
  }

  start() {
    this.monitoringActive = true;
    this.mutationObserver.start();
    this.mutationObserver.onMutation(this.handleMutation.bind(this));

    // Monitor for errors
    window.addEventListener("error", this.handleError.bind(this));
    window.addEventListener(
      "unhandledrejection",
      this.handleRejection.bind(this)
    );

    console.log("%c📊 Security Dashboard Started", styles.recon);
  }

  stop() {
    this.monitoringActive = false;
    this.mutationObserver.stop();
    console.log("%c📊 Security Dashboard Stopped", styles.warning);
  }

  handleMutation(analysis) {
    this.events.push({
      type: "mutation",
      timestamp: new Date().toISOString(),
      data: analysis,
    });

    if (analysis.riskLevel === "CRITICAL" || analysis.riskLevel === "HIGH") {
      this.alerts.push({
        type: "mutation",
        level: analysis.riskLevel,
        message: `High-risk mutation: ${analysis.sinks.join(", ")}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleError(event) {
    this.events.push({
      type: "error",
      timestamp: new Date().toISOString(),
      data: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });

    this.alerts.push({
      type: "error",
      level: "HIGH",
      message: `JavaScript error: ${event.message}`,
      timestamp: new Date().toISOString(),
    });
  }

  handleRejection(event) {
    this.events.push({
      type: "rejection",
      timestamp: new Date().toISOString(),
      data: {
        reason: event.reason?.toString(),
      },
    });
  }

  getDashboard() {
    return {
      monitoringActive: this.monitoringActive,
      totalEvents: this.events.length,
      totalAlerts: this.alerts.length,
      recentEvents: this.events.slice(-10),
      recentAlerts: this.alerts.slice(-10),
      mutationSummary: this.mutationObserver.getMutationSummary(),
    };
  }

  displayDashboard() {
    const dashboard = this.getDashboard();

    console.log("\n%c📊 SECURITY DASHBOARD", styles.banner);
    console.log(
      "%c════════════════════════════════════════════",
      "color: #8e44ad;"
    );

    console.log(
      `\n%cMonitoring: ${dashboard.monitoringActive ? "✅ Active" : "❌ Inactive"}`,
      styles.recon
    );
    console.log(`%cTotal Events: ${dashboard.totalEvents}`, styles.info);
    console.log(`%cTotal Alerts: ${dashboard.totalAlerts}`, styles.warning);

    if (dashboard.recentAlerts.length > 0) {
      console.log("\n%c🚨 Recent Alerts:", styles.critical);
      dashboard.recentAlerts.forEach((alert) => {
        console.log(
          `%c[${alert.level}] ${alert.message}`,
          alert.level === "CRITICAL" ? styles.critical : styles.warning
        );
      });
    }

    console.log("\n%c📈 Mutation Summary:", styles.info);
    console.table(dashboard.mutationSummary.riskDistribution);
  }
}

  // Create global dashboard instance
  window.securityDashboard = new SecurityDashboard();

// ===========================================
// 🎯 AUTO-SCAN FUNCTIONALITY
// ===========================================

function autoScan(options = {}) {
  const config = {
    maxElements: options.maxElements || 500,
    includeHidden: options.includeHidden || false,
    focusSelectors: options.focusSelectors || [],
    excludeSelectors: options.excludeSelectors || [],
    ...options,
  };

  console.log("%c🔄 Starting Auto-Scan...", styles.recon);
  console.log(`%c📋 Configuration:`, styles.info);
  console.log(`  Max Elements: ${config.maxElements}`);
  console.log(`  Include Hidden: ${config.includeHidden}`);

  // Collect elements
  let elements = [];

  if (config.focusSelectors.length > 0) {
    // Focus on specific selectors
    config.focusSelectors.forEach((selector) => {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (e) {
        console.log(`%c❌ Invalid selector: ${selector}`, styles.critical);
      }
    });
  } else {
    // Scan all elements
    const allElements = document.querySelectorAll("*");
    elements = Array.from(allElements);
  }

  // Filter elements
  if (!config.includeHidden) {
    elements = elements.filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }

  // Exclude specified selectors
  if (config.excludeSelectors.length > 0) {
    config.excludeSelectors.forEach((selector) => {
      elements = elements.filter((el) => !el.matches(selector));
    });
  }

  // Limit elements
  elements = elements.slice(0, config.maxElements);

  console.log(`%c📊 Found ${elements.length} elements to analyze`, styles.info);

  // Perform analysis
  const report = generateComprehensiveReport(elements);

  console.log("%c✅ Auto-Scan Complete!", styles.reflection);
  console.log(`%c🎯 Overall Risk: ${report.summary.overallRisk}`, styles.warning);

  return report;
}

// ===========================================
// 🔧 UTILITY ENHANCEMENTS
// ===========================================

function getElementCSSPath(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  const path = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();

    if (current.className) {
      const classes = current.className.split(" ").join(".");
      selector += `.${classes}`;
    }

    path.unshift(selector);
    current = current.parentNode;

    if (path.length > 5) break;
  }

  return path.join(" > ");
}

function getElementAttributes(element) {
  const attrs = {};
  Array.from(element.attributes).forEach((attr) => {
    attrs[attr.name] = attr.value;
  });
  return attrs;
}

function getEventListeners(element) {
  const listeners = {};

  // Try to get listeners using various methods
  const eventTypes = [
    "click",
    "mouseover",
    "mouseout",
    "keydown",
    "keyup",
    "submit",
    "change",
    "focus",
    "blur",
    "load",
    "error",
    "message",
  ];

  eventTypes.forEach((eventType) => {
    const handler = element[`on${eventType}`];
    if (handler && typeof handler === "function") {
      listeners[eventType] = {
        type: "inline",
        handler: handler.toString().substring(0, 100),
      };
    }
  });

  return listeners;
}

// ===========================================
// 📊 BATCH PROCESSING ENGINE
// ===========================================

async function batchProcessElements(selectors, options = {}) {
  const config = {
    delay: options.delay || 100,
    batchSize: options.batchSize || 50,
    onProgress: options.onProgress || null,
    ...options,
  };

  const results = [];
  let totalElements = 0;
  let processedElements = 0;

  // Collect all elements
  const allElements = [];
  selectors.forEach((selector) => {
    try {
      const found = document.querySelectorAll(selector);
      allElements.push(...Array.from(found));
    } catch (e) {
      console.log(`%c❌ Invalid selector: ${selector}`, styles.critical);
    }
  });

  totalElements = allElements.length;
  console.log(
    `%c📊 Processing ${totalElements} elements in batches...`,
    styles.info
  );

  // Process in batches
  for (let i = 0; i < totalElements; i += config.batchSize) {
    const batch = allElements.slice(i, i + config.batchSize);

    batch.forEach((element) => {
      const analysis = createElementMap(element, processedElements);
      results.push(analysis);
      processedElements++;
    });

    // Progress callback
    if (config.onProgress) {
      config.onProgress(processedElements, totalElements);
    }

    // Delay between batches
    if (i + config.batchSize < totalElements) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }
  }

  console.log(
    `%c✅ Batch processing complete: ${processedElements} elements`,
    styles.reflection
  );

  return results;
}

  // ===========================================
  // 20 NEW ENHANCEMENTS
  // ===========================================

  // Enhancement 1: javascript: URI Deep Scanner
  function scanJavascriptURIs() {
    const findings = [];
    document.querySelectorAll("[href], [src], [action], [formaction], [data], [poster], [background]").forEach((el) => {
      ["href", "src", "action", "formaction", "data", "poster", "background"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (val && /^\s*javascript\s*:/i.test(val)) {
          findings.push({ element: el.tagName + "#" + (el.id || ""), attribute: attr, value: val.substring(0, 80), risk: "CRITICAL" });
        }
      });
    });
    console.log("%c⚡ javascript: URI Deep Scan:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo javascript: URIs.", styles.reflection);
    return findings;
  }
  window.scanJavascriptURIs = scanJavascriptURIs;

  // Enhancement 2: DOM Clobbering Deep Scanner
  function scanDOMClobberingDeep() {
    const findings = [];
    const globals = new Set(["document", "window", "self", "top", "parent", "location", "chrome", "fetch", "XMLHttpRequest", "localStorage", "sessionStorage", "navigator", "history", "screen", "performance", "crypto", "JSON", "Math", "Array", "Object", "String", "Number", "Boolean", "Function", "RegExp", "Date", "console"]);
    document.querySelectorAll("[id], [name]").forEach((el) => {
      const id = el.id || el.getAttribute("name");
      if (id && globals.has(id)) {
        let usedInScript = false;
        document.querySelectorAll("script:not([src])").forEach((s) => {
          const regex = new RegExp(`(?<![.["'\\w])\\b${id}\\b(?![\\w"'])`);
          if (regex.test(s.textContent)) usedInScript = true;
        });
        findings.push({ identifier: id, tag: el.tagName, usedInScript, risk: usedInScript ? "CRITICAL" : "HIGH" });
      }
    });
    console.log("%c🔍 DOM Clobbering Deep:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo DOM clobbering.", styles.reflection);
    return findings;
  }
  window.scanDOMClobberingDeep = scanDOMClobberingDeep;

  // Enhancement 3: Open Redirect Chain Mapper
  function mapOpenRedirectChains() {
    const findings = [];
    const url = new URL(window.location.href);
    const redirectParams = ["redirect", "return", "next", "go", "url", "continue", "redir", "back", "forward", "to", "rurl", "dest", "destination", "checkout_url", "return_url", "redirect_uri", "redirect_url", "return_to"];
    url.searchParams.forEach((value, key) => {
      if (redirectParams.some((p) => key.toLowerCase().includes(p))) {
        let targetUrl;
        try { targetUrl = new URL(value); } catch (e) {}
        if (targetUrl) {
          const isExternal = targetUrl.origin !== window.location.origin;
          findings.push({ param: key, value: value.substring(0, 80), isExternal, risk: isExternal ? "CRITICAL" : "MEDIUM" });
        }
      }
    });
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && /redirect|return|next|url|back|forward/i.test(href) && href.includes("=")) findings.push({ type: "link", href: href.substring(0, 100), risk: "MEDIUM" });
    });
    console.log("%c🔄 Open Redirect Chains:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo open redirects.", styles.reflection);
    return findings;
  }
  window.mapOpenRedirectChains = mapOpenRedirectChains;

  // Enhancement 4: PostMessage Handler Deep Audit
  function auditPostMessageDeep() {
    const findings = [];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      if (code.includes("addEventListener") && code.includes("message")) {
        const hasOrigin = /event\.origin|e\.origin|\.origin\s*===/.test(code);
        const hasSource = /event\.source|e\.source/.test(code);
        const hasData = /event\.data|e\.data/.test(code);
        const sinks = [];
        if (/innerHTML/.test(code)) sinks.push("innerHTML");
        if (/document\.write/.test(code)) sinks.push("document.write");
        if (/eval\(/.test(code)) sinks.push("eval");
        if (/\.html\(/.test(code)) sinks.push("$.html");
        if (/location/.test(code)) sinks.push("location");
        findings.push({ hasOrigin, hasSource, hasData, sinks, risk: !hasOrigin && sinks.length > 0 ? "CRITICAL" : sinks.length > 0 ? "HIGH" : "LOW" });
      }
    });
    console.log("%c📨 PostMessage Deep Audit:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo postMessage handlers.", styles.reflection);
    return findings;
  }
  window.auditPostMessageDeep = auditPostMessageDeep;

  // Enhancement 5: Prototype Pollution Chain Detector
  function detectPrototypePollutionChains() {
    const findings = [];
    const scripts = [];
    document.querySelectorAll("script:not([src])").forEach((s) => scripts.push(s.textContent));
    const allCode = scripts.join("\n");
    const patterns = [
      { regex: /\bextend\b.*\b__proto__\b/g, name: "extend(__proto__)", risk: "CRITICAL" },
      { regex: /\bmerge\b.*\b__proto__\b/g, name: "merge(__proto__)", risk: "CRITICAL" },
      { regex: /Object\.assign\b/g, name: "Object.assign", risk: "MEDIUM" },
      { regex: /\bdeepCopy\b|\bcloneDeep\b|\bdeepMerge\b/g, name: "deep-clone", risk: "MEDIUM" },
      { regex: /\[\s*['"]__proto__['"]\s*\]/g, name: "__proto__ bracket", risk: "HIGH" },
      { regex: /\[\s*['"]constructor['"]\s*\]/g, name: "constructor bracket", risk: "HIGH" },
      { regex: /prototype\s*\[/g, name: "prototype bracket", risk: "HIGH" },
      { regex: /\.constructor\s*\[/g, name: ".constructor[", risk: "HIGH" },
    ];
    patterns.forEach(({ regex, name, risk }) => {
      const matches = allCode.match(regex);
      if (matches) findings.push({ pattern: name, count: matches.length, risk });
    });
    console.log("%c🔬 Prototype Pollution Chains:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo prototype pollution.", styles.reflection);
    return findings;
  }
  window.detectPrototypePollutionChains = detectPrototypePollutionChains;

  // Enhancement 6: Storage → Sink Flow Mapper
  function mapStorageSinkFlows() {
    const findings = [];
    const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "setInterval", "Function", "location.href"];
    ["localStorage", "sessionStorage"].forEach((storage) => {
      try {
        const store = window[storage];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          const value = store.getItem(key);
          if (!value || value.length < 3) continue;
          document.querySelectorAll("script:not([src])").forEach((script) => {
            const code = script.textContent;
            if (code.includes(key)) {
              const usedSinks = sinks.filter((s) => code.includes(s));
              if (usedSinks.length > 0) findings.push({ storage, key, sinks: usedSinks, risk: "CRITICAL" });
            }
          });
        }
      } catch (e) {}
    });
    console.log("%c💾 Storage → Sink Flows:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo storage → sink flows.", styles.reflection);
    return findings;
  }
  window.mapStorageSinkFlows = mapStorageSinkFlows;

  // Enhancement 7: CSS Exfiltration Vector Scanner
  function scanCSSExfiltrationVectors() {
    const findings = [];
    const patterns = [/expression\s*\(/gi, /behavior\s*:/gi, /-moz-binding\s*:.*url\(/gi, /url\s*\(\s*['"]?\s*javascript:/gi, /url\s*\(\s*['"]?\s*data:/gi];
    document.querySelectorAll("[style]").forEach((el) => {
      const style = el.getAttribute("style");
      patterns.forEach((regex) => {
        const match = style.match(regex);
        if (match) findings.push({ element: el.tagName + "#" + (el.id || ""), pattern: match[0], risk: "HIGH" });
      });
    });
    document.querySelectorAll("style").forEach((el) => {
      const content = el.textContent || "";
      patterns.forEach((regex) => {
        const match = content.match(regex);
        if (match) findings.push({ element: "STYLE", pattern: match[0], risk: "HIGH" });
      });
    });
    console.log("%c🎨 CSS Exfiltration Vectors:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo CSS exfiltration.", styles.reflection);
    return findings;
  }
  window.scanCSSExfiltrationVectors = scanCSSExfiltrationVectors;

  // Enhancement 8: Framework Sink Deep Detector
  function detectFrameworkSinksDeep() {
    const findings = [];
    const checks = [
      { name: "React dangerouslySetInnerHTML", test: () => document.querySelectorAll("[data-reactroot]").length > 0 || /dangerouslySetInnerHTML/.test(document.body.innerHTML), risk: "HIGH" },
      { name: "Vue v-html", test: () => document.querySelectorAll("[v-html]").length > 0, risk: "HIGH" },
      { name: "Angular [innerHTML]", test: () => document.querySelectorAll("[ng-bind-html], [innerHTML]").length > 0, risk: "HIGH" },
      { name: "jQuery .html()", test: () => { try { return !!window.jQuery; } catch (e) { return false; } }, risk: "MEDIUM" },
      { name: "Svelte {@html}", test: () => /\{@html/.test(document.body.innerHTML), risk: "HIGH" },
    ];
    checks.forEach(({ name, test, risk }) => { try { if (test()) findings.push({ framework: name, risk }); } catch (e) {} });
    console.log("%c🛠️ Framework Sinks Deep:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo framework sinks.", styles.reflection);
    return findings;
  }
  window.detectFrameworkSinksDeep = detectFrameworkSinksDeep;

  // Enhancement 9: Contenteditable XSS Mapper
  function mapContenteditableXSS() {
    const findings = [];
    document.querySelectorAll("[contenteditable='true'], [contenteditable='']").forEach((el) => {
      const hasHandler = Array.from(el.attributes).some((a) => a.name.startsWith("on"));
      findings.push({ tag: el.tagName, id: el.id || "none", hasInlineHandler: hasHandler, risk: hasHandler ? "CRITICAL" : "HIGH" });
    });
    console.log("%c📝 Contenteditable XSS:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo contenteditable.", styles.reflection);
    return findings;
  }
  window.mapContenteditableXSS = mapContenteditableXSS;

  // Enhancement 10: Clickjacking Vulnerability Mapper
  function mapClickjackingVulnerabilities() {
    const findings = [];
    const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasFrameAncestors = csp && /frame-ancestors/.test(csp.getAttribute("content"));
    if (!frameOptions && !hasFrameAncestors) findings.push({ type: "no-protection", risk: "HIGH", note: "Page can be framed" });
    document.querySelectorAll("iframe").forEach((iframe) => {
      if (!iframe.sandbox || iframe.sandbox.length === 0) findings.push({ type: "unsandboxed", src: (iframe.src || "").substring(0, 80), risk: "MEDIUM" });
    });
    console.log("%c🎯 Clickjacking:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo clickjacking vectors.", styles.reflection);
    return findings;
  }
  window.mapClickjackingVulnerabilities = mapClickjackingVulnerabilities;

  // Enhancement 11: Document.write Sink Deep Analyzer
  function analyzeDocumentWriteDeep() {
    const findings = [];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      if (/document\.write\s*\(|document\.writeln\s*\(/.test(code)) {
        const hasUserInput = /location\.|document\.URL|document\.referrer|window\.name|document\.cookie|location\.search|location\.hash/.test(code);
        findings.push({ script: script.src || "inline", hasUserInput, risk: hasUserInput ? "CRITICAL" : "HIGH" });
      }
    });
    console.log("%c📝 Document.write Deep:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo document.write sinks.", styles.reflection);
    return findings;
  }
  window.analyzeDocumentWriteDeep = analyzeDocumentWriteDeep;

  // Enhancement 12: Mixed Content Vulnerability Mapper
  function mapMixedContentVulnerabilities() {
    const findings = [];
    if (window.location.protocol === "https:") {
      document.querySelectorAll("script[src^='http:'], link[href^='http:'], img[src^='http:'], iframe[src^='http:']").forEach((el) => {
        const src = el.getAttribute("src") || el.getAttribute("href");
        if (src && src.startsWith("http:")) findings.push({ tag: el.tagName, src: src.substring(0, 80), risk: el.tagName === "SCRIPT" ? "HIGH" : "MEDIUM" });
      });
    }
    console.log("%c🔀 Mixed Content:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo mixed content.", styles.reflection);
    return findings;
  }
  window.mapMixedContentVulnerabilities = mapMixedContentVulnerabilities;

  // Enhancement 13: URL Validation Bypass Mapper
  function mapURLValidationBypass() {
    const findings = [];
    const bypasses = [
      { payload: "javascript:alert(1)", technique: "direct" },
      { payload: "jAvAsCrIpT:alert(1)", technique: "case-mixing" },
      { payload: "javascript%3Aalert(1)", technique: "url-encoding" },
      { payload: "javascript&#58;alert(1)", technique: "html-entity" },
      { payload: "data:text/html,<script>alert(1)</script>", technique: "data-uri" },
    ];
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      bypasses.forEach(({ payload, technique }) => {
        if (href.toLowerCase().includes(payload.toLowerCase().substring(0, 8))) {
          findings.push({ element: "A#" + (a.id || ""), href: href.substring(0, 80), technique, risk: "CRITICAL" });
        }
      });
    });
    console.log("%c🔗 URL Validation Bypass:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo URL bypass.", styles.reflection);
    return findings;
  }
  window.mapURLValidationBypass = mapURLValidationBypass;

  // Enhancement 14: Service Worker Chain Mapper
  function mapServiceWorkerChains() {
    const findings = { registered: false, chains: [] };
    if ("serviceWorker" in navigator) {
      findings.registered = true;
      navigator.serviceWorker.getRegistrations().then((regs) => {
        findings.registrations = regs.map((r) => ({ scope: r.scope, active: !!r.active }));
        regs.forEach((reg) => {
          if (reg.active) findings.chains.push({ scope: reg.scope, risks: ["Intercepts fetch", "Can modify responses", "Can cache XSS payloads"] });
        });
        console.log("%c⚙️ Service Worker Chains:", styles.warning);
        if (findings.chains.length > 0) console.table(findings.chains);
      });
    }
    return findings;
  }
  window.mapServiceWorkerChains = mapServiceWorkerChains;

  // Enhancement 15: Redirect Chain Deep Auditor
  function auditRedirectChainDeep() {
    const findings = [];
    const url = new URL(window.location.href);
    const redirectParams = ["redirect", "return", "next", "go", "url", "continue", "redir", "back", "forward", "to"];
    url.searchParams.forEach((value, key) => {
      if (redirectParams.some((p) => key.toLowerCase().includes(p))) {
        let isExternal = false;
        try { const u = new URL(value); isExternal = u.origin !== window.location.origin; } catch (e) {}
        findings.push({ param: key, value: value.substring(0, 80), isExternal, risk: isExternal ? "CRITICAL" : "MEDIUM" });
      }
    });
    document.querySelectorAll("meta[http-equiv='refresh']").forEach((meta) => {
      const content = meta.getAttribute("content");
      if (content && /url\s*=/i.test(content)) findings.push({ type: "meta-refresh", value: content.substring(0, 80), risk: "MEDIUM" });
    });
    console.log("%c🔄 Redirect Chain Deep:", styles.warning);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo redirect chains.", styles.reflection);
    return findings;
  }
  window.auditRedirectChainDeep = auditRedirectChainDeep;

  // Enhancement 16: XSS Vector Comprehensive Scanner
  function scanXSSVectorComprehensive() {
    const vectors = [];
    document.querySelectorAll("a[href^='javascript:'], a[href^='data:']").forEach((a) => vectors.push({ tag: "A", href: a.getAttribute("href").substring(0, 80), risk: "CRITICAL" }));
    document.querySelectorAll("[src^='javascript:'], [src^='data:']").forEach((el) => vectors.push({ tag: el.tagName, src: el.getAttribute("src").substring(0, 80), risk: "CRITICAL" }));
    document.querySelectorAll("iframe[src^='javascript:'], iframe[src^='data:'], iframe[srcdoc]").forEach((el) => vectors.push({ tag: "IFRAME", risk: "CRITICAL" }));
    document.querySelectorAll("*[onclick], *[onload], *[onerror]").forEach((el) => {
      ["onclick", "onload", "onerror"].forEach((attr) => {
        if (el.hasAttribute(attr) && /alert\(|eval\(|document\.write/.test(el.getAttribute(attr))) {
          vectors.push({ tag: el.tagName, handler: attr, risk: "HIGH" });
        }
      });
    });
    console.log("%c🎯 XSS Vectors Comprehensive:", styles.critical);
    if (vectors.length > 0) console.table(vectors);
    else console.log("%cNo XSS vectors.", styles.reflection);
    return vectors;
  }
  window.scanXSSVectorComprehensive = scanXSSVectorComprehensive;

  // Enhancement 17: Encoded Sink Deep Scanner
  function scanEncodedSinksDeep() {
    const findings = [];
    const patterns = [
      { name: "eval(atob(...))", regex: /eval\s*\(\s*atob\s*\(/g, risk: "CRITICAL" },
      { name: "Function(atob(...))", regex: /Function\s*\(\s*atob\s*\(/g, risk: "CRITICAL" },
      { name: "String.fromCharCode", regex: /String\.fromCharCode\s*\(/g, risk: "HIGH" },
      { name: "unescape(...)", regex: /unescape\s*\(/g, risk: "HIGH" },
      { name: "decodeURIComponent(...)", regex: /decodeURIComponent\s*\(/g, risk: "MEDIUM" },
    ];
    document.querySelectorAll("script:not([src])").forEach((script) => {
      const code = script.textContent;
      patterns.forEach(({ name, regex, risk }) => {
        const matches = code.match(regex);
        if (matches) findings.push({ script: script.src || "inline", encoding: name, count: matches.length, risk });
      });
    });
    console.log("%c🔐 Encoded Sinks Deep:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo encoded sinks.", styles.reflection);
    return findings;
  }
  window.scanEncodedSinksDeep = scanEncodedSinksDeep;

  // Enhancement 18: Base Tag Hijack Mapper
  function mapBaseTagHijack() {
    const findings = [];
    document.querySelectorAll("base").forEach((base) => {
      const href = base.getAttribute("href");
      if (!href) return;
      const isExternal = !href.startsWith(window.location.origin) && !href.startsWith("/");
      const isJS = /^\s*javascript\s*:/i.test(href);
      findings.push({ href: href.substring(0, 100), isExternal, isJS, risk: isJS ? "CRITICAL" : isExternal ? "HIGH" : "MEDIUM" });
    });
    console.log("%c📌 Base Tag Hijack:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo base tag hijack.", styles.reflection);
    return findings;
  }
  window.mapBaseTagHijack = mapBaseTagHijack;

  // Enhancement 19: Event Handler Sink Deep Auditor
  function auditEventHandlersDeep() {
    const findings = [];
    const sinks = ["innerHTML", "outerHTML", "document.write", "eval", "setTimeout", "setInterval", "Function", "location.href"];
    document.querySelectorAll("*").forEach((el) => {
      if (!el || !el.tagName) return;
      for (const attr of el.attributes) {
        if (attr.name.toLowerCase().startsWith("on") && attr.value) {
          const found = sinks.filter((s) => attr.value.includes(s));
          if (found.length > 0) findings.push({ element: el.tagName + "#" + (el.id || ""), handler: attr.name, sinks: found.join(", "), risk: "CRITICAL" });
        }
      }
    });
    console.log("%c📋 Event Handlers Deep:", styles.critical);
    if (findings.length > 0) console.table(findings);
    else console.log("%cNo dangerous event handlers.", styles.reflection);
    return findings;
  }
  window.auditEventHandlersDeep = auditEventHandlersDeep;

  // Enhancement 20: Full Recon Report Generator
  function generateFullReconReport() {
    const report = { timestamp: new Date().toISOString(), url: window.location.href, sections: {} };
    console.log("%c📊 GENERATING FULL RECON REPORT...", styles.banner);
    console.log("=".repeat(60));
    try { report.sections.javascriptURIs = scanJavascriptURIs(); } catch (e) { report.sections.javascriptURIs = []; }
    try { report.sections.domClobbering = scanDOMClobberingDeep(); } catch (e) { report.sections.domClobbering = []; }
    try { report.sections.openRedirects = mapOpenRedirectChains(); } catch (e) { report.sections.openRedirects = []; }
    try { report.sections.postMessage = auditPostMessageDeep(); } catch (e) { report.sections.postMessage = []; }
    try { report.sections.prototypePollution = detectPrototypePollutionChains(); } catch (e) { report.sections.prototypePollution = []; }
    try { report.sections.storageFlows = mapStorageSinkFlows(); } catch (e) { report.sections.storageFlows = []; }
    try { report.sections.cssExfiltration = scanCSSExfiltrationVectors(); } catch (e) { report.sections.cssExfiltration = []; }
    try { report.sections.frameworkSinks = detectFrameworkSinksDeep(); } catch (e) { report.sections.frameworkSinks = []; }
    try { report.sections.csp = analyzeCSP(); } catch (e) { report.sections.csp = {}; }
    try { report.sections.sourceToSink = analyzeSourceToSink(); } catch (e) { report.sections.sourceToSink = {}; }
    try { report.sections.clickjacking = mapClickjackingVulnerabilities(); } catch (e) { report.sections.clickjacking = []; }
    try { report.sections.mixedContent = mapMixedContentVulnerabilities(); } catch (e) { report.sections.mixedContent = []; }
    try { report.sections.urlBypass = mapURLValidationBypass(); } catch (e) { report.sections.urlBypass = []; }
    try { report.sections.xssVectors = scanXSSVectorComprehensive(); } catch (e) { report.sections.xssVectors = []; }
    try { report.sections.encodedSinks = scanEncodedSinksDeep(); } catch (e) { report.sections.encodedSinks = []; }
    try { report.sections.baseTag = mapBaseTagHijack(); } catch (e) { report.sections.baseTag = []; }
    try { report.sections.eventHandlers = auditEventHandlersDeep(); } catch (e) { report.sections.eventHandlers = []; }
    try { report.sections.documentWrite = analyzeDocumentWriteDeep(); } catch (e) { report.sections.documentWrite = []; }
    const totalFindings = Object.values(report.sections).flat().length;
    const criticalCount = Object.values(report.sections).flat().filter((f) => f && f.risk === "CRITICAL").length;
    report.summary = { totalFindings, criticalCount, riskLevel: criticalCount > 0 ? "CRITICAL" : totalFindings > 5 ? "HIGH" : "LOW" };
    console.log("=".repeat(60));
    console.log("%c📊 RECON REPORT SUMMARY:", styles.critical);
    console.log("  Total: " + totalFindings + " | Critical: " + criticalCount + " | Risk: " + report.summary.riskLevel);
    window.lastFullReconReport = report;
    return report;
  }
  window.generateFullReconReport = generateFullReconReport;

  // ===========================================
  // 🎯 ENHANCED GLOBAL EXPOSURE
  // ===========================================

  // Expose all new functions globally
  window.detectAdvancedSinks = detectAdvancedSinks;
  window.DOMMutationObserver = DOMMutationObserver;
  window.detectGadgetChains = detectGadgetChains;
  window.analyzeCSP = analyzeCSP;
  window.analyzeSourceToSink = analyzeSourceToSink;
  window.generateComprehensiveReport = generateComprehensiveReport;
  window.exportComprehensiveReport = exportComprehensiveReport;
  window.SecurityDashboard = SecurityDashboard;
  window.autoScan = autoScan;
  window.getElementCSSPath = getElementCSSPath;
  window.getElementAttributes = getElementAttributes;
  window.getEventListeners = getEventListeners;
  window.batchProcessElements = batchProcessElements;

  // ===========================================
  // 🎉 ENHANCED TOOL INITIALIZATION
  // ===========================================

  console.log("%c🎯 ADVANCED DOM SINK & REFLECTION MAPPER v2.0", styles.banner);
  console.log("%c🗺️ Enhanced Bug Bounty Reconnaissance Tool Ready!", styles.recon);

  console.log("\n%c🚀 NEW FEATURES:", styles.recon);
  console.log("%c  ✅ Advanced sink detection (200+ sinks)", styles.reflection);
  console.log("%c  ✅ Real-time mutation monitoring", styles.reflection);
  console.log("%c  ✅ Gadget chain detection", styles.reflection);
  console.log("%c  ✅ CSP analysis", styles.reflection);
  console.log("%c  ✅ Source-to-sink flow analysis", styles.reflection);
  console.log("%c  ✅ Comprehensive report generation", styles.reflection);
  console.log("%c  ✅ Security dashboard", styles.reflection);
  console.log("%c  ✅ Auto-scan functionality", styles.reflection);
  console.log("%c  ✅ Batch processing", styles.reflection);
  console.log("%c  ✅ 20 NEW ENHANCEMENTS LOADED", styles.critical);

  console.log("\n%c📋 QUICK COMMANDS:", styles.warning);
  console.log(
    "%c  autoScan()                           %c- Quick scan current page",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%c  exportComprehensiveReport()          %c- Full HTML/JSON report",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%c  window.securityDashboard.start()     %c- Start monitoring",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%c  window.securityDashboard.displayDashboard() %c- Show dashboard",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%c  analyzeCSP()                         %c- Analyze CSP policy",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );
  console.log(
    "%c  analyzeSourceToSink()                %c- Analyze data flows",
    "font-weight: bold; color: #e74c3c;",
    "color: #7f8c8d;"
  );

  console.log("\n%c🎯 Ready for advanced reconnaissance!", styles.recon);
})();

// ===========================================
// 🗺️ RECONNAISSANCE TOOL READY!
// ===========================================
