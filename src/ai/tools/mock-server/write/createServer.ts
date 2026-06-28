import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_create_server',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_create_server',
      description: 'Create a new mock server within a project.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'The project ID to create the server in' },
          name: { type: 'string', description: 'The server name' },
          port: { type: 'number', description: 'The port number for the server' },
        },
        required: ['projectId', 'name', 'port'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const projectId = args.projectId as string
    const name = args.name as string
    const port = args.port as number
    if (!projectId || !name || !port) {
      return { kind: 'error', message: 'projectId, name, and port are required.' }
    }
    await useMockServerStore.getState().createServer(projectId, name, port)
    return { kind: 'success', message: `✅ Server "${name}" created on port ${port}.` }
  },
}

export default tool
