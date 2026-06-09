"use strict";
exports.__esModule = true;
exports.fireworksModels = exports.fireworksProvider = void 0;
exports.fireworksProvider = {
    name: 'fireworks',
    displayName: 'Fireworks AI',
    baseURL: 'https://api.fireworks.ai/v1',
    models: [
        {
            id: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
            name: 'Llama 3.1 405B',
            description: 'Meta\'s largest model via Fireworks',
            contextLength: 131072,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
            name: 'Llama 3.1 70B',
            description: 'Fast 70B model',
            contextLength: 131072,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
            name: 'Llama 3.1 8B',
            description: 'Efficient 8B model',
            contextLength: 131072,
            costPer1kTokens: 0.00005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
            name: 'Qwen 2.5 Coder 32B',
            description: 'Code-specialized model',
            contextLength: 32768,
            costPer1kTokens: 0.0002,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct'
};
exports.fireworksModels = exports.fireworksProvider.models;
