export const moveModalNotebookRowRootClass = 'flex items-center'

export const moveModalNotebookRowChevronButtonClass = 'p-0.5 shrink-0'

export const moveModalNotebookRowChevronIconBaseClass =
  'text-muted-foreground/40 transition-transform'

export const moveModalNotebookRowChevronIconExpandedClass = 'rotate-90'

export const moveModalNotebookRowSpacerClass = 'w-[18px] shrink-0'

export const moveModalNotebookRowLabelBaseClass =
  'flex-1 flex items-center gap-2 px-2 py-2 text-[13px] rounded-md cursor-pointer transition-colors'

export const moveModalNotebookRowLabelStateClass = {
  selected: 'bg-primary/10 text-primary',
  idle: 'hover:bg-muted/50 text-muted-foreground',
} as const
