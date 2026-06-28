import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_list_projects',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_list_projects',
      description: 'List all mock server projects. Loads projects from the database if not already loaded.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useMockServerStore.getState()
    if (!store.isLoaded) {
      await store.loadProjects()
    }
    const { projects } = useMockServerStore.getState()
    if (projects.length === 0) {
      return { kind: 'success', message: 'No mock server projects found.' }
    }
    const lines = projects.map(
      (p) => `- **${p.name}** (id: \`${p.id}\`, color: ${p.color})`
    )
    return {
      kind: 'success',
      message: `**Mock Server Projects (${projects.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
