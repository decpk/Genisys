import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'

/**
 * Returns true when the active agent mode should auto-approve any
 * tool-confirmation prompt raised by an AI assistant runner.
 *
 * Currently, only `'agent'` mode bypasses user approval — `'ask'` and
 * `'plan'` always go through the standard confirmation panel.
 */
export function isAutoApproveAgentMode(mode: AgentMode | null | undefined): boolean {
  return mode === 'agent'
}
