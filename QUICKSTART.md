# AgentGuard Quick Start 🚀

Get protection in 30 seconds.

## 1. Install
```bash
# NPM (recommended)
npm install agent-guard

# Or download directly
curl -O https://raw.githubusercontent.com/dipampaul17/AgentGuard/main/agent-guard.js
```

## 2. Add ONE line to your agent
```javascript
const agentGuard = require('agent-guard');
agentGuard.init({ limit: 10 });

// Your existing agent code...
// AgentGuard now protects everything below
```

## 3. Verify it works
```bash
node verify-installation.js
```
Watch the cost counter: `💸 $0.12... $0.45... $0.89...`

## 4. Configure for your needs
```javascript
const guard = require('agent-guard').init({
  limit: 50,                                    // Kill at $50
  webhook: 'https://hooks.slack.com/...',      // Slack alerts
  silent: false                                // Show cost updates
});

// Check costs anytime
console.log(`Current: $${guard.getCost()}`);
```

## 5. For browser agents
```html
<script src="agent-guard.js"></script>
<script>
  AgentGuard.init({ limit: 25 });
  // Your browser agent code...
</script>
```

## Real Example: RAG Agent Protection
```javascript
// Add at the top of your RAG agent
require('agent-guard').init({ limit: 100 });

// Your existing code
async function processDocument(doc) {
  const chunks = await chunkDocument(doc);
  
  for (const chunk of chunks) {
    // These API calls are now protected
    const embedding = await openai.embeddings.create({...});
    const response = await openai.chat.completions.create({...});
    
    // AgentGuard tracks each call automatically
    console.log('Processed chunk:', response);
  }
}
```

## Emergency Stop Examples

### Runaway Loop Protection
```
💸 $0.23... $1.45... $4.67... $9.89
⚠️  AGENTGUARD: Approaching limit ($10)
🛑 AGENTGUARD: KILLED PROCESS - Saved you $90
```

### What Gets Tracked
- ✅ OpenAI API calls (all models)
- ✅ Anthropic/Claude API calls  
- ✅ Any API response logged to console
- ✅ Fetch/axios requests to AI APIs
- ✅ Real-time token & cost calculation

### What Gets Protected
- 🛡️ Infinite loops calling AI APIs
- 🛡️ Expensive model calls (GPT-4, Claude Opus)
- 🛡️ Accidentally high token usage
- 🛡️ Recursive agent calls
- 🛡️ Development debugging sessions

## Troubleshooting

**"Not tracking my API calls"**
- Make sure you `console.log()` the API responses
- Or use fetch/axios for automatic interception

**"Kills too early"**
- Adjust limit: `guard.setLimit(100)`
- Check pricing accuracy for your model

**"Want to exclude certain calls"**
- Initialize multiple guards for different components
- Use `silent: true` mode for non-critical calls

## Next Steps

- 📊 [Get Pro Dashboard](https://agentguard.dev/pricing) - Analytics & team features
- 💬 [Join Slack](https://agentguard.slack.com) - Community support  
- 🚨 [Emergency Help](mailto:emergency@agentguard.dev) - 24/7 installation help

**Stop losing money. Start shipping safely.** 🛡️