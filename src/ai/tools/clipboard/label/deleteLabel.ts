import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_delete_label',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_delete_label',
      description:
        'Delete a clipboard label. This removes the label from all items that have it assigned. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          labelId: {
            type: 'string',
            description: 'The ID of the label to delete.',
          },
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

    const labels = useClipboardLabelStore.getState().labels
    const label = labels.find((l) => l.id === labelId)
    if (!label) {
      return { kind: 'error', message: `Label "${labelId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'clipboard_delete_label',
          description: `Delete label: "${label.name}"`,
          items: [{ path: label.name, type: 'label', details: `Color: ${label.color}` }],
          warning: `This will delete the label "${label.name}" and remove it from all clipboard items. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          const result = await useClipboardLabelStore.getState().deleteLabel(labelId)
          return `✅ Label "${label.name}" deleted. ${result.affectedCount} item(s) updated.`
        },
      }
    }

    const result = await useClipboardLabelStore.getState().deleteLabel(labelId)
    return {
      kind: 'success',
      message: `✅ Label "${label.name}" deleted. ${result.affectedCount} item(s) updated.`,
    }
  },
}

export default tool
