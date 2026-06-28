export const SPEAKER_BUTTON_STYLES = {
  base: 'shrink-0 rounded-md flex items-center justify-center transition-all cursor-pointer relative',
  idle: 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
  speaking: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20',
  loading: 'text-muted-foreground animate-pulse',
  paused: 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20',
  disabled: 'text-muted-foreground/40 cursor-not-allowed',
  sizeDefault: 'w-7 h-7',
} as const
