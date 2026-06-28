import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_save_preview',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_save_preview',
      description:
        'Save a link into the collection: fetches the URL\'s metadata and stores it. Optionally file it into a folder — omit, null, or "unfiled" leaves it unfiled.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch and save into the collection.',
          },
          folderId: {
            type: ['string', 'null'],
            description: 'Optional folder id to file the link under. Omit, null, or "unfiled" leaves it unfiled.',
          },
        },
        required: ['url'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const url = typeof args.url === 'string' && args.url ? args.url : undefined
    if (!url) {
      return { kind: 'error', message: 'A `url` is required to save a link.' }
    }

    const raw = args.folderId
    const folderId =
      raw === undefined || raw === null || raw === '' || raw === 'unfiled' ? null : (raw as string)

    try {
      const saved = await useWebLinksStore.getState().addLink(url, folderId)

      const folderName = folderId
        ? (useWebLinksStore.getState().folders.find((f) => f.id === folderId)?.name ?? folderId)
        : 'Unfiled'

      return {
        kind: 'success',
        message: `✅ Saved "${saved.title || saved.url}" to ${folderName}.`,
      }
    } catch (err) {
      return {
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to save link.',
      }
    }
  },
}

export default tool
