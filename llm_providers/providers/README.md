# Grok-Code Providers

**BYOA (Bring Your Own API)** - No hardcoded defaults. You must explicitly configure your preferred provider and model.

## ⚠️ Important: No Default Provider

Grok-Code CLI **requires explicit configuration**. There are no default providers or models. You must:

1. Set a provider explicitly
2. Set a model explicitly
3. Add your API key via subscription

## Supported Providers (22+)

| Provider         | Key           | Free Tier     | Premium Models            | Best For         |
| ---------------- | ------------- | ------------- | ------------------------- | ---------------- |
| **xAI**          | `xai`         | Grok 2        | Grok 3, Grok 4            | Reasoning, Code  |
| **OpenAI**       | `openai`      | GPT-4o-mini   | GPT-4o, o1, o3            | General Purpose  |
| **Anthropic**    | `anthropic`   | Claude Haiku  | Claude 3.5/4 Sonnet, Opus | Code, Analysis   |
| **Google**       | `google`      | Gemini Flash  | Gemini 2.0 Pro/Ultra      | Multimodal       |
| **Groq**         | `groq`        | Llama 3.2     | Llama 3.3 70B             | Fast Inference   |
| **DeepSeek**     | `deepseek`    | DeepSeek V3   | DeepSeek R1               | Code, Reasoning  |
| **Mistral**      | `mistral`     | Mistral Small | Mistral Large 2           | European AI      |
| **Cohere**       | `cohere`      | Command Light | Command R+                | Enterprise RAG   |
| **OpenRouter**   | `openrouter`  | Various       | 100+ Models               | Multi-Provider   |
| **Ollama**       | `ollama`      | Free (Local)  | All Models                | Privacy, Offline |
| **Azure**        | `azure`       | -             | GPT-4, GPT-4o             | Enterprise       |
| **AWS Bedrock**  | `aws`         | -             | Claude, Llama             | Enterprise       |
| **Qwen**         | `qwen`        | Qwen Turbo    | Qwen 2.5 Max              | Chinese, Code    |
| **Zhipu**        | `zhipu`       | GLM-4 Flash   | GLM-4 Plus                | Chinese          |
| **Perplexity**   | `perplexity`  | -             | Sonar, Llama              | Search-Augmented |
| **Fireworks**    | `fireworks`   | Various       | All Models                | Fast Inference   |
| **Together AI**  | `together`    | Various       | All Models                | Open Source      |
| **Kimi**         | `kimi`        | Kimi Chat     | Kimi Pro                  | Long Context     |
| **Moonshot**     | `moonshot`    | -             | All Models                | Long Context     |
| **MiniMax**      | `minimax`     | -             | All Models                | Chinese AI       |
| **Hugging Face** | `huggingface` | Serverless    | Dedicated                 | Open Source      |
| **OpenCode**     | `opencode`    | -             | All Models                | Code-Specific    |
| **Kilo**         | `kilo`        | Kilo Free     | Kilo Pro                  | Grok-Code Native |

## Quick Start

### 1. Set Your Provider (Required)

```bash
# Choose your provider - no defaults!
grok-code config set defaultProvider openrouter
```

### 2. Set Your Model (Required)

```bash
# Choose your model explicitly
grok-code config set defaultModel anthropic/claude-3.5-sonnet
```

### 3. Add Your API Key (Required)

```bash
# Add subscription for your provider
grok-code sub add openrouter
# Enter your API key when prompted
```

### 4. Verify Configuration

```bash
# Check your config
grok-code config list

# Should show:
# defaultProvider: openrouter
# defaultModel: anthropic/claude-3.5-sonnet
```

### 5. Use in Code

```typescript
import { callLLM } from "./core/llm.js";
import { subscriptionManager } from "./subscription/manager.js";

// Initialize subscriptions
await subscriptionManager.initialize();

// Call LLM (uses your explicit config)
const response = await callLLM({
  provider: "openrouter", // Must be set
  model: "anthropic/claude-3.5-sonnet", // Must be set
  userPrompt: "Hello!",
});
```

## What Changed?

### Before (❌ Hardcoded Defaults)

```typescript
// Automatically used xai/grok-beta without asking
const response = await callLLM({ userPrompt: "Hello!" });
```

### After (✅ Explicit Configuration Required)

```typescript
// Will FAIL if provider/model not explicitly set
const response = await callLLM({
  provider: "openrouter", // Required - no fallback
  model: "claude-3.5-sonnet", // Required - no fallback
  userPrompt: "Hello!",
});
```

## Configuration Schema

All configuration values are now **required** - no defaults:

```typescript
interface Config {
  defaultProvider: string; // Required - no default
  defaultModel: string; // Required - no default
  apiKeys: Record<string, string>; // Your API keys
  baseUrls: Record<string, string>; // Provider URLs
  maxTokens: number; // Required
  maxRetries: number; // Required
  timeoutMs: number; // Required
  costLimitDaily: number; // Required
  costLimitSession: number; // Required
  zeroDataMode: boolean; // Required
}
```

## Error Handling

If you try to use grok-code without explicit configuration:

```
❌ ERROR Invalid configuration: [
  {
    "path": ["defaultProvider"],
    "message": "Required"
  },
  {
    "path": ["defaultModel"],
    "message": "Required"
  }
]
```

## Model Tiers

### Free Tier Models

- Ideal for development and testing
- Lower context windows
- Rate limited
- No cost per token

### Premium Models

- Latest 2025-2026 models
- Higher context windows (up to 2M tokens)
- Advanced capabilities (vision, audio, reasoning)
- Pay per use

## Directory Structure

```
src/providers/
├── index.ts           # Exports
├── provider-manager.ts # Provider management
├── types.ts           # Type definitions
├── errors.ts          # Error handling
├── kilo.ts            # Kilo provider
├── xai.ts             # xAI (Grok)
├── open-ai.ts         # OpenAI
├── anthropic.ts       # Anthropic Claude
├── google.ts          # Google Gemini
├── groq.ts            # Groq
├── deepseek.ts        # DeepSeek
├── mistral.ts         # Mistral AI
├── cohere.ts          # Cohere
├── openrouter.ts      # OpenRouter
├── ollama.ts          # Ollama (Local)
├── azure.ts           # Azure OpenAI
├── aws.ts             # AWS Bedrock
├── qwen.ts            # Alibaba Qwen
├── zhipu.ts           # Zhipu AI
├── perplexity.ts      # Perplexity
├── fireworks.ts       # Fireworks AI
├── together-ai.ts     # Together AI
├── kimi.ts            # Moonshot Kimi
├── moonshot-ai.ts     # Moonshot AI
├── minimax.ts         # MiniMax
├── hugging-face.ts    # Hugging Face
└── opencode.ts        # OpenCode
```

## Adding a New Provider

1. Create `src/providers/new-provider.ts`:

```typescript
import type { Model, Provider } from "../types/index.js";

export const newProviderProvider: Provider = {
  name: "newprovider",
  displayName: "New Provider",
  baseURL: "https://api.newprovider.com/v1",
  models: [
    {
      id: "model-id",
      name: "Model Name",
      description: "Model description",
      contextLength: 128000,
      costPer1kTokens: 0.001,
      capabilities: ["chat", "code"],
      tier: "free", // or 'premium'
    },
  ],
  defaultModel: "model-id",
};

export const newProviderModels: Model[] = newProviderProvider.models;
```

2. Export in `src/providers/index.ts`
3. Add to `provider-manager.ts`
4. Add subscription info in `src/subscription/providers.ts`

## License

MIT
