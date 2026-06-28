export const THEME_TAB_BUTTON_STYLES = {
  base: 'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer',
  active: 'bg-background text-foreground shadow-sm ring-1 ring-border/50',
  inactive: 'text-muted-foreground/60 hover:text-foreground',
} as const
