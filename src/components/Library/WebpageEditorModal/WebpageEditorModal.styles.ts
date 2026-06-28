export const STYLES = {
  content:
    '!w-[95vw] !h-[95vh] !max-w-none !max-h-none !p-0 !gap-0 flex flex-col overflow-hidden',
  header:
    'shrink-0 h-12 border-b border-border/40 bg-background/95 backdrop-blur-sm',
  headerInner: 'flex items-center justify-between h-full px-4',
  headerLeft: 'flex items-center gap-3 min-w-0',
  headerBadge:
    'text-xs text-primary bg-primary/[0.07] px-2.5 py-0.5 rounded-full border border-primary/10 tracking-wide shrink-0',
  headerName: 'text-sm font-medium text-foreground truncate',
  dirtyDot: 'w-2 h-2 rounded-full bg-warning shrink-0',
  footer:
    'shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-sm px-4 py-2 flex items-center justify-end gap-2',
  body: 'flex-1 min-h-0',
  loadingBody: 'flex-1 flex items-center justify-center',
} as const
