import { Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SlideThumbnail } from '@/components/Webpoint/components/SlideThumbnail'

import type { SlideRowProps } from './SlideRow.types'

export function SlideRow(props: SlideRowProps): React.JSX.Element {
  const { slide, index, isActive, onSelect, onRemove } = props

  return (
    <div className="group flex items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(slide.id)}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-md p-1.5 text-left',
          isActive && 'bg-accent',
          !isActive && 'hover:bg-accent/50'
        )}
      >
        <span className="w-4 shrink-0 text-center text-xs text-muted-foreground">{index + 1}</span>
        <span className="aspect-video h-9 shrink-0 overflow-hidden rounded border border-border/40">
          <SlideThumbnail data={slide.data} />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{slide.title}</span>
      </button>
      <button
        type="button"
        onClick={() => onRemove(slide.id)}
        aria-label="Delete slide"
        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
