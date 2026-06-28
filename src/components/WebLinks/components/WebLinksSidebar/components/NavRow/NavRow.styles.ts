/** Tailwind class-name constants for a sidebar `NavRow`. */
export const STYLES = {
  row:
    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-secondary/60 hover:text-foreground',
  rowActive: 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
  icon: 'shrink-0',
  label: 'flex-1 truncate',
  count: 'shrink-0 text-xs tabular-nums text-muted-foreground/70',
} as const
