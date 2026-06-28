import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_delete_collection',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_delete_collection',
      description: 'Delete an API collection and all its folders and requests. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          collectionId: { type: 'string', description: 'The collection ID to delete' },
        },
        required: ['collectionId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const collectionId = args.collectionId as string
    if (!collectionId) {
      return { kind: 'error', message: 'collectionId is required.' }
    }

    const store = useApiClientStore.getState()
    const collection = store.collections.find((c) => c.id === collectionId)
    if (!collection) {
      return { kind: 'error', message: `Collection "${collectionId}" not found.` }
    }

    const reqCount = store.requests.filter((r) => r.collectionId === collectionId).length
    const folderCount = store.folders.filter((f) => f.collectionId === collectionId).length

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'apiclient_delete_collection',
          description: `Delete collection: "${collection.name}"`,
          items: [{ path: collection.name, type: 'collection', details: `${reqCount} requests, ${folderCount} folders` }],
          warning: `This will permanently delete the collection "${collection.name}" and all its folders and requests. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useApiClientStore.getState().removeCollection(collectionId)
          return `✅ Collection "${collection.name}" deleted.`
        },
      }
    }

    await store.removeCollection(collectionId)
    return { kind: 'success', message: `✅ Collection "${collection.name}" deleted.` }
  },
}

export default tool
