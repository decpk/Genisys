import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate, getToday } from '@/components/DailyPlan/utils/formatDate'
import { formatTimeRange } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'get_meetings_for_date',
  definition: {
    type: 'function',
    function: {
      name: 'get_meetings_for_date',
      description: 'Get all meetings for a specific date. Returns meeting details including title, time range, and location. If no date is provided, returns meetings for today.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Date in YYYY-MM-DD format. Defaults to today if not provided.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const date = (args.date as string) || getToday()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { kind: 'error', message: `Invalid date format: "${date}". Use YYYY-MM-DD.` }
    }
    const store = useDailyPlanStore.getState()
    if (!store.meetings[date]) {
      await store.loadDataForDate(date)
    }
    const meetings: DPMeeting[] = useDailyPlanStore.getState().meetings[date] || []
    if (meetings.length === 0) {
      return { kind: 'success', message: `No meetings found for ${formatDate(date)}.` }
    }
    const lines = meetings.map((m) => {
      const time = formatTimeRange(m.startTime, m.endTime)
      const location = m.location || '—'
      return `| ${time} | ${m.title} | ${location} | ${m.id} |`
    })
    const message = [
      `**Meetings for ${formatDate(date)}** (${meetings.length} total)`,
      '',
      '| Time | Title | Location | ID |',
      '|------|-------|----------|----|',
      ...lines,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
