import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitListBranches } from '../api/invokeGitListBranches'
import { formatBranchList } from '../utils/formatBranchList'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_list_branches` tool. Returns local + remote
 * branches with upstream tracking and a "current" marker.
 */
export const createGitListBranchesTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_list_branches',
    definition: {
      type: 'function',
      function: {
        name: 'git_list_branches',
        description:
          'List all local and remote branches in the repository, including upstream tracking and the currently checked-out branch.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const data = await invokeGitListBranches(rootPath)
          return { kind: 'success', message: truncateOutput(formatBranchList(data)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git list branches failed',
          }
        }
      }),
  }
  return tool
}
