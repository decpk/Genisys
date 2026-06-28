import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_update_collection',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_update_collection',
      description: 'Update an existing API collection name, description, or color.',
      parameters: {
        type: 'object',
        properties: {
          collectionId: { type: 'string', description: 'The collection ID to update' },
          name: { type: 'string', description: 'New name' },
          description: { type: 'string', description: 'New description' },
          color: { type: 'string', description: 'New color' },
        },
        required: ['collectionId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const collectionId = args.collectionId as string
    if (!collectionId) {
      return { kind: 'error', message: 'collectionId is required.' }
    }

    const store = useApiClientStore.getState()
    const collection = store.collections.find((c) => c.id === collectionId)
    if (!collection) {
      return { kind: 'error', message: `Collection "${collectionId}" not found.` }
    }

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.color !== undefined) updates.color = args.color

    await store.updateCollection(collectionId, updates)
    return { kind: 'success', message: `✅ Collection "${collection.name}" updated.` }
  },
}

export default tool
