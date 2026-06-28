import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useExplorerHistoryStore } from '@/store/explorer-history-store'

const tool: ToolModule = {
  name: 'explorer_add_repo_to_history',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_add_repo_to_history',
      description:
        'Add a repository to the explorer history. Saves the repo entry so it appears in the recent repos list.',
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
  execute: async (args, _ctx): Promise<ToolResult> => {
    const { repository, source, localPath } = args as {
      repository: string
      source: 'local'
      localPath: string
    }

    const entry = {
      repository,
      source,
      organization: '',
      project: '',
      localPath,
      lastOpenedAt: new Date().toISOString(),
    }

    await useExplorerHistoryStore.getState().addRepo(entry as any)

    return {
      kind: 'success',
      message: `✅ Added "${repository}" (${source}) to explorer history.`,
    }
  },
}
export default tool
