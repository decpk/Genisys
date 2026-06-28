import { BookExportMenu } from '../BookExportMenu'
import { ResumeReading } from '../ResumeReading'
import { formatDuration } from '../utils/formatDuration'

import { useBookTitlePage } from './BookTitlePage.hooks'

export function BookTitlePage(): React.JSX.Element | null {
  const data = useBookTitlePage()

  if (!data) return null

  const { title, description, chaptersCount, readCount, createdDate, status, generationDurationMs } = data

  const descriptionEl = description ? (
    <p className="text-[15px] text-muted-foreground/60 leading-relaxed max-w-2xl">{description}</p>
  ) : null

  const readBadge = readCount > 0 ? (
    <>
      <span className="text-border/40">·</span>
      <span className="text-success/60">{readCount} Read</span>
    </>
  ) : null

  const generationTimeBadge =
    status === 'completed' && generationDurationMs != null ? (
      <>
        <span className="text-border/40">·</span>
        <span title="Total time taken to generate this book">
          Generated in {formatDuration(generationDurationMs)}
        </span>
      </>
    ) : null

  return (
    <div className="mb-12">
      {/* Accent bar */}
      <div className="w-10 h-1 rounded-full bg-primary/40 mb-8" />

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight leading-[1.15] mb-4">
        {title}
      </h1>

      {descriptionEl}

      {/* Meta info */}
      <div className="flex items-center gap-4 mt-6 text-[11px] text-muted-foreground/50 tracking-wide uppercase">
        <span>{chaptersCount} Chapters</span>
        <span className="text-border/40">·</span>
        <span>{createdDate}</span>
        {readBadge}
        {generationTimeBadge}
      </div>

      {/* Actions row */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <BookExportMenu />
        <ResumeReading />
      </div>
    </div>
  );
}
