export const emojiPickerButtonStyles = {
  trigger:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
  content: 'z-50 overflow-hidden rounded-xl border border-border/60 shadow-lg',
  loading: 'flex h-[360px] w-[320px] items-center justify-center bg-popover',
} as const
