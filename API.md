# AgentGuard API Reference

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Functions](#core-functions)
- [Configuration Options](#configuration-options)
- [Instance Methods](#instance-methods)
- [Supported Models](#supported-models)
- [Advanced Usage](#advanced-usage)
- [TypeScript Support](#typescript-support)

## Installation

```bash
npm install agent-guard
```

Or download directly:
```bash
curl -O https://raw.githubusercontent.com/dipampaul17/AgentGuard/main/agent-guard.js
```

## Quick Start

```javascript
const agentGuard = require('agent-guard');
const guard = agentGuard.init({ limit: 50 });

// Your AI agent code continues normally
// AgentGuard automatically tracks costs
```

## Core Functions

### `init(options)`

Initialize AgentGuard with specified configuration.

```javascript
const guard = await agentGuard.init({
  limit: 50,           // Required: cost limit in USD
  webhook: '...',      // Optional: webhook URL
  silent: false,       // Optional: suppress console output
  mode: 'kill',        // Optional: action on limit exceeded
  redis: '...'         // Optional: Redis URL for multi-process
});
```

**Parameters:**
- `options` (Object): Configuration object

**Returns:**
- `AgentGuardInstance`: Instance with methods for runtime control

**Example:**
```javascript
// Basic usage
const guard = agentGuard.init({ limit: 10 });

// Advanced configuration
const guard = await agentGuard.init({
  limit: 100,
  webhook: 'https://hooks.slack.com/services/...',
  mode: 'throw',
  redis: 'redis://localhost:6379'
});
```

### `updatePrices()`

Manually update model prices from live APIs.

```javascript
await agentGuard.updatePrices();
```

**Note:** This is called automatically on initialization but can be triggered manually.

## Configuration Options

### `limit` (required)
- **Type:** `number`
- **Description:** Maximum cost in USD before action is taken
- **Example:** `limit: 50` (stop at $50)

### `webhook` (optional)
- **Type:** `string | null`
- **Default:** `null`
- **Description:** URL to receive notifications when limit is reached
- **Supported:** Slack, Discord, custom endpoints
- **Example:** `webhook: 'https://hooks.slack.com/services/...'`

### `silent` (optional)
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Suppress console output for cost updates
- **Example:** `silent: true`

### `mode` (optional)
- **Type:** `'kill' | 'throw' | 'notify'`
- **Default:** `'kill'`
- **Description:** Action when cost limit is exceeded
  - `'kill'`: Immediately terminate the process
  - `'throw'`: Throw an error that can be caught
  - `'notify'`: Log warning and continue execution
- **Example:** `mode: 'throw'`

### `redis` (optional)
- **Type:** `string | null`
- **Default:** `null`
- **Description:** Redis connection URL for multi-process budget tracking
- **Example:** `redis: 'redis://localhost:6379'`

### `enabled` (optional)
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether AgentGuard monitoring is active
- **Example:** `enabled: process.env.NODE_ENV === 'production'`

## Instance Methods

### `getCost()`

Get current accumulated cost in USD.

```javascript
const currentCost = guard.getCost();
console.log(`Current cost: $${currentCost.toFixed(4)}`);
```

**Returns:**
- `number`: Current cost in USD
- `null`: When using Redis mode (multi-process tracking)

### `getLimit()`

Get current cost limit.

```javascript
const limit = guard.getLimit();
console.log(`Cost limit: $${limit}`);
```

**Returns:**
- `number`: Cost limit in USD

### `setLimit(newLimit)`

Update cost limit dynamically.

```javascript
guard.setLimit(100); // Increase limit to $100
```

**Parameters:**
- `newLimit` (number): New cost limit in USD

### `setMode(newMode)`

Change the action mode dynamically.

```javascript
guard.setMode('notify'); // Switch to notify-only mode
```

**Parameters:**
- `newMode` ('kill' | 'throw' | 'notify'): New mode

### `disable()`

Disable AgentGuard monitoring.

```javascript
guard.disable(); // Stop tracking costs
```

### `reset()`

Reset cost counter and clear logs.

```javascript
await guard.reset(); // Reset to $0
```

**Note:** In Redis mode, this clears the shared budget.

### `getLogs()`

Get array of all tracked API calls.

```javascript
const logs = guard.getLogs();
logs.forEach(log => {
  console.log(`${log.model}: $${log.cost.toFixed(4)}`);
});
```

**Returns:**
```javascript
[
  {
    timestamp: 1677652288000,
    model: 'gpt-4',
    cost: 0.0045,
    tokens: { input: 100, output: 50 },
    url: 'https://api.openai.com/v1/chat/completions'
  },
  // ...
]
```

## Supported Models

### OpenAI Models
- `gpt-4` - $0.03/1K input, $0.06/1K output
- `gpt-4-turbo` - $0.01/1K input, $0.03/1K output
- `gpt-3.5-turbo` - $0.0015/1K input, $0.002/1K output
- `gpt-4o` - $0.0025/1K input, $0.01/1K output
- `gpt-4o-mini` - $0.00015/1K input, $0.0006/1K output

### Anthropic Models
- `claude-3-opus` - $0.015/1K input, $0.075/1K output
- `claude-3-sonnet` - $0.003/1K input, $0.015/1K output
- `claude-3-haiku` - $0.00025/1K input, $0.00125/1K output
- `claude-3-5-sonnet` - $0.003/1K input, $0.015/1K output

### Custom Models
Unknown models use default pricing: $0.01/1K input, $0.03/1K output

## Advanced Usage

### Multi-Process Tracking with Redis

```javascript
// All processes share the same budget
const guard = await agentGuard.init({
  limit: 100,
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Note: getCost() returns null in Redis mode
// Budget is tracked centrally across all processes
```

### Error Handling with Throw Mode

```javascript
const guard = agentGuard.init({
  limit: 10,
  mode: 'throw'
});

try {
  // Your AI agent code
  await runExpensiveAgent();
} catch (error) {
  if (error.message.includes('AGENTGUARD_LIMIT_EXCEEDED')) {
    console.log('Cost limit reached, handling gracefully...');
    // Clean up, save state, etc.
  } else {
    throw error;
  }
}
```

### Dynamic Configuration

```javascript
const guard = agentGuard.init({ limit: 50 });

// Adjust based on user tier
if (user.plan === 'premium') {
  guard.setLimit(500);
} else if (user.plan === 'basic') {
  guard.setLimit(50);
}

// Switch modes based on environment
if (process.env.NODE_ENV === 'development') {
  guard.setMode('notify'); // Don't kill in dev
}
```

### Custom Webhook Handling

```javascript
const guard = agentGuard.init({
  limit: 100,
  webhook: process.env.WEBHOOK_URL
});

// Webhook receives POST with:
{
  "text": "AGENTGUARD: COST LIMIT EXCEEDED - Saved you ~$400.00",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "cost": 100.2345,
  "limit": 100
}
```

### Browser Usage

```html
<script src="https://unpkg.com/agent-guard/dist/agent-guard.min.js"></script>
<script>
  const guard = AgentGuard.init({ 
    limit: 25,
    silent: false 
  });
  
  // Browser agent code
  async function runAgent() {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      // ...
    });
    console.log(await response.json()); // Tracked by AgentGuard
  }
</script>
```

## TypeScript Support

AgentGuard includes TypeScript definitions:

```typescript
import { init, AgentGuardConfig, AgentGuardInstance } from 'agent-guard';

const config: AgentGuardConfig = {
  limit: 50,
  mode: 'throw',
  webhook: process.env.SLACK_WEBHOOK
};

const guard: AgentGuardInstance = await init(config);

// Type-safe access to methods
const cost: number | null = guard.getCost();
const logs = guard.getLogs(); // Typed as ApiCallLog[]
```

## Best Practices

1. **Initialize Early**: Call `init()` before any AI API usage
2. **Set Appropriate Limits**: Consider your use case and budget
3. **Use Throw Mode for Graceful Handling**: Allows cleanup before exit
4. **Monitor in Production**: Use webhooks for alerts
5. **Test Limits**: Verify protection works in development
6. **Multi-Process Apps**: Use Redis for shared budgets
7. **Regular Price Updates**: Prices update automatically, but can be triggered manually

## Troubleshooting

### Not Tracking Costs
- Ensure you're logging API responses: `console.log(response)`
- Check that response includes usage/token information
- Verify AgentGuard is initialized before API calls

### Redis Connection Issues
- AgentGuard falls back to local tracking on Redis errors
- Check Redis URL and connectivity
- Monitor console warnings for connection issues

### Webhook Not Firing
- Verify webhook URL is correct and accessible
- Check for network/firewall issues
- Monitor console for webhook errors

### Process Not Killing
- Ensure `mode: 'kill'` is set (default)
- Check if another error handler is catching the exit
- Verify the limit hasn't been increased dynamically