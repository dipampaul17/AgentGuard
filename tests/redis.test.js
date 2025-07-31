const { init } = require('../agent-guard.js');
const redis = require('redis');

// Mock Redis client
jest.mock('redis', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    incrByFloat: jest.fn().mockResolvedValue(10.5),
    expire: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(undefined)
  };
  
  return {
    createClient: jest.fn(() => mockClient),
    _mockClient: mockClient // Expose for testing
  };
});

describe('AgentGuard Redis Integration', () => {
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
    
    // Clear mocks
    jest.clearAllMocks();
    logOutput = [];
    warnOutput = [];
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  describe('Redis Connection', () => {
    test('should connect to Redis when URL provided', async () => {
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      expect(redis.createClient).toHaveBeenCalledWith({ 
        url: 'redis://localhost:6379' 
      });
      expect(redis._mockClient.connect).toHaveBeenCalled();
    });

    test('should handle Redis connection failure gracefully', async () => {
      // Make connect fail
      redis._mockClient.connect.mockRejectedValueOnce(new Error('Connection refused'));
      
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      // Should warn but not throw
      expect(warnOutput.some(msg => 
        msg.includes('Redis connection failed')
      )).toBe(true);
    });
  });

  describe('Budget Tracking with Redis', () => {
    test('should use Redis for cost increment', async () => {
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      // Simulate API call
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 100, completion_tokens: 50 }
      };
      console.log(response);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(redis._mockClient.incrByFloat).toHaveBeenCalledWith(
        'agentguard:budget',
        expect.any(Number)
      );
      expect(redis._mockClient.expire).toHaveBeenCalledWith(
        'agentguard:budget',
        86400 // 24 hours
      );
    });

    test('should return null for getCost() in Redis mode', async () => {
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      expect(guard.getCost()).toBeNull();
    });

    test('should reset Redis budget on reset()', async () => {
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      await guard.reset();
      
      expect(redis._mockClient.del).toHaveBeenCalledWith('agentguard:budget');
    });

    test('should fall back to local tracking on Redis error', async () => {
      redis._mockClient.incrByFloat.mockRejectedValueOnce(new Error('Redis error'));
      
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      // Simulate API call
      const response = {
        model: 'gpt-3.5-turbo',
        usage: { prompt_tokens: 10, completion_tokens: 10 }
      };
      console.log(response);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should fall back to local tracking
      expect(guard.getCost()).toBeGreaterThan(0);
      expect(warnOutput.some(msg => 
        msg.includes('Redis increment failed')
      )).toBe(true);
    });
  });

  describe('Multi-Process Coordination', () => {
    test('should use shared budget across processes', async () => {
      // Simulate multiple processes
      redis._mockClient.incrByFloat
        .mockResolvedValueOnce(5.0)  // Process 1
        .mockResolvedValueOnce(10.0) // Process 2
        .mockResolvedValueOnce(15.0);// Process 3
      
      const guard1 = await init({ 
        limit: 20, 
        redis: 'redis://localhost:6379',
        silent: true 
      });
      
      // Simulate API calls from different "processes"
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 100, completion_tokens: 100 }
      };
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log(response);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // All increments should go to Redis
      expect(redis._mockClient.incrByFloat).toHaveBeenCalledTimes(3);
    });

    test('should trigger emergency stop based on Redis total', async () => {
      // Mock Redis returning value over limit
      redis._mockClient.incrByFloat.mockResolvedValueOnce(11.0);
      
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      const guard = await init({ 
        limit: 10, 
        redis: 'redis://localhost:6379',
        mode: 'kill',
        silent: true 
      });
      
      // Simulate API call that pushes over limit
      const response = {
        model: 'gpt-4',
        usage: { prompt_tokens: 1000, completion_tokens: 1000 }
      };
      console.log(response);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should have triggered emergency stop
      expect(logOutput.some(msg => 
        msg.includes('COST LIMIT EXCEEDED')
      )).toBe(true);
      
      mockExit.mockRestore();
    });
  });
});