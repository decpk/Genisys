export const ephemeralTimerPickerStyles = {
  trigger:
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer focus-visible:outline-none',
  triggerActive: 'bg-primary/10 text-primary hover:bg-primary/10',
  icon: 'h-3.5 w-3.5',
  content:
    'z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border/60 bg-popover p-1 shadow-md',
  label: 'px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
  item: 'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-foreground outline-none transition-colors data-[highlighted]:bg-accent cursor-pointer',
  itemActive: 'text-primary',
  check: 'h-3.5 w-3.5',
} as const
