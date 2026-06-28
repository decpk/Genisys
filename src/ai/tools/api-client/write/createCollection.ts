import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_create_collection',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_create_collection',
      description: 'Create a new API collection.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the collection' },
          description: { type: 'string', description: 'Description of the collection' },
          color: { type: 'string', description: 'Color for the collection (hex or named)' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name) {
      return { kind: 'error', message: 'name is required.' }
    }

    const description = args.description as string | undefined
    const color = args.color as string | undefined

    const store = useApiClientStore.getState()
    const collection = await store.addCollection(name, color)

    if (description) {
      await store.updateCollection(collection.id, { description })
    }

    return {
      kind: 'success',
      message: `✅ Collection "${collection.name}" created (ID: ${collection.id}).`,
    }
  },
}

export default tool
