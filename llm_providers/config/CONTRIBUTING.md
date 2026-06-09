# Contributing to Providers Config

Thank you for contributing to the Grok-Code CLI provider configuration system.

## Adding New Providers

### 1. Update models.json

Add provider models to `models.json`:

```json
{
  "provider/model-id": {
    "id": "provider/model-id",
    "name": "Model Name",
    "family": "model-family",
    "attachment": false,
    "reasoning": false,
    "tool_call": true,
    "release_date": "2024-01-01",
    "last_updated": "2024-01-01",
    "modalities": {
      "input": ["text"],
      "output": ["text"]
    },
    "open_weights": false,
    "cost": {
      "input": 0.001,
      "output": 0.002
    },
    "limit": {
      "context": 8192,
      "output": 4096
    }
  }
}
```

### 2. Update models-policy.json

Add provider policies:

```json
{
  "policies": {
    "byProvider": {
      "provider": {
        "tier": "free",
        "maxRequestsPerMinute": 60,
        "maxTokensPerMinute": 90000,
        "requiresOrg": false,
        "blockedModels": [],
        "restrictedRegions": []
      }
    },
    "byModel": {
      "provider/model-id": {
        "premiumOnly": false,
        "maxContextLength": 8192,
        "maxOutputTokens": 4096,
        "supportsVision": false,
        "supportsFunctionCalling": true,
        "requiresHigherTier": false,
        "beta": false
      }
    }
  }
}
```

### 3. Update endpoints.json

Add API endpoints:

```json
{
  "endpoints": {
    "provider": {
      "base": "https://api.provider.com/v1",
      "chat": "/chat/completions",
      "models": "/models",
      "embeddings": "/embeddings",
      "timeout": 60000,
      "streaming": true
    }
  }
}
```

### 4. Update quotas.json

Add provider-specific quotas:

```json
{
  "providerQuotas": {
    "provider": {
      "free": { "requestsPerMinute": 60, "tokensPerMinute": 10000 },
      "pro": { "requestsPerMinute": 500, "tokensPerMinute": 100000 }
    }
  }
}
```

## Configuration Schema

### models.json Fields

| Field          | Type    | Description               |
| -------------- | ------- | ------------------------- |
| `id`           | string  | Unique model ID           |
| `name`         | string  | Display name              |
| `family`       | string  | Model family              |
| `attachment`   | boolean | Supports attachments      |
| `reasoning`    | boolean | Has reasoning capability  |
| `tool_call`    | boolean | Supports function calling |
| `release_date` | string  | Release date (YYYY-MM-DD) |
| `modalities`   | object  | Input/output modalities   |
| `open_weights` | boolean | Is open weight            |
| `cost`         | object  | Pricing per 1M tokens     |
| `limit`        | object  | Context/output limits     |

### models-policy.json Fields

| Field                  | Type    | Description                |
| ---------------------- | ------- | -------------------------- |
| `tier`                 | string  | Access tier (free/premium) |
| `maxRequestsPerMinute` | number  | Rate limit                 |
| `maxTokensPerMinute`   | number  | Token rate limit           |
| `requiresOrg`          | boolean | Requires organization      |
| `blockedModels`        | array   | Blocked model IDs          |
| `restrictedRegions`    | array   | Geo-restrictions           |
| `premiumOnly`          | boolean | Requires premium           |
| `requiresHigherTier`   | boolean | Needs upgrade              |

## Adding New Plans

Edit `quotas.json`:

```json
{
  "plans": {
    "newplan": {
      "name": "New Plan",
      "price": 29,
      "limits": {
        "requestsPerMinute": 1000,
        "tokensPerDay": 10000000
      },
      "features": {
        "allModels": true,
        "streaming": true
      },
      "allowedProviders": "all"
    }
  }
}
```

## Best Practices

1. **Versioning**: Always include version field
2. **Validation**: Validate JSON before committing
3. **Documentation**: Update README.md
4. **Testing**: Test configuration loading

## Validation

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('config/models.json'))"

# Check for required fields
node -e "
const models = require('./models.json');
Object.entries(models).forEach(([key, val]) => {
  if (!val.id || !val.name) console.error('Missing fields:', key);
});
"
```

## Questions?

Open an issue at https://github.com/Lifejiggy/grok-code-cli/issues
