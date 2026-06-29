/**
 * DevConsole Toolkit — XSS Detection Rules
 * Pre-built rules for detecting XSS vulnerabilities.
 */

const XSSRules = [
    { name: 'xss-innerHTML-assignment', pattern: /innerHTML\s*=/gi, type: 'regex', category: 'xss', severity: 'high', description: 'innerHTML assignment — potential DOM XSS sink' },
    { name: 'xss-outerHTML-assignment', pattern: /outerHTML\s*=/gi, type: 'regex', category: 'xss', severity: 'high', description: 'outerHTML assignment — potential DOM XSS sink' },
    { name: 'xss-document-write', pattern: /document\.write\s*\(/gi, type: 'regex', category: 'xss', severity: 'high', description: 'document.write() — XSS injection vector' },
    { name: 'xss-eval', pattern: /\beval\s*\(/gi, type: 'regex', category: 'xss', severity: 'critical', description: 'eval() — code execution with user input risk' },
    { name: 'xss-setTimeout-string', pattern: /setTimeout\s*\(\s*["']/gi, type: 'regex', category: 'xss', severity: 'high', description: 'setTimeout with string — code execution vector' },
    { name: 'xss-setInterval-string', pattern: /setInterval\s*\(\s*["']/gi, type: 'regex', category: 'xss', severity: 'high', description: 'setInterval with string — code execution vector' },
    { name: 'xss-Function-constructor', pattern: /new\s+Function\s*\(/gi, type: 'regex', category: 'xss', severity: 'critical', description: 'Function constructor — dynamic code execution' },
    { name: 'xss-location-hash', pattern: /location\.hash/gi, type: 'regex', category: 'xss', severity: 'medium', description: 'location.hash access — potential DOM XSS source' },
    { name: 'xss-location-search', pattern: /location\.search/gi, type: 'regex', category: 'xss', severity: 'medium', description: 'location.search access — potential DOM XSS source' },
    { name: 'xss-postMessage', pattern: /addEventListener\s*\(\s*["']message["']\s*,/gi, type: 'regex', category: 'xss', severity: 'medium', description: 'postMessage listener — check origin validation' },
    { name: 'xss-jQuery-html', pattern: /\$\s*\([^)]*\)\.html\s*\(/gi, type: 'regex', category: 'xss', severity: 'medium', description: 'jQuery .html() — XSS sink if unsanitized input' },
    { name: 'xss-dangerouslySetInnerHTML', pattern: /dangerouslySetInnerHTML/gi, type: 'regex', category: 'xss', severity: 'high', description: 'React dangerouslySetInnerHTML — XSS if user input' },
    { name: 'xss-v-html', pattern: /v-html\s*=/gi, type: 'regex', category: 'xss', severity: 'high', description: 'Vue v-html directive — XSS if user input' },
    { name: 'xss-innerHTML', pattern: /innerHTML/gi, type: 'regex', category: 'xss', severity: 'low', description: 'innerHTML usage — review for XSS potential' }
];

if (typeof window !== 'undefined') window.XSSRules = XSSRules;
if (typeof module !== 'undefined') module.exports = XSSRules;
