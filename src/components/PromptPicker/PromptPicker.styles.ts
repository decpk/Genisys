export const promptPickerStyles = {
  trigger:
    'w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer',
  content:
    'z-50 w-[360px] rounded-lg border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[420px]',
  searchWrap:
    'flex items-center gap-2 px-2.5 h-9 border-b border-border/50 shrink-0',
  searchInput:
    'flex-1 min-w-0 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none',
  listWrap:
    'flex-1 overflow-y-auto py-1',
  emptyState:
    'px-3 py-6 text-center text-[11px] text-muted-foreground',
  folderHeader:
    'group/folder w-full flex items-center gap-1.5 px-2 py-1 text-[11.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer',
  folderChevron:
    'shrink-0 transition-transform',
  folderName:
    'flex-1 min-w-0 truncate text-left',
  folderCount:
    'shrink-0 text-[10px] text-muted-foreground/70 tabular-nums',
  categoryHeader:
    'w-full flex items-center gap-1.5 px-2 py-0.5 pl-6 text-[10.5px] uppercase tracking-wider text-muted-foreground/70',
  promptRow:
    'group/prompt w-full flex flex-col gap-0.5 px-2 py-1.5 pl-8 text-left hover:bg-secondary/60 transition-colors cursor-pointer focus:outline-none focus:bg-secondary/60',
  promptTitle:
    'text-[12px] text-foreground truncate',
  promptDesc:
    'text-[10.5px] text-muted-foreground truncate',
}
