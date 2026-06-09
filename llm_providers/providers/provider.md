# Provider Command

Manage AI providers for Grok-Code CLI.

**⚠️ Important: No Default Provider**

Grok-Code CLI **requires explicit configuration**. You must set your provider and model before use. There are no hardcoded defaults.

## Prerequisites

Before using any provider, you must:

1. **Set default provider explicitly**
2. **Set default model explicitly**
3. **Add your API key via subscription**

## Usage

```bash
grok-code provider [action]
```

## Actions

| Action               | Description                   |
| -------------------- | ----------------------------- |
| `list`               | List all available providers  |
| `set <provider>`     | Set default provider          |
| `add <provider>`     | Add provider configuration    |
| `remove <provider>`  | Remove provider configuration |
| `info <provider>`    | Show provider information     |
| `test <provider>`    | Test provider connection      |
| `models <provider>`  | List models for a provider    |
| `enable <provider>`  | Enable a provider             |
| `disable <provider>` | Disable a provider            |
| `current`            | Show current provider         |

## Quick Start (3 Steps Required)

### Step 1: Set Your Provider

```bash
# Choose your provider - NO DEFAULTS!
grok-code config set defaultProvider openrouter
```

**Available Providers:**

- `xai` - xAI (Grok)
- `openai` - OpenAI
- `anthropic` - Anthropic (Claude)
- `groq` - Groq
- `deepseek` - DeepSeek
- `openrouter` - OpenRouter (multi-provider)
- `ollama` - Ollama (local)
- `google` - Google AI (Gemini)
- `azure` - Azure OpenAI
- `fireworks` - Fireworks AI
- `together` - Together AI
- `cohere` - Cohere
- `mistral` - Mistral AI
- `perplexity` - Perplexity AI

### Step 2: Set Your Model

```bash
# Choose your model - NO DEFAULTS!
grok-code config set defaultModel anthropic/claude-3.5-sonnet
```

**Example Models by Provider:**

- OpenRouter: `anthropic/claude-3.5-sonnet`, `openai/gpt-4o`
- OpenAI: `gpt-4o`, `gpt-4o-mini`
- Anthropic: `claude-3-5-sonnet-20241022`
- xAI: `grok-2-1212`, `grok-beta`

### Step 3: Add Your API Key

```bash
# Add subscription for your provider
grok-code sub add openrouter
# Enter your API key when prompted

# Or add with key directly
grok-code sub add openrouter --api-key sk-or-v1-xxx
```

## Examples

### List all providers

```bash
grok-code provider list
```

### List providers with details

```bash
grok-code provider list --verbose
```

### Set default provider

```bash
# Required - no fallback!
grok-code config set defaultProvider openai
```

### Set provider with model

```bash
# Required - no fallback!
grok-code config set defaultModel gpt-4o
```

### Add provider with API key

```bash
grok-code provider add openai --api-key sk-xxxxx
```

### Add provider with custom base URL

```bash
grok-code provider add openai --api-key sk-xxxxx --base-url https://api.openai.com/v1
```

### Show provider info

```bash
grok-code provider info openai
```

### Test provider connection

```bash
# Will fail if not configured!
grok-code provider test openai
```

### Test with specific model

```bash
grok-code provider test openai --model gpt-4o
```

### List models for a provider

```bash
grok-code provider models openai
```

### Show current provider

```bash
grok-code provider current
```

### Enable/Disable provider

```bash
grok-code provider disable openai
grok-code provider enable openai
```

### Output as JSON

```bash
grok-code provider list --json
grok-code provider info openai --json
```

## Configuration Verification

Always verify your configuration before use:

```bash
# Check config
grok-code config list

# Expected output:
# defaultProvider: openrouter
# defaultModel: anthropic/claude-3.5-sonnet
# maxTokens: 4096
# ...
```

If you see:

```
❌ ERROR Invalid configuration: [
  {
    "path": ["defaultProvider"],
    "message": "Required"
  }
]
```

You need to run:

```bash
grok-code config set defaultProvider <your-provider>
```

## Available Providers

- **xai** - xAI (Grok) - Fast and capable AI
- **openai** - OpenAI - GPT-4 and GPT-4o models
- **anthropic** - Anthropic - Claude models
- **groq** - Groq - Fast inference with Llama models
- **deepseek** - DeepSeek - Open-source AI models
- **openrouter** - OpenRouter - Unified API for multiple providers
- **ollama** - Ollama - Run AI models locally
- **google** - Google AI - Gemini models
- **azure** - Azure OpenAI - Microsoft Azure OpenAI Service
- **fireworks** - Fireworks AI - High-performance inference
- **together** - Together AI - Open AI models at scale
- **cohere** - Cohere - Enterprise AI platform
- **mistral** - Mistral AI - Open and efficient AI
- **perplexity** - Perplexity AI - AI-powered search

## Environment Variables (Optional)

You can still use environment variables, but explicit config is preferred:

```bash
# Optional - subscription system is preferred
XAI_API_KEY=your-xai-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GROQ_API_KEY=your-groq-key
DEEPSEEK_API_KEY=your-deepseek-key
GOOGLE_AI_API_KEY=your-google-key
AZURE_OPENAI_API_KEY=your-azure-key
OPENROUTER_API_KEY=your-openrouter-key
```

## Subscription vs Environment Variables

### Subscription System (Recommended)

```bash
# Securely stores API keys
grok-code sub add openrouter
# Prompts for API key
# Stored in ~/.grok/subscriptions.json
```

### Environment Variables (Alternative)

```bash
# Set in .env file or shell
export OPENROUTER_API_KEY=sk-or-v1-xxx
```

### Priority Order

1. Subscription API keys (highest priority)
2. Environment variables
3. Config file settings

## Troubleshooting

### "No API key found for provider"

**Solution:** Add subscription for the provider

```bash
grok-code sub add <provider>
```

### "Invalid configuration: defaultProvider Required"

**Solution:** Set provider explicitly

```bash
grok-code config set defaultProvider <provider>
```

### "Invalid configuration: defaultModel Required"

**Solution:** Set model explicitly

```bash
grok-code config set defaultModel <model>
```

### Provider not working

1. Check subscription: `grok-code sub list`
2. Verify config: `grok-code config list`
3. Test connection: `grok-code provider test <provider>`
4. Check API key is valid

## Migration from Old Config

If you had perplexity or xai as default before:

```bash
# Reset old config
grok-code config reset

# Set your preferred provider
grok-code config set defaultProvider openrouter

# Set your preferred model
grok-code config set defaultModel anthropic/claude-3.5-sonnet

# Add subscription
grok-code sub add openrouter
```

## Production Deployment (100K+ Users)

For enterprise deployments:

1. **No hardcoded defaults** - Each user must explicitly configure
2. **Subscription-based** - API keys stored securely, not in code
3. **Explicit configuration** - No surprise provider switches
4. **BYOA ready** - Bring Your Own API model
5. **Clear error messages** - Users know exactly what's needed

```bash
# Required setup for production
grok-code config set defaultProvider <user-choice>
grok-code config set defaultModel <user-choice>
grok-code sub add <user-choice>
```
