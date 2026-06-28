import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_stop_all_servers',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_stop_all_servers',
      description: 'Stop all running mock servers. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (_args, ctx): Promise<ToolResult> => {
    // Sync running state from the backend before deciding whether there is
    // anything to stop — the store's cached `runningServers` can be stale.
    await useMockServerStore.getState().refreshRunningServers()
    const { runningServers } = useMockServerStore.getState()
    if (runningServers.length === 0) {
      return { kind: 'success', message: 'No servers are currently running.' }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'mockserver_stop_all_servers',
          description: `Stop all running servers (${runningServers.length})`,
          items: runningServers.map((s) => ({
            path: s.name,
            type: 'server',
            details: `Port: ${s.port}`,
          })),
          warning: `This will stop all ${runningServers.length} running mock servers.`,
        },
        executeAfterConfirm: async () => {
          const count = await useMockServerStore.getState().stopAllServers()
          return `✅ Stopped ${count} server(s).`
        },
      }
    }
    const count = await useMockServerStore.getState().stopAllServers()
    return { kind: 'success', message: `✅ Stopped ${count} server(s).` }
  },
}

export default tool
