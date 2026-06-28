export const keepAliveLimitSettingStyles = {
  trigger:
    'inline-flex min-w-[8rem] items-center justify-between gap-2 rounded-lg border border-border/40 bg-secondary/60 px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors cursor-pointer hover:bg-secondary focus:ring-2 focus:ring-primary/30',
  content:
    'z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border/30 bg-popover text-popover-foreground shadow-md',
  viewport: 'p-1',
  item: 'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
  itemIndicator: 'ml-auto',
} as const
