"use strict";
exports.__esModule = true;
exports.minimaxModels = exports.minimaxProvider = void 0;
exports.minimaxProvider = {
    name: 'minimax',
    displayName: 'MiniMax',
    baseURL: 'https://api.minimax.chat/v1',
    models: [
        {
            id: 'abab6.5s-chat',
            name: 'ABAB 6.5S Chat',
            description: 'Fast conversational model',
            contextLength: 16384,
            costPer1kTokens: 0.0002,
            capabilities: ['chat']
        },
        {
            id: 'abab6.5-chat',
            name: 'ABAB 6.5 Chat',
            description: 'General purpose chat model',
            contextLength: 32768,
            costPer1kTokens: 0.0007,
            capabilities: ['chat', 'code']
        },
        {
            id: 'abab6-chat',
            name: 'ABAB 6 Chat',
            description: 'Previous generation',
            contextLength: 16384,
            costPer1kTokens: 0.0005,
            capabilities: ['chat']
        },
    ],
    defaultModel: 'abab6.5-chat'
};
exports.minimaxModels = exports.minimaxProvider.models;
