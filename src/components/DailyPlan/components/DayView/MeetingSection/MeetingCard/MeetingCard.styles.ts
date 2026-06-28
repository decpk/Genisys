import type { DPMeetingStatus } from '../../../../DailyPlan.types'
import { itemTileElevationStyles } from '../../shared/styles/itemTileElevation.styles'

export const MEETING_STATUS_PILL_STYLES: Record<DPMeetingStatus, string> = {
  scheduled: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 ring-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-600 ring-red-500/20',
  postponed: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
  no_show: 'bg-rose-500/10 text-rose-600 ring-rose-500/20',
  rescheduled: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
}

export const MEETING_STATUS_LABELS: Record<DPMeetingStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Done',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
  no_show: 'No Show',
  rescheduled: 'Rescheduled',
}

export const meetingCardStyles = {
  // Borderless, transparent list row — flush in the section well with only a
  // subtle hover tint (see `itemTileElevationStyles`). Priority is expressed
  // by a single calm dot (see `PriorityDot`).
  container: `group/meeting relative isolate overflow-hidden ${itemTileElevationStyles.base}`,
  inner: "relative pl-3.5 pr-3 py-2.5 flex flex-col gap-1.5",

  // On hover the absolutely-positioned 3-dot menu (see `menuButton`) is
  // revealed at the right edge, vertically aligned with this row. Slide the
  // row's trailing values left so the menu never lands on top of the title or
  // time pill.
  row1:
    "flex items-center gap-2 relative z-[1] transition-[padding] duration-200 ease-out group-hover/meeting:pr-7",
  iconContainer:
    "flex items-center justify-center size-5 rounded-md bg-blue-500/15 shrink-0",
  icon: "size-3.5 text-blue-400",

  titleContainer: "flex-1 min-w-0 flex items-center gap-1",
  title:
    "text-[13.5px] font-normal tracking-tight text-foreground line-clamp-1",
  titleCancelled: "line-through text-muted-foreground",
  titleCompleted: "text-muted-foreground",

  indicatorIcon: "size-3 text-muted-foreground/60 shrink-0",

  timePill:
    "shrink-0 inline-flex items-center gap-1 rounded-md bg-background/50 ring-1 ring-inset ring-border/40 px-1.5 py-0.5 backdrop-blur-[2px]",
  timePillIcon: "size-3 text-muted-foreground/70",
  timePillText: "text-[10.5px] font-medium tabular-nums text-foreground/85",
  timePillDuration: "text-[10px] text-muted-foreground/60",

  chipRow: "flex flex-wrap items-center gap-1.5 ml-[28px] relative z-[1]",
  statusChip:
    "inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0",
  typeChip:
    "inline-flex items-center rounded-full bg-muted/50 text-muted-foreground/85 ring-1 ring-inset ring-border/40 px-2 py-0.5 text-[9.5px] font-medium shrink-0",
  joinChip:
    "inline-flex items-center gap-1 rounded-full bg-blue-500/12 text-blue-400 ring-1 ring-inset ring-blue-500/25 px-2 py-0.5 text-[10px] font-medium hover:bg-blue-500/20 transition-colors shrink-0",
  joinChipIcon: "size-3",
  locationChip:
    "inline-flex items-center gap-1 rounded-full bg-muted/40 text-muted-foreground/85 ring-1 ring-inset ring-border/40 px-2 py-0.5 text-[10px] font-medium shrink-0",
  locationChipIcon: "size-3",

  description:
    "text-[11.5px] text-muted-foreground/75 ml-[28px] mt-1.5 leading-relaxed relative z-[1]",

  linkRail: "mt-2 ml-[28px] relative z-[1]",

  cancelled: "opacity-50",
  completed: "opacity-65",

  menuButton:
    "absolute top-1.5 right-1.5 flex items-center justify-center size-6 rounded-md bg-background/70 ring-1 ring-inset ring-border/40 backdrop-blur-sm opacity-0 group-hover/meeting:opacity-100 focus-within:opacity-100 hover:bg-background/90 transition-all duration-150 z-10",
} as const;
