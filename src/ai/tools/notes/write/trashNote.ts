import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_trash_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_trash_note',
      description: 'Move a note to the trash. Can be restored later.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to trash' },
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

    useNotesStore.getState().trashNote(noteId, 'notes-app', 'global', 'all')
    return { kind: 'success', message: `✅ Moved note "${noteId}" to trash` }
  },
}

export default tool
