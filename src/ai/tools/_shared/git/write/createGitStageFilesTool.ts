import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStageFiles } from '../api/invokeGitStageFiles'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_stage_files` tool. Stages a list of repo-
 * relative paths, or every change when `files` is empty/omitted.
 *
 * Reversible (just `git reset`), so this does **not** request
 * confirmation. Notifies the host's git event bus via `onMutate` so
 * panels refresh immediately.
 */
export const createGitStageFilesTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stage_files',
    definition: {
      type: 'function',
      function: {
        name: 'git_stage_files',
        description:
          'Stage one or more files (repository-relative paths). Pass an empty array (or omit `files`) to stage every change (`git add -A`). Reversible — does not require confirmation.',
        parameters: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Repository-relative paths. Empty array = stage all changes (`git add -A`).',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const files = Array.isArray(args.files)
          ? (args.files as unknown[]).filter((f): f is string => typeof f === 'string')
          : []
        try {
          await invokeGitStageFiles({ rootPath, files })
          opts.onMutate?.(rootPath, ['index'])
          const summary = files.length === 0 ? 'all changes (`git add -A`)' : `${files.length} file(s)`
          return { kind: 'success', message: `✅ Staged ${summary}.` }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git stage failed',
          }
        }
      }),
  }
  return tool
}
