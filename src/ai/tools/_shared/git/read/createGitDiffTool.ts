import type { GitDiffSide, GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitDiff } from '../api/invokeGitDiff'
import { formatDiffOutput } from '../utils/formatDiffOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

const VALID_SIDES: GitDiffSide[] = ['working', 'staged', 'head']

/**
 * Factory for the `git_diff` tool. Returns the original + modified
 * content of one file for a given diff side. The backend already
 * categorizes diffs so we don't need to compute a unified patch here.
 */
export const createGitDiffTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_diff',
    definition: {
      type: 'function',
      function: {
        name: 'git_diff',
        description:
          'Show the diff for a single file. `side` selects which diff: "working" = unstaged changes, "staged" = changes added to the index, "head" = all local changes vs HEAD.',
        parameters: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description: 'Repository-relative file path (e.g. `src/foo/bar.ts`).',
            },
            side: {
              type: 'string',
              enum: VALID_SIDES,
              description: 'Which diff to return. Defaults to "head" when omitted.',
            },
          },
          required: ['file'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const file = typeof args.file === 'string' ? args.file.trim() : ''
        if (!file) return { kind: 'error', message: '`file` is required.' }
        const sideArg = typeof args.side === 'string' ? (args.side as GitDiffSide) : 'head'
        const side: GitDiffSide = VALID_SIDES.includes(sideArg) ? sideArg : 'head'
        try {
          const data = await invokeGitDiff({ rootPath, file, side })
          return { kind: 'success', message: truncateOutput(formatDiffOutput(file, side, data)) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git diff failed' }
        }
      }),
  }
  return tool
}
