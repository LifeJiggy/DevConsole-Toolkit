# Contributing to Providers Fetchers

Thank you for contributing to the Grok-Code CLI provider fetchers. This guide covers how to add new providers.

## Adding a New Provider

### 1. Create the Fetcher File

Create `fetchers/<provider>.ts`:

```typescript
import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface ProviderFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

// Static model definitions (fallback)
const PROVIDER_MODELS: Record<string, Model> = {
  'model-id': {
    id: 'model-id',
    name: 'Model Name',
    description: 'Model description',
    contextLength: 128000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
};

export async function getProviderModels(
  options: ProviderFetcherOptions
): Promise<Record<string, Model>> {
  const { apiKey, baseUrl = 'https://api.provider.com', timeout = 10000, cacheEnabled = true } = options;
  const now = Date.now();

  // Return cached data if valid
  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  // Start with static models
  const models: Record<string, Model> = { ...PROVIDER_MODELS };

  try {
    // Fetch from API
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(timeout),
    });

    if (response.ok) {
      const data = await response.json();
      // Parse API response and merge with static models
      // ...
    }
  } catch (error) {
    console.warn('Failed to fetch provider models');
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getProviderModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || PROVIDER_MODELS[modelId];
}

export function clearProviderCache(): void {
  cache = null;
}

export default { getProviderModels, getProviderModelById, clearProviderCache };
}
```

### 2. Required Exports

Every fetcher must export:

```typescript
// Get all models
export async function get<Provider>Models(options: FetcherOptions): Promise<Record<string, Model>>

// Get single model by ID
export function get<Provider>ModelById(modelId: string): Model | undefined

// Clear cache
export function clear<Provider>Cache(): void
```

### 3. Optional Exports

```typescript
// Get free tier models
export function get<Provider>FreeModels(): Record<string, Model>

// Get vision models
export function get<Provider>VisionModels(): Record<string, Model>

// Cost estimation
export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number

// Search models
export function searchModels(query: string): Record<string, Model>
```

### 4. Update Index

Add to `fetchers/index.ts`:

```typescript
export {
  getProviderModels,
  getProviderModelById,
  clearProviderCache,
} from "./provider.js";
```

### 5. Register Provider

Add provider to the provider registry in `src/config/schema.ts` or `src/subscription/providers.ts`.

## Fetcher Interface

```typescript
interface Model {
  id: string; // Unique model ID
  name: string; // Display name
  description: string; // Model description
  contextLength: number; // Max context tokens
  costPer1kTokens: number; // Price per 1K tokens
  capabilities: (// Supported features
  "chat" | "code" | "vision" | "reasoning" | "function-calling" | "search")[];
  tier: "free" | "premium"; // Pricing tier
  maxOutputTokens: number; // Max output length
}
```

## Caching

All fetchers use in-memory caching:

- **Duration**: 5 minutes
- **Storage**: Module-level Map
- **API**: `clear<Provider>Cache()`, `get<Provider>CacheStatus()`

## Static Fallback

Every fetcher must include static model definitions. These are used when:

- API is unavailable
- API key is not configured
- Network error occurs

## Error Handling

```typescript
try {
  const models = await getProviderModels({ apiKey });
} catch (error) {
  // Falls back to static models
  return PROVIDER_MODELS;
}
```

## Testing

Test your fetcher:

```typescript
import {
  getProviderModels,
  getProviderModelById,
} from "./fetchers/provider.js";

async function test() {
  const models = await getProviderModels({
    apiKey: process.env.PROVIDER_API_KEY,
  });

  console.log(`Loaded ${Object.keys(models).length} models`);

  const model = getProviderModelById("model-id");
  console.log(model);
}

test();
```

## Provider Examples

### Simple Fetcher

```typescript
// Minimal implementation
export async function getModels(options) {
  const response = await fetch(`${options.baseUrl}/models`, {
    headers: { Authorization: `Bearer ${options.apiKey}` },
  });
  const data = await response.json();
  return data.models;
}
```

### Complex Fetcher with Filtering

```typescript
// Multiple export functions
export function getFreeModels(): Record<string, Model> {
  return Object.entries(PROVIDER_MODELS)
    .filter(([, m]) => m.tier === "free")
    .reduce((acc, [id, m]) => ({ ...acc, [id]: m }), {});
}

export function getVisionModels(): Record<string, Model> {
  return Object.entries(PROVIDER_MODELS)
    .filter(([, m]) => m.capabilities.includes("vision"))
    .reduce((acc, [id, m]) => ({ ...acc, [id]: m }), {});
}
```

## Code Standards

1. **Zero Dependencies** - Use native `fetch` only
2. **TypeScript** - Full type coverage
3. **Static Fallback** - Always include default models
4. **Caching** - Implement 5-minute cache
5. **Error Handling** - Graceful degradation

## Provider Categories

When adding a new provider, categorize it:

- **Cloud**: OpenAI, Anthropic, Google
- **Open Source**: Ollama, LM Studio
- **Gateway**: OpenRouter, LiteLLM
- **Enterprise**: Azure, AWS
- **Regional**: Chinese providers
- **Specialized**: Code, Search, Vision

## Questions?

Open an issue at https://github.com/Kilo-Org/grok-code-cli/issues
