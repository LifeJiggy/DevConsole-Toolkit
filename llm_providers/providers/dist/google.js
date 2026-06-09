"use strict";
exports.__esModule = true;
exports.googleModels = exports.googleProvider = void 0;
exports.googleProvider = {
    name: 'google',
    displayName: 'Google DeepMind',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
        {
            id: 'gemini-1.5-pro',
            name: 'Gemini 1.5 Pro',
            description: 'Multimodal with 2M context window',
            contextLength: 2097152,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'vision', 'code', 'audio', 'video']
        },
        {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            description: 'Fast and efficient model',
            contextLength: 1048576,
            costPer1kTokens: 0.000075,
            capabilities: ['chat', 'vision', 'code']
        },
        {
            id: 'gemini-1.0-pro',
            name: 'Gemini 1.0 Pro',
            description: 'Previous generation pro model',
            contextLength: 32768,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'vision', 'code']
        },
        {
            id: 'gemini-pro',
            name: 'Gemini Pro',
            description: 'Balanced performance model',
            contextLength: 32768,
            costPer1kTokens: 0.00025,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'gemini-1.5-pro'
};
exports.googleModels = exports.googleProvider.models;
