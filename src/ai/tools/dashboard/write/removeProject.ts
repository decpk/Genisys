import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'

const tool: ToolModule = {
  name: 'dashboard_remove_project',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_remove_project',
      description: 'Remove a project tile from the dashboard. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of the project to remove' },
        },
        required: ['projectId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const projectId = args.projectId as string
    const store = useDashboardStore.getState()
    const project = store.projects.find((p) => p.id === projectId)

    if (!project) {
      return { kind: 'error', message: `Project "${projectId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'dashboard_remove_project',
          description: `Remove project: "${project.name}"`,
          items: [{ path: project.repositoryUrl, type: 'project', details: `Name: ${project.name}` }],
          warning: 'This will permanently remove the project tile from your dashboard.',
        },
        executeAfterConfirm: async () => {
          useDashboardStore.getState().removeProject(projectId)
          return `✅ Project "${project.name}" removed from the dashboard.`
        },
      }
    }

    store.removeProject(projectId)
    return { kind: 'success', message: `✅ Project "${project.name}" removed from the dashboard.` }
  },
}
export default tool
