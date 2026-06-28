/**
 * Class-name constants for the Time & Calendar tile.
 *
 * A clean, minimal aesthetic: a flat card surface, a quiet section label,
 * a light-weight hero clock, and an uncluttered month grid. No decorative
 * glow or gradients — hierarchy comes purely from type scale and spacing.
 */
export const TIME_CALENDAR_TILE_STYLES = {
  /** Outer shell — flat solid surface, neutral border, fixed height. */
  shell:
    '@container group relative rounded-xl overflow-hidden h-[400px] flex flex-col ' +
    'bg-card border border-border',

  /** Top-right action cluster (resize + drag), revealed on hover. */
  actions:
    'absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 ' +
    'opacity-0 group-hover:opacity-100 transition-opacity duration-200',

  dragHandle: 'cursor-grab active:cursor-grabbing',

  /** Header row — flat icon + quiet section label, borderless. */
  header: 'relative flex items-center gap-2 px-4 pt-3.5 pb-1',

  /** Flat icon — soft primary tint, no gradient/ring/shadow. */
  iconChip:
    'size-6 rounded-md flex items-center justify-center shrink-0 bg-primary/10',

  iconChipIcon: 'text-primary',

  title: 'text-[11px] font-medium uppercase tracking-wide text-muted-foreground',

  /** Clock section — centered hero time with supporting meta beneath. */
  clockSection: 'flex flex-col items-center gap-2 px-4 pt-1 pb-4',

  /** The large time plus its period/seconds meta — centered. */
  clockBlock: 'flex items-end justify-center gap-2',

  clockMain:
    'text-[3.5rem] font-light tabular-nums tracking-tight leading-none text-foreground',

  clockMeta: 'flex flex-col items-start gap-1 pb-1.5',

  clockPeriod: 'text-[13px] font-semibold leading-none text-primary',

  clockSeconds:
    'text-[12px] font-medium tabular-nums leading-none text-muted-foreground',

  /** Combined greeting · date line, centered + muted. */
  subLine: 'text-[12px] text-muted-foreground text-center leading-snug',

  greetingText: 'text-foreground/80 font-medium',

  /** 24-hour format toggle row, centered + subtle. */
  toggleRow: 'flex items-center gap-1.5',

  toggleLabel: 'text-[11px] font-medium tabular-nums text-muted-foreground',

  /** Calendar section — fills remaining vertical space. */
  calendarSection:
    'flex-1 flex flex-col px-4 pt-3 pb-2 border-t border-border/30',

  monthLabel:
    'text-center text-[12px] font-semibold tracking-tight text-foreground/90',

  /** Footer stat row (week number + day of year). */
  footer:
    'px-4 h-9 shrink-0 flex items-center justify-center border-t border-border/30 ' +
    'text-[10.5px] font-medium tabular-nums text-muted-foreground/80',
} as const
