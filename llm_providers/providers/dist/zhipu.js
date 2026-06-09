"use strict";
exports.__esModule = true;
exports.zhipuModels = exports.zhipuProvider = void 0;
exports.zhipuProvider = {
    name: 'zhipu',
    displayName: 'Zhipu AI (智谱AI)',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
        {
            id: 'glm-4-plus',
            name: 'GLM-4 Plus',
            description: 'Flagship Chinese model',
            contextLength: 128000,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code', 'vision']
        },
        {
            id: 'glm-4',
            name: 'GLM-4',
            description: 'General purpose Chinese model',
            contextLength: 128000,
            costPer1kTokens: 0.00035,
            capabilities: ['chat', 'code']
        },
        {
            id: 'glm-4v',
            name: 'GLM-4V',
            description: 'Vision-capable model',
            contextLength: 8192,
            costPer1kTokens: 0.0007,
            capabilities: ['chat', 'vision']
        },
        {
            id: 'glm-3-turbo',
            name: 'GLM-3 Turbo',
            description: 'Fast Chinese model',
            contextLength: 16384,
            costPer1kTokens: 0.00005,
            capabilities: ['chat']
        },
    ],
    defaultModel: 'glm-4-plus'
};
exports.zhipuModels = exports.zhipuProvider.models;
