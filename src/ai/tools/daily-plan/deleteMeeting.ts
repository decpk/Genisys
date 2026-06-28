import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatTimeRange } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'delete_meeting',
  definition: {
    type: 'function',
    function: {
      name: 'delete_meeting',
      description: 'Delete a meeting by its ID. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          meetingId: { type: 'string', description: 'The meeting ID to delete' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the meeting is scheduled on' },
        },
        required: ['meetingId', 'date'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const meetingId = args.meetingId as string
    const date = args.date as string
    if (!meetingId || !date) {
      return { kind: 'error', message: 'meetingId and date are required.' }
    }
    const meetings = useDailyPlanStore.getState().meetings[date] || []
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) {
      return { kind: 'error', message: `Meeting "${meetingId}" not found on ${date}.` }
    }
    if (!ctx.confirmed) {
      const timeRange = formatTimeRange(meeting.startTime, meeting.endTime)
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'delete_meeting',
          description: `Delete meeting: "${meeting.title}"`,
          items: [{ path: meeting.title, type: 'meeting', details: timeRange }],
          warning: `This will permanently delete the meeting "${meeting.title}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useDailyPlanStore.getState().removeMeeting(meetingId, date)
          return `✅ Meeting "${meeting.title}" has been deleted.`
        },
      }
    }
    await useDailyPlanStore.getState().removeMeeting(meetingId, date)
    return { kind: 'success', message: `✅ Meeting "${meeting.title}" has been deleted.` }
  },
}

export default tool
