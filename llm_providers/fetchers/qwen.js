import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface QwenFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const QWEN_MODELS: Record<string, Model> = {
  'qwen-turbo': {
    id: 'qwen-turbo',
    name: 'Qwen Turbo',
    description: 'Free tier - fast and efficient',
    contextLength: 16384,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'qwen-plus': {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    description: 'Balanced performance',
    contextLength: 32768,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'qwen2.5-turbo': {
    id: 'qwen2.5-turbo',
    name: 'Qwen 2.5 Turbo',
    description: 'Enhanced Qwen 2.5 fast model',
    contextLength: 131072,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'qwen2.5-plus': {
    id: 'qwen2.5-plus',
    name: 'Qwen 2.5 Plus',
    description: 'Qwen 2.5 with balanced performance',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'qwen2.5-max': {
    id: 'qwen2.5-max',
    name: 'Qwen 2.5 Max',
    description: 'Qwen 2.5 flagship model',
    contextLength: 131072,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'qwen2.5-coder-turbo': {
    id: 'qwen2.5-coder-turbo',
    name: 'Qwen 2.5 Coder Turbo',
    description: 'Code-specialized model',
    contextLength: 32768,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'qwen2.5-coder-32b': {
    id: 'qwen2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Code-specialized 32B model',
    contextLength: 32768,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'qwen3-8b': {
    id: 'qwen3-8b',
    name: 'Qwen 3 8B',
    description: 'Qwen 3 base model',
    contextLength: 131072,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'qwen3-32b': {
    id: 'qwen3-32b',
    name: 'Qwen 3 32B',
    description: 'Qwen 3 balanced model',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'qwen3-235b': {
    id: 'qwen3-235b',
    name: 'Qwen 3 235B',
    description: 'Qwen 3 large model',
    contextLength: 131072,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning', 'analysis'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'qwen3-plus': {
    id: 'qwen3-plus',
    name: 'Qwen 3 Plus',
    description: 'Qwen 3 enhanced version',
    contextLength: 131072,
    costPer1kTokens: 0.0006,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'qwen3-max': {
    id: 'qwen3-max',
    name: 'Qwen 3 Max',
    description: 'Qwen 3 flagship model',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning', 'analysis', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'qwen4-tiny': {
    id: 'qwen4-tiny',
    name: 'Qwen 4 Tiny',
    description: 'Qwen 4 fast and efficient',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'qwen4-mini': {
    id: 'qwen4-mini',
    name: 'Qwen 4 Mini',
    description: 'Qwen 4 compact model',
    contextLength: 131072,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  qwen4: {
    id: 'qwen4',
    name: 'Qwen 4',
    description: 'Qwen 4 standard model',
    contextLength: 200000,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'qwen4-plus': {
    id: 'qwen4-plus',
    name: 'Qwen 4 Plus',
    description: 'Qwen 4 enhanced version',
    contextLength: 200000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'qwen4-max': {
    id: 'qwen4-max',
    name: 'Qwen 4 Max',
    description: 'Qwen 4 flagship model',
    contextLength: 256000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'analysis'],
    tier: 'enterprise',
    maxOutputTokens: 65536,
  },
  'qwen-max-longcontext': {
    id: 'qwen-max-longcontext',
    name: 'Qwen Max Long',
    description: 'Large context model',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'long-context'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    description: 'QwQ 32B reasoning',
    contextLength: 32768,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'qwen2.5-vl-32b': {
    id: 'qwen2.5-vl-32b',
    name: 'Qwen2.5 VL 32B Instruct',
    description: 'Qwen2.5 Vision Language 32B',
    contextLength: 128000,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'qwen2.5-vl-7b': {
    id: 'qwen2.5-vl-7b',
    name: 'Qwen2.5-VL 7B Instruct',
    description: 'Qwen2.5 Vision 7B',
    contextLength: 32768,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'qwen-vl-max': {
    id: 'qwen-vl-max',
    name: 'Qwen VL Max',
    description: 'Qwen Vision Language Max',
    contextLength: 131072,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'qwen-max': {
    id: 'qwen-max',
    name: 'Qwen-Max',
    description: 'Qwen Max model',
    contextLength: 32768,
    costPer1kTokens: 0.00104,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
};

export async function getQwenModels(options: QwenFetcherOptions): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    timeout = 10000,
    cacheEnabled = true,
  } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...QWEN_MODELS };

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
          const existing = QWEN_MODELS[m.id];
          models[m.id] = {
            id: m.id,
            name: existing?.name || m.id,
            description: existing?.description || `Qwen ${m.id}`,
            contextLength: existing?.contextLength || 8192,
            costPer1kTokens: existing?.costPer1kTokens || 0,
            capabilities: existing?.capabilities || ['chat', 'code'],
            tier: existing?.tier || 'premium',
            maxOutputTokens: existing?.maxOutputTokens || 4096,
          };
        }
      }
    }
  } catch {
    console.warn('Failed to fetch Qwen models');
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getQwenModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || QWEN_MODELS[modelId];
}

export function clearQwenCache(): void {
  cache = null;
}

export default { getQwenModels, getQwenModelById, clearQwenCache };
