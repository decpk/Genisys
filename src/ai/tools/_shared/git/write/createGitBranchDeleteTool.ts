import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitBranchDelete } from '../api/invokeGitBranchDelete'
import { createConfirmAction } from '../utils/createConfirmAction'
import { withRepo } from '../utils/withRepo'

interface BranchDeleteArgs {
  name?: unknown
  force?: unknown
}

export const createGitBranchDeleteTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_branch_delete',
    definition: {
      type: 'function',
      function: {
        name: 'git_branch_delete',
        description:
          'Delete a local branch. With force=false (default), refuses to delete unmerged branches; force=true overrides (destructive).',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Branch to delete.' },
            force: {
              type: 'boolean',
              description: 'Force-delete even if unmerged. Default false.',
            },
          },
          required: ['name'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as BranchDeleteArgs
        const name = typeof a.name === 'string' ? a.name.trim() : ''
        const force = a.force === true
        if (!name) return { kind: 'error', message: '`name` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_branch_delete',
            description: `Delete branch: ${name}${force ? ' (force)' : ''}`,
            items: [{ path: name, type: 'branch', details: force ? 'force' : 'safe' }],
            warning: force
              ? `Branch '${name}' will be deleted even if it contains unmerged commits. Those commits become unreachable.`
              : `Branch '${name}' will be deleted. The operation will fail if it contains unmerged commits.`,
            severity: force ? 'danger' : 'caution',
          }),
          executeAfterConfirm: async () => {
            await invokeGitBranchDelete({ rootPath, name, force })
            opts.onMutate?.(rootPath, ['refs'])
            return `Deleted branch '${name}'.`
          },
        }
      }),
  }
  return tool
}
