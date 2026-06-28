export const editorSectionStyles = {
  root: 'border border-border/30 rounded-lg overflow-hidden',
  header:
    'flex items-center justify-between px-4 py-2.5 cursor-pointer select-none hover:bg-secondary/30 transition-colors',
  headerLeft: 'flex items-center gap-2',
  chevron: 'text-muted-foreground transition-transform duration-200',
  chevronExpanded: 'rotate-90',
  label: 'text-sm font-medium',
  badge:
    'text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full',
  badgeEmpty: 'text-xs text-muted-foreground/50 italic',
  body: 'border-t border-border/30',
  editor: 'min-h-[120px] wysiwyg-editor-compact',
} as const
