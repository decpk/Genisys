import type { AgentMode } from '../AgentModeSelector'

export interface ChatInputProps {
  onSend: (content: string, images?: string[]) => void
  isStreaming: boolean
  onStop: () => void
  widthStyle?: React.CSSProperties
  selectedModelId: string
  onModelChange: (modelId: string) => void
  selectedAgentMode: AgentMode
  onAgentModeChange: (mode: AgentMode) => void
  onBrowseFiles?: () => void
  onSelectRepo?: () => void
  onPasteText?: () => void
  sourceCount?: number
}
