// Mock fetch before requiring the module
const mockFetch = jest.fn().mockResolvedValue({ ok: true });
global.fetch = mockFetch;

const { init } = require('../agent-guard.js');

describe('AgentGuard Webhook Integration', () => {
  let originalConsoleLog;
  let logOutput = [];
  
  beforeEach(() => {
    // Capture console output
    originalConsoleLog = console.log;
    console.log = (...args) => logOutput.push(args.join(' '));
    
    // Reset mocks
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({ ok: true });
    logOutput = [];
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('Webhook Notifications', () => {
    test('should send webhook on limit exceeded', async () => {
      const webhookUrl = 'https://hooks.slack.com/test-webhook';
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 0.0001, 
        webhook: webhookUrl,
        mode: 'notify',
        silent: true 
      });
      
      // Trigger cost limit
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 100, completion_tokens: 100 }
      };
      console.log(response);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check webhook was called
      expect(mockFetch).toHaveBeenCalledWith(
        webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('COST LIMIT EXCEEDED')
        })
      );
      
      // Parse the body to check structure
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body).toMatchObject({
        text: expect.stringContaining('AGENTGUARD'),
        timestamp: expect.any(String),
        cost: expect.any(Number),
        limit: 0.0001
      });
      
      mockExit.mockRestore();
    });

    test('should handle webhook failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const webhookUrl = 'https://hooks.slack.com/test-webhook';
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 0.0001, 
        webhook: webhookUrl,
        mode: 'notify',
        silent: true 
      });
      
      // Trigger cost limit
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 100, completion_tokens: 100 }
      };
      console.log(response);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should log webhook failure
      expect(logOutput.some(msg => 
        msg.includes('Webhook failed')
      )).toBe(true);
      
      mockExit.mockRestore();
    });

    test('should include estimated savings in webhook', async () => {
      const webhookUrl = 'https://hooks.slack.com/test-webhook';
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 10, 
        webhook: webhookUrl,
        mode: 'notify',
        silent: true 
      });
      
      // Add some cost first
      for (let i = 0; i < 5; i++) {
        const response = {
          model: 'gpt-4',
          usage: { prompt_tokens: 1000, completion_tokens: 1000 }
        };
        console.log(response);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Check webhook was called
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('Saved you ~$');
      
      mockExit.mockRestore();
    });
  });

  describe('Webhook Formats', () => {
    test('should support Discord webhook format', async () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123/token';
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 0.0001, 
        webhook: webhookUrl,
        mode: 'notify',
        silent: true 
      });
      
      // Trigger cost limit
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 100, completion_tokens: 100 }
      };
      console.log(response);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Webhook should be called with standard format
      expect(mockFetch).toHaveBeenCalledWith(webhookUrl, expect.any(Object));
      
      mockExit.mockRestore();
    });

    test('should support custom webhook endpoints', async () => {
      const webhookUrl = 'https://api.company.com/alerts/cost-overrun';
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 0.0001, 
        webhook: webhookUrl,
        mode: 'notify',
        silent: true 
      });
      
      // Trigger cost limit
      const response = {
        model: 'claude-3-opus',
        usage: { input_tokens: 100, output_tokens: 100 }
      };
      console.log(response);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check webhook payload
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body).toHaveProperty('text');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('cost');
      expect(body).toHaveProperty('limit');
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
      
      mockExit.mockRestore();
    });
  });
});