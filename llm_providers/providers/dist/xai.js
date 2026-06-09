"use strict";
exports.__esModule = true;
exports.xaiModels = exports.xaiProvider = void 0;
exports.xaiProvider = {
    name: 'xai',
    displayName: 'xAI (Grok)',
    baseURL: 'https://api.x.ai/v1',
    models: [
        {
            id: 'grok-beta',
            name: 'Grok Beta',
            description: 'Latest Grok model with enhanced reasoning',
            contextLength: 131072,
            costPer1kTokens: 0.01,
            capabilities: ['chat', 'reasoning', 'code']
        },
        {
            id: 'grok-4',
            name: 'Grok 4',
            description: 'High-capability Grok model',
            contextLength: 200000,
            costPer1kTokens: 0.02,
            capabilities: ['chat', 'reasoning', 'code', 'vision']
        },
        {
            id: 'grok-3',
            name: 'Grok 3',
            description: 'Previous generation Grok model',
            contextLength: 131072,
            costPer1kTokens: 0.005,
            capabilities: ['chat', 'reasoning', 'code']
        },
    ],
    defaultModel: 'grok-beta'
};
exports.xaiModels = exports.xaiProvider.models;
