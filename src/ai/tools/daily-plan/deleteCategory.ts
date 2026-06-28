import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'delete_category',
  definition: {
    type: 'function',
    function: {
      name: 'delete_category',
      description: 'Delete a category by its ID. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', description: 'The category ID to delete' },
        },
        required: ['categoryId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const categoryId = args.categoryId as string
    if (!categoryId) {
      return { kind: 'error', message: 'categoryId is required.' }
    }
    const categories = useDailyPlanStore.getState().categories
    const category = categories.find((c) => c.id === categoryId)
    if (!category) {
      return { kind: 'error', message: `Category "${categoryId}" not found.` }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'delete_category',
          description: `Delete category: "${category.name}"`,
          items: [{ path: category.name, type: 'category', details: `${category.icon} ${category.color}` }],
          warning: `This will permanently delete the category "${category.name}". Tasks using this category will lose their category assignment. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useDailyPlanStore.getState().removeCategory(categoryId)
          return `✅ Category "${category.name}" has been deleted.`
        },
      }
    }
    await useDailyPlanStore.getState().removeCategory(categoryId)
    return { kind: 'success', message: `✅ Category "${category.name}" has been deleted.` }
  },
}

export default tool
