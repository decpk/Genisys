export const moveModalTopicRowBaseClass =
  'ml-5 w-[calc(100%-20px)] flex items-center gap-2 px-2 py-2 text-[13px] rounded-md cursor-pointer transition-colors'

export const moveModalTopicRowStateClass = {
  selected: 'bg-primary/10 text-primary',
  idle: 'hover:bg-muted/50 text-muted-foreground',
} as const

export const moveModalTopicRowSpacerClass = 'w-[18px] shrink-0'
