import { z } from 'zod';
import type { Model } from '../../types/index.js';

const XAI_MODEL_SCHEMA = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  owned_by: z.string(),
});

const XAI_MODEL_RESPONSE_SCHEMA = z.object({
  object: z.string(),
  data: z.array(XAI_MODEL_SCHEMA),
});

type XAIModel = z.infer<typeof XAI_MODEL_SCHEMA>;

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface XAIFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface XAIModelInfo {
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

const XAI_MODELS_CONFIG: Record<string, Partial<XAIModelInfo>> = {
  'grok-2-1212': {
    name: 'Grok 2',
    description: 'Free tier - great for general use',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'grok-3': {
    name: 'Grok 3',
    description: 'Latest Grok flagship',
    contextLength: 131072,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'grok-3-mini': {
    name: 'Grok 3 Mini',
    description: 'Fast Grok model',
    contextLength: 131072,
    costPer1kTokens: 0.005,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'grok-2-vision-1212': {
    name: 'Grok 2 Vision',
    description: 'Vision capable',
    contextLength: 32768,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsReasoning: false,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'grok-2': {
    name: 'Grok 2 Latest',
    description: 'Grok 2 latest',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2024-08',
  },
  'grok-4.1-fast': {
    name: 'Grok 4.1 Fast',
    description: 'Grok 4.1 Fast model',
    contextLength: 2000000,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-11',
  },
  'grok-4-fast': {
    name: 'Grok 4 Fast',
    description: 'Grok 4 Fast model',
    contextLength: 2000000,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-09',
  },
  'grok-code-fast-1': {
    name: 'Grok Code Fast 1',
    description: 'Grok Code Fast 1',
    contextLength: 256000,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsReasoning: false,
    supportsStreaming: true,
    releaseDate: '2025-08',
  },
  'grok-4': {
    name: 'Grok 4',
    description: 'Grok 4 flagship model',
    contextLength: 256000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-07',
  },
  'grok-3-mini-20250610': {
    name: 'Grok 3 Mini',
    description: 'Grok 3 Mini model',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-06',
  },
  'grok-4.20-multi-agent-beta': {
    name: 'Grok 4.20 Multi-Agent Beta',
    description: 'Grok 4.20 Multi-Agent Beta',
    contextLength: 2000000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2026-03',
  },
  'grok-3-beta': {
    name: 'Grok 3 Beta',
    description: 'Grok 3 Beta',
    contextLength: 131072,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-04',
  },
  'grok-4.20-beta': {
    name: 'Grok 4.20 Beta',
    description: 'Grok 4.20 Beta',
    contextLength: 2000000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2026-03',
  },
  'grok-3-mini-beta': {
    name: 'Grok 3 Mini Beta',
    description: 'Grok 3 Mini Beta',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsReasoning: true,
    supportsStreaming: true,
    releaseDate: '2025-04',
  },
};

function getModelInfo(modelId: string): XAIModelInfo {
  const baseInfo = XAI_MODELS_CONFIG[modelId] || {};

  return {
    id: modelId,
    name: baseInfo.name || modelId,
    description: baseInfo.description || `xAI ${modelId} model`,
    contextLength: baseInfo.contextLength || 131072,
    costPer1kTokens: baseInfo.costPer1kTokens || 0,
    capabilities: baseInfo.capabilities || ['chat', 'code'],
    tier: baseInfo.tier || 'free',
    maxOutputTokens: baseInfo.maxOutputTokens || 8192,
    supportsVision: baseInfo.supportsVision || false,
    supportsReasoning: baseInfo.supportsReasoning || false,
    supportsStreaming: baseInfo.supportsStreaming || true,
    releaseDate: baseInfo.releaseDate,
  };
}

function parseXAIModel(model: XAIModel): Model {
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

export async function getXaiModels(options: XAIFetcherOptions): Promise<Record<string, Model>> {
  const { apiKey, baseUrl = 'https://api.x.ai/v1', timeout = 10000, cacheEnabled = true } = options;

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
      throw new Error(`xAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const rawData = await response.json();
    const parseResult = XAI_MODEL_RESPONSE_SCHEMA.safeParse(rawData);

    if (!parseResult.success) {
      console.error('xAI models response validation failed:', parseResult.error.format());
      throw new Error('Invalid response format from xAI API');
    }

    for (const model of parseResult.data.data) {
      const parsedModel = parseXAIModel(model);
      models[parsedModel.id] = parsedModel;
    }

    for (const [modelId, config] of Object.entries(XAI_MODELS_CONFIG)) {
      if (!models[modelId]) {
        models[modelId] = {
          id: modelId,
          name: config.name || modelId,
          description: config.description || `xAI ${modelId}`,
          contextLength: config.contextLength || 131072,
          costPer1kTokens: config.costPer1kTokens || 0,
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
    console.error('Error fetching xAI models:', error);

    if (cache) {
      return cache.data;
    }

    for (const [modelId, config] of Object.entries(XAI_MODELS_CONFIG)) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `xAI ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }

    return models;
  }
}

export function getXaiModelById(modelId: string): Model | undefined {
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

export function getXaiFreeModels(): Record<string, Model> {
  const models: Record<string, Model> = {};

  for (const [modelId, config] of Object.entries(XAI_MODELS_CONFIG)) {
    if (config.tier === 'free') {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `xAI ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }
  }

  return models;
}

export function getXaiPremiumModels(): Record<string, Model> {
  const models: Record<string, Model> = {};

  for (const [modelId, config] of Object.entries(XAI_MODELS_CONFIG)) {
    if (config.tier === 'premium' || config.tier === 'enterprise') {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `xAI ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'premium',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }
  }

  return models;
}

export function getXaiVisionModels(): Record<string, Model> {
  const models: Record<string, Model> = {};

  for (const [modelId, config] of Object.entries(XAI_MODELS_CONFIG)) {
    if (config.supportsVision) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `xAI ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }
  }

  return models;
}

export function getXaiReasoningModels(): Record<string, Model> {
  const models: Record<string, Model> = {};

  for (const [modelId, config] of Object.entries(XAI_MODELS_CONFIG)) {
    if (config.supportsReasoning) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `xAI ${modelId}`,
        contextLength: config.contextLength || 131072,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
    }
  }

  return models;
}

export function clearXaiCache(): void {
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

export function getModelCapabilities(modelId: string): string[] {
  return XAI_MODELS_CONFIG[modelId]?.capabilities || ['chat', 'code'];
}

export function isModelAvailable(modelId: string): boolean {
  return modelId in XAI_MODELS_CONFIG;
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = XAI_MODELS_CONFIG[modelId];
  if (!model || model.costPer1kTokens === undefined || model.costPer1kTokens === 0) {
    return 0;
  }
  return ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
}

export default {
  getXaiModels,
  getXaiModelById,
  getXaiFreeModels,
  getXaiPremiumModels,
  getXaiVisionModels,
  getXaiReasoningModels,
  clearXaiCache,
  getCacheStatus,
  getModelCapabilities,
  isModelAvailable,
  estimateCost,
};
