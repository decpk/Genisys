import { sectionWellStyles } from './shared/styles/sectionWell.styles'

/**
 * TaskSection-local styles. Container / header / progress / chevron styling
 * is now owned by the shared primitives under `./shared/`. What remains here
 * is the section body (card list + empty state + quick-add input).
 */
export const taskSectionStyles = {
  // Card list — borderless rows sit flush, no inter-item spacing
  cardList: `${sectionWellStyles.well}`,

  // Empty state
  emptyContainer:
    'flex flex-col items-center justify-center py-8 text-muted-foreground',
  emptyIcon: 'size-8 mb-2 opacity-20',
  emptyText: 'text-xs',

  // Quick-add input — premium glass treatment with emerald-tinted focus halo
  quickAddContainer: 'relative mt-2.5',
  quickAddIcon:
    'absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/55 pointer-events-none',
  quickAddInput:
    'w-full pl-9 pr-14 py-2.5 text-[12.5px] bg-gradient-to-b from-background/60 to-background/30 ring-1 ring-inset ring-border/40 rounded-xl text-foreground placeholder:text-muted-foreground/50 outline-none focus:from-emerald-500/[0.08] focus:to-emerald-500/[0.03] focus:ring-emerald-500/30 transition-colors',
  quickAddHint:
    'absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[9.5px] font-medium text-muted-foreground/60 pointer-events-none select-none',
  quickAddKbd:
    'inline-flex items-center justify-center px-1 py-px rounded text-[9px] font-semibold bg-muted/60 ring-1 ring-inset ring-border/40 tabular-nums',

  // Completed variant — soft top fade so the list reads like an archive shelf
  cardListCompletedMask:
    '[mask-image:linear-gradient(to_bottom,transparent_0,black_12px)]',
} as const

/**
 * Legacy badge style lookup. Retained as a back-compat export in case any
 * external code still references it; new code should use the inline gradient
 * pill classes in `TaskCard.styles.ts`.
 */
export const PRIORITY_BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  urgent: { bg: 'bg-red-500/10', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
}
