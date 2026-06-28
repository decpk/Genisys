import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitAm } from '../api/invokeGitAm'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface AmArgs {
  patchText?: unknown
  threeWay?: unknown
}

/**
 * Factory for `git_am`. Destructive — applies a mailbox-formatted
 * patch series, creating commits on the current branch. Can conflict;
 * on conflict the AI should call `git_status` and either resolve +
 * `git_apply_patch`-resume style flow or abort manually.
 */
export const createGitAmTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_am',
    definition: {
      type: 'function',
      function: {
        name: 'git_am',
        description:
          'Apply a mailbox-formatted patch series (e.g. from git_format_patch). Creates commits on the current branch. Use `threeWay=true` for partial-context application. Conflicts are surfaced via status="conflict".',
        parameters: {
          type: 'object',
          properties: {
            patchText: { type: 'string', description: 'Mailbox patch text (one or more `From <sha> ...` blocks).' },
            threeWay: { type: 'boolean', description: 'Use --3way for partial-context application.' },
          },
          required: ['patchText'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as AmArgs
        const patchText = typeof a.patchText === 'string' ? a.patchText : ''
        if (!patchText) return { kind: 'error', message: '`patchText` is required.' }
        const threeWay = a.threeWay === true
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_am',
            description: 'Apply mailbox patch series (creates commits)',
            items: [{ path: rootPath, type: 'repo', details: 'git am' }],
            warning:
              'HEAD will move and new commits will be created on the current branch. Conflicts may halt the operation mid-series.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitAm({ rootPath, patchText, threeWay })
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index'])
            return truncateOutput(
              formatConflictAwareResult(
                'Mailbox patch applied.',
                'Conflict during `git am`. Resolve the listed paths, then run `git am --continue` or `git am --abort` from the terminal (this tool does not yet expose continue/abort).',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
