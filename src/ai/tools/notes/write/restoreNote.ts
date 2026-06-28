import { useNotesAppStore } from '@/store/notes-app-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_restore_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_restore_note',
      description: 'Restore a note from the trash.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to restore' },
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

    await useNotesAppStore.getState().restoreFromTrash(noteId)
    return { kind: 'success', message: `✅ Restored note "${noteId}" from trash` }
  },
}

export default tool
