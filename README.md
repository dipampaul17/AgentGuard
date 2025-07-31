<div align="center">

# 🛡️ AgentGuard

**The only tool that autonomously prevents AI runaway costs**

[![NPM Version](https://img.shields.io/npm/v/agent-guard?style=for-the-badge&color=00d084&logo=npm)](https://npmjs.com/package/agent-guard)
[![Downloads](https://img.shields.io/npm/dm/agent-guard?style=for-the-badge&color=blue&logo=npm)](https://npmjs.com/package/agent-guard)
[![License](https://img.shields.io/github/license/dipampaul17/AgentGuard?style=for-the-badge&color=green&logo=opensource)](https://github.com/dipampaul17/AgentGuard/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/dipampaul17/AgentGuard?style=for-the-badge&color=yellow&logo=github)](https://github.com/dipampaul17/AgentGuard/stargazers)

*Per-script budget enforcement with real-time auto-kill*

</div>

---

## 🎯 **What Makes AgentGuard Different**

**While [tokencost](https://github.com/AgentOps-AI/tokencost), [LangChain callbacks](https://python.langchain.com/docs/how_to/llm_token_usage_tracking/), and [tokmon](https://github.com/yagil/tokmon) help you *measure* costs, AgentGuard is the only tool that *prevents* them.**

| Feature | AgentGuard | tokencost | LangChain | tokmon | OpenAI Dashboard |
|---------|------------|-----------|-----------|--------|------------------|
| **Per-script budget limits** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Real-time auto-kill** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Zero code changes** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Soft failure modes** | ✅ | N/A | ✅ | N/A | N/A |
| **Live price updates** | ✅ | ✅ | ❌ | ❌ | ✅ |

**[📊 See full comparison](COMPARISON.md)**

---

## 🚨 **The Real Problem**

Your development script has a bug and burns through **$200 in 10 minutes**.

- **tokencost**: Would help you estimate, but can't stop it ❌  
- **LangChain**: Would report usage afterwards ❌  
- **tokmon**: Would show the damage in the final report ❌  
- **Dashboard**: Would alert you hours later ❌  
- **AgentGuard**: **Kills the process at $50, saves you $150** ✅

## ⚡ **The AgentGuard Solution**

Real-time budget enforcement with graceful failure modes. Add 2 lines, get autonomous protection.

```javascript
// Add these two lines to any AI agent:
const agentGuard = require('agent-guard');
await agentGuard.init({ 
  limit: 50,           // Budget limit in USD
  mode: 'throw'        // Graceful error vs 'kill' (hard exit) vs 'notify' (warn only)
});

// Your existing code works unchanged:
const response = await openai.chat.completions.create({...});
console.log(response); // ← AgentGuard automatically tracks this

// Real-time cost display:
// 🛡️  $12.34 / $50.00 24.7% | Mode: throw | Updated: 2025-01-25
```

## 🔥 **Core Features**

### Autonomous Protection
- **Real-time budget enforcement** - Stops execution at your limit
- **Soft failure modes** - Graceful errors instead of `process.exit(1)`
- **Per-script budgets** - Different limits for different use cases
- **Zero integration** - Works with existing code unchanged

### Advanced Monitoring  
- **Multi-client coverage** - Intercepts fetch, axios, undici, got, HTTP modules
- **Live price updates** - Fetches latest model pricing automatically
- **Privacy-aware** - Optional request/response filtering
- **Multi-process support** - Redis-backed shared budgets

### Production Ready
- **TypeScript support** - Full type definitions included
- **18KB lightweight** - Minimal dependencies, maximum performance
- **Browser + Node.js** - Works everywhere JavaScript runs
- **Webhook alerts** - Slack/Discord notifications when limits hit

## Quick Start

### Installation

**Option 1: NPM (Recommended)**
```bash
npm install agent-guard
```

**Option 2: Direct download**
```bash
# Download just the core file (~18KB)
curl -O https://raw.githubusercontent.com/dipampaul17/AgentGuard/main/agent-guard.js
```

**Option 3: Clone repository**
```bash
git clone https://github.com/dipampaul17/AgentGuard.git
cd AgentGuard
```

### Quick Start
```javascript
// Step 1: Add these two lines to your AI agent
const agentGuard = require('agent-guard');
await agentGuard.init({ limit: 25 });  // $25 budget limit

// Step 2: Your existing code works unchanged
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello world' }]
});
console.log('Response:', response); // ← AgentGuard automatically tracks this

// Real-time protection: 🛡️ $12.34 / $25.00 49.4%
```

### Production Configuration
```javascript
try {
  const guard = await agentGuard.init({
    limit: 100,                              // Budget limit in USD
    mode: 'throw',                          // Safe error vs 'kill' (hard exit)
    webhook: 'https://hooks.slack.com/...',  // Slack/Discord alerts
    redis: 'redis://localhost:6379',        // Multi-process shared budgets
    privacy: true                           // Redact sensitive data
  });
  
  // Your AI agent code here...
  
} catch (error) {
  if (error.message.includes('AGENTGUARD_LIMIT_EXCEEDED')) {
    console.log('Budget protection activated:', error.agentGuardData);
    // Handle gracefully: save state, notify, switch to cheaper model, etc.
  }
}
```

### What You'll See

```bash
--------------------------------------------------
🛡️ AgentGuard v1.2.0 initialized
💰 Budget protection: $25 (mode: throw)
📡 Monitoring: console.log, fetch, axios, undici, got
--------------------------------------------------

$0.23 / $25.00 0.9%     # Real-time cost tracking
$2.45 / $25.00 9.8%     # Updates with each API call  
$20.10 / $25.00 80.4%   # Warning at 80%
$24.89 / $25.00 99.6%   # Danger at 90%

🛑 AGENTGUARD: COST LIMIT EXCEEDED - Saved you ~$75.00
💰 Total cost when stopped: $24.89
📊 Budget used: 99.6%
🛡️ Mode: throw - gracefully stopping with recoverable error
```

## 💡 **Real-World Examples**

### Development Protection
```javascript
// Protect development scripts from expensive mistakes
await agentGuard.init({ limit: 10, mode: 'throw' });
// Safely experiment with AI without surprise bills
```

### Production Deployment
```javascript
// Multi-process protection with Redis
await agentGuard.init({
  limit: 1000,
  mode: 'throw',
  redis: 'redis://production:6379',
  webhook: 'https://hooks.slack.com/alerts'
});
```

### Browser Applications
```html
<script src="https://unpkg.com/agent-guard@latest/dist/agent-guard.min.js"></script>
<script>
  AgentGuard.init({ limit: 50, mode: 'notify' });
  // Your browser AI agent runs with cost protection
</script>
```

### Dynamic Budget Management
```javascript
const guard = await agentGuard.init({ limit: 100 });

// Check costs anytime
console.log(`Spent: $${guard.getCost()}`);

// Adjust for high-priority tasks
if (urgentTask) guard.setLimit(500);

// Reset for new session
await guard.reset();
```

## 🎯 **Live Protection Examples**

See AgentGuard prevent real runaway costs:

```bash
# Runaway loop protection (simulates infinite AI loop)
node examples/runaway-loop-demo.js

# Real customer workflow with budget protection
node examples/real-customer-demo.js

# LangChain integration example
node examples/langchain-example.js

# Interactive browser demo
open examples/test-browser.html
```

**What you'll see**: Real-time cost tracking, automatic protection activation, and graceful error handling that saves money.

## 🔧 **How Real-Time Protection Works**

### Automatic AI API Interception
No code changes needed - AgentGuard automatically monitors:
- **fetch()** - Global HTTP request interception
- **axios** - Automatic response processing
- **undici/got** - Modern Node.js HTTP clients  
- **console.log()** - API response detection in logs
- **http/https** - Raw Node.js request monitoring

### Accurate Cost Calculation
- **Real tokenizers**: OpenAI's `tiktoken` + Anthropic's official tokenizer
- **Live pricing**: Fetches current rates from community sources
- **Streaming support**: Accumulates tokens from partial responses
- **Multimodal**: Handles images, audio, and complex content
- **Smart fallback**: Accurate estimation when tokenizers unavailable

### Protection Activation
1. **Real-time tracking**: Every API call updates budget
2. **Threshold warnings**: Visual alerts at 80% and 90%
3. **Limit enforcement**: Automatic protection when budget exceeded
4. **Graceful handling**: Throws catchable error vs hard process exit
5. **Cost data**: Detailed breakdown for recovery decisions

**Supports all major providers**: OpenAI, Anthropic, auto-detected from URLs

## 📊 What Gets Protected

- 🛡️ **Infinite loops** calling AI APIs
- 🛡️ **Expensive model calls** (GPT-4, Claude Opus)
- 🛡️ **Recursive agent calls** with bugs
- 🛡️ **Development workflows** with cost oversight
- 🛡️ **Runaway RAG** document processing

## 🔒 **Security & Reliability**

### Privacy Protection
```javascript
await agentGuard.init({
  privacy: true,    // Redacts request/response content from logs
  silent: true      // Disables cost display for sensitive environments
});
```

- **Data redaction**: Request/response bodies marked as `[REDACTED]`
- **URL filtering**: Sensitive API endpoints optionally hidden
- **Local operation**: No data sent to external services
- **Memory safety**: Automatic cleanup of sensitive data

### Failure Mode Safety
```javascript
// Graceful degradation (recommended)
mode: 'throw'    // Throws catchable AgentGuardError
mode: 'notify'   // Warns but continues execution  
mode: 'kill'     // Hard process termination (use sparingly)
```

**Why soft failures matter:**
- ✅ Preserves database transactions
- ✅ Allows graceful cleanup
- ✅ Enables error recovery
- ✅ Protects worker threads

### Multi-Process Protection
```javascript
await agentGuard.init({
  redis: 'redis://localhost:6379',  // Shared budget across processes
  limit: 100                        // Combined limit for all instances
});
```

## 🛠️ **API Reference**

### `init(options)`
Initializes AgentGuard with the specified options.

```javascript
const agentGuard = require('agent-guard');
const guard = await agentGuard.init({
  limit: 50,                               // Cost limit in USD
  mode: 'throw',                          // 'throw' | 'notify' | 'kill'
  webhook: null,                          // Webhook URL for notifications
  redis: null,                            // Redis URL for multi-process tracking
  privacy: false,                         // Redact sensitive data
  silent: false                           // Hide cost updates
});
```

### Guard Instance Methods
```javascript
// Cost monitoring
guard.getCost()        // Current total cost
guard.getLimit()       // Current budget limit
guard.getLogs()        // Detailed API call history

// Budget management  
guard.setLimit(200)    // Update budget limit
guard.reset()          // Reset costs to $0

// Configuration
guard.setMode('notify') // Change protection mode
guard.updatePrices()   // Refresh live pricing data
```

## 🤝 Contributing

We love contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
git clone https://github.com/dipampaul17/AgentGuard.git
cd AgentGuard
node verify-installation.js
```

## 📜 License

MIT - Use anywhere, even commercial projects.

## 📞 **Support**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/dipampaul17/AgentGuard/issues) 
- 💬 **Questions**: [GitHub Discussions](https://github.com/dipampaul17/AgentGuard/discussions)
- 📖 **Documentation**: [API Reference](API.md) • [Quick Start](QUICKSTART.md)

## 📦 **What's Included**

- ✅ **Real-time protection** - Autonomous cost prevention that actually works
- ✅ **Production ready** - TypeScript definitions, browser support, Redis integration
- ✅ **Live examples** - LangChain integration, runaway protection demos
- ✅ **Comprehensive docs** - API reference, security guide, comparison analysis

---

**AgentGuard: The only tool that stops AI runaway costs before they happen.**

*Real-time budget enforcement • Graceful error handling • Zero code changes*

[⭐ Star on GitHub](https://github.com/dipampaul17/AgentGuard) • [📦 Install from NPM](https://npmjs.com/package/agent-guard) • [📊 See Comparison](COMPARISON.md)