"use strict";
exports.__esModule = true;
exports.groqModels = exports.groqProvider = void 0;
exports.groqProvider = {
    name: 'groq',
    displayName: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    models: [
        {
            id: 'llama-3.1-70b-versatile',
            name: 'Llama 3.1 70B Versatile',
            description: 'Fast inference with large context',
            contextLength: 131072,
            costPer1kTokens: 0.00059,
            capabilities: ['chat', 'code']
        },
        {
            id: 'llama-3.1-8b-instant',
            name: 'Llama 3.1 8B Instant',
            description: 'Fast and lightweight',
            contextLength: 131072,
            costPer1kTokens: 0.00005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'llama-3.2-11b-vision-preview',
            name: 'Llama 3.2 11B Vision',
            description: 'Vision-capable model',
            contextLength: 8192,
            costPer1kTokens: 0.00018,
            capabilities: ['chat', 'vision', 'code']
        },
        {
            id: 'mixtral-8x7b-32768',
            name: 'Mixtral 8x7B',
            description: 'Mixture of experts model',
            contextLength: 32768,
            costPer1kTokens: 0.00024,
            capabilities: ['chat', 'code']
        },
        {
            id: 'gemma-7b-it',
            name: 'Gemma 7B',
            description: 'Google\'s efficient model',
            contextLength: 8192,
            costPer1kTokens: 0.0001,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'llama-3.1-70b-versatile'
};
exports.groqModels = exports.groqProvider.models;
