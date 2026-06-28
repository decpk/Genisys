import type { AIEmptyStateConfig } from '../AIAssistantPanel.types'

export interface AIEmptyStateProps {
  config?: AIEmptyStateConfig
  onSuggestionClick?: (suggestion: string) => void
}
