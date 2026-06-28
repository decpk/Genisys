import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRebaseAbort } from '../api/invokeGitRebaseAbort'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitRebaseAbortTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_rebase_abort',
    definition: {
      type: 'function',
      function: {
        name: 'git_rebase_abort',
        description:
          'Abort an in-progress rebase and restore the branch to its pre-rebase state. Any conflict resolution work is discarded.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_rebase_abort',
            description: 'Abort the in-progress rebase.',
            items: [{ path: rootPath, type: 'repo' }],
            warning: 'Conflict resolutions and any in-flight rebase changes will be lost.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitRebaseAbort(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge', 'refs'])
            return truncateOutput(
              formatConflictAwareResult(
                'Rebase aborted.',
                'Rebase abort still reported a conflict — repo may be in an unexpected state.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
