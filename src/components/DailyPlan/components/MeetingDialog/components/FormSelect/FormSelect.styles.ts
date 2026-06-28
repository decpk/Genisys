export const formSelectStyles = {
  wrapper: 'space-y-1.5',
  label: 'text-sm font-medium',
  trigger:
    'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs cursor-pointer hover:bg-secondary/50 focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors',
  content:
    'z-[200] min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[min(300px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95',
  item: 'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
  itemActive: 'bg-primary/10 text-primary font-medium',
  itemInactive: 'text-foreground/80 hover:bg-secondary',
} as const
