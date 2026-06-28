import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitPull } from '../api/invokeGitPull'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_pull` tool. Fast-forward only (`--ff-only`).
 * Stateful — moves HEAD and updates the working tree — so it always
 * requires confirmation.
 */
export const createGitPullTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_pull',
    definition: {
      type: 'function',
      function: {
        name: 'git_pull',
        description:
          'Fast-forward the current branch from its upstream (`git pull --ff-only`). Fails when a merge or rebase would be needed. Requires confirmation.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        return {
          kind: 'confirm-required',
          confirmAction: {
            action: 'git_pull',
            description: 'Fast-forward pull from upstream',
            items: [{ path: rootPath, type: 'repo', details: 'git pull --ff-only' }],
            warning:
              'HEAD and the working tree will advance to match upstream. Fails (without changes) if a merge or rebase would be required.',
          },
          executeAfterConfirm: async () => {
            const out = await invokeGitPull(rootPath)
            opts.onMutate?.(rootPath, ['head', 'workdir', 'refs'])
            const stdout = out.stdout.trim()
            return truncateOutput(
              `✅ Pulled.${stdout ? `\n\n\`\`\`\n${stdout}\n\`\`\`` : ''}`,
            )
          },
        }
      }),
  }
  return tool
}
