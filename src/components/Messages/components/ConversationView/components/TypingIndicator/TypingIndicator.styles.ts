export const typingIndicatorStyles = {
  root: 'flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-card px-3.5 py-3 shadow-sm ring-1 ring-border/60',
  dot: 'h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce',
} as const

// Stagger the three dots so they ripple rather than bounce in unison.
export const TYPING_DOT_DELAYS = ['0ms', '150ms', '300ms'] as const
