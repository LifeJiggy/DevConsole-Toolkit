# Provider API Test Results

## Status Summary

| Provider    | API URL                                          | Status | Free Access    |
| ----------- | ------------------------------------------------ | ------ | -------------- |
| openrouter  | https://openrouter.ai/api/v1                     | 200    | ✅ Yes         |
| opencode    | https://opencode.ai/zen/v1                       | 200    | ✅ Yes         |
| huggingface | https://router.huggingface.co/v1                 | 200    | ✅ Yes         |
| nvidia      | https://integrate.api.nvidia.com/v1              | 200    | ✅ Yes         |
| deepseek    | https://api.deepseek.com                         | 401    | ❌ Needs key   |
| groq        | https://api.groq.com/openai/v1                   | 401    | ❌ Needs key   |
| mistral     | https://api.mistral.ai/v1                        | 401    | ❌ Needs key   |
| ollama      | http://localhost:11434/v1                        | local  | ✅ Yes         |
| open-ai     | https://api.openai.com/v1                        | 401    | ❌ Needs key   |
| anthropic   | https://api.anthropic.com/v1                     | 401    | ❌ Needs key   |
| google      | https://generativelanguage.googleapis.com/v1beta | 401    | ❌ Needs key   |
| kilo        | https://api.kilo.ai/api/gateway                  | 000    | ❌ Not working |

---

## Working Free Models by Provider

### OpenCode (Working - 200)

**Base URL:** `https://opencode.ai/zen/v1`

**Free Models:**

- minimax-m2.5-free (DEFAULT)
- gemini-3.1-pro
- gemini-3-pro
- gemini-3-flash
- trinity-large-preview-free

**Premium Models:**

- claude-opus-4-6, claude-sonnet-4-6
- gpt-5.4-pro, gpt-5.4, gpt-5.3-codex
- minimax-m2.5, glm-5, glm-4.7
- kimi-k2, kimi-k2.5

---

### HuggingFace (Working - 200)

**Base URL:** `https://router.huggingface.co/v1`

**Free Models:**

- Qwen/Qwen3.5-27B (DEFAULT)
- Qwen/Qwen3.5-35B-A3B
- miniMaxAI/MiniMax-M2.5
- meta-llama/Llama-3.1-8B-Instruct
- deepseek-ai/DeepSeek-R1
- google/gemma-3-27b-it

**Premium Models:**

- Qwen/Qwen3-Coder-Next
- moonshotai/Kimi-K2.5
- deepseek-ai/DeepSeek-V3.2

---

### OpenRouter (Working - 200)

**Base URL:** `https://openrouter.ai/api/v1`

**Free Models:**

- stepfun/step-3.5-flash:free
- moonshotai/kimi-dev-72b:free
- moonshotai/kimi-k2:free
- nvidia/nemotron-nano-9b-v2:free
- google/gemma-3-4b-it:free
- qwen/qwen3-4b:free
- deepseek/deepseek-r1:free

**Premium Models:**

- stepfun/step-3.5-flash
- moonshotai/kimi-k2, kimi-k2.5
- anthropic/claude-3.5-sonnet
- openai/gpt-4o

---

### Nvidia (Working - 200)

**Base URL:** `https://integrate.api.nvidia.com/v1`

**Free Models:**

- minimaxai/minimax-m2 (DEFAULT)
- moonshotai/kimi-k2.5
- nvidia/nvidia-nemotron-nano-9b-v2
- google/gemma-3-12b-it, gemma-3-27b-it
- microsoft/phi-4-mini-instruct
- qwen/qwen2.5-coder-32b-instruct

**Premium Models:**

- nvidia/nemotron-4-340b-instruct
- nvidia/llama-3.1-nemotron-70b-instruct
- meta/llama-4-scout-17b-16e-instruct

---

## Providers Needing API Keys

### DeepSeek

**Base URL:** `https://api.deepseek.com`

- deepseek-chat (premium)
- deepseek-reasoner (premium)

### Groq

**Base URL:** `https://api.groq.com/openai/v1`

- llama-3.2-1b-preview (free)
- llama-3.2-3b-preview (free)
- mixtral-8x7b-32768 (free)

### Mistral

**Base URL:** `https://api.mistral.ai/v1`

- mistral-small-latest (free)
- Multiple premium models

### OpenAI

**Base URL:** `https://api.openai.com/v1`

- gpt-5-nano (free)
- gpt-5-mini (free)
- gpt-oss-20b (free)
- Multiple premium models

### Anthropic

**Base URL:** `https://api.anthropic.com/v1`

- claude-3-5-haiku-20241022 (free)
- claude-haiku-4-5 (free)

### Google

**Base URL:** `https://generativelanguage.googleapis.com/v1beta`

- gemini-3-flash (free)
- gemini-3-pro (free)
- gemma-3-4b-it (free)

### xAI

**Base URL:** `https://api.x.ai/v1`

- grok-2-1212 (free)

### Zhipu AI

**Base URL:** `https://open.bigmodel.cn/api/paas/v4`

- glm-4.5-flash (free)
- glm-4.7-flash (free)

---

## Local/Development

### Ollama

**Base URL:** `http://localhost:11434/v1`

- llama3.2 (local)
- llama3.1 (local)
- mistral (local)
- codellama (local)

---

_Last Updated: 2026-03-07_
