/** Tailwind class objects for the wizard `Stepper` (VS Code-like quick-pick). */
export const stepperStyles = {
  root: 'flex items-center gap-1 px-3 pt-3 pb-2 overflow-x-auto scrollbar-none',
  step: 'group flex flex-col items-center gap-0.5 shrink-0 min-w-[44px]',
  bubbleBase:
    'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold border transition-colors',
  bubbleCompleted:
    'bg-success/15 text-success border-success/40 cursor-pointer hover:bg-success/25',
  bubbleCurrent:
    'bg-primary text-primary-foreground border-primary shadow-[0_0_0_3px_rgba(99,102,241,0.18)] cursor-default',
  bubbleUpcoming:
    'bg-muted text-muted-foreground/60 border-border/40 cursor-not-allowed',
  bubbleUpcomingClickable:
    'bg-muted text-muted-foreground/70 border-border/40 cursor-pointer hover:text-foreground hover:border-border',
  label: 'text-[9px] text-muted-foreground/70 truncate max-w-[60px] leading-none',
  labelCurrent: 'text-foreground font-medium',
  connector: 'h-px flex-1 bg-border/40 mt-3 min-w-[8px]',
  connectorCompleted: 'bg-success/40',
} as const
