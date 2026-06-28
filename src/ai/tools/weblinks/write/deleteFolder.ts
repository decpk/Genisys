import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_delete_folder',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_delete_folder',
      description:
        'Delete a preview folder. Previews inside it become unfiled (they are not deleted). Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The id of the folder to delete.' },
        },
        required: ['folderId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const folderId = args.folderId as string
    if (!folderId) {
      return { kind: 'error', message: 'folderId is required.' }
    }

    const store = useWebLinksStore.getState()
    const folder = store.folders.find((f) => f.id === folderId)
    if (!folder) {
      return { kind: 'error', message: `Folder "${folderId}" not found.` }
    }

    const count = store.previews.filter((p) => p.folderId === folderId).length

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'previewer_delete_folder',
          description: `Delete folder: "${folder.name}"`,
          items: [{ path: folder.name, type: 'folder', details: `${count} previews` }],
          warning: 'Previews in this folder become unfiled (not deleted).',
        },
        executeAfterConfirm: async () => {
          await useWebLinksStore.getState().deleteFolder(folderId)
          return `✅ Deleted folder "${folder.name}".`
        },
      }
    }

    await store.deleteFolder(folderId)
    return { kind: 'success', message: `✅ Deleted folder "${folder.name}".` }
  },
}

export default tool
