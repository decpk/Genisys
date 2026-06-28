import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_rename_folder',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_rename_folder',
      description: 'Rename an existing preview folder.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The id of the folder to rename.' },
          name: { type: 'string', description: 'The new folder name.' },
        },
        required: ['folderId', 'name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const folderId = args.folderId as string
    const name = args.name as string
    if (!folderId) return { kind: 'error', message: 'folderId is required.' }
    if (!name) return { kind: 'error', message: 'name is required.' }

    const store = useWebLinksStore.getState()
    const folder = store.folders.find((f) => f.id === folderId)
    if (!folder) {
      const ids = store.folders.map((f) => f.id).join(', ') || '(none)'
      return { kind: 'error', message: `Folder "${folderId}" not found. Existing folder ids: ${ids}.` }
    }

    await store.renameFolder(folderId, name)
    return { kind: 'success', message: `✅ Renamed folder "${folder.name}" to "${name}".` }
  },
}

export default tool
