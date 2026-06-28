import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitPush } from '../api/invokeGitPush'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_push` tool. Publishes commits (and optionally
 * sets the upstream). Always requires confirmation since it affects
 * the remote.
 */
export const createGitPushTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_push',
    definition: {
      type: 'function',
      function: {
        name: 'git_push',
        description:
          'Push the current branch to its remote. Pass `setUpstream: true` to publish a new branch (`git push --set-upstream origin <branch>`). Requires confirmation.',
        parameters: {
          type: 'object',
          properties: {
            setUpstream: {
              type: 'boolean',
              description:
                'Publish the current branch and track origin/<branch>. Default false.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const setUpstream = args.setUpstream === true
        const desc = setUpstream
          ? 'Push and set upstream (origin/<current-branch>)'
          : 'Push current branch to its upstream'
        return {
          kind: 'confirm-required',
          confirmAction: {
            action: 'git_push',
            description: desc,
            items: [{ path: rootPath, type: 'repo', details: setUpstream ? 'git push --set-upstream origin <branch>' : 'git push' }],
            warning: 'Local commits will be published to the remote. This affects collaborators.',
          },
          executeAfterConfirm: async () => {
            const out = await invokeGitPush({ rootPath, setUpstream })
            opts.onMutate?.(rootPath, ['refs'])
            const branchNote = out.branch ? ` (\`${out.branch}\`)` : ''
            const stdout = out.stdout.trim()
            return truncateOutput(
              `✅ Pushed${branchNote}.${stdout ? `\n\n\`\`\`\n${stdout}\n\`\`\`` : ''}`,
            )
          },
        }
      }),
  }
  return tool
}
