#!/usr/bin/env node

/**
 * AgentGuard Example Usage
 * Shows how to integrate AgentGuard into a real AI agent
 */

// Initialize AgentGuard FIRST - before any other imports
const agentGuard = require('../agent-guard');
const guard = agentGuard.init({ 
  limit: 25,  // $25 limit for production agent
  webhook: process.env.SLACK_WEBHOOK_URL // Optional: get notified when stopped
});

console.log('🤖 Starting AI Agent with AgentGuard protection...\n');

// Simulate a real agent that makes multiple API calls
class AIAgent {
  constructor() {
    this.taskQueue = [];
    this.isRunning = false;
  }

  // Simulate OpenAI API call
  async callOpenAI(prompt, model = 'gpt-4') {
    try {
      // In real usage, this would be: const response = await openai.chat.completions.create(...)
      
      // For demo, we'll simulate the response
      const simulatedTokens = {
        prompt_tokens: prompt.length / 4, // rough estimate
        completion_tokens: Math.floor(Math.random() * 1000) + 200,
        total_tokens: 0
      };
      simulatedTokens.total_tokens = simulatedTokens.prompt_tokens + simulatedTokens.completion_tokens;

      const response = {
        id: 'chatcmpl-' + Math.random().toString(36),
        object: 'chat.completion',
        model: model,
        usage: simulatedTokens,
        choices: [{
          message: {
            role: 'assistant',
            content: `Response to: "${prompt.substring(0, 50)}..." [This would be the AI response]`
          },
          finish_reason: 'stop'
        }]
      };

      // This console.log triggers AgentGuard's cost tracking
      console.log('OpenAI Response:', response);
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      throw error;
    }
  }

  // Simulate Anthropic API call
  async callAnthropic(prompt, model = 'claude-3-sonnet-20240229') {
    try {
      const simulatedTokens = {
        prompt_tokens: prompt.length / 4,
        completion_tokens: Math.floor(Math.random() * 800) + 150,
        total_tokens: 0
      };
      simulatedTokens.total_tokens = simulatedTokens.prompt_tokens + simulatedTokens.completion_tokens;

      const response = {
        id: 'msg_' + Math.random().toString(36),
        model: model,
        usage: {
          input_tokens: simulatedTokens.prompt_tokens,
          output_tokens: simulatedTokens.completion_tokens
        },
        content: [{
          type: 'text',
          text: `Claude response to: "${prompt.substring(0, 50)}..." [This would be Claude's response]`
        }]
      };

      // This console.log triggers AgentGuard's cost tracking
      console.log('Anthropic Response:', response);
      
      return response.content[0].text;
    } catch (error) {
      console.error('❌ Anthropic API error:', error.message);
      throw error;
    }
  }

  async processTask(task) {
    console.log(`\n📋 Processing task: ${task.description}`);
    
    try {
      let result = '';
      
      switch (task.type) {
        case 'analyze':
          result = await this.callOpenAI(`Analyze this: ${task.data}`, 'gpt-4');
          break;
          
        case 'summarize':
          result = await this.callAnthropic(`Summarize this: ${task.data}`, 'claude-3-sonnet-20240229');
          break;
          
        case 'generate':
          result = await this.callOpenAI(`Generate content about: ${task.data}`, 'gpt-4-turbo');
          break;
          
        default:
          result = await this.callOpenAI(`Help with: ${task.data}`);
      }
      
      console.log(`✅ Task completed. Current cost: $${guard.getCost().toFixed(4)}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Task failed: ${error.message}`);
      throw error;
    }
  }

  async run() {
    this.isRunning = true;
    
    // Sample tasks that an AI agent might process
    const tasks = [
      { type: 'analyze', description: 'Market research analysis', data: 'Q4 2024 market trends in AI startups...' },
      { type: 'summarize', description: 'Meeting notes summary', data: 'Long meeting transcript about product roadmap...' },
      { type: 'generate', description: 'Blog post generation', data: 'The future of AI agents in enterprise...' },
      { type: 'analyze', description: 'Code review', data: 'Complex JavaScript codebase for performance optimization...' },
      { type: 'generate', description: 'Email drafting', data: 'Professional follow-up email to potential customers...' },
      { type: 'summarize', description: 'Research paper summary', data: 'Latest research on transformer architectures...' },
      // This could go on and potentially hit the cost limit
    ];

    console.log(`🚀 Agent starting with ${tasks.length} tasks in queue`);

    for (let i = 0; i < tasks.length && this.isRunning; i++) {
      try {
        await this.processTask(tasks[i]);
        
        // Small delay between tasks
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we're approaching the limit
        const currentCost = guard.getCost();
        const limit = guard.getLimit();
        
        if (currentCost > limit * 0.8) {
          console.log(`⚠️  Warning: Approaching cost limit ($${currentCost.toFixed(4)} / $${limit})`);
        }
        
      } catch (error) {
        console.error(`💥 Agent error: ${error.message}`);
        break;
      }
    }

    console.log('\n🏁 Agent completed or stopped');
    this.showFinalStats();
  }

  showFinalStats() {
    console.log('\n📊 Final Agent Statistics:');
    console.log(`💰 Total cost: $${guard.getCost().toFixed(4)}`);
    console.log(`🎯 Cost limit: $${guard.getLimit()}`);
    console.log(`📞 API calls made: ${guard.getLogs().length}`);
    
    const logs = guard.getLogs();
    if (logs.length > 0) {
      console.log('\n📋 API Call Breakdown:');
      const modelStats = {};
      logs.forEach(log => {
        if (!modelStats[log.model]) {
          modelStats[log.model] = { calls: 0, cost: 0, tokens: 0 };
        }
        modelStats[log.model].calls++;
        modelStats[log.model].cost += log.cost;
        modelStats[log.model].tokens += (log.tokens.input + log.tokens.output);
      });
      
      Object.entries(modelStats).forEach(([model, stats]) => {
        console.log(`   ${model}: ${stats.calls} calls, $${stats.cost.toFixed(4)}, ${stats.tokens} tokens`);
      });
    }

    const efficiency = guard.getLimit() > 0 ? (guard.getCost() / guard.getLimit() * 100).toFixed(1) : 0;
    console.log(`\n📈 Budget efficiency: ${efficiency}% of limit used`);
    
    if (guard.getCost() >= guard.getLimit()) {
      console.log('🛑 Agent was stopped by AgentGuard cost protection');
    } else {
      console.log('✅ Agent completed successfully within budget');
    }
  }

  stop() {
    this.isRunning = false;
    console.log('\n⏹️  Agent stopped by user');
  }
}

// Create and run the agent
const agent = new AIAgent();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down agent...');
  agent.stop();
  process.exit(0);
});

// Show AgentGuard status periodically
const statusInterval = setInterval(() => {
  if (guard.getCost() > 0) {
    process.stdout.write(`\r💸 Current cost: $${guard.getCost().toFixed(4)} / $${guard.getLimit()}    `);
  }
}, 2000);

// Clean up interval on exit
process.on('exit', () => {
  clearInterval(statusInterval);
});

// Start the agent
agent.run().catch(error => {
  console.error('\n💥 Agent crashed:', error.message);
  process.exit(1);
});