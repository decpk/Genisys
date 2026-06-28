import type { GitToolFactory } from '../git.types'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'
import { invokeGitOperationState } from '../api/invokeGitOperationState'
import { withRepo } from '../utils/withRepo'

/**
 * Factory for the `git_operation_state` tool. Reports any in-flight
 * multi-step git operation (merge, rebase, cherry-pick, revert, am,
 * bisect) plus a `hasConflicts` flag. Used by the LLM to decide
 * between `*_continue`, `*_abort`, and `*_skip` tools when resuming.
 */
export const createGitOperationStateTool: GitToolFactory = (opts) => {
  const tool: ToolModule = {
    name: 'git_operation_state',
    definition: {
      type: 'function',
      function: {
        name: 'git_operation_state',
        description:
          'Report which multi-step git operations are in progress in the current repository (merge / rebase / cherry-pick / revert / am / bisect) and whether the working tree currently has conflicted files. Call this before choosing between continue / abort / skip tools.',
        parameters: { type: 'object', properties: {} },
      },
    },
    execute: async (): Promise<ToolResult> =>
      withRepo(opts, async (rootPath) => {
        try {
          const state = await invokeGitOperationState(rootPath)
          const lines = [
            `merge in progress:        ${state.mergeInProgress}`,
            `rebase in progress:       ${state.rebaseInProgress}`,
            `cherry-pick in progress:  ${state.cherryPickInProgress}`,
            `revert in progress:       ${state.revertInProgress}`,
            `am (patch) in progress:   ${state.amInProgress}`,
            `bisect in progress:       ${state.bisectInProgress}`,
            `working tree conflicts:   ${state.hasConflicts}`,
          ]
          return { kind: 'success', message: lines.join('\n') }
        } catch (err) {
          return {
            kind: 'error',
            message: err instanceof Error ? err.message : 'git operation-state failed',
          }
        }
      }),
  }
  return tool
}
