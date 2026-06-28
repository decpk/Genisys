import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRebaseContinue } from '../api/invokeGitRebaseContinue'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitRebaseContinueTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_rebase_continue',
    definition: {
      type: 'function',
      function: {
        name: 'git_rebase_continue',
        description:
          'Resume an in-progress rebase after staging the conflict resolutions. The editor is disabled — git uses the existing commit messages.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_rebase_continue',
            description: 'Continue the in-progress rebase.',
            items: [{ path: rootPath, type: 'repo' }],
            warning: 'Will apply the next commit using existing commit messages.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitRebaseContinue(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge', 'refs'])
            return truncateOutput(
              formatConflictAwareResult(
                'Rebase continued.',
                'Conflicts remain. Stage resolved files then re-run git_rebase_continue, or use git_rebase_skip / git_rebase_abort.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
