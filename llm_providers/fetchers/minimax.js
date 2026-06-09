import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface MiniMaxFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const MINIMAX_MODELS: Record<string, Model> = {
  'MiniMax-M2': {
    id: 'MiniMax-M2',
    name: 'MiniMax M2',
    description: 'Latest generation MoE model with strong reasoning and coding capabilities',
    contextLength: 131072,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'MiniMax-M2.1': {
    id: 'MiniMax-M2.1',
    name: 'MiniMax M2.1',
    description: 'Enhanced version of M2 with improved performance',
    contextLength: 200000,
    costPer1kTokens: 0.001,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'MiniMax-M2.5': {
    id: 'MiniMax-M2.5',
    name: 'MiniMax M2.5',
    description: 'Flagship model with advanced reasoning and vision capabilities',
    contextLength: 256000,
    costPer1kTokens: 0.0015,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'MiniMax-Text-01': {
    id: 'MiniMax-Text-01',
    name: 'MiniMax Text 01',
    description: 'Dedicated text-focused model for complex text tasks',
    contextLength: 512000,
    costPer1kTokens: 0.0005,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 16384,
  },
  'MiniMax-Text-01-Preview': {
    id: 'MiniMax-Text-01-Preview',
    name: 'MiniMax Text 01 Preview',
    description: 'Preview version of Text 01',
    contextLength: 256000,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'MiniMax-Vision-01': {
    id: 'MiniMax-Vision-01',
    name: 'MiniMax Vision 01',
    description: 'Vision model for image understanding and multimodal tasks',
    contextLength: 32768,
    costPer1kTokens: 0.001,
    capabilities: ['vision', 'chat'],
    tier: 'premium',
    maxOutputTokens: 4096,
  },
  'MiniMax-Vision-01-Fast': {
    id: 'MiniMax-Vision-01-Fast',
    name: 'MiniMax Vision 01 Fast',
    description: 'Fast vision model for quick image analysis',
    contextLength: 16384,
    costPer1kTokens: 0.0005,
    capabilities: ['vision', 'chat'],
    tier: 'free',
    maxOutputTokens: 2048,
  },
  'abab6.5s-chat': {
    id: 'abab6.5s-chat',
    name: 'ABAB 6.5S Chat',
    description: 'Legacy free tier - fast conversational model',
    contextLength: 16384,
    costPer1kTokens: 0.0002,
    capabilities: ['chat'],
    tier: 'free',
    maxOutputTokens: 4096,
  },
  'abab6.5-chat': {
    id: 'abab6.5-chat',
    name: 'ABAB 6.5 Chat',
    description: 'Legacy free tier - general purpose chat model',
    contextLength: 32768,
    costPer1kTokens: 0.0007,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'MiniMax-2.7': {
    id: 'MiniMax-2.7',
    name: 'MiniMax 2.7',
    description: 'Latest generation model with enhanced reasoning and coding capabilities',
    contextLength: 256000,
    costPer1kTokens: 0.0015,
    capabilities: ['chat', 'code', 'reasoning', 'vision', 'function-calling'],
    tier: 'premium',
    maxOutputTokens: 32768,
  },
  'MiniMax-M2-her': {
    id: 'MiniMax-M2-her',
    name: 'MiniMax M2-her',
    description: 'MiniMax M2-her model',
    contextLength: 65536,
    costPer1kTokens: 0.0003,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'MiniMax-M1': {
    id: 'MiniMax-M1',
    name: 'MiniMax M1',
    description: 'MiniMax M1 model',
    contextLength: 1000000,
    costPer1kTokens: 0.0004,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
  'MiniMax-01': {
    id: 'MiniMax-01',
    name: 'MiniMax-01',
    description: 'MiniMax-01 model',
    contextLength: 1000192,
    costPer1kTokens: 0.0002,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 16384,
  },
};

export async function getMiniMaxModels(
  options: MiniMaxFetcherOptions
): Promise<Record<string, Model>> {
  const { cacheEnabled = true } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...MINIMAX_MODELS };
  cache = { data: models, timestamp: now };
  return models;
}

export function getMiniMaxModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || MINIMAX_MODELS[modelId];
}

export function clearMiniMaxCache(): void {
  cache = null;
}

export default { getMiniMaxModels, getMiniMaxModelById, clearMiniMaxCache };
