export const sendStopButtonStyles = {
  base:
    'shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer',
  send:
    'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed',
  stop: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
} as const
