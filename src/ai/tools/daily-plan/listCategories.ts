import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'list_categories',
  definition: {
    type: 'function',
    function: {
      name: 'list_categories',
      description: 'List all available task categories. Returns category details including name, color, and icon.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useDailyPlanStore.getState()
    await store.loadCategories()
    const categories = useDailyPlanStore.getState().categories || []
    if (categories.length === 0) {
      return { kind: 'success', message: 'No categories found.' }
    }
    const lines = categories.map((c) => {
      const icon = c.icon || '—'
      return `| ${c.name} | ${c.color} | ${icon} | ${c.id} |`
    })
    const message = [
      `**Categories** (${categories.length} total)`,
      '',
      '| Name | Color | Icon | ID |',
      '|------|-------|------|----|',
      ...lines,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
