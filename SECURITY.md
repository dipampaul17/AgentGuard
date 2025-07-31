# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously at AgentGuard. If you discover a security vulnerability, please follow these steps:

1. **DO NOT** create a public GitHub issue
2. Create a private security advisory on GitHub or email the repository owner
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

You can expect:
- Acknowledgment within 48 hours
- Regular updates on progress
- Credit in the fix announcement (unless you prefer anonymity)

## Security Considerations

### 1. Process Termination
AgentGuard can terminate your process when cost limits are exceeded. Consider:
- Use `mode: 'throw'` for graceful shutdown in production
- Implement proper error handling
- Save state before expensive operations

### 2. Webhook URLs
Webhook URLs may contain sensitive tokens:
- Store webhook URLs in environment variables
- Never commit webhook URLs to version control
- Use HTTPS webhooks only

### 3. Redis Security
When using Redis for multi-process tracking:
- Use authentication (requirepass)
- Use TLS/SSL for connections
- Restrict network access
- Regular security updates

### 4. API Response Interception
AgentGuard intercepts console.log and fetch:
- May capture sensitive data in API responses
- Logs are stored in memory
- Clear logs regularly with `guard.reset()`

### 5. Cost Limit Bypass
Potential bypass scenarios:
- Direct API calls without logging
- Custom HTTP clients
- Disabling AgentGuard with `guard.disable()`

Mitigations:
- Initialize AgentGuard before any imports
- Use supported HTTP clients
- Monitor actual bills

## Best Practices

### Environment Variables
```javascript
const guard = agentGuard.init({
  limit: parseInt(process.env.AGENTGUARD_LIMIT) || 50,
  webhook: process.env.AGENTGUARD_WEBHOOK,
  redis: process.env.REDIS_URL
});
```

### Secure Webhook Handling
```javascript
// Validate webhook URL
const webhookUrl = process.env.WEBHOOK_URL;
if (webhookUrl && !webhookUrl.startsWith('https://')) {
  throw new Error('Webhook must use HTTPS');
}
```

### Production Configuration
```javascript
const guard = agentGuard.init({
  limit: process.env.NODE_ENV === 'production' ? 100 : 10,
  mode: process.env.NODE_ENV === 'production' ? 'throw' : 'kill',
  silent: process.env.NODE_ENV === 'production'
});
```

### Graceful Shutdown
```javascript
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  // Save state
  await saveAgentState();
  // Log final costs
  console.log(`Final cost: $${guard.getCost()}`);
  process.exit(0);
});
```

## Security Audit Checklist

- [ ] Webhook URLs stored securely
- [ ] Redis connection uses auth
- [ ] Error handling for cost limits
- [ ] No sensitive data in logs
- [ ] Regular dependency updates
- [ ] Appropriate cost limits set
- [ ] Monitoring actual API bills

## Dependencies

AgentGuard has minimal dependencies:
- `tiktoken` - OpenAI's official tokenizer
- `@anthropic-ai/tokenizer` - Anthropic's tokenizer
- `redis` (optional) - For multi-process support

All dependencies are regularly updated and security-scanned.

## Compliance

AgentGuard:
- Does not store or transmit user data
- Does not require external services (except optional Redis)
- Runs entirely in your process
- Open source (MIT license)