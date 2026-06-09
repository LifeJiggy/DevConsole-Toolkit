"use strict";
exports.__esModule = true;
exports.opencodeModels = exports.opencodeProvider = void 0;
exports.opencodeProvider = {
    name: 'opencode',
    displayName: 'OpenCode',
    baseURL: 'https://api.opencode.ai/v1',
    models: [
        {
            id: 'opencode-70b',
            name: 'OpenCode 70B',
            description: 'Code-specialized 70B model',
            contextLength: 32768,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'opencode-13b',
            name: 'OpenCode 13B',
            description: 'Code-specialized 13B model',
            contextLength: 16384,
            costPer1kTokens: 0.0001,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'opencode-70b'
};
exports.opencodeModels = exports.opencodeProvider.models;
