import type { Model } from '../../types/index.js';

interface CacheEntry {
  data: Record<string, Model>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

export interface OpenCodeFetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

const OPENCODE_MODELS: Record<string, Model> = {
  'gemini-3.1-pro': {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro (Free)',
    description: 'Google Gemini 3.1 Pro - FREE',
    contextLength: 200000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro (Free)',
    description: 'Google Gemini 3 Pro - FREE',
    contextLength: 200000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'gemini-3-flash': {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash (Free)',
    description: 'Google Gemini 3 Flash - FREE',
    contextLength: 100000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'gpt-5.1-codex-mini': {
    id: 'gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini (Free)',
    description: 'OpenAI GPT-5.1 Codex Mini - FREE',
    contextLength: 128000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'minimax-m2.5-free': {
    id: 'minimax-m2.5-free',
    name: 'MiniMax M2.5 Free',
    description: 'MiniMax M2.5 Free',
    contextLength: 204800,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'minimax-m2.1': {
    id: 'minimax-m2.1',
    name: 'MiniMax M2.1 (Free)',
    description: 'MiniMax M2.1 - FREE',
    contextLength: 100000,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 8192,
  },
  'trinity-large-preview-free': {
    id: 'trinity-large-preview-free',
    name: 'Trinity Large Preview (Free)',
    description: 'Trinity Large Preview - FREE',
    contextLength: 131072,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'claude-opus-4-6': {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    description: 'Anthropic Claude Opus 4.6',
    contextLength: 200000,
    costPer1kTokens: 0.015,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    description: 'Anthropic Claude Sonnet 4.6',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'claude-3-5-haiku': {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Anthropic Claude 3.5 Haiku',
    contextLength: 200000,
    costPer1kTokens: 0.0008,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'gpt-5.4-pro': {
    id: 'gpt-5.4-pro',
    name: 'GPT-5.4 Pro',
    description: 'OpenAI GPT-5.4 Pro',
    contextLength: 1000000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'gpt-5.4': {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    description: 'OpenAI GPT-5.4',
    contextLength: 1000000,
    costPer1kTokens: 0.005,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'gpt-5': {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'OpenAI GPT-5',
    contextLength: 400000,
    costPer1kTokens: 0.0025,
    capabilities: ['chat', 'code', 'vision'],
    tier: 'premium',
    maxOutputTokens: 8192,
  },
  'minimax-m2.5': {
    id: 'minimax-m2.5',
    name: 'MiniMax M2.5',
    description: 'MiniMax M2.5',
    contextLength: 204800,
    costPer1kTokens: 0.3,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
  'minimax-m2.7': {
    id: 'minimax-m2.7',
    name: 'MiniMax M2.7',
    description: 'MiniMax M2.7 - Next-gen agentic model',
    contextLength: 205000,
    costPer1kTokens: 0.5,
    capabilities: ['chat', 'code', 'reasoning', 'agentic'],
    tier: 'premium',
    maxOutputTokens: 65536,
  },
  'glm-5': {
    id: 'glm-5',
    name: 'GLM-5',
    description: 'Z.AI GLM-5',
    contextLength: 204800,
    costPer1kTokens: 1,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
  'glm-4.7': {
    id: 'glm-4.7',
    name: 'GLM-4.7',
    description: 'Z.AI GLM-4.7',
    contextLength: 204800,
    costPer1kTokens: 0.6,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'premium',
    maxOutputTokens: 131072,
  },
  'kimi-k2': {
    id: 'kimi-k2',
    name: 'Kimi K2',
    description: 'Moonshot Kimi K2',
    contextLength: 262144,
    costPer1kTokens: 0.4,
    capabilities: ['chat', 'code'],
    tier: 'premium',
    maxOutputTokens: 262144,
  },
  'kimi-k2.5': {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    description: 'Moonshot Kimi K2.5',
    contextLength: 262144,
    costPer1kTokens: 0.6,
    capabilities: ['chat', 'code', 'reasoning', 'vision'],
    tier: 'premium',
    maxOutputTokens: 65536,
  },
  'mimo-v2-flash-free': {
    id: 'mimo-v2-flash-free',
    name: 'MiMo V2 Flash (Free)',
    description: 'Xiaomi MiMo V2 Flash - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'mimo-v2-pro-free': {
    id: 'mimo-v2-pro-free',
    name: 'MiMo V2 Pro (Free)',
    description: 'Xiaomi MiMo V2 Pro - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
  'mimo-v2-omni-free': {
    id: 'mimo-v2-omni-free',
    name: 'MiMo V2 Omni (Free)',
    description: 'Xiaomi MiMo V2 Omni - FREE',
    contextLength: 262144,
    costPer1kTokens: 0,
    capabilities: ['chat', 'code', 'reasoning'],
    tier: 'free',
    maxOutputTokens: 131072,
  },
};

export async function getOpenCodeModels(
  options: OpenCodeFetcherOptions
): Promise<Record<string, Model>> {
  const { cacheEnabled = true } = options;
  const now = Date.now();

  if (cacheEnabled && cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const models: Record<string, Model> = { ...OPENCODE_MODELS };
  cache = { data: models, timestamp: now };
  return models;
}

export function getOpenCodeModelById(modelId: string): Model | undefined {
  return cache?.data?.[modelId] || OPENCODE_MODELS[modelId];
}

export function clearOpenCodeCache(): void {
  cache = null;
}

export default { getOpenCodeModels, getOpenCodeModelById, clearOpenCodeCache };
