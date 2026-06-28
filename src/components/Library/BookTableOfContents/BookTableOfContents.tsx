import { AppLoaderGlyph } from '@/components/AppLoader'

import { ChapterRow } from '../ChapterRow'

import { useBookTableOfContents } from './BookTableOfContents.hooks'

export function BookTableOfContents(): React.JSX.Element | null {
  const { chapters, bookId, isGenerating, selectChapter, generateChapter } = useBookTableOfContents()

  if (chapters.length === 0 && !isGenerating) {
    return (
      <div className="py-12 text-center">
        <AppLoaderGlyph size={16} className="mx-auto mb-3 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/50 italic">Waiting for table of contents…</p>
      </div>
    )
  }

  if (chapters.length === 0) return null

  return (
    <div className="mb-12">
      {/* Section header with full-width divider */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-[0.2em] shrink-0">Contents</h2>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      <div className="space-y-0.5">
        {chapters.map((ch) => {
          const canRetry = ch.status === 'error' && !isGenerating
          const handleRetry = canRetry ? () => generateChapter(bookId, ch.chapterNumber) : undefined

          return (
            <ChapterRow key={ch.id} chapter={ch} onClick={() => selectChapter(ch.id)} onRetry={handleRetry} />
          )
        })}
      </div>
    </div>
  )
}
