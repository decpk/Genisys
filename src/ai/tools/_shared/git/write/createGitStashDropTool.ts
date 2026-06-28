import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStashDrop } from '../api/invokeGitStashDrop'
import { createConfirmAction } from '../utils/createConfirmAction'
import { withRepo } from '../utils/withRepo'

interface StashDropArgs {
  stashRef?: unknown
}

export const createGitStashDropTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stash_drop',
    definition: {
      type: 'function',
      function: {
        name: 'git_stash_drop',
        description:
          'Permanently delete a stash entry. Cannot be undone. Requires confirmation.',
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
        const a = (args ?? {}) as StashDropArgs
        const stashRef = typeof a.stashRef === 'string' && a.stashRef ? a.stashRef : 'stash@{0}'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_stash_drop',
            description: `Drop ${stashRef}`,
            items: [{ path: rootPath, type: 'stash', details: stashRef }],
            warning: `Stash entry ${stashRef} will be permanently deleted. This cannot be undone.`,
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            await invokeGitStashDrop({ rootPath, stashRef })
            opts.onMutate?.(rootPath, ['stash'])
            return `Dropped ${stashRef}.`
          },
        }
      }),
  }
  return tool
}
