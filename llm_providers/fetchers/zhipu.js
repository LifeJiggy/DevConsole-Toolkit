import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface ZhipuFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const ZHIPU_MODELS: Record<string, Model> = {
  'glm-3-turbo': {
    id: 'glm-3-turbo',
    name: 'GLM-3 Turbo',
    description: 'Free tier - fast Chinese model',
    contextLength: 16384,
    costPer1kTokens: 0.00005,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'glm-4': {
    id: 'glm-4',
    name: 'GLM-4',
    description: 'Free tier - general purpose Chinese model',
    contextLength: 128000,
    costPer1kTokens: 0.00035,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'glm-4v': {
    id: 'glm-4v',
    name: 'GLM-4V',
    description: 'Free tier - vision-capable model',
    contextLength: 8192,
    costPer1kTokens: 0.0007,
    capabilities: ['chat', 'vision'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'glm-4-flash': {
    id: 'glm-4-flash',
    name: 'GLM-4 Flash',
    description: 'Free tier - fast and efficient',
    contextLength: 128000,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'glm-4-plus': {
    id: 'glm-4-plus',
    name: 'GLM-4 Plus',
    description: 'Flagship Chinese model',
    contextLength: 128000,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'glm-4v-plus': {
    id: 'glm-4v-plus',
    name: 'GLM-4V Plus',
    description: 'Enhanced vision-capable model',
    contextLength: 128000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'glm-4-long': {
    id: 'glm-4-long',
    name: 'GLM-4 Long',
    description: 'Extended context model',
    contextLength: 1048576,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'long-context'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-4-flashx': {
    id: 'glm-4-flashx',
    name: 'GLM-4 FlashX',
    description: 'Fast model with function calling',
    contextLength: 128000,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'glm-3-6b': {
    id: 'glm-3-6b',
    name: 'GLM-3 6B',
    description: 'Compact Chinese model',
    contextLength: 32768,
    costPer1kTokens: 0.00003,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'glm-4-9b': {
    id: 'glm-4-9b',
    name: 'GLM-4 9B',
    description: 'Efficient Chinese model',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'glm-4-32b': {
    id: 'glm-4-32b',
    name: 'GLM-4 32B',
    description: 'Balanced Chinese model',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'glm-4-70b': {
    id: 'glm-4-70b',
    name: 'GLM-4 70B',
    description: 'Large Chinese model',
    contextLength: 131072,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-5-flash': {
    id: 'glm-5-flash',
    name: 'GLM-5 Flash',
    description: 'GLM-5 fast model',
    contextLength: 200000,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'glm-5-plus': {
    id: 'glm-5-plus',
    name: 'GLM-5 Plus',
    description: 'GLM-5 standard model',
    contextLength: 200000,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-5': {
    id: 'glm-5',
    name: 'GLM-5',
    description: 'GLM-5 flagship model',
    contextLength: 256000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'glm-5-long': {
    id: 'glm-5-long',
    name: 'GLM-5 Long',
    description: 'GLM-5 extended context',
    contextLength: 1048576,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'long-context', 'vision'],
    tier: 'enterprise',
    maxOutputTokens: 32768,
  },
  'glm-5-vision': {
    id: 'glm-5-vision',
    name: 'GLM-5 Vision',
    description: 'GLM-5 enhanced vision',
    contextLength: 256000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-4.7': {
    id: 'glm-4.7',
    name: 'GLM 4.7',
    description: 'GLM 4.7 model',
    contextLength: 202752,
    costPer1kTokens: 0.00038,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-4.5-air': {
    id: 'glm-4.5-air',
    name: 'GLM 4.5 Air',
    description: 'GLM 4.5 Air - free',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'glm-4.7-flash': {
    id: 'glm-4.7-flash',
    name: 'GLM 4.7 Flash',
    description: 'GLM 4.7 fast model',
    contextLength: 202752,
    costPer1kTokens: 0.00006,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-4.6': {
    id: 'glm-4.6',
    name: 'GLM 4.6',
    description: 'GLM 4.6 model',
    contextLength: 204800,
    costPer1kTokens: 0.00039,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'glm-4.5': {
    id: 'glm-4.5',
    name: 'GLM 4.5',
    description: 'GLM 4.5 model',
    contextLength: 131072,
    costPer1kTokens: 0.0006,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'glm-4.6v': {
    id: 'glm-4.6v',
    name: 'GLM 4.6V',
    description: 'GLM 4.6 Vision',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'glm-4.5v': {
    id: 'glm-4.5v',
    name: 'GLM 4.5V',
    description: 'GLM 4.5 Vision',
    contextLength: 65536,
    costPer1kTokens: 0.0006,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
};

export async function getZhipuModels(options: ZhipuFetcherOptions): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://open.bigmodel.cn/api/paas/v4',
    timeout = 10000,
    cacheEnabled = true,
  } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...ZHIPU_MODELS };

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
          const existing = ZHIPU_MODELS[m.id];
          models[m.id] = {
            id: m.id,
            name: existing?.name || m.id,
            description: existing?.description || `Zhipu ${m.id}`,
            contextLength: existing?.contextLength || 8192,
            costPer1kTokens: existing?.costPer1kTokens || 0,
            capabilities: existing?.capabilities || ['chat', 'code'],
            tier: existing?.tier || 'free',
            maxOutputTokens: existing?.maxOutputTokens || 4096,
          };
        }
      }
    }
  } catch {
    console.warn('Failed to fetch Zhipu models');
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getZhipuModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || ZHIPU_MODELS[modelId];
}

export function clearZhipuCache(): void {
  cache = null;
}

export default { getZhipuModels, getZhipuModelById, clearZhipuCache };
