import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_delete_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_delete_note',
      description: 'Permanently delete a note. This action requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to delete' },
        },
        required: ['noteId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const noteId = args.noteId as string
    if (!noteId) {
      return { kind: 'error', message: 'noteId is required.' }
    }

    const { notesByScope } = useNotesStore.getState()
    let found = null
    for (const notes of Object.values(notesByScope)) {
      const match = notes.find((n) => n.id === noteId)
      if (match) {
        found = match
        break
      }
    }

    if (!found) {
      return { kind: 'error', message: `Note "${noteId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'notes_delete_note',
          description: `Delete note: "${found.title}"`,
          items: [{ path: noteId, type: 'note', details: found.title }],
          warning: 'This will permanently delete the note.',
        },
        executeAfterConfirm: async () => {
          useNotesStore.getState().removeNote(noteId, 'notes-app', 'global', 'all')
          return `✅ Deleted note "${found.title}"`
        },
      }
    }

    useNotesStore.getState().removeNote(noteId, 'notes-app', 'global', 'all')
    return { kind: 'success', message: `✅ Deleted note "${found.title}"` }
  },
}

export default tool
