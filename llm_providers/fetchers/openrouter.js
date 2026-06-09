import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface OpenRouterFetcherOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const OPENROUTER_MODELS: Record<string, Model> = {
  'stepfun/step-3.5-flash:free': {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash (Free)',
    description: 'StepFun 3.5 Flash - FREE',
    contextLength: 256000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 256000,
  },
  'moonshotai/kimi-dev-72b:free': {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'Kimi Dev 72b (Free)',
    description: 'Moonshot AI Kimi Dev - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'moonshotai/kimi-k2:free': {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2 (Free)',
    description: 'Moonshot AI Kimi K2 - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 32768,
  },
  'google/gemma-3-4b-it:free': {
    id: 'google/gemma-3-4b-it:free',
    name: 'Gemma 3 4B (Free)',
    description: 'Google Gemma 3 4B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'qwen/qwen3-4b:free': {
    id: 'qwen/qwen3-4b:free',
    name: 'Qwen 3 4B (Free)',
    description: 'Qwen 3 4B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'nvidia/nemotron-nano-9b-v2:free': {
    id: 'nvidia/nemotron-nano-9b-v2:free',
    name: 'NVIDIA Nemotron Nano 9B (Free)',
    description: 'NVIDIA reasoning model - RECOMMENDED',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'deepseek/deepseek-r1:free': {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    description: 'DeepSeek R1 - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'qwen/qwen3-32b:free': {
    id: 'qwen/qwen3-32b:free',
    name: 'Qwen3 32B (Free)',
    description: 'Qwen3 32B - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 65536,
  },
  'meta-llama/llama-3.3-70b-instruct:free': {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    description: 'Meta Llama 3.3 - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'google/gemini-2.0-flash-exp:free': {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash Exp (Free)',
    description: 'Google Gemini 2.0 Flash - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'anthropic/claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (OR)',
    description: 'Claude via OpenRouter proxy',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'anthropic/claude-opus-4.6': {
    id: 'anthropic/claude-opus-4.6',
    name: 'Claude Opus 4.6',
    description: 'Anthropic Claude Opus 4.6',
    contextLength: 1000000,
    costPer1kTokens: 0.005,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (OR)',
    description: 'GPT-4o via OpenRouter proxy',
    contextLength: 128000,
    costPer1kTokens: 0.0025,
    capabilities: ['chat', 'vision', 'code'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'google/gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google Gemini 2.5 Pro',
    contextLength: 1048576,
    costPer1kTokens: 0.00125,
    capabilities: ['chat', 'vision', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Google Gemini 2.5 Flash',
    contextLength: 1048576,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'vision', 'code', 'agentic'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'minimax/minimax-2.7': {
    id: 'minimax/minimax-2.7',
    name: 'MiniMax 2.7',
    description: 'MiniMax 2.7',
    contextLength: 256000,
    costPer1kTokens: 0.00027,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 65536,
  },
  'minimax/minimax-m2.5': {
    id: 'minimax/minimax-m2.5',
    name: 'MiniMax M2.5',
    description: 'MiniMax M2.5',
    contextLength: 196608,
    costPer1kTokens: 0.00027,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 65536,
  },
  'minimax/minimax-m2.7': {
    id: 'minimax/minimax-m2.7',
    name: 'MiniMax M2.7',
    description: 'MiniMax M2.7 - Next-gen agentic model',
    contextLength: 205000,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning', 'agentic'],
    tier: 'premium',
    maxOutputTokens: 65536,
  },
  'deepseek/deepseek-r1': {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    description: 'High-performance reasoning model',
    contextLength: 131072,
    costPer1kTokens: 0.00055,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'qwen/qwen3.5-flash': {
    id: 'qwen/qwen3.5-flash',
    name: 'Qwen3.5-Flash',
    description: 'Qwen3.5-Flash',
    contextLength: 1000000,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 262144,
  },
  // XIAOMI MIIMO MODELS
  'xiaomi/mimo-v2-flash': {
    id: 'xiaomi/mimo-v2-flash',
    name: 'MiMo V2 Flash',
    description: 'Xiaomi MiMo V2 Flash',
    contextLength: 262144,
    costPer1kTokens: 0.00001,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
  'xiaomi/mimo-v2-pro': {
    id: 'xiaomi/mimo-v2-pro',
    name: 'MiMo V2 Pro',
    description: 'Xiaomi MiMo V2 Pro',
    contextLength: 262144,
    costPer1kTokens: 0.000015,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
  'xiaomi/mimo-v2-omni': {
    id: 'xiaomi/mimo-v2-omni',
    name: 'MiMo V2 Omni',
    description: 'Xiaomi MiMo V2 Omni',
    contextLength: 262144,
    costPer1kTokens: 0.00002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
};

function parsePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  return Number.parseFloat(priceStr) * 1000000;
}

export async function getOpenRouterModels(
  options: OpenRouterFetcherOptions = {}
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://openrouter.ai/api/v1',
    timeout = 10000,
    cacheEnabled = true,
  } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...OPENROUTER_MODELS };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Grok-Code-CLI/1.0',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        for (const m of data.data) {
          const inputPrice = parsePrice(m.pricing?.prompt);
          const outputPrice = parsePrice(m.pricing?.completion);
          models[m.id] = {
            id: m.id,
            name: m.name,
            description: m.description || `OpenRouter ${m.id}`,
            contextLength: m.context_length || 8192,
            costPer1kTokens: inputPrice + outputPrice,
            capabilities: [
              ...(m.architecture?.input_modalities?.includes('image') ? ['vision'] : []),
              'chat',
              'code',
            ],
            tier: inputPrice + outputPrice > 1 ? 'premium' : 'free',
            maxOutputTokens: m.max_completion_tokens || 4096,
          };
        }
      }
    }
  } catch {
    console.warn('Failed to fetch OpenRouter models from API');
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getOpenRouterModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || OPENROUTER_MODELS[modelId];
}

export function getOpenRouterFreeModels(): Record<string, Model> {
  const free: Record<string, Model> = {};
  for (const [id, model] of Object.entries(OPENROUTER_MODELS)) {
    if (model.tier === 'free') {
      free[id] = model;
    }
  }
  return free;
}

export function parseOpenRouterModel(modelData: any): Model {
  return (
    getOpenRouterModelById(modelData.id) || {
      id: modelData.id,
      name: modelData.name,
      description: modelData.description || `OpenRouter ${modelData.id}`,
      contextLength: modelData.context_length || 8192,
      costPer1kTokens: 0,
      capabilities: ['chat'],
      tier: 'free',
      maxOutputTokens: 4096,
    }
  );
}

export function clearOpenRouterCache(): void {
  cache = null;
}

export default {
  getOpenRouterModels,
  getOpenRouterModelById,
  getOpenRouterFreeModels,
  parseOpenRouterModel,
  clearOpenRouterCache,
};
