import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_create_project',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_create_project',
      description: 'Create a new mock server project.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The project name' },
          color: { type: 'string', description: 'The project color (hex or named color)' },
        },
        required: ['name', 'color'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    const color = args.color as string
    if (!name || !color) {
      return { kind: 'error', message: 'name and color are required.' }
    }
    await useMockServerStore.getState().createProject(name, color)
    return { kind: 'success', message: `✅ Project "${name}" created.` }
  },
}

export default tool
