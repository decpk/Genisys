import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitDiscardChanges } from '../api/invokeGitDiscardChanges'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_discard_changes` tool. **Destructive**:
 * tracked file edits are reverted via `git checkout --`, untracked
 * files are deleted via `git clean -f --`. Always returns
 * `confirm-required` on the first call.
 */
export const createGitDiscardChangesTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_discard_changes',
    definition: {
      type: 'function',
      function: {
        name: 'git_discard_changes',
        description:
          'Discard working-tree changes for one or more files. Tracked files are restored from the index; untracked files are deleted. DESTRUCTIVE — requires confirmation.',
        parameters: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Repository-relative paths whose changes should be discarded.',
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
        return {
          kind: 'confirm-required',
          confirmAction: {
            action: 'git_discard_changes',
            description: `Discard changes for ${files.length} file(s)`,
            items: files.map((path) => ({
              path,
              type: 'file',
              details: 'tracked → restored from index; untracked → deleted',
            })),
            warning:
              'This cannot be undone. Tracked changes will be reverted and untracked files will be deleted from disk.',
          },
          executeAfterConfirm: async () => {
            await invokeGitDiscardChanges({ rootPath, files })
            opts.onMutate?.(rootPath, ['workdir', 'index'])
            return `✅ Discarded changes for ${files.length} file(s).`
          },
        }
      }),
  }
  return tool
}
