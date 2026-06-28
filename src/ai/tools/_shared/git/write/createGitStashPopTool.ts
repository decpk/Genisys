import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStashPop } from '../api/invokeGitStashPop'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface StashPopArgs {
  stashRef?: unknown
}

export const createGitStashPopTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stash_pop',
    definition: {
      type: 'function',
      function: {
        name: 'git_stash_pop',
        description:
          'Apply the most recent stash (or `stashRef` if specified) and drop it from the stash list. Conflicts may occur — call git_operation_state afterwards.',
        parameters: {
          type: 'object',
          properties: {
            stashRef: {
              type: 'string',
              description: 'Stash reference like "stash@{0}". Defaults to the most recent stash.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as StashPopArgs
        const stashRef = typeof a.stashRef === 'string' && a.stashRef ? a.stashRef : 'stash@{0}'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_stash_pop',
            description: `Pop ${stashRef}`,
            items: [{ path: rootPath, type: 'stash', details: stashRef }],
            warning:
              'Stash will be applied to the working tree and then removed from the stash list. If a conflict occurs, the stash is preserved.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitStashPop({ rootPath, stashRef })
            opts.onMutate?.(rootPath, ['stash', 'workdir', 'index', 'merge'])
            return truncateOutput(`Popped ${stashRef}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
