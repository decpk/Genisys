export const extractedTextModalStyles = {
  content: 'sm:max-w-2xl max-h-[80vh] flex flex-col',
  headerRow: 'flex items-center justify-between gap-3 pr-10',
  copyButton:
    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/30 whitespace-nowrap shrink-0',
  preWrapper: 'flex-1 min-h-0 overflow-y-auto rounded-md border border-border/30 bg-muted/20 p-4',
  pre: 'font-sans text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words',
  footer: 'flex items-center justify-end text-[11px] text-muted-foreground',
} as const
