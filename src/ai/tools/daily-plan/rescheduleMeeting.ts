import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'reschedule_meeting',
  definition: {
    type: 'function',
    function: {
      name: 'reschedule_meeting',
      description: 'Reschedule a meeting to a new date and/or time. At least one of newDate, newStartTime, or newEndTime must be provided.',
      parameters: {
        type: 'object',
        properties: {
          meetingId: { type: 'string', description: 'The meeting ID to reschedule' },
          currentDate: { type: 'string', description: 'The current date (YYYY-MM-DD) the meeting is on' },
          newDate: { type: 'string', description: 'New date in YYYY-MM-DD format' },
          newStartTime: { type: 'string', description: 'New start time in HH:mm format (24-hour)' },
          newEndTime: { type: 'string', description: 'New end time in HH:mm format (24-hour)' },
        },
        required: ['meetingId', 'currentDate'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const meetingId = args.meetingId as string
    const currentDate = args.currentDate as string
    const newDate = args.newDate as string | undefined
    const newStartTime = args.newStartTime as string | undefined
    const newEndTime = args.newEndTime as string | undefined

    if (!meetingId || !currentDate) {
      return { kind: 'error', message: 'meetingId and currentDate are required.' }
    }
    if (!newDate && !newStartTime && !newEndTime) {
      return { kind: 'error', message: 'At least one of newDate, newStartTime, or newEndTime must be provided.' }
    }
    if (newDate && !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return { kind: 'error', message: `Invalid date: "${newDate}". Use YYYY-MM-DD.` }
    }
    if (newStartTime && !/^\d{2}:\d{2}$/.test(newStartTime)) {
      return { kind: 'error', message: `Invalid start time: "${newStartTime}". Use HH:mm.` }
    }
    if (newEndTime && !/^\d{2}:\d{2}$/.test(newEndTime)) {
      return { kind: 'error', message: `Invalid end time: "${newEndTime}". Use HH:mm.` }
    }

    const store = useDailyPlanStore.getState()
    const meetings = store.meetings[currentDate] || []
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) {
      return { kind: 'error', message: `Meeting "${meetingId}" not found on ${currentDate}.` }
    }

    const updated = { ...meeting, updatedAt: new Date().toISOString() }
    const dateChanged = newDate && newDate !== currentDate

    if (newDate) {
      updated.scheduledDate = newDate
    }
    if (newStartTime) {
      updated.startTime = newStartTime
    }
    if (newEndTime) {
      updated.endTime = newEndTime
    }

    if (dateChanged) {
      await store.removeMeeting(meetingId, currentDate)
    }
    await store.saveMeeting(updated)

    const parts: string[] = []
    if (dateChanged) parts.push(`date → ${formatDate(updated.scheduledDate)}`)
    if (newStartTime) parts.push(`startTime → ${updated.startTime}`)
    if (newEndTime) parts.push(`endTime → ${updated.endTime}`)

    return {
      kind: 'success',
      message: `✅ Meeting "${meeting.title}" rescheduled: ${parts.join(', ')}`,
    }
  },
}

export default tool
