import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitGrep } from '../api/invokeGitGrep'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface GrepArgs {
  pattern?: unknown
  refName?: unknown
  includePattern?: unknown
  maxResults?: unknown
}

/**
 * Factory for `git_grep`. Read-only — search tracked content.
 * NOTE: use this for git-history search (pass `refName`); for
 * working-tree search prefer `code_search_in_files`.
 */
export const createGitGrepTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_grep',
    definition: {
      type: 'function',
      function: {
        name: 'git_grep',
        description:
          'Search tracked content with git grep. Use this for git-history search (with the `refName` param); for working-tree search prefer code_search_in_files.',
        parameters: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: 'Pattern to search for (treated as ERE by git).' },
            refName: { type: 'string', description: 'Optional ref to search instead of the working tree.' },
            includePattern: { type: 'string', description: 'Optional pathspec to narrow the search (e.g. "src/**.ts").' },
            maxResults: { type: 'number', description: 'Cap output to N lines.' },
          },
          required: ['pattern'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as GrepArgs
        const pattern = typeof a.pattern === 'string' ? a.pattern : ''
        if (!pattern.trim()) return { kind: 'error', message: '`pattern` is required.' }
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName.trim() : undefined
        const includePattern =
          typeof a.includePattern === 'string' && a.includePattern.trim() ? a.includePattern.trim() : undefined
        const maxResults =
          typeof a.maxResults === 'number' && Number.isFinite(a.maxResults) && a.maxResults > 0
            ? Math.floor(a.maxResults)
            : undefined
        try {
          const stdout = await invokeGitGrep({ rootPath, pattern, refName, includePattern, maxResults })
          if (!stdout.trim()) {
            return { kind: 'success', message: '(no matches)' }
          }
          return { kind: 'success', message: truncateOutput(stdout) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git grep failed' }
        }
      }),
  }
  return tool
}
