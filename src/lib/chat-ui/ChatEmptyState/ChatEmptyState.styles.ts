/**
 * Tailwind class objects for `ChatEmptyState`.
 *
 * The same look is used by:
 * - The full Chat app (`<ChatWelcome>` replaces with this).
 * - Every AI Assistant right-panel surface (Code, Notes, Library, APIClient,
 *   DailyPlan, ClipboardManager).
 */
export const chatEmptyStateStyles = {
  root: 'flex flex-col items-center justify-center h-full text-center gap-3 py-6 px-3',
  heroBadge:
    'relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-[0_0_24px_-6px_rgb(var(--color-primary-rgb,99_102_241)/0.35)]',
  heroIcon: 'text-primary',
  body: 'w-full max-w-md',
  title: 'text-sm font-medium text-foreground',
  subtitle: 'mt-0.5 text-[11px] text-muted-foreground/70',
  suggestions: 'mt-3 flex flex-col gap-1.5 w-full max-w-full',
  suggestionButton:
    'group relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl border border-border/50 bg-gradient-to-b from-secondary/40 to-secondary/20 hover:from-secondary/70 hover:to-secondary/40 hover:border-primary/30 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer text-left',
  suggestionIconWrap:
    'flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors',
  suggestionLabel:
    'flex-1 text-[11px] text-foreground/80 group-hover:text-foreground leading-snug whitespace-normal break-words',
  suggestionArrow:
    'shrink-0 text-muted-foreground/0 group-hover:text-primary transition-colors',
} as const
