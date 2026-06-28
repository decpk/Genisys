import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_delete_item',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_delete_item',
      description:
        'Delete a clipboard item permanently. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item to delete.',
          },
        },
        required: ['itemId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const itemId = args.itemId as string
    if (!itemId) {
      return { kind: 'error', message: 'itemId is required.' }
    }

    const items = useClipboardStore.getState().items
    const item = items.find((i) => i.id === itemId)
    if (!item) {
      return { kind: 'error', message: `Item "${itemId}" not found.` }
    }

    const preview =
      item.contentType === 'text'
        ? (item.textContent?.slice(0, 60)?.replace(/\n/g, ' ') ?? '(empty text)')
        : '(image)'

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'clipboard_delete_item',
          description: `Delete clipboard item: ${preview}`,
          items: [{ path: preview, type: item.contentType, details: `${item.byteSize} bytes` }],
          warning: 'This will permanently delete this clipboard item. This cannot be undone.',
        },
        executeAfterConfirm: async () => {
          await useClipboardStore.getState().removeItem(itemId)
          return `✅ Clipboard item deleted: ${preview}`
        },
      }
    }

    await useClipboardStore.getState().removeItem(itemId)
    return { kind: 'success', message: `✅ Clipboard item deleted: ${preview}` }
  },
}

export default tool
