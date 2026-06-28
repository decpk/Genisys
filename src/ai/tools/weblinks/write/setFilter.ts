import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_set_filter',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_set_filter',
      description:
        'Set the free-text filter applied to the saved-preview list. Pass an empty string to clear the filter.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The filter text (empty string clears the filter).' },
        },
        required: ['query'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const query = args.query
    if (typeof query !== 'string') {
      return { kind: 'error', message: 'query is required (use an empty string to clear the filter).' }
    }

    useWebLinksStore.getState().setFilterQuery(query)
    return {
      kind: 'success',
      message: query ? `✅ Filter set to "${query}".` : '✅ Filter cleared.',
    }
  },
}

export default tool
