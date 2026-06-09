"use strict";
exports.__esModule = true;
exports.huggingfaceModels = exports.huggingfaceProvider = void 0;
exports.huggingfaceProvider = {
    name: 'huggingface',
    displayName: 'Hugging Face',
    baseURL: 'https://api-inference.huggingface.co/models',
    models: [
        {
            id: 'meta-llama/Llama-3.1-405B-Instruct',
            name: 'Llama 3.1 405B',
            description: 'Meta\'s largest open model',
            contextLength: 131072,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'meta-llama/Llama-3.1-70B-Instruct',
            name: 'Llama 3.1 70B',
            description: 'Meta\'s 70B model',
            contextLength: 131072,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'meta-llama/Meta-Llama-3-70B-Instruct',
            name: 'Llama 3 70B',
            description: 'Meta\'s Llama 3 70B',
            contextLength: 8192,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
        {
            id: 'mistralai/Mistral-7B-Instruct-v0.2',
            name: 'Mistral 7B Instruct',
            description: 'Mistral 7B instruction-tuned',
            contextLength: 32768,
            costPer1kTokens: 0,
            capabilities: ['chat']
        },
        {
            id: 'microsoft/Phi-3.5-mini-instruct',
            name: 'Phi-3.5 Mini',
            description: 'Microsoft\'s small model',
            contextLength: 16384,
            costPer1kTokens: 0,
            capabilities: ['chat']
        },
        {
            id: 'Qwen/Qwen2.5-72B-Instruct',
            name: 'Qwen 2.5 72B',
            description: 'Alibaba\'s 72B model',
            contextLength: 32768,
            costPer1kTokens: 0,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'meta-llama/Llama-3.1-70B-Instruct'
};
exports.huggingfaceModels = exports.huggingfaceProvider.models;
