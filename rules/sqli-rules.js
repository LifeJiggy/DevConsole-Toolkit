/**
 * DevConsole Toolkit — SQL Injection Detection Rules
 * Pre-built rules for detecting SQL injection vulnerabilities.
 */

const SQLiRules = [
    { name: 'sqli-query-concat', pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\+\s*/gi, type: 'regex', category: 'sqli', severity: 'critical', description: 'SQL query with string concatenation — SQL injection risk' },
    { name: 'sqli-template-literal', pattern: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*\$\{/gi, type: 'regex', category: 'sqli', severity: 'critical', description: 'SQL query with template literal interpolation — SQL injection risk' },
    { name: 'sqli-execute', pattern: /\.execute\s*\([^)]*\+/gi, type: 'regex', category: 'sqli', severity: 'critical', description: 'execute() with concatenation — SQL injection risk' },
    { name: 'sqli-query-user-input', pattern: /\.query\s*\([^)]*(?:req\.|input|param|user)/gi, type: 'regex', category: 'sqli', severity: 'critical', description: 'Database query with user input — SQL injection risk' },
    { name: 'sqli-sequelize-raw', pattern: /sequelize\.query\s*\(/gi, type: 'regex', category: 'sqli', severity: 'high', description: 'Sequelize raw query — review for parameterization' },
    { name: 'sqli-mongoose-where', pattern: /\$where\s*:/gi, type: 'regex', category: 'sqli', severity: 'critical', description: 'MongoDB $where — JavaScript execution injection risk' },
    { name: 'sqli-mongoose-regex', pattern: /\$regex\s*:\s*[^}]*\+/gi, type: 'regex', category: 'sqli', severity: 'high', description: 'MongoDB $regex with concatenation — ReDoS/injection risk' },
    { name: 'sqli-no-parameterize', pattern: /(?:query|execute)\s*\(\s*["'][^"']*(?:SELECT|INSERT|UPDATE|DELETE)[^"']*\+\s*/gi, type: 'regex', category: 'sqli', severity: 'critical', description: 'SQL with concatenation instead of parameterized query' }
];

if (typeof window !== 'undefined') window.SQLiRules = SQLiRules;
if (typeof module !== 'undefined') module.exports = SQLiRules;
