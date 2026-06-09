import { z } from 'zod';
import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface GoogleFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface GoogleModelInfo {
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
  releaseDate?: string;
}

const GOOGLE_MODELS_CONFIG: Record<string, Partial<GoogleModelInfo>> = {
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash Experimental',
    description: 'Latest experimental Flash - FREE',
    contextLength: 1000000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemini-3-flash': {
    name: 'Gemini 3 Flash',
    description: 'Gemini 3 Flash - FREE',
    contextLength: 1000000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemini-3-pro': {
    name: 'Gemini 3 Pro',
    description: 'Gemini 3 Pro - FREE',
    contextLength: 1000000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'vision', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemini-3.1-pro': {
    name: 'Gemini 3.1 Pro',
    description: 'Gemini 3.1 Pro - FREE',
    contextLength: 1000000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'vision', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'gemma-3-4b-it': {
    name: 'Gemma 3 4B',
    description: 'Gemma 3 4B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemma-3-12b-it': {
    name: 'Gemma 3 12B',
    description: 'Gemma 3 12B - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemma-3-27b-it': {
    name: 'Gemma 3 27B',
    description: 'Gemma 3 27B - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemma-3n-e2b-it': {
    name: 'Gemma 3N E2B',
    description: 'Gemma 3N E2B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemma-3n-e4b-it': {
    name: 'Gemma 3N E4B',
    description: 'Gemma 3N E4B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-03',
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    description: 'Latest Gemini Pro',
    contextLength: 1000000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'vision', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    description: 'Multimodal with 2M context',
    contextLength: 2097152,
    costPer1kTokens: 0.00125,
    capabilities: ['chat', 'vision', 'code', 'audio', 'video'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-02',
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient',
    contextLength: 1048576,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-05',
  },
  'gemma-2-2b-it': {
    name: 'Gemma 2 2B',
    description: 'Gemma 2 2B',
    contextLength: 8192,
    costPer1kTokens: 0.0001,
    capabilities: ['chat'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-06',
  },
};

function getModelInfo(modelId: string): GoogleModelInfo {
  const baseInfo = GOOGLE_MODELS_CONFIG[modelId] || {};

  return {
    id: modelId,
    name: baseInfo.name || modelId,
    description: baseInfo.description || `Google ${modelId}`,
    contextLength: baseInfo.contextLength || 128000,
    costPer1kTokens: baseInfo.costPer1kTokens || 0,
    capabilities: baseInfo.capabilities || ['chat', 'code'],
    tier: baseInfo.tier || 'free',
    maxOutputTokens: baseInfo.maxOutputTokens || 4096,
    supportsVision: baseInfo.supportsVision || false,
    supportsFunctionCalling: baseInfo.supportsFunctionCalling || false,
    supportsStreaming: baseInfo.supportsStreaming || true,
    releaseDate: baseInfo.releaseDate,
  };
}

function parseGoogleModel(modelKey: string): Model {
  const info = getModelInfo(modelKey);

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

export async function getGoogleModels(
  options: GoogleFetcherOptions
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
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

    const response = await fetch(`${baseUrl}/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Grok-Code-CLI/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const rawData = await response.json();

    if (rawData.models && Array.isArray(rawData.models)) {
      for (const model of rawData.models) {
        const modelName = model.name?.replace('models/', '');
        if (modelName) {
          const info = getModelInfo(modelName);
          models[modelName] = {
            id: modelName,
            name: info.name,
            description: info.description,
            contextLength: model.contextWindow || info.contextLength,
            costPer1kTokens: info.costPer1kTokens,
            capabilities: info.capabilities,
            tier: info.tier,
            maxOutputTokens: info.maxOutputTokens,
          };
        }
      }
    }

    for (const [modelId, config] of Object.entries(GOOGLE_MODELS_CONFIG)) {
      if (!models[modelId]) {
        models[modelId] = {
          id: modelId,
          name: config.name || modelId,
          description: config.description || `Google ${modelId}`,
          contextLength: config.contextLength || 128000,
          costPer1kTokens: config.costPer1kTokens || 0,
          capabilities: config.capabilities || ['chat', 'code'],
          tier: config.tier || 'free',
          maxOutputTokens: config.maxOutputTokens || 4096,
        };
      }
    }

    cache = {
      data: models,
      timestamp: now,
    };

    return models;
  } catch (error) {
    console.error('Error fetching Google models:', error);

    for (const [modelId, config] of Object.entries(GOOGLE_MODELS_CONFIG)) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Google ${modelId}`,
        contextLength: config.contextLength || 128000,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }

    if (cache) {
      return cache.data;
    }

    return models;
  }
}

export function getGoogleModelById(modelId: string): Model | undefined {
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

export function getGoogleFreeModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(GOOGLE_MODELS_CONFIG)) {
    if (config.tier === 'free') {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Google ${modelId}`,
        contextLength: config.contextLength || 128000,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }
  }
  return models;
}

export function getGoogleVisionModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(GOOGLE_MODELS_CONFIG)) {
    if (config.supportsVision) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Google ${modelId}`,
        contextLength: config.contextLength || 128000,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }
  }
  return models;
}

export function clearGoogleCache(): void {
  cache = null;
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = GOOGLE_MODELS_CONFIG[modelId];
  if (!model || model.costPer1kTokens === undefined) {
    return 0;
  }
  return ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
}

export default {
  getGoogleModels,
  getGoogleModelById,
  getGoogleFreeModels,
  getGoogleVisionModels,
  clearGoogleCache,
  estimateCost,
};
