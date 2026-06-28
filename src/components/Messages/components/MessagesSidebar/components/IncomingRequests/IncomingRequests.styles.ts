export const incomingRequestsStyles = {
  root: 'flex flex-col gap-2 px-3 pb-3',
  header: 'flex items-center gap-1.5 px-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400',
  headerIcon: 'h-3.5 w-3.5',
  list: 'flex flex-col gap-2',
  card: 'flex items-center gap-2.5 rounded-lg bg-amber-500/[0.06] p-2.5',
  avatar: 'shrink-0',
  info: 'min-w-0 flex-1',
  name: 'truncate text-sm font-medium text-foreground',
  meta: 'truncate font-mono text-[11px] tracking-tight text-muted-foreground/70',
  actions: 'flex shrink-0 items-center gap-1.5',
  accept:
    'flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500/20 cursor-pointer dark:text-emerald-400',
  reject:
    'flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 cursor-pointer',
} as const
