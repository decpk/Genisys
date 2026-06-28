import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import type { ExplorerAIMode } from '../ExplorerAIMode.constants'

const AGENT_TO_EXPLORER_MODE: Record<AgentMode, ExplorerAIMode> = {
  agent: 'fully-auto',
  plan: 'auto-safe',
  ask: 'manual',
}

export function mapAgentModeToExplorerMode(agentMode: AgentMode): ExplorerAIMode {
  return AGENT_TO_EXPLORER_MODE[agentMode] ?? 'manual'
}
