import type { DPTask, DPMeeting } from '../DailyPlan.types'

// ── Internal types ──────────────────────────────────────────────

interface TimelineEvent {
  id: string
  type: 'task' | 'meeting'
  startMinutes: number
  endMinutes: number
  task: DPTask | null
  meeting: DPMeeting | null
}

export interface LayoutEvent extends TimelineEvent {
  column: number
  totalColumns: number
}

// ── Helpers ─────────────────────────────────────────────────────

function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(':')
  return parseInt(h, 10) * 60 + parseInt(m ?? '0', 10)
}

function normalizeTask(task: DPTask): TimelineEvent | null {
  if (!task.scheduledTime) return null
  const start = timeToMinutes(task.scheduledTime)
  return {
    id: task.id,
    type: 'task',
    startMinutes: start,
    endMinutes: start + Math.max(task.durationMinutes, 15),
    task,
    meeting: null,
  }
}

function normalizeMeeting(meeting: DPMeeting): TimelineEvent {
  return {
    id: meeting.id,
    type: 'meeting',
    startMinutes: timeToMinutes(meeting.startTime),
    endMinutes: Math.max(
      timeToMinutes(meeting.endTime),
      timeToMinutes(meeting.startTime) + 15,
    ),
    task: null,
    meeting,
  }
}

// ── Core algorithm ──────────────────────────────────────────────

/**
 * Compute the column layout for a set of tasks and meetings.
 *
 * Algorithm:
 * 1. Normalize tasks and meetings into a unified event list.
 * 2. Sort by start time (ties broken by longer duration first).
 * 3. Walk through events and group overlapping ones into collision groups.
 * 4. Within each group assign column indices using a greedy first-fit approach.
 * 5. Return events with `column` and `totalColumns` for positioning.
 */
export function computeTimelineLayout(
  tasks: DPTask[],
  meetings: DPMeeting[],
): LayoutEvent[] {
  // 1. Normalize
  const events: TimelineEvent[] = [
    ...tasks.map(normalizeTask).filter(Boolean) as TimelineEvent[],
    ...meetings.map(normalizeMeeting),
  ]

  if (events.length === 0) return []

  // 2. Sort — earlier start first, longer events first for ties
  events.sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
    return (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
  })

  // 3-4. Build collision groups and assign columns
  const result: LayoutEvent[] = []
  let groupStart = 0

  while (groupStart < events.length) {
    // Find all events in this collision group
    let groupEnd = events[groupStart].endMinutes

    let i = groupStart + 1
    while (i < events.length && events[i].startMinutes < groupEnd) {
      groupEnd = Math.max(groupEnd, events[i].endMinutes)
      i++
    }

    // Assign columns within this group using greedy first-fit
    const group = events.slice(groupStart, i)
    const columnEnds: number[] = [] // tracks the end-time of the last event in each column

    for (const event of group) {
      let placed = false
      for (let col = 0; col < columnEnds.length; col++) {
        if (event.startMinutes >= columnEnds[col]) {
          columnEnds[col] = event.endMinutes
          result.push({ ...event, column: col, totalColumns: 0 })
          placed = true
          break
        }
      }
      if (!placed) {
        const col = columnEnds.length
        columnEnds.push(event.endMinutes)
        result.push({ ...event, column: col, totalColumns: 0 })
      }
    }

    // 5. Set totalColumns for every event in this group
    const totalCols = columnEnds.length
    for (let j = result.length - group.length; j < result.length; j++) {
      result[j].totalColumns = totalCols
    }

    groupStart = i
  }

  return result
}
