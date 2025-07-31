#!/usr/bin/env node

/**
 * REAL CUSTOMER WORKFLOW DEMO
 * Shows exactly how YC startups integrate AgentGuard
 * 
 * BEFORE: Customer has working agent that makes API calls
 * AFTER: Customer adds ONE LINE and gets cost protection
 */

console.log('\n🏢 YC STARTUP DEMO: Before vs After AgentGuard\n');

// ================================
// CUSTOMER'S EXISTING AGENT CODE
// ================================

const styles = {
  success: '\x1b[1m\x1b[32m',
  danger: '\x1b[1m\x1b[31m', 
  warning: '\x1b[1m\x1b[33m',
  info: '\x1b[1m\x1b[36m',
  dim: '\x1b[2m',
  reset: '\x1b[0m'
};

class CustomerAgent {
  constructor(hasProtection = false) {
    this.hasProtection = hasProtection;
    this.apiCalls = 0;
    
    if (hasProtection) {
      // THE ONLY LINE CUSTOMERS ADD:
      // Use require('agent-guard') if installed via NPM
      const agentGuard = require('../agent-guard');
      this.guard = agentGuard.init({ limit: 1.5 });
      console.log(`${styles.success}🛡️  AgentGuard protection enabled${styles.reset}`);
    } else {
      console.log(`${styles.danger}⚠️  Running without protection${styles.reset}`);
    }
  }

  // Customer's existing OpenAI wrapper
  async processWithOpenAI(content) {
    this.apiCalls++;
    console.log(`${styles.info}📞 OpenAI Call ${this.apiCalls}: Processing "${content.substring(0, 30)}..."${styles.reset}`);
    
    // Simulate their existing API response handling
    const response = {
      id: `chatcmpl-${this.apiCalls}`,
      object: 'chat.completion',
      model: 'gpt-4',
      usage: {
        prompt_tokens: Math.ceil(content.length / 4) + 50,
        completion_tokens: Math.floor(Math.random() * 1000) + 300,
        total_tokens: 0
      },
      choices: [{
        message: {
          role: 'assistant',
          content: `Processed: ${content.substring(0, 40)}...`
        },
        finish_reason: 'stop'
      }]
    };
    response.usage.total_tokens = response.usage.prompt_tokens + response.usage.completion_tokens;

    // Customer logs the response (AgentGuard intercepts this)
    console.log('OpenAI Response:', response);
    
    return response;
  }

  // Customer's recursive document processor (the dangerous part)
  async processDocumentRecursively(doc, depth = 0) {
    if (depth > 20) return; // Customer thinks this prevents infinite loops
    
    console.log(`${styles.dim}📄 Processing depth ${depth + 1}${styles.reset}`);
    
    // Process the document
    await this.processWithOpenAI(doc.content);
    
    // The bug: Always finds "related" documents to process
    const relatedDocs = [
      { content: `Related to ${doc.content} - analysis needed` },
      { content: `Follow-up to ${doc.content} - deeper review` }
    ];
    
    // Recursive processing (burns money)
    for (const related of relatedDocs) {
      await this.processDocumentRecursively(related, depth + 1);
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      console.log(`${styles.warning}🚀 Processing important document...${styles.reset}\n`);
      
      const document = {
        content: "Customer complaint about billing issues requires immediate analysis and response generation"
      };
      
      await this.processDocumentRecursively(document);
      
      console.log(`\n${styles.success}✅ Document processing completed${styles.reset}`);
      
    } catch (error) {
      const runtime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error.message.includes('AGENTGUARD_KILLED')) {
        console.log(`\n${styles.success}🛡️  AGENTGUARD PROTECTION ACTIVATED!${styles.reset}`);
        console.log(`${styles.success}⏱️  Stopped after ${runtime} seconds${styles.reset}`);
        console.log(`${styles.success}💰 Cost at stop: $${this.guard.getCost().toFixed(4)}${styles.reset}`);
        console.log(`${styles.success}📞 API calls made: ${this.guard.getLogs().length}${styles.reset}`);
        console.log(`${styles.success}💵 Estimated savings: $${(this.guard.getLimit() * 10).toFixed(2)}+${styles.reset}`);
      } else {
        console.log(`\n${styles.danger}💥 Unhandled error: ${error.message}${styles.reset}`);
      }
    }
  }
}

// ================================
// THE DEMO: BEFORE vs AFTER
// ================================

async function runDemo() {
  console.log(`${styles.info}═══════════════════════════════════════════${styles.reset}`);
  console.log(`${styles.info} SCENARIO: Customer Support Document Processor${styles.reset}`);
  console.log(`${styles.info}═══════════════════════════════════════════${styles.reset}\n`);
  
  console.log(`${styles.warning}📋 CUSTOMER SITUATION:${styles.reset}`);
  console.log(`${styles.dim}  • YC startup with AI document processor${styles.reset}`);
  console.log(`${styles.dim}  • Recursive algorithm with subtle bug${styles.reset}`);
  console.log(`${styles.dim}  • Can burn hundreds in runaway loops${styles.reset}\n`);
  
  console.log(`${styles.danger}❌ BEFORE: Running without AgentGuard${styles.reset}`);
  console.log(`${styles.dim}   (Simulating what would happen...)${styles.reset}\n`);
  
  const unprotectedAgent = new CustomerAgent(false);
  
  // Simulate the nightmare scenario
  console.log(`${styles.danger}   💸 Simulated costs:${styles.reset}`);
  console.log(`${styles.danger}   $0.50... $2.10... $5.80... $12.40... $28.90...${styles.reset}`);
  console.log(`${styles.danger}   💥 Process runs until manually stopped${styles.reset}`);
  console.log(`${styles.danger}   📧 Wake up to $500+ OpenAI bill${styles.reset}\n`);
  
  console.log(`${styles.success}✅ AFTER: Customer adds ONE line of AgentGuard${styles.reset}\n`);
  
  const protectedAgent = new CustomerAgent(true);
  await protectedAgent.run();
  
  console.log(`\n${styles.info}═══════════════════════════════════════════${styles.reset}`);
  console.log(`${styles.info} CUSTOMER VALUE PROPOSITION${styles.reset}`);
  console.log(`${styles.info}═══════════════════════════════════════════${styles.reset}`);
  
  console.log(`${styles.success}🎯 ONE LINE INSTALL:${styles.reset}`);
  console.log(`${styles.dim}   require('agent-guard').init({ limit: 50 });${styles.reset}\n`);
  
  console.log(`${styles.success}💰 IMMEDIATE VALUE:${styles.reset}`);
  console.log(`${styles.success}   ✅ Zero code changes required${styles.reset}`);
  console.log(`${styles.success}   ✅ Works with existing API calls${styles.reset}`);
  console.log(`${styles.success}   ✅ Kills runaway loops instantly${styles.reset}`);
  console.log(`${styles.success}   ✅ Saves hundreds per incident${styles.reset}\n`);
  
  console.log(`${styles.info}💡 WHY YC STARTUPS BUY TODAY:${styles.reset}`);
  console.log(`${styles.dim}   • Runaway costs kill runway${styles.reset}`);
  console.log(`${styles.dim}   • One bad loop = weeks of runway lost${styles.reset}`);
  console.log(`${styles.dim}   • $99/month vs $500+ incidents${styles.reset}`);
  console.log(`${styles.dim}   • Peace of mind for deployments${styles.reset}\n`);
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\n' + styles.warning + '⏹️  Demo interrupted' + styles.reset);
  process.exit(0);
});

// Run the compelling demo
runDemo().catch(error => {
  console.error(`\n${styles.danger}💥 Demo failed: ${error.message}${styles.reset}`);
  process.exit(1);
});