import { Wand2, X } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'

import { useAnalyzePendingImagesButtonData } from './useAnalyzePendingImagesButtonData'

const TOOLTIP_IDLE = (
  <div className="flex flex-col gap-1 text-xs w-60">
    <span className="font-medium text-sm">Analyze pending images</span>
    <span className="text-muted-foreground leading-relaxed">
      Run AI image analysis (description + extracted text) for every loaded image
      that has not been analyzed yet, or whose previous analysis failed.
      Processed one at a time so the model isn’t hammered.
    </span>
  </div>
)

const TOOLTIP_RUNNING = (
  <div className="flex flex-col gap-1 text-xs w-56">
    <span className="font-medium text-sm">Analysis in progress</span>
    <span className="text-muted-foreground leading-relaxed">
      Click to stop after the current image finishes.
    </span>
  </div>
)

export function AnalyzePendingImagesButton(): React.JSX.Element | null {
  const { pendingCount, isAnalyzing, progress, handleClick } = useAnalyzePendingImagesButtonData()

  // Hide entirely when there's nothing to do and no batch is running.
  if (!isAnalyzing && pendingCount === 0) return null

  const label = isAnalyzing
    ? `${progress.current}/${progress.total}`
    : pendingCount.toString()

  return (
    <Tooltip
      content={isAnalyzing ? TOOLTIP_RUNNING : TOOLTIP_IDLE}
      side="bottom"
      variant="popover"
      interactive
      className="!whitespace-normal"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          isAnalyzing
            ? `Cancel analysis (${progress.current} of ${progress.total} done)`
            : `Analyze ${pendingCount} pending image${pendingCount === 1 ? '' : 's'} with AI`
        }
        className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-xs font-medium transition-colors tabular-nums ${
          isAnalyzing
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400'
            : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        {isAnalyzing ? (
          <>
            <AppLoaderGlyph size={14} />
            <span>{label}</span>
            <X size={12} className="opacity-70" />
          </>
        ) : (
          <>
            <Wand2 size={14} />
            <span>{label}</span>
          </>
        )}
      </button>
    </Tooltip>
  )
}
