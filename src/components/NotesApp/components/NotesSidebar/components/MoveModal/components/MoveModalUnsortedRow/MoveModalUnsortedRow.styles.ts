export const moveModalUnsortedRowBaseClass =
  'w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-md cursor-pointer transition-colors'

export const moveModalUnsortedRowStateClass = {
  selected: 'bg-primary/10 text-primary',
  idle: 'hover:bg-muted/50 text-muted-foreground',
} as const
