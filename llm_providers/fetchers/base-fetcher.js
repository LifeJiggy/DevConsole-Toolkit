import type { Model } from '../../types/index.js';

export interface FetcherOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheEnabled?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export abstract class BaseFetcher {
  protected cache: CacheEntry<Record<string, Model>> | null = null;
  protected cacheDuration = 5 * 60 * 1000;

  abstract getProviderName(): string;
  abstract fetchModels(options: FetcherOptions): Promise<Record<string, Model>>;

  protected isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.timestamp < this.cacheDuration;
  }

  protected setCache(data: Record<string, Model>): void {
    this.cache = {
      data,
      timestamp: Date.now(),
    };
  }

  protected getCache(): Record<string, Model> | null {
    return this.cache?.data ?? null;
  }

  public clearCache(): void {
    this.cache = null;
  }

  public getCacheStatus() {
    return {
      cached: this.cache !== null,
      timestamp: this.cache?.timestamp ?? null,
      totalModels: this.cache ? Object.keys(this.cache.data).length : 0,
    };
  }

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number }
  ): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected estimateCost(
    model: Model | undefined,
    inputTokens: number,
    outputTokens: number
  ): number {
    if (!model) return 0;
    return ((inputTokens + outputTokens) / 1000) * model.costPer1kTokens;
  }

  protected filterByTier(
    models: Record<string, Model>,
    tier: 'free' | 'premium'
  ): Record<string, Model> {
    const filtered: Record<string, Model> = {};
    for (const [id, model] of Object.entries(models)) {
      if (model.tier === tier) {
        filtered[id] = model;
      }
    }
    return filtered;
  }

  protected filterByCapability(
    models: Record<string, Model>,
    capability: string
  ): Record<string, Model> {
    const filtered: Record<string, Model> = {};
    for (const [id, model] of Object.entries(models)) {
      if (model.capabilities.includes(capability as any)) {
        filtered[id] = model;
      }
    }
    return filtered;
  }
}

export abstract class BaseModelFetcher extends BaseFetcher {
  abstract getModelById(modelId: string): Model | undefined;
  abstract getFreeModels(): Record<string, Model>;
  abstract getPremiumModels(): Record<string, Model>;
}

export function createCacheEntry<T>(data: T, durationMs = 5 * 60 * 1000): CacheEntry<T> {
  return {
    data,
    timestamp: Date.now(),
  };
}

export function isCacheExpired(entry: CacheEntry<any>, maxAgeMs = 5 * 60 * 1000): boolean {
  return Date.now() - entry.timestamp > maxAgeMs;
}

export function mergeModels(
  staticModels: Record<string, Model>,
  apiModels: Record<string, Model>
): Record<string, Model> {
  return { ...staticModels, ...apiModels };
}

export default BaseFetcher;
