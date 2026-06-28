export const methodSelectStyles = {
  trigger: [
    'inline-flex h-7 items-center justify-between gap-1 rounded-md border border-input',
    'bg-transparent px-2 text-[11px] font-medium text-foreground outline-none',
    'transition-colors hover:bg-muted/40',
    'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30',
    'disabled:pointer-events-none disabled:opacity-50 data-[placeholder]:text-muted-foreground',
  ].join(' '),
  icon: 'h-3 w-3 text-muted-foreground',
  content: [
    'z-50 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
  ].join(' '),
  viewport: 'p-1',
  item: [
    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1 text-[11px] outline-none',
    'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
    'data-[state=checked]:font-semibold',
  ].join(' '),
} as const
