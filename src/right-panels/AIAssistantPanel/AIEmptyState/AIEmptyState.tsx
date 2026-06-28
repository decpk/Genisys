import { memo } from 'react'

import { ChatEmptyState } from '@/lib/chat-ui'
import type { AIEmptyStateProps } from './AIEmptyState.types'

const DEFAULT_SUGGESTIONS = [
  'Summarize this content',
  'Find related topics',
  'Explain this in simple terms',
]

/**
 * Thin backward-compatible adapter over the shared `ChatEmptyState`.
 * Keeps the AI Assistant panel's existing `config?: { title?, suggestions? }`
 * API while routing the actual rendering through the shared primitive so
 * Chat + every AI Assistant surface look identical.
 */
export const AIEmptyState = memo(function AIEmptyState(
  props: AIEmptyStateProps,
): React.JSX.Element {
  const { config, onSuggestionClick } = props
  const suggestions = config?.suggestions ?? DEFAULT_SUGGESTIONS

  return (
    <ChatEmptyState
      title={config?.title}
      suggestions={suggestions}
      onSuggestionClick={onSuggestionClick}
    />
  )
})
