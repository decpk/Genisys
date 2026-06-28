export const quitConfirmHeaderStyles = {
  wrapper: 'flex flex-col gap-3 text-left',
  eyebrow:
    'inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive ring-1 ring-destructive/20',
  eyebrowDot: 'inline-block h-1.5 w-1.5 rounded-full bg-destructive',
  title:
    'text-[40px] font-semibold leading-[1.05] tracking-tight text-foreground',
  description:
    'text-[15px] leading-relaxed text-muted-foreground max-w-[36ch]',
} as const
