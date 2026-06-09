"use strict";
exports.__esModule = true;
exports.azureModels = exports.azureProvider = void 0;
exports.azureProvider = {
    name: 'azure',
    displayName: 'Microsoft Azure OpenAI',
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || 'https://<your-resource>.openai.azure.com/openai/deployments',
    models: [
        {
            id: 'gpt-4o',
            name: 'GPT-4o (Azure)',
            description: 'OpenAI GPT-4o via Azure',
            contextLength: 128000,
            costPer1kTokens: 0.005,
            capabilities: ['chat', 'vision', 'code']
        },
        {
            id: 'gpt-4',
            name: 'GPT-4 (Azure)',
            description: 'OpenAI GPT-4 via Azure',
            contextLength: 8192,
            costPer1kTokens: 0.03,
            capabilities: ['chat', 'code']
        },
        {
            id: 'gpt-35-turbo',
            name: 'GPT-3.5 Turbo (Azure)',
            description: 'OpenAI GPT-3.5 via Azure',
            contextLength: 16385,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'gpt-35-turbo-16k',
            name: 'GPT-3.5 Turbo 16K (Azure)',
            description: 'OpenAI GPT-3.5 16K via Azure',
            contextLength: 16384,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'gpt-4o'
};
exports.azureModels = exports.azureProvider.models;
