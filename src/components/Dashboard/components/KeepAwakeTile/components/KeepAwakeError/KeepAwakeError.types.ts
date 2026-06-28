export interface KeepAwakeErrorProps {
  /** Human-readable failure / guidance message surfaced from the backend. */
  message: string
  /** When provided, renders an "Open Accessibility Settings" action button. */
  onOpenSettings?: () => void
  /** When provided, renders an "I've enabled it — retry" action button. */
  onRetry?: () => void
  /** Shows the "quit & reopen" fallback hint for stubborn TCC propagation. */
  showQuitHint?: boolean
}
