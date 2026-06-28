import { useNoteSectionsStore } from '@/store/note-sections-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_create_section',
  definition: {
    type: 'function',
    function: {
      name: 'notes_create_section',
      description: 'Create a new section within a notebook.',
      parameters: {
        type: 'object',
        properties: {
          notebookId: { type: 'string', description: 'Parent notebook ID' },
          name: { type: 'string', description: 'Section name' },
          color: { type: 'string', description: 'Section color' },
        },
        required: ['notebookId', 'name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const notebookId = args.notebookId as string
    const name = args.name as string
    if (!notebookId || !name?.trim()) {
      return { kind: 'error', message: 'notebookId and name are required.' }
    }

    const section = await useNoteSectionsStore.getState().addSection(notebookId, name, args.color as string | undefined)
    return { kind: 'success', message: `✅ Created section "${name}" (ID: ${section.id}) in notebook ${notebookId}` }
  },
}

export default tool
