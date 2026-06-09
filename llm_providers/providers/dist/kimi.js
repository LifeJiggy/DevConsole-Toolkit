"use strict";
exports.__esModule = true;
exports.kimiModels = exports.kimiProvider = void 0;
exports.kimiProvider = {
    name: 'kimi',
    displayName: 'Kimi (Moonshot AI)',
    baseURL: 'https://api.moonshot.cn/v1',
    models: [
        {
            id: 'moonshot-v1-8k',
            name: 'Kimi 8K',
            description: 'Short context model',
            contextLength: 8192,
            costPer1kTokens: 0.00012,
            capabilities: ['chat']
        },
        {
            id: 'moonshot-v1-32k',
            name: 'Kimi 32K',
            description: 'Medium context model',
            contextLength: 32768,
            costPer1kTokens: 0.00024,
            capabilities: ['chat', 'code']
        },
        {
            id: 'moonshot-v1-128k',
            name: 'Kimi 128K',
            description: 'Large context model',
            contextLength: 131072,
            costPer1kTokens: 0.0006,
            capabilities: ['chat', 'code', 'long-context']
        },
    ],
    defaultModel: 'moonshot-v1-128k'
};
exports.kimiModels = exports.kimiProvider.models;
