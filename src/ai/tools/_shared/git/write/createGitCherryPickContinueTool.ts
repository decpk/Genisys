import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCherryPickContinue } from '../api/invokeGitCherryPickContinue'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitCherryPickContinueTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_cherry_pick_continue',
    definition: {
      type: 'function',
      function: {
        name: 'git_cherry_pick_continue',
        description:
          'Resume an in-progress cherry-pick after staging conflict resolutions. The editor is disabled — git reuses the original commit messages.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_cherry_pick_continue',
            description: 'Continue the in-progress cherry-pick.',
            items: [{ path: rootPath, type: 'repo' }],
            warning: 'Will apply the next commit using its original message.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitCherryPickContinue(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(
              formatConflictAwareResult(
                'Cherry-pick continued.',
                'Conflicts remain. Stage resolved files then re-run git_cherry_pick_continue, or git_cherry_pick_abort.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
