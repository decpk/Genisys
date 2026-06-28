import { useDailyPlanStore } from '@/store/daily-plan-store'
import { addDays, formatDate } from '@/components/DailyPlan/utils/formatDate'
import { formatTime } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'
import { getTaskStatusEmoji } from './utils/getTaskStatusEmoji'
import { truncateText } from './utils/truncateText'

const tool: ToolModule = {
  name: 'get_tasks_for_range',
  definition: {
    type: 'function',
    function: {
      name: 'get_tasks_for_range',
      description: 'Get all tasks for a date range. Returns tasks grouped by date with details including title, status, priority, scheduled time, and duration.',
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
    let totalTasks = 0
    let current = startDate

    while (current <= endDate) {
      const tasks: DPTask[] = useDailyPlanStore.getState().tasks[current] || []
      if (tasks.length > 0) {
        totalTasks += tasks.length
        const lines = tasks.map((t) => {
          const status = getTaskStatusEmoji(t.status)
          const time = t.scheduledTime ? formatTime(t.scheduledTime) : 'Unscheduled'
          const duration = t.durationMinutes ? `${t.durationMinutes}min` : ''
          const description = truncateText(t.description || '', 100)
          return `| ${status} | ${t.title} | ${description} | ${t.priority} | ${time} | ${duration} | ${t.id} |`
        })
        sections.push(
          `### ${formatDate(current)} (${tasks.length} tasks)`,
          '',
          '| Status | Title | Description | Priority | Time | Duration | ID |',
          '|--------|-------|-------------|----------|------|----------|----|',
          ...lines,
          '',
        )
      }
      current = addDays(current, 1)
    }

    if (totalTasks === 0) {
      return { kind: 'success', message: `No tasks found from ${formatDate(startDate)} to ${formatDate(endDate)}.` }
    }

    const message = [
      `**Tasks from ${formatDate(startDate)} to ${formatDate(endDate)}** (${totalTasks} total)`,
      '',
      ...sections,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
