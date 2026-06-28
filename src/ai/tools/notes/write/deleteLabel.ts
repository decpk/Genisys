import { useNoteLabelsStore } from '@/store/note-labels-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'notes_delete_label',
  definition: {
    type: 'function',
    function: {
      name: 'notes_delete_label',
      description: 'Delete a label. This action requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          labelId: { type: 'string', description: 'The label ID to delete' },
        },
        required: ['labelId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
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

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'notes_delete_label',
          description: `Delete label: "${found.name}"`,
          items: [{ path: labelId, type: 'note', details: found.name }],
          warning: 'This will delete the label and remove it from all notes.',
        },
        executeAfterConfirm: async () => {
          await useNoteLabelsStore.getState().removeLabel(labelId)
          return `✅ Deleted label "${found.name}"`
        },
      }
    }

    await useNoteLabelsStore.getState().removeLabel(labelId)
    return { kind: 'success', message: `✅ Deleted label "${found.name}"` }
  },
}

export default tool
