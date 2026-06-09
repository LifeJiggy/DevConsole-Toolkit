"use strict";
exports.__esModule = true;
exports.ollamaModels = exports.ollamaProvider = void 0;
exports.ollamaProvider = {
    name: 'ollama',
    displayName: 'Ollama (Local)',
    baseURL: 'http://localhost:11434/v1',
    models: [
        {
            id: 'llama3.2',
            name: 'Llama 3.2',
            description: 'Meta\'s latest Llama model',
            contextLength: 131072,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'llama3.1',
            name: 'Llama 3.1',
            description: 'Meta\'s large context Llama model',
            contextLength: 131072,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'codellama',
            name: 'Code Llama',
            description: 'Meta\'s code-specialized model',
            contextLength: 16384,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'mistral',
            name: 'Mistral',
            description: 'Mistral AI\'s model',
            contextLength: 32768,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'codestral',
            name: 'Codestral',
            description: 'Mistral\'s code model',
            contextLength: 32768,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'qwen2.5-coder',
            name: 'Qwen 2.5 Coder',
            description: 'Alibaba\'s code model',
            contextLength: 32768,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'deepseek-coder',
            name: 'DeepSeek Coder',
            description: 'DeepSeek\'s code model',
            contextLength: 32768,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'phi4',
            name: 'Phi-4',
            description: 'Microsoft\'s small but powerful model',
            contextLength: 16384,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'llama3.2'
};
exports.ollamaModels = exports.ollamaProvider.models;
