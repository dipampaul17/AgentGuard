<div align="center">

# 🛡️ AgentGuard

**Real-time cost monitoring for AI agents**

[![npm version](https://img.shields.io/npm/v/agent-guard.svg)](https://npmjs.com/package/agent-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

*Two lines of code. Automatic cost tracking. No surprises.*

</div>

---

## The Problem

Building AI agents? Your biggest fear is probably this:
- **Runaway costs** from infinite loops or bugs
- **Development bills** that spiral out of control  
- **No visibility** into what your agent is actually spending
- **Production anxiety** about deploying autonomous systems

## The Solution

AgentGuard automatically tracks your AI API costs in real-time and stops execution when you hit your budget. No code changes needed - just add two lines and keep building.

```javascript
// Add these two lines to any AI agent:
const agentGuard = require('agent-guard');
await agentGuard.init({ limit: 50 });

// Your existing code works unchanged:
const response = await openai.chat.completions.create({...});
console.log(response); // ← AgentGuard automatically tracks this

// Real-time cost display:
// 💸 $12.34 / $50  24.7%
```

## What It Does

- **Automatic tracking** - Watches console.log, fetch, and axios automatically
- **Real-time display** - Shows current costs as your agent runs  
- **Multi-model support** - OpenAI (GPT-4, GPT-3.5), Anthropic (Claude), embeddings
- **Flexible limits** - Set budget in dollars, auto-kill or just warn
- **Zero code changes** - Works with your existing OpenAI/Anthropic code
- **TypeScript support** - Full type definitions included
- **18KB lightweight** - No bloat, minimal dependencies

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

### Usage
```javascript
// Add this at the start of your agent
const agentGuard = require('agent-guard');
await agentGuard.init({ limit: 25 }); // Kill at $25

// Your existing agent code continues unchanged
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello world' }]
});

console.log('Response:', response); // AgentGuard tracks this automatically
```

### What You'll See

```bash
🛡️ AgentGuard v1.1.0 initialized
💰 Budget protection: $25
💸 $0.23 / $25.00 0.9%    # Real-time cost tracking
💸 $2.45 / $25.00 9.8%    # Updates with each API call
⚠️  $20.10 / $25.00 80.4% # Warning at 80%
🚨 $24.89 / $25.00 99.6%  # Danger at 90%
🛑 AGENTGUARD: KILLED PROCESS - Saved you ~$75.00
```

## 💡 Examples

### Basic Protection
```javascript
const agentGuard = require('agent-guard');
await agentGuard.init({ limit: 10 });
// Process kills automatically at $10
```

### Advanced Configuration
```javascript
const agentGuard = require('agent-guard');
const guard = await agentGuard.init({
  limit: 100,                              // Kill at $100
  webhook: 'https://hooks.slack.com/...',  // Slack notifications
  silent: false                            // Show cost updates
});

// Check costs anytime
console.log(`Current cost: $${guard.getCost()}`);

// Adjust limit dynamically
guard.setLimit(200);
```

### Browser Usage
```html
<script src="./agent-guard.js"></script>
<script>
  AgentGuard.init({ limit: 50 });
  // Your browser agent code...
</script>
```

## 🎯 Live Examples

Want to see AgentGuard in action? Check out our examples:

- **[Runaway Loop Protection](examples/runaway-loop-demo.js)** - See protection against infinite loops
- **[Customer Workflow](examples/real-customer-demo.js)** - Real-world integration scenario
- **[Browser Example](examples/test-browser.html)** - Interactive web interface

```bash
# Run the runaway loop protection example
node examples/runaway-loop-demo.js

# See real customer workflow protection  
node examples/real-customer-demo.js
```

## 🔧 How It Works

AgentGuard intercepts and monitors:
- ✅ **console.log()** - Detects API responses in logs
- ✅ **fetch()** - Wraps HTTP requests to AI APIs
- ✅ **axios** - Automatic response interception
- ✅ **Real-time calculation** - Accurate token counting and pricing

**Supported APIs:**
- OpenAI (GPT-4, GPT-3.5, GPT-4o, etc.)
- Anthropic (Claude 3 Opus, Sonnet, Haiku)
- Automatic model detection and cost calculation

## 📊 What Gets Protected

- 🛡️ **Infinite loops** calling AI APIs
- 🛡️ **Expensive model calls** (GPT-4, Claude Opus)
- 🛡️ **Recursive agent calls** with bugs
- 🛡️ **Development workflows** with cost oversight
- 🛡️ **Runaway RAG** document processing

## 🛠️ API Reference

### `init(options)`
Initializes AgentGuard with the specified options.

```javascript
const agentGuard = require('agent-guard');
const guard = await agentGuard.init({
  limit: 50,           // Cost limit in USD
  webhook: null,       // Webhook URL for notifications
  silent: false        // Hide cost updates
});
```

### Instance Methods
```javascript
guard.getCost()        // Returns current cost
guard.getLimit()       // Returns current limit  
guard.setLimit(100)    // Updates cost limit
guard.getLogs()        // Returns API call log
guard.reset()          // Resets cost to $0
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

## Support

Having issues? Found a bug? 

- [GitHub Issues](https://github.com/dipampaul17/AgentGuard/issues) for bugs
- [GitHub Discussions](https://github.com/dipampaul17/AgentGuard/discussions) for questions

## What's Included

- **Core monitoring** - Tracks OpenAI, Anthropic, and embedding costs
- **Working examples** - Real LangChain integration, runaway loop demo
- **TypeScript support** - Full type definitions
- **Browser build** - Use in web applications
- **Verification script** - Test installation instantly

---

<div align="center">

**AgentGuard - Real-time cost monitoring for AI agents**

*Two lines of code. Automatic tracking. No surprises.*

[⭐ Star on GitHub](https://github.com/dipampaul17/AgentGuard) • 
[📦 NPM Package](https://npmjs.com/package/agent-guard)

*Trusted by developers building the future of AI*

</div>