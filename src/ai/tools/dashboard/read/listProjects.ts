import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'

const tool: ToolModule = {
  name: 'dashboard_list_projects',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_list_projects',
      description: 'List all dashboard project tiles with their details (id, name, repositoryUrl, tileWidth, createdAt).',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    const store = useDashboardStore.getState()
    if (!store.isLoaded) await store.loadProjects()

    const { projects } = useDashboardStore.getState()
    if (projects.length === 0) {
      return { kind: 'success', message: 'No projects on the dashboard.' }
    }

    const list = projects
      .map((p, i) => `${i + 1}. **${p.name}** (id: ${p.id})\n   Repo: ${p.repositoryUrl}\n   Tile: ${p.tileWidth} · Created: ${p.createdAt}`)
      .join('\n')

    return { kind: 'success', message: `Dashboard projects (${projects.length}):\n${list}` }
  },
}
export default tool
