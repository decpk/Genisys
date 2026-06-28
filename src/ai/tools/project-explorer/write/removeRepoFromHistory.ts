import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useExplorerHistoryStore } from '@/store/explorer-history-store'

const tool: ToolModule = {
  name: 'explorer_remove_repo_from_history',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_remove_repo_from_history',
      description:
        'Remove a repository from the explorer history. This is a destructive action that requires confirmation.',
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
  execute: async (args, ctx): Promise<ToolResult> => {
    const { repository, source, localPath } = args as {
      repository: string
      source: 'local'
      localPath: string
    }

    const store = useExplorerHistoryStore.getState()
    const match = store.repos.find(
      (r) =>
        r.repository === repository &&
        r.source === source &&
        r.localPath === localPath,
    )

    if (!match) {
      return { kind: 'error', message: `Repository "${repository}" not found in history.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'explorer_remove_repo_from_history',
          description: `Remove "${repository}" from explorer history`,
          items: [
            {
              path: localPath,
              type: 'repo',
              details: `Source: ${source}`,
            },
          ],
          warning: 'This will remove the repository from your history. It can be re-added later.',
        },
        executeAfterConfirm: async () => {
          await useExplorerHistoryStore.getState().removeRepo(match)
          return `✅ Removed "${repository}" from explorer history.`
        },
      }
    }

    await store.removeRepo(match)
    return { kind: 'success', message: `✅ Removed "${repository}" from explorer history.` }
  },
}
export default tool
