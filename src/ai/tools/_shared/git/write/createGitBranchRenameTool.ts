import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitBranchRename } from '../api/invokeGitBranchRename'
import { createConfirmAction } from '../utils/createConfirmAction'
import { withRepo } from '../utils/withRepo'

interface BranchRenameArgs {
  from?: unknown
  to?: unknown
  force?: unknown
}

export const createGitBranchRenameTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_branch_rename',
    definition: {
      type: 'function',
      function: {
        name: 'git_branch_rename',
        description:
          'Rename a branch. When `from` is omitted, renames the currently checked-out branch. `force=true` overrides an existing branch with the same destination name.',
        parameters: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Source branch name. Defaults to current.' },
            to: { type: 'string', description: 'New branch name.' },
            force: {
              type: 'boolean',
              description: 'Overwrite if destination already exists.',
            },
          },
          required: ['to'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as BranchRenameArgs
        const from = typeof a.from === 'string' && a.from ? a.from : undefined
        const to = typeof a.to === 'string' ? a.to.trim() : ''
        const force = a.force === true
        if (!to) return { kind: 'error', message: '`to` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_branch_rename',
            description: `Rename ${from ?? '(current)'} → ${to}${force ? ' (force)' : ''}`,
            items: [{ path: to, type: 'branch', details: `from ${from ?? '(current)'}` }],
            warning: force
              ? 'Will overwrite any existing branch with this name.'
              : 'Will rename the branch; references like remote tracking branches may need to be re-pushed.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            await invokeGitBranchRename({ rootPath, from, to, force })
            opts.onMutate?.(rootPath, ['refs'])
            return `Renamed branch to '${to}'.`
          },
        }
      }),
  }
  return tool
}
