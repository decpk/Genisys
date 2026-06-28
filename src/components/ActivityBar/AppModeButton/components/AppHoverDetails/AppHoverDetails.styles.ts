export const appHoverDetailsStyles = {
  root: 'flex w-72 flex-col gap-2 p-3 text-left',
  header: 'flex items-center gap-2.5',
  iconWrap: 'flex size-9 shrink-0 items-center justify-center rounded-[10px]',
  headingText: 'flex min-w-0 flex-1 items-center justify-between gap-2',
  name: 'truncate text-sm font-semibold text-foreground',
  version:
    'shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground',
  tagline: 'text-[12.5px] font-medium leading-snug text-foreground/90',
  description: 'text-[11.5px] leading-relaxed text-muted-foreground',
} as const
