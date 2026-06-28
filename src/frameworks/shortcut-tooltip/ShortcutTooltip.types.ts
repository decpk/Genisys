import type { TooltipSide } from '@/components/Tooltip/Tooltip.types'

export interface ShortcutTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  shortcutId: string
  side?: TooltipSide
  delayMs?: number
  className?: string
  interactive?: boolean
  expandedContent?: React.ReactNode
  expandDelayMs?: number
}
