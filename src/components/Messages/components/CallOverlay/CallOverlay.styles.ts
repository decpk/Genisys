export const callOverlayStyles = {
  root: 'fixed inset-0 z-[100] flex flex-col bg-neutral-950/95 backdrop-blur-md',
  topBar: 'flex items-center justify-between px-5 py-4',
  peerName: 'text-sm font-semibold text-white/90',
  pill: 'flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300',
  pillIcon: 'h-3 w-3',
  center: 'relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3',
} as const
