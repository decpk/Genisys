import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_list_folders',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_list_folders',
      description: 'List all prompt manager folders along with their categories.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    const store = usePromptManagerStore.getState()
    if (!store.isLoaded) {
      await store.loadAll()
    }
    const { folders, categories } = usePromptManagerStore.getState()
    const result = folders.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      isBuiltIn: f.isBuiltIn ?? false,
      categories: categories
        .filter((c) => c.folderId === f.id)
        .map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
    }))
    return { kind: 'success', message: JSON.stringify(result, null, 2) }
  },
}

export default tool
