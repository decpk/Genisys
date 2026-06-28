import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_set_active_collection',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_set_active_collection',
      description: 'Select a collection by its ID, or pass null to clear the active collection.',
      parameters: {
        type: 'object',
        properties: {
          collectionId: {
            type: ['string', 'null'],
            description: 'The collection ID to select, or null to clear',
          },
        },
        required: ['collectionId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const collectionId = (args.collectionId as string | null) ?? null

    const store = useApiClientStore.getState()

    if (collectionId !== null) {
      const collection = store.collections.find((c) => c.id === collectionId)
      if (!collection) {
        return { kind: 'error', message: `Collection "${collectionId}" not found.` }
      }
      store.setActiveCollectionId(collectionId)
      return { kind: 'success', message: `✅ Selected collection "${collection.name}".` }
    }

    store.setActiveCollectionId(null)
    return { kind: 'success', message: '✅ Active collection cleared.' }
  },
}

export default tool
