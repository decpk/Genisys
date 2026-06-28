export const STYLES = {
  container: 'space-y-3',
  headerRow: 'flex items-center justify-between',
  rangeList: 'space-y-1.5',
  addButton: 'w-full h-9 text-xs gap-1.5 border-dashed text-muted-foreground hover:text-foreground',
  statusBadge: 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
  statusActive: 'bg-success/10 text-success',
  statusPaused: 'bg-warning/10 text-warning',
  errorText: 'text-xs text-destructive mt-1',
} as const
