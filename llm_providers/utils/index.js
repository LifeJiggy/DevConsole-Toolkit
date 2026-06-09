export { withRetry, createRetryManager, RetryManager } from './retry.js';
export {
  ApiError,
  AuthenticationError,
  RateLimitError,
  ErrorAggregator,
} from './error.js';
export {
  fetchWithTimeout,
  AdvancedFetch,
  createFetch,
} from './fetchWithTimeout.js';
export { TimeoutManager, createTimeoutManager } from './timeout-config.js';
export { MemoryManager, getMemoryUsage, formatBytes } from './memory.js';
export {
  ConnectionPool,
  ConnectionPoolManager,
  createPool,
} from './connection-pooling.js';
export {
  StreamProcessor,
  parseStreamResponse,
  collectStream,
} from './stream.js';
export { findLastIndex, findLast } from './array.js';
export { LanguageDetector, SUPPORTED_LANGUAGES } from './language.js';
export {
  mentionRegex,
  mentionRegexGlobal,
  commandRegexGlobal,
  formatGitSuggestion,
} from './context-mentions.js';
export {
  EMBEDDING_MODEL_PROFILES,
  getModelDimension,
  getModelScoreThreshold,
  getModelQueryPrefix,
  getDefaultModelId,
} from './embeddingModels.js';
export { AuthService } from './AuthService.js';
export {
  ERROR_DEFINITIONS,
  getErrorDefinition,
  ERROR_CODES,
} from './ErrorModels.js';
export { errorProviderFactory } from './ErrorProviderFactory.js';
export { ErrorService } from './ErrorService.js';
export type { HistoryItem, ConversationHistory } from './HistoryItem.js';
export { createHistoryItem, createConversation } from './HistoryItem.js';
export {
  BaseStrategy,
  FallbackStrategy,
  RetryStrategy,
} from './base-strategy.js';
export {
  validateApiConfig,
  maskApiKey,
  isValidUrl,
} from './checkExistApiConfig.js';
export { RequestCombiner, combineRequests } from './combineApiRequests.js';
export {
  ProviderException,
  ValidationException,
  ConfigurationException,
} from './exception.js';
export { ComplexFormatter, formatComplex } from './format-complex.js';
export { HardFormatter, formatHard } from './format-hard.js';
export { SimpleFormatter, formatSimple } from './format-simple.js';
export { ApiMetricsCollector, apiMetricsCollector } from './getApiMetrics.js';
export { MultiPointStrategy } from './multi-point-strategy.js';

export type {
  Model,
  ChatMessage,
  ChatCompletionRequest,
  Provider,
  Config,
} from './types.js';

export {
  ReasoningEngine,
  reasoningEngine,
  isReasoningModel,
  getReasoningConfig,
  supportsThinking,
  supportsChainOfThought,
  calculateReasoningCost,
} from './reasoning.js';
export type {
  ReasoningModel,
  ReasoningConfig,
  ReasoningResult,
} from './reasoning.js';

export {
  createApiResponse,
  createErrorResponse,
  isApiResponse,
  isSuccessResponse,
  isErrorResponse,
  createNotFoundResponse,
  createRateLimitResponse,
  ApiResponseBuilder,
  createPaginatedResponse,
  isPaginatedResponse,
} from './api-repsonse.js';
export type {
  ApiResponseMetadata,
  PaginatedResponse,
  PaginationInfo,
  ErrorDetails,
} from './api-repsonse.js';

export {
  registerModelRule,
  getModelRule,
  isModelAllowed,
  supportsStreamingModel,
  supportsVisionModel,
  getModelTier,
  calculateCost,
  validateModelRule,
  createDefaultRules,
} from './model-rules.js';
export type {
  ModelRule,
  ModelCapabilities,
  RateLimitConfig,
  PricingInfo,
  ModelTier,
} from './model-rules.js';

export {
  ConnectionManager,
  createConnectionManager,
  getConnectionState,
  markConnected,
  markDisconnected,
  isConnected,
  isHealthy,
  getHealthScore,
  getActiveProviders,
  getAllProviders,
} from './connection-managements.js';
export type {
  ConnectionState,
  ConnectionMetrics,
  ConnectionConfig,
} from './connection-managements.js';

export {
  ProviderStateManager,
  createProviderStateManager,
  getProviderStatus,
  setProviderState,
  recordSuccess,
  recordFailure,
  getProviderMetrics,
} from './providers-states.js';
export type {
  ProviderState,
  ProviderTier,
  ProviderMetrics,
  StateTransition,
} from './providers-states.js';

export {
  mergeParams,
  validateParams,
  normalizeParams,
  validateAndNormalize,
  toApiFormat,
  ModelParamsBuilder,
  createParams,
} from './model-params.js';
export type { ValidationResult } from './model-params.js';

export {
  ConnectionProber,
  createProber,
  probeEndpoint,
  probeProviders,
  probeWithHealthCheck,
  continuousHealthCheck,
  analyzeProbeData,
} from './connection-probing.js';
export type {
  ProbeResult,
  ProbeOptions,
  ProbeSummary,
  HealthCheckConfig,
} from './connection-probing.js';

export {
  RequestIdManager,
  createIdGenerator,
  generateRequestId,
  generateTraceId,
  generateSessionId,
  createRequestContext,
  createTraceContext,
  setSessionId,
  getSessionId,
} from './request-id.js';
export type { RequestIdConfig, TraceContext } from './request-id.js';

export {
  Exception,
  RateLimitException,
  AuthenticationException,
  NetworkException,
  TimeoutException,
  isException,
  isRetryableError,
  wrapError,
  formatError,
  ExceptionHandler,
  createExceptionHandler,
} from './exception.js';

export {
  MultiLanguageDetector,
  createLanguageDetector,
  detectLanguage,
  isSupportedLanguage,
  getLanguageInfo,
  getLanguageName,
  isRightToLeft,
  getTextDirection,
  normalizeLanguageCode,
} from './language.js';
export type {
  LanguageDetectorOptions,
  DetectionResult,
  LanguageInfo,
} from './language.js';

export {
  combineRequestsWithPriority,
  groupByProvider,
  groupByModel,
  createBatchRequest,
  validateBatchRequest,
  estimateBatchCost,
  getBatchStatistics,
} from './combineApiRequests.js';
export type {
  BatchRequest,
  BatchResult,
  BatchConfig,
  BatchMetrics,
} from './combineApiRequests.js';

export {
  formatJson,
  formatCompact,
  formatSafe,
  formatTable,
  formatTree,
  formatDiff,
  truncateMiddle,
  formatDuration,
  formatPercentage,
  formatNumber,
  formatCurrency,
  formatPhone,
  FormatterBuilder,
  createFormatter,
} from './format-hard.js';
export type { HardFormatOptions, FormatStatistics } from './format-hard.js';

export {
  truncate,
  slugify,
  capitalize,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  stripHtml,
  stripEmojis,
  maskEmail,
  maskPhone,
  pluralize,
  formatList,
  template,
  extractUrls,
  extractEmails,
  TextFormatter,
  createFormatter as createTextFormatter,
} from './format-simple.js';
export type { SimpleFormatOptions } from './format-simple.js';

export {
  saveConversation,
  loadConversation,
  deleteConversation,
  getAllConversations,
  setCurrentConversation,
  getCurrentConversation,
  clearAllConversations,
  ConversationManager,
} from './HistoryItem.js';
export type {
  ConversationSummary,
  MessageFilter,
  HistoryPagination,
} from './HistoryItem.js';

export {
  getAllApiConfigs,
  getEnabledProviders,
  setApiConfig as configureApiConfig,
  removeApiConfig,
  getApiKey,
  getBaseUrl,
  isProviderEnabled,
  enableProvider,
  disableProvider,
  validateAllConfigs,
  clearAllConfigs,
  exportConfigs,
  importConfigs,
  ApiConfigManager,
  createApiConfigManager,
} from './checkExistApiConfig.js';
export type {
  ApiConfig,
  ConfigValidationResult,
  ProviderCredentials,
} from './checkExistApiConfig.js';

export {
  ErrorProviderRegistry,
  createErrorProviderRegistry,
  createError,
  isRetryable,
  getRetryDelay,
  getErrorCode,
  shouldRetry,
  calculateBackoffDelay,
} from './ErrorProviderFactory.js';
export type { ErrorProvider } from './ErrorProviderFactory.js';

export {
  logError,
  getErrorLogs,
  getErrorSummary,
  resolveError,
  clearErrors,
  createErrorService,
} from './ErrorService.js';
export type {
  ErrorLog,
  ErrorSummary,
  ErrorFilter,
  ErrorStats,
} from './ErrorService.js';
