#!/usr/bin/env node

/**
 * AgentGuard + LangChain Example
 * Shows how to protect LangChain agents from runaway costs
 * 
 * This example demonstrates:
 * - Protecting LangChain agents and chains
 * - Multi-step reasoning with cost control
 * - Tool usage monitoring
 * - Automatic cost termination
 */

// Initialize AgentGuard FIRST
const agentGuard = require('../agent-guard');

async function runLangChainExample() {
  const guard = await agentGuard.init({ 
    limit: 5,  // $5 limit for this demo
    mode: 'throw' // Throw error instead of killing process for demo
  });

  console.log('🦜🔗 LangChain + AgentGuard Example\n');

// Simulate LangChain imports (in real usage, you'd use actual LangChain)
// const { ChatOpenAI } = require('langchain/chat_models/openai');
// const { ChatAnthropic } = require('langchain/chat_models/anthropic');
// const { AgentExecutor } = require('langchain/agents');

// Mock LangChain-style chain execution
class MockLangChainAgent {
  constructor(model = 'gpt-3.5-turbo') {
    this.model = model;
    this.tools = [];
    this.memory = [];
  }

  addTool(tool) {
    this.tools.push(tool);
  }

  async run(input) {
    console.log(`\n🤖 Agent processing: "${input}"`);
    
    // Simulate multiple LLM calls that LangChain would make
    const steps = [
      { step: 'Understanding query', tokens: { prompt: 150, completion: 100 } },
      { step: 'Planning approach', tokens: { prompt: 200, completion: 150 } },
      { step: 'Executing tools', tokens: { prompt: 300, completion: 200 } },
      { step: 'Synthesizing result', tokens: { prompt: 250, completion: 300 } }
    ];

    let result = '';
    
    for (const { step, tokens } of steps) {
      console.log(`\n  📍 ${step}...`);
      
      // Simulate API response that AgentGuard will track
      const response = {
        id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
        model: this.model,
        usage: {
          prompt_tokens: tokens.prompt,
          completion_tokens: tokens.completion,
          total_tokens: tokens.prompt + tokens.completion
        },
        choices: [{
          message: {
            role: 'assistant',
            content: `[${step}] Processing with ${this.tools.length} available tools...`
          }
        }]
      };
      
      // This triggers AgentGuard tracking
      console.log('LangChain API Response:', response);
      
      result += response.choices[0].message.content + '\n';
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show current cost
      console.log(`  💰 Current cost: $${guard.getCost().toFixed(4)}`);
    }
    
    return result;
  }
}

// Example: Research Agent with Multiple Tools
async function researchAgentExample() {
  console.log('📚 Research Agent Example');
  console.log('This agent uses multiple tools and can make many API calls...\n');
  
  const agent = new MockLangChainAgent('gpt-4');
  
  // Add mock tools
  agent.addTool({ name: 'web_search', description: 'Search the web' });
  agent.addTool({ name: 'calculator', description: 'Perform calculations' });
  agent.addTool({ name: 'code_interpreter', description: 'Execute code' });
  
  try {
    // Complex query that would trigger multiple API calls
    const result = await agent.run(
      'Research the latest AI developments, calculate the market size, and write code to analyze trends'
    );
    
    console.log('\n✅ Agent completed successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    if (error.message.includes('AGENTGUARD')) {
      console.log('\n⛔ Agent stopped by AgentGuard!');
      console.log('Cost limit exceeded - protecting your wallet');
    } else {
      throw error;
    }
  }
}

// Example: RAG Pipeline with Document Processing
async function ragPipelineExample() {
  console.log('\n\n📄 RAG Pipeline Example');
  console.log('Processing multiple documents with embeddings...\n');
  
  const documents = [
    'Technical specification document (50 pages)',
    'User manual (100 pages)',
    'API documentation (75 pages)',
    'Research papers (200 pages)'
  ];
  
  for (const doc of documents) {
    console.log(`\n📄 Processing: ${doc}`);
    
    // Simulate chunking and embedding
    const chunks = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i < chunks; i++) {
      // Embedding API call
      const embeddingResponse = {
        model: 'text-embedding-ada-002',
        usage: {
          prompt_tokens: Math.floor(Math.random() * 500) + 100,
          total_tokens: Math.floor(Math.random() * 500) + 100
        }
      };
      
      console.log(`  Chunk ${i + 1}/${chunks}:`, embeddingResponse);
      
      // QA generation for each chunk
      if (i % 3 === 0) {
        const qaResponse = {
          model: 'gpt-3.5-turbo',
          usage: {
            prompt_tokens: 200,
            completion_tokens: 150,
            total_tokens: 350
          }
        };
        console.log('  QA Generation:', qaResponse);
      }
    }
    
    console.log(`  💰 Total cost so far: $${guard.getCost().toFixed(4)}`);
    
    // Check if we should continue
    if (guard.getCost() > guard.getLimit() * 0.8) {
      console.log('\n⚠️  Approaching cost limit, stopping document processing...');
      break;
    }
  }
}

// Example: Multi-Agent Collaboration
async function multiAgentExample() {
  console.log('\n\n👥 Multi-Agent Collaboration Example');
  console.log('Multiple agents working together...\n');
  
  const agents = [
    { name: 'Researcher', model: 'gpt-4' },
    { name: 'Analyst', model: 'claude-3-sonnet' },
    { name: 'Writer', model: 'gpt-3.5-turbo' },
    { name: 'Reviewer', model: 'claude-3-haiku' }
  ];
  
  try {
    for (const { name, model } of agents) {
      const agent = new MockLangChainAgent(model);
      console.log(`\n👤 ${name} agent (${model}) starting work...`);
      
      await agent.run(`${name} task: Analyze and process the data`);
      
      // Agents might communicate
      if (Math.random() > 0.5) {
        console.log(`  💬 ${name} consulting with other agents...`);
        const consultResponse = {
          model: model,
          usage: {
            prompt_tokens: 100,
            completion_tokens: 100,
            total_tokens: 200
          }
        };
        console.log('  Consultation:', consultResponse);
      }
    }
    
  } catch (error) {
    if (error.message.includes('AGENTGUARD')) {
      console.log('\n🛑 Multi-agent system stopped by AgentGuard!');
      console.log(`Final cost: $${guard.getCost().toFixed(4)} (Limit: $${guard.getLimit()})`);
    } else {
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    // Show initial status
    console.log(`💰 Cost limit: $${guard.getLimit()}`);
    console.log('🛡️ AgentGuard is protecting your LangChain agents\n');
    
    // Run examples
    await researchAgentExample();
    
    if (guard.getCost() < guard.getLimit()) {
      await ragPipelineExample();
    }
    
    if (guard.getCost() < guard.getLimit()) {
      await multiAgentExample();
    }
    
    // Final summary
    console.log('\n\n📊 Final Summary:');
    console.log(`💰 Total cost: $${guard.getCost().toFixed(4)}`);
    console.log(`📞 API calls: ${guard.getLogs().length}`);
    
    const logs = guard.getLogs();
    const modelUsage = {};
    logs.forEach(log => {
      if (!modelUsage[log.model]) {
        modelUsage[log.model] = { calls: 0, cost: 0 };
      }
      modelUsage[log.model].calls++;
      modelUsage[log.model].cost += log.cost;
    });
    
    console.log('\n📈 Usage by model:');
    Object.entries(modelUsage).forEach(([model, stats]) => {
      console.log(`  ${model}: ${stats.calls} calls, $${stats.cost.toFixed(4)}`);
    });
    
  } catch (error) {
    if (error.message.includes('AGENTGUARD')) {
      console.log('\n💸 AgentGuard saved you from a costly mistake!');
      console.log(`Stopped at: $${guard.getCost().toFixed(4)}`);
      
      // Show what would have happened
      const estimatedTotal = guard.getLimit() * 3; // Rough estimate
      console.log(`Estimated cost without protection: $${estimatedTotal.toFixed(2)}+`);
      console.log(`Money saved: ~$${(estimatedTotal - guard.getCost()).toFixed(2)}`);
    } else {
      console.error('Error:', error);
    }
  }
}

  // Main execution
  await main();
}

// Run the example
runLangChainExample().catch(console.error);