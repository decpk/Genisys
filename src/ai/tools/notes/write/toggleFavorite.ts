import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_toggle_favorite',
  definition: {
    type: 'function',
    function: {
      name: 'notes_toggle_favorite',
      description: 'Toggle the favorite state of a note.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to toggle favorite' },
        },
        required: ['noteId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const noteId = args.noteId as string
    if (!noteId) {
      return { kind: 'error', message: 'noteId is required.' }
    }

    useNotesStore.getState().toggleFavorite(noteId, 'notes-app', 'global', 'all')
    return { kind: 'success', message: `✅ Toggled favorite for note "${noteId}"` }
  },
}

export default tool
