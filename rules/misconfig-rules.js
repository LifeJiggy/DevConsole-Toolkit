/**
 * DevConsole Toolkit — Security Misconfiguration Detection Rules
 * Pre-built rules for detecting common security misconfigurations.
 */

const MisconfigRules = [
    { name: 'misconfig-missing-csp', pattern: /<html(?!.*Content-Security-Policy)/gi, type: 'regex', category: 'misconfig', severity: 'medium', description: 'No Content-Security-Policy header — review CSP settings' },
    { name: 'misconfig-missing-xfo', pattern: /X-Frame-Options\s*:\s*ALLOW-FROM/gi, type: 'regex', category: 'misconfig', severity: 'medium', description: 'X-Frame-Options ALLOW-FROM is deprecated' },
    { name: 'misconfig-mixed-content', pattern: /(?:src|href)\s*=\s*["']http:\/\//gi, type: 'regex', category: 'misconfig', severity: 'medium', description: 'HTTP resource on HTTPS page — mixed content' },
    { name: 'misconfig-cookie-nosecure', pattern: /document\.cookie\s*=\s*[^;]*(?!.*Secure)/gi, type: 'regex', category: 'misconfig', severity: 'medium', description: 'Cookie set without Secure flag' },
    { name: 'misconfig-cookie-nosamesite', pattern: /document\.cookie\s*=\s*[^;]*(?!.*SameSite)/gi, type: 'regex', category: 'misconfig', severity: 'low', description: 'Cookie set without SameSite attribute' },
    { name: 'misconfig-debug-enabled', pattern: /(?:debugger|debug\s*:\s*true|DEBUG\s*=\s*true)/gi, type: 'regex', category: 'misconfig', severity: 'medium', description: 'Debug mode enabled in production' },
    { name: 'misconfig-verbose-error', pattern: /console\.(?:error|warn)\s*\(\s*(?:e|error|err)\s*\)/gi, type: 'regex', category: 'misconfig', severity: 'low', description: 'Verbose error logging — may leak stack traces' },
    { name: 'misconfig-http-redirect', pattern: /window\.location\s*=\s*["']http:\/\//gi, type: 'regex', category: 'misconfig', severity: 'medium', description: 'Redirect to HTTP — HTTPS downgrade risk' },
    { name: 'misconfig-x-xss-protection', pattern: /X-XSS-Protection/gi, type: 'regex', category: 'misconfig', severity: 'info', description: 'X-XSS-Protection header is deprecated — rely on CSP instead' },
    { name: 'misconfig-auto-complete', pattern: /autocomplete\s*=\s*["']on["']/gi, type: 'regex', category: 'misconfig', severity: 'low', description: 'Autocomplete enabled on sensitive field' }
];

if (typeof window !== 'undefined') window.MisconfigRules = MisconfigRules;
if (typeof module !== 'undefined') module.exports = MisconfigRules;
