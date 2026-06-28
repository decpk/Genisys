import { useClipboardStore } from '@/store/clipboard-store'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_remove_label_from_item',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_remove_label_from_item',
      description:
        'Remove a label from a clipboard item.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item.',
          },
          labelId: {
            type: 'string',
            description: 'The ID of the label to remove.',
          },
        },
        required: ['itemId', 'labelId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const itemId = args.itemId as string
    const labelId = args.labelId as string

    if (!itemId) return { kind: 'error', message: 'itemId is required.' }
    if (!labelId) return { kind: 'error', message: 'labelId is required.' }

    const items = useClipboardStore.getState().items
    const item = items.find((i) => i.id === itemId)
    if (!item) {
      return { kind: 'error', message: `Item "${itemId}" not found.` }
    }

    // Check if the label is actually assigned
    if (!item.labels.some((l) => l.id === labelId)) {
      return { kind: 'success', message: 'Label is not assigned to this item.' }
    }

    const labels = useClipboardLabelStore.getState().labels
    const label = labels.find((l) => l.id === labelId)
    const labelName = label?.name ?? labelId

    try {
      await useClipboardLabelStore.getState().removeLabelFromItem(itemId, labelId)
      useClipboardStore.getState().removeLabelFromItem(itemId, labelId)
      return { kind: 'success', message: `✅ Label "${labelName}" removed from item.` }
    } catch (e) {
      return { kind: 'error', message: `Failed to remove label: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
