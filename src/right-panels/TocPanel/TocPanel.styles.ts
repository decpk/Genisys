export const tocItemStyles = {
  base: 'group relative w-full flex items-center gap-2 text-left rounded-md transition-all duration-150 cursor-pointer',
  primary: 'py-1.5 pl-2.5 pr-2 text-[11.5px]',
  secondary: 'py-1 pl-7 pr-2 text-[11px]',
  tertiary: 'py-1 pl-9 pr-2 text-[11px]',
  activeState: 'text-primary bg-primary/[0.08] font-medium',
  primaryIdle: 'text-foreground/80 hover:text-foreground hover:bg-secondary/40',
  nestedIdle: 'text-muted-foreground/60 hover:text-foreground/80 hover:bg-secondary/30',
} as const

export const activeIndicatorStyles = 'absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-primary'

export const treeGuideStyles = {
  active: 'absolute left-[18px] top-0 bottom-0 w-px bg-primary/20',
  idle: 'absolute left-[18px] top-0 bottom-0 w-px bg-border/40',
} as const

export const badgeStyles = {
  active:
    "ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary",
  idle: "ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground/50",
} as const;

export const headerStyles =
  'shrink-0 flex items-center gap-2 px-3 h-9'

export const emptyStateStyles =
  'flex flex-col items-center justify-center h-full text-muted-foreground/40 px-4'

export const separatorStyles = 'my-1.5 mx-2.5 h-px bg-border/30'
