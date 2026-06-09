import { z } from 'zod';
import type { Model } from '../../types/index.js';

const OPENAI_MODEL_SCHEMA = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  owned_by: z.string(),
  permission: z.array(z.unknown()).optional(),
  root: z.string(),
  parent: z.string().nullable().optional(),
});

const OPENAI_MODEL_RESPONSE_SCHEMA = z.object({
  object: z.string(),
  data: z.array(OPENAI_MODEL_SCHEMA),
  object_first: z.string().optional(),
});

type OpenAIModel = z.infer<typeof OPENAI_MODEL_SCHEMA>;
type OpenAIModelsResponse = z.infer<typeof OPENAI_MODEL_RESPONSE_SCHEMA>;

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface OpenAIFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface OpenAIModelInfo {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  costPer1kTokens: number;
  capabilities: string[];
  tier: 'free' | 'premium' | 'enterprise';
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  supportsStreaming: boolean;
  supportsPromptCache: boolean;
  releaseDate?: string;
  depreciationDate?: string;
  deprecationReason?: string;
}

const MODEL_CAPABILITIES: Record<string, Partial<OpenAIModelInfo>> = {
  'gpt-5-nano': {
    contextLength: 400000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 128000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'gpt-5-mini': {
    contextLength: 400000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 128000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'gpt-oss-20b': {
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-10',
  },
  'gpt-oss-120b': {
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-10',
  },
  'gpt-oss-safeguard-20b': {
    contextLength: 131072,
    costPer1kTokens: 0.000075,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-08',
  },
  'gpt-5.4-pro': {
    contextLength: 1000000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code', 'vision', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-04',
  },
  'gpt-5.4': {
    contextLength: 1000000,
    costPer1kTokens: 0.005,
    capabilities: ['chat', 'code', 'vision', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-04',
  },
  'gpt-5.3-codex-spark': {
    contextLength: 200000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gpt-5.3-codex': {
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gpt-5.2-pro': {
    contextLength: 500000,
    costPer1kTokens: 0.008,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'gpt-5.2': {
    contextLength: 500000,
    costPer1kTokens: 0.004,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'gpt-5.2-codex': {
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'gpt-5.1': {
    contextLength: 400000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'gpt-5.1-codex-max': {
    contextLength: 200000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'gpt-5.1-codex': {
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'gpt-5': {
    contextLength: 400000,
    costPer1kTokens: 0.0025,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'gpt-5-codex': {
    contextLength: 200000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'gpt-4.1': {
    contextLength: 128000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-04',
  },
  o1: {
    contextLength: 200000,
    costPer1kTokens: 0.015,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 100000,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2024-12',
  },
  'o1-mini': {
    contextLength: 128000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2024-09',
  },
  o3: {
    contextLength: 200000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 100000,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2025-03',
  },
  'o3-mini': {
    contextLength: 200000,
    costPer1kTokens: 0.005,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2025-01',
  },
  'o4-mini': {
    contextLength: 200000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2025-04',
  },
  'gpt-5-chat': {
    contextLength: 128000,
    costPer1kTokens: 0.00125,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gpt-4.1-nano': {
    contextLength: 1050000,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gpt-4o-mini-2024-07-18': {
    contextLength: 128000,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-07',
  },
  'gpt-4o': {
    contextLength: 128000,
    costPer1kTokens: 0.0025,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-05',
  },
  'gpt-5.3-chat': {
    contextLength: 128000,
    costPer1kTokens: 0.00175,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'text-embedding-3-large': {
    contextLength: 8000,
    costPer1kTokens: 0.00013,
    capabilities: ['embedding'],
    tier: 'premium',
    maxOutputTokens: 8000,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2024-01',
  },
  'gpt-5.2-chat': {
    contextLength: 128000,
    costPer1kTokens: 0.00175,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gpt-5.1-codex-mini': {
    contextLength: 400000,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gpt-4o-2024-08-06': {
    contextLength: 128000,
    costPer1kTokens: 0.0025,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-08',
  },
  'o4-mini-high': {
    contextLength: 200000,
    costPer1kTokens: 0.0011,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2025-03',
  },
  'gpt-4o-mini': {
    contextLength: 128000,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code', 'function-calling'],
    tier: 'free',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-07-18',
  },
  'gpt-4-turbo': {
    contextLength: 128000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2023-11-06',
  },
  'gpt-4': {
    contextLength: 8192,
    costPer1kTokens: 0.03,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2023-03-14',
  },
  'gpt-3.5-turbo': {
    contextLength: 16000,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2022-06',
  },
  'text-embedding-ada-002': {
    contextLength: 8000,
    costPer1kTokens: 0.0001,
    capabilities: ['embedding'],
    tier: 'premium',
    maxOutputTokens: 8000,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: false,
    releaseDate: '2023-01',
  },
};

function getModelInfo(modelId: string): OpenAIModelInfo {
  const baseInfo = MODEL_CAPABILITIES[modelId] || {};

  return {
    id: modelId,
    name: modelId,
    description: `OpenAI ${modelId} model`,
    contextLength: baseInfo.contextLength || 128000,
    costPer1kTokens: baseInfo.costPer1kTokens || 1,
    capabilities: baseInfo.capabilities || ['chat', 'code'],
    tier: baseInfo.tier || 'free',
    maxOutputTokens: baseInfo.maxOutputTokens || 8192,
    supportsVision: baseInfo.supportsVision || false,
    supportsFunctionCalling: baseInfo.supportsFunctionCalling || false,
    supportsStreaming: baseInfo.supportsStreaming || true,
    supportsPromptCache: modelId.includes('gpt-4o') || false,
    releaseDate: baseInfo.releaseDate,
    depreciationDate: baseInfo.depreciationDate,
    deprecationReason: baseInfo.deprecationReason,
  };
}

function parseOpenAIModel(model: OpenAIModel): Model {
  const modelId = model.id;
  const info = getModelInfo(modelId);

  return {
    id: model.id,
    name: model.id,
    description: info.description,
    contextLength: info.contextLength,
    costPer1kTokens: info.costPer1kTokens,
    capabilities: info.capabilities,
    tier: info.tier,
    maxOutputTokens: info.maxOutputTokens,
  };
}

function isModelSupported(modelId: string): boolean {
  return (
    modelId.startsWith('gpt-') ||
    modelId.startsWith('o1') ||
    modelId.startsWith('o3') ||
    modelId === 'text-embedding-3-small' ||
    modelId === 'text-embedding-3-large' ||
    modelId === 'text-embedding-ada-002'
  );
}

export async function getOpenAIModels(
  options: OpenAIFetcherOptions
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://api.openai.com/v1',
    timeout = 10000,
    cacheEnabled = true,
  } = options;

  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = {};

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Grok-Code-CLI/1.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const rawData = await response.json();
    const parseResult = OPENAI_MODEL_RESPONSE_SCHEMA.safeParse(rawData);

    if (!parseResult.success) {
      console.error('OpenAI models response validation failed:', parseResult.error.format());
      throw new Error('Invalid response format from OpenAI API');
    }

    const validModels = parseResult.data.data.filter((model) => isModelSupported(model.id));

    for (const model of validModels) {
      const parsedModel = parseOpenAIModel(model);
      models[parsedModel.id] = parsedModel;
    }

    const embeddingsModels = [
      {
        id: 'text-embedding-3-small',
        name: 'Embedding 3 Small',
        context: 8192,
        price: 0.02,
      },
      {
        id: 'text-embedding-3-large',
        name: 'Embedding 3 Large',
        context: 8192,
        price: 0.13,
      },
      {
        id: 'text-embedding-ada-002',
        name: 'Embedding Ada v2',
        context: 8192,
        price: 0.1,
      },
    ];

    for (const emb of embeddingsModels) {
      models[emb.id] = {
        id: emb.id,
        name: emb.name,
        description: `OpenAI ${emb.name}`,
        contextLength: emb.context,
        costPer1kTokens: emb.price,
        capabilities: ['embeddings'],
        tier: 'free',
        maxOutputTokens: 0,
      };
    }

    cache = {
      data: models,
      timestamp: now,
    };

    return models;
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);

    if (cache) {
      return cache.data;
    }

    throw error;
  }
}

export function getOpenAIModelById(modelId: string): Model | undefined {
  if (cache?.data) {
    return cache.data[modelId];
  }
  return getModelInfo(modelId);
}

export function getOpenAIFilteredModels(
  options: OpenAIFetcherOptions,
  filter?: {
    tier?: 'free' | 'premium' | 'enterprise';
    supportsVision?: boolean;
    supportsFunctionCalling?: boolean;
    minContextLength?: number;
  }
): Promise<Record<string, Model>> {
  return new Promise(async (resolve, reject) => {
    try {
      const models = await getOpenAIModels(options);
      const filtered: Record<string, Model> = {};

      for (const [id, model] of Object.entries(models)) {
        let passes = true;

        if (filter?.tier && model.tier !== filter.tier) {
          passes = false;
        }

        if (filter?.supportsVision) {
          const info = MODEL_CAPABILITIES[id];
          if (!info?.supportsVision) passes = false;
        }

        if (filter?.supportsFunctionCalling) {
          const info = MODEL_CAPABILITIES[id];
          if (!info?.supportsFunctionCalling) passes = false;
        }

        if (filter?.minContextLength && model.contextLength < filter.minContextLength) {
          passes = false;
        }

        if (passes) {
          filtered[id] = model;
        }
      }

      resolve(filtered);
    } catch (error) {
      reject(error);
    }
  });
}

export function clearOpenAICache(): void {
  cache = null;
}

export function getCacheStatus(): {
  cached: boolean;
  timestamp: number | null;
} {
  return {
    cached: cache !== null,
    timestamp: cache?.timestamp || null,
  };
}

export default {
  getOpenAIModels,
  getOpenAIModelById,
  getOpenAIFilteredModels,
  clearOpenAICache,
  getCacheStatus,
};
