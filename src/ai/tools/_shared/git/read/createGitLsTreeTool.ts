import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitLsTree } from '../api/invokeGitLsTree'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface LsTreeArgs {
  refName?: unknown
  path?: unknown
  recursive?: unknown
}

/**
 * Factory for `git_ls_tree`. Read-only — list the tree of a commit.
 */
export const createGitLsTreeTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_ls_tree',
    definition: {
      type: 'function',
      function: {
        name: 'git_ls_tree',
        description:
          'List the tree of a commit/ref. Use `recursive=true` for the full file listing without intermediate tree entries.',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Commit/ref/tag (e.g. HEAD, main).' },
            path: { type: 'string', description: 'Optional subpath to list under.' },
            recursive: { type: 'boolean', description: 'Recurse into trees (only emit blobs).' },
          },
          required: ['refName'],
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as LsTreeArgs
        const refName = typeof a.refName === 'string' ? a.refName.trim() : ''
        if (!refName) return { kind: 'error', message: '`refName` is required.' }
        const path = typeof a.path === 'string' && a.path.trim() ? a.path.trim() : undefined
        const recursive = a.recursive === true
        try {
          const stdout = await invokeGitLsTree({ rootPath, refName, path, recursive })
          if (!stdout.trim()) {
            return { kind: 'success', message: '(empty tree)' }
          }
          return { kind: 'success', message: truncateOutput(stdout) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git ls-tree failed' }
        }
      }),
  }
  return tool
}
