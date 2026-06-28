export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: TooltipSide
  sideOffset?: number
  shortcut?: string
  delayMs?: number
  className?: string
  triggerClassName?: string
  interactive?: boolean
  variant?: 'default' | 'popover'
  disabled?: boolean
  /**
   * Optional richer content shown after the cursor has rested on the trigger
   * for `expandDelayMs`. While hovering, the simple `content` shows first;
   * once the expand delay elapses it is replaced by `expandedContent`, which
   * renders as an interactive `popover`-styled card. Omit for normal tooltips.
   */
  expandedContent?: React.ReactNode
  /** Delay (ms) before `expandedContent` replaces `content`. Default 5000. */
  expandDelayMs?: number
}
