"use strict";
exports.__esModule = true;
exports.cohereModels = exports.cohereProvider = void 0;
exports.cohereProvider = {
    name: 'cohere',
    displayName: 'Cohere',
    baseURL: 'https://api.cohere.ai/v1',
    models: [
        {
            id: 'command-r-plus',
            name: 'Command R+',
            description: 'Enterprise-grade with RAG',
            contextLength: 128000,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'retrieval']
        },
        {
            id: 'command-r',
            name: 'Command R',
            description: 'Efficient enterprise model',
            contextLength: 128000,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code', 'retrieval']
        },
        {
            id: 'command',
            name: 'Command',
            description: 'General purpose model',
            contextLength: 4096,
            costPer1kTokens: 0.001,
            capabilities: ['chat']
        },
        {
            id: 'command-light',
            name: 'Command Light',
            description: 'Lightweight model',
            contextLength: 4096,
            costPer1kTokens: 0.0003,
            capabilities: ['chat']
        },
    ],
    defaultModel: 'command-r-plus'
};
exports.cohereModels = exports.cohereProvider.models;
