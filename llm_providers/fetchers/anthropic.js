import { z } from 'zod';
import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface AnthropicFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface AnthropicModelInfo {
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
  supportsExtendedThinking: boolean;
  releaseDate?: string;
}

const ANTHROPIC_MODELS_CONFIG: Record<string, Partial<AnthropicModelInfo>> = {
  'claude-3-5-haiku-20241022': {
    name: 'Claude 3.5 Haiku',
    description: 'Fast and efficient - FREE',
    contextLength: 200000,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2024-10',
  },
  'claude-haiku-4-5': {
    name: 'Claude Haiku 4.5',
    description: 'Latest Haiku - FREE',
    contextLength: 200000,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2025-01',
  },
  'claude-sonnet-4.6': {
    name: 'Claude Sonnet 4.6',
    description: 'Latest Sonnet',
    contextLength: 1000000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: false,
    releaseDate: '2025-02',
  },
  'claude-opus-4.6': {
    name: 'Claude Opus 4.6',
    description: 'Most capable model',
    contextLength: 1000000,
    costPer1kTokens: 0.005,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: true,
    releaseDate: '2025-02',
  },
  'claude-sonnet-4.5': {
    name: 'Claude Sonnet 4.5',
    description: 'Claude Sonnet 4.5',
    contextLength: 1000000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: false,
    releaseDate: '2025-01',
  },
  'claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    description: 'Claude Sonnet 4',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2024-10',
  },
  'claude-3-7-sonnet': {
    name: 'Claude 3.7 Sonnet',
    description: 'Claude 3.7 Sonnet',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: false,
    releaseDate: '2025-02',
  },
  'claude-3-5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    description: 'Claude 3.5 Sonnet',
    contextLength: 200000,
    costPer1kTokens: 0.006,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2024-10',
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    description: 'Claude 3 Haiku',
    contextLength: 200000,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2024-03',
  },
  'claude-opus-4.1': {
    name: 'Claude Opus 4.1',
    description: 'Claude Opus 4.1',
    contextLength: 200000,
    costPer1kTokens: 0.015,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2024-12',
  },
  'claude-opus-4': {
    name: 'Claude Opus 4',
    description: 'Claude Opus 4',
    contextLength: 200000,
    costPer1kTokens: 0.015,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsExtendedThinking: false,
    releaseDate: '2024-02',
  },
  'claude-3-5-sonnet-latest': {
    name: 'Claude 3.5 Sonnet Latest',
    description: 'Latest 3.5 Sonnet',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: false,
    releaseDate: '2025-04',
  },
  'claude-4-sonnet-20250514': {
    name: 'Claude 4 Sonnet',
    description: 'Claude 4 with enhanced coding',
    contextLength: 200000,
    costPer1kTokens: 0.004,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: false,
    releaseDate: '2025-05',
  },
  'claude-4-opus-20250514': {
    name: 'Claude 4 Opus',
    description: 'Most capable Claude 4',
    contextLength: 200000,
    costPer1kTokens: 0.018,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'analysis'],
    tier: 'enterprise',
    maxOutputTokens: 32768,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsExtendedThinking: true,
    releaseDate: '2025-05',
  },
};

function getModelInfo(modelId: string): AnthropicModelInfo {
  const baseInfo = ANTHROPIC_MODELS_CONFIG[modelId] || {};

  return {
    id: modelId,
    name: baseInfo.name || modelId,
    description: baseInfo.description || `Anthropic ${modelId}`,
    contextLength: baseInfo.contextLength || 200000,
    costPer1kTokens: baseInfo.costPer1kTokens || 1,
    capabilities: baseInfo.capabilities || ['chat', 'code'],
    tier: baseInfo.tier || 'premium',
    maxOutputTokens: baseInfo.maxOutputTokens || 4096,
    supportsVision: baseInfo.supportsVision || false,
    supportsFunctionCalling: baseInfo.supportsFunctionCalling || false,
    supportsExtendedThinking: baseInfo.supportsExtendedThinking || false,
    releaseDate: baseInfo.releaseDate,
  };
}

function parseAnthropicModel(modelKey: string): Model {
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

export async function getAnthropicModels(
  options: AnthropicFetcherOptions
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://api.anthropic.com/v1',
    timeout = 10000,
    cacheEnabled = true,
  } = options;

  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = {};

  for (const [modelId, config] of Object.entries(ANTHROPIC_MODELS_CONFIG)) {
    models[modelId] = {
      id: modelId,
      name: config.name || modelId,
      description: config.description || `Anthropic ${modelId}`,
      contextLength: config.contextLength || 200000,
      costPer1kTokens: config.costPer1kTokens || 1,
      capabilities: config.capabilities || ['chat', 'code'],
      tier: config.tier || 'premium',
      maxOutputTokens: config.maxOutputTokens || 4096,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'User-Agent': 'Grok-Code-CLI/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const rawData = await response.json();

      if (rawData.models && Array.isArray(rawData.models)) {
        for (const model of rawData.models) {
          const modelId = model.id;
          if (modelId && !models[modelId]) {
            const info = getModelInfo(modelId);
            models[modelId] = {
              id: modelId,
              name: info.name,
              description: info.description,
              contextLength: info.contextLength,
              costPer1kTokens: info.costPer1kTokens,
              capabilities: info.capabilities,
              tier: info.tier,
              maxOutputTokens: info.maxOutputTokens,
            };
          }
        }
      }
    }

    cache = {
      data: models,
      timestamp: now,
    };

    return models;
  } catch (error) {
    console.error('Error fetching Anthropic models:', error);

    if (cache) {
      return cache.data;
    }

    return models;
  }
}

export function getAnthropicModelById(modelId: string): Model | undefined {
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

export function getAnthropicFreeModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(ANTHROPIC_MODELS_CONFIG)) {
    if (config.tier === 'free') {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Anthropic ${modelId}`,
        contextLength: config.contextLength || 200000,
        costPer1kTokens: config.costPer1kTokens || 1,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'premium',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }
  }
  return models;
}

export function getAnthropicVisionModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(ANTHROPIC_MODELS_CONFIG)) {
    if (config.supportsVision) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Anthropic ${modelId}`,
        contextLength: config.contextLength || 200000,
        costPer1kTokens: config.costPer1kTokens || 1,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'premium',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }
  }
  return models;
}

export function getAnthropicReasoningModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(ANTHROPIC_MODELS_CONFIG)) {
    if (config.supportsExtendedThinking) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Anthropic ${modelId}`,
        contextLength: config.contextLength || 200000,
        costPer1kTokens: config.costPer1kTokens || 1,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'premium',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }
  }
  return models;
}

export function clearAnthropicCache(): void {
  cache = null;
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = ANTHROPIC_MODELS_CONFIG[modelId];
  if (!model || model.costPer1kTokens === undefined) {
    return 0;
  }
  return ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
}

export default {
  getAnthropicModels,
  getAnthropicModelById,
  getAnthropicFreeModels,
  getAnthropicVisionModels,
  getAnthropicReasoningModels,
  clearAnthropicCache,
  estimateCost,
};
