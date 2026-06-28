import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_start_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_start_server',
      description: 'Start a mock server by its ID.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to start' },
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
    const result = await useMockServerStore.getState().startServer(serverId)
    if (!result.success) {
      let msg = `Failed to start server: ${result.error || 'unknown error'}`
      if (result.suggested_port) {
        msg += ` Suggested port: ${result.suggested_port}`
      }
      return { kind: 'error', message: msg }
    }
    return { kind: 'success', message: `✅ Server \`${serverId}\` started.` }
  },
}

export default tool
