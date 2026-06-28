import type { GitToolFactory, GitMutationKind } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitBranchCreate } from '../api/invokeGitBranchCreate'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface BranchCreateArgs {
  name?: unknown
  startPoint?: unknown
  checkout?: unknown
}

export const createGitBranchCreateTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_branch_create',
    definition: {
      type: 'function',
      function: {
        name: 'git_branch_create',
        description:
          'Create a new branch. Optionally check it out (HEAD moves) and / or start from a specific ref. Reversible via git_branch_delete.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'New branch name.' },
            startPoint: {
              type: 'string',
              description: 'Optional starting ref/commit (default: HEAD).',
            },
            checkout: {
              type: 'boolean',
              description: 'If true, also check the new branch out (uses `git checkout -b`).',
            },
          },
          required: ['name'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as BranchCreateArgs
        const name = typeof a.name === 'string' ? a.name.trim() : ''
        const startPoint = typeof a.startPoint === 'string' ? a.startPoint : undefined
        const checkout = a.checkout === true
        if (!name) return { kind: 'error', message: '`name` is required.' }
        const action = checkout ? 'create + checkout' : 'create'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_branch_create',
            description: `Branch ${action}: ${name}${startPoint ? ` (from ${startPoint})` : ''}`,
            items: [{ path: name, type: 'branch', details: startPoint ?? 'HEAD' }],
            warning: checkout
              ? 'A new branch will be created and checked out. HEAD will move.'
              : 'A new branch ref will be created. HEAD does not move.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitBranchCreate({ rootPath, name, startPoint, checkout })
            const kinds: GitMutationKind[] = checkout
              ? ['refs', 'head', 'workdir', 'index']
              : ['refs']
            opts.onMutate?.(rootPath, kinds)
            return truncateOutput(`Created branch '${name}'.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
