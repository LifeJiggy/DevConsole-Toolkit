import type { Model } from '../../types/index.js';

export interface EndpointConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

export interface EndpointHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latency: number;
  lastChecked: number;
  successRate: number;
  errorCount: number;
  requestCount: number;
}

export interface EndpointMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number;
  errorRate: number;
}

export interface EndpointRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler?: Function;
  middleware?: Function[];
  schema?: any;
  rateLimit?: number;
  timeout?: number;
}

export interface EndpointCacheEntry {
  provider: string;
  modelId: string;
  endpoints: Map<string, EndpointConfig>;
  primaryEndpoint: string;
  fallbackEndpoints: string[];
  health: Map<string, EndpointHealth>;
  metrics: Map<string, EndpointMetrics>;
  lastUpdated: number;
  version: number;
}

export interface EndpointDiscoveryResult {
  provider: string;
  modelId: string;
  endpoints: string[];
  selectedEndpoint: string;
  latency: number;
  confidence: number;
}

export interface LoadBalancingStrategy {
  type: 'round-robin' | 'least-connections' | 'weighted' | 'latency-based' | 'failover';
  weights?: Record<string, number>;
}

const DEFAULT_ENDPOINT_CONFIG: Partial<EndpointConfig> = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

const DEFAULT_HEALTH_THRESHOLDS = {
  latencyMs: 5000,
  errorRate: 0.1,
  successRate: 0.9,
};

class ModelEndpointCache {
  private endpoints: Map<string, EndpointCacheEntry> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private loadBalancingStrategies: Map<string, LoadBalancingStrategy> = new Map();
  private requestCounters: Map<string, number> = new Map();
  private lastHealthCheck: Map<string, number> = new Map();
  private healthThresholds = DEFAULT_HEALTH_THRESHOLDS;

  constructor() {
    this.loadBalancingStrategies.set('default', { type: 'round-robin' });
  }

  registerEndpoint(
    provider: string,
    modelId: string,
    endpointKey: string,
    config: EndpointConfig
  ): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    let entry = this.endpoints.get(cacheKey);

    if (!entry) {
      entry = {
        provider,
        modelId,
        endpoints: new Map(),
        primaryEndpoint: endpointKey,
        fallbackEndpoints: [],
        health: new Map(),
        metrics: new Map(),
        lastUpdated: Date.now(),
        version: 1,
      };
      this.endpoints.set(cacheKey, entry);
    }

    entry.endpoints.set(endpointKey, {
      ...DEFAULT_ENDPOINT_CONFIG,
      ...config,
    });
    entry.lastUpdated = Date.now();
    entry.version++;

    if (!entry.health.has(endpointKey)) {
      entry.health.set(endpointKey, {
        status: 'unknown',
        latency: 0,
        lastChecked: 0,
        successRate: 1,
        errorCount: 0,
        requestCount: 0,
      });
    }

    if (!entry.metrics.has(endpointKey)) {
      entry.metrics.set(endpointKey, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgLatency: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        throughput: 0,
        errorRate: 0,
      });
    }
  }

  getEndpoint(provider: string, modelId: string): EndpointConfig | undefined {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (!entry) {
      return undefined;
    }

    const strategy =
      this.loadBalancingStrategies.get(provider) || this.loadBalancingStrategies.get('default');

    return this.selectEndpoint(entry, strategy);
  }

  private selectEndpoint(
    entry: EndpointCacheEntry,
    strategy?: LoadBalancingStrategy
  ): EndpointConfig | undefined {
    const healthyEndpoints = this.getHealthyEndpoints(entry);

    if (healthyEndpoints.length === 0) {
      const firstEndpoint = entry.endpoints.keys().next().value;
      return firstEndpoint ? entry.endpoints.get(firstEndpoint) : undefined;
    }

    switch (strategy?.type) {
      case 'round-robin':
        return this.roundRobinSelect(entry, healthyEndpoints);
      case 'least-connections':
        return this.leastConnectionsSelect(entry, healthyEndpoints);
      case 'weighted':
        return this.weightedSelect(entry, healthyEndpoints, strategy.weights);
      case 'latency-based':
        return this.latencyBasedSelect(entry, healthyEndpoints);
      case 'failover':
        return this.failoverSelect(entry, healthyEndpoints);
      default:
        return entry.endpoints.get(healthyEndpoints[0]);
    }
  }

  private getHealthyEndpoints(entry: EndpointCacheEntry): string[] {
    const healthy: string[] = [];

    const healthEntries = Array.from(entry.health.entries());
    for (const [key, health] of healthEntries) {
      if (health.status === 'healthy' || health.status === 'degraded') {
        healthy.push(key);
      }
    }

    if (healthy.length === 0) {
      return Array.from(entry.endpoints.keys());
    }

    return healthy;
  }

  private roundRobinSelect(
    entry: EndpointCacheEntry,
    healthyEndpoints: string[]
  ): EndpointConfig | undefined {
    const key = healthyEndpoints[0];
    return entry.endpoints.get(key);
  }

  private leastConnectionsSelect(
    entry: EndpointCacheEntry,
    healthyEndpoints: string[]
  ): EndpointConfig | undefined {
    let minConnections = Number.POSITIVE_INFINITY;
    let selectedKey: string | undefined;

    for (const key of healthyEndpoints) {
      const counterKey = `${entry.provider}:${entry.modelId}:${key}`;
      const connections = this.requestCounters.get(counterKey) || 0;

      if (connections < minConnections) {
        minConnections = connections;
        selectedKey = key;
      }
    }

    return selectedKey ? entry.endpoints.get(selectedKey) : undefined;
  }

  private weightedSelect(
    entry: EndpointCacheEntry,
    healthyEndpoints: string[],
    weights?: Record<string, number>
  ): EndpointConfig | undefined {
    if (!weights) {
      return entry.endpoints.get(healthyEndpoints[0]);
    }

    const totalWeight = healthyEndpoints.reduce((sum, key) => {
      return sum + (weights[key] || 1);
    }, 0);

    let random = Math.random() * totalWeight;

    for (const key of healthyEndpoints) {
      const weight = weights[key] || 1;
      random -= weight;

      if (random <= 0) {
        return entry.endpoints.get(key);
      }
    }

    return entry.endpoints.get(healthyEndpoints[0]);
  }

  private latencyBasedSelect(
    entry: EndpointCacheEntry,
    healthyEndpoints: string[]
  ): EndpointConfig | undefined {
    let lowestLatency = Number.POSITIVE_INFINITY;
    let selectedKey: string | undefined;

    for (const key of healthyEndpoints) {
      const health = entry.health.get(key);
      if (health && health.latency < lowestLatency) {
        lowestLatency = health.latency;
        selectedKey = key;
      }
    }

    return selectedKey ? entry.endpoints.get(selectedKey) : undefined;
  }

  private failoverSelect(
    entry: EndpointCacheEntry,
    healthyEndpoints: string[]
  ): EndpointConfig | undefined {
    const primary = entry.primaryEndpoint;

    if (healthyEndpoints.includes(primary)) {
      return entry.endpoints.get(primary);
    }

    for (const fallback of entry.fallbackEndpoints) {
      if (healthyEndpoints.includes(fallback)) {
        return entry.endpoints.get(fallback);
      }
    }

    return entry.endpoints.get(healthyEndpoints[0]);
  }

  private getCacheKey(provider: string, modelId: string): string {
    return `${provider}:${modelId}`;
  }

  hasEndpoint(provider: string, modelId: string): boolean {
    const cacheKey = this.getCacheKey(provider, modelId);
    return this.endpoints.has(cacheKey);
  }

  deleteEndpoint(provider: string, modelId: string, endpointKey?: string): boolean {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (!entry) {
      return false;
    }

    if (endpointKey) {
      const deleted = entry.endpoints.delete(endpointKey);
      entry.health.delete(endpointKey);
      entry.metrics.delete(endpointKey);
      entry.lastUpdated = Date.now();
      return deleted;
    }

    return this.endpoints.delete(cacheKey);
  }

  clear(): void {
    this.endpoints.clear();
    this.requestCounters.clear();

    const intervals = Array.from(this.healthCheckIntervals.values());
    for (const interval of intervals) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
  }

  getAllEndpoints(provider?: string, modelId?: string): Map<string, EndpointConfig> | undefined {
    if (provider && modelId) {
      const cacheKey = this.getCacheKey(provider, modelId);
      const entry = this.endpoints.get(cacheKey);
      return entry?.endpoints;
    }

    if (provider) {
      const result = new Map<string, EndpointConfig>();
      const endpointEntries = Array.from(this.endpoints.entries());
      for (const [key, entry] of endpointEntries) {
        if (entry.provider === provider) {
          const epEntries = Array.from(entry.endpoints.entries());
          for (const [epKey, epConfig] of epEntries) {
            result.set(`${key}:${epKey}`, epConfig);
          }
        }
      }
      return result;
    }

    const result = new Map<string, EndpointConfig>();
    const allEntries = Array.from(this.endpoints.values());
    for (const entry of allEntries) {
      const epEntries = Array.from(entry.endpoints.entries());
      for (const [epKey, epConfig] of epEntries) {
        result.set(`${entry.provider}:${entry.modelId}:${epKey}`, epConfig);
      }
    }
    return result;
  }

  getHealth(provider: string, modelId: string, endpointKey: string): EndpointHealth | undefined {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);
    return entry?.health.get(endpointKey);
  }

  getAllHealth(provider: string, modelId: string): Map<string, EndpointHealth> | undefined {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);
    return entry?.health;
  }

  updateHealth(
    provider: string,
    modelId: string,
    endpointKey: string,
    health: Partial<EndpointHealth>
  ): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (!entry) {
      return;
    }

    const currentHealth = entry.health.get(endpointKey) || {
      status: 'unknown',
      latency: 0,
      lastChecked: 0,
      successRate: 1,
      errorCount: 0,
      requestCount: 0,
    };

    entry.health.set(endpointKey, {
      ...currentHealth,
      ...health,
      lastChecked: Date.now(),
    });
  }

  recordRequest(
    provider: string,
    modelId: string,
    endpointKey: string,
    success: boolean,
    latency: number
  ): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (!entry) {
      return;
    }

    const counterKey = `${provider}:${modelId}:${endpointKey}`;
    const currentCount = this.requestCounters.get(counterKey) || 0;
    this.requestCounters.set(counterKey, currentCount + 1);

    const metrics = entry.metrics.get(endpointKey) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      throughput: 0,
      errorRate: 0,
    };

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    const latencies: number[] = [];
    for (let i = 0; i < metrics.totalRequests; i++) {
      latencies.push(latency);
    }
    latencies.sort((a, b) => a - b);

    metrics.avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    metrics.p50Latency = latencies[Math.floor(latencies.length * 0.5)] || 0;
    metrics.p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0;
    metrics.p99Latency = latencies[Math.floor(latencies.length * 0.99)] || 0;
    metrics.errorRate = metrics.failedRequests / metrics.totalRequests;
    metrics.throughput = metrics.totalRequests / 60;

    entry.metrics.set(endpointKey, metrics);

    const health = entry.health.get(endpointKey) || {
      status: 'unknown',
      latency: 0,
      lastChecked: 0,
      successRate: 1,
      errorCount: 0,
      requestCount: 0,
    };

    health.latency = metrics.avgLatency;
    health.requestCount = metrics.totalRequests;
    health.successRate = metrics.successfulRequests / metrics.totalRequests;
    health.errorCount = metrics.failedRequests;

    if (metrics.errorRate > this.healthThresholds.errorRate) {
      health.status = 'unhealthy';
    } else if (metrics.avgLatency > this.healthThresholds.latencyMs) {
      health.status = 'degraded';
    } else {
      health.status = 'healthy';
    }

    entry.health.set(endpointKey, health);
  }

  getMetrics(provider: string, modelId: string, endpointKey: string): EndpointMetrics | undefined {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);
    return entry?.metrics.get(endpointKey);
  }

  setLoadBalancingStrategy(provider: string, strategy: LoadBalancingStrategy): void {
    this.loadBalancingStrategies.set(provider, strategy);
  }

  getLoadBalancingStrategy(provider: string): LoadBalancingStrategy | undefined {
    return this.loadBalancingStrategies.get(provider);
  }

  setHealthThresholds(thresholds: typeof DEFAULT_HEALTH_THRESHOLDS): void {
    this.healthThresholds = { ...this.healthThresholds, ...thresholds };
  }

  getHealthThresholds(): typeof DEFAULT_HEALTH_THRESHOLDS {
    return { ...this.healthThresholds };
  }

  async discoverEndpoints(provider: string, modelId: string): Promise<EndpointDiscoveryResult[]> {
    const results: EndpointDiscoveryResult[] = [];
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (!entry) {
      return results;
    }

    const endpointEntries = Array.from(entry.endpoints.entries());
    for (const [key, config] of endpointEntries) {
      const startTime = Date.now();

      try {
        const response = await fetch(config.baseUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(config.timeout || 30000),
        });

        const latency = Date.now() - startTime;

        results.push({
          provider,
          modelId,
          endpoints: [key],
          selectedEndpoint: key,
          latency,
          confidence: response.ok ? 1 : 0,
        });
      } catch (error) {
        results.push({
          provider,
          modelId,
          endpoints: [key],
          selectedEndpoint: key,
          latency: Date.now() - startTime,
          confidence: 0,
        });
      }
    }

    return results;
  }

  startHealthCheck(provider: string, modelId: string, intervalMs = 60000): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const intervalKey = `${cacheKey}:healthcheck`;

    if (this.healthCheckIntervals.has(intervalKey)) {
      return;
    }

    const interval = setInterval(async () => {
      await this.discoverEndpoints(provider, modelId);
      this.lastHealthCheck.set(cacheKey, Date.now());
    }, intervalMs);

    this.healthCheckIntervals.set(intervalKey, interval);
  }

  stopHealthCheck(provider: string, modelId: string): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const intervalKey = `${cacheKey}:healthcheck`;
    const interval = this.healthCheckIntervals.get(intervalKey);

    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(intervalKey);
    }
  }

  getLastHealthCheckTime(provider: string, modelId: string): number {
    const cacheKey = this.getCacheKey(provider, modelId);
    return this.lastHealthCheck.get(cacheKey) || 0;
  }

  size(): number {
    return this.endpoints.size;
  }

  keys(): string[] {
    return Array.from(this.endpoints.keys());
  }

  has(provider: string, modelId: string): boolean {
    const cacheKey = this.getCacheKey(provider, modelId);
    return this.endpoints.has(cacheKey);
  }

  getEntry(provider: string, modelId: string): EndpointCacheEntry | undefined {
    const cacheKey = this.getCacheKey(provider, modelId);
    return this.endpoints.get(cacheKey);
  }

  setPrimaryEndpoint(provider: string, modelId: string, endpointKey: string): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (entry && entry.endpoints.has(endpointKey)) {
      entry.primaryEndpoint = endpointKey;
    }
  }

  addFallbackEndpoint(provider: string, modelId: string, endpointKey: string): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (entry && entry.endpoints.has(endpointKey)) {
      if (!entry.fallbackEndpoints.includes(endpointKey)) {
        entry.fallbackEndpoints.push(endpointKey);
      }
    }
  }

  removeFallbackEndpoint(provider: string, modelId: string, endpointKey: string): void {
    const cacheKey = this.getCacheKey(provider, modelId);
    const entry = this.endpoints.get(cacheKey);

    if (entry) {
      entry.fallbackEndpoints = entry.fallbackEndpoints.filter((e) => e !== endpointKey);
    }
  }

  snapshot(): object {
    const snapshot: any = {};

    const endpointEntries = Array.from(this.endpoints.entries());
    for (const [key, entry] of endpointEntries) {
      snapshot[key] = {
        provider: entry.provider,
        modelId: entry.modelId,
        primaryEndpoint: entry.primaryEndpoint,
        fallbackEndpoints: entry.fallbackEndpoints,
        endpoints: Array.from(entry.endpoints.entries()),
        lastUpdated: entry.lastUpdated,
        version: entry.version,
      };
    }

    return snapshot;
  }

  restore(data: any): void {
    this.clear();

    for (const [key, entry] of Object.entries(data)) {
      const entryData = entry as any;
      const cacheEntry: EndpointCacheEntry = {
        provider: entryData.provider,
        modelId: entryData.modelId,
        endpoints: new Map(entryData.endpoints),
        primaryEndpoint: entryData.primaryEndpoint,
        fallbackEndpoints: entryData.fallbackEndpoints,
        health: new Map(),
        metrics: new Map(),
        lastUpdated: entryData.lastUpdated,
        version: entryData.version,
      };

      this.endpoints.set(key, cacheEntry);
    }
  }

  toJSON(): object {
    return {
      size: this.size(),
      endpoints: this.snapshot(),
      strategies: Array.from(this.loadBalancingStrategies.entries()),
      thresholds: this.healthThresholds,
    };
  }

  [Symbol.iterator](): Iterator<[string, EndpointCacheEntry]> {
    return this.endpoints[Symbol.iterator]();
  }
}

const globalEndpointCache = new ModelEndpointCache();

export { ModelEndpointCache };

export const modelEndpointCache = globalEndpointCache;

export function getEndpointCache(): ModelEndpointCache {
  return globalEndpointCache;
}

export function getModelEndpoint(provider: string, modelId: string): EndpointConfig | undefined {
  return globalEndpointCache.getEndpoint(provider, modelId);
}

export function registerModelEndpoint(
  provider: string,
  modelId: string,
  endpointKey: string,
  config: EndpointConfig
): void {
  globalEndpointCache.registerEndpoint(provider, modelId, endpointKey, config);
}

export function deleteModelEndpoint(
  provider: string,
  modelId: string,
  endpointKey?: string
): boolean {
  return globalEndpointCache.deleteEndpoint(provider, modelId, endpointKey);
}

export function clearEndpointCache(): void {
  globalEndpointCache.clear();
}

export function getEndpointHealth(
  provider: string,
  modelId: string,
  endpointKey: string
): EndpointHealth | undefined {
  return globalEndpointCache.getHealth(provider, modelId, endpointKey);
}

export function recordEndpointRequest(
  provider: string,
  modelId: string,
  endpointKey: string,
  success: boolean,
  latency: number
): void {
  globalEndpointCache.recordRequest(provider, modelId, endpointKey, success, latency);
}

export function setEndpointLoadBalancingStrategy(
  provider: string,
  strategy: LoadBalancingStrategy
): void {
  globalEndpointCache.setLoadBalancingStrategy(provider, strategy);
}

export function createEndpointCache(): ModelEndpointCache {
  return new ModelEndpointCache();
}

export default ModelEndpointCache;
