"use strict";
exports.__esModule = true;
exports.openrouterModels = exports.openrouterProvider = void 0;
exports.openrouterProvider = {
    name: 'openrouter',
    displayName: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
        {
            id: 'anthropic/claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet (OR)',
            description: 'Via OpenRouter proxy',
            contextLength: 200000,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'openai/gpt-4o',
            name: 'GPT-4o (OR)',
            description: 'Via OpenRouter proxy',
            contextLength: 128000,
            costPer1kTokens: 0.005,
            capabilities: ['chat', 'vision', 'code']
        },
        {
            id: 'google/gemini-1.5-pro',
            name: 'Gemini 1.5 Pro (OR)',
            description: 'Via OpenRouter proxy',
            contextLength: 2000000,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'vision', 'code', 'audio']
        },
        {
            id: 'meta-llama/llama-3.1-405b-instruct',
            name: 'Llama 3.1 405B (OR)',
            description: 'Via OpenRouter proxy',
            contextLength: 131072,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'anthropic/claude-3.5-sonnet'
};
exports.openrouterModels = exports.openrouterProvider.models;
