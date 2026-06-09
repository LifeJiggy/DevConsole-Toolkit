import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface NvidiaFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const NVIDIA_MODELS: Record<string, Model> = {
  'moonshotai/kimi-k2.5': {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    description: 'Moonshot Kimi K2.5 - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'vision'],
    tier: 'free',
    maxOutputTokens: 65536,
  },
  'moonshotai/kimi-k2-instruct-0905': {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2 0905',
    description: 'Moonshot Kimi K2 - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'moonshotai/kimi-k2-thinking': {
    id: 'moonshotai/kimi-k2-thinking',
    name: 'Kimi K2 Thinking',
    description: 'Moonshot Kimi K2 Thinking - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 65536,
  },
  'moonshotai/kimi-k2.5-thinking': {
    id: 'moonshotai/kimi-k2.5-thinking',
    name: 'Kimi K2.5 Thinking',
    description: 'Moonshot Kimi K2.5 Thinking - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'vision'],
    tier: 'free',
    maxOutputTokens: 65536,
  },
  'moonshotai/kimi-k2-instruct': {
    id: 'moonshotai/kimi-k2-instruct',
    name: 'Kimi K2 Instruct',
    description: 'Moonshot Kimi K2 - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'nvidia/nvidia-nemotron-nano-9b-v2': {
    id: 'nvidia/nvidia-nemotron-nano-9b-v2',
    name: 'Nemotron Nano 9B',
    description: 'NVIDIA Nemotron Nano 9B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'google/gemma-3n-e2b-it': {
    id: 'google/gemma-3n-e2b-it',
    name: 'Gemma 3N E2B',
    description: 'Google Gemma 3N E2B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'google/gemma-3-12b-it': {
    id: 'google/gemma-3-12b-it',
    name: 'Gemma 3 12B',
    description: 'Google Gemma 3 12B - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'google/gemma-3-1b-it': {
    id: 'google/gemma-3-1b-it',
    name: 'Gemma 3 1B',
    description: 'Google Gemma 3 1B - FREE',
    contextLength: 32768,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'google/gemma-2-2b-it': {
    id: 'google/gemma-2-2b-it',
    name: 'Gemma 2 2B',
    description: 'Google Gemma 2 2B - FREE',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'google/gemma-2-27b-it': {
    id: 'google/gemma-2-27b-it',
    name: 'Gemma 2 27B',
    description: 'Google Gemma 2 27B - FREE',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'google/gemma-3-27b-it': {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma 3 27B',
    description: 'Google Gemma 3 27B - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'microsoft/phi-4-mini-instruct': {
    id: 'microsoft/phi-4-mini-instruct',
    name: 'Phi-4 Mini',
    description: 'Microsoft Phi-4 Mini - FREE',
    contextLength: 16384,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'microsoft/phi-3-medium-128k-instruct': {
    id: 'microsoft/phi-3-medium-128k-instruct',
    name: 'Phi-3 Medium',
    description: 'Microsoft Phi-3 Medium - FREE',
    contextLength: 128000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'microsoft/phi-3-small-128k-instruct': {
    id: 'microsoft/phi-3-small-128k-instruct',
    name: 'Phi-3 Small',
    description: 'Microsoft Phi-3 Small - FREE',
    contextLength: 128000,
    costPer1kTokens: 0,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'minimaxai/minimax-m2.1': {
    id: 'minimaxai/minimax-m2.1',
    name: 'MiniMax M2.1',
    description: 'MiniMax M2.1 - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'nvidia/nemotron-4-340b-instruct': {
    id: 'nvidia/nemotron-4-340b-instruct',
    name: 'Nemotron 4 340B',
    description: 'NVIDIA Nemotron 4 340B - PREMIUM',
    contextLength: 131072,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'nvidia/llama-3.1-nemotron-70b-instruct': {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron 70B',
    description: 'NVIDIA Nemotron 70B - PREMIUM',
    contextLength: 131072,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'nvidia/llama-3.1-nemotron-51b-instruct': {
    id: 'nvidia/llama-3.1-nemotron-51b-instruct',
    name: 'Nemotron 51B',
    description: 'NVIDIA Nemotron 51B - PREMIUM',
    contextLength: 131072,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'meta/llama-3.3-70b-instruct': {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    description: 'Meta Llama 3.3 70B - PREMIUM',
    contextLength: 131072,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'meta/llama-4-scout-17b-16e-instruct': {
    id: 'meta/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout',
    description: 'Meta Llama 4 Scout - PREMIUM',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'nvidia/nemotron-3-super-4b': {
    id: 'nvidia/nemotron-3-super-4b',
    name: 'Nemotron 3 Super',
    description: 'NVIDIA Nemotron 3 Super - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'nvidia/nemotron-3-nano-30b-a3b': {
    id: 'nvidia/nemotron-3-nano-30b-a3b',
    name: 'Nemotron 3 Nano 30B A3B',
    description: 'NVIDIA Nemotron 3 Nano 30B A3B - FREE',
    contextLength: 256000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'nvidia/nemotron-nano-12b-2-vl': {
    id: 'nvidia/nemotron-nano-12b-2-vl',
    name: 'Nemotron Nano 12B 2 VL',
    description: 'NVIDIA Nemotron Nano 12B 2 VL - FREE',
    contextLength: 128000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'reasoning', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  // NEW MODELS FROM API
  'stepfun-ai/step-3.5-flash': {
    id: 'stepfun-ai/step-3.5-flash',
    name: 'StepFun 3.5 Flash',
    description: 'StepFun 3.5 Flash - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'deepseek-ai/deepseek-r1-distill-qwen-7b': {
    id: 'deepseek-ai/deepseek-r1-distill-qwen-7b',
    name: 'DeepSeek R1 Distill Qwen 7B',
    description: 'DeepSeek R1 Qwen 7B',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'deepseek-ai/deepseek-r1-distill-qwen-14b': {
    id: 'deepseek-ai/deepseek-r1-distill-qwen-14b',
    name: 'DeepSeek R1 Distill Qwen 14B',
    description: 'DeepSeek R1 Qwen 14B',
    contextLength: 131072,
    costPer1kTokens: 0.00015,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'deepseek-ai/deepseek-r1-distill-qwen-32b': {
    id: 'deepseek-ai/deepseek-r1-distill-qwen-32b',
    name: 'DeepSeek R1 Distill Qwen 32B',
    description: 'DeepSeek R1 Qwen 32B',
    contextLength: 131072,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'deepseek-ai/deepseek-r1-distill-llama-8b': {
    id: 'deepseek-ai/deepseek-r1-distill-llama-8b',
    name: 'DeepSeek R1 Distill Llama 8B',
    description: 'DeepSeek R1 Llama 8B',
    contextLength: 131072,
    costPer1kTokens: 0.00008,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'mistralai/mistral-large-3-675b-instruct-2512': {
    id: 'mistralai/mistral-large-3-675b-instruct-2512',
    name: 'Mistral Large 3 675B',
    description: 'Mistral Large 3 675B',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistralai/devstral-2-123b-instruct-2512': {
    id: 'mistralai/devstral-2-123b-instruct-2512',
    name: 'Devstral 2 123B',
    description: 'Mistral Devstral 2',
    contextLength: 131072,
    costPer1kTokens: 0.0015,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistralai/mistral-small-24b-instruct-2503': {
    id: 'mistralai/mistral-small-24b-instruct-2503',
    name: 'Mistral Small 24B',
    description: 'Mistral Small 24B',
    contextLength: 131072,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'mistralai/mathstral-7b-v0.1': {
    id: 'mistralai/mathstral-7b-v0.1',
    name: 'Mathstral 7B',
    description: 'Mistral Mathstral',
    contextLength: 131072,
    costPer1kTokens: 0.00005,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'qwen/qwen3-next-80b-a3b-thinking': {
    id: 'qwen/qwen3-next-80b-a3b-thinking',
    name: 'Qwen3 Next 80B Thinking',
    description: 'Qwen3 Next 80B with thinking',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'microsoft/phi-4-mini-flash-reasoning': {
    id: 'microsoft/phi-4-mini-flash-reasoning',
    name: 'Phi-4 Mini Flash Reasoning',
    description: 'Microsoft Phi-4 Mini Flash',
    contextLength: 16384,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  // NEMOTRON SERIES - NEW
  'nvidia/nemotron-3-super-120b-a12b': {
    id: 'nvidia/nemotron-3-super-120b-a12b',
    name: 'Nemotron-3 Super 120B',
    description: 'NVIDIA Nemotron-3 Super 120B - Hybrid MoE',
    contextLength: 131072,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning', 'agentic'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'nvidia/llama-3.1-nemotron-ultra-253b-v1': {
    id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    name: 'Nemotron Ultra 253B',
    description: 'NVIDIA Nemotron Ultra 253B - Large reasoning engine',
    contextLength: 131072,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'reasoning', 'multi-agent'],
    tier: 'enterprise',
    maxOutputTokens: 16384,
  },
  'nvidia/riva-translate-4b-instruct': {
    id: 'nvidia/riva-translate-4b-instruct',
    name: 'Riva Translate 4B',
    description: 'NVIDIA Riva Translation - Real-time speech translation',
    contextLength: 4096,
    costPer1kTokens: 0.0001,
    capabilities: ['translation'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'nvidia/streampetr': {
    id: 'nvidia/streampetr',
    name: 'StreamPETR',
    description: 'NVIDIA StreamPETR - Real-time speech processing',
    contextLength: 4096,
    costPer1kTokens: 0.0001,
    capabilities: ['speech'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'nvidia/neva-22b': {
    id: 'nvidia/neva-22b',
    name: 'Neva 22B',
    description: 'NVIDIA Neva 22B - Vision language model',
    contextLength: 16384,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'vision'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  // GLM MODELS - NVIDIA API NAMES (NO HYPHENS)
  'z-ai/glm5': {
    id: 'z-ai/glm5',
    name: 'GLM-5',
    description: 'Z-AI GLM-5 - Advanced reasoning model',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'z-ai/glm4.7': {
    id: 'z-ai/glm4.7',
    name: 'GLM-4.7',
    description: 'Z-AI GLM-4.7 - Strong reasoning',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  // MINIMAX M2.5 SERIES - ENHANCED
  'minimaxai/minimax-m2.5': {
    id: 'minimaxai/minimax-m2.5',
    name: 'MiniMax M2.5',
    description: 'MiniMax M2.5 - Latest version - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
};

export async function getnvidiaModels(
  options: NvidiaFetcherOptions
): Promise<Record<string, Model>> {
  const {
    apiKey,
    baseUrl = 'https://integrate.api.nvidia.com/v1',
    timeout = 10000,
    cacheEnabled = true,
  } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...NVIDIA_MODELS };

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
          const existing = NVIDIA_MODELS[m.id];
          models[m.id] = {
            id: m.id,
            name: existing?.name || m.id,
            description: existing?.description || `NVIDIA ${m.id}`,
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
    console.warn('Failed to fetch nvidia models');
  }

  cache = { data: models, timestamp: now };
  return models;
}

export function getnvidiaModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || NVIDIA_MODELS[modelId];
}

export function clearnvidiaCache(): void {
  cache = null;
}

export default { getnvidiaModels, getnvidiaModelById, clearnvidiaCache };
