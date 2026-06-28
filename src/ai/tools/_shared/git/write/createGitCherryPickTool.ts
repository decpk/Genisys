import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitCherryPick } from '../api/invokeGitCherryPick'
import { createConfirmAction } from '../utils/createConfirmAction'
import { formatConflictAwareResult } from '../utils/formatConflictAwareResult'
import { truncateOutput } from '../utils/truncateOutput'
import { withRepo } from '../utils/withRepo'

interface CherryPickArgs {
  commits?: unknown
  noCommit?: unknown
}

export const createGitCherryPickTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_cherry_pick',
    definition: {
      type: 'function',
      function: {
        name: 'git_cherry_pick',
        description:
          'Apply the changes from one or more existing commits onto the current branch as new commits (preserving messages). Conflicts surface as status="conflict" — resolve then call git_cherry_pick_continue, or git_cherry_pick_abort.',
        parameters: {
          type: 'object',
          properties: {
            commits: {
              type: 'array',
              items: { type: 'string' },
              description: 'One or more commit SHAs to apply, in order.',
            },
            noCommit: {
              type: 'boolean',
              description: 'Stage changes in the index without creating commits. Default false.',
            },
          },
          required: ['commits'],
        },
      },
    },
    execute: async (args): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        const a = (args ?? {}) as CherryPickArgs
        const commits = Array.isArray(a.commits)
          ? a.commits.filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
          : []
        const noCommit = a.noCommit === true
        if (commits.length === 0) {
          return { kind: 'error', message: '`commits` must contain at least one SHA.' }
        }
        return {
          kind: 'confirm-required',
          confirmAction: createConfirmAction({
            action: 'git_cherry_pick',
            description: `Cherry-pick ${commits.length} commit(s)${noCommit ? ' (no commit)' : ''}`,
            items: commits.map((c) => ({ path: rootPath, type: 'commit', details: c })),
            warning: noCommit
              ? 'Changes will be staged in the index without creating commits.'
              : 'New commits will be appended to the current branch. May produce conflicts.',
            severity: 'danger',
          }),
          executeAfterConfirm: async () => {
            const result = await invokeGitCherryPick({ rootPath, commits, noCommit })
            opts.onMutate?.(rootPath, ['head', 'workdir', 'index', 'merge'])
            return truncateOutput(
              formatConflictAwareResult(
                `Cherry-picked ${commits.length} commit(s).`,
                'Resolve conflicts then call git_cherry_pick_continue, or git_cherry_pick_abort.',
                result,
              ),
            )
          },
        }
      }),
  }
  return tool
}
