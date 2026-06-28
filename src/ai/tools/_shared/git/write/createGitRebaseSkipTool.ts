import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRebaseSkip } from '../api/invokeGitRebaseSkip'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitRebaseSkipTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_rebase_skip',
    definition: {
      type: 'function',
      function: {
        name: 'git_rebase_skip',
        description:
          'Skip the current patch in an in-progress rebase and continue with the next. Use when a commit is already represented in the new base.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_rebase_skip',
            description: 'Skip the current rebase patch.',
            items: [{ path: rootPath, type: 'repo' }],
            warning: 'The current patch will be dropped from the rebased history.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitRebaseSkip(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge', 'refs'])
            return truncateOutput(
              formatConflictAwareResult(
                'Patch skipped — rebase continued.',
                'Conflicts remain after skip. Inspect via git_status, then resolve and call git_rebase_continue.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
