import { Layers, Plus } from 'lucide-react'

import { SlideRow } from './components/SlideRow'
import { useSlidesSectionData } from './useSlidesSectionData'

export function SlidesSection(): React.JSX.Element | null {
  const { hasPresentation, slides, activeSlideId, onAdd, onSelect, onRemove } =
    useSlidesSectionData()

  if (!hasPresentation) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-10 items-center justify-between px-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Layers className="size-3.5" />
          <span>Slides</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add slide"
          className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-1.5 pb-2">
        {slides.map((slide, index) => (
          <SlideRow
            key={slide.id}
            slide={slide}
            index={index}
            isActive={slide.id === activeSlideId}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}
