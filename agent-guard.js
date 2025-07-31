/**
 * AgentGuard - Emergency Cost Stop for AI Agents
 * Prevents runaway LLM costs with real-time monitoring and auto-kill
 */

(function() {
  'use strict';

  // Cost per 1K tokens (USD) - Updated Dec 2024
  const API_COSTS = {
    // OpenAI
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    
    // Anthropic
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
    
    // Default fallback
    'default': { input: 0.01, output: 0.03 }
  };

  let config = {
    limit: 10,
    webhook: null,
    enabled: true,
    silent: false
  };

  let totalCost = 0;
  let isKilled = false;
  let lastDisplayTime = 0;

  // API call tracking
  const apiCallsLog = [];

  // Colors for terminal output
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
  };

  // Original methods to restore later
  const original = {
    log: console.log,
    fetch: typeof fetch !== 'undefined' ? fetch : null,
    exit: typeof process !== 'undefined' ? process.exit : null
  };

  function detectModel(url, data) {
    if (url.includes('openai.com')) {
      const model = data?.model || 'gpt-3.5-turbo';
      return model;
    }
    if (url.includes('anthropic.com')) {
      const model = data?.model || 'claude-3-haiku';
      return model;
    }
    return 'default';
  }

  function calculateCost(model, inputTokens = 0, outputTokens = 0) {
    const costs = API_COSTS[model] || API_COSTS['default'];
    const inputCost = (inputTokens / 1000) * costs.input;
    const outputCost = (outputTokens / 1000) * costs.output;
    return inputCost + outputCost;
  }

  function estimateTokens(text) {
    if (!text) return 0;
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  function extractTokensFromResponse(response, model) {
    try {
      if (response.usage) {
        return {
          input: response.usage.prompt_tokens || 0,
          output: response.usage.completion_tokens || 0
        };
      }
      
      // Fallback: estimate from content
      const content = response.choices?.[0]?.message?.content || 
                     response.content?.[0]?.text || 
                     JSON.stringify(response);
      
      return {
        input: estimateTokens(content) * 0.3, // Rough input estimate
        output: estimateTokens(content)
      };
    } catch (e) {
      return { input: 100, output: 100 }; // Conservative fallback
    }
  }

  function updateDisplay() {
    const now = Date.now();
    if (now - lastDisplayTime < 100) return; // Throttle updates
    lastDisplayTime = now;

    if (config.silent) return;

    const costStr = totalCost.toFixed(4);
    const percentage = ((totalCost / config.limit) * 100).toFixed(1);
    
    let badge = '';
    let status = '';
    
    if (totalCost > config.limit * 0.9) {
      badge = `${colors.red}${colors.bold}🚨 $${costStr}${colors.reset}`;
      status = ` ${colors.red}${colors.bold}DANGER ${percentage}%${colors.reset}`;
    } else if (totalCost > config.limit * 0.8) {
      badge = `${colors.yellow}${colors.bold}⚠️  $${costStr}${colors.reset}`;
      status = ` ${colors.yellow}WARNING ${percentage}%${colors.reset}`;
    } else if (totalCost > config.limit * 0.5) {
      badge = `${colors.cyan}💸 $${costStr}${colors.reset}`;
      status = ` ${colors.cyan}${percentage}%${colors.reset}`;
    } else {
      badge = `${colors.green}💸 $${costStr}${colors.reset}`;
      status = ` ${colors.green}${percentage}%${colors.reset}`;
    }

    // Terminal display with professional formatting
    if (typeof process !== 'undefined') {
      const displayLine = `${badge} / $${config.limit} ${status}`;
      process.stdout.write(`\r${displayLine}${' '.repeat(Math.max(0, 50 - displayLine.length))}`);
    }

    // Enhanced browser display
    if (typeof document !== 'undefined') {
      let widget = document.getElementById('agent-guard-widget');
      if (!widget) {
        widget = document.createElement('div');
        widget.id = 'agent-guard-widget';
        widget.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 99999;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #00ff88; padding: 12px 16px; border-radius: 8px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 14px; font-weight: 600; letter-spacing: 0.5px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
          border: 1px solid rgba(0,255,136,0.3);
          transition: all 0.3s ease;
        `;
        document.body.appendChild(widget);
      }
      
      widget.textContent = `💸 $${costStr} / $${config.limit} (${percentage}%)`;
      
      if (totalCost > config.limit * 0.9) {
        widget.style.background = 'linear-gradient(135deg, #ff1744 0%, #f50057 100%)';
        widget.style.color = '#fff';
        widget.style.borderColor = '#ff1744';
        widget.style.animation = 'pulse 1s infinite';
      } else if (totalCost > config.limit * 0.8) {
        widget.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
        widget.style.color = '#fff';
        widget.style.borderColor = '#ff9800';
      }
      
      // Add pulsing animation for critical state
      if (!document.getElementById('agentguard-styles')) {
        const style = document.createElement('style');
        style.id = 'agentguard-styles';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  async function sendWebhook(message) {
    if (!config.webhook) return;
    
    try {
      const payload = {
        text: message,
        timestamp: new Date().toISOString(),
        cost: totalCost,
        limit: config.limit
      };

      if (original.fetch) {
        await original.fetch(config.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (e) {
      original.log(`${colors.red}AgentGuard: Webhook failed${colors.reset}`, e.message);
    }
  }

  function emergencyStop(reason) {
    if (isKilled) return;
    isKilled = true;

    // Estimate how much we saved by stopping now vs letting it continue
    const estimatedSavings = Math.max(0, (config.limit * 5) - totalCost);
    const message = `🛑 AGENTGUARD: ${reason} - Saved you ~$${estimatedSavings.toFixed(2)}`;
    
    original.log(`\n${colors.red}${colors.bold}${message}${colors.reset}`);
    original.log(`${colors.cyan}Total cost when stopped: $${totalCost.toFixed(4)}${colors.reset}`);
    original.log(`${colors.yellow}📊 Budget used: ${((totalCost / config.limit) * 100).toFixed(1)}%${colors.reset}`);
    
    sendWebhook(message);

    // Kill immediately - no delay for runaway loops
    if (original.exit) {
      original.exit(1);
    } else if (typeof window !== 'undefined') {
      alert(`${message}\nReloading page...`);
      window.location.reload();
    } else {
      throw new Error('AGENTGUARD_KILLED: ' + message);
    }
  }

  function interceptConsole() {
    console.log = function(...args) {
      // Look for API response patterns in logs
      args.forEach(arg => {
        if (typeof arg === 'object' && arg !== null) {
          if (arg.choices || arg.content || arg.usage) {
            const model = arg.model || 'default';
            const tokens = extractTokensFromResponse(arg, model);
            const cost = calculateCost(model, tokens.input, tokens.output);
            
            totalCost += cost;
            apiCallsLog.push({
              timestamp: Date.now(),
              model,
              cost,
              tokens
            });

            updateDisplay();

            if (totalCost >= config.limit) {
              emergencyStop('COST LIMIT EXCEEDED');
              return;
            }
          }
        }
      });

      original.log.apply(console, args);
    };
  }

  function interceptFetch() {
    // Intercept native fetch
    if (typeof global !== 'undefined' && global.fetch) {
      global.fetch = wrapFetch(global.fetch);
    }
    if (typeof window !== 'undefined' && window.fetch) {
      window.fetch = wrapFetch(window.fetch);
    }
    
    // Intercept Node.js fetch (if available)
    if (typeof globalThis !== 'undefined' && globalThis.fetch) {
      globalThis.fetch = wrapFetch(globalThis.fetch);
    }
    
    // Intercept axios if present
    try {
      const axios = require('axios');
      if (axios && axios.interceptors) {
        axios.interceptors.response.use(
          response => {
            if (response.config && response.config.url) {
              handleAxiosResponse(response.config.url, response.data);
            }
            return response;
          },
          error => {
            if (error.response && error.response.config) {
              handleAxiosResponse(error.response.config.url, error.response.data);
            }
            return Promise.reject(error);
          }
        );
      }
    } catch (e) {
      // axios not available, skip
    }
  }

  function handleAxiosResponse(url, data) {
    if (url && (url.includes('openai.com') || url.includes('anthropic.com') || url.includes('api.anthropic.com'))) {
      try {
        const model = detectModel(url, data);
        const tokens = extractTokensFromResponse(data, model);
        const cost = calculateCost(model, tokens.input, tokens.output);
        
        totalCost += cost;
        apiCallsLog.push({
          timestamp: Date.now(),
          model,
          cost,
          tokens,
          url
        });

        updateDisplay();

        if (totalCost >= config.limit) {
          emergencyStop('COST LIMIT EXCEEDED');
        }
      } catch (e) {
        // Conservative fallback
        totalCost += 0.01;
        updateDisplay();
      }
    }
  }

  function wrapFetch(originalFetch) {
    return async function(url, options = {}) {
      const response = await originalFetch.call(this, url, options);
      
      // Check if this is an AI API call
      if (url && typeof url === 'string' && (url.includes('openai.com') || url.includes('anthropic.com') || url.includes('api.anthropic.com'))) {
        const clonedResponse = response.clone();
        
        try {
          const data = await clonedResponse.json();
          const requestBody = options.body ? JSON.parse(options.body) : {};
          const model = detectModel(url, requestBody);
          const tokens = extractTokensFromResponse(data, model);
          const cost = calculateCost(model, tokens.input, tokens.output);
          
          totalCost += cost;
          apiCallsLog.push({
            timestamp: Date.now(),
            model,
            cost,
            tokens,
            url
          });

          updateDisplay();

          if (totalCost >= config.limit) {
            emergencyStop('COST LIMIT EXCEEDED');
          }
        } catch (e) {
          // If we can't parse response, add conservative cost estimate
          totalCost += 0.01;
          updateDisplay();
        }
      }

      return response;
    };
  }

  // Main initialization function
  function init(options = {}) {
    config = { ...config, ...options };
    
    if (!config.enabled) return;

    const initMessage = `${colors.green}${colors.bold}🛡️  AgentGuard${colors.reset} ${colors.cyan}v1.0.0${colors.reset} ${colors.green}initialized${colors.reset}`;
    const limitMessage = `${colors.cyan}💰 Budget protection: $${config.limit}${colors.reset}`;
    const divider = colors.dim + '─'.repeat(50) + colors.reset;
    
    original.log('\n' + divider);
    original.log(initMessage);
    original.log(limitMessage);
    original.log(`${colors.dim}🔗 Monitoring: console.log, fetch, axios${colors.reset}`);
    original.log(divider + '\n');
    
    interceptConsole();
    interceptFetch();
    
    // Periodic cost display
    setInterval(updateDisplay, 5000);

    return {
      getCost: () => totalCost,
      getLimit: () => config.limit,
      setLimit: (newLimit) => { config.limit = newLimit; },
      disable: () => { config.enabled = false; },
      getLogs: () => [...apiCallsLog],
      reset: () => { 
        totalCost = 0; 
        apiCallsLog.length = 0;
        updateDisplay();
      }
    };
  }

  // Export for different environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init };
  } else if (typeof window !== 'undefined') {
    window.AgentGuard = { init };
  }

})();