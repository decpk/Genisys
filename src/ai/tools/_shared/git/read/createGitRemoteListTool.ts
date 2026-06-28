import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRemoteList } from '../api/invokeGitRemoteList'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitRemoteListTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_remote_list',
    definition: {
      type: 'function',
      function: {
        name: 'git_remote_list',
        description:
          'List all configured remotes and their fetch/push URLs (`git remote -v`).',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const stdout = await invokeGitRemoteList(rootPath)
          if (!stdout.trim()) {
            return { kind: 'success', message: 'No remotes configured.' }
          }
          return { kind: 'success', message: truncateOutput(formatGitOutput(stdout)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git remote -v failed',
          }
        }
      }),
  }
  return tool
}
