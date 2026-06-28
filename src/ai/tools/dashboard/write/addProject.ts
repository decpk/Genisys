import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'

const tool: ToolModule = {
  name: 'dashboard_add_project',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_add_project',
      description: 'Add a new project tile to the dashboard.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Project name' },
          repositoryUrl: { type: 'string', description: 'Repository URL (e.g. GitHub link)' },
        },
        required: ['name', 'repositoryUrl'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const name = args.name as string
    const repositoryUrl = args.repositoryUrl as string

    const store = useDashboardStore.getState()
    store.addProject({ name, repositoryUrl })

    return { kind: 'success', message: `✅ Project "${name}" added to the dashboard.` }
  },
}
export default tool
