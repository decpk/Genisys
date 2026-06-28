import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitWorktreePrune } from '../api/invokeGitWorktreePrune'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitWorktreePruneTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_worktree_prune',
    definition: {
      type: 'function',
      function: {
        name: 'git_worktree_prune',
        description:
          'Prune stale worktree metadata (`git worktree prune`). Drops administrative entries for worktrees whose directories no longer exist.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_worktree_prune',
            description: 'Prune stale worktree entries',
            items: [{ path: rootPath, type: 'repo' }],
            warning:
              'Removes admin metadata for worktrees with missing directories. Safe — does not touch existing worktrees.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitWorktreePrune(rootPath)
            opts.onMutate?.(rootPath, ['worktrees'])
            return truncateOutput(`Worktree prune complete.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
