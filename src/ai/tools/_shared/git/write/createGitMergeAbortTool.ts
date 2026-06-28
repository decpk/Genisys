import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitMergeAbort } from '../api/invokeGitMergeAbort'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitMergeAbortTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_merge_abort',
    definition: {
      type: 'function',
      function: {
        name: 'git_merge_abort',
        description:
          'Abort an in-progress merge, restoring HEAD and the working tree to their pre-merge state. Use when conflicts cannot be resolved.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_merge_abort',
            description: 'Abort the in-progress merge.',
            items: [{ path: rootPath, type: 'repo' }],
            warning:
              'Any conflict resolution work in the index/worktree will be discarded.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitMergeAbort(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(
              formatConflictAwareResult(
                'Merge aborted.',
                'Merge abort still reported a conflict — repo may be in an unexpected state.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
