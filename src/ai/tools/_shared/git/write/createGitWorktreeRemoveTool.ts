import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitWorktreeRemove } from '../api/invokeGitWorktreeRemove'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface WorktreeRemoveArgs {
  path?: unknown
  force?: unknown
}

export const createGitWorktreeRemoveTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_worktree_remove',
    definition: {
      type: 'function',
      function: {
        name: 'git_worktree_remove',
        description:
          'Remove a linked working tree (`git worktree remove [-f] <path>`). `force=true` removes even with dirty changes.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Worktree path to remove.' },
            force: { type: 'boolean', description: 'Force removal even if dirty.' },
          },
          required: ['path'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as WorktreeRemoveArgs
        const path = typeof a.path === 'string' ? a.path.trim() : ''
        const force = a.force === true
        if (!path) return { kind: 'error', message: '`path` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_worktree_remove',
            description: `Remove worktree at ${path}${force ? ' (force)' : ''}`,
            items: [{ path, type: 'worktree' }],
            warning: force
              ? 'Force-removes the worktree even if it has uncommitted changes — those changes are LOST.'
              : 'Removes the linked worktree. Will refuse if the worktree is dirty (use force=true to override).',
            severity: force ? 'danger' : 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitWorktreeRemove({ rootPath, path, force })
            opts.onMutate?.(rootPath, ['worktrees'])
            return truncateOutput(`Removed worktree at ${path}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
