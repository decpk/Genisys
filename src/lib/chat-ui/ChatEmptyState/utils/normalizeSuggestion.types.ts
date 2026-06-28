/** Normalized suggestion produced by `normalizeSuggestion`. */
export interface NormalizedChatSuggestion {
  /** Stable React key + payload sent to the click handler. */
  text: string
  /** Resolved icon — either the caller's override or an auto-pick. */
  icon: import('lucide-react').LucideIcon
}
