import type { GitInvokeResponse } from '../git.types'
import { parseOperationState, type GitOperationState } from '../utils/parseOperationState'

/**
 * Returns which multi-step git operations are currently in progress
 * (merge/rebase/cherry-pick/revert/bisect/am) plus a `hasConflicts`
 * flag. Wraps `cmd_git_operation_state`.
 *
 * Throws when the backend reports failure so callers can surface a
 * clean tool error.
 */
export async function invokeGitOperationState(rootPath: string): Promise<GitOperationState> {
  const res = (await window.api.gitOperationState({ rootPath })) as GitInvokeResponse<unknown>
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to read git operation state.')
  }
  return parseOperationState(res.data)
}
