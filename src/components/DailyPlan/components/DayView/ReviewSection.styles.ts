import { sectionWellStyles } from './shared/styles/sectionWell.styles'

/**
 * ReviewSection-local styles. Container / header / progress / chevron styling
 * is owned by the shared primitives under `../shared/`. What remains here is
 * the section body (card list + empty state + quick-add input).
 */
export const reviewSectionStyles = {
  cardList: `${sectionWellStyles.well}`,

  emptyContainer:
    'flex flex-col items-center justify-center py-8 text-muted-foreground',
  emptyIcon: 'size-8 mb-2 opacity-20',
  emptyText: 'text-xs',

  // Quick-add input — purple-tinted focus halo to match the Reviews identity.
  quickAddContainer: 'relative mt-2.5',
  quickAddIcon:
    'absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/55 pointer-events-none',
  quickAddInput:
    'w-full pl-9 pr-14 py-2.5 text-[12.5px] bg-gradient-to-b from-background/60 to-background/30 ring-1 ring-inset ring-border/40 rounded-xl text-foreground placeholder:text-muted-foreground/50 outline-none focus:from-purple-500/[0.08] focus:to-purple-500/[0.03] focus:ring-purple-500/30 transition-colors',
  quickAddHint:
    'absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[9.5px] font-medium text-muted-foreground/60 pointer-events-none select-none',
  quickAddKbd:
    'inline-flex items-center justify-center px-1 py-px rounded text-[9px] font-semibold bg-muted/60 ring-1 ring-inset ring-border/40 tabular-nums',
} as const
