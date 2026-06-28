import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_browse_folder',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_browse_folder',
      description:
        'Browse a folder in the ProjectExplorer. Lists files and subdirectories at the given path within the currently selected repository.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path within the repository to browse.' },
          repoUrl: { type: 'string', description: 'Optional repository URL to scope the browse.' },
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
