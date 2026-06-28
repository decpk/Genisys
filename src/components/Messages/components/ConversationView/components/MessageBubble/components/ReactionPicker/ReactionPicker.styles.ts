export const reactionPickerStyles = {
  trigger:
    'flex h-6 w-6 items-center justify-center rounded-full bg-card text-muted-foreground opacity-0 shadow-sm ring-1 ring-border/60 transition group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none',
  triggerIcon: 'h-3.5 w-3.5',
  content:
    'z-50 flex items-center gap-0.5 rounded-full border border-border/60 bg-popover p-1 shadow-md',
  emojiButton:
    'flex h-7 w-7 items-center justify-center rounded-full text-base leading-none transition hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
} as const
