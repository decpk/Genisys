import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitFileHistory } from '../api/invokeGitFileHistory'
import { formatFileHistoryOutput } from '../utils/formatFileHistoryOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_file_history` tool. Returns the last 50
 * commits that touched a single file (with `--follow`, so renames are
 * included).
 */
export const createGitFileHistoryTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_file_history',
    definition: {
      type: 'function',
      function: {
        name: 'git_file_history',
        description:
          'List the last 50 commits that touched one specific file. Renames are followed. Useful for tracing how a file evolved.',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Repository-relative file path (e.g. `src/foo/bar.ts`).',
            },
          },
          required: ['filePath'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const filePath = typeof args.filePath === 'string' ? args.filePath.trim() : ''
        if (!filePath) return { kind: 'error', message: '`filePath` is required.' }
        try {
          const entries = await invokeGitFileHistory({ rootPath, filePath })
          return {
            kind: 'success',
            message: truncateOutput(formatFileHistoryOutput(filePath, entries)),
          }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git file history failed',
          }
        }
      }),
  }
  return tool
}
