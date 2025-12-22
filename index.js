const fs = require('fs');
const path = require('path');

const tools = {};

// Helper function to read and export a tool
function addTool(name, filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const code = fs.readFileSync(fullPath, 'utf8');
    tools[name] = code;
  } catch (error) {
    console.warn(`Warning: Could not load ${name} from ${filePath}:`, error.message);
    tools[name] = `// Error loading ${name}: ${error.message}`;
  }
}

// Add all tools
addTool('interactiveMappingClaude', 'src/Interactive-Mapping/claude-flow.js');
addTool('interactiveMappingQwen', 'src/Interactive-Mapping/Qwen-flow.js');
addTool('networkMapperGPT', 'src/Network/GPT-NETWORK-MAPPER.js');
addTool('networkMapperNextRay', 'src/Network/NextRay-DevTools-V2.js');
addTool('parameterExtractor', 'src/Parameter/🧠-Universal-Parameter-Extractor-Client-Side.js');
addTool('sensitiveDisclosureClaude', 'src/Sensitive-Disclousure/Claude.js');
addTool('sensitiveDisclosureQwen', 'src/Sensitive-Disclousure/Qwen-Gold.js');
addTool('userInputExtractor', 'src/User-Input/🧠-Universal-User-Input-Extractor-Client-Side.js');
addTool('validationExploitHelper', 'src/User-Input/Validation&Exploit Helper-all‑in‑one Snippet.js');

module.exports = tools;