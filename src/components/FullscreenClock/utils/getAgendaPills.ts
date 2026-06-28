import type { DPMeeting, DPTask } from '@/components/DailyPlan/DailyPlan.types'

export interface AgendaPill {
  /** Unique key for React lists. */
  key: string
  /** 24-hour `HH:MM` string from the source record. */
  time24: string
  /** Display title for the pill. */
  title: string
  /** Source kind — used by the view for accent styling. */
  kind: 'task' | 'meeting'
}

export interface GetAgendaPillsInput {
  now: Date
  tasks: DPTask[] | undefined
  meetings: DPMeeting[] | undefined
  /** Max number of pills to return. Defaults to 3. */
  limit?: number
}

export interface GetAgendaPillsResult {
  /** Upcoming items (sorted ascending by time, sliced to `limit`). */
  pills: AgendaPill[]
  /** Total tasks scheduled today (regardless of time / status). */
  totalTasks: number
  /** Total meetings scheduled today (regardless of time / status). */
  totalMeetings: number
  /** True when there were items today but they are all completed/past. */
  isWrapped: boolean
  /** True when there are no items scheduled at all for the day. */
  isEmpty: boolean
}

const SKIP_MEETING_STATUSES: ReadonlySet<string> = new Set([
  'completed',
  'cancelled',
  'no_show',
])

function toHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/** Builds the bottom-band agenda payload from today's tasks/meetings. */
export function getAgendaPills(input: GetAgendaPillsInput): GetAgendaPillsResult {
  const { now, tasks, meetings, limit = 3 } = input
  const safeTasks = tasks ?? []
  const safeMeetings = meetings ?? []

  const nowHHMM = toHHMM(now)
  const pills: AgendaPill[] = []

  for (const meeting of safeMeetings) {
    if (!meeting.startTime) continue
    if (SKIP_MEETING_STATUSES.has(meeting.status)) continue
    if (meeting.startTime < nowHHMM) continue
    pills.push({
      key: `m:${meeting.id}`,
      time24: meeting.startTime,
      title: meeting.title || 'Untitled meeting',
      kind: 'meeting',
    })
  }

  for (const task of safeTasks) {
    if (!task.scheduledTime) continue
    if (task.status === 'completed') continue
    if (task.scheduledTime < nowHHMM) continue
    pills.push({
      key: `t:${task.id}`,
      time24: task.scheduledTime,
      title: task.title || 'Untitled task',
      kind: 'task',
    })
  }

  pills.sort((a, b) => a.time24.localeCompare(b.time24))
  const sliced = pills.slice(0, limit)

  const totalTasks = safeTasks.length
  const totalMeetings = safeMeetings.length
  const totalAll = totalTasks + totalMeetings
  const isEmpty = totalAll === 0
  const isWrapped = !isEmpty && sliced.length === 0

  return {
    pills: sliced,
    totalTasks,
    totalMeetings,
    isWrapped,
    isEmpty,
  }
}
