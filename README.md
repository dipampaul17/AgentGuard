<div align="center">

# 🛡️ AgentGuard

**Stop AI agents from burning your money**

[![npm version](https://badge.fury.io/js/agent-guard.svg)](https://badge.fury.io/js/agent-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen)](https://nodejs.org/)

*The emergency brake for runaway AI costs*

</div>

---

## 🚨 The Problem

Every AI developer has been there:
- 🔥 **Infinite loop** burns through $500 overnight
- 📈 **Debugging costs** more than the bug  
- 💳 **OpenAI bills** that make you cry
- 😰 **Deploy anxiety** because agents can go rogue

## ✨ The Solution

AgentGuard is a **lightweight kill switch** that monitors your AI agent costs in real-time and automatically terminates processes when they exceed your budget.

```javascript
// Before: Vulnerable to runaway costs
const response = await openai.chat.completions.create({...});

// After: Protected by AgentGuard
require('agent-guard').init({ limit: 50 });
const response = await openai.chat.completions.create({...});
// 🛡️ AgentGuard now monitors every API call automatically
```

## 🎯 Key Features

- **🔥 Zero Dependencies** - Single 11KB file
- **⚡ Zero Configuration** - Works out of the box
- **🎨 Beautiful Terminal UI** - Real-time cost display with warnings
- **🤖 Multi-Model Support** - OpenAI, Anthropic, Claude
- **🌐 Multi-Platform** - Node.js and Browser
- **🚨 Instant Kill Switch** - Terminates at your cost limit
- **📊 Accurate Tracking** - Real token counting and pricing

## 🚀 Quick Start

### Installation
```bash
npm install agent-guard
```

### Usage
```javascript
// Add this ONE line at the start of your agent
require('agent-guard').init({ limit: 25 }); // Kill at $25

// Your existing agent code continues unchanged
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello world' }]
});

console.log('Response:', response); // AgentGuard tracks this automatically
```

### What You'll See

```bash
🛡️ AgentGuard v1.0.0 initialized
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
require('agent-guard').init({ limit: 10 });
// Process kills automatically at $10
```

### Advanced Configuration
```javascript
const guard = require('agent-guard').init({
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

## 🎭 Live Demo

Want to see AgentGuard in action? Check out our demos:

- **[Runaway Loop Demo](examples/runaway-loop-demo.js)** - See protection against infinite loops
- **[Customer Support Agent](examples/real-customer-demo.js)** - Real-world RAG scenario
- **[Browser Demo](examples/test-browser.html)** - Interactive web interface

```bash
# Run the dramatic runaway loop demo
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
- 🛡️ **Development debugging** sessions
- 🛡️ **Runaway RAG** document processing

## 🛠️ API Reference

### `init(options)`
Initializes AgentGuard with the specified options.

```javascript
const guard = require('agent-guard').init({
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
npm test
```

## 📜 License

MIT - Use anywhere, even commercial projects.

## 🆘 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/dipampaul17/AgentGuard/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/dipampaul17/AgentGuard/discussions)
- 🐛 **Bug Reports**: [Bug Report Template](https://github.com/dipampaul17/AgentGuard/issues/new)

---

<div align="center">

**Stop losing money. Start shipping safely.**

[⭐ Star on GitHub](https://github.com/dipampaul17/AgentGuard) • 
[📦 NPM Package](https://npmjs.com/package/agent-guard) • 
[📖 Quick Start](QUICKSTART.md)

*Trusted by developers building the future of AI*

</div>