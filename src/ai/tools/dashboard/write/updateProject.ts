import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'

const tool: ToolModule = {
  name: 'dashboard_update_project',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_update_project',
      description: 'Update the name or repository URL of an existing dashboard project.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of the project to update' },
          name: { type: 'string', description: 'New project name' },
          repositoryUrl: { type: 'string', description: 'New repository URL' },
        },
        required: ['projectId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const projectId = args.projectId as string
    const name = args.name as string | undefined
    const repositoryUrl = args.repositoryUrl as string | undefined

    const store = useDashboardStore.getState()
    const project = store.projects.find((p) => p.id === projectId)
    if (!project) {
      return { kind: 'error', message: `Project "${projectId}" not found.` }
    }

    const updates: Record<string, string> = {}
    if (name) updates.name = name
    if (repositoryUrl) updates.repositoryUrl = repositoryUrl

    if (Object.keys(updates).length === 0) {
      return { kind: 'error', message: 'No updates provided. Specify at least name or repositoryUrl.' }
    }

    store.updateProject(projectId, updates)
    return { kind: 'success', message: `✅ Project "${project.name}" updated.` }
  },
}
export default tool
