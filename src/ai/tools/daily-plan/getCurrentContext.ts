import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate, getToday } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'get_current_context',
      description: 'Get the current UI context of the Daily Plan, including selected date, view mode, and today\'s date.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useDailyPlanStore.getState()
    const today = getToday()
    const message = [
      '**Current Context**',
      '',
      `- **Today:** ${formatDate(today)} (${today})`,
      `- **Selected Date:** ${formatDate(store.selectedDate)} (${store.selectedDate})`,
      `- **View Mode:** ${store.viewMode}`,
      `- **Day View Mode:** ${store.dayViewMode}`,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
