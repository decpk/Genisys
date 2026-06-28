import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_select_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_select_server',
      description:
        'Select (navigate to) a mock server in the UI, making it the active server and loading its endpoints.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to select' },
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
    const server = store.servers.find((s) => s.id === serverId)
    if (!server) {
      return { kind: 'error', message: `Server "${serverId}" not found.` }
    }
    store.setSelectedServerId(serverId)
    await useMockServerStore.getState().loadEndpoints(serverId)
    return { kind: 'success', message: `✅ Selected server "${server.name}".` }
  },
}

export default tool
