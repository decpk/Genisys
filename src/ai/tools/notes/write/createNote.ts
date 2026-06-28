import { useNotesStore, type Note } from '@/store/notes-store'
import { useSettingsStore } from '@/store/settings-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_create_note',
  definition: {
    type: 'function',
    function: {
      name: 'notes_create_note',
      description: 'Create a new note with optional title, content, notebook, section, topic, color, and emoji.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the note' },
          content: { type: 'string', description: 'Markdown content of the note' },
          notebookId: { type: 'string', description: 'Notebook ID to assign the note to' },
          sectionId: { type: 'string', description: 'Section ID to assign the note to' },
          topicId: { type: 'string', description: 'Topic ID to assign the note to' },
          color: { type: 'string', description: 'Color for the note' },
          emoji: { type: 'string', description: 'Emoji for the note' },
        },
        required: ['title'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const title = args.title as string
    if (!title?.trim()) {
      return { kind: 'error', message: 'title is required.' }
    }

    const store = useNotesStore.getState()
    const note = await store.addNote('notes-app', 'global', 'all')

    const updates: Note = { ...note, title }
    if (args.content) updates.content = args.content as string
    if (args.notebookId) updates.notebookId = args.notebookId as string
    if (args.sectionId) updates.sectionId = args.sectionId as string
    if (args.topicId) updates.topicId = args.topicId as string
    if (args.color) updates.color = args.color as string
    if (args.emoji) updates.emoji = args.emoji as string

    await useNotesStore.getState().updateNote(updates)
    // New notes open in Edit mode (single-pane view derives mode from global notesMode).
    useSettingsStore.getState().setNotesMode('edit')

    return { kind: 'success', message: `✅ Created note "${title}" (ID: ${note.id})` }
  },
}

export default tool
