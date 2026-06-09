# Providers Fetchers

Production-grade model fetchers for 35+ AI providers. Built for enterprise scale with native fetch, caching, and fallback support.

## Overview

The `fetchers` folder contains model fetching implementations for 35+ AI providers:

- **Cloud Providers**: OpenAI, Anthropic, Google, xAI, DeepSeek, Groq
- **Open Source**: Ollama, LM Studio, Hugging Face, Local AI
- **Aggregators**: OpenRouter, LiteLLM, Vercel AI Gateway
- **Regional**: Azure, AWS Bedrock, Cohere, Together AI
- **Chinese**: Moonshot, Kimi, Zhipu, Qwen, MiniMax
- **Specialized**: Fireworks, Perplexity, Mistral, NVIDIA, OpenCode

## Providers

### Major Cloud Providers

| Provider  | File           | Models | Features          |
| --------- | -------------- | ------ | ----------------- |
| OpenAI    | `open-ai.ts`   | 50+    | Full API, caching |
| Anthropic | `anthropic.ts` | 20+    | Claude models     |
| Google    | `google.ts`    | 30+    | Gemini models     |
| xAI       | `xai.ts`       | 15+    | Grok models       |
| DeepSeek  | `deepseek.ts`  | 10+    | Reasoning models  |
| Groq      | `groq.ts`      | 15+    | Fast inference    |

### Open Source & Local

| Provider     | File             | Description            |
| ------------ | ---------------- | ---------------------- |
| Ollama       | `ollama.ts`      | Local LLM runner       |
| LM Studio    | `lmstudio.ts`    | Local model management |
| Hugging Face | `huggingface.ts` | 100k+ models           |
| Local AI     | -                | Local endpoint         |

### Gateways & Aggregators

| Provider          | File                   | Description    |
| ----------------- | ---------------------- | -------------- |
| OpenRouter        | `openrouter.ts`        | 100+ models    |
| LiteLLM           | `litellm.ts`           | Unified API    |
| Vercel AI Gateway | `vercel-ai-gateway.ts` | Edge caching   |
| Unbound           | `unbound.ts`           | AI aggregation |

### Enterprise Providers

| Provider     | File         | Description     |
| ------------ | ------------ | --------------- |
| Azure OpenAI | `azure.ts`   | Microsoft Azure |
| AWS Bedrock  | `aws.ts`     | Amazon Bedrock  |
| Cohere       | `cohere.ts`  | Enterprise AI   |
| NVIDIA       | `nvidia.ts` | NIM endpoints   |

### Chinese Providers

| Provider | File          | Description    |
| -------- | ------------- | -------------- |
| Moonshot | `moonshot.ts` | Kimi           |
| Kimi     | `kimi.ts`     | Kimi K1.5      |
| Zhipu    | `zhipu.ts`    | GLM models     |
| Qwen     | `qwen.ts`     | Alibaba Qwen   |
| MiniMax  | `minimax.ts`  | MiniMax models |

### Specialized Providers

| Provider    | File             | Description    |
| ----------- | ---------------- | -------------- |
| Mistral     | `mistral.ts`     | Mistral AI     |
| Together AI | `together-ai.ts` | Open source    |
| Fireworks   | `fireworks.ts`   | Fast inference |
| Perplexity  | `perplexity.ts`  | Search AI      |
| OpenCode    | `opencode.ts`    | Code models    |

## Architecture

Each fetcher follows a consistent pattern:

```
fetcher/
├── Static model definitions (fallback)
├── API fetching with native fetch
├── Caching (5 min default)
├── Model filtering
└── Cost estimation
```

## Features

- **Zero Dependencies** - Native fetch API only
- **Static Fallback** - Works without API
- **Caching** - 5-minute cache with clear
- **Type Safety** - Full TypeScript
- **Cost Estimation** - Per-token pricing

## Usage

### Basic Usage

```typescript
import { getOpenAIModels, getOpenAIModelById } from "./fetchers/open-ai.js";

const models = await getOpenAIModels({ apiKey: "sk-..." });
const model = getOpenAIModelById("gpt-4");
```

### Provider-Specific Imports

```typescript
// OpenAI
import { getOpenAIModels } from "./fetchers/open-ai.js";

// Anthropic
import { getAnthropicModels } from "./fetchers/anthropic.js";

// Google
import { getGoogleModels } from "./fetchers/google.js";

// Ollama (local)
import { getOllamaModels, parseOllamaModel } from "./fetchers/ollama.js";

// OpenRouter
import {
  getOpenRouterModels,
  parseOpenRouterModel,
} from "./fetchers/openrouter.js";
```

### Model Filtering

```typescript
import { getOpenAIFreeModels } from "./fetchers/open-ai.js";

const freeModels = getOpenAIFreeModels();
const premiumModels = getOpenAIModels({}).then((m) =>
  Object.values(m).filter((m) => m.tier === "premium"),
);
```

### Cache Management

```typescript
import { clearOpenAICache, getOpenAICacheStatus } from "./fetchers/open-ai.js";

// Check cache status
const status = getOpenAICacheStatus();
console.log(`Cached: ${status.totalModels} models`);

// Clear cache
clearOpenAICache();
```

### Cost Estimation

```typescript
import { estimateCost as estimateOpenAICost } from "./fetchers/open-ai.js";

const cost = estimateOpenAICost("gpt-4", 1000, 500);
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

## Model Interface

```typescript
interface Model {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  costPer1kTokens: number;
  capabilities: (
    | "chat"
    | "code"
    | "vision"
    | "reasoning"
    | "function-calling"
  )[];
  tier: "free" | "premium";
  maxOutputTokens: number;
}
```

## Adding New Providers

1. Create `fetchers/<provider>.ts`
2. Implement interface:

   ```typescript
   export interface <Provider>FetcherOptions {
     apiKey: string;
     baseUrl?: string;
     timeout?: number;
     cacheEnabled?: boolean;
   }

   export async function get<Provider>Models(
     options: <Provider>FetcherOptions
   ): Promise<Record<string, Model>> { ... }

   export function get<Provider>ModelById(id: string): Model | undefined { ... }

   export function clear<Provider>Cache(): void { ... }
   ```

3. Export from `fetchers/index.ts`
4. Add to provider registry

## Caching

All fetchers include built-in caching:

- **Duration**: 5 minutes (configurable)
- **Storage**: In-memory Map
- **API**: `getCacheStatus()`, `clear<Provider>Cache()`

## Error Handling

Fetchers include error handling with static fallback:

```typescript
try {
  const models = await getOpenAIModels({ apiKey });
} catch (error) {
  // Falls back to static definitions
  const fallback = OPENAI_MODELS;
}
```

## Performance

- Native fetch (no axios)
- Concurrent fetching supported
- Connection pooling via utils
- Metrics collection

## File Structure

```
fetchers/
├── open-ai.ts          # OpenAI
├── anthropic.ts        # Anthropic
├── google.ts           # Google
├── xai.ts              # xAI
├── deepseek.ts         # DeepSeek
├── groq.ts             # Groq
├── ollama.ts           # Ollama
├── openrouter.ts       # OpenRouter
├── huggingface.ts      # Hugging Face
├── lmstudio.ts         # LM Studio
├── azure.ts            # Azure OpenAI
├── aws.ts              # AWS Bedrock
├── mistral.ts          # Mistral
├── cohere.ts           # Cohere
├── together-ai.ts      # Together AI
├── fireworks.ts        # Fireworks
├── perplexity.ts       # Perplexity
├── vercel-ai-gateway.ts # Vercel
├── unbound.ts          # Unbound
├── litellm.ts         # LiteLLM
├── deepinfra.ts        # DeepInfra
├── io-intelligence.ts  # IO Intelligence
├── glama.ts            # Glama
├── kimi.ts             # Kimi
├── moonshot.ts         # Moonshot
├── minimax.ts          # MiniMax
├── qwen.ts             # Qwen
├── zhipu.ts            # Zhipu
├── opencode.ts         # OpenCode
├── nvidia.ts          # NVIDIA
├── index.ts            # Exports
└── README.md           # This file
```

## License

MIT
