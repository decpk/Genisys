export const wizardFooterStyles = {
  root: 'flex items-center gap-2 px-3 py-2 border-t border-border/30 bg-muted/20',
  meta: 'text-[10px] font-medium text-muted-foreground/70 mr-auto tabular-nums',
  metaPill:
    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-secondary/60 text-foreground/70',
  backButton:
    'inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer',
  skipButton:
    'inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer',
  primaryButton:
    'inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
  primaryButtonSubmit:
    'inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow-sm hover:from-primary hover:to-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
} as const
