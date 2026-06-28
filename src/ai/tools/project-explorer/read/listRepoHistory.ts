import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { useExplorerHistoryStore } from '@/store/explorer-history-store'

const tool: ToolModule = {
  name: 'explorer_list_repo_history',
  definition: {
    type: 'function',
    function: {
      name: 'explorer_list_repo_history',
      description:
        'List all repositories in the explorer history. Returns the saved repo entries with their path and last opened time.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    const store = useExplorerHistoryStore.getState()

    if (!store.isLoaded) {
      await store.loadHistory()
    }

    const { repos, hasMore } = useExplorerHistoryStore.getState()

    if (repos.length === 0) {
      return { kind: 'success', message: 'No repositories in history.' }
    }

    const lines = repos.map(
      (r, i) =>
        `${i + 1}. ${r.repository} (${r.source})${r.localPath ? ` — ${r.localPath}` : ''}`,
    )

    if (hasMore) {
      lines.push(`\n(More repositories available — ${repos.length} shown so far)`)
    }

    return { kind: 'success', message: lines.join('\n') }
  },
}
export default tool
