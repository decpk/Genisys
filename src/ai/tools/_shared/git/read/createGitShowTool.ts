import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitShow } from '../api/invokeGitShow'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface ShowArgs {
  refName?: unknown
  path?: unknown
  maxLines?: unknown
}

/**
 * Factory for `git_show`. Read-only. Two modes:
 *   - With `path`: prints `<ref>:<path>` (file contents at that ref).
 *   - Without `path`: prints commit metadata + the full patch.
 */
export const createGitShowTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_show',
    definition: {
      type: 'function',
      function: {
        name: 'git_show',
        description:
          'Show a commit (metadata + diff) or, with `path`, the contents of a tracked file at that ref. Use `maxLines` to cap very large outputs.',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Commit/ref/tag (e.g. HEAD, v1.0.0, abc1234).' },
            path: {
              type: 'string',
              description: 'Optional file path. When set, prints the file contents at that ref instead of the commit diff.',
            },
            maxLines: { type: 'number', description: 'Cap output to N lines.' },
          },
          required: ['refName'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as ShowArgs
        const refName = typeof a.refName === 'string' ? a.refName.trim() : ''
        if (!refName) return { kind: 'error', message: '`refName` is required.' }
        const path = typeof a.path === 'string' && a.path.trim() ? a.path.trim() : undefined
        const maxLines =
          typeof a.maxLines === 'number' && Number.isFinite(a.maxLines) && a.maxLines > 0
            ? Math.floor(a.maxLines)
            : undefined
        try {
          const stdout = await invokeGitShow({ rootPath, refName, path, maxLines })
          if (!stdout.trim()) {
            return { kind: 'success', message: '(empty)' }
          }
          return { kind: 'success', message: truncateOutput(formatGitOutput(stdout)) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git show failed' }
        }
      }),
  }
  return tool
}
