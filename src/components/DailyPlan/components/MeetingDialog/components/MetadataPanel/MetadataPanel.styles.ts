export const metadataPanelStyles = {
  root: "w-[500px] shrink-0 overflow-y-auto border-r border-border/30 px-6 py-5 space-y-5",
  sectionTitle:
    "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2",
  fieldGroup: "space-y-1.5",
  label: "text-sm font-medium",
  textarea:
    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 resize-none",
  row: "grid grid-cols-2 gap-3",
  selectRow: "grid grid-cols-3 gap-2",
} as const;
