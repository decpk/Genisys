import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_duplicate_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_duplicate_request',
      description: 'Duplicate an existing API request with all its settings.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The request ID to duplicate' },
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
    const original = store.requests.find((r) => r.id === requestId)
    if (!original) {
      return { kind: 'error', message: `Request "${requestId}" not found.` }
    }

    const duplicate = await store.duplicateRequest(requestId)
    if (!duplicate) {
      return { kind: 'error', message: `Failed to duplicate request "${requestId}".` }
    }

    return {
      kind: 'success',
      message: `✅ Request "${original.name}" duplicated as "${duplicate.name}" (ID: ${duplicate.id}).`,
    }
  },
}

export default tool
