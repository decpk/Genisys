import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'dashboard_refresh_all',
  definition: {
    type: 'function',
    function: {
      name: 'dashboard_refresh_all',
      description: 'Refresh data for all dashboard projects. Currently a placeholder.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    return {
      kind: 'success',
      message: 'ℹ️ Refresh all is not yet implemented. PR refresh requires a background fetch service.',
    }
  },
}
export default tool
