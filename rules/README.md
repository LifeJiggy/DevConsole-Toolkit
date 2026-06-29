# Rules — Security Rules Engine

Custom security detection rules that can be defined, executed, persisted, and shared.

## Rule Sets

| File | Module | Rules | Description |
|------|--------|-------|-------------|
| `rules.js` | `DCTRules` | 10 built-in | Core engine with management API |
| `xss-rules.js` | `XSSRules` | 14 rules | XSS detection (innerHTML, eval, postMessage, etc.) |
| `sqli-rules.js` | `SQLiRules` | 8 rules | SQL injection (concatenation, $where, $regex) |
| `secrets-rules.js` | `SecretsRules` | 17 rules | Secrets (AWS, GitHub, Stripe, Slack, JWT, etc.) |
| `misconfig-rules.js` | `MisconfigRules` | 10 rules | Misconfiguration (CSP, cookies, mixed content) |

## Usage

Paste `rules/rules.js` into browser console, then use `DCTRules.*`

```js
// Add custom rule
DCTRules.add('my-api-key', {
    pattern: /mykey_[A-Za-z0-9]{32}/gi,
    type: 'regex',
    category: 'secrets',
    severity: 'critical',
    description: 'Custom API key pattern'
});

// Execute rules against content
const matches = DCTRules.execute(document.body.innerHTML, 'page');
console.table(matches);

// Execute against all page content
const allMatches = DCTRules.executeOnDOM();

// Persist rules
DCTRules.save();
DCTRules.load();

// Export/Import
const rules = DCTRules.export();
DCTRules.import(rules);

// Manage rules
DCTRules.enable('my-api-key');
DCTRules.disable('my-api-key');
DCTRules.toggle('my-api-key');
DCTRules.remove('my-api-key');

// Statistics
DCTRules.getStats();
DCTRules.getStatsSummary();
```

## Built-in Rules

| Rule | Category | Severity | Pattern |
|------|----------|----------|---------|
| hardcoded-api-key | secrets | critical | API key patterns |
| hardcoded-secret | secrets | critical | password/secret patterns |
| jwt-token | secrets | high | JWT token format |
| aws-key | secrets | critical | AWS Access Key |
| github-pat | secrets | critical | GitHub PAT |
| eval-usage | xss | high | eval() calls |
| onclick-handler | xss | medium | Inline event handlers |
| debug-endpoint | info-disclosure | high | /debug, /admin, etc. |
| internal-ip | info-disclosure | medium | Private IP ranges |
| stack-trace | info-disclosure | low | Stack trace patterns |

## Rule Types

- `string` — Simple string match (default)
- `regex` — Regular expression pattern
- `function` — Custom function `(content, source) => boolean`

## API

| Method | Description |
|--------|-------------|
| `add(name, config)` | Add a new rule |
| `remove(name)` | Remove a rule |
| `enable(name)` | Enable a rule |
| `disable(name)` | Disable a rule |
| `toggle(name)` | Toggle rule enabled/disabled |
| `get(name)` | Get rule by name |
| `getAll()` | Get all rules |
| `getEnabled()` | Get enabled rules only |
| `execute(content, source)` | Execute rules against content |
| `executeOnDOM()` | Execute against entire page |
| `getStats()` | Get per-rule statistics |
| `getStatsSummary()` | Get summary statistics |
| `save()` | Save rules to localStorage |
| `load()` | Load rules from localStorage |
| `export()` | Export rules as JSON |
| `import(data)` | Import rules from JSON |
| `clear()` | Remove all rules |
| `loadDefaults()` | Load built-in rules |
