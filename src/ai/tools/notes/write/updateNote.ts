import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_update_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_update_note',
      description: 'Update an existing note. Can change title, content, color, emoji, notebook, section, or topic.',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'The note ID to update' },
          title: { type: 'string', description: 'New title' },
          content: { type: 'string', description: 'New markdown content' },
          color: { type: 'string', description: 'New color' },
          emoji: { type: 'string', description: 'New emoji' },
          notebookId: { type: 'string', description: 'New notebook ID' },
          sectionId: { type: 'string', description: 'New section ID' },
          topicId: { type: 'string', description: 'New topic ID' },
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

    const updates: Record<string, unknown> = { ...found }
    if (args.title !== undefined) updates.title = args.title
    if (args.content !== undefined) updates.content = args.content
    if (args.color !== undefined) updates.color = args.color
    if (args.emoji !== undefined) updates.emoji = args.emoji
    if (args.notebookId !== undefined) updates.notebookId = args.notebookId
    if (args.sectionId !== undefined) updates.sectionId = args.sectionId
    if (args.topicId !== undefined) updates.topicId = args.topicId

    await useNotesStore.getState().updateNote(updates as any)

    return { kind: 'success', message: `✅ Updated note "${updates.title}" (ID: ${noteId})` }
  },
}

export default tool
