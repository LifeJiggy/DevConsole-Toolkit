import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface OllamaFetcherOptions {
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const OLLAMA_MODELS: Record<string, Model> = {
  'llama3.2': {
    id: 'llama3.2',
    name: 'Llama 3.2',
    description: 'Meta Llama 3.2 - run locally',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'llama3.1': {
    id: 'llama3.1',
    name: 'Llama 3.1',
    description: 'Meta Llama 3.1 - run locally',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  llama3: {
    id: 'llama3',
    name: 'Llama 3',
    description: 'Meta Llama 3 - run locally',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral AI model - run locally',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  codellama: {
    id: 'codellama',
    name: 'CodeLlama',
    description: 'Code-specialized Llama - run locally',
    contextLength: 16384,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  phi3: {
    id: 'phi3',
    name: 'Phi-3',
    description: 'Microsoft Phi-3 - run locally',
    contextLength: 4096,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 2048,
  },
  'qwen2.5': {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    description: 'Alibaba Qwen 2.5 - run locally',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  gemma2: {
    id: 'gemma2',
    name: 'Gemma 2',
    description: 'Google Gemma 2 - run locally',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
};

export async function getOllamaModels(
  options: OllamaFetcherOptions = {}
): Promise<Record<string, Model>> {
  const { baseUrl = 'http://localhost:11434', timeout = 5000, cacheEnabled = true } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...OLLAMA_MODELS };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        for (const m of data.models) {
          models[m.name] = {
            id: m.name,
            name: m.name,
            description: `Local model: ${m.name}`,
            contextLength: 4096,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code'],
            tier: 'free',
            maxOutputTokens: 4096,
          };
        }
      }
    }
  } catch {
    console.warn(`Failed connecting to Ollama at ${baseUrl}`);
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getOllamaModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || OLLAMA_MODELS[modelId];
}

export function parseOllamaModel(raw: any): Model {
  return {
    id: raw.details?.family || 'unknown',
    name: raw.details?.family || 'Unknown',
    description: `Family: ${raw.details?.family || 'unknown'}`,
    contextLength: 4096,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  };
}

export function clearOllamaCache(): void {
  cache = null;
}

export default {
  getOllamaModels,
  getOllamaModelById,
  parseOllamaModel,
  clearOllamaCache,
};
