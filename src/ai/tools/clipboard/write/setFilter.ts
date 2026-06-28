import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_set_filter',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_set_filter',
      description:
        'Set the active filter in the clipboard manager to show only specific types of items.',
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['all', 'text', 'image', 'labeled', 'pinned'],
            description: 'The filter type to apply.',
          },
        },
        required: ['filter'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const filter = args.filter as 'all' | 'text' | 'image' | 'labeled' | 'pinned'
    if (!filter) {
      return { kind: 'error', message: 'filter is required.' }
    }

    useClipboardStore.getState().setFilter(filter)
    return { kind: 'success', message: `✅ Filter set to **${filter}**.` }
  },
}

export default tool
