/**
 * Tailwind class objects for the AI Assistant `ContinuePanel`.
 * Indigo-tinted glass card mirroring `ConfirmationPanel`'s visual
 * language but in a "neutral / informational" palette so it is
 * clearly distinct from the amber confirmation card.
 */
export const continuePanelStyles = {
  root:
    'mt-3 rounded-xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.08] via-indigo-500/[0.04] to-transparent shadow-[0_0_24px_-8px_rgba(99,102,241,0.35)] backdrop-blur-sm overflow-hidden',
  header: 'flex items-start gap-2.5 px-3 pt-3 pb-2',
  iconBadge:
    'flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/30 shrink-0',
  iconBadgeIcon: 'text-indigo-500',
  headerText: 'flex flex-col min-w-0',
  eyebrow:
    'text-[9px] font-semibold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400/80',
  title: 'text-xs font-semibold text-foreground leading-tight mt-0.5',
  body: 'px-3 pb-2.5 space-y-2',
  description: 'text-[11px] text-foreground/85 leading-relaxed',
  stats: 'flex items-center gap-2 text-[10px] text-muted-foreground/85 font-mono',
  statChip:
    'inline-flex items-center gap-1 px-1.5 h-[18px] rounded-md bg-secondary/70 text-foreground/75',
  footer:
    'flex items-center justify-end gap-1.5 px-3 py-2 border-t border-indigo-500/15 bg-indigo-500/[0.04]',
  stopButton:
    'h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/60',
  continueButton:
    'h-7 px-2.5 text-[11px] gap-1 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white hover:from-indigo-500 hover:to-indigo-700 shadow-sm border-0',
} as const
