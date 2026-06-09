"use strict";
exports.__esModule = true;
exports.perplexityModels = exports.perplexityProvider = void 0;
exports.perplexityProvider = {
    name: 'perplexity',
    displayName: 'Perplexity AI',
    baseURL: 'https://api.perplexity.ai/v1',
    models: [
        {
            id: 'sonar-pro',
            name: 'Sonar Pro',
            description: 'Research-focused with web access',
            contextLength: 16384,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'reasoning', 'web-search']
        },
        {
            id: 'sonar',
            name: 'Sonar',
            description: 'Efficient research model',
            contextLength: 16384,
            costPer1kTokens: 0.001,
            capabilities: ['chat', 'web-search']
        },
        {
            id: 'sonar-small',
            name: 'Sonar Small',
            description: 'Fast research model',
            contextLength: 16384,
            costPer1kTokens: 0.0002,
            capabilities: ['chat', 'web-search']
        },
    ],
    defaultModel: 'sonar-pro'
};
exports.perplexityModels = exports.perplexityProvider.models;
