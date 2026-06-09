import type { Model } from '../../types/index.js';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  provider: string;
  modelId?: string;
  timestamp: number;
  expiresAt: number;
  hits: number;
  metadata?: Record<string, any>;
}

export interface ModelCacheConfig {
  maxSize: number;
  ttl: number;
  maxMemoryMB: number;
  enableCompression: boolean;
  enableStats: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  evictions: number;
  hitRate: number;
  avgAccessTime: number;
}

export interface CachePolicy {
  priority: 'lru' | 'lfu' | 'fifo' | 'ttl';
  maxAge?: number;
  staleWhileRevalidate?: boolean;
  staleIfError?: boolean;
}

export interface ModelCacheOptions {
  provider?: string;
  modelId?: string;
  ttl?: number;
  policy?: CachePolicy;
  tags?: string[];
}

const DEFAULT_CONFIG: ModelCacheConfig = {
  maxSize: 1000,
  ttl: 5 * 60 * 1000,
  maxMemoryMB: 100,
  enableCompression: false,
  enableStats: true,
};

class ModelCache {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private frequencyMap: Map<string, number> = new Map();
  private config: ModelCacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsage: 0,
    evictions: 0,
    hitRate: 0,
    avgAccessTime: 0,
  };
  private accessTimes: number[] = [];
  private memoryUsage = 0;
  private listeners: Map<string, Function> = new Map();

  constructor(config: Partial<ModelCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private calculateMemoryUsage(value: any): number {
    try {
      const str = JSON.stringify(value);
      return str.length * 2;
    } catch {
      return 1024;
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private updateAccessOrder(key: string): void {
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
    this.accessOrder.push(key);
  }

  private updateFrequency(key: string): void {
    const freq = this.frequencyMap.get(key) || 0;
    this.frequencyMap.set(key, freq + 1);
  }

  private evictIfNeeded(): void {
    while (this.cache.size >= this.config.maxSize) {
      this.evictOne();
    }

    const maxMemory = this.config.maxMemoryMB * 1024 * 1024;
    while (this.memoryUsage > maxMemory && this.cache.size > 0) {
      this.evictOne();
    }
  }

  private evictOne(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    if (this.accessOrder.length > 0) {
      keyToEvict = this.accessOrder.shift() || null;
    } else {
      const keys = Array.from(this.cache.keys());
      keyToEvict = keys[0] || null;
    }

    if (keyToEvict) {
      const entry = this.cache.get(keyToEvict);
      if (entry) {
        this.memoryUsage -= this.calculateMemoryUsage(entry.value);
      }
      this.cache.delete(keyToEvict);
      this.frequencyMap.delete(keyToEvict);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }

  private updateStats(hit: boolean, accessTime: number): void {
    if (hit) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }

    this.accessTimes.push(accessTime);
    if (this.accessTimes.length > 1000) {
      this.accessTimes.shift();
    }

    this.stats.hitRate = (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100;
    this.stats.avgAccessTime =
      this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length;
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
  }

  get<T = any>(key: string, options: ModelCacheOptions = {}): T | undefined {
    const startTime = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.updateStats(false, Date.now() - startTime);
      this.emit('miss', key, options.provider);
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      this.updateStats(false, Date.now() - startTime);
      this.emit('expired', key, options.provider);
      return undefined;
    }

    this.updateAccessOrder(key);
    this.updateFrequency(key);
    this.updateStats(true, Date.now() - startTime);
    this.emit('hit', key, options.provider);

    return entry.value as T;
  }

  set<T = any>(key: string, value: T, options: ModelCacheOptions = {}): void {
    const startTime = Date.now();
    const ttl = options.ttl || this.config.ttl;
    const now = Date.now();

    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.memoryUsage -= this.calculateMemoryUsage(existingEntry.value);
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      provider: options.provider || 'unknown',
      modelId: options.modelId,
      timestamp: now,
      expiresAt: now + ttl,
      hits: 0,
      metadata: options.tags ? { tags: options.tags } : undefined,
    };

    const memoryCost = this.calculateMemoryUsage(value);
    this.memoryUsage += memoryCost;

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.evictIfNeeded();

    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
    this.emit('set', key, options.provider);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.memoryUsage -= this.calculateMemoryUsage(entry.value);
    }
    const result = this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.frequencyMap.delete(key);
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.frequencyMap.clear();
    this.memoryUsage = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memoryUsage: 0,
      evictions: 0,
      hitRate: 0,
      avgAccessTime: 0,
    };
    this.emit('clear', '');
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values<T = any>(): T[] {
    return Array.from(this.cache.values()).map((entry) => entry.value as T);
  }

  entries<T = any>(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value as T]);
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      evictions: 0,
      hitRate: 0,
      avgAccessTime: 0,
    };
    this.accessTimes = [];
  }

  getByProvider<T = any>(provider: string): T[] {
    return Array.from(this.cache.values())
      .filter((entry) => entry.provider === provider)
      .map((entry) => entry.value as T);
  }

  getByModel<T = any>(modelId: string): T[] {
    return Array.from(this.cache.values())
      .filter((entry) => entry.modelId === modelId)
      .map((entry) => entry.value as T);
  }

  getByTag(tag: string): any[] {
    return Array.from(this.cache.values())
      .filter((entry) => entry.metadata?.tags?.includes(tag))
      .map((entry) => entry.value);
  }

  invalidateByProvider(provider: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (entry.provider === provider) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= this.calculateMemoryUsage(entry.value);
      }
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      this.frequencyMap.delete(key);
      count++;
    }

    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
    return count;
  }

  invalidateByModel(modelId: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (entry.modelId === modelId) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= this.calculateMemoryUsage(entry.value);
      }
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      this.frequencyMap.delete(key);
      count++;
    }

    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
    return count;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (entry.metadata?.tags?.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= this.calculateMemoryUsage(entry.value);
      }
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      this.frequencyMap.delete(key);
      count++;
    }

    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
    return count;
  }

  cleanExpired(): number {
    let count = 0;
    const keysToDelete: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= this.calculateMemoryUsage(entry.value);
      }
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      this.frequencyMap.delete(key);
      count++;
    }

    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.memoryUsage;
    return count;
  }

  getOrSet<T = any>(
    key: string,
    factory: () => T | Promise<T>,
    options: ModelCacheOptions = {}
  ): T | Promise<T> {
    const cached = this.get<T>(key, options);
    if (cached !== undefined) {
      return cached;
    }

    const result = factory();
    if (result instanceof Promise) {
      return result.then((value) => {
        this.set(key, value, options);
        return value;
      });
    }

    this.set(key, result, options);
    return result;
  }

  async getOrSetAsync<T = any>(
    key: string,
    factory: () => Promise<T>,
    options: ModelCacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key, options);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  on(event: string, listener: Function): void {
    this.listeners.set(event, listener);
  }

  off(event: string): void {
    this.listeners.delete(event);
  }

  private emit(event: string, key: string, provider?: string): void {
    const listener = this.listeners.get(event);
    if (listener) {
      listener({ key, provider, timestamp: Date.now() });
    }
  }

  setConfig(config: Partial<ModelCacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ModelCacheConfig {
    return { ...this.config };
  }

  snapshot(): Array<CacheEntry> {
    return Array.from(this.cache.values()).map((entry) => ({ ...entry }));
  }

  restore(entries: Array<CacheEntry>): void {
    this.clear();
    for (const entry of entries) {
      this.set(entry.key, entry.value, {
        provider: entry.provider,
        modelId: entry.modelId,
        ttl: entry.expiresAt - entry.timestamp,
      });
    }
  }

  toJSON(): object {
    return {
      config: this.config,
      stats: this.stats,
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
    };
  }
}

const globalCache = new ModelCache();

export { ModelCache };

export const modelCache = globalCache;

export function getModelCache(): ModelCache {
  return globalCache;
}

export function getCachedModel<T = Model>(provider: string, modelId: string): T | undefined {
  return globalCache.get<T>(`${provider}:${modelId}`, { provider, modelId });
}

export function setCachedModel<T = Model>(
  provider: string,
  modelId: string,
  model: T,
  ttl?: number
): void {
  globalCache.set(`${provider}:${modelId}`, model, { provider, modelId, ttl });
}

export function deleteCachedModel(provider: string, modelId: string): boolean {
  return globalCache.delete(`${provider}:${modelId}`);
}

export function clearModelCache(): void {
  globalCache.clear();
}

export function getModelCacheStats(): CacheStats {
  return globalCache.getStats();
}

export function invalidateModelsByProvider(provider: string): number {
  return globalCache.invalidateByProvider(provider);
}

export function cleanExpiredModels(): number {
  return globalCache.cleanExpired();
}

export function createModelCache(config?: Partial<ModelCacheConfig>): ModelCache {
  return new ModelCache(config);
}

export default ModelCache;
