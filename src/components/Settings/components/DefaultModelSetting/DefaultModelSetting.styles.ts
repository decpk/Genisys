export const defaultModelSettingStyles = {
  modelButton:
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer border border-border/40',
  dropdownContent:
    'z-50 min-w-[200px] max-h-72 overflow-y-auto rounded-lg border border-border/30 bg-secondary/40 p-1 shadow-md animate-in fade-in-0 zoom-in-95',
  loaderWrap: 'flex items-center justify-center py-3',
  emptyState: 'flex items-center justify-center py-3 text-xs text-muted-foreground',
  modelItem: 'text-xs cursor-pointer',
  modelItemLabel: 'flex-1',
  modelItemMeta: 'text-[10px] text-muted-foreground ml-2',
} as const
