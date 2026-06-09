"use strict";
exports.__esModule = true;
exports.openaiModels = exports.openaiProvider = void 0;
exports.openaiProvider = {
    name: 'openai',
    displayName: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: [
        {
            id: 'gpt-4o',
            name: 'GPT-4o',
            description: 'Omni model for text, vision, and audio',
            contextLength: 128000,
            costPer1kTokens: 0.005,
            capabilities: ['chat', 'vision', 'audio', 'code']
        },
        {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            description: 'Cost-effective omni model',
            contextLength: 128000,
            costPer1kTokens: 0.00015,
            capabilities: ['chat', 'vision', 'code']
        },
        {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            description: 'High capability with large context',
            contextLength: 128000,
            costPer1kTokens: 0.01,
            capabilities: ['chat', 'vision', 'code', 'function-calling']
        },
        {
            id: 'gpt-4',
            name: 'GPT-4',
            description: 'Previous generation flagship model',
            contextLength: 8192,
            costPer1kTokens: 0.03,
            capabilities: ['chat', 'code']
        },
        {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            description: 'Fast and cost-effective model',
            contextLength: 16385,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'gpt-4o'
};
exports.openaiModels = exports.openaiProvider.models;
