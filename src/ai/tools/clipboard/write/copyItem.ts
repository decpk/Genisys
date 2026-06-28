import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_copy_item',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_copy_item',
      description:
        'Copy a clipboard item back to the system clipboard so the user can paste it. Works for both text and image items.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item to copy.',
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

    try {
      await useClipboardStore.getState().copyToClipboard(itemId)
      const preview = item
        ? item.contentType === 'text'
          ? `"${item.textContent?.slice(0, 60) ?? ''}"`
          : '(image)'
        : itemId
      return { kind: 'success', message: `✅ Copied ${preview} to system clipboard.` }
    } catch (e) {
      return { kind: 'error', message: `Failed to copy: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
