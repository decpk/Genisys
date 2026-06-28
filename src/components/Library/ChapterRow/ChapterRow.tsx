import { memo } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { formatDuration } from '../utils/formatDuration'
import { STATUS_INDICATOR } from './ChapterRow.constants'
import type { ChapterRowProps } from './ChapterRow.types'

export const ChapterRow = memo(function ChapterRow({ chapter, onClick, onRetry }: ChapterRowProps): React.JSX.Element {
  const indicator = STATUS_INDICATOR[chapter.status] ?? STATUS_INDICATOR.pending
  const StatusIcon = indicator.icon
  const iconClass = chapter.status === 'completed' && chapter.isRead ? 'text-success/70' : indicator.class
  const isClickable = chapter.status === 'completed'

  const rowClass = isClickable
    ? 'cursor-pointer hover:bg-primary/[0.04]'
    : 'cursor-pointer'

  const numberClass = isClickable
    ? 'border-primary/25 bg-primary/10 text-primary font-semibold group-hover/row:bg-primary/15 group-hover/row:border-primary/35'
    : 'border-muted-foreground/15 bg-muted text-muted-foreground/60'

  const titleClass = isClickable
    ? 'text-foreground/80 group-hover/row:text-foreground'
    : 'text-foreground/30'

  const readBadge = chapter.isRead ? (
    <span className="text-[9px] font-medium text-success/50 bg-success/[0.08] border border-success/15 px-1.5 py-px rounded-full uppercase tracking-wider shrink-0">
      read
    </span>
  ) : null

  const durationBadge =
    chapter.status === 'completed' && chapter.generationDurationMs != null ? (
      <span
        className="text-[10px] tabular-nums text-muted-foreground/50 shrink-0"
        title={`Generated in ${formatDuration(chapter.generationDurationMs)}`}
      >
        {formatDuration(chapter.generationDurationMs)}
      </span>
    ) : null

  const arrow = isClickable ? (
    <ArrowRight
      size={13}
      className="shrink-0 text-transparent group-hover/row:text-primary/50 transition-all duration-200 -translate-x-1 group-hover/row:translate-x-0"
    />
  ) : null

  const retryButton = onRetry ? (
    <Button variant="ghost" size="icon-xs" onClick={onRetry} className="shrink-0 self-center">
      <RotateCcw size={11} />
    </Button>
  ) : null

  return (
    <div className={`group/row flex items-center gap-2 rounded-lg transition-colors duration-200 ${rowClass}`}>
      <button
        onClick={onClick}
        disabled={!isClickable}
        className="flex-1 flex items-center gap-3.5 px-3 py-3 text-left cursor-pointer"
      >
        {/* Chapter number badge */}
        <span
          className={`text-[11px] tabular-nums shrink-0 w-6 h-6 flex items-center justify-center rounded-full border font-medium transition-all duration-200 ${numberClass}`}
        >
          {chapter.chapterNumber}
        </span>

        {/* Title and meta */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          <span className={`text-[13.5px] leading-snug truncate transition-colors duration-200 ${titleClass}`}>
            {chapter.title}
          </span>
          {readBadge}
        </div>

        {/* Status icon */}
        {durationBadge}
        <StatusIcon size={13} className={`shrink-0 ${iconClass}`} />
        {arrow}
      </button>
      {retryButton}
    </div>
  )
})
