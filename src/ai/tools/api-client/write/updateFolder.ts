import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_update_folder',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_update_folder',
      description: 'Update the name of an existing API folder.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The folder ID to update' },
          name: { type: 'string', description: 'New folder name' },
        },
        required: ['folderId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const folderId = args.folderId as string
    if (!folderId) {
      return { kind: 'error', message: 'folderId is required.' }
    }

    const store = useApiClientStore.getState()
    const folder = store.folders.find((f) => f.id === folderId)
    if (!folder) {
      return { kind: 'error', message: `Folder "${folderId}" not found.` }
    }

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name

    await store.updateFolder(folderId, updates)
    return { kind: 'success', message: `✅ Folder "${folder.name}" updated.` }
  },
}

export default tool
