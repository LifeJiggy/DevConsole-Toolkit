import { EventEmitter } from 'events';

export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  heapReserved: number;
  external: number;
  arrayBuffers: number;
  rss: number;
  timestamp: number;
}

export interface MemoryThreshold {
  warning: number;
  critical: number;
  fatal: number;
}

export interface MemoryMetrics {
  current: MemoryUsage;
  peak: MemoryUsage;
  average: MemoryUsage;
  samples: number;
  lastGC?: number;
  gcCount: number;
}

export interface MemoryAllocation {
  size: number;
  tag?: string;
  timestamp: number;
  stack?: string;
}

export interface MemorySnapshot {
  id: string;
  timestamp: number;
  usage: MemoryUsage;
  allocations: MemoryAllocation[];
  allocationsByTag: Record<string, number>;
}

export interface GCEvent {
  type: 'young' | 'old' | 'full' | 'incremental' | 'unknown';
  before: MemoryUsage;
  after: MemoryUsage;
  duration: number;
  timestamp: number;
}

export interface MemoryPressureState {
  level: 'normal' | 'warning' | 'critical' | 'fatal';
  timestamp: number;
  action?: string;
}

export const DEFAULT_MEMORY_THRESHOLDS: MemoryThreshold = {
  warning: 512 * 1024 * 1024,
  critical: 1024 * 1024 * 1024,
  fatal: 2 * 1024 * 1024 * 1024,
};

class MemorySampler {
  private samples: MemoryUsage[] = [];
  private maxSamples: number;
  private intervalId?: ReturnType<typeof setTimeout>;
  private sampling = false;

  constructor(maxSamples = 1000) {
    this.maxSamples = maxSamples;
  }

  start(intervalMs = 5000): void {
    if (this.sampling) return;
    this.sampling = true;
    this.sample();
    this.intervalId = setInterval(() => this.sample(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.sampling = false;
  }

  private sample(): void {
    const usage = getMemoryUsage();
    this.samples.push(usage);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  getSamples(): MemoryUsage[] {
    return [...this.samples];
  }

  getAverage(): MemoryUsage {
    if (this.samples.length === 0) {
      return getMemoryUsage();
    }

    const sum = this.samples.reduce(
      (acc, sample) => ({
        heapUsed: acc.heapUsed + sample.heapUsed,
        heapTotal: acc.heapTotal + sample.heapTotal,
        heapReserved: acc.heapReserved + sample.heapReserved,
        external: acc.external + sample.external,
        arrayBuffers: acc.arrayBuffers + sample.arrayBuffers,
        rss: acc.rss + sample.rss,
        timestamp: 0,
      }),
      {
        heapUsed: 0,
        heapTotal: 0,
        heapReserved: 0,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
        timestamp: 0,
      }
    );

    const count = this.samples.length;
    return {
      heapUsed: Math.floor(sum.heapUsed / count),
      heapTotal: Math.floor(sum.heapTotal / count),
      heapReserved: Math.floor(sum.heapReserved / count),
      external: Math.floor(sum.external / count),
      arrayBuffers: Math.floor(sum.arrayBuffers / count),
      rss: Math.floor(sum.rss / count),
      timestamp: Date.now(),
    };
  }

  clear(): void {
    this.samples = [];
  }
}

class MemoryAllocator {
  private allocations: Map<number, MemoryAllocation> = new Map();
  private totalAllocated = 0;
  private tagCounts: Record<string, number> = {};
  private nextId = 1;
  private maxAllocations = 10000;
  private tracking = false;

  enableTracking(): void {
    this.tracking = true;
  }

  disableTracking(): void {
    this.tracking = false;
  }

  allocate(size: number, tag?: string): number {
    const id = this.nextId++;
    const allocation: MemoryAllocation = {
      size,
      tag,
      timestamp: Date.now(),
      stack: this.tracking ? new Error().stack : undefined,
    };

    this.allocations.set(id, allocation);
    this.totalAllocated += size;

    if (tag) {
      this.tagCounts[tag] = (this.tagCounts[tag] || 0) + size;
    }

    if (this.allocations.size > this.maxAllocations) {
      const firstId = this.allocations.keys().next().value;
      if (firstId !== undefined) {
        this.deallocate(firstId);
      }
    }

    return id;
  }

  deallocate(id: number): boolean {
    const allocation = this.allocations.get(id);
    if (!allocation) return false;

    this.totalAllocated -= allocation.size;
    if (allocation.tag) {
      this.tagCounts[allocation.tag] -= allocation.size;
      if (this.tagCounts[allocation.tag] <= 0) {
        delete this.tagCounts[allocation.tag];
      }
    }

    return this.allocations.delete(id);
  }

  getAllocation(id: number): MemoryAllocation | undefined {
    return this.allocations.get(id);
  }

  getAllAllocations(): MemoryAllocation[] {
    return Array.from(this.allocations.values());
  }

  getTotalAllocated(): number {
    return this.totalAllocated;
  }

  getAllocationsByTag(): Record<string, number> {
    return { ...this.tagCounts };
  }

  getAllocationCount(): number {
    return this.allocations.size;
  }

  clear(): void {
    this.allocations.clear();
    this.totalAllocated = 0;
    this.tagCounts = {};
  }

  snapshot(): MemorySnapshot {
    return {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      usage: getMemoryUsage(),
      allocations: this.getAllAllocations(),
      allocationsByTag: this.getAllocationsByTag(),
    };
  }
}

class GCCollector {
  private events: GCEvent[] = [];
  private maxEvents = 100;
  private lastMemory?: MemoryUsage;
  private gcIntervalId?: ReturnType<typeof setTimeout>;
  private monitoring = false;

  start(intervalMs = 1000): void {
    if (this.monitoring) return;
    this.monitoring = true;

    this.gcIntervalId = setInterval(() => this.checkGC(), intervalMs);
  }

  stop(): void {
    if (this.gcIntervalId) {
      clearInterval(this.gcIntervalId);
      this.gcIntervalId = undefined;
    }
    this.monitoring = false;
  }

  private handleGC(data: any): void {
    const before = this.lastMemory ?? getMemoryUsage();
    const after = getMemoryUsage();
    const type = this.detectGCType(data);

    const event: GCEvent = {
      type,
      before,
      after,
      duration: data?.duration ?? 0,
      timestamp: Date.now(),
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    this.lastMemory = after;
  }

  private checkGC(): void {
    const current = getMemoryUsage();
    if (this.lastMemory && current.heapUsed < this.lastMemory.heapUsed) {
      const freed = this.lastMemory.heapUsed - current.heapUsed;
      this.handleGC({ duration: 0, freed });
    }
    this.lastMemory = current;
  }

  private detectGCType(data: any): GCEvent['type'] {
    if (!data) return 'unknown';
    if (data.type === 'young' || data.generation === 0) return 'young';
    if (data.type === 'old' || data.generation > 0) return 'old';
    if (data.type === 'full') return 'full';
    if (data.type === 'incremental') return 'incremental';
    return 'unknown';
  }

  getEvents(): GCEvent[] {
    return [...this.events];
  }

  getTotalGCCount(): number {
    return this.events.length;
  }

  getTotalFreedMemory(): number {
    return this.events.reduce((sum, event) => {
      return sum + (event.before.heapUsed - event.after.heapUsed);
    }, 0);
  }

  clear(): void {
    this.events = [];
  }
}

export class MemoryManager extends EventEmitter {
  private sampler: MemorySampler;
  private allocator: MemoryAllocator;
  private gcCollector: GCCollector;
  private thresholds: MemoryThreshold;
  private currentPressure: MemoryPressureState = {
    level: 'normal',
    timestamp: Date.now(),
  };
  private pressureCallbacks: Map<string, (state: MemoryPressureState) => void> = new Map();
  private cleanupFunctions: Array<() => void> = [];
  private monitoring = false;

  constructor(thresholds?: Partial<MemoryThreshold>) {
    super();
    this.thresholds = { ...DEFAULT_MEMORY_THRESHOLDS, ...thresholds };
    this.sampler = new MemorySampler();
    this.allocator = new MemoryAllocator();
    this.gcCollector = new GCCollector();
  }

  startMonitoring(intervalMs = 5000): void {
    if (this.monitoring) return;
    this.monitoring = true;

    this.sampler.start(intervalMs);
    this.gcCollector.start(intervalMs);

    this.emit('monitoringStarted');
  }

  stopMonitoring(): void {
    if (!this.monitoring) return;
    this.monitoring = false;

    this.sampler.stop();
    this.gcCollector.stop();

    this.emit('monitoringStopped');
  }

  getUsage(): MemoryUsage {
    return getMemoryUsage();
  }

  getMetrics(): MemoryMetrics {
    const samples = this.sampler.getSamples();
    const peak = samples.reduce(
      (max, sample) => (sample.heapUsed > max.heapUsed ? sample : max),
      getMemoryUsage()
    );

    return {
      current: getMemoryUsage(),
      peak,
      average: this.sampler.getAverage(),
      samples: samples.length,
      gcCount: this.gcCollector.getTotalGCCount(),
    };
  }

  getPressureLevel(): MemoryPressureState {
    const usage = getMemoryUsage();
    const heapUsed = usage.heapUsed;

    let level: MemoryPressureState['level'];
    let action: string | undefined;

    if (heapUsed >= this.thresholds.fatal) {
      level = 'fatal';
      action = 'EMERGENCY: Immediate action required';
    } else if (heapUsed >= this.thresholds.critical) {
      level = 'critical';
      action = 'Run garbage collection, clear caches';
    } else if (heapUsed >= this.thresholds.warning) {
      level = 'warning';
      action = 'Monitor closely, prepare cleanup';
    } else {
      level = 'normal';
    }

    const newState: MemoryPressureState = {
      level,
      timestamp: Date.now(),
      action,
    };

    if (newState.level !== this.currentPressure.level) {
      this.currentPressure = newState;
      this.emit('pressureChanged', newState);

      this.pressureCallbacks.forEach((callback) => {
        callback(newState);
      });
    }

    return newState;
  }

  registerPressureCallback(id: string, callback: (state: MemoryPressureState) => void): void {
    this.pressureCallbacks.set(id, callback);
  }

  unregisterPressureCallback(id: string): void {
    this.pressureCallbacks.delete(id);
  }

  triggerGC(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).gc();
      this.emit('gcTriggered');
    }
  }

  forceFullGC(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof globalThis !== 'undefined') {
      for (let i = 0; i < 3; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((globalThis as any).gc) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globalThis as any).gc();
        }
      }
      this.emit('fullGCTriggered');
    }
  }

  takeSnapshot(): MemorySnapshot {
    return this.allocator.snapshot();
  }

  compareSnapshots(
    snapshot1: MemorySnapshot,
    snapshot2: MemorySnapshot
  ): {
    heapUsedDiff: number;
    heapTotalDiff: number;
    externalDiff: number;
    allocationsDiff: number;
  } {
    return {
      heapUsedDiff: snapshot2.usage.heapUsed - snapshot1.usage.heapUsed,
      heapTotalDiff: snapshot2.usage.heapTotal - snapshot1.usage.heapTotal,
      externalDiff: snapshot2.usage.external - snapshot1.usage.external,
      allocationsDiff: snapshot2.allocations.length - snapshot1.allocations.length,
    };
  }

  allocate(id: string, size: number, tag?: string): number {
    return this.allocator.allocate(size, tag);
  }

  deallocate(allocationId: number): boolean {
    return this.allocator.deallocate(allocationId);
  }

  getAllocationInfo(allocationId: number): MemoryAllocation | undefined {
    return this.allocator.getAllocation(allocationId);
  }

  getAllocationStats(): {
    totalAllocated: number;
    allocationCount: number;
    byTag: Record<string, number>;
  } {
    return {
      totalAllocated: this.allocator.getTotalAllocated(),
      allocationCount: this.allocator.getAllocationCount(),
      byTag: this.allocator.getAllocationsByTag(),
    };
  }

  registerCleanup(fn: () => void): void {
    this.cleanupFunctions.push(fn);
  }

  unregisterCleanup(fn: () => void): void {
    const index = this.cleanupFunctions.indexOf(fn);
    if (index !== -1) {
      this.cleanupFunctions.splice(index, 1);
    }
  }

  performCleanup(): void {
    this.emit('cleanupStarted');

    for (const fn of this.cleanupFunctions) {
      try {
        fn();
      } catch (error) {
        this.emit('cleanupError', error);
      }
    }

    this.allocator.clear();
    this.sampler.clear();

    this.emit('cleanupCompleted');
  }

  cleanupAndRestart(): void {
    this.performCleanup();
    this.triggerGC();
    this.emit('restarted');
  }

  getGCEvents(): GCEvent[] {
    return this.gcCollector.getEvents();
  }

  getGCCount(): number {
    return this.gcCollector.getTotalGCCount();
  }

  getTotalFreedByGC(): number {
    return this.gcCollector.getTotalFreedMemory();
  }

  enableAllocationTracking(): void {
    this.allocator.enableTracking();
  }

  disableAllocationTracking(): void {
    this.allocator.disableTracking();
  }

  isAllocationTrackingEnabled(): boolean {
    return false;
  }

  getMemoryDistribution(): {
    heapUsed: number;
    heapFree: number;
    external: number;
    rss: number;
  } {
    const usage = getMemoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapFree: usage.heapTotal - usage.heapUsed,
      external: usage.external,
      rss: usage.rss,
    };
  }

  isHealthy(): boolean {
    return this.getPressureLevel().level === 'normal';
  }

  needsAttention(): boolean {
    const level = this.getPressureLevel().level;
    return level === 'warning' || level === 'critical';
  }

  isCritical(): boolean {
    return (
      this.getPressureLevel().level === 'critical' || this.getPressureLevel().level === 'fatal'
    );
  }

  destroy(): void {
    this.stopMonitoring();
    this.performCleanup();
    this.pressureCallbacks.clear();
    this.cleanupFunctions = [];
    this.removeAllListeners();
  }
}

export function getMemoryUsage(): MemoryUsage {
  const baseUsage: MemoryUsage = {
    heapUsed: 0,
    heapTotal: 0,
    heapReserved: 0,
    external: 0,
    arrayBuffers: 0,
    rss: 0,
    timestamp: Date.now(),
  };

  if (typeof globalThis !== 'undefined' && (globalThis as any).memoryUsage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem = (globalThis as any).memoryUsage();
    baseUsage.heapUsed = mem.heapUsed;
    baseUsage.heapTotal = mem.heapTotal;
    baseUsage.external = mem.external;
    baseUsage.arrayBuffers = mem.arrayBuffers || 0;
    baseUsage.rss = mem.rss;
    baseUsage.heapReserved = mem.heapTotal;
  }

  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const perfMemory = (performance as any).memory;
    baseUsage.heapUsed = perfMemory.usedJSHeapSize || baseUsage.heapUsed;
    baseUsage.heapTotal = perfMemory.totalJSHeapSize || baseUsage.heapTotal;
    baseUsage.heapReserved = perfMemory.jsHeapSizeLimit || baseUsage.heapReserved;
  }

  return baseUsage;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  return `${(bytes / Math.pow(k, index)).toFixed(dm)} ${sizes[index]}`;
}

export function formatBytesPerSecond(bytes: number): string {
  return `${formatBytes(bytes)}/s`;
}

export function isMemoryPressure(thresholdMB = 512): boolean {
  const mem = getMemoryUsage();
  return mem.heapUsed > thresholdMB * 1024 * 1024;
}

export function calculateMemoryUsagePercentage(): number {
  const mem = getMemoryUsage();
  if (mem.heapTotal === 0) return 0;
  return (mem.heapUsed / mem.heapTotal) * 100;
}

export function getAvailableMemory(): number {
  const mem = getMemoryUsage();
  return mem.heapTotal - mem.heapUsed;
}

export function isLowMemory(thresholdMB = 100): boolean {
  return getAvailableMemory() < thresholdMB * 1024 * 1024;
}

export function estimateObjectSize(obj: any): number {
  if (obj === null || obj === undefined) return 0;

  if (typeof obj === 'string') {
    return obj.length * 2;
  }

  if (typeof obj === 'number') return 8;
  if (typeof obj === 'boolean') return 4;

  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + estimateObjectSize(item), 0);
  }

  if (typeof obj === 'object') {
    let size = 0;
    for (const key of Object.keys(obj)) {
      size += key.length * 2;
      size += estimateObjectSize(obj[key]);
    }
    return size;
  }

  return 0;
}

export function createMemoryManager(thresholds?: Partial<MemoryThreshold>): MemoryManager {
  return new MemoryManager(thresholds);
}

export const defaultMemoryManager = new MemoryManager();

export { MemorySampler, MemoryAllocator, GCCollector };
