/**
 * Tailwind class objects for the AI Assistant `ConfirmationPanel`.
 * Modern amber-tinted glass card with a glowing icon badge, item chips,
 * and a gradient confirm button.
 */
export const confirmationPanelStyles = {
  root:
    'mt-3 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.04] to-transparent shadow-[0_0_24px_-8px_rgba(245,158,11,0.35)] backdrop-blur-sm overflow-hidden',
  header: 'flex items-start gap-2.5 px-3 pt-3 pb-2',
  iconBadge:
    'flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 ring-1 ring-amber-500/30 shrink-0',
  iconBadgeIcon: 'text-amber-500',
  headerText: 'flex flex-col min-w-0',
  eyebrow:
    'text-[9px] font-semibold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80',
  title: 'text-xs font-semibold text-foreground leading-tight mt-0.5',
  body: 'px-3 pb-2.5 space-y-2',
  description: 'text-[11px] text-foreground/85 leading-relaxed',
  itemsContainer: 'flex flex-col gap-1',
  warning:
    'flex items-start gap-1.5 text-[10px] text-amber-700/90 dark:text-amber-300/90 leading-relaxed border-l-2 border-amber-500/40 pl-2 py-0.5',
  warningIcon: 'shrink-0 mt-[1px] text-amber-500/80',
  footer:
    'flex items-center justify-end gap-1.5 px-3 py-2 border-t border-amber-500/15 bg-amber-500/[0.04]',
  cancelButton:
    'h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/60',
  confirmButton:
    'h-7 px-2.5 text-[11px] gap-1 bg-gradient-to-b from-amber-500 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 shadow-sm border-0',
} as const

export const confirmationItemStyles = {
  root:
    'group flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/50 bg-card/60 hover:bg-card hover:border-border transition-colors',
  iconWrap:
    'flex items-center justify-center w-5 h-5 rounded-md bg-secondary/70 text-muted-foreground shrink-0',
  body: 'flex-1 min-w-0 flex items-center gap-1.5',
  path: 'text-[10.5px] font-mono text-foreground/85 truncate',
  details: 'text-[9.5px] text-muted-foreground/80 truncate',
  badge:
    'shrink-0 inline-flex items-center px-1.5 h-[16px] rounded-md bg-secondary text-[9px] font-medium uppercase tracking-wider text-muted-foreground',
  size: 'shrink-0 text-[9.5px] text-muted-foreground/70 tabular-nums',
} as const
