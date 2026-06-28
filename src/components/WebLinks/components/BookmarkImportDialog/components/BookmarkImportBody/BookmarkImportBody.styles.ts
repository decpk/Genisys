/** Tailwind class-name constants for the `BookmarkImportBody`. */
export const STYLES = {
  center: 'flex min-h-[140px] items-center justify-center',
  list: 'flex max-h-[320px] flex-col gap-1.5 overflow-y-auto pr-0.5',
  muted: 'px-1 py-8 text-center text-sm text-muted-foreground',
  error:
    'whitespace-pre-wrap rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive',
  errorActions: 'mt-3 flex justify-end',
  confirm: 'flex flex-col gap-4',
  confirmText: 'text-sm text-muted-foreground',
  confirmStrong: 'font-medium text-foreground',
  done: 'flex min-h-[140px] flex-col items-center justify-center gap-2 text-center',
  doneIcon: 'text-success',
  doneText: 'text-sm font-medium text-foreground',
} as const
