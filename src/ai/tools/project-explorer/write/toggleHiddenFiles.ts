import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_toggle_hidden_files',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_toggle_hidden_files',
      description: 'Toggle visibility of hidden files and directories in the ProjectExplorer.',
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
