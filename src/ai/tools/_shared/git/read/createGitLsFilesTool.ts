import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitLsFiles } from '../api/invokeGitLsFiles'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface LsFilesArgs {
  patterns?: unknown
  staged?: unknown
  modified?: unknown
  untracked?: unknown
}

/**
 * Factory for `git_ls_files`. Read-only — list files known to git.
 * Defaults to staged (cached) files; set `modified` or `untracked`
 * to widen the result set.
 */
export const createGitLsFilesTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_ls_files',
    definition: {
      type: 'function',
      function: {
        name: 'git_ls_files',
        description:
          'List files known to git. Defaults to staged (cached) files. Pass `modified=true` to add modified files, `untracked=true` to add untracked-but-not-ignored files, and `patterns` to filter.',
        parameters: {
          type: 'object',
          properties: {
            patterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Pathspec patterns to narrow results (e.g. ["src/**"]).',
            },
            staged: { type: 'boolean', description: 'Include staged (cached) files. Default true.' },
            modified: { type: 'boolean', description: 'Include modified-but-not-staged files.' },
            untracked: { type: 'boolean', description: 'Include untracked files (respects .gitignore).' },
          },
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as LsFilesArgs
        const patterns = Array.isArray(a.patterns)
          ? a.patterns.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
          : undefined
        const staged = a.staged === undefined ? undefined : a.staged === true
        const modified = a.modified === true
        const untracked = a.untracked === true
        try {
          const stdout = await invokeGitLsFiles({ rootPath, patterns, staged, modified, untracked })
          if (!stdout.trim()) {
            return { kind: 'success', message: '(no matching files)' }
          }
          return { kind: 'success', message: truncateOutput(stdout) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git ls-files failed' }
        }
      }),
  }
  return tool
}
