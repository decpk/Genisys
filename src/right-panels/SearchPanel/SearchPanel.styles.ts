export const searchPanelStyles = {
  header: 'shrink-0 px-3 pt-3 pb-3',
  inputWrapper: 'flex items-center gap-1.5 bg-secondary/50 rounded-xl h-9 px-3 border border-transparent focus-within:border-input focus-within:ring-1 focus-within:ring-ring/20 transition-all duration-200',
  input: 'flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none',
  matchBadge: 'shrink-0 text-[10px] font-medium text-muted-foreground/50 tabular-nums select-none',
  clearButton: 'shrink-0 w-5 h-5 flex items-center justify-center rounded-md hover:bg-foreground/10 text-muted-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer',
  navButton: 'shrink-0 w-5 h-5 flex items-center justify-center rounded-md hover:bg-foreground/10 text-muted-foreground/40 hover:text-foreground/70 disabled:opacity-20 disabled:cursor-default cursor-pointer transition-colors',
  divider: 'w-px h-3.5 bg-border/40 mx-0.5',
  statsRow: 'flex items-center justify-between px-3 py-1.5',
  statsText: 'text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider',
  resultsList: 'flex-1 overflow-y-auto',
  emptyState: 'flex flex-col items-center justify-center h-full text-muted-foreground/40 px-8 gap-2',
} as const

export const searchResultStyles = {
  base: "group relative w-full text-left px-3 py-2.5 transition-all duration-100 cursor-pointer",
  active: "bg-primary/[0.07]",
  idle: "hover:bg-secondary/40",
  activeIndicator:
    "absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-primary",
  text: "text-[11.5px] leading-[1.6] text-muted-foreground/70 line-clamp-2",
  matchHighlight:
    "font-semibold text-foreground bg-yellow-400/20 dark:bg-yellow-500/20 rounded-[3px] px-[3px] py-[1px]",
  activeMatchHighlight:
    "font-semibold text-primary bg-primary/10 rounded-[3px] px-[3px] py-[1px]",
  indexBadge:
    "shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-muted/50 text-[9px] text-muted-foreground/40 mt-[1px]",
  activeIndexBadge:
    "shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-primary/10 text-[9px] text-primary/70 mt-[1px]",
  separator: "mx-3 h-px bg-border/20",
} as const;
