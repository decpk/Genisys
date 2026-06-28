import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStashApply } from '../api/invokeGitStashApply'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface StashApplyArgs {
  stashRef?: unknown
}

export const createGitStashApplyTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stash_apply',
    definition: {
      type: 'function',
      function: {
        name: 'git_stash_apply',
        description:
          'Apply a stash entry without removing it from the stash list. Conflicts may occur — call git_operation_state afterwards.',
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
        const a = (args ?? {}) as StashApplyArgs
        const stashRef = typeof a.stashRef === 'string' && a.stashRef ? a.stashRef : 'stash@{0}'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_stash_apply',
            description: `Apply ${stashRef}`,
            items: [{ path: rootPath, type: 'stash', details: stashRef }],
            warning:
              'Stash contents will be merged into the working tree. The stash entry remains; drop it later with git_stash_drop.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitStashApply({ rootPath, stashRef })
            opts.onMutate?.(rootPath, ['workdir', 'index', 'merge'])
            return truncateOutput(`Applied ${stashRef}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
