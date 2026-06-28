export const imageInfoPopoverStyles = {
  triggerButton: "p-0 shrink-0 hover:text-foreground transition-colors",
  popoverContent: "w-[30rem] max-h-80 p-3 overflow-y-auto",
  header: "flex items-center justify-between mb-2",
  label: "text-xs font-medium text-muted-foreground",
  headerActions: "flex items-center gap-1",
  retryButton:
    "flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors",
  editTriggerButton:
    "p-1 rounded-md border border-border/40 hover:bg-accent transition-colors",
  editTriggerIcon: "text-muted-foreground",
  textarea:
    "w-full min-h-[200px] max-h-[200px] rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground resize-y overflow-auto focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 mt-2",
  editActions: "flex items-center gap-1 ml-auto",
  cancelButton:
    "p-0.5 rounded bg-muted/80 border border-border/50 hover:bg-accent transition-colors",
  saveButton:
    "p-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors",
  cancelIcon: "text-muted-foreground",
  saveIcon: "text-emerald-500",
  descriptionText:
    "text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap",
  statusText: "text-xs text-muted-foreground italic",
} as const;
