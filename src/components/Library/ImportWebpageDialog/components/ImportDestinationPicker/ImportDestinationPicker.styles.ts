export const STYLES = {
  root: 'grid grid-cols-2 gap-2',
  item:
    'group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  itemSelected: 'border-primary bg-primary/8 text-primary shadow-sm shadow-primary/10',
  itemUnselected:
    'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground hover:bg-muted/30',
  content: 'flex flex-col',
  label: 'text-xs font-medium',
  description: 'text-[10px] leading-tight opacity-60',
} as const
