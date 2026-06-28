import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitUnstageFiles } from '../api/invokeGitUnstageFiles'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_unstage_files` tool. Removes the given paths
 * from the index without modifying the working tree. Reversible — no
 * confirmation required.
 */
export const createGitUnstageFilesTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_unstage_files',
    definition: {
      type: 'function',
      function: {
        name: 'git_unstage_files',
        description:
          'Unstage one or more files (`git reset HEAD -- <files>`). The working tree is untouched. Reversible — does not require confirmation.',
        parameters: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Repository-relative paths to remove from the index.',
            },
          },
          required: ['files'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const files = Array.isArray(args.files)
          ? (args.files as unknown[]).filter((f): f is string => typeof f === 'string')
          : []
        if (files.length === 0) {
          return { kind: 'error', message: '`files` must contain at least one repo-relative path.' }
        }
        try {
          await invokeGitUnstageFiles({ rootPath, files })
          opts.onMutate?.(rootPath, ['index'])
          return { kind: 'success', message: `✅ Unstaged ${files.length} file(s).` }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git unstage failed',
          }
        }
      }),
  }
  return tool
}
