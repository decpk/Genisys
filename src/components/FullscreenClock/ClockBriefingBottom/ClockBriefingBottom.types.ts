import type { AgendaPill } from '../utils/getAgendaPills'

export interface ClockBriefingBottomProps {
  /** Current time tick — drives day progress + agenda filter. */
  now: Date
  /** Tailwind opacity class (`opacity-0` in PiP, `opacity-100` otherwise). */
  chromeOpacity: string
  /** Dismiss hint string (e.g. 'Press Esc · Click anywhere to dismiss'). */
  dismissHint: string
}

export interface ClockBriefingBottomData {
  pills: AgendaPill[]
  isEmpty: boolean
  isWrapped: boolean
  totalTasks: number
  totalMeetings: number
  totalDone: number
  dayPercent: number
  dayRatio: number
  summaryLine: string
  emptyLine: string
}
