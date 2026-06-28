import type { AIConfirmAction } from '../AIAssistantPanel.types'

export interface ConfirmationPanelProps {
  confirm: AIConfirmAction
  onConfirm: () => void
  onCancel: () => void
}
