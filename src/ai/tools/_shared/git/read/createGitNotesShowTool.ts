import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitNotesShow } from '../api/invokeGitNotesShow'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface NotesShowArgs {
  refName?: unknown
}

/**
 * Factory for `git_notes_show`. Read-only — display the note
 * attached to a commit (default HEAD).
 */
export const createGitNotesShowTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_notes_show',
    definition: {
      type: 'function',
      function: {
        name: 'git_notes_show',
        description: 'Show the note attached to a commit (defaults to HEAD).',
        parameters: {
          type: 'object',
          properties: {
            refName: { type: 'string', description: 'Commit ref (default HEAD).' },
          },
        },
      },
    },
    execute: async (rawArgs): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (rawArgs ?? {}) as NotesShowArgs
        const refName = typeof a.refName === 'string' && a.refName.trim() ? a.refName.trim() : undefined
        try {
          const stdout = await invokeGitNotesShow({ rootPath, refName })
          if (!stdout.trim()) {
            return { kind: 'success', message: 'No note attached.' }
          }
          return { kind: 'success', message: truncateOutput(formatGitOutput(stdout)) }
        } catch (err) {
          return { kind: 'error', message: err instanceof Error ? err.message : 'git notes show failed' }
        }
      }),
  }
  return tool
}
