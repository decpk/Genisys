import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_update_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_update_request',
      description: 'Update an existing API request. Can change name, method, URL, body, headers, params, and auth.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The request ID to update' },
          name: { type: 'string', description: 'New name' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], description: 'New HTTP method' },
          url: { type: 'string', description: 'New URL' },
          bodyType: { type: 'string', enum: ['none', 'json', 'raw', 'form-data', 'xml'], description: 'New body type' },
          bodyContent: { type: 'string', description: 'New body content' },
          headers: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' }, enabled: { type: 'boolean' } } }, description: 'New headers' },
          params: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' }, enabled: { type: 'boolean' } } }, description: 'New query parameters' },
          authType: { type: 'string', enum: ['none', 'bearer', 'basic', 'api-key'], description: 'New auth type' },
          authData: { type: 'object', description: 'New auth data' },
        },
        required: ['requestId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const requestId = args.requestId as string
    if (!requestId) {
      return { kind: 'error', message: 'requestId is required.' }
    }

    const store = useApiClientStore.getState()
    const request = store.requests.find((r) => r.id === requestId)
    if (!request) {
      return { kind: 'error', message: `Request "${requestId}" not found.` }
    }

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.method !== undefined) updates.method = args.method
    if (args.url !== undefined) updates.url = args.url
    if (args.bodyType !== undefined) updates.bodyType = args.bodyType
    if (args.bodyContent !== undefined) updates.bodyContent = args.bodyContent
    if (args.headers !== undefined) updates.headers = args.headers
    if (args.params !== undefined) updates.params = args.params
    if (args.authType !== undefined) updates.authType = args.authType
    if (args.authData !== undefined) updates.authData = args.authData

    await store.updateRequest(requestId, updates)
    return { kind: 'success', message: `✅ Request "${request.name}" updated.` }
  },
}

export default tool
