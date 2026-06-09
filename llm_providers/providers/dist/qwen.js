"use strict";
exports.__esModule = true;
exports.qwenModels = exports.qwenProvider = void 0;
exports.qwenProvider = {
    name: 'qwen',
    displayName: 'Qwen (Alibaba)',
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    models: [
        {
            id: 'qwen-turbo',
            name: 'Qwen Turbo',
            description: 'Fast and efficient',
            contextLength: 16384,
            costPer1kTokens: 0.0002,
            capabilities: ['chat', 'code']
        },
        {
            id: 'qwen-plus',
            name: 'Qwen Plus',
            description: 'Balanced performance',
            contextLength: 32768,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code', 'vision']
        },
        {
            id: 'qwen-max',
            name: 'Qwen Max',
            description: 'Flagship model',
            contextLength: 32768,
            costPer1kTokens: 0.001,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'qwen-coder-turbo',
            name: 'Qwen Coder Turbo',
            description: 'Code-specialized',
            contextLength: 32768,
            costPer1kTokens: 0.0003,
            capabilities: ['chat', 'code']
        },
        {
            id: 'qwen-max-longcontext',
            name: 'Qwen Max Long',
            description: 'Large context model',
            contextLength: 131072,
            costPer1kTokens: 0.002,
            capabilities: ['chat', 'code', 'long-context']
        },
    ],
    defaultModel: 'qwen-plus'
};
exports.qwenModels = exports.qwenProvider.models;
