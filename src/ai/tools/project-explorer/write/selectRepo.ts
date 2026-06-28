import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'explorer_select_repo',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_select_repo',
      description:
        'Select and open a repository in the ProjectExplorer. Sets the active repo for browsing.',
      parameters: {
        type: 'object',
        properties: {
          repository: { type: 'string', description: 'Repository name or URL.' },
          source: { type: 'string', enum: ['local'], description: 'Repository source type.' },
          localPath: { type: 'string', description: 'Local filesystem path.' },
        },
        required: ['repository', 'source', 'localPath'],
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
