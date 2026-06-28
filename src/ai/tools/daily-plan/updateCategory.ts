import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPCategory } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'update_category',
  definition: {
    type: 'function',
    function: {
      name: 'update_category',
      description: 'Update an existing category. Only provided fields will be changed.',
      parameters: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', description: 'The category ID to update' },
          name: { type: 'string', description: 'New category name' },
          color: { type: 'string', description: 'New hex color code' },
          icon: { type: 'string', description: 'New emoji icon' },
        },
        required: ['categoryId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const categoryId = args.categoryId as string
    if (!categoryId) {
      return { kind: 'error', message: 'categoryId is required.' }
    }
    const categories = useDailyPlanStore.getState().categories
    const category = categories.find((c) => c.id === categoryId)
    if (!category) {
      return { kind: 'error', message: `Category "${categoryId}" not found.` }
    }

    const updatedFields: string[] = []
    const updated: DPCategory = { ...category }

    if (args.name !== undefined) {
      updated.name = (args.name as string).trim()
      updatedFields.push(`name → "${updated.name}"`)
    }
    if (args.color !== undefined) {
      updated.color = args.color as string
      updatedFields.push(`color → ${updated.color}`)
    }
    if (args.icon !== undefined) {
      updated.icon = args.icon as string
      updatedFields.push(`icon → ${updated.icon}`)
    }

    if (updatedFields.length === 0) {
      return { kind: 'success', message: 'No fields to update.' }
    }

    await useDailyPlanStore.getState().saveCategory(updated)
    return {
      kind: 'success',
      message: `✅ Category "${updated.name}" updated: ${updatedFields.join(', ')}`,
    }
  },
}

export default tool
