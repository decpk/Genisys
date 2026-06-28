export const quitConfirmStayPanelStyles = {
  root: 'relative flex h-full flex-col gap-6',
  header: 'flex flex-col gap-2',
  eyebrow:
    'inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary',
  eyebrowDot: 'inline-block h-1.5 w-1.5 rounded-full bg-primary',
  headline:
    'text-[26px] font-semibold leading-[1.15] tracking-tight text-foreground',
  subhead: 'text-sm text-muted-foreground leading-relaxed max-w-[40ch]',
  grid: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5',
  tile:
    'group flex items-start gap-3.5 rounded-2xl border border-border/40 bg-card/70 p-3.5 backdrop-blur-sm transition-all hover:bg-card hover:border-border/70 hover:-translate-y-[1px] hover:shadow-sm',
  tileIconWrap:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary/15',
  tileIcon: 'h-[20px] w-[20px]',
  tileBody: 'flex min-w-0 flex-col gap-1',
  tileLabel:
    'text-[14px] font-semibold leading-tight text-foreground tracking-tight',
  tileTagline:
    'text-[12px] leading-snug text-muted-foreground line-clamp-2',
  liveStrip:
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/40 bg-card/50 px-3 py-2 backdrop-blur-sm',
  liveLabel:
    'text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80 mr-1',
  chip:
    'inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-foreground ring-1 ring-primary/15',
  chipDot:
    'relative inline-flex h-2 w-2 items-center justify-center',
  chipDotCore:
    'h-2 w-2 rounded-full bg-primary',
  chipDotPulse:
    'absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping',
  chipCount: 'tabular-nums font-semibold text-primary',
  footer:
    'mt-auto text-[12px] leading-relaxed text-muted-foreground/80',
} as const
