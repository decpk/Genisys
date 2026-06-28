import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitMerge } from '../api/invokeGitMerge'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface MergeArgs {
  refName?: unknown
  noFf?: unknown
  squash?: unknown
  message?: unknown
}

/**
 * Factory for `git_merge`. Multi-step flow: the merge can complete
 * cleanly OR drop the repo into the "merge in progress" state with
 * conflicts. The conflict path returns `status: 'conflict'` and the
 * AI is expected to call `git_status` / `git_operation_state` next,
 * then continue with `git_merge_continue` or bail with
 * `git_merge_abort`.
 */
export const createGitMergeTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_merge',
    definition: {
      type: 'function',
      function: {
        name: 'git_merge',
        description:
          'Merge a ref into the current branch. Use `noFf=true` to force a merge commit; `squash=true` to stage as a squashed change without committing. Conflicts are surfaced via status="conflict" — resolve then call git_merge_continue or git_merge_abort.',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Branch, tag, or commit to merge in.' },
            noFf: { type: 'boolean', description: 'Force a merge commit (no fast-forward).' },
            squash: { type: 'boolean', description: 'Squash merge — stages changes without committing.' },
            message: { type: 'string', description: 'Custom merge-commit message. Defaults to git\'s auto-generated one.' },
          },
          required: ['refName'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as MergeArgs
        const refName = typeof a.refName === 'string' ? a.refName.trim() : ''
        const noFf = a.noFf === true
        const squash = a.squash === true
        const message = typeof a.message === 'string' && a.message.trim() ? a.message : undefined
        if (!refName) return { kind: 'error', message: '`refName` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_merge',
            description: `Merge ${refName}${noFf ? ' (no-ff)' : ''}${squash ? ' (squash)' : ''}`,
            items: [{ path: rootPath, type: 'ref', details: refName }],
            warning:
              'Merging rewrites HEAD and the working tree. Conflicts will require manual resolution before continuing.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitMerge({ rootPath, refName, noFf, squash, message })
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(
              formatConflictAwareResult(
                `Merged ${refName}.`,
                'Resolve conflicts then call git_merge_continue, or git_merge_abort to bail.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
