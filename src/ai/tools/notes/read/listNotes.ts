import { useNotesStore } from '@/store/notes-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import type { Note } from '@/store/notes-store'

const SCOPE_KEY = 'notes-app:global:all'

const tool: ToolModule = {
  name: 'notes_list_notes',
  definition: {
    type: 'function',
    function: {
      name: 'notes_list_notes',
      description: 'List notes with optional filters by notebook, section, topic, filter mode, and sort order.',
      parameters: {
        type: 'object',
        properties: {
          notebookId: { type: 'string', description: 'Filter by notebook ID' },
          sectionId: { type: 'string', description: 'Filter by section ID' },
          topicId: { type: 'string', description: 'Filter by topic ID' },
          filter: { type: 'string', enum: ['all', 'notebooks', 'unsorted', 'pinned'], description: 'Filter mode. Defaults to all.' },
          sort: { type: 'string', enum: ['updated-desc', 'updated-asc', 'title-asc'], description: 'Sort order. Defaults to updated-desc.' },
        },
        required: [],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const store = useNotesStore.getState()
    await store.loadNotes('notes-app', 'global', 'all')

    let notes: Note[] = [...(useNotesStore.getState().notesByScope[SCOPE_KEY] || [])]

    // Filter out trashed notes
    notes = notes.filter((n) => !n.isTrashed)

    const notebookId = args.notebookId as string | undefined
    const sectionId = args.sectionId as string | undefined
    const topicId = args.topicId as string | undefined
    const filter = (args.filter as string) || 'all'

    if (notebookId) notes = notes.filter((n) => n.notebookId === notebookId)
    if (sectionId) notes = notes.filter((n) => n.sectionId === sectionId)
    if (topicId) notes = notes.filter((n) => n.topicId === topicId)

    if (filter === 'pinned') notes = notes.filter((n) => n.isPinned)
    else if (filter === 'unsorted') notes = notes.filter((n) => !n.notebookId)
    else if (filter === 'notebooks') notes = notes.filter((n) => !!n.notebookId)

    const sort = (args.sort as string) || 'updated-desc'
    if (sort === 'updated-asc') notes.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    else if (sort === 'title-asc') notes.sort((a, b) => a.title.localeCompare(b.title))
    else notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    if (notes.length === 0) {
      return { kind: 'success', message: 'No notes found matching the criteria.' }
    }

    const lines = notes.map(
      (n, i) =>
        `${i + 1}. **${n.title}** (ID: ${n.id})${n.isPinned ? ' 📌' : ''}${n.isFavorite ? ' ⭐' : ''} — updated ${n.updatedAt}`,
    )
    return { kind: 'success', message: `Found ${notes.length} note(s):\n${lines.join('\n')}` }
  },
}

export default tool
