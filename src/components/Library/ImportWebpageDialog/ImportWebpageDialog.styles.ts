export const STYLES = {
  overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
  content:
    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border border-border bg-background shadow-xl',
  header: 'px-5 pt-5 pb-3',
  title: 'text-sm font-semibold text-foreground',
  description: 'text-xs text-muted-foreground mt-1',
  body: 'px-5 pb-5 space-y-3 max-h-[70vh] overflow-y-auto',
  label: 'text-xs font-medium text-muted-foreground',
  input:
    'w-full rounded-lg border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30',
  footer: 'flex items-center justify-end gap-2 px-5 pb-5',
  errorText: 'text-xs text-destructive mt-1',
  savingOverlay:
    'flex flex-col items-center justify-center gap-3 py-8',
  savingText: 'text-xs text-muted-foreground',
  sectionLabel: 'text-xs font-medium text-muted-foreground mb-1.5 block',
  htmlTextarea:
    'mt-1 min-h-[140px] font-mono text-[11px] leading-relaxed resize-y',
} as const
