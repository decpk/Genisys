import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_update_project',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_update_project',
      description: 'Update an existing mock server project.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'The project ID to update' },
          name: { type: 'string', description: 'The new project name' },
          color: { type: 'string', description: 'The new project color' },
        },
        required: ['projectId', 'name', 'color'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const projectId = args.projectId as string
    const name = args.name as string
    const color = args.color as string
    if (!projectId || !name || !color) {
      return { kind: 'error', message: 'projectId, name, and color are required.' }
    }
    await useMockServerStore.getState().updateProject(projectId, name, color)
    return { kind: 'success', message: `✅ Project "${name}" updated.` }
  },
}

export default tool
