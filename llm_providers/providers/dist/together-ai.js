"use strict";
exports.__esModule = true;
exports.togetheraiModels = exports.togetheraiProvider = void 0;
exports.togetheraiProvider = {
    name: 'togetherai',
    displayName: 'Together AI',
    baseURL: 'https://api.together.ai/v1',
    models: [
        {
            id: 'meta-llama/Llama-3.1-405B-Instruct-Turbo',
            name: 'Llama 3.1 405B Turbo',
            description: 'Meta\'s largest open model',
            contextLength: 131072,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
            name: 'Llama 3.1 70B Turbo',
            description: 'Fast 70B model',
            contextLength: 131072,
            costPer1kTokens: 0.00059,
            capabilities: ['chat', 'code']
        },
        {
            id: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
            name: 'Llama 3.1 8B Turbo',
            description: 'Efficient 8B model',
            contextLength: 131072,
            costPer1kTokens: 0.00005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
            name: 'Qwen 2.5 Coder 32B',
            description: 'Alibaba\'s code model',
            contextLength: 32768,
            costPer1kTokens: 0.00028,
            capabilities: ['chat', 'code']
        },
        {
            id: 'deepseek-ai/DeepSeek-V2.5',
            name: 'DeepSeek V2.5',
            description: 'DeepSeek\'s latest model',
            contextLength: 131072,
            costPer1kTokens: 0.00014,
            capabilities: ['chat', 'code', 'reasoning']
        },
    ],
    defaultModel: 'meta-llama/Llama-3.1-70B-Instruct-Turbo'
};
exports.togetheraiModels = exports.togetheraiProvider.models;
