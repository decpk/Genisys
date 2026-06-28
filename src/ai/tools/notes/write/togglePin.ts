import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_toggle_pin',
  definition: {
    type: 'function',
    function: {
      name: 'notes_toggle_pin',
      description: 'Toggle the pinned state of a note.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to toggle pin' },
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

    useNotesStore.getState().togglePin(noteId, 'notes-app', 'global', 'all')
    return { kind: 'success', message: `✅ Toggled pin for note "${noteId}"` }
  },
}

export default tool
