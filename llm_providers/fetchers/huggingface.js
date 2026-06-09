import { z } from 'zod';
import type { Model } from '../../types/index.js';

const HF_PROVIDER_SCHEMA = z.object({
  provider: z.string(),
  status: z.enum(['live', 'staging', 'error']),
  supports_tools: z.boolean().optional(),
  supports_structured_output: z.boolean().optional(),
  context_length: z.number().optional(),
  pricing: z.object({ input: z.number(), output: z.number() }).optional(),
});

const HF_MODEL_SCHEMA = z.object({
  id: z.string(),
  object: z.literal('model'),
  created: z.number(),
  owned_by: z.string(),
  providers: z.array(HF_PROVIDER_SCHEMA),
});

const HF_RESPONSE_SCHEMA = z.object({
  object: z.string(),
  data: z.array(HF_MODEL_SCHEMA),
});

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface HuggingFaceFetcherOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const HF_MODELS: Record<string, Partial<Model>> = {
  'moonshotai/Kimi-K2.5': {
    id: 'moonshotai/Kimi-K2.5',
    name: 'Kimi K2.5',
    description: 'moonshotai/Kimi-K2.5 via HuggingFace',
    contextLength: 262144,
    costPer1kTokens: 0.0006,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'zai-org/GLM-4.7-Flash': {
    id: 'zai-org/GLM-4.7-Flash',
    name: 'GLM 4.7 Flash',
    description: 'zai-org/GLM-4.7-Flash via HuggingFace',
    contextLength: 200000,
    costPer1kTokens: 0.00007,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'MiniMaxAI/MiniMax-M2.1': {
    id: 'MiniMaxAI/MiniMax-M2.1',
    name: 'MiniMax M2.1',
    description: 'MiniMaxAI/MiniMax-M2.1 via HuggingFace',
    contextLength: 204800,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'google/gemma-3-27b-it': {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma 3 27B',
    description: 'google/gemma-3-27b-it via HuggingFace',
    contextLength: 128000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 2048,
  },
  'meta-llama/Llama-3.3-70B-Instruct': {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B Instruct',
    description: 'meta-llama/Llama-3.3-70B-Instruct via HuggingFace',
    contextLength: 131072,
    costPer1kTokens: 0.00059,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'Qwen/Qwen2.5-72B-Instruct': {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen2.5 72B Instruct',
    description: 'Qwen/Qwen2.5-72B-Instruct via HuggingFace',
    contextLength: 32000,
    costPer1kTokens: 0.00038,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'deepseek-ai/DeepSeek-V3': {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3 (Free)',
    description: 'DeepSeek V3 - FREE via HuggingFace Router',
    contextLength: 64000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'deepseek-ai/DeepSeek-R1': {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    description: 'DeepSeek R1 reasoning model',
    contextLength: 64000,
    costPer1kTokens: 0.0007,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'Qwen/Qwen3-32B': {
    id: 'Qwen/Qwen3-32B',
    name: 'Qwen3 32B',
    description: 'Qwen/Qwen3-32B via HuggingFace',
    contextLength: 131072,
    costPer1kTokens: 0.00029,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'Qwen/Qwen3-VL-32B-Instruct': {
    id: 'Qwen/Qwen3-VL-32B-Instruct',
    name: 'Qwen3 VL 32B Instruct',
    description: 'Qwen/Qwen3-VL-32B-Instruct via HuggingFace',
    contextLength: 131072,
    costPer1kTokens: 0.000104,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'Qwen/Qwen2.5-VL-7B-Instruct': {
    id: 'Qwen/Qwen2.5-VL-7B-Instruct',
    name: 'Qwen2.5 VL 7B Instruct',
    description: 'Qwen/Qwen2.5-VL-7B-Instruct via HuggingFace',
    contextLength: 32768,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'Qwen/Qwen3-Max': {
    id: 'Qwen/Qwen3-Max',
    name: 'Qwen3 Max',
    description: 'Qwen3 flagship model',
    contextLength: 262144,
    costPer1kTokens: 0.0012,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 65536,
  },
  'Qwen/Qwen3-Coder-Plus': {
    id: 'Qwen/Qwen3-Coder-Plus',
    name: 'Qwen3 Coder Plus',
    description: 'Qwen3 Coder Plus',
    contextLength: 1000000,
    costPer1kTokens: 0.00065,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
  'Qwen/Qwen2.5-Coder-32B-Instruct': {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    name: 'Qwen2.5 Coder 32B Instruct',
    description: 'Qwen/Qwen2.5-Coder-32B-Instruct via HuggingFace',
    contextLength: 32768,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 2048,
  },
  'deepseek-ai/DeepSeek-V3-Free': {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3 (Free)',
    description: 'DeepSeek V3 - FREE via HuggingFace Router',
    contextLength: 64000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'Qwen/Qwen2.5-72B-Instruct-Free': {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen2.5 72B (Free)',
    description: 'Qwen2.5 72B - FREE via HuggingFace Router',
    contextLength: 32000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'meta-llama/Llama-3.3-70B-Instruct-Free': {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B (Free)',
    description: 'Llama 3.3 70B - FREE via HuggingFace Router',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'microsoft/Phi-4': {
    id: 'microsoft/Phi-4',
    name: 'Phi-4',
    description: 'Microsoft Phi-4 via HuggingFace',
    contextLength: 16000,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'mistralai/Mistral-Nemo-Instruct-2407': {
    id: 'mistralai/Mistral-Nemo-Instruct-2407',
    name: 'Mistral Nemo Instruct',
    description: 'Mistral Nemo via HuggingFace',
    contextLength: 128000,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
};

export async function getHuggingFaceModels(
  options: HuggingFaceFetcherOptions = {}
): Promise<Record<string, Model>> {
  const { cacheEnabled = true } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...HF_MODELS } as Record<string, Model>;

  try {
    const response = await fetch('https://huggingface.co/api/models', {
      headers: { 'User-Agent': 'Grok-Code-CLI/1.0' },
    });

    if (response.ok) {
      cache = { data: models, timestamp: now };
    }
  } catch (error) {
    console.error('Error fetching HuggingFace models:', error);
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getCachedHuggingFaceModels(): Record<string, Model> | null {
  return cache?.data || null;
}

export function getCachedRawHuggingFaceModels(): any[] | null {
  return null;
}

export function clearHuggingFaceCache(): void {
  cache = null;
}

export async function getHuggingFaceModelsWithMetadata() {
  const models = await getHuggingFaceModels();
  return {
    models: Object.values(models),
    cached: cache !== null,
    timestamp: Date.now(),
  };
}

export default {
  getHuggingFaceModels,
  getCachedHuggingFaceModels,
  getCachedRawHuggingFaceModels,
  clearHuggingFaceCache,
  getHuggingFaceModelsWithMetadata,
};
