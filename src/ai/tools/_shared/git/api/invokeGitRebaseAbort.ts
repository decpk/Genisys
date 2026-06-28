import type { GitInvokeResponse, GitConflictAwareResult } from '../git.types'

export async function invokeGitRebaseAbort(rootPath: string): Promise<GitConflictAwareResult> {
  const res = (await window.api.gitRebaseAbort({ rootPath })) as GitInvokeResponse<GitConflictAwareResult>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to abort rebase.')
  }
  return res.data
}
