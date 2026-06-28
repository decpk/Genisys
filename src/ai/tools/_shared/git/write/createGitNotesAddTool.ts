import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitNotesAdd } from '../api/invokeGitNotesAdd'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface NotesAddArgs {
  message?: unknown
  refName?: unknown
}

/**
 * Factory for `git_notes_add`. Attaches (or overwrites with `-f`)
 * a note on a commit. Stores in `refs/notes/commits`.
 */
export const createGitNotesAddTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_notes_add',
    definition: {
      type: 'function',
      function: {
        name: 'git_notes_add',
        description: 'Attach (or replace) a note on a commit. Defaults to HEAD.',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Note body to attach.' },
            refName: { type: 'string', description: 'Commit ref (default HEAD).' },
          },
          required: ['message'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as NotesAddArgs
        const message = typeof a.message === 'string' ? a.message : ''
        if (!message) return { kind: 'error', message: '`message` is required.' }
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName.trim() : undefined
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_notes_add',
            description: `Attach note to ${refName ?? 'HEAD'}`,
            items: [{ path: refName ?? 'HEAD', type: 'ref', details: 'notes add -f' }],
            warning: 'Overwrites any existing note on this commit.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitNotesAdd({ rootPath, message, refName })
            opts.onMutate?.(rootPath, ['refs'])
            return truncateOutput(stdout.trim() ? formatGitOutput(stdout) : 'Note attached.')
          },
        }
      }),
  }
  return tool
}
