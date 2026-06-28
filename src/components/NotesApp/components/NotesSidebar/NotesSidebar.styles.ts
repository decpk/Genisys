export const notesSidebarStyles = {
  container: "flex flex-col h-full overflow-hidden border-r border-border/30",

  // Header block (title + create)
  headerRow: "flex items-center justify-between px-3 pt-3 pb-2",
  headerTitle: "text-[12px] font-semibold text-foreground/85 tracking-tight",
  headerCreateBtn:
    "flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors",

  // Search
  searchContainer: "px-3 pb-2",
  searchInput:
    "w-full h-8 px-2.5 text-[12px] bg-muted/35 border border-transparent rounded-md outline-none focus:bg-background focus:border-input focus:ring-1 focus:ring-ring/20 placeholder:text-muted-foreground/45 transition-all duration-150",

  // Segmented view switcher wrapper (TabsList provides its own pill styling)
  segmentedContainer: "px-3 pb-2",
  segmentedButton:
    "flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-[5px] cursor-pointer transition-colors duration-150",
  segmentedButtonActive: "bg-background text-foreground shadow-sm",
  segmentedButtonIdle: "text-muted-foreground/75 hover:text-foreground",

  // Inline filter/sort row
  filterRow:
    "flex items-center justify-between px-2 pb-2 text-[11px] text-muted-foreground/75",
  filterButton:
    "flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-muted/50 hover:text-foreground cursor-pointer transition-colors duration-150",

  // Section headers
  sectionHeader:
    "flex items-center justify-between px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70",
  sectionHeaderButton:
    "p-0.5 rounded hover:bg-muted/50 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors duration-150",

  // Scrollable list
  listContainer: "flex-1 overflow-y-auto px-1.5 pb-3",

  // Tree node (compact) — simpler, lower indent, tighter rows
  treeNode:
    "group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 text-[12.5px] rounded-md cursor-pointer hover:bg-muted/50 text-muted-foreground transition-colors duration-150",
  treeNodeActive:
    "group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 text-[12.5px] rounded-md cursor-pointer bg-primary/12 text-primary font-medium transition-colors duration-150",
  treeExpandIcon:
    "shrink-0 text-muted-foreground/50 transition-transform duration-150",
  treeExpandIconOpen: "rotate-90",
  treeExpandPlaceholder: "w-[12px] shrink-0",
  treeNodeIcon: "shrink-0 text-muted-foreground/65",
  treeNodeIconActive: "shrink-0 text-primary/75",
  treeNodeLabel: "truncate flex-1",
  treeNodeCount: "ml-1 text-[10px] text-muted-foreground/40 tabular-nums",
  treeNodeCountActive: "ml-1 text-[10px] text-primary/50 tabular-nums",
  treeAddButton:
    "p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/70 text-muted-foreground/40 hover:text-foreground cursor-pointer transition-colors duration-150",
  treeChildren: "",
  treeLine: "",

  // Compact indentation rail (much smaller than before: 12px vs 32px)
  treeRail: "relative w-3 shrink-0 self-stretch",

  // No group wrapper — keep it flat and simple
  treeGroupWrapper: "",

  // Icon slot (interactive button that opens picker)
  treeIconSlot: "shrink-0 grid place-items-center w-4 h-4",
  // Leaf colored dot
  treeLeafDot: "w-1.5 h-1.5 rounded-full shrink-0",
  // Emoji rendering
  treeEmoji:
    "text-[13px] leading-none w-4 h-4 grid place-items-center shrink-0",

  // Note leaf node
  treeNoteNode:
    "group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 text-[12.5px] rounded-md cursor-pointer hover:bg-muted/50 text-muted-foreground transition-colors duration-150",
  treeNoteNodeActive:
    "group w-full flex items-center gap-1.5 h-7 pr-1.5 pl-1 text-[12.5px] rounded-md cursor-pointer bg-primary/12 text-primary font-medium transition-colors duration-150",
  treeNotePin: "text-amber-400/70 shrink-0",

  // Legacy (kept for compatibility elsewhere)
  listItem:
    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md cursor-pointer hover:bg-secondary text-muted-foreground border border-transparent transition-colors duration-150",
  listItemActive:
    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md cursor-pointer bg-primary/10 text-primary font-medium border border-primary/30 transition-colors duration-150",
  listItemCount: "ml-auto text-[10px] text-muted-foreground/35 tabular-nums",
  listItemIcon: "shrink-0 text-muted-foreground/50",
  pageItem:
    "w-full text-left flex flex-col gap-1 px-3 py-2.5 text-xs rounded-md cursor-pointer hover:bg-secondary transition-colors duration-150 border border-transparent",
  pageItemActive:
    "w-full text-left flex flex-col gap-1 px-3 py-2.5 text-xs rounded-md cursor-pointer bg-primary/10 border border-primary/30 transition-colors duration-150",
  pageTitle: "font-medium text-[13px] text-foreground truncate",
  pagePreview: "text-[11px] text-muted-foreground/45 truncate leading-relaxed",
  pageMeta: "text-[10px] text-muted-foreground/35 truncate",
  pagePin: "text-amber-400/80",

  // Labels (colored tag chips — surface/border/text tint applied inline per label color)
  labelBar: "flex flex-wrap gap-1.5 px-3 py-1.5",
  labelBadge:
    "inline-flex items-center px-2.5 py-1 text-[11px] font-medium leading-none rounded-full border cursor-pointer transition-all duration-150 hover:brightness-110",
  labelBadgeActive:
    "inline-flex items-center px-2.5 py-1 text-[11px] font-semibold leading-none rounded-full border cursor-pointer shadow-sm transition-all duration-150 hover:brightness-110",

  // Misc
  dropTarget: "bg-primary/10 ring-2 ring-primary/40 ring-dashed rounded-md",
  emptySection:
    "flex flex-col items-center gap-1.5 px-3 py-6 text-center text-[11px] text-muted-foreground/25",
  sectionDivider: "mx-3 my-2 border-t border-border/20",
} as const;
