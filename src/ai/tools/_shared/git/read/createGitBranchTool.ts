import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitSnapshot } from '../api/invokeGitSnapshot'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_branch` tool. Returns the current branch (or
 * detached HEAD short SHA), upstream tracking, and ahead/behind counts.
 *
 * Internally calls `cmd_git_snapshot` instead of `cmd_get_git_branch`
 * so we can include upstream tracking + ahead/behind in a single tool
 * call — the bare branch endpoint omits those.
 */
export const createGitBranchTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_branch',
    definition: {
      type: 'function',
      function: {
        name: 'git_branch',
        description:
          'Return the current git branch (or detached short SHA), its upstream tracking branch, and ahead/behind commit counts.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const snap = await invokeGitSnapshot(rootPath)
          if (snap.detached) {
            const sha = snap.oid?.slice(0, 7) || snap.branch || 'unknown'
            return {
              kind: 'success',
              message: `**HEAD:** detached at \`${sha}\` — no branch is currently checked out.`,
            }
          }
          const upstreamLine = snap.upstream
            ? `**Upstream:** \`${snap.upstream}\` (ahead ${snap.ahead}, behind ${snap.behind})`
            : '**Upstream:** _none_'
          return {
            kind: 'success',
            message: `**Branch:** \`${snap.branch || '(unknown)'}\`\n${upstreamLine}`,
          }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git branch failed',
          }
        }
      }),
  }
  return tool
}
