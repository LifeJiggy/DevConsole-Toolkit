import { z } from 'zod';
import type { Model } from '../../types/index.js';

const DEEPSEEK_MODEL_SCHEMA = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  owned_by: z.string(),
});

const DEEPSEEK_MODEL_RESPONSE_SCHEMA = z.object({
  object: z.string(),
  data: z.array(DEEPSEEK_MODEL_SCHEMA),
});

type DeepSeekModel = z.infer<typeof DEEPSEEK_MODEL_SCHEMA>;

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface DeepSeekFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface DeepSeekModelInfo {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  costPer1kTokens: number;
  capabilities: string[];
  tier: 'free' | 'premium' | 'enterprise';
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsReasoning: boolean;
  supportsStreaming: boolean;
  releaseDate?: string;
}

const DEEPSEEK_MODELS_CONFIG: Record<string, Partial<DeepSeekModelInfo>> = {
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    description: 'DeepSeek V3 - General purpose model',
    contextLength: 128000,
    costPer1kTokens: 0.00028,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'deepseek-reasoner': {
    name: 'DeepSeek Reasoner',
    description: 'DeepSeek R1 - Advanced reasoning model',
    contextLength: 128000,
    costPer1kTokens: 0.00028,
    capabilities: ['chat', 'reasoning', 'math'],
    tier: 'premium',
    maxOutputTokens: 128000,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'deepseek-v3.2': {
    name: 'DeepSeek V3.2',
    description: 'DeepSeek V3.2 model',
    contextLength: 163840,
    costPer1kTokens: 0.00026,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-12',
  },
  'deepseek-v3-0324': {
    name: 'DeepSeek V3 0324',
    description: 'DeepSeek V3 0324',
    contextLength: 163840,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'deepseek-v3.1': {
    name: 'DeepSeek V3.1',
    description: 'DeepSeek V3.1 model',
    contextLength: 32768,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsReasoning: false,
    supportsStreaming: true,
    releaseDate: '2025-08',
  },
  'deepseek-v3': {
    name: 'DeepSeek V3',
    description: 'DeepSeek V3 flagship',
    contextLength: 163840,
    costPer1kTokens: 0.00032,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'deepseek-v3.2-exp': {
    name: 'DeepSeek V3.2 Exp',
    description: 'DeepSeek V3.2 Experimental',
    contextLength: 163840,
    costPer1kTokens: 0.00027,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-09',
  },
  'deepseek-v3.1-terminus': {
    name: 'DeepSeek V3.1 Terminus',
    description: 'DeepSeek V3.1 Terminus',
    contextLength: 163840,
    costPer1kTokens: 0.00021,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-09',
  },
  'deepseek-r1-0528': {
    name: 'DeepSeek R1 0528',
    description: 'DeepSeek R1 0528',
    contextLength: 163840,
    costPer1kTokens: 0.00045,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-05',
  },
};

function getModelInfo(modelId: string): DeepSeekModelInfo {
  const baseInfo = DEEPSEEK_MODELS_CONFIG[modelId] || {};

  return {
    id: modelId,
    name: baseInfo.name || modelId,
    description: baseInfo.description || `DeepSeek ${modelId}`,
    contextLength: baseInfo.contextLength || 131072,
    costPer1kTokens: baseInfo.costPer1kTokens || 0.00014,
    capabilities: baseInfo.capabilities || ['chat', 'code'],
    tier: baseInfo.tier || 'free',
    maxOutputTokens: baseInfo.maxOutputTokens || 8192,
    supportsVision: baseInfo.supportsVision || false,
    supportsReasoning: baseInfo.supportsReasoning || false,
    supportsStreaming: baseInfo.supportsStreaming || true,
    releaseDate: baseInfo.releaseDate,
  };
}

function parseDeepSeekModel(model: DeepSeekModel): Model {
  const modelId = model.id;
  const info = getModelInfo(modelId);

  return {
    id: model.id,
    name: info.name,
    description: info.description,
    contextLength: info.contextLength,
    costPer1kTokens: info.costPer1kTokens,
    capabilities: info.capabilities,
    tier: info.tier,
    maxOutputTokens: info.maxOutputTokens,
  };
}

export async function getDeepSeekModels(
  options: DeepSeekFetcherOptions
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://api.deepseek.com/v1',
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
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const rawData = await response.json();
    const parseResult = DEEPSEEK_MODEL_RESPONSE_SCHEMA.safeParse(rawData);

    if (!parseResult.success) {
      console.error('DeepSeek models response validation failed:', parseResult.error.format());
    }

    if (parseResult.success) {
      for (const model of parseResult.data.data) {
        const parsedModel = parseDeepSeekModel(model);
        models[parsedModel.id] = parsedModel;
      }
    }

    for (const [modelId, config] of Object.entries(DEEPSEEK_MODELS_CONFIG)) {
      if (!models[modelId]) {
        models[modelId] = {
          id: modelId,
          name: config.name || modelId,
          description: config.description || `DeepSeek ${modelId}`,
          contextLength: config.contextLength || 131072,
          costPer1kTokens: config.costPer1kTokens || 0.00014,
          capabilities: config.capabilities || ['chat', 'code'],
          tier: config.tier || 'free',
          maxOutputTokens: config.maxOutputTokens || 8192,
        };
      }
    }

    cache = {
      data: models,
      timestamp: now,
    };

    return models;
  } catch (error) {
    console.error('Error fetching DeepSeek models:', error);

    for (const [modelId, config] of Object.entries(DEEPSEEK_MODELS_CONFIG)) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `DeepSeek ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0.00014,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }

    if (cache) {
      return cache.data;
    }

    return models;
  }
}

export function getDeepSeekModelById(modelId: string): Model | undefined {
  if (cache?.data) {
    return cache.data[modelId];
  }
  const info = getModelInfo(modelId);
  return {
    id: info.id,
    name: info.name,
    description: info.description,
    contextLength: info.contextLength,
    costPer1kTokens: info.costPer1kTokens,
    capabilities: info.capabilities,
    tier: info.tier,
    maxOutputTokens: info.maxOutputTokens,
  };
}

export function getDeepSeekFreeModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(DEEPSEEK_MODELS_CONFIG)) {
    if (config.tier === 'free') {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `DeepSeek ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0.00014,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }
  }
  return models;
}

export function getDeepSeekReasoningModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(DEEPSEEK_MODELS_CONFIG)) {
    if (config.supportsReasoning) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `DeepSeek ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0.00014,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }
  }
  return models;
}

export function clearDeepSeekCache(): void {
  cache = null;
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = DEEPSEEK_MODELS_CONFIG[modelId];
  if (!model || model.costPer1kTokens === undefined) {
    return 0;
  }
  return ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
}

export default {
  getDeepSeekModels,
  getDeepSeekModelById,
  getDeepSeekFreeModels,
  getDeepSeekReasoningModels,
  clearDeepSeekCache,
  estimateCost,
};
