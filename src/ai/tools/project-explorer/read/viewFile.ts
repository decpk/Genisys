import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_view_file',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_view_file',
      description:
        'View a file in the ProjectExplorer. Opens a file at the given path for reading within the selected repository.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative file path within the repository.' },
          repoUrl: { type: 'string', description: 'Optional repository URL to scope the file view.' },
        },
        required: ['path'],
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
