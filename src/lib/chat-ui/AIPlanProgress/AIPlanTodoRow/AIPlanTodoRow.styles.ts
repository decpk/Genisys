/**
 * Visual tokens for `AIPlanTodoRow`. Kept in a dedicated file per
 * `.claude.md` (presentation layer).
 */
export const aiPlanTodoRowStyles = {
  root: 'flex items-center gap-2 px-3 py-1.5 text-xs text-foreground/85',
  iconWrap: 'shrink-0 inline-flex items-center justify-center',
  label: 'truncate',

  // Status icon colors (consumed by `pickStatusIcon`)
  iconDone: 'shrink-0 text-emerald-500',
  iconRunning: 'shrink-0 text-primary',
  iconError: 'shrink-0 text-destructive',
  iconPending: 'shrink-0 text-muted-foreground/40',
} as const
