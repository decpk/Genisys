import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_update_category',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_update_category',
      description: 'Update a prompt manager category name and/or icon.',
      parameters: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', description: 'The category ID to update' },
          name: { type: 'string', description: 'New category name' },
          icon: { type: 'string', description: 'New category icon' },
        },
        required: ['categoryId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const categoryId = args.categoryId as string
    const name = args.name as string | undefined
    const icon = args.icon as string | undefined
    if (!categoryId) return { kind: 'error', message: 'categoryId is required.' }

    const { categories } = usePromptManagerStore.getState()
    const category = categories.find((c) => c.id === categoryId)
    if (!category) {
      return { kind: 'error', message: `Category "${categoryId}" not found.` }
    }

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = name
    if (icon !== undefined) updates.icon = icon

    if (Object.keys(updates).length === 0) {
      return { kind: 'error', message: 'Provide at least one field to update (name or icon).' }
    }

    await usePromptManagerStore.getState().updateCategory(categoryId, updates)
    return { kind: 'success', message: `✅ Category "${category.name}" updated.` }
  },
}

export default tool
