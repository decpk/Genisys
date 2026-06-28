import { AlertCircle, Square, Sparkles, CheckCircle2, Timer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { useElapsedMs } from '../hooks/useElapsedMs'
import { formatDuration } from '../utils/formatDuration'
import { useGenerationStatus } from './GenerationStatus.hooks'

export function GenerationStatus(): React.JSX.Element | null {
  const {
    isGenerating,
    phase,
    currentChapterIndex,
    totalChapters,
    streamingContent,
    error,
    hasPending,
    chaptersExist,
    bookId,
    bookStartedAt,
    chapterStartedAt,
    generateAllChapters,
    stopGeneration,
  } = useGenerationStatus()

  const bookElapsedMs = useElapsedMs(isGenerating ? bookStartedAt : null)
  const chapterElapsedMs = useElapsedMs(isGenerating ? chapterStartedAt : null)

  const hasContent = isGenerating || !!error || (!isGenerating && hasPending && chaptersExist) || phase === 'done'
  if (!hasContent) return null

  const progressLabel =
    phase === 'generating-toc'
      ? 'Generating Table of Contents…'
      : `Generating chapter ${currentChapterIndex + 1} of ${totalChapters}`

  const progressSection = isGenerating ? (
    <div className="mb-10 border border-border/30 rounded-lg p-5 bg-muted/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <AppLoaderGlyph size={14} className="text-primary" />
          <span className="text-xs font-medium text-primary">
            {progressLabel}
          </span>
          {(chapterElapsedMs !== null || bookElapsedMs !== null) && (
            <div className="flex items-center gap-1.5 ml-1">
              {chapterElapsedMs !== null && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] tabular-nums text-muted-foreground/70 bg-muted/30 border border-border/30 px-1.5 py-0.5 rounded-full"
                  title="Time on current chapter"
                >
                  <Timer size={9} />
                  {formatDuration(chapterElapsedMs)}
                </span>
              )}
              {bookElapsedMs !== null && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] tabular-nums text-muted-foreground/60 px-1.5 py-0.5 rounded-full"
                  title="Total book generation time"
                >
                  total {formatDuration(bookElapsedMs)}
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={stopGeneration}
          className="text-muted-foreground hover:text-destructive"
        >
          <Square size={12} />
        </Button>
      </div>
      {totalChapters > 0 && (
        <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/70 rounded-full transition-all duration-500"
            style={{ width: `${(currentChapterIndex / totalChapters) * 100}%` }}
          />
        </div>
      )}
      {streamingContent && (
        <div className="mt-3 max-h-20 overflow-y-auto rounded bg-muted/30 p-2">
          <p className="text-[11px] text-muted-foreground/60 whitespace-pre-wrap line-clamp-5">
            {streamingContent.slice(-400)}
          </p>
        </div>
      )}
    </div>
  ) : null;

  const errorSection = error ? (
    <div className="mb-8 border border-destructive/20 rounded-lg p-4 bg-destructive/[0.02]">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle size={13} className="text-destructive" />
        <span className="text-xs font-medium text-destructive">Generation Failed</span>
      </div>
      <p className="text-xs text-destructive/60 ml-5">{error}</p>
    </div>
  ) : null

  const pendingSection =
    !isGenerating && hasPending && chaptersExist ? (
      <div className="mb-10 text-center">
        <Button size="sm" onClick={() => generateAllChapters(bookId)} className="gap-2">
          <Sparkles size={13} />
          Generate Remaining Chapters
        </Button>
      </div>
    ) : null

  const doneSection =
    phase === 'done' ? (
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-success bg-success/[0.04] border border-success/15 px-4 py-2 rounded-full">
          <CheckCircle2 size={12} />
          All chapters generated — your book is ready.
        </div>
      </div>
    ) : null

  return (
    <>
      {progressSection}
      {errorSection}
      {pendingSection}
      {doneSection}
    </>
  )
}
