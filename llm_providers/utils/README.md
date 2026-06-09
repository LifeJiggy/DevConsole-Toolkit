# Providers Utils

Production-grade utility modules for the Grok-Code CLI provider system. Built to handle 1M+ users with enterprise reliability.

## Overview

The `utils` folder contains 40+ modules providing core infrastructure capabilities:

- **Async & Retry**: Retry logic, circuit breakers, timeout management
- **HTTP & Networking**: Fetch with timeout, connection pooling, health probing
- **Memory & Performance**: Memory management, GC tracking, performance metrics
- **Error Handling**: Comprehensive error types, aggregation, provider-specific errors
- **Data Processing**: Streaming, formatting, language detection
- **Provider Management**: API configuration, authentication, metrics

## Modules

### Core Infrastructure

| Module                  | Lines  | Description                                                                                                                        |
| ----------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `retry.ts`              | 19,790 | Advanced retry with exponential backoff, Fibonacci, polynomial strategies. Includes circuit breaker, priority queue, rate limiting |
| `error.ts`              | 18,629 | Full error hierarchy with categorization, severity levels, aggregation, context tracking                                           |
| `fetchWithTimeout.ts`   | 21,662 | Advanced HTTP client with retry, caching, progress tracking, interceptors                                                          |
| `timeout-config.ts`     | 19,243 | Dynamic timeout management with adaptive timeouts, rules engine                                                                    |
| `connection-pooling.ts` | 18,970 | Connection pool with health checks, warmup, rebalancing                                                                            |
| `memory.ts`             | 16,900 | Memory monitoring, GC events, allocation tracking, snapshots                                                                       |
| `stream.ts`             | 16,757 | SSE/stream parsing with metrics, transformers, async iterators                                                                     |

### Networking

| Module                      | Description                                                                   |
| --------------------------- | ----------------------------------------------------------------------------- |
| `connection-pooling.ts`     | Connection pool with min/max connections, health checks, lifecycle management |
| `connection-managements.ts` | Connection state tracking                                                     |
| `connection-probing.ts`     | Endpoint health probing                                                       |

### Error Handling

| Module                    | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `error.ts`                | Base ApiError with categories (auth, rate_limit, network, server), severity levels |
| `ErrorModels.ts`          | Standardized error codes and definitions                                           |
| `ErrorProviderFactory.ts` | Provider-specific error handling (OpenAI, Anthropic, Google, Azure)                |
| `ErrorService.ts`         | Error logging, aggregation, resolution tracking                                    |
| `exception.ts`            | Custom exceptions (ProviderException, ValidationException, etc.)                   |

### Data & Formatting

| Module                | Description                                 |
| --------------------- | ------------------------------------------- |
| `stream.ts`           | SSE parsing, chunk processing, metrics      |
| `format-complex.ts`   | Complex object formatting with metadata     |
| `format-hard.ts`      | Strict HTML-escaped formatting              |
| `format-simple.ts`    | Simple string/number formatting             |
| `language.ts`         | Language detection using pattern matching   |
| `context-mentions.ts` | @mention and /command regex parsing         |
| `embeddingModels.ts`  | Embedding model profiles and configurations |

### Provider Management

| Module                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `AuthService.ts`         | API key authentication, token refresh, scheduling |
| `checkExistApiConfig.ts` | API configuration validation                      |
| `getApiMetrics.ts`       | Request metrics, latency percentiles              |
| `providers-states.ts`    | Provider status tracking                          |

### Strategies

| Module                    | Description                                 |
| ------------------------- | ------------------------------------------- |
| `base-strategy.ts`        | Abstract strategy pattern (Fallback, Retry) |
| `multi-point-strategy.ts` | Multi-provider execution with weights       |
| `circuit-breaker.ts`      | Circuit breaker implementation              |

### Utilities

| Module            | Description                               |
| ----------------- | ----------------------------------------- |
| `array.ts`        | Array utilities (findLast, findLastIndex) |
| `model-params.ts` | Model parameter validation and defaults   |
| `model-rules.ts`  | Model rules and restrictions              |
| `reasoning.ts`    | Reasoning model detection                 |
| `types.ts`        | TypeScript types for the provider system  |
| `HistoryItem.ts`  | Conversation history management           |
| `request-id.ts`   | Request ID generation                     |

## Usage Examples

### Retry with Circuit Breaker

```typescript
import { RetryManager } from "./retry.js";

const retryManager = new RetryManager({
  maxAttempts: 3,
  strategy: "exponential-fibonacci",
  jitter: true,
});

const result = await retryManager.withRetry(() => fetch("/api/data"), {
  circuitBreakerKey: "api",
});
```

### Advanced Fetch

```typescript
import { AdvancedFetch } from "./fetchWithTimeout.js";

const client = new AdvancedFetch("https://api.example.com", {
  Authorization: "Bearer token",
});

const response = await client.fetch("/endpoint", {
  timeout: 30000,
  retryOptions: { maxAttempts: 3 },
  cache: "force-cache",
  cacheTTL: 300000,
});
```

### Connection Pool

```typescript
import { ConnectionPool } from "./connection-pooling.js";

const pool = new ConnectionPool(
  {
    async create() {
      return await createConnection();
    },
  },
  {
    maxConnections: 10,
    minConnections: 2,
  },
);

await pool.initialize();
const conn = await pool.acquire();
await pool.release(conn);
```

### Error Handling

```typescript
import { ApiError, ErrorAggregator } from "./error.js";

try {
  await makeRequest();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.category === "rate_limit") {
      const waitMs = error.retryAfter * 1000;
    }
  }
}

const aggregator = new ErrorAggregator();
aggregator.addFromUnknown(error);
console.log(aggregator.getSummary());
```

### Timeout Management

```typescript
import { TimeoutManager } from "./timeout-config.js";

const tm = new TimeoutManager();

const result = await tm.withTimeout(() => fetch("/api"), 30000, "request", {
  provider: "openai",
});
```

### Memory Monitoring

```typescript
import { MemoryManager } from "./memory.js";

const mm = new MemoryManager({
  warning: 512 * 1024 * 1024,
  critical: 1024 * 1024 * 1024,
});

mm.startMonitoring(5000);
mm.on("pressureChanged", (state) => {
  console.log(`Memory pressure: ${state.level}`);
});
```

### Stream Processing

```typescript
import { StreamProcessor } from "./stream.js";

const processor = new StreamProcessor({
  onChunk: (chunk) => {
    process.stdout.write(chunk.content);
  },
});

await processor.process(response);
```

## Architecture

```
utils/
├── Core (Retry, Error, Fetch, Timeout, Pool, Memory, Stream)
├── Networking (Connection Pool, Probing, Management)
├── Error Handling (Errors, Models, Factory, Service)
├── Data Processing (Stream, Format, Language, Embeddings)
├── Provider Management (Auth, Config, Metrics, States)
├── Strategies (Base, Multi-point, Circuit Breaker)
└── Utilities (Array, Types, History, etc.)
```

## Features

- **Zero external dependencies** - Built with native APIs
- **Full TypeScript** - Complete type coverage
- **Event-driven** - Extensible EventEmitter base classes
- **Metrics & Monitoring** - Built-in observability
- **Production-ready** - Circuit breakers, pools, adaptive timeouts
- **1M+ users scale** - Designed for high concurrency

## License

MIT
