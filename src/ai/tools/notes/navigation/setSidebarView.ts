import { useNotesAppStore } from '@/store/notes-app-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_set_sidebar_view',
  definition: {
    type: 'function',
    function: {
      name: 'notes_set_sidebar_view',
      description: 'Change the Notes sidebar view to notebooks, favorites, or trash.',
      parameters: {
        type: 'object',
        properties: {
          view: {
            type: 'string',
            enum: ['notebooks', 'favorites', 'trash'],
            description: 'The sidebar view to switch to',
          },
        },
        required: ['view'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const view = args.view as string
    if (!view || !['notebooks', 'favorites', 'trash'].includes(view)) {
      return { kind: 'error', message: 'view is required and must be one of: notebooks, favorites, trash.' }
    }

    useNotesAppStore.getState().setSidebarView(view as any)
    return { kind: 'success', message: `✅ Sidebar view set to "${view}"` }
  },
}

export default tool
