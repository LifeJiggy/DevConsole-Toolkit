/**
 * DevConsole Toolkit — Secrets Detection Rules
 * Pre-built rules for detecting hardcoded secrets and credentials.
 */

const SecretsRules = [
    { name: 'secret-aws-access-key', pattern: /AKIA[0-9A-Z]{16}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'AWS Access Key ID detected' },
    { name: 'secret-aws-secret-key', pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["'][A-Za-z0-9/+=]{40}["']/gi, type: 'regex', category: 'secrets', severity: 'critical', description: 'AWS Secret Access Key detected' },
    { name: 'secret-github-pat', pattern: /ghp_[A-Za-z0-9]{36}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'GitHub Personal Access Token detected' },
    { name: 'secret-github-oauth', pattern: /gho_[A-Za-z0-9]{36}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'GitHub OAuth Token detected' },
    { name: 'secret-gitlab-pat', pattern: /glpat-[A-Za-z0-9\-_]{20,}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'GitLab Personal Access Token detected' },
    { name: 'secret-stripe-live', pattern: /sk_live_[0-9a-zA-Z]{24,}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'Stripe Live Secret Key detected' },
    { name: 'secret-stripe-test', pattern: /sk_test_[0-9a-zA-Z]{24,}/g, type: 'regex', category: 'secrets', severity: 'high', description: 'Stripe Test Secret Key detected' },
    { name: 'secret-slack-token', pattern: /xox[bpsa]-[0-9a-zA-Z\-]{10,}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'Slack Token detected' },
    { name: 'secret-google-api', pattern: /AIza[0-9A-Za-z\-_]{35}/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'Google API Key detected' },
    { name: 'secret-jwt', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, type: 'regex', category: 'secrets', severity: 'high', description: 'JWT token detected' },
    { name: 'secret-private-key', pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'Private key detected' },
    { name: 'secret-mongodb', pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'MongoDB connection string with credentials' },
    { name: 'secret-mysql', pattern: /mysql:\/\/[^:]+:[^@]+@/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'MySQL connection string with credentials' },
    { name: 'secret-postgres', pattern: /postgresql:\/\/[^:]+:[^@]+@/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'PostgreSQL connection string with credentials' },
    { name: 'secret-redis', pattern: /redis:\/\/[^:]+:[^@]+@/g, type: 'regex', category: 'secrets', severity: 'critical', description: 'Redis connection string with credentials' },
    { name: 'secret-hardcoded-password', pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/gi, type: 'regex', category: 'secrets', severity: 'critical', description: 'Hardcoded password detected' },
    { name: 'secret-hardcoded-api-key', pattern: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/gi, type: 'regex', category: 'secrets', severity: 'critical', description: 'Hardcoded API key detected' },
    { name: 'secret-bearer-token', pattern: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g, type: 'regex', category: 'secrets', severity: 'high', description: 'Bearer token in code' }
];

if (typeof window !== 'undefined') window.SecretsRules = SecretsRules;
if (typeof module !== 'undefined') module.exports = SecretsRules;
