"use strict";
exports.__esModule = true;
exports.mistralModels = exports.mistralProvider = void 0;
exports.mistralProvider = {
    name: 'mistral',
    displayName: 'Mistral AI',
    baseURL: 'https://api.mistral.ai/v1',
    models: [
        {
            id: 'mistral-large-latest',
            name: 'Mistral Large',
            description: 'High capability model',
            contextLength: 131072,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'reasoning']
        },
        {
            id: 'mistral-medium-latest',
            name: 'Mistral Medium',
            description: 'Balanced performance',
            contextLength: 131072,
            costPer1kTokens: 0.0007,
            capabilities: ['chat', 'code']
        },
        {
            id: 'mistral-small-latest',
            name: 'Mistral Small',
            description: 'Fast and efficient',
            contextLength: 131072,
            costPer1kTokens: 0.0002,
            capabilities: ['chat', 'code']
        },
        {
            id: 'open-mistral-7b',
            name: 'Mistral 7B',
            description: 'Open source 7B model',
            contextLength: 32768,
            costPer1kTokens: 0.00025,
            capabilities: ['chat', 'code']
        },
        {
            id: 'open-mixtral-8x7b',
            name: 'Mixtral 8x7B',
            description: 'Mixture of experts',
            contextLength: 32768,
            costPer1kTokens: 0.0007,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'mistral-large-latest'
};
exports.mistralModels = exports.mistralProvider.models;
