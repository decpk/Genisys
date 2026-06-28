import type { AISession } from '../AIAssistantPanel.types'

export interface SessionItemProps {
  session: AISession
  isActive: boolean
  onSelect: () => void
  onRemove: () => void
}
