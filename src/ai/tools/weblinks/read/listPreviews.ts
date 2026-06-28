import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_list_previews',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_list_previews',
      description:
        "List saved previews, optionally scoped to a folder. Pass folderId='unfiled' for previews with no folder, a folder id for that folder's previews, or 'all' (or omit) for every saved preview.",
      parameters: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            description: "Folder scope: 'all', 'unfiled', or a folder id. Omit to list every saved preview.",
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const folderId = typeof args.folderId === 'string' && args.folderId ? args.folderId : undefined
    const store = useWebLinksStore.getState()

    let previews = store.previews
    if (folderId && folderId !== 'all') {
      previews =
        folderId === 'unfiled'
          ? previews.filter((p) => p.folderId === null)
          : previews.filter((p) => p.folderId === folderId)
    }

    const scope =
      !folderId || folderId === 'all'
        ? 'all folders'
        : folderId === 'unfiled'
          ? 'Unfiled'
          : `folder "${folderId}"`

    if (previews.length === 0) {
      return { kind: 'success', message: `No saved previews in ${scope}.` }
    }

    const rows = previews
      .map((p) => `| ${p.id} | ${p.title || p.url} | ${p.siteName || '—'} | ${p.folderId ?? 'unfiled'} |`)
      .join('\n')

    const message = [
      `**Saved Previews (${previews.length}) — ${scope}**`,
      '',
      '| id | title | site | folderId |',
      '| --- | --- | --- | --- |',
      rows,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
