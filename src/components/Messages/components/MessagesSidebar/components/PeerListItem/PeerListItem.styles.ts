export const peerListItemStyles = {
  row: 'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/50 cursor-pointer',
  rowActive: 'bg-muted hover:bg-muted',
  avatarWrap: 'relative shrink-0',
  presence: 'absolute -bottom-0.5 -right-0.5',
  body: 'min-w-0 flex-1',
  nameRow: 'flex items-center gap-1.5',
  name: 'truncate text-sm font-medium text-foreground',
  badges: 'flex shrink-0 items-center gap-1',
  lockBadge: 'text-emerald-500/80',
  verifiedBadge: 'text-sky-500',
  warnBadge: 'text-amber-500',
  metaRow: 'block w-full truncate text-xs text-muted-foreground',
  preview: 'block w-full truncate text-[11px] text-muted-foreground',
  endCol: 'flex shrink-0 flex-col items-end gap-1',
  time: 'text-[10px] tabular-nums text-muted-foreground/70',
  unreadBadge:
    'flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground',
  connectButton:
    'ml-auto shrink-0 rounded-md border border-border/40 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground/80 opacity-0 transition-all hover:border-primary/40 hover:text-foreground group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
} as const
