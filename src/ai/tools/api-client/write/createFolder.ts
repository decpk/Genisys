import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_create_folder',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_create_folder',
      description: 'Create a new folder inside an API collection, optionally nested under a parent folder.',
      parameters: {
        type: 'object',
        properties: {
          collectionId: { type: 'string', description: 'The collection ID to create the folder in' },
          name: { type: 'string', description: 'Folder name' },
          parentFolderId: { type: 'string', description: 'Optional parent folder ID for nesting' },
        },
        required: ['collectionId', 'name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const collectionId = args.collectionId as string
    const name = args.name as string
    if (!collectionId || !name) {
      return { kind: 'error', message: 'collectionId and name are required.' }
    }

    const parentFolderId = args.parentFolderId as string | undefined

    const store = useApiClientStore.getState()
    const folder = await store.addFolder(collectionId, name, parentFolderId)

    return {
      kind: 'success',
      message: `✅ Folder "${folder.name}" created (ID: ${folder.id}).`,
    }
  },
}

export default tool
