import { Kbd } from '@/components/ui/kbd'
import { Tooltip } from '@/components/Tooltip'

import type { ShortcutTooltipProps } from './ShortcutTooltip.types'
import { useShortcutTooltipData } from './useShortcutTooltipData'

function ShortcutTooltipContent({ label, shortcutKeys }: { label: React.ReactNode; shortcutKeys: string }) {
  return (
    <span className="flex items-center gap-2">
      <span>{label}</span>
      <Kbd shortcut={shortcutKeys} variant="tooltip" />
    </span>
  )
}

function ShortcutTooltip({
  content,
  children,
  shortcutId,
  side,
  delayMs,
  className,
  interactive,
  expandedContent,
  expandDelayMs,
}: ShortcutTooltipProps) {
  const { shortcutKeys } = useShortcutTooltipData(shortcutId)

  const tooltipContent = shortcutKeys
    ? <ShortcutTooltipContent label={content} shortcutKeys={shortcutKeys} />
    : content

  return (
    <Tooltip
      content={tooltipContent}
      side={side}
      delayMs={delayMs}
      className={className}
      interactive={interactive}
      expandedContent={expandedContent}
      expandDelayMs={expandDelayMs}
    >
      {children}
    </Tooltip>
  )
}

export { ShortcutTooltip }
