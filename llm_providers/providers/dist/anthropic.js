"use strict";
exports.__esModule = true;
exports.anthropicModels = exports.anthropicProvider = void 0;
exports.anthropicProvider = {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    baseURL: 'https://api.anthropic.com/v1',
    models: [
        {
            id: 'claude-3-5-sonnet-20241022',
            name: 'Claude 3.5 Sonnet',
            description: 'Excellent for coding and complex reasoning',
            contextLength: 200000,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'reasoning', 'vision']
        },
        {
            id: 'claude-3-5-haiku-20241022',
            name: 'Claude 3.5 Haiku',
            description: 'Fast and responsive model',
            contextLength: 200000,
            costPer1kTokens: 0.00025,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'claude-3-opus-20240229',
            name: 'Claude 3 Opus',
            description: 'Most capable model for complex tasks',
            contextLength: 200000,
            costPer1kTokens: 0.015,
            capabilities: ['chat', 'code', 'reasoning', 'vision', 'analysis']
        },
        {
            id: 'claude-3-haiku-20240307',
            name: 'Claude 3 Haiku',
            description: 'Fast and lightweight',
            contextLength: 200000,
            costPer1kTokens: 0.00025,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'claude-3-5-sonnet-20241022'
};
exports.anthropicModels = exports.anthropicProvider.models;
