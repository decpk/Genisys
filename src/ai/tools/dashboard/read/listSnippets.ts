import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useSnippetsStore } from '@/store/snippets-store'

const tool: ToolModule = {
  name: 'dashboard_list_snippets',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_list_snippets',
      description: 'List all saved snippets with their details (id, title, content preview, isFavorite, createdAt).',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    const store = useSnippetsStore.getState()
    if (!store.isLoaded) await store.loadSnippets()

    const { snippets } = useSnippetsStore.getState()
    if (snippets.length === 0) {
      return { kind: 'success', message: 'No snippets saved.' }
    }

    const list = snippets
      .map((s, i) => {
        const fav = s.isFavorite ? ' ⭐' : ''
        const preview = s.content.length > 80 ? s.content.slice(0, 80) + '…' : s.content
        return `${i + 1}. **${s.title}**${fav} (id: ${s.id})\n   ${preview}\n   Created: ${s.createdAt}`
      })
      .join('\n')

    return { kind: 'success', message: `Snippets (${snippets.length}):\n${list}` }
  },
}
export default tool
