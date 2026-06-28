export const messageReactionsStyles = {
  row: 'flex flex-wrap gap-1',
  rowOut: 'justify-end',
  rowIn: 'justify-start',
  chip: 'flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none ring-1 transition',
  chipIdle: 'bg-card text-muted-foreground ring-border/60 hover:ring-border',
  chipMine: 'bg-primary/15 text-foreground ring-primary/40',
  emoji: 'text-[12px] leading-none',
  count: 'tabular-nums',
} as const
