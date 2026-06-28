export const emptyStateStyles = {
  root: 'flex h-full flex-col items-center justify-center gap-5 px-8 text-center',
  glyphWrap: 'relative flex items-center justify-center',
  glyphRing:
    'flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10',
  glyphIcon: 'h-11 w-11 text-primary/70',
  lockBadge:
    'absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-card text-emerald-500 shadow-sm',
  title: 'text-lg font-semibold tracking-tight text-foreground',
  subtitle: 'max-w-sm text-sm leading-relaxed text-muted-foreground',
  privacy:
    'mt-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-[11px] text-muted-foreground',
  privacyIcon: 'h-3.5 w-3.5 text-emerald-500/70',
} as const
