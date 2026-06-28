export const containerStyles =
  'group/chart my-4 rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 overflow-hidden'

export const headerStyles =
  'flex items-center gap-2 px-3.5 py-2 border-b border-border/30 bg-muted/30'

export const labelStyles = 'text-[10px] uppercase tracking-wider text-muted-foreground/60'

export const titleStyles = 'text-xs font-medium text-foreground truncate'

export const bodyStyles = 'w-full px-2 py-3'

export const errorStyles = {
  container:
    'my-4 rounded-xl border border-destructive/30 bg-destructive/[0.04] overflow-hidden',
  header:
    'flex items-center gap-2 px-4 py-2.5 border-b border-destructive/20 bg-destructive/[0.06]',
  label: 'text-[10px] uppercase tracking-wider text-destructive/60',
  body: 'px-4 py-3',
  message: 'text-xs text-destructive/80 whitespace-pre-wrap',
} as const
