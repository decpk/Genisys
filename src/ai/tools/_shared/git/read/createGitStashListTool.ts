import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStashList } from '../api/invokeGitStashList'
import { formatStashList } from '../utils/formatStashList'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

export const createGitStashListTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stash_list',
    definition: {
      type: 'function',
      function: {
        name: 'git_stash_list',
        description:
          'List all stash entries (most recent first), with their ref (e.g. stash@{0}), creation date, and subject line.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const raw = await invokeGitStashList(rootPath)
          return { kind: 'success', message: truncateOutput(formatStashList(raw)) }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git stash list failed',
          }
        }
      }),
  }
  return tool
}
