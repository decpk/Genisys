import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_clear_history',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_clear_history',
      description: 'Clear all API request history entries. Requires confirmation.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (_args, ctx): Promise<ToolResult> => {
    const store = useApiClientStore.getState()
    const historyCount = store.history.length

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'apiclient_clear_history',
          description: 'Clear all API request history',
          items: [{ path: 'History', type: 'history', details: `${historyCount} entries` }],
          warning: `This will permanently delete all ${historyCount} history entries. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useApiClientStore.getState().clearHistory()
          return '✅ History cleared.'
        },
      }
    }

    await store.clearHistory()
    return { kind: 'success', message: '✅ History cleared.' }
  },
}

export default tool
