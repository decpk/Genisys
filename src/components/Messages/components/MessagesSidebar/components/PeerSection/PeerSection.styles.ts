export const peerSectionStyles = {
  root: 'flex flex-col gap-1',
  trigger:
    'group flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/60',
  chevron:
    'h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-0 -rotate-90',
  headerIcon: 'h-3.5 w-3.5 text-muted-foreground/70',
  title: 'text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60',
  count:
    'ml-auto rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground',
  searchWrap: 'px-1.5 pb-1',
  list: 'flex flex-col gap-0.5',
  empty: 'px-2.5 py-2 text-[12px] italic text-muted-foreground/60',
} as const
