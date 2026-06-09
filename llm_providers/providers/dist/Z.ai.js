"use strict";
exports.__esModule = true;
exports.zaiModels = exports.zaiProvider = void 0;
exports.zaiProvider = {
    name: 'z-ai',
    displayName: 'Z.AI',
    baseURL: 'https://api.z-ai.com/v1',
    models: [
        {
            id: 'z-ai-pro',
            name: 'Z.AI Pro',
            description: 'Flagship model',
            contextLength: 131072,
            costPer1kTokens: 0.001,
            capabilities: ['chat', 'code']
        },
        {
            id: 'z-ai-lite',
            name: 'Z.AI Lite',
            description: 'Fast and efficient',
            contextLength: 32768,
            costPer1kTokens: 0.0002,
            capabilities: ['chat']
        },
    ],
    defaultModel: 'z-ai-pro'
};
exports.zaiModels = exports.zaiProvider.models;
