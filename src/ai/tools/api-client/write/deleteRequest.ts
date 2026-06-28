import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_delete_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_delete_request',
      description: 'Delete an API request. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The request ID to delete' },
        },
        required: ['requestId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const requestId = args.requestId as string
    if (!requestId) {
      return { kind: 'error', message: 'requestId is required.' }
    }

    const store = useApiClientStore.getState()
    const request = store.requests.find((r) => r.id === requestId)
    if (!request) {
      return { kind: 'error', message: `Request "${requestId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'apiclient_delete_request',
          description: `Delete request: "${request.method} ${request.name}"`,
          items: [{ path: request.name, type: 'request', details: `${request.method} ${request.url || '(no URL)'}` }],
          warning: `This will permanently delete the request "${request.name}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useApiClientStore.getState().removeRequest(requestId)
          return `✅ Request "${request.name}" deleted.`
        },
      }
    }

    await store.removeRequest(requestId)
    return { kind: 'success', message: `✅ Request "${request.name}" deleted.` }
  },
}

export default tool
