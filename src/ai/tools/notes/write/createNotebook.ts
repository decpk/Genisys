import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_create_notebook',
  definition: {
    type: 'function',
    function: {
      name: 'notes_create_notebook',
      description: 'Create a new notebook with a name, optional color, and optional emoji.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Notebook name' },
          color: { type: 'string', description: 'Notebook color' },
          emoji: { type: 'string', description: 'Emoji for the notebook' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name?.trim()) {
      return { kind: 'error', message: 'name is required.' }
    }

    const store = useNoteNotebooksStore.getState()
    const notebook = await store.addNotebook(name, args.color as string | undefined)

    if (args.emoji) {
      await useNoteNotebooksStore.getState().setNotebookAppearance(notebook.id, { emoji: args.emoji as string })
    }

    return { kind: 'success', message: `✅ Created notebook "${name}" (ID: ${notebook.id})` }
  },
}

export default tool
