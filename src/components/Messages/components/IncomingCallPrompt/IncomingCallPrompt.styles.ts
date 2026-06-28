export const incomingCallPromptStyles = {
  overlay: 'fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm',
  content:
    'fixed left-1/2 top-1/2 z-[110] flex w-[min(360px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 rounded-2xl border border-border/40 bg-card p-6 shadow-xl',
  kindRow: 'flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground',
  kindIcon: 'h-3.5 w-3.5',
  name: 'text-base font-semibold text-foreground',
  actions: 'mt-2 flex w-full items-center justify-center gap-4',
  accept:
    'flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600 cursor-pointer',
  decline:
    'flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 cursor-pointer',
} as const
