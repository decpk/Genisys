import { useNoteLabelsStore } from '@/store/note-labels-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_set_note_labels',
  definition: {
    type: 'function',
    function: {
      name: 'notes_set_note_labels',
      description: 'Set the labels for a note. Replaces all existing labels on the note.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID' },
          labelIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of label IDs to assign',
          },
        },
        required: ['noteId', 'labelIds'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const noteId = args.noteId as string
    const labelIds = args.labelIds as string[]
    if (!noteId) {
      return { kind: 'error', message: 'noteId is required.' }
    }
    if (!labelIds || !Array.isArray(labelIds)) {
      return { kind: 'error', message: 'labelIds is required and must be an array.' }
    }

    await useNoteLabelsStore.getState().setNoteLabels(noteId, labelIds)
    return { kind: 'success', message: `✅ Set ${labelIds.length} label(s) on note "${noteId}"` }
  },
}

export default tool
