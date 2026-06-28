import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_open_preview',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_open_preview',
      description:
        'Open the full preview modal for a clipboard item. Shows the complete text or full-size image.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item to preview.',
          },
        },
        required: ['itemId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const itemId = args.itemId as string
    if (!itemId) {
      return { kind: 'error', message: 'itemId is required.' }
    }

    const items = useClipboardStore.getState().items
    const item = items.find((i) => i.id === itemId)
    if (!item) {
      return { kind: 'error', message: `Item "${itemId}" not found.` }
    }

    useClipboardStore.getState().openPreview(itemId)
    const type = item.contentType === 'text' ? 'text' : 'image'
    return { kind: 'success', message: `✅ Preview opened for ${type} item.` }
  },
}

export default tool
