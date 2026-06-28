import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'set_day_view_mode',
  definition: {
    type: 'function',
    function: {
      name: 'set_day_view_mode',
      description: 'Switch the day view between sections and timeline layouts.',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['sections', 'timeline'],
            description: 'The day view mode to switch to (required)',
          },
        },
        required: ['mode'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const mode = args.mode as 'sections' | 'timeline'
    if (!mode || !['sections', 'timeline'].includes(mode)) {
      return { kind: 'error', message: `Invalid day view mode: "${mode}". Use sections or timeline.` }
    }
    useDailyPlanStore.getState().setDayViewMode(mode)
    return {
      kind: 'success',
      message: `✅ Day view mode set to **${mode}**`,
    }
  },
}

export default tool
