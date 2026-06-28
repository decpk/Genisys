export const notesSplitDividerStyles = {
  base: 'group relative flex items-center justify-center shrink-0 z-10 transition-colors',
  sideBySide: 'w-1.5 cursor-col-resize hover:bg-primary/30',
  stacked: 'h-1.5 cursor-row-resize hover:bg-primary/30',
  idle: 'bg-border/40',
  dragging: 'bg-primary/50',
  // a thin grip line that brightens on hover/drag
  gripSideBySide:
    'absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border transition-colors group-hover:bg-primary/50',
  gripStacked:
    'absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border transition-colors group-hover:bg-primary/50',
} as const
