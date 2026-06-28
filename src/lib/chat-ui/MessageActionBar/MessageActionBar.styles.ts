/**
 * Tailwind class objects for `MessageActionBar`.
 *
 * Variants:
 * - `labeled`  — pill button with icon + text label (used by the full Chat app).
 * - `iconOnly` — small square icon-only button (used by AIAssistantPanel).
 */
export const messageActionBarStyles = {
  wrapperBase: 'flex items-center gap-1',
  wrapperHover: 'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
  wrapperAlways: '',
} as const satisfies Record<string, string>

export const messageActionStyles = {
  // Labeled pill button (Chat style)
  labeledButton:
    'inline-flex items-center gap-1.5 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-card px-2.5 text-[11px] font-medium transition-all cursor-pointer text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-black/20 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed',
  // Icon-only square button (AI Assistant style)
  iconOnlyButton:
    'inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
} as const
