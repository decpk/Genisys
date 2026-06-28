export const reasoningDisclosureStyles = {
  root: 'mt-2 mb-1.5 rounded-md border border-border/30 bg-secondary/20',
  toggle:
    'flex items-center gap-1.5 w-full px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
  chevron: 'text-muted-foreground/70 shrink-0',
  icon: 'text-primary/70 shrink-0',
  label: 'leading-none',
  pulse:
    'ml-1 inline-block w-1 h-1 rounded-full bg-primary animate-pulse',
  body:
    'px-2 pb-1.5 pt-0.5 max-h-[180px] overflow-y-auto',
  bodyText:
    'whitespace-pre-wrap text-[10.5px] leading-snug text-muted-foreground/85 font-mono',
} as const
