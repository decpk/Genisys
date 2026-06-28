import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_select_endpoint',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_select_endpoint',
      description:
        'Select (navigate to) an endpoint in the currently selected server so the user can see and edit it.',
      parameters: {
        type: 'object',
        properties: {
          endpointId: { type: 'string', description: 'The endpoint ID to select' },
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
    useMockServerStore.getState().setSelectedEndpointId(endpointId)
    return { kind: 'success', message: `✅ Selected endpoint \`${endpointId}\`.` }
  },
}

export default tool
