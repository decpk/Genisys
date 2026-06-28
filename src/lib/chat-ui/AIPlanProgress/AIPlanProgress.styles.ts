/**
 * Visual tokens for the VS Code-style "Todos" card rendered by
 * `AIPlanProgress`. Kept in this dedicated file per `.claude.md`
 * (presentation layer).
 */
export const aiPlanProgressStyles = {
  // Outer card chrome (matches `StepProgressList` so the two surfaces
  // look like siblings within a chat bubble).
  root: 'my-2 rounded-lg border border-border/40 bg-muted/15 overflow-hidden',

  // Header bar
  header:
    'w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/90 hover:bg-muted/30 transition-colors cursor-pointer',
  headerChevron:
    'shrink-0 transition-transform duration-150 text-muted-foreground/70',
  headerChevronOpen: 'rotate-90',
  headerTitle: 'font-medium flex-1 truncate text-left',
  headerIcon: 'shrink-0 text-muted-foreground/70',

  // Body wrapping the todo rows
  body: 'border-t border-border/30 py-1',
} as const
