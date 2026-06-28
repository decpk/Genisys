export const settingsSearchCardStyles = {
  root: 'flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:bg-accent/30 cursor-pointer',
  icon: 'flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/40 text-foreground/75',
  text: 'flex min-w-0 flex-col',
  title: 'text-sm font-medium text-foreground',
  description: 'text-xs text-muted-foreground mt-0.5 line-clamp-2',
} as const
