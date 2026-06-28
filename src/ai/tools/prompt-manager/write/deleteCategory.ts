import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_delete_category',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_delete_category',
      description: 'Delete a prompt manager category. This is a destructive action requiring confirmation.',
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
    if (!categoryId) return { kind: 'error', message: 'categoryId is required.' }

    const { categories } = usePromptManagerStore.getState()
    const category = categories.find((c) => c.id === categoryId)
    if (!category) {
      return { kind: 'error', message: `Category "${categoryId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'promptmanager_delete_category',
          description: `Delete category: "${category.name}"`,
          items: [{ path: category.name, type: 'category', details: `Icon: ${category.icon ?? 'none'}` }],
          warning: `This will permanently delete the category "${category.name}" and all its prompts. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await usePromptManagerStore.getState().removeCategory(categoryId)
          return `✅ Category "${category.name}" has been deleted.`
        },
      }
    }

    await usePromptManagerStore.getState().removeCategory(categoryId)
    return { kind: 'success', message: `✅ Category "${category.name}" has been deleted.` }
  },
}

export default tool
