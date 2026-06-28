import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_delete_preview',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_delete_preview',
      description: 'Delete a saved preview from the collection by its id. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          previewId: { type: 'string', description: 'The id of the saved preview to delete.' },
        },
        required: ['previewId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const previewId = args.previewId as string
    if (!previewId) {
      return { kind: 'error', message: 'previewId is required.' }
    }

    const store = useWebLinksStore.getState()
    const preview = store.previews.find((p) => p.id === previewId)
    if (!preview) {
      return { kind: 'error', message: `Saved preview "${previewId}" not found.` }
    }

    const title = preview.title || preview.url

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'previewer_delete_preview',
          description: `Delete saved preview: "${title}"`,
          items: [{ path: title, type: 'preview' }],
          warning: 'This permanently removes the saved preview from your collection.',
        },
        executeAfterConfirm: async () => {
          await useWebLinksStore.getState().deletePreview(previewId)
          return `✅ Deleted "${title}".`
        },
      }
    }

    await store.deletePreview(previewId)
    return { kind: 'success', message: `✅ Deleted "${title}".` }
  },
}

export default tool
