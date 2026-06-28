import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'set_view_mode',
  definition: {
    type: 'function',
    function: {
      name: 'set_view_mode',
      description: 'Switch the daily plan view mode between day, week, and month views.',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['day', 'week', 'month'],
            description: 'The view mode to switch to (required)',
          },
        },
        required: ['mode'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const mode = args.mode as 'day' | 'week' | 'month'
    if (!mode || !['day', 'week', 'month'].includes(mode)) {
      return { kind: 'error', message: `Invalid view mode: "${mode}". Use day, week, or month.` }
    }
    useDailyPlanStore.getState().setViewMode(mode)
    return {
      kind: 'success',
      message: `✅ View mode set to **${mode}**`,
    }
  },
}

export default tool
