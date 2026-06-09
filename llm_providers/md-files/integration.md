# Grok-Code Provider & Subscription Integration

## Overview

Grok-Code CLI implements a **BYOA (Bring Your Own API)** approach for LLM providers. This means:

- **No hardcoded default provider or model**
- **Users must explicitly configure** their preferred provider and model
- **API keys are managed through subscriptions** (BYOK - Bring Your Own Key)

---

## Quick Setup

### Step 1: Set Your Provider

```bash
# Choose any provider - no defaults!
grok-code config set defaultProvider xai
```

### Step 2: Set Your Model

```bash
grok-code config set defaultModel grok-2
```

### Step 3: Add Your API Key

```bash
# Option A: Interactive
grok-code sub add xai

# Option B: Direct
grok-code sub add xai --api-key your-key

# Option C: Environment variable
export XAI_API_KEY=your-key
```

### Step 4: Run a Task

```bash
grok-code run "Explain async/await in Node.js"
```

---

## Production-Grade Implementation

The provider system is now production-ready with these components:

### Core Contracts

```typescript
// src/providers/types.ts
interface LLMRequest {
  provider: string;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  stream?: boolean;
}

interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  raw?: unknown;
}

interface LLMProvider {
  id: string;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  send(request: LLMRequest): Promise<LLMResponse>;
  stream?(request: LLMRequest): AsyncGenerator<LLMChunk, void, unknown>;
}
```

### Universal Adapter

```typescript
// src/providers/universal-adapter.ts
import { UniversalAdapter } from "./universal-adapter.js";

const adapter = new UniversalAdapter({
  id: "xai",
  baseURL: "https://api.x.ai/v1",
  apiKey: "your-key",
  timeout: 60000,
  maxRetries: 3,
});

// Send request
const response = await adapter.send({
  provider: "xai",
  model: "grok-2",
  messages: [{ role: "user", content: "Hello!" }],
});

// Or stream
for await (const chunk of adapter.stream(request)) {
  process.stdout.write(chunk.delta);
}
```

### LLM Router

```typescript
// src/providers/llm-router.ts
import { LLMRouter } from "./llm-router.js";

const router = new LLMRouter({
  defaultProvider: "xai",
  defaultModel: "grok-2",
  enableFallback: true,
  enableCostTracking: true,
  costConfig: {
    dailyLimit: 100,
    sessionLimit: 50,
    warnThreshold: 0.8,
  },
});

// Register providers
router.registerProviderFromConfig("xai", "https://api.x.ai/v1", "xai-key");
router.registerProviderFromConfig(
  "openai",
  "https://api.openai.com/v1",
  "openai-key",
);

// Route request (with automatic retry & fallback)
const response = await router.route({
  provider: "xai",
  model: "grok-2",
  messages: [{ role: "user", content: "Hello!" }],
});

// Get metrics
const metrics = router.getMetrics();
```

### Execution Flow

```
User Command (grok-code run)
    │
    ▼
loadConfig() - Get user's provider/model
    │
    ▼
subscriptionManager.initialize() - Load API keys
    │
    ▼
initializeRouter() - Set up LLMRouter
    │
    ├─▶ Register providers from subscriptions
    │
    └─▶ Fallback to config env vars
    │
    ▼
router.route(request)
    │
    ├─▶ Retry with exponential backoff
    │
    ├─▶ Fallback to secondary provider (if enabled)
    │
    └─▶ Track costs
    │
    ▼
Return LLMResponse
```

---

## Supported Providers (22+)

### Core Components

```
src/
├── providers/               # Provider definitions and management
│   ├── index.ts            # Main exports
│   ├── provider-manager.ts  # Provider client management
│   ├── types.ts            # Type definitions
│   ├── errors.ts           # Error handling
│   ├── fetchers/           # Model fetching from APIs
│   │   ├── open-ai.ts     # OpenAI models fetcher
│   │   ├── xai.ts        # xAI (Grok) models fetcher
│   │   ├── anthropic.ts  # Anthropic Claude models
│   │   ├── google.ts      # Google Gemini models
│   │   ├── groq.ts        # Groq models
│   │   ├── deepseek.ts    # DeepSeek models
│   │   └── ...            # More fetchers
│   ├── utils/              # Provider utilities
│   └── [provider].ts      # Individual provider configs
│
├── subscription/           # API key management
│   ├── index.ts           # Main exports
│   ├── manager.ts         # Subscription manager
│   ├── providers.ts       # Provider metadata
│   ├── types.ts           # Type definitions
│   └── secure-storage.ts  # Encrypted key storage
│
├── config/                # Configuration management
│   ├── index.ts           # Config loading/saving
│   └── schema.ts          # Config validation schema
│
├── core/
│   └── llm.ts            # LLM calling interface
│
└── commands/
    ├── provider.ts       # Provider CLI commands
    ├── model.ts          # Model CLI commands
    ├── provider-selector.ts # Interactive UI
    └── model-selector.ts # Interactive UI
```

---

## Provider System

### Provider Definition

Each provider is defined as a `Provider` object in its own file:

```typescript
// src/providers/xai.ts
import type { Model, Provider } from "../types/index.js";

export const xaiProvider: Provider = {
  name: "xai",
  displayName: "xAI (Grok)",
  baseURL: "https://api.x.ai/v1",
  models: [
    {
      id: "grok-4",
      name: "Grok 4",
      description: "Latest flagship Grok model",
      contextLength: 256000,
      costPer1kTokens: 0.03,
      capabilities: ["chat", "code", "reasoning", "vision", "function-calling"],
      tier: "enterprise",
      maxOutputTokens: 65536,
    },
    // ... more models
  ],
  defaultModel: "grok-4",
  defaultFreeModel: "grok-2",
  defaultPremiumModel: "grok-3",
  subscription: {
    required: true,
    envKey: "XAI_API_KEY",
    signupUrl: "https://console.x.ai/",
  },
};

export const xaiModels: Model[] = xaiProvider.models;
```

### Provider Properties

| Property              | Type    | Description                               |
| --------------------- | ------- | ----------------------------------------- |
| `name`                | string  | Unique identifier (e.g., 'xai', 'openai') |
| `displayName`         | string  | Human-readable name                       |
| `baseURL`             | string  | API endpoint base URL                     |
| `models`              | Model[] | Available models                          |
| `defaultModel`        | string  | Default model ID                          |
| `defaultFreeModel`    | string  | Default free tier model                   |
| `defaultPremiumModel` | string  | Default premium model                     |
| `subscription`        | object  | Subscription requirements                 |

### Model Properties

```typescript
interface Model {
  id: string; // Unique model ID
  name: string; // Display name
  description: string; // Description
  contextLength: number; // Max context tokens
  costPer1kTokens: number; // Price per 1K tokens
  capabilities: string[]; // ['chat', 'code', 'vision', ...]
  tier: "free" | "premium" | "enterprise";
  maxOutputTokens: number;
  releaseDate?: string;
}
```

---

## Subscription System (BYOK)

### How It Works

The subscription system manages API keys securely:

```typescript
// src/subscription/manager.ts
export class SubscriptionManager {
  async initialize(): Promise<void> {
    await this.loadConfig();
    await this.migrateFromLegacyConfig();
  }

  async addSubscription(
    options: AddSubscriptionOptions,
  ): Promise<ProviderSubscription> {
    // Validate API key
    // Encrypt and store
    // Return subscription object
  }

  getActiveSubscriptions(): ProviderSubscription[] {
    // Return all active subscriptions
  }

  getSubscriptionsByProvider(provider: string): ProviderSubscription[] {
    // Filter by provider
  }
}
```

### Provider Configuration

Each supported provider is configured in `src/subscription/providers.ts`:

```typescript
export const PROVIDERS: Record<string, ProviderConfig> = {
  xai: {
    name: "xai",
    displayName: "xAI (Grok)",
    baseUrl: "https://api.x.ai/v1",
    envKey: "XAI_API_KEY",
    description: "Elon Musk's xAI - Grok models",
    features: ["chat", "reasoning", "code", "vision"],
  },
  // ... more providers
};
```

---

## Configuration System

### Config Schema

Configuration is validated using Zod:

```typescript
// src/config/schema.ts
export const ProviderSchema = z.enum([
  "xai",
  "openai",
  "anthropic",
  "google",
  "groq",
  "deepseek",
  "openrouter",
  "ollama",
  "azure",
  "aws",
  // ... more providers
]);

export const ConfigSchema = z.object({
  defaultProvider: ProviderSchema, // Required!
  defaultModel: z.string(), // Required!
  apiKeys: z.record(ProviderSchema, z.string().optional()),
  baseUrls: z.record(ProviderSchema, z.string().optional()),
  maxTokens: z.number(),
  maxRetries: z.number(),
  timeoutMs: z.number(),
  costLimitDaily: z.number(),
  costLimitSession: z.number(),
  zeroDataMode: z.boolean(),
});
```

### Loading Configuration

```typescript
// src/config/index.ts
export async function loadConfig(): Promise<Config> {
  const fileConfig = await loadConfigFromFile();
  const envConfig = loadConfigFromEnv();

  // Merge with env taking precedence
  const merged = { ...fileConfig, ...envConfig };

  // Validate (will throw if required fields missing)
  return ConfigSchema.parse(merged);
}
```

---

## LLM Integration

### Calling LLM

The core LLM interface uses subscriptions:

```typescript
// src/core/llm.ts
export async function callLLM(options: LLMCallOptions): Promise<LLMResponse> {
  const config = await loadConfig();

  const provider = options.provider || config.defaultProvider;
  const model = options.model || config.defaultModel;

  // Get API key from subscription first, then config
  const apiKey = await getApiKeyWithSubscription(provider, config);

  if (!apiKey) {
    throw new LLMError(`No API key for provider: ${provider}`);
  }

  const client = new OpenAI({ apiKey, baseURL: providerBaseUrl });

  const completion = await client.chat.completions.create({
    model,
    messages: [...],
  });

  return { content: completion.choices[0].message.content, ... };
}
```

---

## CLI Commands

### Provider Commands

```bash
# Open interactive provider selector
grok-code provider

# List all providers
grok-code provider list

# Set default provider
grok-code provider set openai

# Add provider with API key
grok-code provider add openai --api-key sk-xxx

# Show provider info
grok-code provider info openai

# Test provider
grok-code provider test openai

# List models for provider
grok-code provider models openai
```

### Model Commands

```bash
# Open interactive model selector
grok-code model

# List available models
grok-code model list

# Set default model
grok-code model set gpt-4o

# Show model info
grok-code model info gpt-4o

# Show current model
grok-code model current
```

### Subscription Commands

```bash
# Add subscription
grok-code sub add

# List subscriptions
grok-code sub list

# Validate API keys
grok-code sub validate

# Show usage
grok-code sub status
```

---

## Fetchers System

Fetchers dynamically fetch available models from provider APIs:

```typescript
// src/providers/fetchers/open-ai.ts
export async function getOpenAIModels(
  options: FetcherOptions,
): Promise<Record<string, Model>> {
  const { apiKey, baseUrl = "https://api.openai.com/v1" } = options;

  const response = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();

  // Parse and return models
  return models;
}
```

### Fetcher Features

- **Caching**: Models are cached to reduce API calls
- **Fallback**: Returns static config if API unavailable
- **Validation**: Zod schemas validate API responses
- **Error Handling**: Graceful degradation

---

## Adding a New Provider

### Step 1: Create Provider File

```typescript
// src/providers/newprovider.ts
import type { Model, Provider } from "../types/index.js";

export const newProviderProvider: Provider = {
  name: "newprovider",
  displayName: "New Provider",
  baseURL: "https://api.newprovider.com/v1",
  models: [
    {
      id: "model-id",
      name: "Model Name",
      description: "Description",
      contextLength: 128000,
      costPer1kTokens: 0.001,
      capabilities: ["chat", "code"],
      tier: "free",
    },
  ],
  defaultModel: "model-id",
  subscription: {
    required: true,
    envKey: "NEWPROVIDER_API_KEY",
    signupUrl: "https://newprovider.com/",
  },
};
```

### Step 2: Export in Index

```typescript
// src/providers/index.ts
export * from "./newprovider.js";
```

### Step 3: Register in Manager

```typescript
// src/providers/provider-manager.ts
import { newProviderProvider } from './newprovider.js';

private registerAllProviders(): void {
  // ... existing providers
  this.registerProvider(newProviderProvider);
}
```

### Step 4: Add to Subscription Providers

```typescript
// src/subscription/providers.ts
newprovider: {
  name: 'newprovider',
  displayName: 'New Provider',
  baseUrl: 'https://api.newprovider.com/v1',
  envKey: 'NEWPROVIDER_API_KEY',
  description: 'Description',
  features: ['chat', 'code'],
},
```

### Step 5: Add to Config Schema

```typescript
// src/config/schema.ts
export const ProviderSchema = z.enum([
  // ... existing
  "newprovider",
]);
```

### Step 6: Create Fetcher (Optional)

```typescript
// src/providers/fetchers/newprovider.ts
export async function getNewProviderModels(options) {
  // Fetch from API
  // Return models
}
```

---

## Security

### Key Storage

API keys are encrypted using AES-256-GCM:

```typescript
// src/subscription/secure-storage.ts
export class SecureKeyStorage {
  async storeKey(provider: string, key: string): Promise<void> {
    const encrypted = await this.encrypt(key);
    // Store encrypted
  }

  async retrieveKey(provider: string): Promise<string | null> {
    const encrypted = await this.get(provider);
    return encrypted ? this.decrypt(encrypted) : null;
  }
}
```

### Best Practices

1. **Never log API keys** in plaintext
2. **Use environment variables** for CI/CD
3. **Validate keys** before use
4. **Rotate keys regularly**
5. **Use minimum required permissions**

---

## Error Handling

### Configuration Errors

If provider/model not explicitly set:

```json
{
  "path": ["defaultProvider"],
  "message": "Required"
}
```

### Subscription Errors

```typescript
throw new LLMError(
  `No API key found for provider: ${provider}\n\n` +
    `To add your subscription:\n` +
    `  grok-code sub add ${provider}\n\n` +
    `Or set environment variable:\n` +
    `  export ${provider.toUpperCase()}_API_KEY=your-key`,
);
```

---

## Usage Flow

```
User Action
    │
    ▼
CLI Command (provider/model/sub)
    │
    ▼
Load Config (config/)
    │
    ├─▶ File Config (~/.grok/config.json)
    │
    └─▶ Env Variables
    │
    ▼
Validate Schema
    │
    ▼
Initialize Subscription
    │
    ▼
Get API Key (subscription/manager)
    │
    ├─▶ From stored subscription
    │
    └─▶ From config/env
    │
    ▼
Call LLM (core/llm)
    │
    ▼
Return Response
```

---

## Supported Providers

| Provider    | Key        | Free Tier    | Premium     |
| ----------- | ---------- | ------------ | ----------- |
| xAI         | xai        | Grok 2       | Grok 3/4    |
| OpenAI      | openai     | GPT-4o-mini  | GPT-4o, o1  |
| Anthropic   | anthropic  | Claude Haiku | Claude 4    |
| Google      | google     | Gemini Flash | Gemini Pro  |
| Groq        | groq       | Llama 3.2    | Llama 3.3   |
| DeepSeek    | deepseek   | DeepSeek V3  | DeepSeek R1 |
| OpenRouter  | openrouter | Various      | 100+ Models |
| Ollama      | ollama     | All (Local)  | -           |
| And more... |            |              |             |

---

## License

MIT
