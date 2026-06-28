import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRemoteUrl } from '../api/invokeGitRemoteUrl'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_remote_url` tool. Returns the `origin` remote
 * URL — useful for surfacing PR links or web UIs to the user.
 */
export const createGitRemoteUrlTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_remote_url',
    definition: {
      type: 'function',
      function: {
        name: 'git_remote_url',
        description:
          'Return the `origin` remote URL for the repository, or "no remote" when none is configured.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const url = await invokeGitRemoteUrl(rootPath)
          if (!url) {
            return { kind: 'success', message: '_No `origin` remote is configured._' }
          }
          return { kind: 'success', message: `**origin:** \`${url}\`` }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git remote URL failed',
          }
        }
      }),
  }
  return tool
}
