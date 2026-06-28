export const aiInlineWriterStyles = {
  overlay:
    'fixed inset-0 z-[9998]',
  container:
    'fixed z-[9999] flex flex-col w-[400px] rounded-lg border border-transparent bg-popover shadow-xl overflow-hidden focus-within:border-input focus-within:ring-1 focus-within:ring-ring/20 transition-colors',
  inputRow:
    'flex items-center gap-2 px-3 py-2',
  icon:
    'shrink-0 text-primary/70',
  input:
    'flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none',
  statusBar:
    'px-3 py-1.5 border-t border-border/20 text-[10px] text-muted-foreground/60 flex items-center gap-1.5',
  streamingBar:
    'px-3 py-1.5 border-t border-border/20 text-[10px] text-muted-foreground flex items-center gap-2',
  errorBar:
    'px-3 py-1.5 border-t border-destructive/20 text-[10px] text-destructive flex items-center gap-1.5',
  doneBar:
    'px-3 py-1.5 border-t border-border/20 text-[10px] text-green-400 flex items-center gap-1.5',
  stopButton:
    'ml-auto text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
} as const
