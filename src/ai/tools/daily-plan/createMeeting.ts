import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '@/components/DailyPlan/utils/generateId'
import { getToday, formatDate } from '@/components/DailyPlan/utils/formatDate'
import { formatTimeRange } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'create_meeting',
  definition: {
    type: 'function',
    function: {
      name: 'create_meeting',
      description: 'Create a new meeting. Returns the created meeting details.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Meeting title (required)' },
          scheduledDate: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
          startTime: { type: 'string', description: 'Start time in HH:mm format (24-hour, required)' },
          endTime: { type: 'string', description: 'End time in HH:mm format (24-hour, required)' },
          description: { type: 'string', description: 'Meeting description' },
          location: { type: 'string', description: 'Meeting location' },
          meetingLink: { type: 'string', description: 'Meeting link (e.g. Zoom, Google Meet)' },
        },
        required: ['title', 'startTime', 'endTime'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const title = args.title as string
    const startTime = args.startTime as string
    const endTime = args.endTime as string

    if (!title?.trim()) {
      return { kind: 'error', message: 'Meeting title is required.' }
    }
    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
      return { kind: 'error', message: `Invalid start time: "${startTime}". Use HH:mm format.` }
    }
    if (!endTime || !/^\d{2}:\d{2}$/.test(endTime)) {
      return { kind: 'error', message: `Invalid end time: "${endTime}". Use HH:mm format.` }
    }

    const scheduledDate = (args.scheduledDate as string) || getToday()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return { kind: 'error', message: `Invalid date: "${scheduledDate}". Use YYYY-MM-DD.` }
    }

    const now = new Date().toISOString()
    const meeting: DPMeeting = {
      id: generateId('meeting'),
      title: title.trim(),
      description: (args.description as string) || '',
      scheduledDate,
      startTime,
      endTime,
      location: (args.location as string) || '',
      meetingLink: (args.meetingLink as string) || '',
      reminderAt: null,
      status: 'scheduled',
      meetingType: 'general',
      priority: 'medium',
      notes: '',
      followUp: '',
      agenda: '',
      outcome: '',
      attendees: '',
      cancelReason: '',
      sortOrder: Date.now(),
      createdAt: now,
      updatedAt: now,
    }

    await useDailyPlanStore.getState().saveMeeting(meeting)
    return {
      kind: 'success',
      message: `✅ Meeting created: **${meeting.title}** on ${formatDate(scheduledDate)}, ${formatTimeRange(startTime, endTime)}`,
    }
  },
}

export default tool
