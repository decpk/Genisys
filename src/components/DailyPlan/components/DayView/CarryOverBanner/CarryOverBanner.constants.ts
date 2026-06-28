import { CheckSquare, Eye, CalendarClock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CarryOverItemType } from './CarryOverBanner.types'

export const CARRYOVER_DISMISSED_KEY = 'genisys.dailyPlan.carryoverDismissed'

export const CARRY_OVER_ICON_MAP: Record<CarryOverItemType, LucideIcon> = {
  task: CheckSquare,
  review: Eye,
  meeting: CalendarClock,
}
