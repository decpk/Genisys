import { itemTileElevationStyles } from '../../shared/styles/itemTileElevation.styles'

export const reviewCardStyles = {
  // Borderless, transparent list row — flush in the section well with only a
  // subtle hover tint (see `itemTileElevationStyles`). Priority is expressed
  // by a single calm dot (see `PriorityDot`).
  card: `group/review relative isolate overflow-hidden ${itemTileElevationStyles.base}`,

  // Completed rows fade back — they read as archived but stay hover-active.
  cardCompleted: "opacity-60",

  cardInner: "relative pl-3.5 pr-3 py-2.5",

  // On hover the absolutely-positioned 3-dot menu (see `menuButton`) is
  // revealed at the right edge. Slide the row's trailing values left so the
  // menu never lands on top of the title, pills, or time block.
  cardRow:
    "flex items-center gap-2 relative z-[1] transition-[padding] duration-200 ease-out group-hover/review:pr-7",
  cardTitle:
    "text-[13.5px] font-normal tracking-tight text-foreground line-clamp-1 flex-1 min-w-0",
  titleCompleted: "line-through text-muted-foreground",

  typePill:
    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0",

  statusPill:
    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0",
  statusPillInProgress: "bg-sky-500/12 text-sky-400 ring-sky-500/25",
  statusPillCompleted: "bg-emerald-500/12 text-emerald-400 ring-emerald-500/25",

  timeBlock:
    "shrink-0 inline-flex items-center gap-1 rounded-md bg-background/50 ring-1 ring-inset ring-border/40 px-1.5 py-0.5 backdrop-blur-[2px]",
  timeIcon: "size-3 text-muted-foreground/70",
  timeText: "text-[10.5px] font-medium tabular-nums text-foreground/85",
  timeDuration: "text-[10px] text-muted-foreground/60 tabular-nums",

  reviewBtn:
    "shrink-0 inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary ring-1 ring-inset ring-primary/25 px-1.5 py-0.5 text-[10.5px] font-medium hover:bg-primary/15 transition-colors",
  reviewBtnIcon: "size-3",

  cardDescription:
    "text-[11.5px] text-muted-foreground/75 mt-1.5 ml-[26px] leading-relaxed",

  // PR author shown before the title: small avatar + name, bounded so the
  // title still takes the remaining row width.
  authorGroup: "shrink-0 inline-flex items-center gap-1.5 min-w-0",
  authorAvatar: "size-4",
  authorName:
    "max-w-[120px] truncate text-[12px] font-medium text-foreground/80",

  // Markdown-rendered description (PR reviews only).
  mdDescription:
    "mt-1.5 ml-[26px] text-[11.5px] text-muted-foreground/80 leading-relaxed",

  linkRail: "mt-2 ml-[26px]",

  menuButton:
    "absolute top-1.5 right-1.5 flex items-center justify-center size-6 rounded-md bg-background/70 ring-1 ring-inset ring-border/40 backdrop-blur-sm opacity-0 group-hover/review:opacity-100 focus-within:opacity-100 hover:bg-background/90 transition-all duration-150 z-10",
} as const;

export const REVIEW_STATUS_PILL_STYLES: Record<string, string> = {
  in_progress: reviewCardStyles.statusPillInProgress,
  completed: reviewCardStyles.statusPillCompleted,
}

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
}
