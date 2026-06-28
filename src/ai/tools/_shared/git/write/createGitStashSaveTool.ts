import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitStashSave } from '../api/invokeGitStashSave'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface StashSaveArgs {
  message?: unknown
  includeUntracked?: unknown
  keepIndex?: unknown
}

export const createGitStashSaveTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_stash_save',
    definition: {
      type: 'function',
      function: {
        name: 'git_stash_save',
        description:
          'Stash the current working-tree + index changes onto a new stash entry. Reversible via git_stash_pop / git_stash_apply. Requires confirmation.',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Optional stash subject.' },
            includeUntracked: {
              type: 'boolean',
              description: 'Also stash untracked files. Default false.',
            },
            keepIndex: {
              type: 'boolean',
              description: 'Keep the staged changes after stashing. Default false.',
            },
          },
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as StashSaveArgs
        const message = typeof a.message === 'string' ? a.message : undefined
        const includeUntracked = a.includeUntracked === true
        const keepIndex = a.keepIndex === true
        const flags: string[] = []
        if (includeUntracked) flags.push('--include-untracked')
        if (keepIndex) flags.push('--keep-index')
        const subject = message?.trim() || '(no message)'
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_stash_save',
            description: `Stash: ${subject}`,
            items: [{ path: rootPath, type: 'stash', details: flags.join(' ') || 'default' }],
            warning:
              'Working-tree and staged changes will be moved to the stash. Recover with git_stash_pop or git_stash_apply.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitStashSave({
              rootPath,
              message,
              includeUntracked,
              keepIndex,
            })
            opts.onMutate?.(rootPath, ['stash', 'workdir', 'index'])
            return truncateOutput(`Stashed.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
