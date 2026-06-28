import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_set_active_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_set_active_request',
      description: 'Open / select a request in the main panel by its ID, or pass null to clear the active request.',
      parameters: {
        type: 'object',
        properties: {
          requestId: {
            type: ['string', 'null'],
            description: 'The request ID to open, or null to clear',
          },
        },
        required: ['requestId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const requestId = (args.requestId as string | null) ?? null

    const store = useApiClientStore.getState()

    if (requestId !== null) {
      const request = store.requests.find((r) => r.id === requestId)
      if (!request) {
        return { kind: 'error', message: `Request "${requestId}" not found.` }
      }
      store.setActiveRequestId(requestId)
      return { kind: 'success', message: `✅ Opened "${request.method} ${request.name}".` }
    }

    store.setActiveRequestId(null)
    return { kind: 'success', message: '✅ Active request cleared.' }
  },
}

export default tool
