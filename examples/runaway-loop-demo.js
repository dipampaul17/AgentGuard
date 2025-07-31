#!/usr/bin/env node

/**
 * RUNAWAY LOOP DEMO - The Nightmare Every YC Startup Fears
 * This simulates what happens when an agent gets stuck in an infinite loop
 * WITHOUT AgentGuard: $500+ burned overnight
 * WITH AgentGuard: Killed at $3, saves $497+
 */

// Initialize AgentGuard with LOW limit for dramatic demo
const agentGuard = require('./agent-guard');
const guard = agentGuard.init({ 
  limit: 3.0,  // Low limit to trigger kill switch quickly
  webhook: null,
  silent: false 
});

const styles = {
  danger: '\x1b[1m\x1b[31m',     // Bold red
  warning: '\x1b[1m\x1b[33m',    // Bold yellow
  success: '\x1b[1m\x1b[32m',    // Bold green
  info: '\x1b[1m\x1b[36m',       // Bold cyan
  dim: '\x1b[2m',                // Dim
  reset: '\x1b[0m',              // Reset
  box: '█'
};

function printDramaticHeader() {
  console.log('\n' + styles.danger + styles.box.repeat(80) + styles.reset);
  console.log(styles.danger + '██' + ' '.repeat(20) + 'RUNAWAY LOOP SIMULATION' + ' '.repeat(20) + '██' + styles.reset);
  console.log(styles.danger + '██' + ' '.repeat(15) + 'What Happens To YC Startups' + ' '.repeat(15) + '██' + styles.reset);
  console.log(styles.danger + '██' + ' '.repeat(12) + 'When Agents Get Stuck In Loops' + ' '.repeat(12) + '██' + styles.reset);
  console.log(styles.danger + styles.box.repeat(80) + styles.reset);
  
  console.log(`\n${styles.warning}⚠️  SCENARIO: RAG agent with recursive document processing${styles.reset}`);
  console.log(`${styles.warning}💥 BUG: Logic error causes infinite self-referencing${styles.reset}`);
  console.log(`${styles.warning}🔥 RESULT: Without AgentGuard = $500+ overnight burn${styles.reset}`);
  console.log(`${styles.info}🛡️  PROTECTION: AgentGuard kills at $${guard.getLimit()}${styles.reset}\n`);
}

// Simulate the type of recursive processing that burns money
class RunawayRAGAgent {
  constructor() {
    this.documentStack = [];
    this.processedDocs = 0;
    this.recursionDepth = 0;
    this.maxRecursion = 50; // This would go infinite without kill switch
  }

  async processDocumentRecursively(docId, content, parentContext = '') {
    this.recursionDepth++;
    this.processedDocs++;
    
    console.log(`${styles.warning}🔄 Processing doc ${docId} (depth: ${this.recursionDepth}, cost: $${guard.getCost().toFixed(4)})${styles.reset}`);

    // Step 1: Embed the document (costs money)
    await this.expensiveEmbedding(content, `document-${docId}`);
    
    // Step 2: Use GPT-4 to extract "related documents" (costs more money)
    const relatedDocs = await this.expensiveAnalysis(content, docId);
    
    // Step 3: THE BUG - Process each "related" document recursively
    // In real scenarios, this creates infinite loops when docs reference each other
    for (const relatedDoc of relatedDocs) {
      if (this.recursionDepth < this.maxRecursion) {
        // This is where the infinite loop happens in real YC startups
        await this.processDocumentRecursively(
          relatedDoc.id, 
          relatedDoc.content, 
          content.substring(0, 100)
        );
      }
    }
    
    this.recursionDepth--;
  }

  async expensiveEmbedding(text, purpose) {
    const tokens = Math.ceil(text.length / 3); // Generous token estimate
    
    const response = {
      object: 'list',
      data: [{ object: 'embedding', embedding: new Array(1536).fill(0), index: 0 }],
      model: 'text-embedding-ada-002',
      usage: { prompt_tokens: tokens, total_tokens: tokens }
    };

    console.log(`  🔍 Embedding ${purpose}: ${tokens} tokens`);
    console.log('OpenAI Embedding Response:', response);
    
    return response.data[0].embedding;
  }

  async expensiveAnalysis(content, docId) {
    // Simulate expensive GPT-4 call to find "related documents"
    const promptTokens = Math.ceil(content.length / 4) + 200; // System prompt overhead
    const completionTokens = Math.floor(Math.random() * 1200) + 800; // Long analysis
    
    const response = {
      id: `chatcmpl-analysis-${docId}`,
      object: 'chat.completion',
      model: 'gpt-4', // Expensive model
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      choices: [{
        message: {
          role: 'assistant',
          content: `Analysis of document ${docId}: Found ${Math.floor(Math.random() * 4) + 2} related documents that need processing...`
        },
        finish_reason: 'stop'
      }]
    };

    console.log(`  🤖 GPT-4 Analysis: ${response.usage.total_tokens} tokens`);
    console.log('OpenAI Analysis Response:', response);
    
    // Return fake "related documents" that create the recursive loop
    const numRelated = Math.floor(Math.random() * 3) + 2; // 2-4 related docs
    return Array.from({ length: numRelated }, (_, i) => ({
      id: `${docId}-ref-${i}`,
      content: `Related document ${i} referencing back to ${docId}. ${content.substring(0, 200)}...`
    }));
  }

  async startRunawayLoop() {
    printDramaticHeader();
    
    console.log(`${styles.info}🚀 Starting document processing agent...${styles.reset}\n`);
    
    // Initial document that starts the recursive nightmare
    const initialDoc = {
      id: 'root-doc',
      content: `This is the initial document that contains references to multiple other documents. 
      In a real RAG system, this would trigger recursive processing of related documents.
      Each document references others, creating an infinite loop that burns money.
      Common in customer support systems, legal document analysis, research agents, etc.
      Without proper guardrails, this pattern costs YC startups hundreds per night.
      The agent keeps finding "related" documents and processing them recursively.`
    };

    console.log(`${styles.warning}📄 Starting with: ${initialDoc.id}${styles.reset}`);
    console.log(`${styles.dim}Content preview: ${initialDoc.content.substring(0, 100)}...${styles.reset}\n`);

    try {
      await this.processDocumentRecursively(initialDoc.id, initialDoc.content);
      
      // This should never be reached due to kill switch
      console.log(`\n${styles.success}🎉 Processing completed (this should not print)${styles.reset}`);
      this.showStats(false);
      
    } catch (error) {
      if (error.message.includes('AGENTGUARD_KILLED')) {
        console.log(`\n${styles.success}🛡️  KILL SWITCH TRIGGERED!${styles.reset}`);
        console.log(`${styles.success}✅ AgentGuard prevented financial disaster${styles.reset}`);
        this.showStats(true);
      } else {
        console.log(`\n${styles.danger}💥 Unexpected error: ${error.message}${styles.reset}`);
      }
    }
  }

  showStats(wasSaved) {
    const runtime = Date.now() - this.startTime;
    
    console.log('\n' + styles.info + '━'.repeat(60) + styles.reset);
    console.log(`${styles.info}📊 RUNAWAY LOOP STATISTICS${styles.reset}`);
    console.log(styles.info + '━'.repeat(60) + styles.reset);
    
    console.log(`${styles.info}⏱️  Runtime: ${(runtime / 1000).toFixed(1)} seconds${styles.reset}`);
    console.log(`${styles.info}📄 Documents processed: ${this.processedDocs}${styles.reset}`);
    console.log(`${styles.info}🔄 Max recursion depth: ${this.recursionDepth}${styles.reset}`);
    console.log(`${styles.info}💰 Cost at termination: $${guard.getCost().toFixed(4)}${styles.reset}`);
    console.log(`${styles.info}🎯 Cost limit: $${guard.getLimit()}${styles.reset}`);
    
    const logs = guard.getLogs();
    if (logs.length > 0) {
      console.log(`${styles.info}📞 Total API calls: ${logs.length}${styles.reset}`);
      
      const modelStats = {};
      logs.forEach(log => {
        if (!modelStats[log.model]) {
          modelStats[log.model] = { calls: 0, cost: 0 };
        }
        modelStats[log.model].calls++;
        modelStats[log.model].cost += log.cost;
      });
      
      console.log(`${styles.dim}API breakdown:${styles.reset}`);
      Object.entries(modelStats).forEach(([model, stats]) => {
        console.log(`${styles.dim}  ${model}: ${stats.calls} calls, $${stats.cost.toFixed(4)}${styles.reset}`);
      });
    }
    
    if (wasSaved) {
      const estimatedWithoutGuard = guard.getLimit() * 10; // Conservative estimate
      console.log(`\n${styles.success}💵 MONEY SAVED: ~$${estimatedWithoutGuard.toFixed(2)}${styles.reset}`);
      console.log(`${styles.success}⏰ TIME SAVED: Infinite (loop would run forever)${styles.reset}`);
      console.log(`\n${styles.success}🎯 This is exactly why YC startups need AgentGuard.${styles.reset}`);
    } else {
      console.log(`\n${styles.danger}💸 WITHOUT AGENTGUARD: This would cost $500+${styles.reset}`);
    }
  }
}

// Start the dramatic demo
const agent = new RunawayRAGAgent();
agent.startTime = Date.now();

process.on('SIGINT', () => {
  console.log('\n\n' + styles.warning + '⏹️  Demo interrupted by user' + styles.reset);
  agent.showStats(false);
  process.exit(0);
});

console.log(styles.warning + '\n⚠️  WARNING: This demo simulates a runaway loop that burns money' + styles.reset);
console.log(styles.info + '🛡️  AgentGuard will kill it at $3 to demonstrate protection' + styles.reset);
console.log(styles.dim + '⏱️  Starting in 3 seconds...\n' + styles.reset);

setTimeout(() => {
  agent.startRunawayLoop().catch(error => {
    console.error(`\n${styles.danger}💥 Demo crashed: ${error.message}${styles.reset}`);
    process.exit(1);
  });
}, 3000);