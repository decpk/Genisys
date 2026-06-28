import { Trash2 } from 'lucide-react'

import type { PresentationCardProps } from './PresentationCard.types'

export function PresentationCard(props: PresentationCardProps): React.JSX.Element {
  const { presentation, onSelect, onRemove } = props
  const slideLabel = presentation.slideCount === 1 ? 'slide' : 'slides'

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onSelect(presentation.id)}
        className="block w-full overflow-hidden rounded-lg border border-border/50 text-left transition hover:border-primary/50 hover:shadow-md"
      >
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 p-4">
          <span className="line-clamp-3 text-center text-base font-semibold text-white/90">
            {presentation.title}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{presentation.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {presentation.slideCount} {slideLabel}
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onRemove(presentation.id)}
        aria-label="Delete presentation"
        className="absolute right-2 top-2 rounded-md bg-black/40 p-1 text-white/80 opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
