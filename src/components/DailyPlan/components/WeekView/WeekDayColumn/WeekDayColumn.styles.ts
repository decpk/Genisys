export const weekDayColumnStyles = {
  columnContainer: 'bg-card flex flex-col',
  columnContainerToday: 'bg-primary/[0.04]',
  headerButton:
    'flex flex-col items-center gap-0.5 px-2 py-2 hover:bg-accent/50 transition-colors border-b border-border/40',
  headerButtonSelected: 'bg-accent',
  weekdayLabel: 'text-[10px] uppercase tracking-wider text-muted-foreground/80',
  dayNumberCircle:
    'size-7 text-[12.5px] font-semibold flex items-center justify-center rounded-full',
  dayNumberCircleToday: 'bg-primary text-primary-foreground shadow-sm',
  bodyContainer: 'flex-1 overflow-y-auto p-1.5 space-y-1',
  emptyState:
    'text-[10.5px] text-muted-foreground/60 text-center py-4 italic',
} as const
