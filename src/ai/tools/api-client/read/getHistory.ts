import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_get_history',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_get_history',
      description: 'Get recent API request history entries with method, URL, status, duration, and size.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of history entries to return (default 20)' },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const limit = (args.limit as number) || 20

    const store = useApiClientStore.getState()
    await store.loadHistory()

    const { history } = useApiClientStore.getState()
    if (history.length === 0) {
      return { kind: 'success', message: 'No history entries.' }
    }

    const entries = history.slice(0, limit)

    const lines = entries.map((h) => {
      return `| ${h.method} | ${h.url || '—'} | ${h.statusCode} | ${h.durationMs}ms | ${h.executedAt} | ${h.id} |`
    })

    const message = [
      `**History** (showing ${entries.length} of ${history.length})`,
      '',
      '| Method | URL | Status | Duration | Executed At | ID |',
      '|--------|-----|--------|----------|-------------|----|',
      ...lines,
    ].join('\n')

    return { kind: 'success', message }
  },
}

export default tool
