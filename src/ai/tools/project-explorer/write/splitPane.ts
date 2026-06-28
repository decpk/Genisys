import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_split_pane',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_split_pane',
      description: 'Split the ProjectExplorer into an additional pane in the given direction.',
      parameters: {
        type: 'object',
        properties: {
          direction: {
            type: 'string',
            enum: ['horizontal', 'vertical'],
            description: 'Split direction.',
          },
        },
        required: ['direction'],
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
