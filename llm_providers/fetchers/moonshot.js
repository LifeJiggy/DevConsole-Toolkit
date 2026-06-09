import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface MoonshotFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const MOONSHOT_MODELS: Record<string, Model> = {
  'moonshot-v1-8k': {
    id: 'moonshot-v1-8k',
    name: 'Moonshot 8K',
    description: 'Free tier - short context model',
    contextLength: 8192,
    costPer1kTokens: 0.00012,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'moonshot-v1-32k': {
    id: 'moonshot-v1-32k',
    name: 'Moonshot 32K',
    description: 'Free tier - medium context model',
    contextLength: 32768,
    costPer1kTokens: 0.00024,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'moonshot-v1-128k': {
    id: 'moonshot-v1-128k',
    name: 'Moonshot 128K',
    description: 'Large context model',
    contextLength: 131072,
    costPer1kTokens: 0.0006,
    capabilities: ['chat', 'code', 'long-context'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'moonshot-v1-8k-v2': {
    id: 'moonshot-v1-8k-v2',
    name: 'Moonshot 8K V2',
    description: 'Enhanced short context model',
    contextLength: 8192,
    costPer1kTokens: 0.0001,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'moonshot-v1-32k-v2': {
    id: 'moonshot-v1-32k-v2',
    name: 'Moonshot 32K V2',
    description: 'Enhanced medium context model',
    contextLength: 32768,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'moonshot-v1-128k-v2': {
    id: 'moonshot-v1-128k-v2',
    name: 'Moonshot 128K V2',
    description: 'Enhanced large context model',
    contextLength: 131072,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'long-context'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v1-200k': {
    id: 'moonshot-v1-200k',
    name: 'Moonshot 200K',
    description: 'Extended context model',
    contextLength: 200000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'long-context'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v3-summarize': {
    id: 'moonshot-v3-summarize',
    name: 'Moonshot V3 Summarize',
    description: 'V3 model specialized for summarization',
    contextLength: 131072,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'moonshot-v3-thinking': {
    id: 'moonshot-v3-thinking',
    name: 'Moonshot V3 Thinking',
    description: 'V3 model with enhanced reasoning',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v3-pro': {
    id: 'moonshot-v3-pro',
    name: 'Moonshot V3 Pro',
    description: 'Moonshot V3 professional model',
    contextLength: 200000,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v3': {
    id: 'moonshot-v3',
    name: 'Moonshot V3',
    description: 'Moonshot V3 flagship model',
    contextLength: 200000,
    costPer1kTokens: 0.0006,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v4-mini': {
    id: 'moonshot-v4-mini',
    name: 'Moonshot V4 Mini',
    description: 'Moonshot V4 fast model',
    contextLength: 131072,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'moonshot-v4': {
    id: 'moonshot-v4',
    name: 'Moonshot V4',
    description: 'Moonshot V4 standard model',
    contextLength: 200000,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v4-pro': {
    id: 'moonshot-v4-pro',
    name: 'Moonshot V4 Pro',
    description: 'Moonshot V4 professional model',
    contextLength: 256000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'moonshot-v4-ultra': {
    id: 'moonshot-v4-ultra',
    name: 'Moonshot V4 Ultra',
    description: 'Moonshot V4 flagship model',
    contextLength: 256000,
    costPer1kTokens: 0.002,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'analysis'],
    tier: 'enterprise',
    maxOutputTokens: 65536,
  },
  'moonshot-v5-mini': {
    id: 'moonshot-v5-mini',
    name: 'Moonshot V5 Mini',
    description: 'Moonshot V5 fast model',
    contextLength: 131072,
    costPer1kTokens: 0.0001,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'moonshot-v5': {
    id: 'moonshot-v5',
    name: 'Moonshot V5',
    description: 'Moonshot V5 standard model',
    contextLength: 256000,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'moonshot-v5-pro': {
    id: 'moonshot-v5-pro',
    name: 'Moonshot V5 Pro',
    description: 'Moonshot V5 professional model',
    contextLength: 512000,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'moonshot-v5-ultra': {
    id: 'moonshot-v5-ultra',
    name: 'Moonshot V5 Ultra',
    description: 'Moonshot V5 flagship model',
    contextLength: 512000,
    costPer1kTokens: 0.0015,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling', 'analysis'],
    tier: 'enterprise',
    maxOutputTokens: 65536,
  },
  'kimi-k2.5': {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    description: 'Kimi K2.5 model',
    contextLength: 262144,
    costPer1kTokens: 0.00045,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'kimi-k2-0905': {
    id: 'kimi-k2-0905',
    name: 'Kimi K2 0905',
    description: 'Kimi K2 version 0905',
    contextLength: 131072,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'kimi-k2-thinking': {
    id: 'kimi-k2-thinking',
    name: 'Kimi K2 Thinking',
    description: 'Kimi K2 with thinking',
    contextLength: 131072,
    costPer1kTokens: 0.00047,
    capabilities: ['chat', 'reasoning', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'kimi-k2-0711': {
    id: 'kimi-k2-0711',
    name: 'Kimi K2 0711',
    description: 'Kimi K2 version 0711',
    contextLength: 131000,
    costPer1kTokens: 0.00055,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'kimi-dev-72b': {
    id: 'kimi-dev-72b',
    name: 'Kimi Dev 72B',
    description: 'Kimi Dev 72B',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'kimi-vl-a3b-thinking': {
    id: 'kimi-vl-a3b-thinking',
    name: 'Kimi VL A3B Thinking',
    description: 'Kimi Vision Language A3B Thinking',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'vision', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'moonlight-16b-a3b-instruct': {
    id: 'moonlight-16b-a3b-instruct',
    name: 'Moonlight 16B A3B Instruct',
    description: 'Moonlight 16B A3B Instruct',
    contextLength: 8192,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
};

export async function getMoonshotModels(
  options: MoonshotFetcherOptions
): Promise<Record<string, Model>> {
  const { cacheEnabled = true } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...MOONSHOT_MODELS };
  cache = { data: models, timestamp: now };
  return models;
}

export function getMoonshotModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || MOONSHOT_MODELS[modelId];
}

export function clearMoonshotCache(): void {
  cache = null;
}

export default { getMoonshotModels, getMoonshotModelById, clearMoonshotCache };
