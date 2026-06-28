export const panelToolsStyles = {
  root: 'flex flex-col gap-3 min-w-[360px]',
  row: 'rounded-lg border border-border/30 bg-secondary/20 p-3',
  rowHeader: 'flex items-center justify-between gap-3',
  rowLabel: 'text-[13px] font-medium text-foreground/80',
  rowBadge: 'text-[10px] text-muted-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded',
  rowExpanded: 'mt-3 flex flex-col gap-2.5 pt-3 border-t border-border/20',
  fieldRow: 'flex items-center justify-between gap-3',
  fieldLabel: 'text-[11px] text-muted-foreground',
  fieldControl: 'flex items-center gap-2',
  modelButton:
    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer border bg-secondary/40 text-muted-foreground border-border/30 hover:bg-secondary',
  maxToolsInput:
    'w-16 px-2 py-0.5 rounded-md text-[12px] text-center font-medium bg-secondary/40 border border-input text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30',
  maxToolsHint: 'text-[10px] text-muted-foreground/50',
} as const
