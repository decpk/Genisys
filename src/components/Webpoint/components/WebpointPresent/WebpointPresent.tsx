import { useState } from 'react'

import { ChevronLeft, ChevronRight, StickyNote, X } from 'lucide-react'

import { SlideFrames } from '@/components/Webpoint/components/SlideFrames'
import { cn } from '@/lib/utils'

import { useWebpointPresentData } from './useWebpointPresentData'

const STAGE_STYLE: React.CSSProperties = {
  aspectRatio: '16 / 9',
  width: 'min(100%, calc((100vh - 56px) * 16 / 9))',
}

export function WebpointPresent(): React.JSX.Element {
  const { current, frames, index, total, onNext, onPrev, onExit } = useWebpointPresentData()
  const [showNotes, setShowNotes] = useState(false)

  const atStart = index <= 0
  const atEnd = index >= total - 1
  const notes = current?.notes ?? ''

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
        <div className="relative overflow-hidden bg-black shadow-2xl" style={STAGE_STYLE}>
          <SlideFrames {...frames} />
        </div>
      </div>

      {showNotes && (
        <div className="max-h-40 shrink-0 overflow-y-auto border-t border-white/10 bg-zinc-900 px-6 py-3">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-white/40">Speaker notes</p>
          <p className="whitespace-pre-wrap text-sm text-white/80">
            {notes || 'No notes for this slide.'}
          </p>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 bg-black/80 px-4 py-2 text-white/80">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit present mode"
          className="rounded-md p-1.5 transition hover:bg-white/10"
        >
          <X className="size-5" />
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={atStart}
            aria-label="Previous slide"
            className="rounded-md p-1.5 transition hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-xs tabular-nums">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={atEnd}
            aria-label="Next slide"
            className="rounded-md p-1.5 transition hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowNotes((v) => !v)}
          aria-label="Toggle speaker notes"
          className={cn('rounded-md p-1.5 transition hover:bg-white/10', showNotes && 'bg-white/15 text-white')}
        >
          <StickyNote className="size-5" />
        </button>
      </div>
    </div>
  )
}
