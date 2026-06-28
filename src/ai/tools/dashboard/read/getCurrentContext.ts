import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useDashboardStore } from '@/store/dashboard-store'
import { useSnippetsStore } from '@/store/snippets-store'

const tool: ToolModule = {
  name: 'dashboard_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_get_current_context',
      description: 'Get a high-level summary of the dashboard: project count, snippet count, and loaded state.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    const dash = useDashboardStore.getState()
    const snip = useSnippetsStore.getState()

    return {
      kind: 'success',
      message: [
        `Dashboard context:`,
        `• Projects: ${dash.projects.length} (loaded: ${dash.isLoaded})`,
        `• Snippets: ${snip.snippets.length} (loaded: ${snip.isLoaded})`,
      ].join('\n'),
    }
  },
}
export default tool
