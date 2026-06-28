import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_get_current_context',
      description:
        'Get the current navigation context of the Project Explorer (active repo, current path, pane state).',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    return {
      kind: 'error',
      message:
        'This operation requires the UI navigation hooks and cannot be performed via AI tools. Please use the Project Explorer UI directly.',
    }
  },
}
export default tool
