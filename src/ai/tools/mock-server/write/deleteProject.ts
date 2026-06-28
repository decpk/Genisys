import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_delete_project',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_delete_project',
      description: 'Delete a mock server project. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'The project ID to delete' },
        },
        required: ['projectId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const projectId = args.projectId as string
    if (!projectId) {
      return { kind: 'error', message: 'projectId is required.' }
    }
    const { projects } = useMockServerStore.getState()
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      return { kind: 'error', message: `Project "${projectId}" not found.` }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'mockserver_delete_project',
          description: `Delete project: "${project.name}"`,
          items: [{ path: project.name, type: 'project', details: `Color: ${project.color}` }],
          warning: `This will permanently delete the project "${project.name}" and all its servers and endpoints. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useMockServerStore.getState().deleteProject(projectId)
          return `✅ Project "${project.name}" deleted.`
        },
      }
    }
    await useMockServerStore.getState().deleteProject(projectId)
    return { kind: 'success', message: `✅ Project "${project.name}" deleted.` }
  },
}

export default tool
