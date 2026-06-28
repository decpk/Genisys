import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatTime } from '@/components/DailyPlan/utils/formatTime'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'
import { getTaskStatusEmoji } from './utils/getTaskStatusEmoji'
import { truncateText } from './utils/truncateText'

const tool: ToolModule = {
  name: 'search_tasks',
  definition: {
    type: 'function',
    function: {
      name: 'search_tasks',
      description: 'Search for tasks by keyword across all dates. Returns matching tasks with their details.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query to find tasks by title or description.',
          },
        },
        required: ['query'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const query = args.query as string
    if (!query || query.trim().length === 0) {
      return { kind: 'error', message: 'Search query cannot be empty.' }
    }
    const store = useDailyPlanStore.getState()
    await store.searchTasks(query)
    const results: DPTask[] = useDailyPlanStore.getState().searchResults || []
    if (results.length === 0) {
      return { kind: 'success', message: `No tasks found matching "${query}".` }
    }
    const lines = results.map((t) => {
      const status = getTaskStatusEmoji(t.status)
      const time = t.scheduledTime ? formatTime(t.scheduledTime) : 'Unscheduled'
      const description = truncateText(t.description || '', 120)
      return `| ${status} | ${t.title} | ${description} | ${t.priority} | ${t.scheduledDate} | ${time} | ${t.id} |`
    })
    const message = [
      `**Search results for "${query}"** (${results.length} found)`,
      '',
      '| Status | Title | Description | Priority | Date | Time | ID |',
      '|--------|-------|-------------|----------|------|------|----|',
      ...lines,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
