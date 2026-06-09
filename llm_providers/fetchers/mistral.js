import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface MistralFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const MISTRAL_MODELS: Record<string, Model> = {
  'mistral-small-latest': {
    id: 'mistral-small-latest',
    name: 'Mistral Small 3',
    description: 'Free tier - fast and efficient',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'ministral-8b-latest': {
    id: 'ministral-8b-latest',
    name: 'Ministral 8B',
    description: 'Free tier - edge computing model',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'mistral-medium-latest': {
    id: 'mistral-medium-latest',
    name: 'Mistral Medium 3',
    description: 'Balanced performance model',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'mistral-large-latest': {
    id: 'mistral-large-latest',
    name: 'Mistral Large 2',
    description: 'High capability flagship model',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'codestral-latest': {
    id: 'codestral-latest',
    name: 'Codestral',
    description: 'Code-specialized model - 80+ languages',
    contextLength: 32768,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'pixtral-12b-2409': {
    id: 'pixtral-12b-2409',
    name: 'Pixtral 12B',
    description: 'Vision model for image understanding',
    contextLength: 131072,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'mistral-large-3': {
    id: 'mistral-large-3',
    name: 'Mistral Large 3',
    description: 'Latest flagship with enhanced capabilities',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'enterprise',
    maxOutputTokens: 32768,
  },
  'mistral-nemo': {
    id: 'mistral-nemo',
    name: 'Mistral Nemo',
    description: 'Mistral Nemo model',
    contextLength: 131072,
    costPer1kTokens: 0.00002,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'mistral-small-3.2-24b': {
    id: 'mistral-small-3.2-24b',
    name: 'Mistral Small 3.2 24B',
    description: 'Mistral Small 3.2 24B',
    contextLength: 131072,
    costPer1kTokens: 0.00006,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistral-small-creative': {
    id: 'mistral-small-creative',
    name: 'Mistral Small Creative',
    description: 'Mistral Small Creative',
    contextLength: 32768,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'ministral-3-14b-2512': {
    id: 'ministral-3-14b-2512',
    name: 'Ministral 3 14B 2512',
    description: 'Ministral 3 14B 2512',
    contextLength: 262144,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistral-small-3': {
    id: 'mistral-small-3',
    name: 'Mistral Small 3',
    description: 'Mistral Small 3 model',
    contextLength: 32768,
    costPer1kTokens: 0.00005,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'ministral-3-3b-2512': {
    id: 'ministral-3-3b-2512',
    name: 'Ministral 3 3B 2512',
    description: 'Ministral 3 3B 2512',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'mistral-large-3-2512': {
    id: 'mistral-large-3-2512',
    name: 'Mistral Large 3 2512',
    description: 'Mistral Large 3 2512',
    contextLength: 262144,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'ministral-3-8b-2512': {
    id: 'ministral-3-8b-2512',
    name: 'Ministral 3 8B 2512',
    description: 'Ministral 3 8B 2512',
    contextLength: 262144,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'codestral-2508': {
    id: 'codestral-2508',
    name: 'Codestral 2508',
    description: 'Codestral 2508',
    contextLength: 256000,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'mistral-medium-3.1': {
    id: 'mistral-medium-3.1',
    name: 'Mistral Medium 3.1',
    description: 'Mistral Medium 3.1',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'devstral-2-2512': {
    id: 'devstral-2-2512',
    name: 'Devstral 2 2512',
    description: 'Devstral 2 2512',
    contextLength: 262144,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'devstral-small-1.1': {
    id: 'devstral-small-1.1',
    name: 'Devstral Small 1.1',
    description: 'Devstral Small 1.1',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistral-small-3.1-24b': {
    id: 'mistral-small-3.1-24b',
    name: 'Mistral Small 3.1 24B',
    description: 'Mistral Small 3.1 24B',
    contextLength: 128000,
    costPer1kTokens: 0.00035,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mixtral-8x7b-instruct': {
    id: 'mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    description: 'Mixtral 8x7B Instruct',
    contextLength: 32768,
    costPer1kTokens: 0.00054,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'mistral-medium-3': {
    id: 'mistral-medium-3',
    name: 'Mistral Medium 3',
    description: 'Mistral Medium 3',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistral-large-2411': {
    id: 'mistral-large-2411',
    name: 'Mistral Large 2411',
    description: 'Mistral Large 2411',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'codestral-embed-2505': {
    id: 'codestral-embed-2505',
    name: 'Codestral Embed 2505',
    description: 'Codestral Embed 2505',
    contextLength: 8192,
    costPer1kTokens: 0.00015,
    capabilities: ['embedding'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'mistral-small-3.1-24b-free': {
    id: 'mistral-small-3.1-24b-free',
    name: 'Mistral Small 3.1 24B (free)',
    description: 'Mistral Small 3.1 24B - FREE',
    contextLength: 128000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
};

export async function getMistralModels(
  options: MistralFetcherOptions
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://api.mistral.ai/v1',
    timeout = 10000,
    cacheEnabled = true,
  } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...MISTRAL_MODELS };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        for (const m of data.data) {
          const existing = MISTRAL_MODELS[m.id];
          models[m.id] = {
            id: m.id,
            name: existing?.name || m.id,
            description: existing?.description || `Mistral ${m.id}`,
            contextLength: existing?.contextLength || 131072,
            costPer1kTokens: existing?.costPer1kTokens || 0,
            capabilities: existing?.capabilities || ['chat', 'code'],
            tier: existing?.tier || 'premium',
            maxOutputTokens: existing?.maxOutputTokens || 8192,
          };
        }
      }
    }
  } catch {
    console.warn('Failed to fetch Mistral models');
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getMistralModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || MISTRAL_MODELS[modelId];
}

export function clearMistralCache(): void {
  cache = null;
}

export default { getMistralModels, getMistralModelById, clearMistralCache };
