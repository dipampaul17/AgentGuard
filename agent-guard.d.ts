/**
 * AgentGuard - Emergency Cost Stop for AI Agents
 * TypeScript definitions
 */

declare module 'agent-guard' {
  /**
   * Configuration options for AgentGuard initialization
   */
  export interface AgentGuardConfig {
    /**
     * Cost limit in USD. Process will be killed when this limit is exceeded.
     * @default 10
     */
    limit: number;

    /**
     * Webhook URL for notifications when limit is reached.
     * Supports Slack, Discord, and custom endpoints.
     * @default null
     */
    webhook?: string | null;

    /**
     * Whether AgentGuard is enabled.
     * @default true
     */
    enabled?: boolean;

    /**
     * Suppress console output for cost updates.
     * @default false
     */
    silent?: boolean;

    /**
     * Action to take when limit is reached.
     * - 'kill': Terminate the process immediately
     * - 'throw': Throw an error that can be caught
     * - 'notify': Log warning and continue execution
     * @default 'kill'
     */
    mode?: 'kill' | 'throw' | 'notify';

    /**
     * Redis URL for multi-process budget tracking.
     * When provided, budget is shared across all processes.
     * @default null
     */
    redis?: string | null;
  }

  /**
   * API call log entry
   */
  export interface ApiCallLog {
    /**
     * Timestamp of the API call
     */
    timestamp: number;

    /**
     * Model used for the API call
     */
    model: string;

    /**
     * Cost of the API call in USD
     */
    cost: number;

    /**
     * Token usage for the API call
     */
    tokens: {
      input: number;
      output: number;
    };

    /**
     * Optional URL of the API endpoint
     */
    url?: string;
  }

  /**
   * AgentGuard instance returned by init()
   */
  export interface AgentGuardInstance {
    /**
     * Get the current accumulated cost in USD.
     * Returns null when using Redis mode (multi-process tracking).
     */
    getCost(): number | null;

    /**
     * Get the current cost limit in USD.
     */
    getLimit(): number;

    /**
     * Update the cost limit dynamically.
     * @param newLimit New cost limit in USD
     */
    setLimit(newLimit: number): void;

    /**
     * Change the mode dynamically.
     * @param newMode New mode for handling limit exceeded
     */
    setMode(newMode: 'kill' | 'throw' | 'notify'): void;

    /**
     * Disable AgentGuard monitoring.
     */
    disable(): void;

    /**
     * Get the log of all tracked API calls.
     * Returns a copy of the internal log array.
     */
    getLogs(): ApiCallLog[];

    /**
     * Manually update prices from live APIs.
     * This happens automatically on init, but can be triggered manually.
     */
    updatePrices(): Promise<void>;

    /**
     * Reset the cost counter to zero and clear logs.
     * In Redis mode, this also clears the shared budget.
     */
    reset(): Promise<void>;
  }

  /**
   * Model pricing information
   */
  export interface ModelPricing {
    /**
     * Cost per 1K input tokens in USD
     */
    input: number;

    /**
     * Cost per 1K output tokens in USD
     */
    output: number;
  }

  /**
   * Available model pricing
   */
  export interface ApiCosts {
    // OpenAI models
    'gpt-4': ModelPricing;
    'gpt-4-turbo': ModelPricing;
    'gpt-3.5-turbo': ModelPricing;
    'gpt-4o': ModelPricing;
    'gpt-4o-mini': ModelPricing;
    
    // Anthropic models
    'claude-3-opus': ModelPricing;
    'claude-3-sonnet': ModelPricing;
    'claude-3-haiku': ModelPricing;
    'claude-3-5-sonnet': ModelPricing;
    
    // Default fallback
    'default': ModelPricing;
    
    // Allow custom models
    [key: string]: ModelPricing;
  }

  /**
   * Initialize AgentGuard with the specified configuration.
   * This should be called once at the start of your application.
   * 
   * @param options Configuration options
   * @returns AgentGuard instance for runtime control
   * 
   * @example
   * ```typescript
   * import { init } from 'agent-guard';
   * 
   * const guard = init({ 
   *   limit: 50,
   *   webhook: 'https://hooks.slack.com/...',
   *   mode: 'throw'
   * });
   * 
   * // Check current cost
   * console.log(`Current cost: $${guard.getCost()}`);
   * ```
   */
  export function init(options: AgentGuardConfig): Promise<AgentGuardInstance>;

  /**
   * Update model prices from live APIs.
   * This is called automatically on init, but can be triggered manually.
   * 
   * @example
   * ```typescript
   * import { updatePrices } from 'agent-guard';
   * 
   * // Manually refresh prices
   * await updatePrices();
   * ```
   */
  export function updatePrices(): Promise<void>;

  /**
   * Default export
   */
  const agentGuard: {
    init: typeof init;
    updatePrices: typeof updatePrices;
  };

  export default agentGuard;
}