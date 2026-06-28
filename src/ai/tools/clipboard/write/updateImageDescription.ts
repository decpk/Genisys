import { useClipboardStore } from '@/store/clipboard-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_update_image_description',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_update_image_description',
      description:
        'Update or set the description of a clipboard image item manually.',
      parameters: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The ID of the image clipboard item.',
          },
          description: {
            type: 'string',
            description: 'The new description for the image.',
          },
        },
        required: ['itemId', 'description'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const itemId = args.itemId as string
    const description = args.description as string

    if (!itemId) {
      return { kind: 'error', message: 'itemId is required.' }
    }
    if (!description?.trim()) {
      return { kind: 'error', message: 'description is required.' }
    }

    const items = useClipboardStore.getState().items
    const item = items.find((i) => i.id === itemId)
    if (!item) {
      return { kind: 'error', message: `Item "${itemId}" not found.` }
    }
    if (item.contentType !== 'image') {
      return { kind: 'error', message: 'Can only set descriptions for image items.' }
    }

    try {
      await useClipboardStore.getState().updateImageDescription(itemId, description.trim())
      return { kind: 'success', message: `✅ Image description updated: "${description.trim().slice(0, 80)}"` }
    } catch (e) {
      return { kind: 'error', message: `Failed to update description: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
