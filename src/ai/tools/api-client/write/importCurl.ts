import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_import_curl',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_import_curl',
      description: 'Import an API request from a cURL command string into a collection.',
      parameters: {
        type: 'object',
        properties: {
          curl: { type: 'string', description: 'The cURL command string to import' },
          collectionId: { type: 'string', description: 'The collection ID to import into' },
          folderId: { type: 'string', description: 'Optional folder ID' },
        },
        required: ['curl', 'collectionId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const curl = args.curl as string
    const collectionId = args.collectionId as string
    if (!curl || !collectionId) {
      return { kind: 'error', message: 'curl and collectionId are required.' }
    }

    const folderId = args.folderId as string | undefined
    const store = useApiClientStore.getState()
    const request = await store.importFromCurl(curl, collectionId, folderId)

    return {
      kind: 'success',
      message: `✅ Imported cURL as "${request.name}" (${request.method} ${request.url}) (ID: ${request.id}).`,
    }
  },
}

export default tool
