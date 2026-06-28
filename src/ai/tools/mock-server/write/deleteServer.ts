import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_delete_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_delete_server',
      description: 'Delete a mock server. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to delete' },
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
    const { servers } = useMockServerStore.getState()
    const server = servers.find((s) => s.id === serverId)
    if (!server) {
      return { kind: 'error', message: `Server "${serverId}" not found.` }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'mockserver_delete_server',
          description: `Delete server: "${server.name}"`,
          items: [{ path: server.name, type: 'server', details: `Port: ${server.port}` }],
          warning: `This will permanently delete the server "${server.name}" and all its endpoints. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useMockServerStore.getState().deleteServer(serverId)
          return `✅ Server "${server.name}" deleted.`
        },
      }
    }
    await useMockServerStore.getState().deleteServer(serverId)
    return { kind: 'success', message: `✅ Server "${server.name}" deleted.` }
  },
}

export default tool
