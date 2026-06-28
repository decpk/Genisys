import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_navigate_forward',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_navigate_forward',
      description: 'Navigate forward in the ProjectExplorer browsing history.',
      parameters: { type: 'object', properties: {} },
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
