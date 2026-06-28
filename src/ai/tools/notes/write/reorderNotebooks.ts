import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_reorder_notebooks',
  definition: {
    type: 'function',
    function: {
      name: 'notes_reorder_notebooks',
      description: 'Reorder notebooks by providing an ordered array of notebook IDs.',
      parameters: {
        type: 'object',
        properties: {
          orderedIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Ordered array of notebook IDs',
          },
        },
        required: ['orderedIds'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const orderedIds = args.orderedIds as string[]
    if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { kind: 'error', message: 'orderedIds is required and must be a non-empty array.' }
    }

    await useNoteNotebooksStore.getState().reorderNotebooks(orderedIds)
    return { kind: 'success', message: `✅ Reordered ${orderedIds.length} notebooks` }
  },
}

export default tool
