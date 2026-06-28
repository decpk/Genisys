import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_update_notebook',
  definition: {
    type: 'function',
    function: {
      name: 'notes_update_notebook',
      description: 'Update an existing notebook. Can change name, color, or emoji.',
      parameters: {
        type: 'object',
        properties: {
          notebookId: { type: 'string', description: 'The notebook ID to update' },
          name: { type: 'string', description: 'New name' },
          color: { type: 'string', description: 'New color' },
          emoji: { type: 'string', description: 'New emoji' },
        },
        required: ['notebookId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const notebookId = args.notebookId as string
    if (!notebookId) {
      return { kind: 'error', message: 'notebookId is required.' }
    }

    const store = useNoteNotebooksStore.getState()
    await store.loadNotebooks()
    const notebooks = useNoteNotebooksStore.getState().notebooks
    const found = notebooks.find((nb) => nb.id === notebookId)

    if (!found) {
      return { kind: 'error', message: `Notebook "${notebookId}" not found.` }
    }

    const updated = { ...found }
    if (args.name !== undefined) updated.name = args.name as string
    if (args.color !== undefined) updated.color = args.color as string

    await useNoteNotebooksStore.getState().updateNotebook(updated)

    if (args.emoji !== undefined) {
      await useNoteNotebooksStore.getState().setNotebookAppearance(notebookId, { emoji: args.emoji as string })
    }

    return { kind: 'success', message: `✅ Updated notebook "${updated.name}" (ID: ${notebookId})` }
  },
}

export default tool
