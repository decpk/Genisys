import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_get_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_get_note',
      description: 'Get a specific note by its ID. Returns the full note details including title, content, labels, and metadata.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to retrieve' },
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

    const labels = found.labels?.length ? found.labels.join(', ') : 'none'
    return {
      kind: 'success',
      message: `**${found.title}**\n- ID: ${found.id}\n- Notebook: ${found.notebookId || 'none'}\n- Section: ${found.sectionId || 'none'}\n- Topic: ${found.topicId || 'none'}\n- Labels: ${labels}\n- Pinned: ${found.isPinned}\n- Favorite: ${found.isFavorite}\n- Trashed: ${found.isTrashed}\n- Color: ${found.color || 'default'}\n- Emoji: ${found.emoji || 'none'}\n- Created: ${found.createdAt}\n- Updated: ${found.updatedAt}\n\n${found.content || '(empty)'}`,
    }
  },
}

export default tool
