import { useNoteLabelsStore } from '@/store/note-labels-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_update_label',
  definition: {
    type: 'function',
    function: {
      name: 'notes_update_label',
      description: 'Update an existing label. Can change name or color.',
      parameters: {
        type: 'object',
        properties: {
          labelId: { type: 'string', description: 'The label ID to update' },
          name: { type: 'string', description: 'New name' },
          color: { type: 'string', description: 'New color' },
        },
        required: ['labelId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const labelId = args.labelId as string
    if (!labelId) {
      return { kind: 'error', message: 'labelId is required.' }
    }

    const store = useNoteLabelsStore.getState()
    await store.loadLabels()
    const labels = useNoteLabelsStore.getState().labels
    const found = labels.find((l) => l.id === labelId)

    if (!found) {
      return { kind: 'error', message: `Label "${labelId}" not found.` }
    }

    const updated = { ...found }
    if (args.name !== undefined) updated.name = args.name as string
    if (args.color !== undefined) updated.color = args.color as string

    await useNoteLabelsStore.getState().updateLabel(updated)
    return { kind: 'success', message: `✅ Updated label "${updated.name}" (ID: ${labelId})` }
  },
}

export default tool
