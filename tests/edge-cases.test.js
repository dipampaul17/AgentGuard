const { init } = require('../agent-guard.js');

describe('AgentGuard Edge Cases', () => {
  let originalConsoleLog;
  let originalConsoleWarn;
  let logOutput = [];
  let warnOutput = [];
  
  beforeEach(() => {
    // Capture console output
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    console.log = (...args) => logOutput.push(args.join(' '));
    console.warn = (...args) => warnOutput.push(args.join(' '));
    
    // Clear state
    jest.clearAllMocks();
    logOutput = [];
    warnOutput = [];
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  describe('Malformed API Responses', () => {
    test('should handle response without usage data', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const malformedResponse = {
        choices: [{ message: { content: "test response" } }],
        model: 'gpt-3.5-turbo'
      };
      
      console.log(malformedResponse);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should not crash and should track some cost
      expect(guard.getCost()).toBeGreaterThan(0);
    });

    test('should handle completely empty response', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      console.log({});
      console.log(null);
      console.log(undefined);
      
      // Should not crash
      expect(() => guard.getCost()).not.toThrow();
    });

    test('should handle non-object logs', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      console.log('string log');
      console.log(123);
      console.log(true);
      console.log(['array', 'log']);
      
      // Should not crash
      expect(() => guard.getCost()).not.toThrow();
    });

    test('should handle circular reference in response', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const circularResponse = {
        model: 'gpt-4',
        usage: { prompt_tokens: 10, completion_tokens: 10 }
      };
      circularResponse.circular = circularResponse;
      
      console.log(circularResponse);
      
      // Should not crash
      expect(() => guard.getCost()).not.toThrow();
    });
  });

  describe('Extreme Values', () => {
    test('should handle very large token counts', async () => {
      const guard = await init({ limit: 1000, silent: true });
      
      const response = {
        model: 'gpt-4',
        usage: {
          prompt_tokens: 1000000,
          completion_tokens: 1000000
        }
      };
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should calculate large cost correctly
      expect(guard.getCost()).toBeGreaterThan(100);
    });

    test('should handle zero token counts', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const response = {
        model: 'gpt-3.5-turbo',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0
        }
      };
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(guard.getCost()).toBe(0);
    });

    test('should handle negative values gracefully', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const response = {
        model: 'gpt-4',
        usage: {
          prompt_tokens: -100,
          completion_tokens: -50
        }
      };
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should not crash, cost should be 0 or positive
      expect(guard.getCost()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Model Detection Edge Cases', () => {
    test('should handle unknown models', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const response = {
        model: 'unknown-model-xyz',
        usage: { prompt_tokens: 100, completion_tokens: 100 }
      };
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should use default pricing
      expect(guard.getCost()).toBeGreaterThan(0);
    });

    test('should handle model variations', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const models = [
        'gpt-4-0314',
        'gpt-4-32k',
        'claude-3-opus-20240229',
        'gpt-3.5-turbo-16k'
      ];
      
      for (const model of models) {
        const response = {
          model,
          usage: { prompt_tokens: 10, completion_tokens: 10 }
        };
        console.log(response);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // All should be tracked
      expect(guard.getCost()).toBeGreaterThan(0);
      expect(guard.getLogs().length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle rapid consecutive API calls', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      // Simulate rapid API calls
      for (let i = 0; i < 10; i++) {
        const response = {
          model: 'gpt-3.5-turbo',
          usage: { prompt_tokens: 10, completion_tokens: 10 }
        };
        console.log(response);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // All calls should be tracked
      expect(guard.getLogs().length).toBeGreaterThanOrEqual(5);
    });

    test('should handle mixed model calls', async () => {
      const guard = await init({ limit: 10, silent: true });
      
      const calls = [
        { model: 'gpt-4', usage: { prompt_tokens: 10, completion_tokens: 10 } },
        { model: 'claude-3-opus', usage: { input_tokens: 10, output_tokens: 10 } },
        { model: 'gpt-3.5-turbo', usage: { prompt_tokens: 10, completion_tokens: 10 } },
        { model: 'claude-3-haiku', usage: { input_tokens: 10, output_tokens: 10 } }
      ];
      
      calls.forEach(call => console.log(call));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check logs contain different models
      const logs = guard.getLogs();
      const models = logs.map(log => log.model);
      expect(new Set(models).size).toBeGreaterThan(1);
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should handle missing configuration', async () => {
      const guard = await init({});
      
      // Should use defaults
      expect(guard.getLimit()).toBe(10);
    });

    test('should handle invalid limit values', async () => {
      const guard1 = await init({ limit: 0 });
      expect(guard1.getLimit()).toBe(0);
      
      const guard2 = await init({ limit: -10 });
      expect(guard2.getLimit()).toBe(-10); // Allow negative for testing
      
      const guard3 = await init({ limit: Infinity });
      expect(guard3.getLimit()).toBe(Infinity);
    });

    test('should handle mode changes during execution', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 0.0001, 
        mode: 'kill',
        silent: true 
      });
      
      // Change mode before triggering
      guard.setMode('notify');
      
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 100, completion_tokens: 100 }
      };
      console.log(response);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should not exit in notify mode
      expect(mockExit).not.toHaveBeenCalled();
      
      mockExit.mockRestore();
    });

    test('should handle disable during execution', async () => {
      const guard = await init({ limit: 0.0001, silent: true });
      
      guard.disable();
      
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 1000, completion_tokens: 1000 }
      };
      console.log(response);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should not track costs when disabled
      expect(guard.getCost()).toBe(0);
    });
  });

  describe('Memory and Performance', () => {
    test('should handle large number of API calls without memory leak', async () => {
      const guard = await init({ limit: 10000, silent: true });
      
      // Track initial memory
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate many API calls
      for (let i = 0; i < 1000; i++) {
        const response = {
          model: 'gpt-3.5-turbo',
          usage: { prompt_tokens: 1, completion_tokens: 1 }
        };
        console.log(response);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check memory didn't grow excessively (allow 10MB growth)
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
      
      // Logs should be tracked
      expect(guard.getLogs().length).toBeGreaterThan(100);
    });

    test('should throttle display updates', async () => {
      const guard = await init({ limit: 100, silent: false });
      
      const startTime = Date.now();
      
      // Rapid calls that would trigger many display updates
      for (let i = 0; i < 100; i++) {
        const response = {
          model: 'gpt-3.5-turbo',
          usage: { prompt_tokens: 1, completion_tokens: 1 }
        };
        console.log(response);
      }
      
      const endTime = Date.now();
      
      // Should complete quickly despite display updates
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});