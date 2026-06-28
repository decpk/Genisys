import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_move_preview',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_move_preview',
      description:
        'Move a saved preview into a folder, or unfile it. Pass folderId=null or "unfiled" to remove it from any folder.',
      parameters: {
        type: 'object',
        properties: {
          previewId: { type: 'string', description: 'The id of the saved preview to move.' },
          folderId: {
            type: ['string', 'null'],
            description: 'Destination folder id, or null/"unfiled" to unfile the preview.',
          },
        },
        required: ['previewId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const previewId = args.previewId as string
    if (!previewId) {
      return { kind: 'error', message: 'previewId is required.' }
    }

    const store = useWebLinksStore.getState()
    const preview = store.previews.find((p) => p.id === previewId)
    if (!preview) {
      return { kind: 'error', message: `Saved preview "${previewId}" not found.` }
    }

    const raw = args.folderId
    const folderId =
      raw === null || raw === undefined || raw === '' || raw === 'unfiled' ? null : (raw as string)

    let folderName = 'Unfiled'
    if (folderId !== null) {
      const folder = store.folders.find((f) => f.id === folderId)
      if (!folder) {
        return { kind: 'error', message: `Folder "${folderId}" not found.` }
      }
      folderName = folder.name
    }

    await store.movePreview(previewId, folderId)
    return { kind: 'success', message: `✅ Moved "${preview.title || preview.url}" to ${folderName}.` }
  },
}

export default tool
