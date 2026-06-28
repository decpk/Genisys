export const STYLES = {
  container: 'rounded-xl border border-border/60 bg-card/40 overflow-hidden',
  header: 'flex items-center justify-between gap-4 px-5 py-4 border-b border-border/40 bg-muted/30',
  body: 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 p-5',
  leftColumn: 'flex flex-col gap-5 min-w-0',
  rightColumn: 'flex flex-col gap-3 min-w-0 lg:sticky lg:top-3 self-start',
  metaRow: 'flex flex-col gap-1.5',
  metaLabel: 'text-xs font-medium text-foreground',
  metaInput:
    'w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
  toggleRow: 'flex items-center justify-between gap-4 py-2',
  groupSection: 'flex flex-col gap-2',
  groupHeader: 'flex items-center justify-between gap-2 cursor-pointer select-none py-1',
  groupTitle: 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
  groupGrid: 'flex flex-col gap-1',
  tokenRow:
    'flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/40 transition-colors',
  tokenSwatch:
    'shrink-0 size-8 rounded-md border border-border/60 cursor-pointer overflow-hidden relative',
  tokenLabelBlock: 'min-w-0 flex-1',
  tokenLabel: 'text-xs font-medium text-foreground truncate flex items-center gap-1.5',
  tokenExample: 'text-[10px] text-muted-foreground truncate',
  tokenInputs: 'flex items-center gap-1 shrink-0',
  tokenNumberInput:
    'w-12 h-7 px-1.5 rounded border border-input bg-background text-[11px] text-center text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
  tokenInputSuffix: 'text-[9px] text-muted-foreground/70 -ml-0.5 mr-0.5 select-none',
  tokenHelpButton:
    'shrink-0 size-5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors',
  tokenHexInput:
    'w-20 h-7 px-1.5 rounded border border-input bg-background text-[10px] font-mono text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
  fallbackPill:
    'text-[10px] text-muted-foreground border border-dashed border-border/60 rounded px-1.5 py-0.5 hover:bg-muted/40 transition-colors',
  previewLabel: 'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2',
  previewWindow:
    'rounded-xl overflow-hidden border shadow-sm',
  footer: 'flex items-center justify-end gap-2 px-5 py-3 border-t border-border/40 bg-muted/20',
  validationError: 'text-[11px] text-destructive',
} as const
