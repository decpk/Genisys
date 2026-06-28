export const requestLogFiltersStyles = {
  container: 'flex items-center gap-1.5 min-w-0',
  statusInput: [
    'h-7 w-14 shrink-0 rounded-md border border-input bg-transparent px-2 text-[11px] text-foreground',
    'outline-none transition-colors placeholder:text-muted-foreground',
    'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  ].join(' '),
  pathInput: [
    'h-7 flex-1 min-w-0 rounded-md border border-input bg-transparent px-2 text-[11px] text-foreground',
    'outline-none transition-colors placeholder:text-muted-foreground',
    'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30',
  ].join(' '),
} as const

export const PATH_DEBOUNCE_MS = 300
