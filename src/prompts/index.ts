/**
 * Central barrel for every prompt in Genisys.
 *
 * All AI prompts (system prompts, user-prompt builders, instruction
 * snippets, prompt-library seed data) live as individual files in this
 * `src/prompts/` folder. Import them directly (`@/prompts/<name>`) or
 * through this barrel (`@/prompts`).
 */

// ── Shared core system-prompt fragments ────────────────────────────
export { buildToolBudgetGuidance, MAX_AGENTIC_ITERATIONS } from './toolBudgetGuidance'
export {
  composeCoreSystemPrompt,
  CORE_IDENTITY,
  CORE_INSTRUCTIONS,
  CORE_SECURITY,
  CORE_OPERATIONAL_SAFETY,
  CORE_IMPLEMENTATION_DISCIPLINE,
  CORE_TOOL_USE,
  CORE_COMMUNICATION_STYLE,
  CORE_PARALLELIZATION_STRATEGY,
  CORE_MEMORY_USAGE,
} from './coreSystemPrompt'
export type { ComposeCoreSystemPromptOptions } from './coreSystemPrompt'
export {
  SUB_AGENT_COORDINATION_INSTRUCTIONS,
  buildSubAgentCoordinationGuidance,
} from './subAgentCoordination'
export type { SubAgentCoordinationGuidanceOptions } from './subAgentCoordination'

// ── AI engines (Review / entity-links) ─────────────────────────────

export { ENTITY_TOKEN_PROMPT_RULE } from './entityTokenPromptRule'
