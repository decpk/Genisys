import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_set_search',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_set_search',
      description:
        'Set the search query in the clipboard manager UI. This updates the search input and filters visible items.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query. Pass empty string to clear search.',
          },
          fuzzy: {
            type: 'boolean',
            description: 'Enable fuzzy search for approximate matching. Defaults to current state.',
          },
        },
        required: ['query'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const query = args.query as string
    const fuzzy = args.fuzzy as boolean | undefined
    const store = useClipboardStore.getState()

    if (fuzzy !== undefined && fuzzy !== store.isFuzzySearch) {
      store.toggleFuzzySearch()
    }

    store.setSearchQuery(query)

    if (!query) {
      return { kind: 'success', message: '✅ Search cleared.' }
    }
    return {
      kind: 'success',
      message: `✅ Search set to "${query}"${fuzzy ? ' (fuzzy mode)' : ''}.`,
    }
  },
}

export default tool
