import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_duplicate_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_duplicate_note',
      description: 'Duplicate an existing note.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to duplicate' },
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

    useNotesStore.getState().duplicateNote(noteId, 'notes-app', 'global', 'all')
    return { kind: 'success', message: `✅ Duplicated note "${noteId}"` }
  },
}

export default tool
