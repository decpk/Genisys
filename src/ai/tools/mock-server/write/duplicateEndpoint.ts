import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_duplicate_endpoint',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_duplicate_endpoint',
      description: 'Duplicate an existing endpoint.',
      parameters: {
        type: 'object',
        properties: {
          endpointId: { type: 'string', description: 'The endpoint ID to duplicate' },
        },
        required: ['endpointId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const endpointId = args.endpointId as string
    if (!endpointId) {
      return { kind: 'error', message: 'endpointId is required.' }
    }
    await useMockServerStore.getState().duplicateEndpoint(endpointId)
    return { kind: 'success', message: `✅ Endpoint \`${endpointId}\` duplicated.` }
  },
}

export default tool
