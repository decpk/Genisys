export const weekTaskMiniCardStyles = {
  container:
    'flex items-start gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent/40 transition-colors text-[11px]',
  checkbox: 'mt-0.5',
  title: 'flex-1 min-w-0 truncate leading-tight',
  titleCompleted: 'line-through text-muted-foreground',
  priorityDot: 'size-2 rounded-full shrink-0 mt-1.5',
} as const
