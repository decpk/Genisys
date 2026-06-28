import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitFormatPatch } from '../api/invokeGitFormatPatch'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface FormatPatchArgs {
  range?: unknown
}

/**
 * Factory for `git_format_patch`. Read-only — emits patches for a
 * commit range as a single string suitable for downstream
 * `git_apply_patch` or `git_am`.
 */
export const createGitFormatPatchTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_format_patch',
    definition: {
      type: 'function',
      function: {
        name: 'git_format_patch',
        description:
          'Produce a patch series for a commit range. Returns the patch text (combined --stdout). Common ranges: "-1" (HEAD only), "main..HEAD", "<sha>..<sha>".',
        parameters: {
          type: 'object',
          properties: {
            range: {
              type: 'string',
              description: 'Commit range or count, e.g. "-1", "HEAD~3..HEAD", "main..feature".',
            },
          },
          required: ['range'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as FormatPatchArgs
        const range = typeof a.range === 'string' ? a.range.trim() : ''
        if (!range) return { kind: 'error', message: '`range` is required.' }
        try {
          const stdout = await invokeGitFormatPatch({ rootPath, range })
          if (!stdout.trim()) {
            return { kind: 'success', message: 'No commits in range — empty patch.' }
          }
          return { kind: 'success', message: truncateOutput(stdout) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git format-patch failed' }
        }
      }),
  }
  return tool
}
