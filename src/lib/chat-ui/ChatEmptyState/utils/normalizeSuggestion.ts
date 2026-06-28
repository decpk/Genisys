import type { ChatEmptyStateSuggestion } from '../ChatEmptyState.types'
import { pickSuggestionIcon } from './pickSuggestionIcon'
import { stripQuotes } from './stripQuotes'
import type { NormalizedChatSuggestion } from './normalizeSuggestion.types'

/**
 * Normalize a `ChatEmptyStateSuggestion` (string or object) into a uniform
 * `{ text, icon }` shape. Quotes around the raw text are stripped so chips
 * read cleanly regardless of how callers wrote the suggestion.
 */
export function normalizeSuggestion(s: ChatEmptyStateSuggestion): NormalizedChatSuggestion {
  if (typeof s === 'string') {
    const text = stripQuotes(s)
    return { text, icon: pickSuggestionIcon(text) }
  }
  const text = stripQuotes(s.text)
  const icon = s.icon ?? pickSuggestionIcon(text)
  return { text, icon }
}
