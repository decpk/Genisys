import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_load_request_logs',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_load_request_logs',
      description:
        'Load persisted request logs for a mock server from the database, with optional filters. Use this to inspect historical traffic (the live log only holds the current session).',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to load logs for' },
          method: { type: 'string', description: 'Optional HTTP method filter (e.g. GET)' },
          status: { type: 'number', description: 'Optional HTTP status code filter' },
          pathContains: { type: 'string', description: 'Optional substring to match in the path' },
          limit: { type: 'number', description: 'Max number of log entries to load (default 50)' },
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
    const limit = (args.limit as number) || 50
    await useMockServerStore.getState().loadRequestLogs({
      serverId,
      method: args.method as string | undefined,
      status: args.status as number | undefined,
      pathContains: args.pathContains as string | undefined,
      limit,
    })
    const logs = useMockServerStore
      .getState()
      .requestLogs.filter((l) => l.server_id === serverId)
      .slice(-limit)
    if (logs.length === 0) {
      return {
        kind: 'success',
        message: `No persisted request logs found for server \`${serverId}\`.`,
      }
    }
    const lines = logs.map(
      (l) =>
        `- **${l.method} ${l.path}** → ${l.status} (${l.duration_ms}ms, ${l.timestamp})`,
    )
    return {
      kind: 'success',
      message: `**Persisted request logs for server \`${serverId}\` (${logs.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
