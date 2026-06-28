import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_delete_notebook',
  definition: {
    type: 'function',
    function: {
      name: 'notes_delete_notebook',
      description: 'Delete a notebook. This action requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          notebookId: { type: 'string', description: 'The notebook ID to delete' },
        },
        required: ['notebookId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
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

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'notes_delete_notebook',
          description: `Delete notebook: "${found.name}"`,
          items: [{ path: notebookId, type: 'note', details: found.name }],
          warning: 'This will delete the notebook and may affect notes assigned to it.',
        },
        executeAfterConfirm: async () => {
          await useNoteNotebooksStore.getState().removeNotebook(notebookId)
          return `✅ Deleted notebook "${found.name}"`
        },
      }
    }

    await useNoteNotebooksStore.getState().removeNotebook(notebookId)
    return { kind: 'success', message: `✅ Deleted notebook "${found.name}"` }
  },
}

export default tool
