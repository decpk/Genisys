import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCommit } from '../api/invokeGitCommit'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_commit` tool. Stateful (advances HEAD) — always
 * requires confirmation. The message is shown verbatim in the
 * confirmation card so the user can sanity-check it before committing.
 */
export const createGitCommitTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_commit',
    definition: {
      type: 'function',
      function: {
        name: 'git_commit',
        description:
          'Create a commit from the currently staged changes. The message can be multi-line (subject + blank line + body). Requires confirmation.',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Full commit message. First line is the subject; blank line then body.',
            },
          },
          required: ['message'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const message = typeof args.message === 'string' ? args.message.trim() : ''
        if (!message) return { kind: 'error', message: '`message` is required.' }
        const subject = message.split('\n')[0]
        return {
          kind: 'confirm-required',
          confirmAction: {
            action: 'git_commit',
            description: `Commit: ${subject}`,
            items: [{ path: rootPath, type: 'commit', details: subject }],
            warning:
              'A new commit will be created from the currently staged changes. The full message is shown above.',
          },
          executeAfterConfirm: async () => {
            const result = await invokeGitCommit({ rootPath, message })
            opts.onMutate?.(rootPath, ['head', 'index'])
            const stdout = result.stdout.trim()
            return truncateOutput(
              `✅ Committed: ${subject}${stdout ? `\n\n\`\`\`\n${stdout}\n\`\`\`` : ''}`,
            )
          },
        }
      }),
  }
  return tool
}
