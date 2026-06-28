export const safetyNumberCardStyles = {
  root: 'rounded-2xl border border-border/70 bg-card/60 p-4',
  label: 'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
  labelIcon: 'h-3.5 w-3.5 text-primary/70',
  fingerprint:
    'mt-2 break-all rounded-lg bg-muted/50 px-3 py-2 font-mono text-[12px] leading-relaxed tracking-tight text-foreground/90',
  safetyLabel:
    'mt-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
  safetyGrid:
    'mt-2 grid grid-cols-3 gap-1.5 rounded-lg bg-muted/50 p-3 font-mono text-[13px] tracking-wide text-foreground',
  safetyGroup: 'text-center tabular-nums',
  empty: 'mt-2 text-[12px] italic text-muted-foreground/60',
  hint: 'mt-3 text-[11px] leading-relaxed text-muted-foreground/70',
} as const
