# Contributing to Providers Utils

Thank you for contributing to the Grok-Code CLI provider system. This guide covers how to add new utilities and maintain code quality.

## Guidelines

### Code Standards

1. **Zero Dependencies** - Use only native APIs (fetch, EventEmitter, etc.)
2. **Full TypeScript** - All code must be typed
3. **Production Grade** - Handle edge cases, errors, metrics
4. **Event-Driven** - Extend EventEmitter for extensibility
5. **Metrics** - Include metrics collection in core modules

### Module Structure

Each utility module should follow this pattern:

```typescript
import { EventEmitter } from "events";

export interface ModuleOptions {
  // Configuration interface
}

export interface ModuleMetrics {
  // Metrics interface
}

export class ModuleClass extends EventEmitter {
  constructor(private options: ModuleOptions) {
    super();
  }

  // Core methods
  async execute(): Promise<any> {
    // Implementation
  }

  // Cleanup
  destroy(): void {
    this.removeAllListeners();
  }
}
```

### Adding New Utilities

1. Create new file in `utils/`
2. Implement with proper interfaces and types
3. Export from `index.ts`
4. Add tests
5. Update README.md

### Naming Conventions

- **Files**: kebab-case (e.g., `connection-pooling.ts`)
- **Classes**: PascalCase (e.g., `ConnectionPool`)
- **Interfaces**: PascalCase with descriptive names (e.g., `PoolConfig`)
- **Methods**: camelCase (e.g., `acquireConnection`)

### Required Features

For production-grade modules, include:

- [ ] TypeScript interfaces for all inputs/outputs
- [ ] EventEmitter base for extensibility
- [ ] Metrics collection
- [ ] Error handling with proper types
- [ ] Cleanup/destroy methods
- [ ] JSDoc comments for public APIs

### Error Handling

Use the error hierarchy from `error.ts`:

```typescript
import { ApiError } from "./error.js";

throw new ApiError({
  message: "Failed to connect",
  status: 503,
  code: "CONNECTION_FAILED",
  category: "network",
  retryable: true,
});
```

### Testing

Run tests:

```bash
npm test
```

### Line Count Guidelines

- Core modules: 15,000+ lines
- Supporting modules: 1,000+ lines
- Utility modules: 500+ lines

## Module Categories

### Core Infrastructure

- `retry.ts` - Retry strategies
- `error.ts` - Error handling
- `fetchWithTimeout.ts` - HTTP client
- `timeout-config.ts` - Timeout management
- `connection-pooling.ts` - Connection pools
- `memory.ts` - Memory management
- `stream.ts` - Stream processing

### Networking

- `connection-pooling.ts`
- `connection-managements.ts`
- `connection-probing.ts`

### Error Handling

- `error.ts`
- `ErrorModels.ts`
- `ErrorProviderFactory.ts`
- `ErrorService.ts`
- `exception.ts`

### Data Processing

- `stream.ts`
- `format-complex.ts`
- `format-hard.ts`
- `format-simple.ts`
- `language.ts`
- `context-mentions.ts`
- `embeddingModels.ts`

### Provider Management

- `AuthService.ts`
- `checkExistApiConfig.ts`
- `getApiMetrics.ts`
- `providers-states.ts`

### Strategies

- `base-strategy.ts`
- `multi-point-strategy.ts`
- `circuit-breaker.ts`

## Common Patterns

### Retry Pattern

```typescript
import { RetryManager } from "./retry.js";

const manager = new RetryManager({
  maxAttempts: 3,
  strategy: "exponential",
  jitter: true,
});
```

### Pool Pattern

```typescript
import { ConnectionPool } from "./connection-pooling.js";

const pool = new ConnectionPool(factory, {
  maxConnections: 10,
  minConnections: 2,
});
await pool.initialize();
```

### Error Aggregation

```typescript
import { ErrorAggregator } from "./error.js";

const aggregator = new ErrorAggregator();
aggregator.add(error);
const summary = aggregator.getSummary();
```

## Questions?

Open an issue at https://github.com/Kilo-Org/grok-code-cli/issues
