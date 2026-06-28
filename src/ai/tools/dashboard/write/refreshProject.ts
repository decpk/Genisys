import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'dashboard_refresh_project',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_refresh_project',
      description: 'Refresh data for a single dashboard project (e.g. PR status). Currently a placeholder.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of the project to refresh' },
        },
        required: ['projectId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const projectId = args.projectId as string
    return {
      kind: 'success',
      message: `ℹ️ Refresh for project "${projectId}" is not yet implemented. PR refresh requires a background fetch service.`,
    }
  },
}
export default tool
