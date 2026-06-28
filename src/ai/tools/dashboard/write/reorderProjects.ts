import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'

const tool: ToolModule = {
  name: 'dashboard_reorder_projects',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_reorder_projects',
      description: 'Reorder dashboard project tiles by providing an ordered list of project IDs.',
      parameters: {
        type: 'object',
        properties: {
          orderedIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of project IDs in the desired order',
          },
        },
        required: ['orderedIds'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const orderedIds = args.orderedIds as string[]

    const store = useDashboardStore.getState()
    store.reorderProjects(orderedIds)

    return { kind: 'success', message: `✅ Projects reordered (${orderedIds.length} items).` }
  },
}
export default tool
