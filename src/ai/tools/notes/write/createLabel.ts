import { useNoteLabelsStore } from '@/store/note-labels-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_create_label',
  definition: {
    type: 'function',
    function: {
      name: 'notes_create_label',
      description: 'Create a new label with a name and optional color.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Label name' },
          color: { type: 'string', description: 'Label color' },
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

    const label = await useNoteLabelsStore.getState().addLabel(name, args.color as string | undefined)
    return { kind: 'success', message: `✅ Created label "${name}" (ID: ${label.id})` }
  },
}

export default tool
