import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitRevert } from '../api/invokeGitRevert'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatGitOutput } from '../utils/formatGitOutput'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface RevertArgs {
  commit?: unknown
  noCommit?: unknown
}

export const createGitRevertTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_revert',
    definition: {
      type: 'function',
      function: {
        name: 'git_revert',
        description:
          'Create a new commit that reverses a prior commit. With `noCommit=true`, stages the inverse changes without creating a commit. May produce conflicts — call git_operation_state to check status.',
        parameters: {
          type: 'object',
          properties: {
            commit: { type: 'string', description: 'Commit to revert.' },
            noCommit: {
              type: 'boolean',
              description: 'Stage the inverse change without committing. Default false.',
            },
          },
          required: ['commit'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as RevertArgs
        const commit = typeof a.commit === 'string' ? a.commit.trim() : ''
        const noCommit = a.noCommit === true
        if (!commit) return { kind: 'error', message: '`commit` is required.' }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_revert',
            description: `Revert ${commit}${noCommit ? ' (stage only)' : ''}`,
            items: [{ path: rootPath, type: 'commit', details: commit }],
            warning: noCommit
              ? 'Inverse changes will be staged but not committed. Review then commit manually.'
              : 'A new commit will be created that undoes the target commit. May produce conflicts.',
            severity: 'caution',
          }),
          executeAfterConfirm: async () => {
            const stdout = await invokeGitRevert({ rootPath, commit, noCommit })
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(`Reverted ${commit}.\n\n${formatGitOutput(stdout)}`)
          },
        }
      }),
  }
  return tool
}
