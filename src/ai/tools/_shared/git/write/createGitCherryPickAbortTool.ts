import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCherryPickAbort } from '../api/invokeGitCherryPickAbort'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitCherryPickAbortTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_cherry_pick_abort',
    definition: {
      type: 'function',
      function: {
        name: 'git_cherry_pick_abort',
        description:
          'Abort an in-progress cherry-pick and restore the working tree to its pre-cherry-pick state. Any conflict resolution work is discarded.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_cherry_pick_abort',
            description: 'Abort the in-progress cherry-pick.',
            items: [{ path: rootPath, type: 'repo' }],
            warning: 'Conflict resolutions and any in-flight cherry-pick changes will be lost.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitCherryPickAbort(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(
              formatConflictAwareResult(
                'Cherry-pick aborted.',
                'Cherry-pick abort still reported a conflict — inspect via git_status.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
