export const AGENDA_SECTION_LABEL_STYLES = {
  row: 'mb-1.5 flex items-baseline justify-between gap-3 px-1',
  label:
    'text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground',
  countBase:
    'px-1.5 py-px rounded-md text-[10px] font-semibold tabular-nums ' +
    'bg-card/60 text-muted-foreground ring-1 ring-inset',
} as const

export const AGENDA_SECTION_LABEL_RING: Record<'amber' | 'emerald' | 'blue', string> = {
  amber: 'ring-amber-500/20',
  emerald: 'ring-emerald-500/20',
  blue: 'ring-blue-500/20',
}
