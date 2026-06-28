export const quitConfirmActionsStyles = {
  root: 'flex flex-col gap-3',
  wrapper: 'flex flex-col-reverse sm:flex-row sm:items-stretch gap-2.5',
  cancel:
    'flex-1 h-12 px-5 text-[14px] font-semibold rounded-2xl border-border/60 hover:bg-muted/60 transition-colors',
  confirm:
    'flex-1 h-12 px-5 text-[14px] font-semibold rounded-2xl gap-2 shadow-[0_8px_24px_-8px_rgba(220,38,38,0.55)] hover:shadow-[0_10px_28px_-8px_rgba(220,38,38,0.65)] transition-shadow',
  confirmIcon: 'h-4 w-4',
  hints:
    'flex items-center gap-3 text-[11px] text-muted-foreground/80',
  hintGroup: 'inline-flex items-center gap-1.5',
  kbd:
    'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-lg border border-border/60 bg-muted/40 text-[10.5px] font-semibold text-foreground/80 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.08)]',
  hintDivider: 'h-3 w-px bg-border/60',
} as const
