# Grok-Code Subscription System

**BYOK (Bring Your Own Key)** - Use your own API keys from 22+ LLM providers with Grok-Code CLI.

## Features

- **Multi-Provider Support**: 22+ LLM providers
- **Secure Key Storage**: Encrypted storage with AES-256-GCM
- **Usage Tracking**: Monitor tokens, requests, and costs
- **Health Checks**: Validate API keys and check provider status
- **Auto-Migration**: Automatically migrates legacy API keys
- **Fallback Chain**: Automatic fallback to alternative providers

## Installation

```bash
# No additional installation required
# Subscription system is built into grok-code
```

## Quick Start

### 1. Add Your First Subscription

```bash
# Interactive mode
grok-code sub add

# Direct mode
grok-code sub add openai --api-key sk-xxx

# Set as default
grok-code sub add anthropic --api-key sk-ant-xxx --default
```

### 2. List Subscriptions

```bash
grok-code sub list

# Output:
# ● openai (default)
#   ID: abc123...
#   Provider: OpenAI
#   Usage: 150 requests, 45000 tokens, $0.2340
#
# ● anthropic
#   ID: def456...
#   Provider: Anthropic Claude
```

### 3. Validate API Keys

```bash
# Validate all
grok-code sub validate

# Validate specific
grok-code sub validate abc123...
```

## CLI Commands

| Command              | Description                |
| -------------------- | -------------------------- |
| `sub add [provider]` | Add new subscription       |
| `sub list`           | List all subscriptions     |
| `sub remove <id>`    | Remove subscription        |
| `sub default <id>`   | Set default provider       |
| `sub validate [id]`  | Validate API keys          |
| `sub status`         | Show usage statistics      |
| `sub health`         | Health check all providers |
| `sub providers`      | List supported providers   |

## Supported Providers

```bash
grok-code sub providers
```

| Provider    | Environment Variable   | Free Tier     |
| ----------- | ---------------------- | ------------- |
| xAI         | `XAI_API_KEY`          | Grok 2 Free   |
| OpenAI      | `OPENAI_API_KEY`       | GPT-4o-mini   |
| Anthropic   | `ANTHROPIC_API_KEY`    | Claude Haiku  |
| Google      | `GOOGLE_AI_API_KEY`    | Gemini Flash  |
| Groq        | `GROQ_API_KEY`         | Llama 3.2     |
| DeepSeek    | `DEEPSEEK_API_KEY`     | DeepSeek V3   |
| Mistral     | `MISTRAL_API_KEY`      | Mistral Small |
| Cohere      | `COHERE_API_KEY`       | Command Light |
| OpenRouter  | `OPENROUTER_API_KEY`   | Various       |
| Ollama      | `OLLAMA_API_KEY`       | All (Local)   |
| Azure       | `AZURE_OPENAI_API_KEY` | -             |
| AWS         | `AWS_BEDROCK_API_KEY`  | -             |
| Qwen        | `QWEN_API_KEY`         | Qwen Turbo    |
| Zhipu       | `ZHIPU_API_KEY`        | GLM-4 Flash   |
| Perplexity  | `PERPLEXITY_API_KEY`   | -             |
| Fireworks   | `FIREWORKS_API_KEY`    | Various       |
| Together    | `TOGETHER_API_KEY`     | Various       |
| Kimi        | `KIMI_API_KEY`         | Kimi Chat     |
| Moonshot    | `MOONSHOT_API_KEY`     | -             |
| MiniMax     | `MINIMAX_API_KEY`      | -             |
| HuggingFace | `HUGGINGFACE_API_KEY`  | Serverless    |
| OpenCode    | `OPENCODE_API_KEY`     | -             |
| Kilo        | `KILO_API_KEY`         | Kilo Free     |

## Architecture

```
src/subscription/
├── index.ts          # Module exports
├── types.ts          # TypeScript types and Zod schemas
├── manager.ts        # Subscription manager
├── providers.ts      # Provider configurations
└── secure-storage.ts # Encrypted key storage
```

### SubscriptionManager

Core class for managing subscriptions:

```typescript
import { subscriptionManager } from './subscription/manager.js';

// Initialize
await subscriptionManager.initialize();

// Add subscription
const sub = await subscriptionManager.addSubscription({
  provider: 'openai',
  apiKey: 'sk-xxx',
  setAsDefault: true,
});

// Get active subscriptions
const active = subscriptionManager.getActiveSubscriptions();

// Get default
const default = subscriptionManager.getDefaultSubscription();

// Validate
const result = await subscriptionManager.validateSubscription(sub);

// Update usage
await subscriptionManager.updateUsage(sub.id, {
  tokens: 1000,
  cost: 0.01,
});
```

### SecureKeyStorage

Encrypted key storage:

```typescript
import { secureKeyStorage } from "./subscription/secure-storage.js";

// Initialize with password
await secureKeyStorage.initialize("my-password");

// Store key
await secureKeyStorage.storeKey("openai", "sk-xxx", "file");

// Retrieve key
const key = await secureKeyStorage.retrieveKey("openai", "file");

// Mask key for display
const masked = secureKeyStorage.maskKey("sk-xxxxxxxxxxxx1234");
// Output: sk-xxxx****1234
```

## Configuration

Subscriptions are stored in `~/.grok/subscriptions.json`:

```json
{
  "defaultSubscriptionId": "uuid-here",
  "subscriptions": [
    {
      "id": "uuid",
      "provider": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "isActive": true,
      "isDefault": true,
      "addedAt": "2025-01-15T...",
      "usageStats": {
        "totalRequests": 150,
        "totalTokens": 45000,
        "totalCost": 0.234
      }
    }
  ],
  "fallbackChain": ["openai", "anthropic", "groq"],
  "autoSwitch": true
}
```

## Events

Subscribe to subscription events:

```typescript
subscriptionManager.on("subscription_added", (event, data) => {
  console.log("New subscription:", data.subscription);
});

subscriptionManager.on("usage_updated", (event, data) => {
  console.log("Usage:", data.usage);
});
```

Available events:

- `subscription_added`
- `subscription_updated`
- `subscription_removed`
- `subscription_activated`
- `subscription_deactivated`
- `subscription_validated`
- `subscription_failed`
- `provider_switched`
- `fallback_triggered`
- `usage_updated`

## Migration

The system automatically migrates from legacy configuration:

1. Reads `~/.grok/config.json`
2. Extracts `apiKeys` object
3. Creates subscriptions for each provider
4. Preserves default provider setting

## Security

- API keys are stored securely with AES-256-GCM encryption
- Keys are never logged or exposed in plaintext
- Support for external secret managers (vault)
- Memory-only storage option for sensitive environments

## Best Practices

1. **Use the CLI**: Add subscriptions via CLI for secure storage
2. **Validate Keys**: Run `grok-code sub validate` after adding
3. **Monitor Usage**: Check `grok-code sub status` regularly
4. **Set Defaults**: Always have a default provider
5. **Fallback Chain**: Configure providers for automatic failover

## License

MIT
