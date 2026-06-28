export const conversationHeaderStyles = {
  root: 'flex items-center gap-2.5 border-b border-border/60 bg-background/70 px-3 py-2',
  info: 'min-w-0 flex-1',
  nameRow: 'flex items-center gap-2',
  name: 'truncate text-[13px] font-semibold tracking-tight text-foreground',
  verified:
    'flex items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0 text-[10px] font-medium text-sky-600 dark:text-sky-400',
  verifiedIcon: 'h-2.5 w-2.5',
  lockPill:
    'mt-0.5 flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400',
  lockIcon: 'h-2.5 w-2.5',
  infoButton:
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer',
  infoButtonActive: 'bg-primary/10 text-primary hover:bg-primary/10',
} as const
