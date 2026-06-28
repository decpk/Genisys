import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useSnippetsStore } from '@/store/snippets-store'

const tool: ToolModule = {
  name: 'dashboard_toggle_snippet_favorite',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_toggle_snippet_favorite',
      description: 'Toggle the favorite status of a snippet.',
      parameters: {
        type: 'object',
        properties: {
          snippetId: { type: 'string', description: 'ID of the snippet to toggle' },
        },
        required: ['snippetId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const snippetId = args.snippetId as string
    const store = useSnippetsStore.getState()
    const snippet = store.snippets.find((s) => s.id === snippetId)

    if (!snippet) {
      return { kind: 'error', message: `Snippet "${snippetId}" not found.` }
    }

    await store.toggleFavorite(snippetId)
    const newState = snippet.isFavorite ? 'unfavorited' : 'favorited'
    return { kind: 'success', message: `✅ Snippet "${snippet.title}" ${newState}.` }
  },
}
export default tool
