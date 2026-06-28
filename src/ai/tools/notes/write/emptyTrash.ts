import { useNotesAppStore } from '@/store/notes-app-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_empty_trash',
  definition: {
    type: 'function',
    function: {
      name: 'notes_empty_trash',
      description: 'Permanently delete all notes in the trash. This action requires confirmation.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, ctx): Promise<ToolResult> => {
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'notes_empty_trash',
          description: 'Empty the trash — permanently delete all trashed notes',
          items: [{ path: 'trash', type: 'note', details: 'All trashed notes will be permanently deleted' }],
          warning: 'This cannot be undone.',
        },
        executeAfterConfirm: async () => {
          await useNotesAppStore.getState().emptyTrash()
          return '✅ Trash emptied'
        },
      }
    }

    await useNotesAppStore.getState().emptyTrash()
    return { kind: 'success', message: '✅ Trash emptied' }
  },
}

export default tool
