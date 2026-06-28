export const toolsPopoverStyles = {
  trigger:
    "h-6 w-6 p-0 shrink-0 flex items-center justify-end rounded-md text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/60 transition-colors cursor-pointer",
  content:
    "w-[480px] max-h-[420px] overflow-y-auto p-0 bg-popover border border-border shadow-lg rounded-lg",
  header: "sticky top-0 z-10 bg-popover px-3 py-2.5 border-b border-border/40",
  headerTitle: "text-xs font-semibold text-foreground",
  headerCount: "text-[11px] text-muted-foreground/60 ml-1 tabular-nums",
  categorySection: "px-2.5 py-2",
  categoryLabel:
    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-1 mb-1.5",
  toolItem:
    "flex flex-col gap-0.5 rounded-md px-2.5 py-2 hover:bg-secondary/50 transition-colors",
  toolName: "text-[11px] font-medium text-foreground/90",
  toolDescription:
    "text-[10px] text-muted-foreground/70 leading-snug line-clamp-2",
} as const;
