import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import type { ToolModule } from '@/ai/tools/tools.types'

/**
 * Single source of truth for "which AI assistant modes are read-only?".
 *
 * `'plan'` and `'ask'` are read-only — write tools must not be advertised
 * to the model AND must not be executable even if the model hallucinates
 * a write tool call. `'agent'` is unrestricted.
 *
 * Unknown / undefined values fail closed (treated as read-only) so a
 * future mode that isn't explicitly opted into write access can't
 * accidentally inherit the agent permissions.
 */
export function isReadOnlyAgentMode(mode: AgentMode | null | undefined): boolean {
  return mode !== 'agent'
}

/**
 * Filter a tool-definition array down to read-only tools when the panel
 * is running in a read-only mode. In `'agent'` mode the original array
 * is returned untouched.
 *
 * `readToolNames` is a per-surface allowlist of tool names that are
 * considered safe in read-only modes.
 */
export function filterToolDefinitionsByMode<T extends ToolModule['definition']>(
  mode: AgentMode | null | undefined,
  definitions: T[],
  readToolNames: ReadonlySet<string>,
): T[] {
  if (!isReadOnlyAgentMode(mode)) return definitions
  return definitions.filter((def) => readToolNames.has(def.function.name))
}

/**
 * Build a predicate that the agentic loop uses as a defence-in-depth
 * check before dispatching a tool call. Even if a write tool slipped
 * through the definitions filter (or the model hallucinated a write
 * tool name), this guard rejects the call before `execute()` runs.
 */
export function createIsToolAllowedForMode(
  mode: AgentMode | null | undefined,
  readToolNames: ReadonlySet<string>,
): (toolName: string) => boolean {
  if (!isReadOnlyAgentMode(mode)) return () => true
  return (toolName: string) => readToolNames.has(toolName)
}

/**
 * The exact message returned to the model when a tool call is blocked
 * by the current mode. Phrased to nudge the model toward producing a
 * final textual answer instead of retrying another write tool.
 */
export function buildBlockedToolMessage(
  mode: AgentMode | null | undefined,
  toolName: string,
): string {
  const label = mode === 'plan' ? 'Plan' : mode === 'ask' ? 'Ask' : 'read-only'
  return (
    `Tool "${toolName}" is not available in ${label} mode. ` +
    `${label} mode is read-only — write, edit, and destructive tools are disabled. ` +
    `If the user wants this change applied, ask them to switch to Agent mode. ` +
    `Otherwise, continue with read-only tools or produce a final textual answer.`
  )
}
