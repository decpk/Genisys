import { memo } from 'react'
import { Play } from 'lucide-react'

import type { BookMeta } from '@/store/library-store'

import { useReadingProgress } from '../../hooks/useReadingProgress'
import { formatLastRead } from '../../utils/formatLastRead'

interface BookProgressCardProps {
  book: BookMeta
  onResume: (bookId: string) => void
}

function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export const BookProgressCard = memo(function BookProgressCard(
  props: BookProgressCardProps
): React.JSX.Element {
  const { book, onResume } = props
  const { percent } = useReadingProgress(book.id)
  const lastRead = formatLastRead(book.updatedAt)
  const initials = getInitials(book.title)

  const handleResume = (): void => onResume(book.id)
  const hasProgress = percent != null
  const barWidth = hasProgress ? percent : 0
  const metaLabel = hasProgress ? `${percent}%` : `${book.chapterCount} ch`

  return (
    <button
      type="button"
      onClick={handleResume}
      className="group/row relative w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-secondary/50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
    >
      {/* Cover stand-in */}
      <div className="relative h-9 w-9 shrink-0 rounded-md bg-gradient-to-br from-primary/25 to-primary/5 border border-border/40 flex items-center justify-center text-[10px] font-semibold text-primary/80 tracking-wide overflow-hidden">
        {initials}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-medium text-foreground truncate">
            {book.title}
          </span>
          <span className="text-[10px] text-muted-foreground/70 shrink-0 tabular-nums">
            {metaLabel}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-[3px] bg-secondary/70 rounded-full overflow-hidden">
            <div
              className={
                hasProgress
                  ? 'h-full bg-primary rounded-full transition-all duration-300'
                  : 'h-full bg-muted-foreground/20 rounded-full'
              }
              style={{ width: hasProgress ? `${barWidth}%` : '100%' }}
            />
          </div>
          {lastRead && (
            <span className="text-[10px] text-muted-foreground/70 shrink-0">
              {lastRead}
            </span>
          )}
        </div>
      </div>

      {/* Play affordance — appears on hover */}
      <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
        <Play size={12} className="translate-x-[1px]" fill="currentColor" />
      </div>
    </button>
  )
})
