/** Shared Tailwind class strings for the WebPoint inspector controls. */
export const inspectorStyles = {
  section: 'flex flex-col gap-3 border-b border-border/40 p-3',
  sectionTitle: 'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
  label: 'flex items-center justify-between gap-2 text-xs text-muted-foreground',
  input:
    'h-7 w-full rounded-md border border-border/60 bg-background px-2 text-xs text-foreground outline-none focus:border-primary',
  numberInput:
    'h-7 w-16 rounded-md border border-border/60 bg-background px-2 text-xs text-foreground outline-none focus:border-primary',
  iconButton:
    'flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition hover:bg-accent hover:text-foreground',
  iconButtonActive: 'border-primary bg-primary/10 text-foreground',
  dangerButton:
    'flex items-center gap-1.5 rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive transition hover:bg-destructive/10',
  addButton:
    'flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/60 px-2 py-1.5 text-xs transition hover:bg-accent',
  swatch: 'size-7 rounded-md border border-border/60',
}
