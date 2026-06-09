"use strict";
exports.__esModule = true;
exports.deepseekModels = exports.deepseekProvider = void 0;
exports.deepseekProvider = {
    name: 'deepseek',
    displayName: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    models: [
        {
            id: 'deepseek-chat',
            name: 'DeepSeek Chat',
            description: 'General purpose chat model',
            contextLength: 131072,
            costPer1kTokens: 0.00014,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'deepseek-coder',
            name: 'DeepSeek Coder',
            description: 'Code-specialized model',
            contextLength: 131072,
            costPer1kTokens: 0.00014,
            capabilities: ['chat', 'code']
        },
        {
            id: 'deepseek-reasoner',
            name: 'DeepSeek Reasoner',
            description: 'Reasoning-focused model',
            contextLength: 131072,
            costPer1kTokens: 0.00055,
            capabilities: ['chat', 'reasoning']
        },
    ],
    defaultModel: 'deepseek-chat'
};
exports.deepseekModels = exports.deepseekProvider.models;
