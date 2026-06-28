/** Tailwind class-name constants for the `SortFilterBar`. */
export const STYLES = {
  bar:
    'sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur',
  searchWrap: 'relative flex flex-1 items-center',
  searchIcon: 'pointer-events-none absolute left-3 text-muted-foreground',
  input:
    'h-8 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
} as const
