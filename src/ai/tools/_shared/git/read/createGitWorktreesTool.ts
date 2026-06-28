import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitWorktrees } from '../api/invokeGitWorktrees'
import { formatWorktreeList } from '../utils/formatWorktreeList'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_worktrees` tool. Lists all linked worktrees
 * for the currently open repository (`git worktree list --porcelain`).
 */
export const createGitWorktreesTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_worktrees',
    definition: {
      type: 'function',
      function: {
        name: 'git_worktrees',
        description:
          'List all linked worktrees registered for the current repository, including their checked-out branch, HEAD SHA, and on-disk path.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const entries = await invokeGitWorktrees(rootPath)
          return { kind: 'success', message: truncateOutput(formatWorktreeList(entries)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git worktrees failed',
          }
        }
      }),
  }
  return tool
}
