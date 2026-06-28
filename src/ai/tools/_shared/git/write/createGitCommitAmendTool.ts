import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCommitAmend } from '../api/invokeGitCommitAmend'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface CommitAmendArgs {
  message?: unknown
  noEdit?: unknown
}

export const createGitCommitAmendTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_commit_amend',
    definition: {
      type: 'function',
      function: {
        name: 'git_commit_amend',
        description:
          'Amend the most recent commit. Pass a new `message` to rewrite the message, or `noEdit=true` to keep the existing message (useful after staging additional changes). Rewrites HEAD.',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Optional new commit message (replaces the existing one).',
            },
            noEdit: {
              type: 'boolean',
              description: 'Keep the existing commit message. Ignored when `message` is provided.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as CommitAmendArgs
        const message = typeof a.message === 'string' && a.message.trim() ? a.message : undefined
        const noEdit = a.noEdit === true
        const subject = message ? message.split('\n')[0] : '(keep existing message)'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_commit_amend',
            description: `Amend HEAD: ${subject}`,
            items: [{ path: rootPath, type: 'commit', details: subject }],
            warning:
              'HEAD will be rewritten. If this commit has already been pushed, a force-push will be required to update the remote.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitCommitAmend({ rootPath, message, noEdit })
            opts.onMutate?.(rootPath, ['head', 'index'])
            return truncateOutput(`Amended HEAD.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
