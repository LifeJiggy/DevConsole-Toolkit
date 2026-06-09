/****************************************************************************************
 * Reflection & Sink Detector
 *
 * This function injects a unique payload into input fields and then searches the DOM
 * to see if that input is reflected, checking for dangerous sinks like `innerHTML`.
 *
 * Instructions: Paste into the console and call `findReflections();` to run the test.
 ****************************************************************************************/

function findReflections() {
  console.group(
    "%c🔍 FlowSpect: Running Input Reflection Test...",
    "color: #ff9800; font-size: 14px; font-weight: bold;"
  );

  // 1. Define a unique, traceable payload.
  const payload = `ReflectTest_${Math.random().toString(36).substring(2)}`;
  console.log(`Using unique payload: ${payload}`);

  // 2. Identify and inject the payload into interactive text elements.
  const targetElements = document.querySelectorAll(
    'input[type="text"], input[type="search"], textarea'
  );
  if (targetElements.length === 0) {
    console.warn("No text input or textarea elements found to test.");
    console.groupEnd();
    return;
  }

  console.log(`Injecting payload into ${targetElements.length} element(s)...`);
  targetElements.forEach((el) => {
    el.value = payload;
    // Dispatch events to trigger frameworks (React, Vue, etc.) that listen for changes.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // 3. Give the DOM a moment to update, then search for reflections.
  setTimeout(() => {
    console.log("Searching DOM for reflections...");
    const reflections = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((el) => {
      // Don't check the original input fields themselves
      if (Array.from(targetElements).includes(el)) return;

      // Check for dangerous sinks first
      if (el.innerHTML.includes(payload)) {
        reflections.push({
          type: "INNER_HTML_SINK",
          risk: "🔴 HIGH",
          message:
            "Payload was found inside `innerHTML`. This is a strong indicator of a potential DOM XSS vulnerability.",
          element: el,
        });
      }

      // Check for reflection in element attributes
      for (const attr of el.attributes) {
        if (attr.value.includes(payload)) {
          // Check if it's a scriptable attribute (a sink)
          const isScriptSink = ["href", "src", "action", "formaction"].some(
            (sink) => attr.name.toLowerCase().includes(sink)
          );
          const isEventHandler = attr.name.toLowerCase().startsWith("on");

          reflections.push({
            type: "ATTRIBUTE",
            risk: isScriptSink || isEventHandler ? "🟠 MEDIUM" : "🟡 LOW",
            message: `Payload was reflected in the '${attr.name}' attribute.`,
            element: el,
          });
        }
      }
    });

    // 4. Report the findings.
    if (reflections.length > 0) {
      console.warn(`🚨 Found ${reflections.length} potential reflection(s)!`);
      reflections.forEach((reflection) => {
        console.groupCollapsed(
          `${reflection.risk} - ${reflection.type} Reflection Found`
        );
        console.log(reflection.message);
        console.log("Element:", reflection.element);
        console.groupEnd();
      });
    } else {
      console.log(
        "✅ Success: No direct reflections of the payload were found in the DOM."
      );
    }

    console.groupEnd();
  }, 500); // Wait 500ms for any JavaScript on the page to process the input.
}

// --- Run the test ---
findReflections();
