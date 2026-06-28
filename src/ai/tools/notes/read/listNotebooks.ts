import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_list_notebooks',
  definition: {
    type: 'function',
    function: {
      name: 'notes_list_notebooks',
      description: 'List all notebooks. Returns notebook names, IDs, colors, and emojis.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (): Promise<ToolResult> => {
    await useNoteNotebooksStore.getState().loadNotebooks()
    const notebooks = useNoteNotebooksStore.getState().notebooks

    if (!notebooks || notebooks.length === 0) {
      return { kind: 'success', message: 'No notebooks found.' }
    }

    const lines = notebooks.map(
      (nb, i) =>
        `${i + 1}. ${nb.emoji || '📓'} **${nb.name}** (ID: ${nb.id})${nb.color ? ` — color: ${nb.color}` : ''}${nb.isSystem ? ' [system]' : ''}`,
    )
    return { kind: 'success', message: `Found ${notebooks.length} notebook(s):\n${lines.join('\n')}` }
  },
}

export default tool
