import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_delete_folder',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_delete_folder',
      description: 'Delete an API folder and all its requests. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The folder ID to delete' },
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

    const store = useApiClientStore.getState()
    const folder = store.folders.find((f) => f.id === folderId)
    if (!folder) {
      return { kind: 'error', message: `Folder "${folderId}" not found.` }
    }

    const reqCount = store.requests.filter((r) => r.folderId === folderId).length

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'apiclient_delete_folder',
          description: `Delete folder: "${folder.name}"`,
          items: [{ path: folder.name, type: 'folder', details: `${reqCount} requests` }],
          warning: `This will permanently delete the folder "${folder.name}" and all its requests. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useApiClientStore.getState().removeFolder(folderId)
          return `✅ Folder "${folder.name}" deleted.`
        },
      }
    }

    await store.removeFolder(folderId)
    return { kind: 'success', message: `✅ Folder "${folder.name}" deleted.` }
  },
}

export default tool
