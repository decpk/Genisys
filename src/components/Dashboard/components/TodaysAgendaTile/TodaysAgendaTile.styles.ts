/**
 * Class-name constants for the Today's Agenda tile.
 *
 * Mirrors the flat / solid-surface aesthetic introduced in DayView:
 *   - subtle solid background (no top-to-bottom gradient)
 *   - variant-tinted ring + colored shadow halo for identity
 *   - icon chip with gradient bg + inner highlight + tinted ring
 *   - chip-style count pill with tabular numerals
 *
 * The tile uses an **amber** identity to give the Dashboard "Agenda"
 * tile its own warm visual language (distinct from DayView's emerald-tasks
 * and blue-meetings palette).
 */
export const TODAYS_AGENDA_TILE_STYLES = {
  /** Outer shell — flat solid surface, plain neutral border, no colored halo. */
  shell:
    '@container group relative rounded-xl overflow-hidden h-[400px] flex flex-col ' +
    'bg-card border border-border',

  /** Top-right action cluster (resize + drag). */
  actions:
    'absolute top-2 right-2 z-10 flex items-center gap-0.5 ' +
    'opacity-0 group-hover:opacity-100 transition-opacity duration-200',

  /** Header wrapper — flat divider, no background wash. */
  header: 'border-b border-border/40',

  /** Header inner row — icon chip + title block + progress cluster. */
  headerRow:
    'relative flex items-center gap-2.5 px-3.5 py-2.5',

  /** Progress cluster pinned to the right of the header row (mini-bar + count). */
  headerProgress: 'flex items-center gap-2 shrink-0',

  /** Mini-bar track — short rounded rail. */
  headerProgressTrack:
    'relative h-1.5 w-16 rounded-full bg-muted/60 ' +
    'ring-1 ring-inset ring-border/30 overflow-hidden',

  /** Mini-bar fill — amber gradient with a soft glow, width-animated. */
  headerProgressFill:
    'h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 ' +
    'shadow-[0_0_8px_-1px_rgba(245,158,11,0.5)] ' +
    'transition-[width] duration-500 ease-out',

  /** Pulse softly when fully complete to celebrate the win. */
  headerProgressFillComplete: 'animate-pulse',

  /** "completed/total" readout next to the bar. */
  headerProgressCount:
    'text-[10.5px] font-semibold tabular-nums text-muted-foreground',

  /** Icon chip — small rounded glass tile with gradient + inner highlight. */
  iconChip:
    'size-7 rounded-lg flex items-center justify-center shrink-0 ' +
    'bg-gradient-to-br from-amber-500/25 to-amber-500/5 ' +
    'ring-1 ring-inset ring-amber-500/30 ' +
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)]',

  iconChipIcon: 'text-amber-500',

  /** Title + subtitle text block. */
  titleBlock: 'min-w-0 flex-1',
  title:
    'text-[13px] font-semibold text-foreground tracking-tight leading-tight',
  subtitle: 'mt-0.5 text-[11px] text-muted-foreground leading-tight truncate',

  /** Count chip pill (e.g. "0/2"). */
  countChip:
    'px-1.5 py-px rounded-md text-[10.5px] font-semibold tabular-nums shrink-0 ' +
    'bg-card/60 text-muted-foreground ' +
    'ring-1 ring-inset ring-amber-500/20',

  /** Scrollable content area below the header. */
  content: 'flex-1 space-y-4 overflow-y-auto p-3',

  /** Empty state wrapper. */
  emptyWrap: 'p-4 flex-1 flex items-center justify-center',

  /** Overflow "+N more" footer line. */
  overflowMore: 'mt-1.5 text-[11px] text-muted-foreground',
} as const
