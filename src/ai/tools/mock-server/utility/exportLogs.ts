import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_export_logs',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_export_logs',
      description:
        'Export all persisted request logs for a mock server as a JSON string. Returns a summary plus the JSON payload.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to export logs for' },
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
    const json = await useMockServerStore.getState().exportRequestLogs(serverId)
    let count = 0
    try {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed)) count = parsed.length
    } catch {
      // leave count at 0
    }
    return {
      kind: 'success',
      message: `✅ Exported **${count}** request log${count === 1 ? '' : 's'} for server \`${serverId}\`.\n\n\`\`\`json\n${json}\n\`\`\``,
    }
  },
}

export default tool
