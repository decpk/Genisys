import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import type { HttpMethod } from '@/components/APIClient/APIClient.types'

const tool: ToolModule = {
  name: 'apiclient_create_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_create_request',
      description: 'Create a new API request in a collection, optionally inside a folder. Supports setting URL, body, headers, params, and auth.',
      parameters: {
        type: 'object',
        properties: {
          collectionId: { type: 'string', description: 'The collection ID' },
          name: { type: 'string', description: 'Request name' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], description: 'HTTP method' },
          folderId: { type: 'string', description: 'Optional folder ID' },
          url: { type: 'string', description: 'Request URL' },
          bodyType: { type: 'string', enum: ['none', 'json', 'raw', 'form-data', 'xml'], description: 'Body type' },
          bodyContent: { type: 'string', description: 'Body content' },
          headers: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' }, enabled: { type: 'boolean' } } }, description: 'Request headers' },
          params: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' }, enabled: { type: 'boolean' } } }, description: 'Query parameters' },
          authType: { type: 'string', enum: ['none', 'bearer', 'basic', 'api-key'], description: 'Auth type' },
          authData: { type: 'object', description: 'Auth data (token, username, password, key, value, addTo)' },
        },
        required: ['collectionId', 'name', 'method'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const collectionId = args.collectionId as string
    const name = args.name as string
    const method = args.method as HttpMethod
    if (!collectionId || !name || !method) {
      return { kind: 'error', message: 'collectionId, name, and method are required.' }
    }

    const folderId = args.folderId as string | undefined
    const store = useApiClientStore.getState()
    const request = await store.addRequest(collectionId, name, method, folderId)

    const updates: Record<string, unknown> = {}
    if (args.url !== undefined) updates.url = args.url
    if (args.bodyType !== undefined) updates.bodyType = args.bodyType
    if (args.bodyContent !== undefined) updates.bodyContent = args.bodyContent
    if (args.headers !== undefined) updates.headers = args.headers
    if (args.params !== undefined) updates.params = args.params
    if (args.authType !== undefined) updates.authType = args.authType
    if (args.authData !== undefined) updates.authData = args.authData

    if (Object.keys(updates).length > 0) {
      await store.updateRequest(request.id, updates)
    }

    return {
      kind: 'success',
      message: `✅ Request "${request.name}" (${method}) created (ID: ${request.id}).`,
    }
  },
}

export default tool
