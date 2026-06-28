import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRebase } from '../api/invokeGitRebase'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface RebaseArgs {
  upstream?: unknown
  branch?: unknown
  onto?: unknown
  interactive?: unknown
}

export const createGitRebaseTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_rebase',
    definition: {
      type: 'function',
      function: {
        name: 'git_rebase',
        description:
          'Rebase the current (or specified) branch onto another ref. Use `onto` to transplant a range. Interactive rebase is NOT supported. Conflicts surface as status="conflict" — resolve then call git_rebase_continue, or git_rebase_abort.',
        parameters: {
          type: 'object',
          properties: {
            upstream: { type: 'string', description: 'Upstream ref to rebase onto (e.g. main, origin/main).' },
            branch: { type: 'string', description: 'Branch to rebase. Defaults to current branch.' },
            onto: { type: 'string', description: 'New base for a transplant rebase (`--onto`).' },
            interactive: { type: 'boolean', description: 'NOT SUPPORTED. Will return an error.' },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as RebaseArgs
        const upstream = typeof a.upstream === 'string' && a.upstream.trim() ? a.upstream : undefined
        const branch = typeof a.branch === 'string' && a.branch.trim() ? a.branch : undefined
        const onto = typeof a.onto === 'string' && a.onto.trim() ? a.onto : undefined
        const interactive = a.interactive === true
        if (interactive) {
          return { kind: 'error', message: 'Interactive rebase is not supported in this UI.' }
        }
        if (!upstream && !onto && !branch) {
          return { kind: 'error', message: 'At least one of `upstream`, `onto`, or `branch` is required.' }
        }
        const summary = [onto && `onto ${onto}`, upstream, branch && `(${branch})`]
          .filter(Boolean)
          .join(' ')
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_rebase',
            description: `Rebase ${summary}`,
            items: [{ path: rootPath, type: 'repo', details: summary }],
            warning:
              'Rebase rewrites commit history on the target branch. Conflicts may pause the rebase mid-way.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitRebase({ rootPath, upstream, branch, onto, interactive })
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge', 'refs'])
            return truncateOutput(
              formatConflictAwareResult(
                `Rebased ${summary}.`,
                'Resolve conflicts then call git_rebase_continue, git_rebase_skip, or git_rebase_abort.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
