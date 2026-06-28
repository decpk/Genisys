import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitWorktreeAdd } from '../api/invokeGitWorktreeAdd'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface WorktreeAddArgs {
  path?: unknown
  branch?: unknown
  newBranch?: unknown
}

export const createGitWorktreeAddTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_worktree_add',
    definition: {
      type: 'function',
      function: {
        name: 'git_worktree_add',
        description:
          'Add a linked working tree (`git worktree add [-b <newBranch>] <path> [<branch>]`). Useful for working on multiple branches concurrently.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Filesystem path for the new worktree.' },
            branch: { type: 'string', description: 'Existing branch to check out (default HEAD).' },
            newBranch: { type: 'string', description: 'Create a new branch and check it out.' },
          },
          required: ['path'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as WorktreeAddArgs
        const path = typeof a.path === 'string' ? a.path.trim() : ''
        const branch = typeof a.branch === 'string' && a.branch.trim() ? a.branch : undefined
        const newBranch = typeof a.newBranch === 'string' && a.newBranch.trim() ? a.newBranch : undefined
        if (!path) return { kind: 'error', message: '`path` is required.' }
        const tail = newBranch
          ? ` (new branch '${newBranch}'${branch ? ` from ${branch}` : ''})`
          : branch
            ? ` (checking out ${branch})`
            : ''
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_worktree_add',
            description: `Add worktree at ${path}${tail}`,
            items: [{ path, type: 'worktree', details: newBranch ?? branch ?? 'HEAD' }],
            warning:
              'Creates a new working tree on disk. Reversible via git_worktree_remove.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitWorktreeAdd({ rootPath, path, branch, newBranch })
            opts.onMutate?.(rootPath, ['worktrees'])
            return truncateOutput(`Added worktree at ${path}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
