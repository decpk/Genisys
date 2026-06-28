export const VOICE_INDICATOR_STYLES = {
  wrapper: 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
  container: 'flex items-center gap-3 px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 shadow-lg shadow-black/40',
  dot: 'w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0',
  label: 'text-sm text-zinc-300 font-medium',
  interimText: 'text-sm text-zinc-400 max-w-[300px] truncate',
  levelBar: 'h-0.5 rounded-full bg-red-500/60 transition-all duration-100',
  stopButton: 'shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 cursor-pointer transition-colors',
} as const
