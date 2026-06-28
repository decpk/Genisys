import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_create_category',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_create_category',
      description: 'Create a new category inside a prompt manager folder.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The parent folder ID' },
          name: { type: 'string', description: 'Category name' },
          icon: { type: 'string', description: 'Category icon (optional)' },
        },
        required: ['folderId', 'name'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const folderId = args.folderId as string
    const name = args.name as string
    const icon = args.icon as string | undefined
    if (!folderId) return { kind: 'error', message: 'folderId is required.' }
    if (!name) return { kind: 'error', message: 'name is required.' }

    const { folders } = usePromptManagerStore.getState()
    if (!folders.find((f) => f.id === folderId)) {
      return { kind: 'error', message: `Folder "${folderId}" not found.` }
    }

    const category = await usePromptManagerStore.getState().addCategory(folderId, name, icon)
    return { kind: 'success', message: `✅ Category "${category.name}" created (id: ${category.id}).` }
  },
}

export default tool
