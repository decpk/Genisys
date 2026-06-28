import { useProgressBanner } from './ProgressBanner.hooks'

export function ProgressBanner(): React.JSX.Element | null {
  const { completedCount, chaptersCount, readCount, pendingCount, errorCount, progressPercent, isVisible } =
    useProgressBanner()

  if (!isVisible) return null

  const readInfo = readCount > 0 ? (
    <>
      <span className="text-border/40">·</span>
      <span>{readCount} read</span>
    </>
  ) : null

  const pendingInfo = pendingCount > 0 ? (
    <>
      <span className="text-border/40">·</span>
      <span>{pendingCount} pending</span>
    </>
  ) : null

  const errorInfo = errorCount > 0 ? (
    <>
      <span className="text-border/40">·</span>
      <span className="text-destructive/60">{errorCount} failed</span>
    </>
  ) : null

  return (
    <div className="sticky top-0 z-10 shrink-0 border-b border-border/30 bg-muted/[0.03] backdrop-blur-sm px-6 sm:px-10 lg:px-16 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-5 text-[11px] text-muted-foreground/60">
          <span className="font-medium uppercase tracking-wider">Progress</span>
          <span className="tabular-nums">
            {completedCount} of {chaptersCount} chapters
          </span>
          {readInfo}
          {pendingInfo}
          {errorInfo}
        </div>
        <div className="flex-1 h-1.5 bg-border/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground/40 tabular-nums shrink-0">
          {progressPercent}%
        </span>
      </div>
    </div>
  );
}
