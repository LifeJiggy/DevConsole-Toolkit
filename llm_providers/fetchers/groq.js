import { z } from 'zod';
import type { Model } from '../../types/index.js';

const GROQ_MODEL_SCHEMA = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  owned_by: z.string(),
});

const GROQ_MODEL_RESPONSE_SCHEMA = z.object({
  object: z.string(),
  data: z.array(GROQ_MODEL_SCHEMA),
});

type GroqModel = z.infer<typeof GROQ_MODEL_SCHEMA>;

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface GroqFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface GroqModelInfo {
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

const GROQ_MODELS_CONFIG: Record<string, Partial<GroqModelInfo>> = {
  'llama-3.2-1b-preview': {
    name: 'Llama 3.2 1B',
    description: 'Ultra-fast lightweight - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-09',
  },
  'llama-3.2-3b-preview': {
    name: 'Llama 3.2 3B',
    description: 'Fast small model - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-09',
  },
  'mixtral-8x7b-32768': {
    name: 'Mixtral 8x7B',
    description: 'Mixture of experts - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-01',
  },
  'llama-3.3-70b-versatile': {
    name: 'Llama 3.3 70B Versatile',
    description: 'Latest Llama 70B',
    contextLength: 131072,
    costPer1kTokens: 0.00059,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    releaseDate: '2024-12',
  },
  'llama-3.1-8b-instant': {
    name: 'Llama 3.1 8B Instant',
    description: 'Fast 8B model',
    contextLength: 131072,
    costPer1kTokens: 0.00005,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-07',
  },
  'deepseek-r1-distill-llama-70b': {
    name: 'DeepSeek R1 Distill Llama 70B',
    description: 'Reasoning model',
    contextLength: 131072,
    costPer1kTokens: 0.00075,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'qwen-qwq-32b': {
    name: 'QwQ 32B',
    description: 'Qwen reasoning model',
    contextLength: 131072,
    costPer1kTokens: 0.00029,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-11',
  },
  'mistral-saba-24b': {
    name: 'Mistral Saba 24B',
    description: 'Mistral special model',
    contextLength: 32768,
    costPer1kTokens: 0.00079,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-02',
  },
  'llama-3.2-11b-vision-preview': {
    name: 'Llama 3.2 11B Vision',
    description: 'Vision-capable',
    contextLength: 131072,
    costPer1kTokens: 0.00018,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2024-09',
  },
  'llama-3.3-70b-specdec': {
    name: 'Llama 3.3 70B SpecDec',
    description: 'Speculative decoding',
    contextLength: 131072,
    costPer1kTokens: 0.00069,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-01',
  },
  'llama-4-scout-17b': {
    name: 'Llama 4 Scout 17B',
    description: 'Latest Llama 4',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-11',
  },
  'meta-llama/llama-4-scout-17b-16e-instruct': {
    name: 'Llama 4 Scout 17B 16E',
    description: 'Llama 4 Scout with 16 expert',
    contextLength: 131072,
    costPer1kTokens: 0.00035,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2026-01',
  },
  'moonshotai/kimi-k2-instruct': {
    name: 'Kimi K2 Instruct',
    description: 'Moonshot AI Kimi K2 - fast inference',
    contextLength: 131072,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-07',
  },
  'moonshotai/kimi-k2-instruct-0905': {
    name: 'Kimi K2 Instruct (0905)',
    description: 'Moonshot AI Kimi K2 v0905',
    contextLength: 262144,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-08',
  },
  'qwen/qwen3-32b': {
    name: 'Qwen 3 32B',
    description: 'Qwen 3 32B model',
    contextLength: 131072,
    costPer1kTokens: 0.00029,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 40960,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-04',
  },
  'groq/compound-mini': {
    name: 'Groq Compound Mini',
    description: 'Groq compound reasoning model',
    contextLength: 131072,
    costPer1kTokens: 0.00019,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-08',
  },
  'groq/compound': {
    name: 'Groq Compound',
    description: 'Groq compound full model',
    contextLength: 131072,
    costPer1kTokens: 0.00039,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-08',
  },
  'openai/gpt-oss-20b': {
    name: 'GPT OSS 20B',
    description: 'OpenAI OSS 20B model',
    contextLength: 131072,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-06',
  },
  'openai/gpt-oss-120b': {
    name: 'GPT OSS 120B',
    description: 'OpenAI OSS 120B model',
    contextLength: 131072,
    costPer1kTokens: 0.00059,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsStreaming: true,
    releaseDate: '2025-07',
  },
};

function getModelInfo(modelId: string): GroqModelInfo {
  const baseInfo = GROQ_MODELS_CONFIG[modelId] || {};

  return {
    id: modelId,
    name: baseInfo.name || modelId,
    description: baseInfo.description || `Groq ${modelId}`,
    contextLength: baseInfo.contextLength || 32768,
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

function parseGroqModel(model: GroqModel): Model {
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

export async function getGroqModels(options: GroqFetcherOptions): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://api.groq.com/openai/v1',
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
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const rawData = await response.json();
    const parseResult = GROQ_MODEL_RESPONSE_SCHEMA.safeParse(rawData);

    if (!parseResult.success) {
      console.error('Groq models response validation failed:', parseResult.error.format());
    }

    if (parseResult.success) {
      for (const model of parseResult.data.data) {
        const parsedModel = parseGroqModel(model);
        models[parsedModel.id] = parsedModel;
      }
    }

    for (const [modelId, config] of Object.entries(GROQ_MODELS_CONFIG)) {
      if (!models[modelId]) {
        models[modelId] = {
          id: modelId,
          name: config.name || modelId,
          description: config.description || `Groq ${modelId}`,
          contextLength: config.contextLength || 32768,
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
    console.error('Error fetching Groq models:', error);

    for (const [modelId, config] of Object.entries(GROQ_MODELS_CONFIG)) {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Groq ${modelId}`,
        contextLength: config.contextLength || 32768,
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

export function getGroqModelById(modelId: string): Model | undefined {
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

export function getGroqFreeModels(): Record<string, Model> {
  const models: Record<string, Model> = {};
  for (const [modelId, config] of Object.entries(GROQ_MODELS_CONFIG)) {
    if (config.tier === 'free') {
      models[modelId] = {
        id: modelId,
        name: config.name || modelId,
        description: config.description || `Groq ${modelId}`,
        contextLength: config.contextLength || 32768,
        costPer1kTokens: config.costPer1kTokens || 0,
        capabilities: config.capabilities || ['chat', 'code'],
        tier: config.tier || 'free',
        maxOutputTokens: config.maxOutputTokens || 4096,
      };
    }
  }
  return models;
}

export function clearGroqCache(): void {
  cache = null;
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = GROQ_MODELS_CONFIG[modelId];
  if (!model || model.costPer1kTokens === undefined) {
    return 0;
  }
  return ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
}

export default {
  getGroqModels,
  getGroqModelById,
  getGroqFreeModels,
  clearGroqCache,
  estimateCost,
};
