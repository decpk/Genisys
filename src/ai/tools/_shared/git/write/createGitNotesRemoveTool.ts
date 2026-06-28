import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitNotesRemove } from '../api/invokeGitNotesRemove'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface NotesRemoveArgs {
  refName?: unknown
}

/**
 * Factory for `git_notes_remove`. Detaches the note from a commit.
 */
export const createGitNotesRemoveTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_notes_remove',
    definition: {
      type: 'function',
      function: {
        name: 'git_notes_remove',
        description: 'Remove the note attached to a commit (defaults to HEAD).',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Commit ref (default HEAD).' },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as NotesRemoveArgs
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName.trim() : undefined
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_notes_remove',
            description: `Remove note from ${refName ?? 'HEAD'}`,
            items: [{ path: refName ?? 'HEAD', type: 'ref', details: 'notes remove' }],
            warning: 'The note will be detached from this commit.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitNotesRemove({ rootPath, refName })
            opts.onMutate?.(rootPath, ['refs'])
            return truncateOutput(stdout.trim() ? formatGitOutput(stdout) : 'Note removed.')
          },
        }
      }),
  }
  return tool
}
