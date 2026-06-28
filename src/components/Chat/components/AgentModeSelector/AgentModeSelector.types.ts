import type { AgentMode } from './AgentModeSelector.constants'

export interface AgentModeSelectorProps {
  selectedMode: AgentMode
  onModeChange: (mode: AgentMode) => void
}
