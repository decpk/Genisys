import { useClipboardStore } from '@/store/clipboard-store'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_add_label_to_item',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_add_label_to_item',
      description:
        'Assign a label to a clipboard item. The label must already exist.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item.',
          },
          labelId: {
            type: 'string',
            description: 'The ID of the label to assign.',
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

    const labels = useClipboardLabelStore.getState().labels
    const label = labels.find((l) => l.id === labelId)
    if (!label) {
      return { kind: 'error', message: `Label "${labelId}" not found.` }
    }

    // Check if already assigned
    if (item.labels.some((l) => l.id === labelId)) {
      return { kind: 'success', message: `Label "${label.name}" is already assigned to this item.` }
    }

    try {
      await useClipboardLabelStore.getState().addLabelToItem(itemId, labelId)
      useClipboardStore.getState().addLabelToItem(itemId, label)
      return { kind: 'success', message: `✅ Label "${label.name}" assigned to item.` }
    } catch (e) {
      return { kind: 'error', message: `Failed to assign label: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
