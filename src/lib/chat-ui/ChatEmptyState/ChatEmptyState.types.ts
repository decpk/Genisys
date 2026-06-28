import type { LucideIcon } from 'lucide-react'

/**
 * A single suggestion chip rendered in the empty state.
 * Either a plain string (an icon will be auto-picked from keywords)
 * or an object that lets the caller override the icon/label.
 */
export type ChatEmptyStateSuggestion =
  | string
  | {
      /** Text shown on the chip and sent to `onSuggestionClick`. */
      text: string
      /** Optional icon override. When omitted, an icon is picked from `text`. */
      icon?: LucideIcon
    }

export interface ChatEmptyStateProps {
  /** Optional override for the hero title. */
  title?: string
  /** Optional secondary line under the title. Hidden when no suggestions. */
  subtitle?: string
  /** Optional override for the hero icon (defaults to `Sparkles`). */
  heroIcon?: LucideIcon
  /** Suggestion chips to render. */
  suggestions?: ChatEmptyStateSuggestion[]
  /** Called with the chip's plain text when clicked. */
  onSuggestionClick?: (text: string) => void
  /** Extra classes appended to the root wrapper. */
  className?: string
}
