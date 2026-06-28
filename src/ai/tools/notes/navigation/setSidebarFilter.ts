import { useNotesAppStore } from '@/store/notes-app-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_set_sidebar_filter',
  definition: {
    type: 'function',
    function: {
      name: 'notes_set_sidebar_filter',
      description: 'Change the Notes sidebar filter to all, notebooks, unsorted, or pinned.',
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            enum: ['all', 'notebooks', 'unsorted', 'pinned'],
            description: 'The sidebar filter to apply',
          },
        },
        required: ['filter'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const filter = args.filter as string
    if (!filter || !['all', 'notebooks', 'unsorted', 'pinned'].includes(filter)) {
      return { kind: 'error', message: 'filter is required and must be one of: all, notebooks, unsorted, pinned.' }
    }

    useNotesAppStore.getState().setSidebarFilter(filter as any)
    return { kind: 'success', message: `✅ Sidebar filter set to "${filter}"` }
  },
}

export default tool
