/** Tailwind class-name constants for the `CollectionView`. */
export const STYLES = {
  root: 'flex h-full w-full flex-col overflow-hidden',
  body: 'min-h-0 flex-1 overflow-y-auto p-4',
  center: 'flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center',
  emptyIcon: 'text-muted-foreground/60',
  emptyText: 'max-w-xs text-sm text-muted-foreground',
  noMatches: 'py-10 text-center text-sm text-muted-foreground',
} as const
