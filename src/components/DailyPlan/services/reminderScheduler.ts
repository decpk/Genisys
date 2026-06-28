import { useDailyPlanStore } from '@/store/daily-plan-store'
import { notify } from '@/frameworks/notification'
import { getToday } from '@/components/DailyPlan/utils/formatDate'
import { formatTime } from '@/components/DailyPlan/utils/formatTime'

const POLL_INTERVAL_MS = 30_000 // check every 30 seconds
// Only notify "meeting started" within this window of the actual start, so the
// scheduler doesn't retroactively fire for meetings that began before the app
// (or this scheduler) started. Comfortably wider than one poll interval.
const MEETING_START_GRACE_MS = 90_000
const firedReminders = new Set<string>()

let intervalId: ReturnType<typeof setInterval> | null = null

function checkReminders() {
  const now = Date.now()
  const store = useDailyPlanStore.getState()
  const today = getToday()

  // Check today's tasks
  const tasks = store.tasks[today] || []
  for (const task of tasks) {
    if (!task.reminderAt || task.status === 'completed') continue
    const key = `task-${task.id}`
    if (firedReminders.has(key)) continue

    const reminderTime = new Date(task.reminderAt).getTime()
    if (reminderTime <= now) {
      firedReminders.add(key)
      const timeStr = task.scheduledTime ? ` at ${formatTime(task.scheduledTime)}` : ''
      notify({
        source: 'daily-plan',
        type: 'warning',
        title: 'Task Reminder',
        channel: 'os',
        message: `${task.title}${timeStr}`,
      })
    }
  }

  // Check today's meetings
  const meetings = store.meetings[today] || []
  for (const meeting of meetings) {
    if (!meeting.reminderAt) continue
    if (meeting.status === 'completed' || meeting.status === 'cancelled') continue
    const key = `meeting-${meeting.id}`
    if (firedReminders.has(key)) continue

    const reminderTime = new Date(meeting.reminderAt).getTime()
    if (reminderTime <= now) {
      firedReminders.add(key)
      const timeStr = meeting.startTime ? ` at ${formatTime(meeting.startTime)}` : ''
      notify({
        source: 'daily-plan',
        type: 'info',
        title: 'Meeting Reminder',
        channel: 'os',
        message: `${meeting.title}${timeStr}`,
      })
    }
  }

  // Notify when a meeting STARTS. The grace window prevents retroactive spam
  // when the app/scheduler starts after meetings have already begun.
  const startMeetings = store.meetings[today] ?? []
  for (const meeting of startMeetings) {
    if (meeting.status === 'completed' || meeting.status === 'cancelled') continue
    if (!meeting.startTime || !/^\d{2}:\d{2}$/.test(meeting.startTime)) continue
    const key = `meeting-start-${meeting.id}`
    if (firedReminders.has(key)) continue

    const startMs = new Date(`${meeting.scheduledDate}T${meeting.startTime}:00`).getTime()
    if (Number.isNaN(startMs)) continue
    if (now >= startMs && now - startMs <= MEETING_START_GRACE_MS) {
      firedReminders.add(key)
      notify({
        source: 'daily-plan',
        type: 'info',
        title: 'Meeting started',
        channel: 'os',
        message: `${meeting.title} at ${formatTime(meeting.startTime)}`,
      })
    }
  }
}

export function startReminderScheduler() {
  if (intervalId) return
  checkReminders() // immediate first check
  intervalId = setInterval(checkReminders, POLL_INTERVAL_MS)
}

export function stopReminderScheduler() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function clearFiredReminders() {
  firedReminders.clear()
}
