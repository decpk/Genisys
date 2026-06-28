export const imageDescriptionPaneStyles = {
  container: 'flex flex-col flex-1 min-h-0 px-4 py-2.5',
  header: 'flex items-center justify-between mb-1 shrink-0',
  headerLeft: 'flex items-center gap-2',
  label: 'text-xs font-medium text-muted-foreground',
  retryButton:
    'flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors',
  editButton:
    'flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
  editActions: 'flex items-center gap-1 ml-auto',
  cancelButton:
    'p-0.5 rounded bg-muted/80 border border-border/50 hover:bg-accent transition-colors',
  saveButton:
    'p-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors',
  cancelIcon: 'text-muted-foreground',
  saveIcon: 'text-emerald-500',
  body: 'flex-1 min-h-0 overflow-y-auto mt-1',
  textarea:
    'w-full h-full min-h-[120px] rounded-md border border-input bg-background px-2.5 py-2 text-xs text-foreground resize-none overflow-auto focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30',
} as const
