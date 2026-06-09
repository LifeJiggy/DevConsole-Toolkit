"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getAvailableProviders = exports.providerManager = exports.ProviderManager = exports.ProviderClient = void 0;
var openai_1 = require("openai");
var xai_js_1 = require("./xai.js");
var open_ai_js_1 = require("./open-ai.js");
var anthropic_js_1 = require("./anthropic.js");
var google_js_1 = require("./google.js");
var groq_js_1 = require("./groq.js");
var ollama_js_1 = require("./ollama.js");
var mistral_js_1 = require("./mistral.js");
var together_ai_js_1 = require("./together-ai.js");
var openrouter_js_1 = require("./openrouter.js");
var deepseek_js_1 = require("./deepseek.js");
var cohere_js_1 = require("./cohere.js");
var fireworks_js_1 = require("./fireworks.js");
var perplexity_js_1 = require("./perplexity.js");
var zhipu_js_1 = require("./zhipu.js");
var kimi_js_1 = require("./kimi.js");
var moonshot_ai_js_1 = require("./moonshot-ai.js");
var qwen_js_1 = require("./qwen.js");
var azure_js_1 = require("./azure.js");
var aws_js_1 = require("./aws.js");
var hugging_face_js_1 = require("./hugging-face.js");
var minimax_js_1 = require("./minimax.js");
var opencode_js_1 = require("./opencode.js");
var ProviderClient = /** @class */ (function () {
    function ProviderClient(provider) {
        this.client = null;
        this.provider = provider;
    }
    ProviderClient.prototype.initialize = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                this.client = new openai_1["default"]({
                    baseURL: this.provider.baseURL,
                    apiKey: this.provider.apiKey || "dummy-key"
                });
                return [2 /*return*/];
            });
        });
    };
    ProviderClient.prototype.chat = function (prompt, options) {
        var _a, _b, _c;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, Promise, function () {
            var model, response, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!!this.client) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        model = options.model || ((_a = this.provider.models[0]) === null || _a === void 0 ? void 0 : _a.id);
                        if (!model) {
                            throw new Error("No models available for provider " + this.provider.name);
                        }
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.client.chat.completions.create({
                                model: model,
                                messages: [{ role: "user", content: prompt }],
                                max_tokens: options.maxTokens || 2048,
                                temperature: options.temperature || 0.7
                            })];
                    case 4:
                        response = _d.sent();
                        return [2 /*return*/, ((_c = (_b = response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "No response"];
                    case 5:
                        error_1 = _d.sent();
                        throw new Error("Provider " + this.provider.name + " error: " + (error_1 instanceof Error ? error_1.message : "Unknown error"));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ProviderClient.prototype.getModels = function () {
        return this.provider.models;
    };
    ProviderClient.prototype.getModel = function (modelId) {
        return this.provider.models.find(function (m) { return m.id === modelId; });
    };
    ProviderClient.prototype.estimateCost = function (tokens, modelId) {
        var model = modelId ? this.getModel(modelId) : this.provider.models[0];
        if (!model) {
            return 0;
        }
        return (tokens / 1000) * model.costPer1kTokens;
    };
    return ProviderClient;
}());
exports.ProviderClient = ProviderClient;
var ProviderManager = /** @class */ (function () {
    function ProviderManager() {
        this.providers = new Map();
        this.registerAllProviders();
    }
    ProviderManager.prototype.registerAllProviders = function () {
        // Register all 23 providers
        this.registerProvider(xai_js_1.xaiProvider);
        this.registerProvider(open_ai_js_1.openaiProvider);
        this.registerProvider(anthropic_js_1.anthropicProvider);
        this.registerProvider(google_js_1.googleProvider);
        this.registerProvider(groq_js_1.groqProvider);
        this.registerProvider(ollama_js_1.ollamaProvider);
        this.registerProvider(mistral_js_1.mistralProvider);
        this.registerProvider(together_ai_js_1.togetheraiProvider);
        this.registerProvider(openrouter_js_1.openrouterProvider);
        this.registerProvider(deepseek_js_1.deepseekProvider);
        this.registerProvider(cohere_js_1.cohereProvider);
        this.registerProvider(fireworks_js_1.fireworksProvider);
        this.registerProvider(perplexity_js_1.perplexityProvider);
        this.registerProvider(zhipu_js_1.zhipuProvider);
        this.registerProvider(kimi_js_1.kimiProvider);
        this.registerProvider(moonshot_ai_js_1.moonshotaiProvider);
        this.registerProvider(qwen_js_1.qwenProvider);
        this.registerProvider(azure_js_1.azureProvider);
        this.registerProvider(aws_js_1.awsProvider);
        this.registerProvider(hugging_face_js_1.huggingfaceProvider);
        this.registerProvider(minimax_js_1.minimaxProvider);
        this.registerProvider(opencode_js_1.opencodeProvider);
    };
    ProviderManager.prototype.registerProvider = function (provider) {
        var client = new ProviderClient(provider);
        this.providers.set(provider.name, client);
    };
    ProviderManager.prototype.getProvider = function (name) {
        return this.providers.get(name);
    };
    ProviderManager.prototype.getAllProviders = function () {
        return this.providers;
    };
    ProviderManager.prototype.chat = function (providerName, prompt, options) {
        return __awaiter(this, void 0, Promise, function () {
            var provider;
            return __generator(this, function (_a) {
                provider = this.getProvider(providerName);
                if (!provider) {
                    throw new Error("Provider " + providerName + " not found");
                }
                return [2 /*return*/, provider.chat(prompt, options)];
            });
        });
    };
    ProviderManager.prototype.fallbackChat = function (providerNames, prompt, options) {
        return __awaiter(this, void 0, Promise, function () {
            var errors, _i, providerNames_1, providerName, result, provider, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = [];
                        _i = 0, providerNames_1 = providerNames;
                        _a.label = 1;
                    case 1:
                        if (!(_i < providerNames_1.length)) return [3 /*break*/, 6];
                        providerName = providerNames_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.chat(providerName, prompt, options)];
                    case 3:
                        result = _a.sent();
                        provider = this.getProvider(providerName);
                        return [2 /*return*/, {
                                result: result,
                                provider: providerName,
                                cost: (provider === null || provider === void 0 ? void 0 : provider.estimateCost(result.length)) || 0
                            }];
                    case 4:
                        error_2 = _a.sent();
                        errors.push(providerName + ": " + (error_2 instanceof Error ? error_2.message : "Unknown error"));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: throw new Error("All providers failed:\n" + errors.join("\n"));
                }
            });
        });
    };
    ProviderManager.prototype.compareModels = function (providerName, prompt, modelIds) {
        return __awaiter(this, void 0, Promise, function () {
            var results, _i, modelIds_1, modelId, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = new Map();
                        _i = 0, modelIds_1 = modelIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < modelIds_1.length)) return [3 /*break*/, 6];
                        modelId = modelIds_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.chat(providerName, prompt, {
                                model: modelId
                            })];
                    case 3:
                        result = _a.sent();
                        results.set(modelId, result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        results.set(modelId, "Error: " + (error_3 instanceof Error ? error_3.message : "Unknown error"));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    ProviderManager.prototype.listProviders = function () {
        return Array.from(this.providers.keys());
    };
    return ProviderManager;
}());
exports.ProviderManager = ProviderManager;
// Export singleton instance
exports.providerManager = new ProviderManager();
// Helper function for completions
function getAvailableProviders() {
    var providers = exports.providerManager.listProviders();
    return providers.map(function (name) {
        var client = exports.providerManager.getProvider(name);
        var models = (client === null || client === void 0 ? void 0 : client.getModels().map(function (m) { return m.id; })) || [];
        return {
            name: name,
            models: models,
            capabilities: ['text-generation', 'chat-completion']
        };
    });
}
exports.getAvailableProviders = getAvailableProviders;
