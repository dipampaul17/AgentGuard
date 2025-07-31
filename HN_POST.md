Show HN: AgentGuard – Auto-kill AI agents before they burn through your budget

Your AI agent hits an infinite loop and racks up $2000 in API charges overnight. This happens weekly to AI developers.

AgentGuard monitors API calls in real-time and automatically kills your process when it hits your budget limit.

How it works:

Add 2 lines to any AI project:

  const agentGuard = require('agent-guard');
  await agentGuard.init({ limit: 50 }); // $50 budget

  // Your existing code runs unchanged
  const response = await openai.chat.completions.create({...});
  // AgentGuard tracks costs automatically

When your code hits $50 in API costs, AgentGuard stops execution and shows you exactly what happened.

Technical details:

*Zero integration overhead*: Patches console.log and HTTP clients to intercept API responses

*Real-time cost calculation*: Parses usage tokens from OpenAI/Anthropic responses

*Multi-process support*: Optional Redis backend for shared budgets across distributed systems

*Graceful failure modes*: throw (recoverable error), notify (warning only), or kill (hard exit)

*Framework agnostic*: Works with LangChain, raw API calls, or any HTTP client

Why I built this:

I got tired of seeing "I accidentally spent $500 on OpenAI" posts. Existing tools like tokencost help you *measure* costs after the fact, but nothing prevents runaway spending in real-time.

AgentGuard is essentially a circuit breaker for AI API costs. It's saved me from several costly bugs during development.

Limitations: Only works with OpenAI and Anthropic APIs currently. Cost calculations are estimates based on documented pricing.

Source: https://github.com/dipampaul17/AgentGuard

Install: npm install agent-guard

Demo: Try the examples in the repo – they simulate expensive API loops and show AgentGuard stopping them

The core library is ~30KB with zero dependencies. Been using it in production for months.

What other developer footguns could use this kind of real-time protection?