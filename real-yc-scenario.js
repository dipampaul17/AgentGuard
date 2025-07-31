#!/usr/bin/env node

/**
 * Real YC Startup Scenario: RAG-based Customer Support Agent
 * This simulates a realistic agent that YC startups actually build
 * 
 * Scenario: Processing customer tickets with document retrieval
 * Common pattern that burns money in infinite loops
 */

const fs = require('fs').promises;
const path = require('path');

// Initialize AgentGuard FIRST - $8 limit for demo
const agentGuard = require('./agent-guard');
const guard = agentGuard.init({ 
  limit: 8.0,
  webhook: null,
  silent: false 
});

// Beautiful terminal styling
const styles = {
  title: '\x1b[1m\x1b[36m',    // Bold cyan
  success: '\x1b[32m',          // Green
  warning: '\x1b[33m',          // Yellow
  error: '\x1b[31m',            // Red
  info: '\x1b[34m',             // Blue
  dim: '\x1b[2m',               // Dim
  reset: '\x1b[0m',             // Reset
  bold: '\x1b[1m',              // Bold
  box: '━'
};

function printHeader() {
  const width = 80;
  const title = " YC STARTUP: Customer Support RAG Agent ";
  const padding = Math.max(0, (width - title.length) / 2);
  
  console.log('\n' + styles.title + styles.box.repeat(width) + styles.reset);
  console.log(styles.title + ' '.repeat(Math.floor(padding)) + title + ' '.repeat(Math.ceil(padding)) + styles.reset);
  console.log(styles.title + styles.box.repeat(width) + styles.reset);
  console.log(`${styles.info}🏢 Scenario: Processing customer support tickets with RAG${styles.reset}`);
  console.log(`${styles.info}🛡️  Protected by AgentGuard (Limit: $${guard.getLimit()})${styles.reset}`);
  console.log(`${styles.dim}💡 This is what happens to YC startups without protection...${styles.reset}\n`);
}

// Simulate realistic customer tickets
const CUSTOMER_TICKETS = [
  {
    id: 'TICKET-001',
    customer: 'Acme Corp',
    priority: 'HIGH',
    issue: 'API integration failing with 429 rate limit errors, need immediate help',
    context: 'Enterprise customer, $50k/year contract, threatening to churn'
  },
  {
    id: 'TICKET-002', 
    customer: 'StartupX',
    priority: 'MEDIUM',
    issue: 'Dashboard showing incorrect analytics data for last 7 days',
    context: 'YC S24 company, growing fast, data accuracy critical for investors'
  },
  {
    id: 'TICKET-003',
    customer: 'TechFlow Inc',
    priority: 'LOW',
    issue: 'Feature request: bulk export functionality for user data',
    context: 'Compliance requirement for GDPR, affects EU expansion plans'
  },
  {
    id: 'TICKET-004',
    customer: 'DataDriven LLC', 
    priority: 'CRITICAL',
    issue: 'Complete service outage, all API endpoints returning 503 errors',
    context: 'Production system down, affecting 10k+ end users, revenue impact'
  },
  {
    id: 'TICKET-005',
    customer: 'BuildFast Co',
    priority: 'HIGH', 
    issue: 'Performance degradation, API response times increased 500% since yesterday',
    context: 'Series A startup, demo to investors tomorrow, needs urgent fix'
  }
];

// Simulate realistic knowledge base documents
const KNOWLEDGE_BASE = [
  {
    id: 'KB-API-001',
    title: 'API Rate Limiting and Error Handling',
    content: 'Our API implements rate limiting to ensure fair usage. When you exceed limits, you\'ll receive a 429 status code. To handle this: 1) Implement exponential backoff, 2) Cache responses when possible, 3) Use batch endpoints for bulk operations. For enterprise customers, we can increase rate limits upon request.'
  },
  {
    id: 'KB-ANALYTICS-002', 
    title: 'Analytics Data Processing and Accuracy',
    content: 'Analytics data is processed in real-time with eventual consistency. Recent data (last 24-48 hours) may show slight delays during high traffic periods. Data accuracy is guaranteed after 72 hours. For critical reporting, use our batch export APIs which provide point-in-time snapshots.'
  },
  {
    id: 'KB-EXPORT-003',
    title: 'Data Export and Compliance Features', 
    content: 'User data export is available through our Privacy API. Supports JSON, CSV, and XML formats. For GDPR compliance, use the /users/{id}/export endpoint with proper authentication. Bulk exports for enterprise customers can be scheduled through the admin dashboard.'
  },
  {
    id: 'KB-INFRASTRUCTURE-004',
    title: 'System Architecture and Reliability',
    content: 'Our infrastructure uses auto-scaling across multiple regions. Service outages are rare but monitored 24/7. Check status.company.com for real-time status. For critical issues, our SLA guarantees 4-hour response time for enterprise customers.'
  }
];

class CustomerSupportRAGAgent {
  constructor() {
    this.processingQueue = [];
    this.isRunning = false;
    this.processedTickets = 0;
    this.startTime = Date.now();
  }

  async embedText(text, purpose = 'search') {
    // Simulate OpenAI embedding API call
    const embeddingTokens = Math.ceil(text.length / 4);
    
    const response = {
      object: 'list',
      data: [{
        object: 'embedding',
        embedding: new Array(1536).fill(0).map(() => Math.random()),
        index: 0
      }],
      model: 'text-embedding-ada-002',
      usage: {
        prompt_tokens: embeddingTokens,
        total_tokens: embeddingTokens
      }
    };

    console.log(`${styles.dim}🔍 Embedding ${purpose}: ${embeddingTokens} tokens${styles.reset}`);
    console.log('OpenAI Embedding Response:', response);
    
    return response.data[0].embedding;
  }

  async searchKnowledgeBase(query, ticket) {
    console.log(`${styles.info}📚 Searching knowledge base for: "${query.substring(0, 50)}..."${styles.reset}`);
    
    // Embed the query (costs money)
    await this.embedText(query, 'query');
    
    // Embed each knowledge base document (costs more money!)
    const relevantDocs = [];
    for (const doc of KNOWLEDGE_BASE) {
      await this.embedText(doc.content, `KB-${doc.id}`);
      
      // Simulate relevance scoring
      const relevanceScore = Math.random();
      if (relevanceScore > 0.3) {
        relevantDocs.push({ ...doc, score: relevanceScore });
      }
    }
    
    return relevantDocs.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  async generateResponse(ticket, relevantDocs, attempt = 1) {
    const context = relevantDocs.map(doc => doc.content).join('\n\n');
    const prompt = `As a customer support specialist, help resolve this ticket:

CUSTOMER: ${ticket.customer} (${ticket.priority} priority)
ISSUE: ${ticket.issue}
CONTEXT: ${ticket.context}

RELEVANT KNOWLEDGE:
${context}

Provide a helpful, professional response that addresses the customer's specific needs.`;

    // Use different models based on priority (realistic YC pattern)
    const model = ticket.priority === 'CRITICAL' ? 'gpt-4' : 
                  ticket.priority === 'HIGH' ? 'gpt-4-turbo' : 'gpt-3.5-turbo';
    
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.floor(Math.random() * 800) + 400; // Realistic response length
    
    const response = {
      id: `chatcmpl-${ticket.id}-${attempt}`,
      object: 'chat.completion',
      model: model,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      choices: [{
        message: {
          role: 'assistant',
          content: `Dear ${ticket.customer},

Thank you for contacting our support team regarding "${ticket.issue}".

Based on our analysis and knowledge base, here's how we can resolve this:

[AI-generated response addressing the specific issue with technical details and next steps]

This solution takes into account your ${ticket.context.toLowerCase()}.

Please let us know if you need any clarification or additional assistance.

Best regards,
AI Support Agent`
        },
        finish_reason: 'stop'
      }]
    };

    console.log(`${styles.success}🤖 Generated response using ${model} (${response.usage.total_tokens} tokens)${styles.reset}`);
    console.log('OpenAI Response:', response);
    
    return response.choices[0].message.content;
  }

  async processTicket(ticket) {
    console.log(`\n${styles.bold}📬 Processing ${ticket.id}: ${ticket.customer}${styles.reset}`);
    console.log(`${styles.warning}⚡ ${ticket.priority} PRIORITY: ${ticket.issue}${styles.reset}`);
    
    try {
      // Step 1: Search knowledge base (multiple embeddings)
      const relevantDocs = await this.searchKnowledgeBase(ticket.issue, ticket);
      
      // Step 2: Generate initial response
      let response = await this.generateResponse(ticket, relevantDocs, 1);
      
      // Realistic YC pattern: If it's critical, do follow-up refinement (more cost!)
      if (ticket.priority === 'CRITICAL') {
        console.log(`${styles.warning}🔄 Critical ticket - refining response...${styles.reset}`);
        
        // Search for more specific info
        const refinedDocs = await this.searchKnowledgeBase(
          `${ticket.issue} ${ticket.context}`, ticket
        );
        
        // Generate refined response
        response = await this.generateResponse(ticket, refinedDocs, 2);
        
        // Often YC startups add ANOTHER iteration for critical issues...
        console.log(`${styles.warning}🔄 Double-checking critical response...${styles.reset}`);
        response = await this.generateResponse(ticket, refinedDocs, 3);
      }
      
      this.processedTickets++;
      const currentCost = guard.getCost();
      const efficiency = ((currentCost / guard.getLimit()) * 100).toFixed(1);
      
      console.log(`${styles.success}✅ ${ticket.id} resolved! Cost: $${currentCost.toFixed(4)} (${efficiency}% of budget)${styles.reset}`);
      
      // Realistic delay between tickets
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`${styles.error}❌ Failed to process ${ticket.id}: ${error.message}${styles.reset}`);
      throw error;
    }
  }

  async run() {
    this.isRunning = true;
    printHeader();
    
    console.log(`${styles.info}🚀 Starting to process ${CUSTOMER_TICKETS.length} customer tickets...${styles.reset}\n`);
    
    try {
      for (const ticket of CUSTOMER_TICKETS) {
        if (!this.isRunning) break;
        
        await this.processTicket(ticket);
        
        // Check if we're approaching limit (good practice)
        const currentCost = guard.getCost();
        if (currentCost > guard.getLimit() * 0.75) {
          console.log(`${styles.warning}⚠️  Warning: Approaching budget limit!${styles.reset}`);
        }
      }
      
      console.log(`\n${styles.success}🎉 All tickets processed successfully!${styles.reset}`);
      this.showFinalStats();
      
    } catch (error) {
      if (error.message.includes('AGENTGUARD_KILLED')) {
        console.log(`\n${styles.error}🛑 Agent was killed by AgentGuard protection!${styles.reset}`);
        this.showFinalStats();
      } else {
        console.log(`\n${styles.error}💥 Agent crashed: ${error.message}${styles.reset}`);
      }
    }
  }

  showFinalStats() {
    const runtime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log('\n' + styles.title + styles.box.repeat(60) + styles.reset);
    console.log(`${styles.title}📊 CUSTOMER SUPPORT AGENT FINAL REPORT${styles.reset}`);
    console.log(styles.title + styles.box.repeat(60) + styles.reset);
    
    console.log(`${styles.info}⏱️  Runtime: ${runtime} seconds${styles.reset}`);
    console.log(`${styles.info}📬 Tickets processed: ${this.processedTickets}/${CUSTOMER_TICKETS.length}${styles.reset}`);
    console.log(`${styles.info}💰 Total cost: $${guard.getCost().toFixed(4)}${styles.reset}`);
    console.log(`${styles.info}🎯 Budget limit: $${guard.getLimit()}${styles.reset}`);
    
    const efficiency = guard.getLimit() > 0 ? (guard.getCost() / guard.getLimit() * 100).toFixed(1) : 0;
    console.log(`${styles.info}📈 Budget utilization: ${efficiency}%${styles.reset}`);
    
    const logs = guard.getLogs();
    if (logs.length > 0) {
      console.log(`\n${styles.dim}📋 API Call Breakdown:${styles.reset}`);
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
        console.log(`${styles.dim}   ${model}: ${stats.calls} calls, $${stats.cost.toFixed(4)}, ${stats.tokens.toLocaleString()} tokens${styles.reset}`);
      });
    }
    
    if (guard.getCost() >= guard.getLimit()) {
      console.log(`\n${styles.error}🛡️  SAVED BY AGENTGUARD: Prevented runaway costs!${styles.reset}`);
      console.log(`${styles.success}💵 Estimated savings: $${(guard.getLimit() * 3).toFixed(2)}${styles.reset}`);
    } else {
      console.log(`\n${styles.success}✅ Agent completed successfully within budget${styles.reset}`);
    }
    
    console.log('\n' + styles.dim + 'This is why YC startups need AgentGuard.' + styles.reset);
  }

  stop() {
    this.isRunning = false;
    console.log(`\n${styles.warning}⏹️  Agent stopped by user${styles.reset}`);
  }
}

// Handle graceful shutdown
const agent = new CustomerSupportRAGAgent();

process.on('SIGINT', () => {
  console.log('\n');
  agent.stop();
  setTimeout(() => process.exit(0), 1000);
});

// Run the realistic YC scenario
agent.run().catch(error => {
  console.error(`\n${styles.error}💥 Unhandled error: ${error.message}${styles.reset}`);
  process.exit(1);
});