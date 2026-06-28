import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'
import type { TileWidth } from '@/store/dashboard-store'

const tool: ToolModule = {
  name: 'dashboard_set_tile_width',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_set_tile_width',
      description: 'Set the tile width of a dashboard project (full, half, or third).',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of the project' },
          width: { type: 'string', enum: ['full', 'half', 'third'], description: 'Tile width' },
        },
        required: ['projectId', 'width'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const projectId = args.projectId as string
    const width = args.width as TileWidth

    const store = useDashboardStore.getState()
    const project = store.projects.find((p) => p.id === projectId)
    if (!project) {
      return { kind: 'error', message: `Project "${projectId}" not found.` }
    }

    store.setTileWidth(projectId, width)
    return { kind: 'success', message: `✅ Tile width for "${project.name}" set to "${width}".` }
  },
}
export default tool
