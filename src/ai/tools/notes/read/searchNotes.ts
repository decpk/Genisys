import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_search_notes',
  definition: {
    type: 'function',
    function: {
      name: 'notes_search_notes',
      description: 'Search notes by a text query. Returns matching notes with titles and IDs.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query string' },
        },
        required: ['query'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const query = args.query as string
    if (!query?.trim()) {
      return { kind: 'error', message: 'query is required.' }
    }

    const results = await useNotesStore.getState().searchSuggestions('notes-app', query)

    if (!results || results.length === 0) {
      return { kind: 'success', message: `No notes found matching "${query}".` }
    }

    const lines = results.map(
      (n: any, i: number) => `${i + 1}. **${n.title}** (ID: ${n.id})`,
    )
    return { kind: 'success', message: `Found ${results.length} result(s) for "${query}":\n${lines.join('\n')}` }
  },
}

export default tool
