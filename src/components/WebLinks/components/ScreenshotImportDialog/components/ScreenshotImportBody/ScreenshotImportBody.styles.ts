/** Tailwind class-name constants for the `ScreenshotImportBody`. */
export const STYLES = {
  center: 'flex min-h-[160px] flex-col items-center justify-center gap-3',
  thumb: 'max-h-28 w-auto rounded-md border border-border object-contain',
  results: 'flex flex-col gap-3',
  resultsHeader: 'flex items-center justify-between gap-2',
  resultsCount: 'text-xs font-medium text-muted-foreground',
  resultsActions: 'flex items-center gap-1.5',
  list: 'flex max-h-[280px] flex-col gap-1 overflow-y-auto pr-0.5',
  empty: 'flex min-h-[160px] flex-col items-center justify-center gap-3 text-center',
  muted: 'text-sm text-muted-foreground',
  error:
    'whitespace-pre-wrap rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive',
  errorActions: 'mt-3 flex justify-end',
} as const
