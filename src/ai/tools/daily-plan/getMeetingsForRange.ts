import { useDailyPlanStore } from '@/store/daily-plan-store'
import { addDays, formatDate } from '@/components/DailyPlan/utils/formatDate'
import { formatTimeRange } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'get_meetings_for_range',
  definition: {
    type: 'function',
    function: {
      name: 'get_meetings_for_range',
      description: 'Get all meetings for a date range. Returns meetings grouped by date with details including title, time range, and location.',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format.',
          },
          endDate: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format.',
          },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const startDate = args.startDate as string
    const endDate = args.endDate as string
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(startDate)) {
      return { kind: 'error', message: `Invalid start date format: "${startDate}". Use YYYY-MM-DD.` }
    }
    if (!datePattern.test(endDate)) {
      return { kind: 'error', message: `Invalid end date format: "${endDate}". Use YYYY-MM-DD.` }
    }
    if (startDate > endDate) {
      return { kind: 'error', message: `Start date "${startDate}" is after end date "${endDate}".` }
    }

    const store = useDailyPlanStore.getState()
    await store.loadDataForRange(startDate, endDate)

    const sections: string[] = []
    let totalMeetings = 0
    let current = startDate

    while (current <= endDate) {
      const meetings: DPMeeting[] = useDailyPlanStore.getState().meetings[current] || []
      if (meetings.length > 0) {
        totalMeetings += meetings.length
        const lines = meetings.map((m) => {
          const time = formatTimeRange(m.startTime, m.endTime)
          const location = m.location || '—'
          return `| ${time} | ${m.title} | ${location} | ${m.id} |`
        })
        sections.push(
          `### ${formatDate(current)} (${meetings.length} meetings)`,
          '',
          '| Time | Title | Location | ID |',
          '|------|-------|----------|----|',
          ...lines,
          '',
        )
      }
      current = addDays(current, 1)
    }

    if (totalMeetings === 0) {
      return { kind: 'success', message: `No meetings found from ${formatDate(startDate)} to ${formatDate(endDate)}.` }
    }

    const message = [
      `**Meetings from ${formatDate(startDate)} to ${formatDate(endDate)}** (${totalMeetings} total)`,
      '',
      ...sections,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
