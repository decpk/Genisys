import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'set_selected_date',
  definition: {
    type: 'function',
    function: {
      name: 'set_selected_date',
      description: 'Navigate to a specific date in the daily plan view. Loads data for that date.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format (required)' },
        },
        required: ['date'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const date = args.date as string
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { kind: 'error', message: `Invalid date: "${date}". Use YYYY-MM-DD.` }
    }
    const store = useDailyPlanStore.getState()
    store.setSelectedDate(date)
    await store.loadDataForDate(date)
    return {
      kind: 'success',
      message: `✅ Navigated to ${formatDate(date)}`,
    }
  },
}

export default tool
