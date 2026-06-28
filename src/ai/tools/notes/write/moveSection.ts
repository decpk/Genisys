import { useNoteSectionsStore } from '@/store/note-sections-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_move_section',
  definition: {
    type: 'function',
    function: {
      name: 'notes_move_section',
      description: 'Move a section to a different notebook.',
      parameters: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', description: 'The section ID to move' },
          newNotebookId: { type: 'string', description: 'Target notebook ID' },
        },
        required: ['sectionId', 'newNotebookId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const sectionId = args.sectionId as string
    const newNotebookId = args.newNotebookId as string
    if (!sectionId || !newNotebookId) {
      return { kind: 'error', message: 'sectionId and newNotebookId are required.' }
    }

    await useNoteSectionsStore.getState().moveSection(sectionId, newNotebookId)
    return { kind: 'success', message: `✅ Moved section "${sectionId}" to notebook "${newNotebookId}"` }
  },
}

export default tool
