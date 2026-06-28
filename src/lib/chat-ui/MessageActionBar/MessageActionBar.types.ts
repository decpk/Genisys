import type { ReactNode } from 'react'

/**
 * A single action shown in a `MessageActionBar`.
 *
 * Provide either `node` (a fully self-rendered element such as `SpeakerButton`)
 * OR the standard fields (`icon` + `label` + `onClick`). When both are present
 * `node` wins.
 */
export interface MessageAction {
  /** Stable React key — also used as the default tooltip / aria label. */
  key: string
  /** Custom rendered node. When set, the standard fields are ignored. */
  node?: ReactNode
  /** Lucide icon (or any React node) rendered inside the button. */
  icon?: ReactNode
  /** Label rendered next to the icon when `variant="labeled"`. */
  label?: string
  /** Click handler for the standard button rendering. */
  onClick?: () => void
  /** Optional tooltip — defaults to `label` when omitted. */
  tooltip?: string
  /** When true, the action is omitted from the bar (cheaper than parent guards). */
  hidden?: boolean
  /** When true, button is rendered but disabled / non-interactive. */
  disabled?: boolean
}

export type MessageActionBarVariant = 'labeled' | 'iconOnly'

export interface MessageActionBarProps {
  /** Actions to render — order is preserved, hidden entries are skipped. */
  actions: MessageAction[]
  /**
   * Visual style of the bar.
   * - `labeled`  — pill buttons with icon + text (default for Chat).
   * - `iconOnly` — small square icon buttons (default for AI Assistant panel).
   */
  variant?: MessageActionBarVariant
  /**
   * Visibility behavior.
   * - `hover`  — fades in on parent `group-hover` (or local `group-hover`).
   * - `always` — always visible.
   */
  visibility?: 'hover' | 'always'
  /** Extra classes appended to the wrapper. */
  className?: string
}
