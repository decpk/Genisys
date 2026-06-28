import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitReflog } from '../api/invokeGitReflog'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface ReflogArgs {
  refName?: unknown
  maxCount?: unknown
}

/**
 * Factory for `git_reflog`. Read-only — surfaces HEAD movement
 * history so the AI can locate a "lost" commit (e.g. after a bad
 * `reset --hard` or `rebase --abort`).
 */
export const createGitReflogTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_reflog',
    definition: {
      type: 'function',
      function: {
        name: 'git_reflog',
        description:
          'Show the reflog (HEAD movement history). Useful for recovering "lost" commits after a bad reset/rebase. Defaults to HEAD, last 50 entries.',
        parameters: {
          type: 'object',
          properties: {
            refName: {
              type: 'string',
              description: 'Ref to inspect (default: HEAD). E.g. `main` to see that branch\'s reflog.',
            },
            maxCount: {
              type: 'number',
              description: 'Max entries to return. Default 50.',
            },
          },
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as ReflogArgs
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName : undefined
        const maxCount =
          typeof a.maxCount === 'number' && Number.isFinite(a.maxCount) && a.maxCount > 0
            ? Math.floor(a.maxCount)
            : undefined
        try {
          const stdout = await invokeGitReflog({ rootPath, refName, maxCount })
          if (!stdout.trim()) {
            return { kind: 'success', message: 'Reflog is empty.' }
          }
          return { kind: 'success', message: truncateOutput(formatGitOutput(stdout)) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git reflog failed' }
        }
      }),
  }
  return tool
}
