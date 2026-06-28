import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_list_endpoints',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_list_endpoints',
      description: 'List all endpoints for a given mock server.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to list endpoints for' },
        },
        required: ['serverId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const serverId = args.serverId as string
    if (!serverId) {
      return { kind: 'error', message: 'serverId is required.' }
    }
    const store = useMockServerStore.getState()
    await store.loadEndpoints(serverId)
    const endpoints = useMockServerStore.getState().endpoints[serverId] || []
    if (endpoints.length === 0) {
      return { kind: 'success', message: `No endpoints found for server \`${serverId}\`.` }
    }
    const lines = endpoints.map(
      (e) =>
        `- **${e.method} ${e.path}** → ${e.status_code} (id: \`${e.id}\`, type: ${e.response_type}, active: ${e.is_active})`
    )
    return {
      kind: 'success',
      message: `**Endpoints for server \`${serverId}\` (${endpoints.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
