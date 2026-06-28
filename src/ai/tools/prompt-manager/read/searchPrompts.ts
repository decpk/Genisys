import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_search_prompts',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_search_prompts',
      description: 'Search prompts by title, content, or description.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query string' },
        },
        required: ['query'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const query = args.query as string
    if (!query) {
      return { kind: 'error', message: 'query is required.' }
    }

    const store = usePromptManagerStore.getState()
    if (!store.isLoaded) {
      await store.loadAll()
    }
    const { prompts } = usePromptManagerStore.getState()
    const q = query.toLowerCase()
    const matches = prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    )

    const result = matches.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      isPinned: p.isPinned,
      categoryId: p.categoryId,
      folderId: p.folderId,
    }))
    return { kind: 'success', message: `Found ${result.length} prompt(s).\n${JSON.stringify(result, null, 2)}` }
  },
}

export default tool
