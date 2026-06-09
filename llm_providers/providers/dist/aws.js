"use strict";
exports.__esModule = true;
exports.awsModels = exports.awsProvider = void 0;
exports.awsProvider = {
    name: 'aws',
    displayName: 'Amazon Bedrock',
    baseURL: 'https://bedrock-runtime.us-east-1.amazonaws.com',
    models: [
        {
            id: 'anthropic.claude-3-5-sonnet-20241022-v1:0',
            name: 'Claude 3.5 Sonnet (Bedrock)',
            description: 'Claude via AWS Bedrock',
            contextLength: 200000,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code', 'reasoning', 'vision']
        },
        {
            id: 'anthropic.claude-3-haiku-20241022-v1:0',
            name: 'Claude 3 Haiku (Bedrock)',
            description: 'Fast Claude via AWS Bedrock',
            contextLength: 200000,
            costPer1kTokens: 0.00025,
            capabilities: ['chat', 'code']
        },
        {
            id: 'anthropic.claude-3-opus-20240229-v1:0',
            name: 'Claude 3 Opus (Bedrock)',
            description: 'Most capable Claude via Bedrock',
            contextLength: 200000,
            costPer1kTokens: 0.015,
            capabilities: ['chat', 'code', 'reasoning', 'vision']
        },
        {
            id: 'meta.llama3-1-405b-instruct-v1:0',
            name: 'Llama 3.1 405B (Bedrock)',
            description: 'Meta\'s largest via Bedrock',
            contextLength: 131072,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code']
        },
        {
            id: 'meta.llama3-1-70b-instruct-v1:0',
            name: 'Llama 3.1 70B (Bedrock)',
            description: 'Fast Llama via Bedrock',
            contextLength: 131072,
            costPer1kTokens: 0.0005,
            capabilities: ['chat', 'code']
        },
        {
            id: 'mistral.mistral-large-2407-v1:0',
            name: 'Mistral Large (Bedrock)',
            description: 'Mistral Large via Bedrock',
            contextLength: 131072,
            costPer1kTokens: 0.003,
            capabilities: ['chat', 'code']
        },
        {
            id: 'mistral.mistral-small-2407-v1:0',
            name: 'Mistral Small (Bedrock)',
            description: 'Mistral Small via Bedrock',
            contextLength: 131072,
            costPer1kTokens: 0.0002,
            capabilities: ['chat', 'code']
        },
    ],
    defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v1:0'
};
exports.awsModels = exports.awsProvider.models;
