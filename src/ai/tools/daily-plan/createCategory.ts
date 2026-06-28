import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '@/components/DailyPlan/utils/generateId'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPCategory } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'create_category',
  definition: {
    type: 'function',
    function: {
      name: 'create_category',
      description: 'Create a new task category. Returns the created category details.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Category name (required)' },
          color: { type: 'string', description: 'Hex color code (e.g. #6366f1). Defaults to #6366f1.' },
          icon: { type: 'string', description: 'Emoji icon for the category. Defaults to 📁.' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name?.trim()) {
      return { kind: 'error', message: 'Category name is required.' }
    }

    const now = new Date().toISOString()
    const category: DPCategory = {
      id: generateId('cat'),
      name: name.trim(),
      color: (args.color as string) || '#6366f1',
      icon: (args.icon as string) || '📁',
      sortOrder: Date.now(),
      createdAt: now,
    }

    await useDailyPlanStore.getState().saveCategory(category)
    return {
      kind: 'success',
      message: `✅ Category created: ${category.icon} **${category.name}** (${category.color})`,
    }
  },
}

export default tool
