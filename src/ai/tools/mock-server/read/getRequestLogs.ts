import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_get_request_logs',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_get_request_logs',
      description: 'Get recent request logs for a given mock server.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to get logs for' },
          limit: { type: 'number', description: 'Max number of log entries to return (default 20)' },
        },
        required: ['serverId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const serverId = args.serverId as string
    const limit = (args.limit as number) || 20
    if (!serverId) {
      return { kind: 'error', message: 'serverId is required.' }
    }
    const { requestLogs } = useMockServerStore.getState()
    const logs = requestLogs
      .filter((l) => l.server_id === serverId)
      .slice(-limit)
    if (logs.length === 0) {
      return { kind: 'success', message: `No request logs found for server \`${serverId}\`.` }
    }
    const lines = logs.map(
      (l) =>
        `- **${l.method} ${l.path}** → ${l.status} (${l.duration_ms}ms, ${l.timestamp})`
    )
    return {
      kind: 'success',
      message: `**Request Logs for server \`${serverId}\` (${logs.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
