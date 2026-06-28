import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_close_pane',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_close_pane',
      description: 'Close a specific pane in the ProjectExplorer.',
      parameters: {
        type: 'object',
        properties: {
          paneId: { type: 'string', description: 'ID of the pane to close.' },
        },
        required: ['paneId'],
      },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    return {
      kind: 'error',
      message:
        'This operation requires the UI navigation hooks and cannot be performed via AI tools. Please use the Project Explorer UI directly.',
    }
  },
}
export default tool
