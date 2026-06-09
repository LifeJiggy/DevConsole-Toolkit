# Providers Config

Configuration files for the Grok-Code CLI provider system. Contains all settings for providers, models, security, quotas, and endpoints.

## Files

| File                 | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `models.json`        | Complete model database with all providers, pricing, capabilities |
| `models-policy.json` | Model access policies, tier restrictions, rate limits             |
| `provider.json`      | Provider connection settings, timeouts, TLS config                |
| `endpoints.json`     | API endpoints for all 30+ providers                               |
| `security.json`      | Security settings, encryption, audit logs                         |
| `quotas.json`        | User quotas, plans, rate limiting                                 |
| `metadata.json`      | Provider metadata, display names, subscriptions                   |
| `session.json`       | Session configuration                                             |
| `AuthService.json`   | Authentication service configuration                              |

## models.json vs models-policy.json

### models.json

- **Purpose**: Model metadata database
- **Content**: Names, families, capabilities, pricing, context limits, modalities
- **Usage**: Model listing, selection, pricing calculation
- **Example**:

```json
{
  "openai/gpt-4o": {
    "name": "GPT-4o",
    "family": "gpt",
    "cost": { "input": 2.5, "output": 10 },
    "limit": { "context": 128000, "output": 16384 }
  }
}
```

### models-policy.json

- **Purpose**: Access control and policies
- **Content**: Tier requirements, rate limits, feature flags, safety rules
- **Usage**: Authorization, rate limiting, feature gating
- **Example**:

```json
{
  "byModel": {
    "gpt-4o": {
      "premiumOnly": false,
      "maxRequestsPerMinute": 60,
      "requiresHigherTier": false
    }
  }
}
```

## Configuration Structure

### Provider Configuration

```json
{
  "connection": { "timeout": 60000, "maxRetries": 3 },
  "endpoints": { "openai": { "base": "https://api.openai.com/v1" } }
}
```

### Security Configuration

```json
{
  "encryption": { "algorithm": "AES-256-GCM" },
  "apiKeys": { "maskInLogs": true },
  "audit": { "enabled": true }
}
```

### Quotas Configuration

```json
{
  "plans": {
    "free": { "limits": { "requestsPerMinute": 60 } },
    "pro": { "price": 19, "limits": { "requestsPerMinute": 500 } }
  }
}
```

## Usage

### Loading Configuration

```typescript
import { readFileSync } from "fs";
import { resolve } from "path";

const configDir = resolve(__dirname, "../config");
const models = JSON.parse(readFileSync(`${configDir}/models.json`, "utf-8"));
const policies = JSON.parse(
  readFileSync(`${configDir}/models-policy.json`, "utf-8"),
);
```

### Checking Model Access

```typescript
function canUseModel(modelId: string, userTier: string): boolean {
  const policies = loadPolicies();
  const modelPolicy = policies.byModel[modelId];

  if (modelPolicy?.premiumOnly && userTier === "free") {
    return false;
  }
  return true;
}
```

### Rate Limiting

```typescript
function checkRateLimit(provider: string, plan: string): boolean {
  const quotas = loadQuotas();
  const planLimits = quotas.plans[plan].limits;
  const providerQuota = quotas.providerQuotas[provider]?.[plan];

  return (
    checkLimit(planLimits.requestsPerMinute) &&
    (!providerQuota || checkLimit(providerQuota.requestsPerMinute))
  );
}
```

## Environment Variables

Config can be overridden with environment variables:

- `PROVIDER_CONFIG_PATH` - Custom config directory
- `MODELS_JSON_PATH` - Custom models.json path
- `SECURITY_CONFIG_PATH` - Custom security.json path

## Versioning

All config files include version:

```json
{
  "version": "3.0.0",
  "description": "Configuration description"
}
```

## License

MIT
