export const styles = {
  dialogContent:
    '!w-[90vw] !h-[85vh] !max-w-none !max-h-none !p-0 !gap-0 flex flex-col overflow-hidden',
  header:
    'shrink-0 h-12 border-b border-border/40 bg-background/95 backdrop-blur-sm',
  headerInner: 'flex items-center justify-between h-full px-4',
  headerLeft: 'flex items-center gap-3 min-w-0',
  headerTitle: 'text-sm font-medium text-foreground',
  headerRight: 'flex items-center gap-1',
  resetButton:
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer',
  closeButton:
    'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer',
  footer:
    'shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-sm px-4 py-2 flex items-center justify-end gap-2',
  cancelButton:
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer',
  saveButton:
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
} as const
