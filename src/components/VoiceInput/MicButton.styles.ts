export const MIC_BUTTON_STYLES = {
  base: 'shrink-0 rounded-md flex items-center justify-center transition-all cursor-pointer relative',
  idle: 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
  listening: 'text-red-500 bg-red-500/10 hover:bg-red-500/20',
  disabled: 'text-muted-foreground/40 cursor-not-allowed',
  pulse: 'animate-pulse',
  sizeDefault: 'w-7 h-7',
} as const
