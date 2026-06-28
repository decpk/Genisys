import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_duplicate_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_duplicate_server',
      description:
        'Duplicate an existing mock server along with all of its endpoints. The copy is created in the same project and becomes the selected server.',
      parameters: {
        type: 'object',
        properties: {
          serverId: { type: 'string', description: 'The server ID to duplicate' },
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
    const { servers } = useMockServerStore.getState()
    const server = servers.find((s) => s.id === serverId)
    if (!server) {
      return { kind: 'error', message: `Server "${serverId}" not found.` }
    }
    await useMockServerStore.getState().duplicateServer(serverId)
    return {
      kind: 'success',
      message: `✅ Server "${server.name}" duplicated (with its endpoints).`,
    }
  },
}

export default tool
