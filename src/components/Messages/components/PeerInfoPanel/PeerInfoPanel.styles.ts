export const peerInfoPanelStyles = {
  root: 'flex h-full flex-col gap-4 overflow-y-auto p-4',
  empty: 'flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground/60',
  emptyIcon: 'h-8 w-8 text-muted-foreground/30',
  header: 'flex flex-col items-center gap-2.5 pt-2 text-center',
  name: 'text-base font-semibold tracking-tight text-foreground',
  verifiedPill:
    'flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400',
  verifyButton:
    'flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
  verifiedBox:
    'flex items-center justify-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-600 dark:text-sky-400',
  warnBox:
    'flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-[12px] leading-relaxed text-amber-700/90 dark:text-amber-200/80',
  warnIcon: 'mt-0.5 h-4 w-4 shrink-0 text-amber-500',
  footer: 'mt-auto flex items-start gap-2 pt-2 text-[11px] leading-relaxed text-muted-foreground/60',
  footerIcon: 'mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/70',
} as const
