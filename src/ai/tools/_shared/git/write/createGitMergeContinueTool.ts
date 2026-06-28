import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitMergeContinue } from '../api/invokeGitMergeContinue'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitMergeContinueTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_merge_continue',
    definition: {
      type: 'function',
      function: {
        name: 'git_merge_continue',
        description:
          'Continue an in-progress merge after conflicts have been resolved (and resolutions staged). Creates the merge commit. The editor is disabled (uses git\'s default message) — provide a commit via git_commit first if you need a custom message.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_merge_continue',
            description: 'Finalize the in-progress merge.',
            items: [{ path: rootPath, type: 'repo' }],
            warning: 'Will create the merge commit using git\'s default merge message.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitMergeContinue(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(
              formatConflictAwareResult(
                'Merge continued — commit created.',
                'Conflicts remain. Stage the resolved files (git_stage_files) then re-run git_merge_continue, or call git_merge_abort.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
