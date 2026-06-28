import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_clear_logs',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_clear_logs',
      description:
        'Clear request logs for a server — both the live in-session log and the persisted logs in the database. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID whose logs to clear' },
        },
        required: ['serverId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const serverId = args.serverId as string
    if (!serverId) {
      return { kind: 'error', message: 'serverId is required.' }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'mockserver_clear_logs',
          description: 'Clear request logs',
          items: [
            {
              path: `Server ${serverId}`,
              type: 'logs',
              details: 'Live + persisted request logs',
            },
          ],
          warning:
            'This will permanently delete the persisted request logs for this server. This cannot be undone.',
        },
        executeAfterConfirm: async () => {
          const store = useMockServerStore.getState()
          store.clearLogs()
          await store.clearRequestLogsPersisted(serverId)
          return '✅ Request logs cleared (live + persisted).'
        },
      }
    }
    const store = useMockServerStore.getState()
    store.clearLogs()
    await store.clearRequestLogsPersisted(serverId)
    return { kind: 'success', message: '✅ Request logs cleared (live + persisted).' }
  },
}

export default tool
