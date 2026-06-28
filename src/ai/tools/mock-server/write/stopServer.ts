import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_stop_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_stop_server',
      description: 'Stop a running mock server by its ID.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to stop' },
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
    await useMockServerStore.getState().stopServer(serverId)
    return { kind: 'success', message: `✅ Server \`${serverId}\` stopped.` }
  },
}

export default tool
