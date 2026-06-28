import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'update_meeting',
  definition: {
    type: 'function',
    function: {
      name: 'update_meeting',
      description: 'Update an existing meeting. Only provided fields will be changed. Returns a summary of updated fields.',
      parameters: {
        type: 'object',
        properties: {
          meetingId: { type: 'string', description: 'The meeting ID to update' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the meeting is scheduled on' },
          title: { type: 'string', description: 'New meeting title' },
          description: { type: 'string', description: 'New meeting description' },
          startTime: { type: 'string', description: 'New start time in HH:mm format (24-hour)' },
          endTime: { type: 'string', description: 'New end time in HH:mm format (24-hour)' },
          location: { type: 'string', description: 'New meeting location' },
          meetingLink: { type: 'string', description: 'New meeting link' },
        },
        required: ['meetingId', 'date'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
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

    const updatedFields: string[] = []
    const updated: DPMeeting = { ...meeting, updatedAt: new Date().toISOString() }

    if (args.title !== undefined) {
      updated.title = (args.title as string).trim()
      updatedFields.push(`title → "${updated.title}"`)
    }
    if (args.description !== undefined) {
      updated.description = args.description as string
      updatedFields.push('description')
    }
    if (args.startTime !== undefined) {
      const time = args.startTime as string
      if (time && !/^\d{2}:\d{2}$/.test(time)) {
        return { kind: 'error', message: `Invalid start time: "${time}". Use HH:mm.` }
      }
      updated.startTime = time
      updatedFields.push(`startTime → ${updated.startTime}`)
    }
    if (args.endTime !== undefined) {
      const time = args.endTime as string
      if (time && !/^\d{2}:\d{2}$/.test(time)) {
        return { kind: 'error', message: `Invalid end time: "${time}". Use HH:mm.` }
      }
      updated.endTime = time
      updatedFields.push(`endTime → ${updated.endTime}`)
    }
    if (args.location !== undefined) {
      updated.location = args.location as string
      updatedFields.push(`location → "${updated.location}"`)
    }
    if (args.meetingLink !== undefined) {
      updated.meetingLink = args.meetingLink as string
      updatedFields.push(`meetingLink → "${updated.meetingLink}"`)
    }

    if (updatedFields.length === 0) {
      return { kind: 'success', message: 'No fields to update.' }
    }

    await useDailyPlanStore.getState().saveMeeting(updated)
    return {
      kind: 'success',
      message: `✅ Meeting "${updated.title}" updated: ${updatedFields.join(', ')}`,
    }
  },
}

export default tool
