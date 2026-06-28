import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_update_text',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_update_text',
      description:
        'Update the text content of a clipboard item. Only works for text-type items.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the clipboard item to update.',
          },
          textContent: {
            type: 'string',
            description: 'The new text content for the item.',
          },
        },
        required: ['itemId', 'textContent'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const itemId = args.itemId as string
    const textContent = args.textContent as string

    if (!itemId) {
      return { kind: 'error', message: 'itemId is required.' }
    }
    if (textContent === undefined || textContent === null) {
      return { kind: 'error', message: 'textContent is required.' }
    }

    const items = useClipboardStore.getState().items
    const item = items.find((i) => i.id === itemId)
    if (!item) {
      return { kind: 'error', message: `Item "${itemId}" not found.` }
    }
    if (item.contentType !== 'text') {
      return { kind: 'error', message: 'Cannot update text content of an image item.' }
    }

    try {
      await useClipboardStore.getState().updateText(itemId, textContent)
      const preview = textContent.slice(0, 60).replace(/\n/g, ' ')
      return { kind: 'success', message: `✅ Text updated: "${preview}${textContent.length > 60 ? '…' : ''}"` }
    } catch (e) {
      return { kind: 'error', message: `Failed to update: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
