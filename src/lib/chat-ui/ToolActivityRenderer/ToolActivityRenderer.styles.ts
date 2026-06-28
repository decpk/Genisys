export const toolActivityRendererStyles = {
  // Inline mode
  inlineRoot: 'mt-1.5 mb-1.5 space-y-0.5',
  inlineItem: 'flex items-center gap-1.5 text-[10px] text-muted-foreground py-0.5',
  inlineLabel: 'truncate',

  // Expandable mode
  expandableRoot: 'my-2 rounded-lg border border-border/40 bg-muted/20 overflow-hidden',
  expandableHeader:
    'w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer',
  expandableHeaderChevron: 'shrink-0 transition-transform duration-150',
  expandableHeaderChevronOpen: 'rotate-90',
  expandableHeaderText: 'font-medium',
  expandableList: 'border-t border-border/30 divide-y divide-border/20',
  expandableItem: 'px-3 py-2',
  expandableItemRow: 'flex items-center gap-2 text-xs w-full text-left text-muted-foreground transition-colors',
  expandableItemRowInteractive: 'cursor-pointer hover:text-foreground',
  expandableItemRowStatic: 'cursor-default',
  expandableItemLabel: 'font-medium text-foreground/80',
  expandableItemArgs: 'text-muted-foreground/60 truncate text-[10px]',
  expandableItemChevron: 'shrink-0 ml-auto transition-transform duration-150',
  expandableItemChevronOpen: 'rotate-90',
  expandableItemResult:
    'mt-1.5 text-[10px] leading-4 text-muted-foreground/80 bg-muted/40 rounded p-2 overflow-auto whitespace-pre-wrap',

  // Shared
  runningIcon: 'shrink-0 text-primary',
  doneIcon: 'shrink-0 text-emerald-500',
  errorIcon: 'shrink-0 text-destructive',
  pendingIcon: 'shrink-0 text-muted-foreground/40',
  defaultIcon: 'shrink-0 text-muted-foreground/70',
} as const
