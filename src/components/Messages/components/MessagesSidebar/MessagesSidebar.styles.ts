export const messagesSidebarStyles = {
  root: 'flex h-full flex-col bg-transparent',
  header: 'flex items-center gap-2 px-3.5 pb-2 pt-3.5',
  headerIcon: 'flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-foreground',
  headerTitle: 'text-[15px] font-semibold tracking-tight text-foreground',
  identity: 'px-3 pb-3',
  connectWrap: 'px-3 pb-3',
  search: 'px-3 pb-2',
  sections: 'flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-3',
  footer:
    'flex items-start gap-2 border-t border-border/40 px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground/70',
  footerIcon: 'mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/70',
} as const
