export const sectionHeaderStyles = {
  row: 'relative flex items-stretch',
  button:
    'flex-1 min-w-0 flex items-center gap-3 pl-4 pr-2 py-3 text-left group transition-colors hover:bg-white/[0.02]',
  titleBlock: 'flex-1 min-w-0 flex flex-col gap-0.5',
  titleRow: 'flex items-center gap-2 min-w-0',
  title: 'text-[13px] font-semibold tracking-tight text-foreground line-clamp-1',
  subtitle: 'text-[10.5px] font-medium text-muted-foreground/75 line-clamp-1',
  doneCenter:
    'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]',
  rightSlot: 'flex items-center gap-2 shrink-0',
  trailing: 'flex items-center gap-0.5 pr-2 shrink-0',
  chevronButton:
    'flex items-center justify-center rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-white/[0.04] hover:text-foreground outline-none',
  divider:
    'h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mx-4',
} as const
