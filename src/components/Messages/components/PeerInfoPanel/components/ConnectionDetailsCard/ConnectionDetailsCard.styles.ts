export const connectionDetailsCardStyles = {
  root: 'rounded-2xl border border-border/70 bg-card/60 p-4',
  label: 'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
  labelIcon: 'h-3.5 w-3.5 text-primary/70',
  rows: 'mt-3 flex flex-col gap-2',
  row: 'flex items-center justify-between gap-3 text-[12.5px]',
  key: 'text-muted-foreground',
  value: 'font-mono text-foreground/90',
  statusValue: 'flex items-center gap-1.5 font-medium text-foreground',
} as const
