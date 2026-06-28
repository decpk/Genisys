import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCheckoutBranch } from '../api/invokeGitCheckoutBranch'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_checkout_branch` tool. Switches to (or creates)
 * a branch. Stateful — moves HEAD and may modify the working tree —
 * so always requires confirmation.
 */
export const createGitCheckoutBranchTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_checkout_branch',
    definition: {
      type: 'function',
      function: {
        name: 'git_checkout_branch',
        description:
          'Switch to an existing branch (`git checkout <branch>`) or create + switch when `create: true` (`git checkout -b <branch>`). Requires confirmation.',
        parameters: {
          type: 'object',
          properties: {
            branch: { type: 'string', description: 'Branch name to switch to (or create).' },
            create: {
              type: 'boolean',
              description: 'Create a new branch off the current HEAD. Default false.',
            },
          },
          required: ['branch'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const branch = typeof args.branch === 'string' ? args.branch.trim() : ''
        if (!branch) return { kind: 'error', message: '`branch` is required.' }
        const create = args.create === true
        const desc = create ? `Create + checkout: ${branch}` : `Checkout: ${branch}`
        return {
          kind: 'confirm-required',
          confirmAction: {
            action: 'git_checkout_branch',
            description: desc,
            items: [
              {
                path: branch,
                type: 'branch',
                details: create ? 'git checkout -b <branch>' : 'git checkout <branch>',
              },
            ],
            warning:
              'HEAD will move to the target branch and the working tree will update. Uncommitted changes that conflict with the target may block the operation.',
          },
          executeAfterConfirm: async () => {
            const out = await invokeGitCheckoutBranch({ rootPath, branch, create })
            opts.onMutate?.(rootPath, ['head', 'workdir'])
            const stdout = out.stdout.trim()
            return truncateOutput(
              `✅ Switched to \`${out.branch}\`.${stdout ? `\n\n\`\`\`\n${stdout}\n\`\`\`` : ''}`,
            )
          },
        }
      }),
  }
  return tool
}
