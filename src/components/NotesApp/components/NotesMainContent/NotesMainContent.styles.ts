export const notesMainContentStyles = {
  container: "flex flex-col h-full overflow-hidden",
  contentWrapper: "flex flex-col flex-1 min-h-0 overflow-hidden mx-auto w-full",

  // Toolbar
  toolbar:
    "flex items-center gap-2 px-3 h-11 border-b border-border/40 shrink-0",
  toolbarTitle:
    "flex-1 min-w-0 text-sm font-medium bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30 truncate",
  toolbarRight: "ml-auto flex items-center gap-1 shrink-0",
  toolbarBtn:
    "inline-flex items-center justify-center h-7 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer border",
  toolbarBtnIdle:
    "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground",
  toolbarBtnActive:
    "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
  toolbarDivider: "w-px h-4 bg-border/40 mx-0.5",

  // Header
  header: "px-10 pt-4 space-y-3",
  breadcrumb: "flex items-center gap-1.5 text-[11px] text-muted-foreground/50",
  breadcrumbSeg:
    "px-1.5 py-0.5 rounded-md hover:bg-muted/60 hover:text-muted-foreground transition-colors cursor-default",
  breadcrumbSep: "text-muted-foreground/25",
  titleInput:
    "w-full text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/25 leading-tight tracking-tight",

  // Source & Labels
  sourceBadge:
    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-muted-foreground/50 bg-muted/40 rounded-full",
  labelRow: "flex items-center gap-1.5 flex-wrap",
  labelBadgeActive:
    "inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 cursor-pointer hover:bg-primary/15 transition-colors",
  addLabelButton:
    "inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border border-dashed border-muted-foreground/20 text-muted-foreground/40 hover:text-muted-foreground hover:border-muted-foreground/40 cursor-pointer transition-colors",

  // Label popover
  labelPopover:
    "z-50 w-[240px] max-h-[260px] flex flex-col rounded-lg border border-border/40 bg-popover shadow-lg animate-in fade-in-0 zoom-in-95",
  labelPopoverHeader:
    "px-3 py-2 text-[11px] font-medium text-muted-foreground/60 border-b border-border/30 shrink-0",
  labelPopoverList: "flex flex-wrap gap-1.5 p-2.5 overflow-y-auto",
  labelPill:
    "shrink-0 px-2.5 py-1 text-[11px] rounded-full border border-border/30 bg-muted/30 text-muted-foreground/50 hover:bg-muted/60 hover:text-muted-foreground cursor-pointer transition-all duration-150 whitespace-nowrap",
  labelPillActive:
    "shrink-0 px-2.5 py-1 text-[11px] rounded-full border border-primary/30 bg-primary/10 text-primary font-medium cursor-pointer transition-all duration-150 whitespace-nowrap",

  // Editor
  editorContainer: "flex flex-col flex-1 min-h-0 min-w-0",

  // Save indicator
  saveIndicatorWrap: "inline-flex items-center",
  saveIndicatorCard:
    "inline-flex items-center gap-2 px-2 py-1 rounded-md border border-border/50 bg-secondary/30 text-[11px] font-medium",
  saveIndicatorSavingIcon: "text-yellow-500",
  saveIndicatorSavingText: "text-yellow-500",
  saveIndicatorSavedIcon: "text-green-500",
  saveIndicatorSavedText: "text-green-500",

  // Empty state
  emptyState:
    "flex flex-col items-center justify-center h-full gap-5 text-muted-foreground",
  emptyIcon: "text-muted-foreground/15",
  emptyText: "text-[15px] text-muted-foreground/40 font-light",
  emptyButton:
    "px-5 py-2.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
} as const;
