import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate, getToday } from '@/components/DailyPlan/utils/formatDate'
import { formatTime } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'
import { getTaskStatusEmoji } from './utils/getTaskStatusEmoji'
import { truncateText } from './utils/truncateText'

const tool: ToolModule = {
  name: 'get_tasks_for_date',
  definition: {
    type: 'function',
    function: {
      name: 'get_tasks_for_date',
      description: 'Get all tasks for a specific date. Returns task details including title, status, priority, scheduled time, and duration. If no date is provided, returns tasks for today.',
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
    if (!store.tasks[date]) {
      await store.loadDataForDate(date)
    }
    const tasks: DPTask[] = useDailyPlanStore.getState().tasks[date] || []
    if (tasks.length === 0) {
      return { kind: 'success', message: `No tasks found for ${formatDate(date)}.` }
    }
    const lines = tasks.map((t) => {
      const status = getTaskStatusEmoji(t.status)
      const time = t.scheduledTime ? formatTime(t.scheduledTime) : 'Unscheduled'
      const duration = t.durationMinutes ? `${t.durationMinutes}min` : ''
      const description = truncateText(t.description || '', 100)
      return `| ${status} | ${t.title} | ${description} | ${t.priority} | ${time} | ${duration} | ${t.id} |`
    })
    const message = [
      `**Tasks for ${formatDate(date)}** (${tasks.length} total)`,
      '',
      '| Status | Title | Description | Priority | Time | Duration | ID |',
      '|--------|-------|-------------|----------|------|----------|----|',
      ...lines,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
