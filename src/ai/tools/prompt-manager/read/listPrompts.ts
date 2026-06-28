import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_list_prompts',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_list_prompts',
      description: 'List prompts, optionally filtered by folder ID and/or category ID.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'Filter prompts by folder ID' },
          categoryId: { type: 'string', description: 'Filter prompts by category ID' },
        },
        required: [],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const folderId = args.folderId as string | undefined
    const categoryId = args.categoryId as string | undefined

    const store = usePromptManagerStore.getState()
    if (!store.isLoaded) {
      await store.loadAll()
    }
    let { prompts } = usePromptManagerStore.getState()

    if (folderId) {
      prompts = prompts.filter((p) => p.folderId === folderId)
    }
    if (categoryId) {
      prompts = prompts.filter((p) => p.categoryId === categoryId)
    }

    const result = prompts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      isPinned: p.isPinned,
      categoryId: p.categoryId,
      folderId: p.folderId,
    }))
    return { kind: 'success', message: JSON.stringify(result, null, 2) }
  },
}

export default tool
