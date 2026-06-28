import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_update_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_update_server',
      description: 'Update an existing mock server.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to update' },
          name: { type: 'string', description: 'The new server name' },
          port: { type: 'number', description: 'The new port number' },
          projectId: { type: 'string', description: 'The project ID the server belongs to' },
        },
        required: ['serverId', 'name', 'port', 'projectId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const serverId = args.serverId as string
    const name = args.name as string
    const port = args.port as number
    const projectId = args.projectId as string
    if (!serverId || !name || !port || !projectId) {
      return { kind: 'error', message: 'serverId, name, port, and projectId are required.' }
    }
    await useMockServerStore.getState().updateServer(serverId, name, port, projectId)
    return { kind: 'success', message: `✅ Server "${name}" updated (port ${port}).` }
  },
}

export default tool
